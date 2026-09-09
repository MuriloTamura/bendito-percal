(function () {
  const navigation = [
    {
      section: "Visão geral",
      items: [
        {
          id: "dashboard",
          label: "Dashboard",
          href: "dashboard.html",
          icon: "grid",
        },
      ],
    },
    {
      section: "Operação",
      items: [
        {
          id: "products",
          label: "Produtos",
          href: "products.html",
          icon: "tag",
        },
        {
          id: "raw-materials",
          label: "Matérias-primas",
          href: "raw-materials.html",
          icon: "layers",
        },
        {
          id: "inventory",
          label: "Estoque",
          href: "inventory.html",
          icon: "archive",
        },
        {
          id: "production",
          label: "Produção",
          href: "production.html",
          icon: "tool",
        },
        { id: "sales", label: "Vendas", href: "sales.html", icon: "receipt" },
      ],
    },
    {
      section: "Sistema",
      items: [
        {
          id: "catalogs",
          label: "Cadastros",
          href: "catalogs.html",
          icon: "settings",
        },
      ],
    },
  ];

  const icons = {
    grid: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>',
    tag: '<path d="M20 13 11 22l-9-9V4h9z"/><circle cx="7" cy="9" r="1"/>',
    layers: '<path d="m12 2 10 5-10 5L2 7z"/><path d="m2 12 10 5 10-5M2 17l10 5 10-5"/>',
    archive: '<path d="M21 8v13H3V8M1 3h22v5H1z"/><path d="M10 12h4"/>',
    tool: '<path d="M14.7 6.3a4 4 0 0 0-5-5L7.4 3.6l3 3-3.7 3.7-3-3-2.4 2.4a4 4 0 0 0 5 5L14 22.4a2.1 2.1 0 0 0 3-3l-6.7-6.7"/>',
    receipt: '<path d="M6 2h12v20l-3-2-3 2-3-2-3 2z"/><path d="M9 7h6M9 11h6M9 15h3"/>',
    settings:
      '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.6v-.2h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1z"/>',
  };

  function svg(name) {
    return `<svg class="nav-icon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7">${icons[name]}</svg>`;
  }

  function applyBrand() {
    const config = window.APP_CONFIG;
    const brand = config.brand;
    const appearance = config.appearance;
    const root = document.documentElement;
    const tokens = {
      "--color-brand-primary": appearance.primaryColor,
      "--color-brand-primary-strong": appearance.primaryStrongColor,
      "--color-brand-primary-soft": appearance.primarySoftColor,
      "--color-brand-accent": appearance.accentColor,
      "--font-body": appearance.fontBody,
      "--font-display": appearance.fontDisplay,
      "--font-mono": appearance.fontMono,
      "--radius-sm": appearance.radiusSmall,
      "--radius-md": appearance.radiusMedium,
      "--radius-lg": appearance.radiusLarge,
    };
    Object.entries(tokens).forEach(([name, value]) => value && root.style.setProperty(name, value));
    document.title = `${document.title} · ${brand.name}`;
    document.querySelectorAll("[data-brand-name]").forEach((element) => (element.textContent = brand.name));
    document.querySelectorAll("[data-brand-tagline]").forEach((element) => (element.textContent = brand.tagline));
    document.querySelectorAll("[data-brand-short]").forEach((element) => (element.textContent = brand.shortName));
    if (brand.logo) {
      document.querySelectorAll(".brand-mark").forEach((element) => {
        element.innerHTML = `<img src="${brand.logo}" alt="">`;
        element.classList.add("has-logo");
      });
    }
    if (brand.favicon) {
      const favicon =
        document.querySelector('link[rel="icon"]') || document.head.appendChild(document.createElement("link"));
      favicon.rel = "icon";
      favicon.href = brand.favicon;
    }
  }

  function renderSidebar() {
    const sidebar = document.getElementById("app-sidebar");
    if (!sidebar) return;
    const currentPage = document.body.dataset.page;
    const links = navigation
      .map(
        (group) => `
      <div class="nav-group">
        <p class="nav-label">${group.section}</p>
        <ul>${group.items
          .map(
            (item) => `
          <li><a href="${item.href}" ${item.id === currentPage ? 'class="active" aria-current="page"' : ""}>${svg(item.icon)}<span>${item.label}</span></a></li>`,
          )
          .join("")}</ul>
      </div>`,
      )
      .join("");
    sidebar.innerHTML = `
      <div class="brand-lockup">
        <div class="brand-mark" aria-hidden="true"><span data-brand-short>SG</span></div>
        <div class="brand-copy"><strong data-brand-name>Sistema de Gestão</strong><small data-brand-tagline>Operação e controle</small></div>
      </div>
      <nav class="sidebar-nav" aria-label="Navegação principal">${links}</nav>
      <div class="sidebar-foot">
        <div class="sidebar-user"><span class="user-avatar" id="user-initial" aria-hidden="true">—</span><div><strong id="user-name">Carregando…</strong><span id="user-role"></span></div></div>
        <button class="logout-button" id="logout-btn" type="button" aria-label="Sair da aplicação" title="Sair">Sair</button>
      </div>`;
  }

  function renderMobileHeader() {
    const shell = document.querySelector(".app-shell");
    if (!shell) return;
    shell.insertAdjacentHTML(
      "afterbegin",
      `
      <header class="mobile-header">
        <button class="menu-button" id="menu-button" type="button" aria-controls="app-sidebar" aria-expanded="false"><span></span><span></span><span></span><span class="visually-hidden">Abrir menu</span></button>
        <strong data-brand-name>Sistema de Gestão</strong>
      </header>
      <button class="sidebar-scrim" id="sidebar-scrim" type="button" aria-label="Fechar menu"></button>`,
    );
  }

  async function initialize() {
    renderMobileHeader();
    renderSidebar();
    applyBrand();
    const sidebar = document.getElementById("app-sidebar");
    const menuButton = document.getElementById("menu-button");
    const closeMenu = () => {
      document.body.classList.remove("sidebar-open");
      menuButton?.setAttribute("aria-expanded", "false");
    };
    menuButton?.addEventListener("click", () => {
      const open = document.body.classList.toggle("sidebar-open");
      menuButton.setAttribute("aria-expanded", String(open));
    });
    document.getElementById("sidebar-scrim")?.addEventListener("click", closeMenu);
    sidebar?.addEventListener("click", (event) => event.target.closest("a") && closeMenu());
    document.getElementById("logout-btn")?.addEventListener("click", auth.logout);

    const user = await auth.requireUser();
    document.getElementById("user-name").textContent = user.name;
    document.getElementById("user-role").textContent = user.role === "ADMIN" ? "Administrador" : "Operador";
    document.getElementById("user-initial").textContent = user.name.trim().charAt(0).toUpperCase();
    window.dispatchEvent(new CustomEvent("app:user-ready", { detail: user }));
  }

  window.appLayout = Object.freeze({ applyBrand, initialize, navigation });
  initialize().catch((error) => {
    if (error.status !== 401 && error.status !== 403) console.error("Falha ao iniciar a aplicação", error);
  });
})();
