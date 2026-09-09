(function () {
  const {
    closeModal: hideModal,
    escapeHtml,
    formatDate,
    formatQuantity,
    hideAlert,
    openModal: showModal,
    showAlert,
  } = ui;

  let movements = [];
  let products = [];
  let rawMaterials = [];

  const quantityFmt = new Intl.NumberFormat("pt-BR", {
    maximumFractionDigits: 3,
  });

  const elements = {
    body: document.getElementById("movements-body"),

    summary: document.getElementById("movements-summary"),

    error: document.getElementById("inventory-error"),

    success: document.getElementById("inventory-success"),

    search: document.getElementById("movement-search"),

    itemTypeFilter: document.getElementById("item-type-filter"),

    movementTypeFilter: document.getElementById("movement-type-filter"),

    movementsCount: document.getElementById("movements-count"),

    entriesToday: document.getElementById("entries-today"),

    exitsToday: document.getElementById("exits-today"),

    lowStockCount: document.getElementById("low-stock-count"),

    modal: document.getElementById("movement-modal"),

    form: document.getElementById("movement-form"),

    formError: document.getElementById("movement-form-error"),

    submit: document.getElementById("movement-form-submit"),

    itemType: document.getElementById("movement-item-type"),

    item: document.getElementById("movement-item"),

    movementType: document.getElementById("movement-type"),

    quantity: document.getElementById("movement-quantity"),

    reason: document.getElementById("movement-reason"),

    stockPreview: document.getElementById("stock-preview"),

    currentStock: document.getElementById("current-stock"),

    minimumStock: document.getElementById("minimum-stock"),
  };

  function showSuccess(message) {
    hideAlert(elements.error);

    showAlert(elements.success, message);

    window.setTimeout(() => hideAlert(elements.success), 3500);
  }

  function isToday(value) {
    const date = new Date(value);

    const now = new Date();

    return (
      date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth() && date.getDate() === now.getDate()
    );
  }

  function findItem(itemType, itemId) {
    if (itemType === "PRODUCT") {
      return products.find((product) => product.id === itemId);
    }

    if (itemType === "RAW_MATERIAL") {
      return rawMaterials.find((rawMaterial) => rawMaterial.id === itemId);
    }

    return null;
  }

  function getUnit(itemType, itemId) {
    const item = findItem(itemType, itemId);

    return item?.unitAbbreviation || "";
  }

  function isLowStock(item) {
    if (item.minimumStock === null || item.minimumStock === undefined) {
      return false;
    }

    return Number(item.quantityInStock) <= Number(item.minimumStock);
  }

  function renderStats() {
    const entriesToday = movements.filter(
      (movement) => movement.movementType === "ENTRY" && isToday(movement.createdAt),
    ).length;

    const exitsToday = movements.filter(
      (movement) => movement.movementType === "EXIT" && isToday(movement.createdAt),
    ).length;

    const lowStock = [...products, ...rawMaterials].filter(isLowStock).length;

    elements.movementsCount.textContent = quantityFmt.format(movements.length);

    elements.entriesToday.textContent = quantityFmt.format(entriesToday);

    elements.exitsToday.textContent = quantityFmt.format(exitsToday);

    elements.lowStockCount.textContent = quantityFmt.format(lowStock);

    [elements.movementsCount, elements.entriesToday, elements.exitsToday, elements.lowStockCount].forEach((element) =>
      element.classList.remove("skeleton"),
    );
  }

  function renderMovements() {
    const search = elements.search.value.trim().toLocaleLowerCase("pt-BR");

    const itemType = elements.itemTypeFilter.value;

    const movementType = elements.movementTypeFilter.value;

    const filtered = movements.filter((movement) => {
      if (itemType && movement.itemType !== itemType) {
        return false;
      }

      if (movementType && movement.movementType !== movementType) {
        return false;
      }

      if (search) {
        const searchable = `
                      ${movement.itemName}
                      ${movement.reason}
                    `.toLocaleLowerCase("pt-BR");

        if (!searchable.includes(search)) {
          return false;
        }
      }

      return true;
    });

    elements.summary.textContent = `${filtered.length} de ${movements.length} movimentações`;

    if (filtered.length === 0) {
      elements.body.innerHTML = `

        <tr class="empty-row">

          <td colspan="7">

            ${
              movements.length === 0
                ? "Nenhuma movimentação registrada ainda."
                : "Nenhuma movimentação corresponde aos filtros."
            }

          </td>

        </tr>

      `;

      return;
    }

    elements.body.innerHTML = filtered
      .map((movement) => {
        const unit = getUnit(movement.itemType, movement.itemId);

        const itemTypeLabel = movement.itemType === "PRODUCT" ? "Produto" : "Matéria-prima";

        const entry = movement.movementType === "ENTRY";

        return `

                    <tr>

                      <td class="movement-date">

                        ${escapeHtml(formatDate(movement.createdAt))}

                      </td>

                      <td>

                        <strong class="table-primary">

                          ${escapeHtml(movement.itemName)}

                        </strong>

                      </td>

                      <td>

                        <span class="badge neutral">

                          ${itemTypeLabel}

                        </span>

                      </td>

                      <td>

                        <span class="badge ${entry ? "ok" : "low"}">

                          ${entry ? "Entrada" : "Saída"}

                        </span>

                      </td>

                      <td class="num">

                        <strong class="movement-value ${entry ? "entry" : "exit"}">

                          ${entry ? "+" : "−"}

                          ${escapeHtml(formatQuantity(movement.quantity, unit))}

                        </strong>

                      </td>

                      <td class="movement-reason">

                        ${escapeHtml(movement.reason)}

                      </td>

                      <td class="num">

                        ${escapeHtml(formatQuantity(movement.balanceAfterMovement, unit))}

                      </td>

                    </tr>

                  `;
      })
      .join("");
  }

  function populateItems() {
    const type = elements.itemType.value;

    elements.stockPreview.hidden = true;

    if (!type) {
      elements.item.disabled = true;

      elements.item.innerHTML = `
        <option value="">
          Primeiro selecione o tipo
        </option>
      `;

      return;
    }

    const items = type === "PRODUCT" ? products : rawMaterials;

    elements.item.disabled = false;

    if (items.length === 0) {
      elements.item.innerHTML = `

        <option value="">
          Nenhum item disponível
        </option>

      `;

      return;
    }

    const firstOption = type === "PRODUCT" ? "Selecione o produto" : "Selecione a matéria-prima";

    elements.item.innerHTML = `

      <option value="">
        ${firstOption}
      </option>

      ${items
        .map(
          (item) => `

                  <option value="${item.id}">

                    ${escapeHtml(item.name)}
                    —
                    ${escapeHtml(formatQuantity(item.quantityInStock, item.unitAbbreviation))}

                  </option>

                `,
        )
        .join("")}

    `;
  }

  function updateStockPreview() {
    const type = elements.itemType.value;

    const itemId = elements.item.value;

    if (!type || !itemId) {
      elements.stockPreview.hidden = true;

      return;
    }

    const item = findItem(type, itemId);

    if (!item) {
      elements.stockPreview.hidden = true;

      return;
    }

    elements.currentStock.textContent = formatQuantity(item.quantityInStock, item.unitAbbreviation);

    elements.minimumStock.textContent =
      item.minimumStock === null || item.minimumStock === undefined
        ? "Não definido"
        : formatQuantity(item.minimumStock, item.unitAbbreviation);

    elements.stockPreview.hidden = false;
  }

  function openModal() {
    elements.form.reset();

    hideAlert(elements.formError);

    elements.item.disabled = true;

    elements.item.innerHTML = `
      <option value="">
        Primeiro selecione o tipo
      </option>
    `;

    elements.stockPreview.hidden = true;

    showModal(elements.modal, elements.itemType);
  }

  function closeModal() {
    hideModal(elements.modal);
  }

  async function loadData() {
    hideAlert(elements.error);

    try {
      [movements, products, rawMaterials] = await Promise.all([
        api.get("/api/v1/inventory/movements"),

        api.get("/api/v1/products"),

        api.get("/api/v1/raw-materials"),
      ]);

      renderStats();

      renderMovements();
    } catch (error) {
      elements.body.innerHTML = `

        <tr class="empty-row">

          <td colspan="7">
            Não foi possível carregar o histórico.
          </td>

        </tr>

      `;

      elements.summary.textContent = "Falha ao carregar";

      showAlert(elements.error, error.message || "Não foi possível carregar os dados.");
    }
  }

  async function createMovement(event) {
    event.preventDefault();

    hideAlert(elements.formError);

    const itemType = elements.itemType.value;

    const itemId = elements.item.value;

    const movementType = elements.movementType.value;

    const quantity = Number(elements.quantity.value);

    const reason = elements.reason.value.trim();

    if (!itemType || !itemId || !movementType || !reason) {
      showAlert(elements.formError, "Preencha todos os campos.");

      return;
    }

    if (!Number.isFinite(quantity) || quantity <= 0) {
      showAlert(elements.formError, "A quantidade deve ser maior que zero.");

      return;
    }

    if (movementType === "EXIT") {
      const item = findItem(itemType, itemId);

      if (item && quantity > Number(item.quantityInStock)) {
        showAlert(
          elements.formError,
          `Estoque insuficiente. Saldo atual: ${formatQuantity(item.quantityInStock, item.unitAbbreviation)}.`,
        );

        return;
      }
    }

    elements.submit.disabled = true;

    elements.submit.textContent = "Registrando…";

    try {
      await api.post("/api/v1/inventory/movements", {
        itemType,
        itemId,
        movementType,
        quantity,
        reason,
      });

      closeModal();

      await loadData();

      showSuccess(movementType === "ENTRY" ? "Entrada registrada com sucesso." : "Saída registrada com sucesso.");
    } catch (error) {
      showAlert(elements.formError, error.message || "Não foi possível registrar a movimentação.");
    } finally {
      elements.submit.disabled = false;

      elements.submit.textContent = "Registrar movimentação";
    }
  }

  document.getElementById("new-movement-btn").addEventListener("click", openModal);

  document.getElementById("movement-modal-close").addEventListener("click", closeModal);

  document.getElementById("movement-form-cancel").addEventListener("click", closeModal);

  elements.form.addEventListener("submit", createMovement);

  elements.itemType.addEventListener("change", populateItems);

  elements.item.addEventListener("change", updateStockPreview);

  elements.search.addEventListener("input", renderMovements);

  elements.itemTypeFilter.addEventListener("change", renderMovements);

  elements.movementTypeFilter.addEventListener("change", renderMovements);

  elements.modal.addEventListener("click", (event) => {
    if (event.target === elements.modal) {
      closeModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && elements.modal.classList.contains("show")) {
      closeModal();
    }
  });

  auth.requireUser().then(loadData);
})();
