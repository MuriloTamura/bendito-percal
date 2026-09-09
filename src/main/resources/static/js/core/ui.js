(function () {
  const locale = "pt-BR";
  const currency = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "BRL",
  });
  const decimal = new Intl.NumberFormat(locale, { maximumFractionDigits: 3 });
  const dateTime = new Intl.DateTimeFormat(locale, {
    dateStyle: "short",
    timeStyle: "short",
  });

  function escapeHtml(value) {
    const element = document.createElement("div");
    element.textContent = value == null ? "" : String(value);
    return element.innerHTML;
  }

  function formatCurrency(value) {
    return currency.format(Number(value || 0));
  }

  function formatQuantity(value, unit = "") {
    const formatted = decimal.format(Number(value || 0));
    return unit ? `${formatted} ${unit}` : formatted;
  }

  function formatDate(value) {
    return value ? dateTime.format(new Date(value)) : "—";
  }

  function showAlert(element, message) {
    if (!element) return;
    element.textContent = message;
    element.classList.add("show");
  }

  function hideAlert(element) {
    if (!element) return;
    element.textContent = "";
    element.classList.remove("show");
  }

  let lastFocusedElement;

  function openModal(backdrop, initialFocus) {
    lastFocusedElement = document.activeElement;
    backdrop.classList.add("show");
    backdrop.setAttribute("aria-hidden", "false");
    backdrop.removeAttribute("inert");
    document.body.classList.add("modal-open");
    requestAnimationFrame(() => (initialFocus || backdrop.querySelector("input, select, button"))?.focus());
  }

  function closeModal(backdrop) {
    backdrop.classList.remove("show");
    backdrop.setAttribute("aria-hidden", "true");
    backdrop.setAttribute("inert", "");
    if (!document.querySelector(".modal-backdrop.show")) document.body.classList.remove("modal-open");
    lastFocusedElement?.focus();
  }

  function trapModalFocus(event) {
    if (event.key !== "Tab") return;
    const modal = event.currentTarget.querySelector(".modal");
    const focusable = [
      ...modal.querySelectorAll(
        'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
      ),
    ];
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable.at(-1);
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  document.addEventListener("keydown", (event) => {
    const activeModal = document.querySelector(".modal-backdrop.show");
    if (event.key === "Escape" && activeModal) closeModal(activeModal);
  });
  document.querySelectorAll(".modal-backdrop").forEach((modal) => modal.addEventListener("keydown", trapModalFocus));

  window.ui = Object.freeze({
    closeModal,
    escapeHtml,
    formatCurrency,
    formatDate,
    formatQuantity,
    hideAlert,
    openModal,
    showAlert,
  });
})();
