(function () {

    const cfg =
        window.APP_CONFIG || {};


    let rawMaterials = [];

    let categories = [];

    let units = [];


    const quantityFmt =
        new Intl.NumberFormat(
            "pt-BR",
            {
                maximumFractionDigits: 3
            }
        );


    const elements = {

        body:
            document.getElementById(
                "raw-materials-body"
            ),

        summary:
            document.getElementById(
                "raw-materials-summary"
            ),

        search:
            document.getElementById(
                "raw-material-search"
            ),

        error:
            document.getElementById(
                "raw-materials-error"
            ),

        success:
            document.getElementById(
                "raw-materials-success"
            ),

        count:
            document.getElementById(
                "raw-material-count"
            ),

        lowStockCount:
            document.getElementById(
                "low-stock-count"
            ),

        outOfStockCount:
            document.getElementById(
                "out-of-stock-count"
            ),


        modal:
            document.getElementById(
                "raw-material-modal"
            ),

        form:
            document.getElementById(
                "raw-material-form"
            ),

        formError:
            document.getElementById(
                "raw-material-form-error"
            ),

        submit:
            document.getElementById(
                "raw-material-form-submit"
            ),

        name:
            document.getElementById(
                "raw-material-name"
            ),

        category:
            document.getElementById(
                "raw-material-category"
            ),

        unit:
            document.getElementById(
                "raw-material-unit"
            ),

        minimumStock:
            document.getElementById(
                "raw-material-min-stock"
            )

    };


    /*
     * =============================================
     * WHITE-LABEL
     * =============================================
     */

    function applyBrand() {

        const companyName =
            cfg.companyName ||
            "Sistema de Gestão";


        document
            .getElementById(
                "brand-name"
            )
            .textContent =
            companyName;


        document
            .getElementById(
                "brand-tagline"
            )
            .textContent =
            cfg.companyTagline || "";


        document
            .getElementById(
                "brand-initial"
            )
            .textContent =
            companyName
                .trim()
                .charAt(0)
                .toUpperCase();

    }


    /*
     * =============================================
     * SEGURANÇA PARA HTML
     * =============================================
     */

    function escapeHtml(value) {

        const div =
            document.createElement(
                "div"
            );


        div.textContent =
            value ?? "";


        return div.innerHTML;

    }


    /*
     * =============================================
     * ALERTAS
     * =============================================
     */

    function showAlert(
        element,
        message
    ) {

        element.textContent =
            message;


        element.classList.add(
            "show"
        );

    }


    function hideAlert(
        element
    ) {

        element.textContent =
            "";


        element.classList.remove(
            "show"
        );

    }


    function showSuccess(
        message
    ) {

        hideAlert(
            elements.error
        );


        showAlert(
            elements.success,
            message
        );


        window.setTimeout(
            () =>
                hideAlert(
                    elements.success
                ),
            3500
        );

    }


    /*
     * =============================================
     * ESTOQUE
     * =============================================
     */

    function isOutOfStock(
        rawMaterial
    ) {

        return (
            Number(
                rawMaterial.quantityInStock
            ) <= 0
        );

    }


    function isLowStock(
        rawMaterial
    ) {

        if (
            rawMaterial.minimumStock === null ||
            rawMaterial.minimumStock === undefined
        ) {

            return false;

        }


        return (
            Number(
                rawMaterial.quantityInStock
            ) <=
            Number(
                rawMaterial.minimumStock
            )
        );

    }


    /*
     * Define o status visual da matéria-prima.
     */
    function getStockStatus(
        rawMaterial
    ) {

        if (
            isOutOfStock(
                rawMaterial
            )
        ) {

            return `
        <span class="badge low">
          Sem estoque
        </span>
      `;

        }


        if (
            isLowStock(
                rawMaterial
            )
        ) {

            return `
        <span class="badge warning">
          Estoque baixo
        </span>
      `;

        }


        return `
      <span class="badge ok">
        Normal
      </span>
    `;

    }


    /*
     * =============================================
     * INDICADORES
     * =============================================
     */

    function renderStats() {

        const lowStock =
            rawMaterials.filter(
                (rawMaterial) =>
                    isLowStock(
                        rawMaterial
                    )
            ).length;


        const outOfStock =
            rawMaterials.filter(
                (rawMaterial) =>
                    isOutOfStock(
                        rawMaterial
                    )
            ).length;


        elements.count.textContent =
            quantityFmt.format(
                rawMaterials.length
            );


        elements.lowStockCount.textContent =
            quantityFmt.format(
                lowStock
            );


        elements.outOfStockCount.textContent =
            quantityFmt.format(
                outOfStock
            );


        elements.count
            .classList
            .remove(
                "skeleton"
            );


        elements.lowStockCount
            .classList
            .remove(
                "skeleton"
            );


        elements.outOfStockCount
            .classList
            .remove(
                "skeleton"
            );

    }


    /*
     * =============================================
     * TABELA
     * =============================================
     */

    function renderRawMaterials() {

        const term =
            elements.search
                .value
                .trim()
                .toLocaleLowerCase(
                    "pt-BR"
                );


        const filtered =
            rawMaterials.filter(
                (rawMaterial) => {

                    if (!term) {
                        return true;
                    }


                    const searchable =
                        `
              ${rawMaterial.name}
              ${rawMaterial.categoryName}
              ${rawMaterial.unitAbbreviation}
            `;


                    return searchable
                        .toLocaleLowerCase(
                            "pt-BR"
                        )
                        .includes(
                            term
                        );

                }
            );


        if (term) {

            elements.summary.textContent =
                `${filtered.length} de ${rawMaterials.length} matérias-primas encontradas`;

        }
        else {

            elements.summary.textContent =
                `${rawMaterials.length} ${
                    rawMaterials.length === 1
                        ? "matéria-prima ativa"
                        : "matérias-primas ativas"
                }`;

        }


        if (
            filtered.length === 0
        ) {

            const message =
                rawMaterials.length === 0
                    ? "Nenhuma matéria-prima cadastrada ainda."
                    : "Nenhuma matéria-prima corresponde à busca.";


            elements.body.innerHTML = `

        <tr class="empty-row">

          <td colspan="6">
            ${message}
          </td>

        </tr>

      `;


            return;

        }


        elements.body.innerHTML =
            filtered
                .map(
                    (rawMaterial) => {

                        const minimum =
                            rawMaterial.minimumStock === null ||
                            rawMaterial.minimumStock === undefined
                                ? "—"
                                : `
                  ${quantityFmt.format(
                                    rawMaterial.minimumStock
                                )}
                  ${escapeHtml(
                                    rawMaterial.unitAbbreviation
                                )}
                `;


                        return `

              <tr>

                <td>

                  <strong class="table-primary">

                    ${escapeHtml(
                            rawMaterial.name
                        )}

                  </strong>


                  <span class="table-secondary">

                    Código:
                    ${escapeHtml(
                            rawMaterial.id
                        )}

                  </span>

                </td>


                <td>

                  ${escapeHtml(
                            rawMaterial.categoryName
                        )}

                </td>


                <td class="num">

                  <strong>

                    ${quantityFmt.format(
                            rawMaterial.quantityInStock
                        )}

                  </strong>

                  ${escapeHtml(
                            rawMaterial.unitAbbreviation
                        )}

                </td>


                <td class="num">

                  ${minimum}

                </td>


                <td>

                  ${getStockStatus(
                            rawMaterial
                        )}

                </td>


                <td class="actions-col">

                  <div class="row-actions">

                    <button
                      class="table-action danger"
                      type="button"
                      data-action="deactivate"
                      data-id="${rawMaterial.id}"
                    >
                      Desativar
                    </button>

                  </div>

                </td>

              </tr>

            `;

                    }
                )
                .join("");

    }


    /*
     * =============================================
     * SELECTS
     * =============================================
     */

    function populateSelects() {

        elements.category.innerHTML =
            `
        <option value="">
          Selecione
        </option>
      `

            +

            categories
                .map(
                    (category) => `

            <option value="${category.id}">

              ${escapeHtml(
                        category.name
                    )}

            </option>

          `
                )
                .join("");


        elements.unit.innerHTML =
            `
        <option value="">
          Selecione
        </option>
      `

            +

            units
                .map(
                    (unit) => `

            <option value="${unit.id}">

              ${escapeHtml(
                        unit.name
                    )}

              (${escapeHtml(
                        unit.abbreviation
                    )})

            </option>

          `
                )
                .join("");

    }


    /*
     * =============================================
     * MODAL
     * =============================================
     */

    function openModal() {

        hideAlert(
            elements.formError
        );


        elements.form.reset();


        populateSelects();


        elements.modal
            .classList
            .add(
                "show"
            );


        elements.modal
            .setAttribute(
                "aria-hidden",
                "false"
            );


        document.body
            .classList
            .add(
                "modal-open"
            );


        elements.name.focus();

    }


    function closeModal() {

        elements.modal
            .classList
            .remove(
                "show"
            );


        elements.modal
            .setAttribute(
                "aria-hidden",
                "true"
            );


        document.body
            .classList
            .remove(
                "modal-open"
            );

    }


    /*
     * =============================================
     * USUÁRIO
     * =============================================
     */

    async function loadUser() {

        try {

            const user =
                await api.get(
                    "/api/v1/auth/me"
                );


            document
                .getElementById(
                    "user-name"
                )
                .textContent =
                user.name;


            document
                .getElementById(
                    "user-role"
                )
                .textContent =
                user.role === "ADMIN"
                    ? "Administrador"
                    : "Operador";


            return true;

        }
        catch (err) {

            window.location.replace(
                "login.html"
            );


            return false;

        }

    }


    /*
     * =============================================
     * CARREGAMENTO
     * =============================================
     */

    async function loadData() {

        hideAlert(
            elements.error
        );


        try {

            [
                rawMaterials,
                categories,
                units
            ] =
                await Promise.all([

                    api.get(
                        "/api/v1/raw-materials"
                    ),

                    api.get(
                        "/api/v1/categories"
                    ),

                    api.get(
                        "/api/v1/units"
                    )

                ]);


            renderStats();

            populateSelects();

            renderRawMaterials();

        }
        catch (err) {

            if (
                err.status === 401
            ) {

                window.location.replace(
                    "login.html"
                );

                return;

            }


            elements.body.innerHTML = `

        <tr class="empty-row">

          <td colspan="6">

            Não foi possível carregar
            as matérias-primas.

          </td>

        </tr>

      `;


            elements.summary.textContent =
                "Falha ao carregar";


            showAlert(
                elements.error,

                err.message ||
                "Não foi possível carregar os dados."
            );

        }

    }


    /*
     * =============================================
     * CADASTRAR
     * =============================================
     */

    async function createRawMaterial(
        event
    ) {

        event.preventDefault();


        hideAlert(
            elements.formError
        );


        const name =
            elements.name
                .value
                .trim();


        const categoryId =
            elements.category
                .value;


        const unitId =
            elements.unit
                .value;


        const minimumStockValue =
            elements.minimumStock
                .value;


        if (
            !name ||
            !categoryId ||
            !unitId
        ) {

            showAlert(
                elements.formError,
                "Preencha os campos obrigatórios."
            );

            return;

        }


        const minimumStock =
            minimumStockValue === ""
                ? null
                : Number(
                    minimumStockValue
                );


        if (
            minimumStock !== null &&
            (
                !Number.isFinite(
                    minimumStock
                ) ||
                minimumStock < 0
            )
        ) {

            showAlert(
                elements.formError,
                "O estoque mínimo não pode ser negativo."
            );

            return;

        }


        elements.submit.disabled =
            true;


        elements.submit.textContent =
            "Cadastrando…";


        try {

            await api.post(
                "/api/v1/raw-materials",
                {
                    name,
                    categoryId,
                    unitId,
                    minimumStock
                }
            );


            closeModal();


            await loadData();


            showSuccess(
                "Matéria-prima cadastrada com sucesso."
            );

        }
        catch (err) {

            showAlert(
                elements.formError,

                err.message ||
                "Não foi possível cadastrar a matéria-prima."
            );

        }
        finally {

            elements.submit.disabled =
                false;


            elements.submit.textContent =
                "Cadastrar matéria-prima";

        }

    }


    /*
     * =============================================
     * DESATIVAR
     * =============================================
     */

    async function deactivateRawMaterial(
        id
    ) {

        const rawMaterial =
            rawMaterials.find(
                (item) =>
                    item.id === id
            );


        if (!rawMaterial) {
            return;
        }


        const confirmed =
            window.confirm(
                `Desativar a matéria-prima "${rawMaterial.name}"? O histórico será preservado.`
            );


        if (!confirmed) {
            return;
        }


        hideAlert(
            elements.error
        );


        try {

            await api.delete(
                `/api/v1/raw-materials/${rawMaterial.id}`
            );


            await loadData();


            showSuccess(
                "Matéria-prima desativada com sucesso."
            );

        }
        catch (err) {

            showAlert(
                elements.error,

                err.message ||
                "Não foi possível desativar a matéria-prima."
            );

        }

    }


    /*
     * =============================================
     * EVENTOS
     * =============================================
     */

    document
        .getElementById(
            "new-raw-material-btn"
        )
        .addEventListener(
            "click",
            openModal
        );


    document
        .getElementById(
            "raw-material-modal-close"
        )
        .addEventListener(
            "click",
            closeModal
        );


    document
        .getElementById(
            "raw-material-form-cancel"
        )
        .addEventListener(
            "click",
            closeModal
        );


    elements.form
        .addEventListener(
            "submit",
            createRawMaterial
        );


    elements.search
        .addEventListener(
            "input",
            renderRawMaterials
        );


    /*
     * Ações da tabela.
     */
    elements.body
        .addEventListener(
            "click",
            (event) => {

                const button =
                    event.target.closest(
                        "button[data-action]"
                    );


                if (!button) {
                    return;
                }


                if (
                    button.dataset.action ===
                    "deactivate"
                ) {

                    deactivateRawMaterial(
                        button.dataset.id
                    );

                }

            }
        );


    /*
     * Clique fora do modal.
     */
    elements.modal
        .addEventListener(
            "click",
            (event) => {

                if (
                    event.target ===
                    elements.modal
                ) {

                    closeModal();

                }

            }
        );


    /*
     * ESC fecha o modal.
     */
    document
        .addEventListener(
            "keydown",
            (event) => {

                if (
                    event.key === "Escape" &&
                    elements.modal
                        .classList
                        .contains(
                            "show"
                        )
                ) {

                    closeModal();

                }

            }
        );


    /*
     * Logout
     */
    document
        .getElementById(
            "logout-btn"
        )
        .addEventListener(
            "click",
            async () => {

                try {

                    await api.post(
                        "/api/v1/auth/logout"
                    );

                }
                catch (err) {
                    // Ignora.
                }


                window.location.replace(
                    "login.html"
                );

            }
        );


    /*
     * =============================================
     * INICIALIZAÇÃO
     * =============================================
     */

    applyBrand();


    loadUser()
        .then(
            (authenticated) => {

                if (
                    authenticated
                ) {

                    loadData();

                }

            }
        );

})();