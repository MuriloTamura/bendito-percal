(function () {
  const { closeModal, escapeHtml, hideAlert, openModal, showAlert } = ui;

  let categories = [];

  let units = [];

  let editingCategoryId = null;

  const dateFmt = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const elements = {
    categoriesBody: document.getElementById("categories-body"),

    categoriesSummary: document.getElementById("categories-summary"),

    categoriesError: document.getElementById("categories-error"),

    categoriesSuccess: document.getElementById("categories-success"),

    unitsBody: document.getElementById("units-body"),

    unitsSummary: document.getElementById("units-summary"),

    unitsError: document.getElementById("units-error"),

    unitsSuccess: document.getElementById("units-success"),

    categoryModal: document.getElementById("category-modal"),

    categoryModalTitle: document.getElementById("category-modal-title"),

    categoryForm: document.getElementById("category-form"),

    categoryName: document.getElementById("category-name"),

    categoryFormError: document.getElementById("category-form-error"),

    categorySubmit: document.getElementById("category-form-submit"),

    unitModal: document.getElementById("unit-modal"),

    unitForm: document.getElementById("unit-form"),

    unitName: document.getElementById("unit-name"),

    unitAbbreviation: document.getElementById("unit-abbreviation"),

    unitFormError: document.getElementById("unit-form-error"),

    unitSubmit: document.getElementById("unit-form-submit"),
  };

  function showTemporarySuccess(element, message) {
    showAlert(element, message);

    window.setTimeout(() => hideAlert(element), 3500);
  }

  function formatDate(value) {
    if (!value) {
      return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "—";
    }

    return dateFmt.format(date);
  }

  function renderCategories() {
    elements.categoriesSummary.textContent = `${categories.length} ${
      categories.length === 1 ? "categoria ativa" : "categorias ativas"
    }`;

    if (categories.length === 0) {
      elements.categoriesBody.innerHTML = `
          <tr class="empty-row">

            <td colspan="3">
              Nenhuma categoria cadastrada ainda.
            </td>

          </tr>
        `;

      return;
    }

    elements.categoriesBody.innerHTML = categories
      .map(
        (category) => `

              <tr>

                <td>

                  <strong class="table-primary">
                    ${escapeHtml(category.name)}
                  </strong>

                </td>

                <td>

                  ${escapeHtml(formatDate(category.createdAt))}

                </td>

                <td class="actions-col">

                  <div class="row-actions">

                    <button
                      class="table-action"
                      type="button"
                      data-category-action="edit"
                      data-id="${category.id}"
                    >
                      Renomear
                    </button>

                    <button
                      class="table-action danger"
                      type="button"
                      data-category-action="deactivate"
                      data-id="${category.id}"
                    >
                      Desativar
                    </button>

                  </div>

                </td>

              </tr>

            `,
      )
      .join("");
  }

  function renderUnits() {
    elements.unitsSummary.textContent = `${units.length} ${
      units.length === 1 ? "unidade cadastrada" : "unidades cadastradas"
    }`;

    if (units.length === 0) {
      elements.unitsBody.innerHTML = `
          <tr class="empty-row">

            <td colspan="2">
              Nenhuma unidade cadastrada ainda.
            </td>

          </tr>
        `;

      return;
    }

    elements.unitsBody.innerHTML = units
      .map(
        (unit) => `

              <tr>

                <td>

                  <strong class="table-primary">
                    ${escapeHtml(unit.name)}
                  </strong>

                </td>

                <td>

                  <span class="unit-code">

                    ${escapeHtml(unit.abbreviation)}

                  </span>

                </td>

              </tr>

            `,
      )
      .join("");
  }

  function openCategoryModal(category = null) {
    hideAlert(elements.categoryFormError);

    elements.categoryForm.reset();

    editingCategoryId = category?.id || null;

    if (category) {
      elements.categoryModalTitle.textContent = "Renomear categoria";

      elements.categorySubmit.textContent = "Salvar alteração";

      elements.categoryName.value = category.name;
    } else {
      elements.categoryModalTitle.textContent = "Nova categoria";

      elements.categorySubmit.textContent = "Cadastrar categoria";
    }

    openModal(elements.categoryModal);

    elements.categoryName.focus();

    elements.categoryName.select();
  }

  function openUnitModal() {
    hideAlert(elements.unitFormError);

    elements.unitForm.reset();

    openModal(elements.unitModal);

    elements.unitName.focus();
  }

  async function loadData() {
    hideAlert(elements.categoriesError);

    hideAlert(elements.unitsError);

    try {
      [categories, units] = await Promise.all([api.get("/api/v1/categories"), api.get("/api/v1/units")]);

      renderCategories();

      renderUnits();
    } catch (err) {
      const message = err.message || "Não foi possível carregar os cadastros.";

      showAlert(elements.categoriesError, message);

      showAlert(elements.unitsError, message);
    }
  }

  async function saveCategory(event) {
    event.preventDefault();

    hideAlert(elements.categoryFormError);

    const name = elements.categoryName.value.trim();

    if (!name) {
      showAlert(elements.categoryFormError, "Informe o nome da categoria.");

      return;
    }

    const normalizedName = name.toLocaleLowerCase("pt-BR");

    const duplicate = categories.some(
      (category) =>
        category.id !== editingCategoryId && category.name.trim().toLocaleLowerCase("pt-BR") === normalizedName,
    );

    if (duplicate) {
      showAlert(elements.categoryFormError, "Já existe uma categoria com esse nome.");

      return;
    }

    const wasEditing = Boolean(editingCategoryId);

    elements.categorySubmit.disabled = true;

    elements.categorySubmit.textContent = wasEditing ? "Salvando…" : "Cadastrando…";

    try {
      if (editingCategoryId) {
        await api.put(`/api/v1/categories/${editingCategoryId}`, {
          name,
        });
      } else {
        await api.post("/api/v1/categories", {
          name,
        });
      }

      closeModal(elements.categoryModal);

      editingCategoryId = null;

      await loadData();

      showTemporarySuccess(
        elements.categoriesSuccess,

        wasEditing ? "Categoria renomeada com sucesso." : "Categoria cadastrada com sucesso.",
      );
    } catch (err) {
      showAlert(
        elements.categoryFormError,

        err.message || "Não foi possível salvar a categoria.",
      );
    } finally {
      elements.categorySubmit.disabled = false;
    }
  }

  async function deactivateCategory(categoryId) {
    const category = categories.find((item) => item.id === categoryId);

    if (!category) {
      return;
    }

    const confirmed = window.confirm(
      `Desativar a categoria "${category.name}"? Produtos e matérias-primas já cadastrados nela não serão alterados.`,
    );

    if (!confirmed) {
      return;
    }

    hideAlert(elements.categoriesError);

    try {
      await api.delete(`/api/v1/categories/${category.id}`);

      await loadData();

      showTemporarySuccess(elements.categoriesSuccess, "Categoria desativada com sucesso.");
    } catch (err) {
      showAlert(
        elements.categoriesError,

        err.message || "Não foi possível desativar a categoria.",
      );
    }
  }

  async function createUnit(event) {
    event.preventDefault();

    hideAlert(elements.unitFormError);

    const name = elements.unitName.value.trim();

    const abbreviation = elements.unitAbbreviation.value.trim();

    if (!name || !abbreviation) {
      showAlert(
        elements.unitFormError,

        "Informe o nome e a abreviação da unidade.",
      );

      return;
    }

    const normalizedName = name.toLocaleLowerCase("pt-BR");

    const normalizedAbbreviation = abbreviation.toLocaleLowerCase("pt-BR");

    const duplicate = units.some(
      (unit) =>
        unit.name.trim().toLocaleLowerCase("pt-BR") === normalizedName ||
        unit.abbreviation.trim().toLocaleLowerCase("pt-BR") === normalizedAbbreviation,
    );

    if (duplicate) {
      showAlert(
        elements.unitFormError,

        "Já existe uma unidade com esse nome ou abreviação.",
      );

      return;
    }

    elements.unitSubmit.disabled = true;

    elements.unitSubmit.textContent = "Cadastrando…";

    try {
      await api.post("/api/v1/units", {
        name,
        abbreviation,
      });

      closeModal(elements.unitModal);

      await loadData();

      showTemporarySuccess(
        elements.unitsSuccess,

        "Unidade cadastrada com sucesso.",
      );
    } catch (err) {
      showAlert(
        elements.unitFormError,

        err.message || "Não foi possível cadastrar a unidade.",
      );
    } finally {
      elements.unitSubmit.disabled = false;

      elements.unitSubmit.textContent = "Cadastrar unidade";
    }
  }

  document.getElementById("new-category-btn").addEventListener("click", () => openCategoryModal());

  document.getElementById("new-unit-btn").addEventListener("click", openUnitModal);

  document.getElementById("category-modal-close").addEventListener("click", () => closeModal(elements.categoryModal));

  document.getElementById("category-form-cancel").addEventListener("click", () => closeModal(elements.categoryModal));

  document.getElementById("unit-modal-close").addEventListener("click", () => closeModal(elements.unitModal));

  document.getElementById("unit-form-cancel").addEventListener("click", () => closeModal(elements.unitModal));

  elements.categoryForm.addEventListener("submit", saveCategory);

  elements.unitForm.addEventListener("submit", createUnit);

  elements.categoriesBody.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-category-action]");

    if (!button) {
      return;
    }

    const category = categories.find((item) => item.id === button.dataset.id);

    if (!category) {
      return;
    }

    if (button.dataset.categoryAction === "edit") {
      openCategoryModal(category);
    }

    if (button.dataset.categoryAction === "deactivate") {
      deactivateCategory(category.id);
    }
  });

  [elements.categoryModal, elements.unitModal].forEach((modal) => {
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

    if (elements.unitModal.classList.contains("show")) {
      closeModal(elements.unitModal);
    } else if (elements.categoryModal.classList.contains("show")) {
      closeModal(elements.categoryModal);
    }
  });

  auth.requireUser().then(loadData);
})();
