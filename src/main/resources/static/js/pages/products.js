(function () {
  const { closeModal, escapeHtml, hideAlert, openModal, showAlert } = ui;

  const currencyFmt = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  const quantityFmt = new Intl.NumberFormat("pt-BR", {
    maximumFractionDigits: 3,
  });

  let products = [];
  let categories = [];
  let units = [];

  let editingPriceProductId = null;

  const elements = {
    body: document.getElementById("products-body"),

    summary: document.getElementById("products-summary"),

    search: document.getElementById("product-search"),

    error: document.getElementById("products-error"),

    success: document.getElementById("products-success"),

    count: document.getElementById("products-count"),

    lowStockCount: document.getElementById("low-stock-count"),

    productModal: document.getElementById("product-modal"),

    productForm: document.getElementById("product-form"),

    productFormError: document.getElementById("product-form-error"),

    productSubmit: document.getElementById("product-form-submit"),

    categorySelect: document.getElementById("product-category"),

    unitSelect: document.getElementById("product-unit"),

    priceModal: document.getElementById("price-modal"),

    priceForm: document.getElementById("price-form"),

    priceFormError: document.getElementById("price-form-error"),

    priceSubmit: document.getElementById("price-form-submit"),

    priceProductName: document.getElementById("price-product-name"),

    newPrice: document.getElementById("new-price"),
  };

  function showSuccess(message) {
    hideAlert(elements.error);

    showAlert(elements.success, message);

    window.setTimeout(() => hideAlert(elements.success), 3500);
  }

  function isLowStock(product) {
    if (product.minimumStock === null || product.minimumStock === undefined) {
      return false;
    }

    return Number(product.quantityInStock) <= Number(product.minimumStock);
  }

  function renderStats() {
    const lowStock = products.filter(isLowStock).length;

    elements.count.textContent = quantityFmt.format(products.length);

    elements.lowStockCount.textContent = quantityFmt.format(lowStock);

    elements.count.classList.remove("skeleton");

    elements.lowStockCount.classList.remove("skeleton");
  }

  function renderProducts() {
    const term = elements.search.value.trim().toLocaleLowerCase("pt-BR");

    const filtered = products.filter((product) => {
      if (!term) {
        return true;
      }

      const searchableText = `${product.name} ${product.categoryName}`;

      return searchableText.toLocaleLowerCase("pt-BR").includes(term);
    });

    elements.summary.textContent = term
      ? `${filtered.length} de ${products.length} produtos encontrados`
      : `${products.length} ${products.length === 1 ? "produto ativo" : "produtos ativos"}`;

    if (filtered.length === 0) {
      const message =
        products.length === 0 ? "Nenhum produto cadastrado ainda." : "Nenhum produto corresponde à busca.";

      elements.body.innerHTML = `
        <tr class="empty-row">
          <td colspan="7">
            ${message}
          </td>
        </tr>
      `;

      return;
    }

    elements.body.innerHTML = filtered
      .map((product) => {
        const low = isLowStock(product);

        const minimum =
          product.minimumStock === null || product.minimumStock === undefined
            ? "—"
            : `${quantityFmt.format(product.minimumStock)} ${escapeHtml(product.unitAbbreviation)}`;

        return `
          <tr>

            <td>

              <strong class="table-primary">
                ${escapeHtml(product.name)}
              </strong>

              <span class="table-secondary">
                ${escapeHtml(product.unitAbbreviation)}
              </span>

            </td>

            <td>
              ${escapeHtml(product.categoryName)}
            </td>

            <td class="num">

              ${quantityFmt.format(product.quantityInStock)}

              ${escapeHtml(product.unitAbbreviation)}

            </td>

            <td class="num">
              ${minimum}
            </td>

            <td class="num">

              ${currencyFmt.format(product.salePrice)}

            </td>

            <td>

              ${
                low
                  ? `
                    <span class="badge low">
                      Estoque baixo
                    </span>
                  `
                  : `
                    <span class="badge ok">
                      Normal
                    </span>
                  `
              }

            </td>

            <td class="actions-col">

              <div class="row-actions">

                <button
                  class="table-action"
                  type="button"
                  data-action="price"
                  data-id="${product.id}"
                >
                  Preço
                </button>

                <button
                  class="table-action danger"
                  type="button"
                  data-action="deactivate"
                  data-id="${product.id}"
                >
                  Desativar
                </button>

              </div>

            </td>

          </tr>
        `;
      })
      .join("");
  }

  function populateReferenceSelects() {
    elements.categorySelect.innerHTML =
      '<option value="">Selecione</option>' +
      categories
        .map(
          (category) => `
            <option value="${category.id}">
              ${escapeHtml(category.name)}
            </option>
          `,
        )
        .join("");

    elements.unitSelect.innerHTML =
      '<option value="">Selecione</option>' +
      units
        .map(
          (unit) => `
            <option value="${unit.id}">
              ${escapeHtml(unit.name)}
              (${escapeHtml(unit.abbreviation)})
            </option>
          `,
        )
        .join("");
  }

  function openProductModal() {
    hideAlert(elements.productFormError);

    elements.productForm.reset();

    populateReferenceSelects();

    openModal(elements.productModal);

    document.getElementById("product-name").focus();
  }

  function openPriceModal(productId) {
    const product = products.find((item) => item.id === productId);

    if (!product) {
      return;
    }

    editingPriceProductId = product.id;

    hideAlert(elements.priceFormError);

    elements.priceProductName.textContent = product.name;

    elements.newPrice.value = Number(product.salePrice).toFixed(2);

    openModal(elements.priceModal);

    elements.newPrice.focus();

    elements.newPrice.select();
  }

  async function loadData() {
    hideAlert(elements.error);

    try {
      [products, categories, units] = await Promise.all([
        api.get("/api/v1/products"),

        api.get("/api/v1/categories"),

        api.get("/api/v1/units"),
      ]);

      renderStats();

      populateReferenceSelects();

      renderProducts();
    } catch (err) {
      elements.body.innerHTML = `
        <tr class="empty-row">
          <td colspan="7">
            Não foi possível carregar os produtos.
          </td>
        </tr>
      `;

      elements.summary.textContent = "Falha ao carregar";

      showAlert(elements.error, err.message || "Não foi possível carregar os dados.");
    }
  }

  async function createProduct(event) {
    event.preventDefault();

    hideAlert(elements.productFormError);

    const name = document.getElementById("product-name").value.trim();

    const categoryId = elements.categorySelect.value;

    const unitId = elements.unitSelect.value;

    const salePriceValue = document.getElementById("product-price").value;

    const minimumStockValue = document.getElementById("product-min-stock").value;

    if (!name || !categoryId || !unitId || !salePriceValue) {
      showAlert(elements.productFormError, "Preencha os campos obrigatórios.");

      return;
    }

    const salePrice = Number(salePriceValue);

    const minimumStock = minimumStockValue === "" ? null : Number(minimumStockValue);

    if (!Number.isFinite(salePrice) || salePrice <= 0) {
      showAlert(elements.productFormError, "Informe um preço de venda maior que zero.");

      return;
    }

    elements.productSubmit.disabled = true;

    elements.productSubmit.textContent = "Cadastrando…";

    try {
      await api.post("/api/v1/products", {
        name,
        categoryId,
        unitId,
        salePrice,
        minimumStock,
      });

      closeModal(elements.productModal);

      await loadData();

      showSuccess("Produto cadastrado com sucesso.");
    } catch (err) {
      showAlert(elements.productFormError, err.message || "Não foi possível cadastrar o produto.");
    } finally {
      elements.productSubmit.disabled = false;

      elements.productSubmit.textContent = "Cadastrar produto";
    }
  }

  async function updatePrice(event) {
    event.preventDefault();

    hideAlert(elements.priceFormError);

    const salePrice = Number(elements.newPrice.value);

    if (!editingPriceProductId || !Number.isFinite(salePrice) || salePrice <= 0) {
      showAlert(elements.priceFormError, "Informe um preço de venda maior que zero.");

      return;
    }

    elements.priceSubmit.disabled = true;

    elements.priceSubmit.textContent = "Salvando…";

    try {
      await api.patch(`/api/v1/products/${editingPriceProductId}/price`, {
        salePrice,
      });

      closeModal(elements.priceModal);

      await loadData();

      showSuccess("Preço atualizado com sucesso.");
    } catch (err) {
      showAlert(elements.priceFormError, err.message || "Não foi possível atualizar o preço.");
    } finally {
      elements.priceSubmit.disabled = false;

      elements.priceSubmit.textContent = "Salvar preço";
    }
  }

  async function deactivateProduct(productId) {
    const product = products.find((item) => item.id === productId);

    if (!product) {
      return;
    }

    const confirmed = window.confirm(`Desativar o produto "${product.name}"? O histórico será preservado.`);

    if (!confirmed) {
      return;
    }

    hideAlert(elements.error);

    try {
      await api.delete(`/api/v1/products/${product.id}`);

      await loadData();

      showSuccess("Produto desativado com sucesso.");
    } catch (err) {
      showAlert(elements.error, err.message || "Não foi possível desativar o produto.");
    }
  }

  document.getElementById("new-product-btn").addEventListener("click", openProductModal);

  document.getElementById("product-modal-close").addEventListener("click", () => closeModal(elements.productModal));

  document.getElementById("product-form-cancel").addEventListener("click", () => closeModal(elements.productModal));

  document.getElementById("price-modal-close").addEventListener("click", () => closeModal(elements.priceModal));

  document.getElementById("price-form-cancel").addEventListener("click", () => closeModal(elements.priceModal));

  elements.productForm.addEventListener("submit", createProduct);

  elements.priceForm.addEventListener("submit", updatePrice);

  elements.search.addEventListener("input", renderProducts);

  elements.body.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-action]");

    if (!button) {
      return;
    }

    const { action, id } = button.dataset;

    if (action === "price") {
      openPriceModal(id);
    }

    if (action === "deactivate") {
      deactivateProduct(id);
    }
  });

  [elements.productModal, elements.priceModal].forEach((modal) => {
    modal.addEventListener("click", (event) => {
      if (event.target === modal) {
        closeModal(modal);
      }
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") {
      return;
    }

    if (elements.priceModal.classList.contains("show")) {
      closeModal(elements.priceModal);
    } else if (elements.productModal.classList.contains("show")) {
      closeModal(elements.productModal);
    }
  });

  auth.requireUser().then(loadData);
})();
