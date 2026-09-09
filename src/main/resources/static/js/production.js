(function () {

    const cfg =
        window.APP_CONFIG || {};


    let productionOrders = [];

    let products = [];

    let rawMaterials = [];


    const quantityFmt =
        new Intl.NumberFormat(
            "pt-BR",
            {
                maximumFractionDigits: 3
            }
        );


    const dateTimeFmt =
        new Intl.DateTimeFormat(
            "pt-BR",
            {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            }
        );


    const elements = {

        body:
            document.getElementById(
                "productions-body"
            ),

        summary:
            document.getElementById(
                "productions-summary"
            ),

        search:
            document.getElementById(
                "production-search"
            ),

        error:
            document.getElementById(
                "production-error"
            ),

        success:
            document.getElementById(
                "production-success"
            ),


        productionsCount:
            document.getElementById(
                "productions-count"
            ),

        productionsToday:
            document.getElementById(
                "productions-today"
            ),

        distinctProducts:
            document.getElementById(
                "distinct-products"
            ),

        materialsToday:
            document.getElementById(
                "materials-today"
            ),


        modal:
            document.getElementById(
                "production-modal"
            ),

        form:
            document.getElementById(
                "production-form"
            ),

        formError:
            document.getElementById(
                "production-form-error"
            ),

        submit:
            document.getElementById(
                "production-form-submit"
            ),


        product:
            document.getElementById(
                "production-product"
            ),

        quantity:
            document.getElementById(
                "production-quantity"
            ),


        productPreview:
            document.getElementById(
                "product-preview"
            ),

        productCurrentStock:
            document.getElementById(
                "product-current-stock"
            ),

        productUnit:
            document.getElementById(
                "product-unit"
            ),


        materialsContainer:
            document.getElementById(
                "production-materials"
            ),


        detailsModal:
            document.getElementById(
                "production-details-modal"
            ),

        detailsCode:
            document.getElementById(
                "production-details-code"
            ),

        detailsProduct:
            document.getElementById(
                "details-product"
            ),

        detailsQuantity:
            document.getElementById(
                "details-quantity"
            ),

        detailsDate:
            document.getElementById(
                "details-date"
            ),

        detailsStatus:
            document.getElementById(
                "details-status"
            ),

        detailsMaterialsBody:
            document.getElementById(
                "details-materials-body"
            )

    };


    /* =====================================================
       WHITE-LABEL
       ===================================================== */

    function applyBrand() {

        const companyName =
            cfg.companyName ||
            "Sistema de Gestão";


        document.getElementById(
            "brand-name"
        ).textContent =
            companyName;


        document.getElementById(
            "brand-tagline"
        ).textContent =
            cfg.companyTagline || "";


        document.getElementById(
            "brand-initial"
        ).textContent =
            companyName
                .trim()
                .charAt(0)
                .toUpperCase();

    }


    /* =====================================================
       UTILITÁRIOS
       ===================================================== */

    function escapeHtml(value) {

        const div =
            document.createElement(
                "div"
            );


        div.textContent =
            value ?? "";


        return div.innerHTML;

    }


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


    function showSuccess(message) {

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


    function formatDate(value) {

        if (!value) {
            return "—";
        }


        const date =
            new Date(value);


        if (
            Number.isNaN(
                date.getTime()
            )
        ) {
            return "—";
        }


        return dateTimeFmt.format(
            date
        );

    }


    function isToday(value) {

        const date =
            new Date(value);


        const today =
            new Date();


        return (
            date.getFullYear() ===
            today.getFullYear()

            &&

            date.getMonth() ===
            today.getMonth()

            &&

            date.getDate() ===
            today.getDate()
        );

    }


    function formatQuantity(
        quantity,
        unit = ""
    ) {

        const value =
            quantityFmt.format(
                Number(quantity)
            );


        return unit
            ? `${value} ${unit}`
            : value;

    }


    function shortId(id) {

        if (!id) {
            return "—";
        }


        return id.length > 8
            ? id.substring(0, 8)
            : id;

    }


    /* =====================================================
       PRODUTO / MATÉRIA-PRIMA
       ===================================================== */

    function findProduct(id) {

        return products.find(
            product =>
                product.id === id
        );

    }


    function findRawMaterial(id) {

        return rawMaterials.find(
            rawMaterial =>
                rawMaterial.id === id
        );

    }


    /* =====================================================
       STATUS
       ===================================================== */

    function getStatusLabel(status) {

        if (
            status === "COMPLETED"
        ) {
            return "Concluída";
        }


        return status || "—";

    }


    function getStatusBadge(status) {

        if (
            status === "COMPLETED"
        ) {

            return `
        <span class="badge ok">
          Concluída
        </span>
      `;

        }


        return `
      <span class="badge neutral">
        ${escapeHtml(status)}
      </span>
    `;

    }


    /* =====================================================
       CARDS
       ===================================================== */

    function renderStats() {

        const todayOrders =
            productionOrders.filter(
                order =>
                    isToday(
                        order.createdAt
                    )
            );


        const distinctProducts =
            new Set(
                productionOrders.map(
                    order =>
                        order.productId
                )
            ).size;


        const materialsToday =
            todayOrders.reduce(
                (total, order) =>
                    total +
                    (
                        order.items?.length ||
                        0
                    ),
                0
            );


        elements.productionsCount.textContent =
            quantityFmt.format(
                productionOrders.length
            );


        elements.productionsToday.textContent =
            quantityFmt.format(
                todayOrders.length
            );


        elements.distinctProducts.textContent =
            quantityFmt.format(
                distinctProducts
            );


        elements.materialsToday.textContent =
            quantityFmt.format(
                materialsToday
            );


        [
            elements.productionsCount,
            elements.productionsToday,
            elements.distinctProducts,
            elements.materialsToday

        ].forEach(
            element =>
                element.classList.remove(
                    "skeleton"
                )
        );

    }


    /* =====================================================
       HISTÓRICO
       ===================================================== */

    function renderProductions() {

        const term =
            elements.search
                .value
                .trim()
                .toLocaleLowerCase(
                    "pt-BR"
                );


        const filtered =
            productionOrders.filter(
                order => {

                    if (!term) {
                        return true;
                    }


                    const materialNames =
                        (order.items || [])
                            .map(
                                item =>
                                    item.rawMaterialName
                            )
                            .join(" ");


                    const searchable =
                        `
                    ${order.productName}
                    ${materialNames}
                    ${order.id}
                  `
                            .toLocaleLowerCase(
                                "pt-BR"
                            );


                    return searchable.includes(
                        term
                    );

                }
            );


        elements.summary.textContent =
            term
                ? `${filtered.length} de ${productionOrders.length} produções encontradas`
                : `${productionOrders.length} ${
                    productionOrders.length === 1
                        ? "produção registrada"
                        : "produções registradas"
                }`;


        if (
            filtered.length === 0
        ) {

            elements.body.innerHTML = `

        <tr class="empty-row">

          <td colspan="6">

            ${
                productionOrders.length === 0
                    ? "Nenhuma produção registrada ainda."
                    : "Nenhuma produção corresponde à busca."
            }

          </td>

        </tr>

      `;


            return;

        }


        elements.body.innerHTML =
            filtered
                .map(
                    order => {

                        const product =
                            findProduct(
                                order.productId
                            );


                        const productUnit =
                            product
                                ?.unitAbbreviation ||
                            "";


                        const materialsCount =
                            order.items?.length ||
                            0;


                        return `

                    <tr>

                      <td class="movement-date">

                        ${escapeHtml(
                            formatDate(
                                order.createdAt
                            )
                        )}

                      </td>


                      <td>

                        <strong class="table-primary">

                          ${escapeHtml(
                            order.productName
                        )}

                        </strong>


                        <span class="table-secondary">

                          #${escapeHtml(
                            shortId(
                                order.id
                            )
                        )}

                        </span>

                      </td>


                      <td class="num">

                        <strong>

                          ${escapeHtml(
                            formatQuantity(
                                order.quantityProduced,
                                productUnit
                            )
                        )}

                        </strong>

                      </td>


                      <td>

                        ${materialsCount}

                        ${
                            materialsCount === 1
                                ? "insumo"
                                : "insumos"
                        }

                      </td>


                      <td>

                        ${getStatusBadge(
                            order.status
                        )}

                      </td>


                      <td class="actions-col">

                        <button
                            class="table-action"
                            type="button"
                            data-action="details"
                            data-id="${order.id}"
                        >
                          Detalhes
                        </button>

                      </td>

                    </tr>

                  `;

                    }
                )
                .join("");

    }


    /* =====================================================
       SELECT DE PRODUTOS
       ===================================================== */

    function populateProductSelect() {

        elements.product.innerHTML = `

      <option value="">
        Selecione o produto
      </option>

      ${
            products
                .map(
                    product => `

                  <option value="${product.id}">

                    ${escapeHtml(
                        product.name
                    )}

                    —
                    estoque:

                    ${escapeHtml(
                        formatQuantity(
                            product.quantityInStock,
                            product.unitAbbreviation
                        )
                    )}

                  </option>

                `
                )
                .join("")
        }

    `;

    }


    function updateProductPreview() {

        const product =
            findProduct(
                elements.product.value
            );


        if (!product) {

            elements.productPreview.hidden =
                true;

            return;

        }


        elements.productCurrentStock.textContent =
            formatQuantity(
                product.quantityInStock,
                product.unitAbbreviation
            );


        elements.productUnit.textContent =
            product.unitAbbreviation;


        elements.productPreview.hidden =
            false;

    }


    /* =====================================================
       LINHAS DE MATÉRIA-PRIMA
       ===================================================== */

    function getRawMaterialOptions() {

        return rawMaterials
            .map(
                rawMaterial => `

              <option value="${rawMaterial.id}">

                ${escapeHtml(
                    rawMaterial.name
                )}

                —
                estoque:

                ${escapeHtml(
                    formatQuantity(
                        rawMaterial.quantityInStock,
                        rawMaterial.unitAbbreviation
                    )
                )}

              </option>

            `
            )
            .join("");

    }


    function addMaterialRow() {

        const row =
            document.createElement(
                "div"
            );


        row.className =
            "production-material-row";


        row.innerHTML = `

      <div class="field production-material-field">

        <label>
          Matéria-prima
        </label>

        <select
            class="production-material-select"
            required
        >

          <option value="">
            Selecione o insumo
          </option>

          ${getRawMaterialOptions()}

        </select>

      </div>


      <div class="field production-material-field">

        <label>
          Quantidade
        </label>

        <input
            class="production-material-quantity"
            type="number"
            min="0.001"
            step="0.001"
            inputmode="decimal"
            required
            placeholder="0"
        />

      </div>


      <div class="production-material-stock">

        <span>
          Saldo disponível
        </span>

        <strong>
          —
        </strong>

      </div>


      <button
          class="production-remove-material"
          type="button"
          title="Remover matéria-prima"
          aria-label="Remover matéria-prima"
      >
        ×
      </button>

    `;


        elements.materialsContainer
            .appendChild(
                row
            );

    }


    function updateMaterialStock(row) {

        const select =
            row.querySelector(
                ".production-material-select"
            );


        const stock =
            row.querySelector(
                ".production-material-stock strong"
            );


        const rawMaterial =
            findRawMaterial(
                select.value
            );


        if (!rawMaterial) {

            stock.textContent =
                "—";

            return;

        }


        stock.textContent =
            formatQuantity(
                rawMaterial.quantityInStock,
                rawMaterial.unitAbbreviation
            );

    }


    /* =====================================================
       MODAL DE PRODUÇÃO
       ===================================================== */

    function openProductionModal() {

        elements.form.reset();


        hideAlert(
            elements.formError
        );


        populateProductSelect();


        elements.productPreview.hidden =
            true;


        elements.materialsContainer.innerHTML =
            "";


        /*
         * Toda produção precisa de
         * pelo menos um insumo.
         */
        addMaterialRow();


        elements.modal.classList.add(
            "show"
        );


        elements.modal.setAttribute(
            "aria-hidden",
            "false"
        );


        document.body.classList.add(
            "modal-open"
        );


        elements.product.focus();

    }


    function closeProductionModal() {

        elements.modal.classList.remove(
            "show"
        );


        elements.modal.setAttribute(
            "aria-hidden",
            "true"
        );


        if (
            !document.querySelector(
                ".modal-backdrop.show"
            )
        ) {

            document.body.classList.remove(
                "modal-open"
            );

        }

    }


    /* =====================================================
       LER INSUMOS DO FORMULÁRIO
       ===================================================== */

    function readProductionItems() {

        const rows =
            [
                ...elements.materialsContainer
                    .querySelectorAll(
                        ".production-material-row"
                    )
            ];


        const items = [];


        for (
            const row of rows
            ) {

            const rawMaterialId =
                row.querySelector(
                    ".production-material-select"
                ).value;


            const quantityConsumed =
                Number(
                    row.querySelector(
                        ".production-material-quantity"
                    ).value
                );


            if (!rawMaterialId) {

                throw new Error(
                    "Selecione todas as matérias-primas."
                );

            }


            if (
                !Number.isFinite(
                    quantityConsumed
                ) ||
                quantityConsumed <= 0
            ) {

                throw new Error(
                    "A quantidade consumida deve ser maior que zero."
                );

            }


            items.push({
                rawMaterialId,
                quantityConsumed
            });

        }


        if (
            items.length === 0
        ) {

            throw new Error(
                "Adicione pelo menos uma matéria-prima."
            );

        }


        return items;

    }


    /* =====================================================
       VALIDAÇÃO DOS INSUMOS
       ===================================================== */

    function validateProductionItems(
        items
    ) {

        /*
         * Evita selecionar a mesma matéria-prima
         * em duas linhas diferentes.
         */
        const ids =
            items.map(
                item =>
                    item.rawMaterialId
            );


        const uniqueIds =
            new Set(ids);


        if (
            uniqueIds.size !==
            ids.length
        ) {

            throw new Error(
                "A mesma matéria-prima foi selecionada mais de uma vez."
            );

        }


        /*
         * O backend já protege o estoque,
         * mas fazemos a validação também na tela
         * para melhorar a experiência do usuário.
         */
        for (
            const item of items
            ) {

            const rawMaterial =
                findRawMaterial(
                    item.rawMaterialId
                );


            if (!rawMaterial) {

                throw new Error(
                    "Uma das matérias-primas selecionadas não está disponível."
                );

            }


            if (
                item.quantityConsumed >
                Number(
                    rawMaterial.quantityInStock
                )
            ) {

                throw new Error(
                    `Estoque insuficiente de "${rawMaterial.name}". Disponível: ${formatQuantity(
                        rawMaterial.quantityInStock,
                        rawMaterial.unitAbbreviation
                    )}.`
                );

            }

        }

    }


    /* =====================================================
       REGISTRAR PRODUÇÃO
       ===================================================== */

    async function createProduction(
        event
    ) {

        event.preventDefault();


        hideAlert(
            elements.formError
        );


        const productId =
            elements.product.value;


        const quantityProduced =
            Number(
                elements.quantity.value
            );


        if (!productId) {

            showAlert(
                elements.formError,
                "Selecione o produto produzido."
            );

            return;

        }


        if (
            !Number.isFinite(
                quantityProduced
            ) ||
            quantityProduced <= 0
        ) {

            showAlert(
                elements.formError,
                "A quantidade produzida deve ser maior que zero."
            );

            return;

        }


        let items;


        try {

            items =
                readProductionItems();


            validateProductionItems(
                items
            );

        }
        catch (error) {

            showAlert(
                elements.formError,
                error.message
            );

            return;

        }


        elements.submit.disabled =
            true;


        elements.submit.textContent =
            "Registrando…";


        try {

            await api.post(
                "/api/v1/production-orders",
                {
                    productId,
                    quantityProduced,
                    items
                }
            );


            closeProductionModal();


            /*
             * Recarregamos produtos e matérias-primas
             * porque seus estoques acabaram de mudar.
             */
            await loadData();


            showSuccess(
                "Produção registrada com sucesso."
            );

        }
        catch (error) {

            showAlert(
                elements.formError,

                error.message ||
                "Não foi possível registrar a produção."
            );

        }
        finally {

            elements.submit.disabled =
                false;


            elements.submit.textContent =
                "Registrar produção";

        }

    }


    /* =====================================================
       DETALHES
       ===================================================== */

    function openProductionDetails(
        productionId
    ) {

        const order =
            productionOrders.find(
                production =>
                    production.id ===
                    productionId
            );


        if (!order) {
            return;
        }


        const product =
            findProduct(
                order.productId
            );


        const productUnit =
            product?.unitAbbreviation ||
            "";


        elements.detailsCode.textContent =
            `Produção #${shortId(order.id)}`;


        elements.detailsProduct.textContent =
            order.productName;


        elements.detailsQuantity.textContent =
            formatQuantity(
                order.quantityProduced,
                productUnit
            );


        elements.detailsDate.textContent =
            formatDate(
                order.createdAt
            );


        elements.detailsStatus.textContent =
            getStatusLabel(
                order.status
            );


        if (
            !order.items ||
            order.items.length === 0
        ) {

            elements.detailsMaterialsBody.innerHTML = `

        <tr class="empty-row">

          <td colspan="2">
            Nenhuma matéria-prima registrada.
          </td>

        </tr>

      `;

        }
        else {

            elements.detailsMaterialsBody.innerHTML =
                order.items
                    .map(
                        item => {

                            const rawMaterial =
                                findRawMaterial(
                                    item.rawMaterialId
                                );


                            const unit =
                                rawMaterial
                                    ?.unitAbbreviation ||
                                "";


                            return `

                      <tr>

                        <td>

                          <strong class="table-primary">

                            ${escapeHtml(
                                item.rawMaterialName
                            )}

                          </strong>

                        </td>


                        <td class="num">

                          ${escapeHtml(
                                formatQuantity(
                                    item.quantityConsumed,
                                    unit
                                )
                            )}

                        </td>

                      </tr>

                    `;

                        }
                    )
                    .join("");

        }


        elements.detailsModal
            .classList
            .add(
                "show"
            );


        elements.detailsModal
            .setAttribute(
                "aria-hidden",
                "false"
            );


        document.body.classList.add(
            "modal-open"
        );

    }


    function closeProductionDetails() {

        elements.detailsModal
            .classList
            .remove(
                "show"
            );


        elements.detailsModal
            .setAttribute(
                "aria-hidden",
                "true"
            );


        if (
            !document.querySelector(
                ".modal-backdrop.show"
            )
        ) {

            document.body.classList.remove(
                "modal-open"
            );

        }

    }


    /* =====================================================
       USUÁRIO
       ===================================================== */

    async function loadUser() {

        try {

            const user =
                await api.get(
                    "/api/v1/auth/me"
                );


            document.getElementById(
                "user-name"
            ).textContent =
                user.name;


            document.getElementById(
                "user-role"
            ).textContent =
                user.role === "ADMIN"
                    ? "Administrador"
                    : "Operador";


            return true;

        }
        catch (error) {

            window.location.replace(
                "login.html"
            );


            return false;

        }

    }


    /* =====================================================
       CARREGAMENTO
       ===================================================== */

    async function loadData() {

        hideAlert(
            elements.error
        );


        try {

            [
                productionOrders,
                products,
                rawMaterials

            ] = await Promise.all([

                api.get(
                    "/api/v1/production-orders"
                ),

                api.get(
                    "/api/v1/products"
                ),

                api.get(
                    "/api/v1/raw-materials"
                )

            ]);


            renderStats();

            renderProductions();

        }
        catch (error) {

            if (
                error.status === 401
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
            as produções.

          </td>

        </tr>

      `;


            elements.summary.textContent =
                "Falha ao carregar";


            showAlert(
                elements.error,

                error.message ||
                "Não foi possível carregar os dados."
            );

        }

    }


    /* =====================================================
       EVENTOS
       ===================================================== */

    document.getElementById(
        "new-production-btn"
    ).addEventListener(
        "click",
        openProductionModal
    );


    document.getElementById(
        "production-modal-close"
    ).addEventListener(
        "click",
        closeProductionModal
    );


    document.getElementById(
        "production-form-cancel"
    ).addEventListener(
        "click",
        closeProductionModal
    );


    document.getElementById(
        "add-material-btn"
    ).addEventListener(
        "click",
        addMaterialRow
    );


    elements.product.addEventListener(
        "change",
        updateProductPreview
    );


    elements.form.addEventListener(
        "submit",
        createProduction
    );


    /*
     * Eventos das linhas dinâmicas
     * de matérias-primas.
     */
    elements.materialsContainer
        .addEventListener(
            "change",
            event => {

                if (
                    !event.target
                        .classList
                        .contains(
                            "production-material-select"
                        )
                ) {
                    return;
                }


                const row =
                    event.target.closest(
                        ".production-material-row"
                    );


                updateMaterialStock(
                    row
                );

            }
        );


    elements.materialsContainer
        .addEventListener(
            "click",
            event => {

                const button =
                    event.target.closest(
                        ".production-remove-material"
                    );


                if (!button) {
                    return;
                }


                const rows =
                    elements.materialsContainer
                        .querySelectorAll(
                            ".production-material-row"
                        );


                /*
                 * Sempre precisamos de pelo
                 * menos uma matéria-prima.
                 */
                if (
                    rows.length <= 1
                ) {

                    showAlert(
                        elements.formError,
                        "A produção precisa de pelo menos uma matéria-prima."
                    );

                    return;

                }


                button
                    .closest(
                        ".production-material-row"
                    )
                    .remove();

            }
        );


    /*
     * Busca.
     */
    elements.search.addEventListener(
        "input",
        renderProductions
    );


    /*
     * Detalhes da tabela.
     */
    elements.body.addEventListener(
        "click",
        event => {

            const button =
                event.target.closest(
                    "button[data-action]"
                );


            if (!button) {
                return;
            }


            if (
                button.dataset.action ===
                "details"
            ) {

                openProductionDetails(
                    button.dataset.id
                );

            }

        }
    );


    /*
     * Modal de detalhes.
     */
    document.getElementById(
        "production-details-close"
    ).addEventListener(
        "click",
        closeProductionDetails
    );


    document.getElementById(
        "production-details-ok"
    ).addEventListener(
        "click",
        closeProductionDetails
    );


    /*
     * Clique fora.
     */
    elements.modal.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                elements.modal
            ) {

                closeProductionModal();

            }

        }
    );


    elements.detailsModal.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                elements.detailsModal
            ) {

                closeProductionDetails();

            }

        }
    );


    /*
     * ESC.
     */
    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key !== "Escape"
            ) {
                return;
            }


            if (
                elements.detailsModal
                    .classList
                    .contains(
                        "show"
                    )
            ) {

                closeProductionDetails();

            }
            else if (
                elements.modal
                    .classList
                    .contains(
                        "show"
                    )
            ) {

                closeProductionModal();

            }

        }
    );


    /*
     * Logout.
     */
    document.getElementById(
        "logout-btn"
    ).addEventListener(
        "click",
        async () => {

            try {

                await api.post(
                    "/api/v1/auth/logout"
                );

            }
            catch (error) {
                // A sessão pode já ter expirado.
            }


            window.location.replace(
                "login.html"
            );

        }
    );


    /* =====================================================
       INICIALIZAÇÃO
       ===================================================== */

    applyBrand();


    loadUser()
        .then(
            authenticated => {

                if (authenticated) {

                    loadData();

                }

            }
        );

})();