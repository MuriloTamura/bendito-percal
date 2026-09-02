(function () {
  const cfg = window.APP_CONFIG || {};

  document.getElementById("brand-name").textContent = cfg.companyName || "Sistema de Gestão";
  document.getElementById("brand-tagline").textContent = cfg.companyTagline || "";
  document.getElementById("brand-initial").textContent = (cfg.companyName || "S").trim().charAt(0).toUpperCase();

  const currencyFmt = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
  const numberFmt = new Intl.NumberFormat("pt-BR");
  const dateTimeFmt = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
  const weekdayFmt = new Intl.DateTimeFormat("pt-BR", { weekday: "short" });

  function setText(field, value) {
    document.querySelectorAll(`[data-field="${field}"]`).forEach((el) => {
      el.textContent = value;
      el.classList.remove("skeleton");
    });
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str ?? "";
    return div.innerHTML;
  }

  async function loadUser() {
    try {
      const user = await api.get("/api/v1/auth/me");
      document.getElementById("user-name").textContent = user.name;
      document.getElementById("user-role").textContent = user.role === "ADMIN" ? "Administrador" : "Operador";
    } catch (err) {
      // Sem sessão válida — volta para o login
      window.location.replace("login.html");
    }
  }

  function renderRecentSales(sales) {
    const body = document.getElementById("recent-sales-body");
    if (!sales || sales.length === 0) {
      body.innerHTML = `<tr class="empty-row"><td colspan="3">Nenhuma venda registrada ainda.</td></tr>`;
      return;
    }
    body.innerHTML = sales
      .map(
        (sale) => `
        <tr>
          <td>${escapeHtml(sale.customerName || "Cliente não informado")}</td>
          <td class="num">${currencyFmt.format(sale.totalAmount)}</td>
          <td>${dateTimeFmt.format(new Date(sale.createdAt))}</td>
        </tr>`
      )
      .join("");
  }

  function renderLowStock(items) {
    const body = document.getElementById("low-stock-body");
    if (!items || items.length === 0) {
      body.innerHTML = `<tr class="empty-row"><td colspan="3">Nenhum item abaixo do estoque mínimo. 🎉</td></tr>`;
      return;
    }
    body.innerHTML = items
      .map((item) => {
        const typeLabel = item.itemType === "PRODUCT" ? "Produto" : "Matéria-prima";
        return `
        <tr>
          <td>${escapeHtml(item.name)}<br><span class="muted" style="font-size:11px;">${typeLabel}</span></td>
          <td class="num">${numberFmt.format(item.quantityInStock)} ${escapeHtml(item.unit || "")}</td>
          <td><span class="badge low">baixo</span></td>
        </tr>`;
      })
      .join("");
  }

  function renderTopProducts(products) {
    const body = document.getElementById("top-products-body");
    if (!products || products.length === 0) {
      body.innerHTML = `<tr class="empty-row"><td colspan="2">Sem vendas no período.</td></tr>`;
      return;
    }
    body.innerHTML = products
      .map(
        (item) => `
        <tr>
          <td>${escapeHtml(item.productName)}</td>
          <td class="num">${numberFmt.format(item.quantitySold)}</td>
        </tr>`
      )
      .join("");
  }

  function renderWeekChart(days) {
    const chart = document.getElementById("week-chart");
    const total = (days || []).reduce((sum, d) => sum + Number(d.revenue || 0), 0);
    document.getElementById("week-total").textContent = currencyFmt.format(total);

    if (!days || days.length === 0) {
      chart.innerHTML = `<span class="skeleton">Sem dados no período.</span>`;
      return;
    }

    const max = Math.max(1, ...days.map((d) => Number(d.revenue || 0)));
    chart.innerHTML = days
      .map((day) => {
        const heightPct = Math.max(3, Math.round((Number(day.revenue || 0) / max) * 100));
        const label = weekdayFmt.format(new Date(day.date + "T00:00:00"));
        return `
        <div class="bar-col" title="${currencyFmt.format(day.revenue)}">
          <div class="bar" style="height:${heightPct}%"></div>
          <span class="bar-day">${label}</span>
        </div>`;
      })
      .join("");
  }

  async function loadDashboard() {
    try {
      const data = await api.get("/api/v1/dashboard");

      document.getElementById("generated-at").textContent =
        "Atualizado às " + dateTimeFmt.format(new Date(data.generatedAt));

      setText("sales-count", numberFmt.format(data.today.salesCount));
      setText("sales-items", `${numberFmt.format(data.today.itemsSold)} itens vendidos`);
      setText("revenue", currencyFmt.format(data.today.revenue));
      setText("productions", numberFmt.format(data.productionsToday));

      setText("active-products", numberFmt.format(data.inventory.activeProducts));
      setText("active-products-hint", `${data.inventory.lowStockProducts} com estoque baixo`);
      setText("active-raw", numberFmt.format(data.inventory.activeRawMaterials));
      setText("active-raw-hint", `${data.inventory.lowStockRawMaterials} com estoque baixo`);
      setText("low-stock-total", numberFmt.format(data.inventory.lowStockProducts + data.inventory.lowStockRawMaterials));

      renderRecentSales(data.recentSales);
      renderLowStock(data.lowStockItems);
      renderTopProducts(data.topProductsLastThirtyDays);
      renderWeekChart(data.salesLastSevenDays);
    } catch (err) {
      if (err.status === 401) {
        window.location.replace("login.html");
        return;
      }
      document.getElementById("recent-sales-body").innerHTML =
        `<tr class="empty-row"><td colspan="3">Não foi possível carregar os dados: ${escapeHtml(err.message)}</td></tr>`;
    }
  }

  document.getElementById("logout-btn").addEventListener("click", async () => {
    try {
      await api.post("/api/v1/auth/logout");
    } catch (err) {
      // mesmo se a chamada falhar, ainda mandamos para o login
    }
    window.location.replace("login.html");
  });

  loadUser();
  loadDashboard();
})();
