(function () {
  const cfg = window.APP_CONFIG || {};

  document.getElementById("brand-name").textContent = cfg.companyName || "Sistema de Gestão";
  document.getElementById("brand-tagline").textContent = cfg.companyTagline || "";
  document.getElementById("brand-initial").textContent = (cfg.companyName || "S").trim().charAt(0).toUpperCase();

  const form = document.getElementById("login-form");
  const errorBox = document.getElementById("login-error");
  const submitBtn = document.getElementById("login-submit");

  function showError(message) {
    errorBox.textContent = message;
    errorBox.classList.add("show");
  }

  function hideError() {
    errorBox.classList.remove("show");
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    hideError();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    submitBtn.disabled = true;
    submitBtn.textContent = "Entrando…";

    try {
      await api.post("/api/v1/auth/login", { email, password });
      window.location.href = "dashboard.html";
    } catch (err) {
      // 401 do backend: e-mail/senha inválidos ou usuário inativo
      showError(err.message || "Não foi possível entrar. Tente novamente.");
      submitBtn.disabled = false;
      submitBtn.textContent = "Entrar";
    }
  });
})();
