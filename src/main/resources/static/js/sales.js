(function () {

    const cfg =
        window.APP_CONFIG || {};


    let sales = [];

    let products = [];


    const currencyFmt =
        new Intl.NumberFormat(
            "pt-BR",
            {
                style: "currency",
                currency: "BRL"
            }
        );


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
                "sales-body"
            ),

        summary:
            document.getElementById(
                "sales-summary"
            ),

        search:
            document.getElementById(
                "sale-search"
            ),

        error:
            document.getElementById(
                "sales-error"
            ),

        success:
            document.getElementById(
                "sales-success"
            ),


        salesCount:
            document.getElementById(
                "sales-count"
            ),

        salesToday:
            document.getElementById(
                "sales-today"
            ),

        revenueToday:
            document.getElementById(
                "revenue-today"
            ),

        averageTicket:
            document.getElementById(
                "average-ticket"
            ),


        modal:
            document.getElementById(
                "sale-modal"
            ),

        form:
            document.getElementById(
                "sale-form"
            ),

        formError:
            document.getElementById(
                "sale-form-error"
            ),

        customer:
            document.getElementById(
                "sale-customer"
            ),

        submit:
            document.getElementById(
                "sale-form-submit"
            ),

        itemsContainer:
            document.getElementById(
                "sale-items"
            ),

        itemsCount:
            document.getElementById(
                "sale-items-count"
            ),

        total:
            document.getElementById(
                "sale-total"
            ),


        detailsModal:
            document.getElementById(
                "sale-details-modal"
            ),

        detailsCode:
            document.getElementById(
                "sale-details-code"
            ),

        detailsCustomer:
            document.getElementById(
                "details-customer"
            ),

        detailsDate:
            document.getElementById(
                "details-date"
            ),

        detailsStatus:
            document.getElementById(
                "details-status"
            ),

        detailsTotal:
            document.getElementById(
                "details-total"
            ),

        detailsTotalFooter:
            document.getElementById(
                "details-total-footer"
            ),

        detailsItemsBody:
            document.getElementById(
                "details-items-body"
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


    function shortId(id) {

        if (!id) {
            return "—";
        }


        return id.length > 8
            ? id.substring(0, 8)
            : id;

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

        const formatted =
            quantityFmt.format(
                Number(quantity)
            );


        return unit
            ? `${formatted} ${unit}`
            : formatted;

    }


    /* =====================================================
       PRODUTOS
       ===================================================== */

    function findProduct(id) {

        return products.find(
            product =>
                product.id === id
        );

    }


    function getProductUnit(id) {

        return (
            findProduct(id)
                ?.unitAbbreviation ||
            ""
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

        const todaySales =
            sales.filter(
                sale =>
                    isToday(
                        sale.createdAt
                    )
            );


        const revenueToday =
            todaySales.reduce(
                (total, sale) =>
                    total +
                    Number(
                        sale.totalAmount
                    ),
                0
            );


        const averageTicket =
            todaySales.length > 0
                ? revenueToday /
                todaySales.length
                : 0;


        elements.salesCount.textContent =
            quantityFmt.format(
                sales.length
            );


        elements.salesToday.textContent =
            quantityFmt.format(
                todaySales.length
            );


        elements.revenueToday.textContent =
            currencyFmt.format(
                revenueToday
            );


        elements.averageTicket.textContent =
            currencyFmt.format(
                averageTicket
            );


        [
            elements.salesCount,
            elements.salesToday,
            elements.revenueToday,
            elements.averageTicket

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

    function renderSales() {

        const term =
            elements.search
                .value
                .trim()
                .toLocaleLowerCase(
                    "pt-BR"
                );


        const filtered =
            sales.filter(
                sale => {

                    if (!term) {
                        return true;
                    }


                    const productsText =
                        (sale.items || [])
                            .map(
                                item =>
                                    item.productName
                            )
                            .join(" ");


                    const searchable =
                        `
                    ${sale.customerName || ""}
                    ${productsText}
                    ${sale.id}
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
                ? `${filtered.length} de ${sales.length} vendas encontradas`
                : `${sales.length} ${
                    sales.length === 1
                        ? "venda registrada"
                        : "vendas registradas"
                }`;


        if (
            filtered.length === 0
        ) {

            elements.body.innerHTML = `

        <tr class="empty-row">

          <td colspan="6">

            ${
                sales.length === 0
                    ? "Nenhuma venda registrada ainda."
                    : "Nenhuma venda corresponde à busca."
            }

          </td>

        </tr>

      `;


            return;

        }


        elements.body.innerHTML =
            filtered
                .map(
                    sale => {

                        const itemCount =
                            sale.items?.length ||
                            0;


                        return `

                    <tr>

                      <td class="movement-date">

                        ${escapeHtml(
                            formatDate(
                                sale.createdAt
                            )
                        )}

                      </td>


                      <td>

                        <strong class="table-primary">

                          ${escapeHtml(
                            sale.customerName ||
                            "Cliente não informado"
                        )}

                        </strong>


                        <span class="table-secondary">

                          #${escapeHtml(
                            shortId(
                                sale.id
                            )
                        )}

                        </span>

                      </td>


                      <td>

                        ${itemCount}

                        ${
                            itemCount === 1
                                ? "produto"
                                : "produtos"
                        }

                      </td>


                      <td class="num">

                        <strong>

                          ${escapeHtml(
                            currencyFmt.format(
                                Number(
                                    sale.totalAmount
                                )
                            )
                        )}

                        </strong>

                      </td>


                      <td>

                        ${getStatusBadge(
                            sale.status
                        )}

                      </td>


                      <td class="actions-col">

                        <button
                            class="table-action"
                            type="button"
                            data-action="details"
                            data-id="${sale.id}"
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
       OPÇÕES DE PRODUTOS
       ===================================================== */

    function getProductOptions() {

        return products
            .map(
                product => `

              <option value="${product.id}">

                ${escapeHtml(
                    product.name
                )}

                —
                ${escapeHtml(
                    currencyFmt.format(
                        Number(
                            product.salePrice
                        )
                    )
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
            .join("");

    }


    /* =====================================================
       LINHAS DA VENDA
       ===================================================== */

    function addSaleItemRow() {

        const row =
            document.createElement(
                "div"
            );


        row.className =
            "sale-item-row";


        row.innerHTML = `

      <div class="field sale-product-field">

        <label>
          Produto
        </label>

        <select
            class="sale-product-select"
            required
        >

          <option value="">
            Selecione o produto
          </option>

          ${getProductOptions()}

        </select>

      </div>


      <div class="field sale-quantity-field">

        <label>
          Quantidade
        </label>

        <input
            class="sale-product-quantity"
            type="number"
            min="0.001"
            step="0.001"
            inputmode="decimal"
            required
            placeholder="0"
        />

      </div>


      <div class="sale-item-info">

        <span>
          Preço
        </span>

        <strong class="sale-item-price">
          —
        </strong>

        <small class="sale-item-stock">
          Estoque: —
        </small>

      </div>


      <div class="sale-item-subtotal">

        <span>
          Subtotal
        </span>

        <strong>
          R$ 0,00
        </strong>

      </div>


      <button
          class="sale-remove-item"
          type="button"
          title="Remover produto"
          aria-label="Remover produto"
      >
        ×
      </button>

    `;


        elements.itemsContainer
            .appendChild(
                row
            );


        updateSaleTotal();

    }


    /*
     * Atualiza preço, estoque e subtotal
     * de uma linha.
     */
    function updateSaleItemRow(row) {

        const productSelect =
            row.querySelector(
                ".sale-product-select"
            );


        const quantityInput =
            row.querySelector(
                ".sale-product-quantity"
            );


        const priceElement =
            row.querySelector(
                ".sale-item-price"
            );


        const stockElement =
            row.querySelector(
                ".sale-item-stock"
            );


        const subtotalElement =
            row.querySelector(
                ".sale-item-subtotal strong"
            );


        const product =
            findProduct(
                productSelect.value
            );


        if (!product) {

            priceElement.textContent =
                "—";


            stockElement.textContent =
                "Estoque: —";


            subtotalElement.textContent =
                currencyFmt.format(0);


            updateSaleTotal();

            return;

        }


        priceElement.textContent =
            currencyFmt.format(
                Number(
                    product.salePrice
                )
            );


        stockElement.textContent =
            `Estoque: ${formatQuantity(
                product.quantityInStock,
                product.unitAbbreviation
            )}`;


        const quantity =
            Number(
                quantityInput.value
            );


        const validQuantity =
            Number.isFinite(quantity) &&
            quantity > 0
                ? quantity
                : 0;


        const subtotal =
            validQuantity *
            Number(
                product.salePrice
            );


        subtotalElement.textContent =
            currencyFmt.format(
                subtotal
            );


        /*
         * Dá um aviso visual quando
         * a quantidade ultrapassa o estoque.
         */
        if (
            validQuantity >
            Number(
                product.quantityInStock
            )
        ) {

            row.classList.add(
                "sale-item-invalid"
            );

        }
        else {

            row.classList.remove(
                "sale-item-invalid"
            );

        }


        updateSaleTotal();

    }


    /*
     * Soma todos os itens da venda.
     */
    function updateSaleTotal() {

        const rows =
            [
                ...elements.itemsContainer
                    .querySelectorAll(
                        ".sale-item-row"
                    )
            ];


        let total = 0;

        let quantityOfLines = 0;


        rows.forEach(
            row => {

                const productId =
                    row.querySelector(
                        ".sale-product-select"
                    ).value;


                const quantity =
                    Number(
                        row.querySelector(
                            ".sale-product-quantity"
                        ).value
                    );


                const product =
                    findProduct(
                        productId
                    );


                if (
                    product &&
                    Number.isFinite(quantity) &&
                    quantity > 0
                ) {

                    total +=
                        Number(
                            product.salePrice
                        ) *
                        quantity;


                    quantityOfLines++;

                }

            }
        );


        elements.itemsCount.textContent =
            String(
                quantityOfLines
            );


        elements.total.textContent =
            currencyFmt.format(
                total
            );

    }


    /* =====================================================
       MODAL DE VENDA
       ===================================================== */

    function openSaleModal() {

        elements.form.reset();


        hideAlert(
            elements.formError
        );


        elements.itemsContainer.innerHTML =
            "";


        /*
         * A venda precisa de pelo menos
         * um produto.
         */
        addSaleItemRow();


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


        elements.customer.focus();

    }


    function closeSaleModal() {

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


        if (
            !document.querySelector(
                ".modal-backdrop.show"
            )
        ) {

            document.body
                .classList
                .remove(
                    "modal-open"
                );

        }

    }


    /* =====================================================
       LER ITENS DA VENDA
       ===================================================== */

    function readSaleItems() {

        const rows =
            [
                ...elements.itemsContainer
                    .querySelectorAll(
                        ".sale-item-row"
                    )
            ];


        const items = [];


        for (
            const row of rows
            ) {

            const productId =
                row.querySelector(
                    ".sale-product-select"
                ).value;


            const quantity =
                Number(
                    row.querySelector(
                        ".sale-product-quantity"
                    ).value
                );


            if (!productId) {

                throw new Error(
                    "Selecione todos os produtos."
                );

            }


            if (
                !Number.isFinite(
                    quantity
                ) ||
                quantity <= 0
            ) {

                throw new Error(
                    "A quantidade dos produtos deve ser maior que zero."
                );

            }


            items.push({
                productId,
                quantity
            });

        }


        if (
            items.length === 0
        ) {

            throw new Error(
                "Adicione pelo menos um produto à venda."
            );

        }


        return items;

    }


    /* =====================================================
       VALIDAR VENDA
       ===================================================== */

    function validateSaleItems(items) {

        /*
         * O backend não aceita o mesmo produto
         * duas vezes na mesma venda.
         */
        const ids =
            items.map(
                item =>
                    item.productId
            );


        const uniqueIds =
            new Set(ids);


        if (
            uniqueIds.size !==
            ids.length
        ) {

            throw new Error(
                "O mesmo produto não pode aparecer duas vezes na venda."
            );

        }


        /*
         * Validação amigável de estoque.
         * O backend também valida.
         */
        for (
            const item of items
            ) {

            const product =
                findProduct(
                    item.productId
                );


            if (!product) {

                throw new Error(
                    "Um dos produtos selecionados não está disponível."
                );

            }


            if (
                item.quantity >
                Number(
                    product.quantityInStock
                )
            ) {

                throw new Error(
                    `Estoque insuficiente de "${product.name}". Disponível: ${formatQuantity(
                        product.quantityInStock,
                        product.unitAbbreviation
                    )}.`
                );

            }

        }

    }


    /* =====================================================
       REGISTRAR VENDA
       ===================================================== */

    async function createSale(event) {

        event.preventDefault();


        hideAlert(
            elements.formError
        );


        const customerName =
            elements.customer
                .value
                .trim();


        let items;


        try {

            items =
                readSaleItems();


            validateSaleItems(
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
            "Finalizando…";


        try {

            const request = {

                customerName:
                    customerName ||
                    null,

                items

            };


            await api.post(
                "/api/v1/sales",
                request
            );


            closeSaleModal();


            /*
             * Recarrega também produtos porque
             * o estoque acabou de ser reduzido.
             */
            await loadData();


            showSuccess(
                "Venda registrada com sucesso."
            );

        }
        catch (error) {

            showAlert(
                elements.formError,

                error.message ||
                "Não foi possível registrar a venda."
            );

        }
        finally {

            elements.submit.disabled =
                false;


            elements.submit.textContent =
                "Finalizar venda";

        }

    }


    /* =====================================================
       DETALHES DA VENDA
       ===================================================== */

    function openSaleDetails(
        saleId
    ) {

        const sale =
            sales.find(
                item =>
                    item.id ===
                    saleId
            );


        if (!sale) {
            return;
        }


        elements.detailsCode.textContent =
            `Venda #${shortId(
                sale.id
            )}`;


        elements.detailsCustomer.textContent =
            sale.customerName ||
            "Cliente não informado";


        elements.detailsDate.textContent =
            formatDate(
                sale.createdAt
            );


        elements.detailsStatus.textContent =
            getStatusLabel(
                sale.status
            );


        const formattedTotal =
            currencyFmt.format(
                Number(
                    sale.totalAmount
                )
            );


        elements.detailsTotal.textContent =
            formattedTotal;


        elements.detailsTotalFooter.textContent =
            formattedTotal;


        if (
            !sale.items ||
            sale.items.length === 0
        ) {

            elements.detailsItemsBody.innerHTML = `

        <tr class="empty-row">

          <td colspan="4">
            Nenhum produto registrado.
          </td>

        </tr>

      `;

        }
        else {

            elements.detailsItemsBody.innerHTML =
                sale.items
                    .map(
                        item => {

                            const unit =
                                getProductUnit(
                                    item.productId
                                );


                            return `

                      <tr>

                        <td>

                          <strong class="table-primary">

                            ${escapeHtml(
                                item.productName
                            )}

                          </strong>

                        </td>


                        <td class="num">

                          ${escapeHtml(
                                formatQuantity(
                                    item.quantity,
                                    unit
                                )
                            )}

                        </td>


                        <td class="num">

                          ${escapeHtml(
                                currencyFmt.format(
                                    Number(
                                        item.unitPrice
                                    )
                                )
                            )}

                        </td>


                        <td class="num">

                          <strong>

                            ${escapeHtml(
                                currencyFmt.format(
                                    Number(
                                        item.subtotal
                                    )
                                )
                            )}

                          </strong>

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


        document.body
            .classList
            .add(
                "modal-open"
            );

    }


    function closeSaleDetails() {

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

            document.body
                .classList
                .remove(
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
                sales,
                products

            ] = await Promise.all([

                api.get(
                    "/api/v1/sales"
                ),

                api.get(
                    "/api/v1/products"
                )

            ]);


            renderStats();

            renderSales();

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
            Não foi possível carregar as vendas.
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
        "new-sale-btn"
    ).addEventListener(
        "click",
        openSaleModal
    );


    document.getElementById(
        "sale-modal-close"
    ).addEventListener(
        "click",
        closeSaleModal
    );


    document.getElementById(
        "sale-form-cancel"
    ).addEventListener(
        "click",
        closeSaleModal
    );


    document.getElementById(
        "add-sale-item-btn"
    ).addEventListener(
        "click",
        addSaleItemRow
    );


    elements.form.addEventListener(
        "submit",
        createSale
    );


    /*
     * Eventos dinâmicos dos produtos.
     */
    elements.itemsContainer
        .addEventListener(
            "change",
            event => {

                if (
                    event.target
                        .classList
                        .contains(
                            "sale-product-select"
                        )
                ) {

                    const row =
                        event.target.closest(
                            ".sale-item-row"
                        );


                    updateSaleItemRow(
                        row
                    );

                }

            }
        );


    elements.itemsContainer
        .addEventListener(
            "input",
            event => {

                if (
                    event.target
                        .classList
                        .contains(
                            "sale-product-quantity"
                        )
                ) {

                    const row =
                        event.target.closest(
                            ".sale-item-row"
                        );


                    updateSaleItemRow(
                        row
                    );

                }

            }
        );


    /*
     * Remover produto da venda.
     */
    elements.itemsContainer
        .addEventListener(
            "click",
            event => {

                const button =
                    event.target.closest(
                        ".sale-remove-item"
                    );


                if (!button) {
                    return;
                }


                const rows =
                    elements.itemsContainer
                        .querySelectorAll(
                            ".sale-item-row"
                        );


                if (
                    rows.length <= 1
                ) {

                    showAlert(
                        elements.formError,
                        "A venda precisa ter pelo menos um produto."
                    );

                    return;

                }


                button
                    .closest(
                        ".sale-item-row"
                    )
                    .remove();


                hideAlert(
                    elements.formError
                );


                updateSaleTotal();

            }
        );


    /*
     * Pesquisa.
     */
    elements.search.addEventListener(
        "input",
        renderSales
    );


    /*
     * Detalhes.
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

                openSaleDetails(
                    button.dataset.id
                );

            }

        }
    );


    /*
     * Modal detalhes.
     */
    document.getElementById(
        "sale-details-close"
    ).addEventListener(
        "click",
        closeSaleDetails
    );


    document.getElementById(
        "sale-details-ok"
    ).addEventListener(
        "click",
        closeSaleDetails
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

                closeSaleModal();

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

                closeSaleDetails();

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
                event.key !==
                "Escape"
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

                closeSaleDetails();

            }
            else if (
                elements.modal
                    .classList
                    .contains(
                        "show"
                    )
            ) {

                closeSaleModal();

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
                // sessão pode já ter expirado
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

                if (
                    authenticated
                ) {

                    loadData();

                }

            }
        );

})();