(function () {
  const form = document.getElementById("login-form");
  const errorBox = document.getElementById("login-error");
  const submitButton = document.getElementById("login-submit");
  const config = window.APP_CONFIG;
  const tokens = {
    "--color-brand-primary": config.appearance.primaryColor,
    "--color-brand-primary-strong": config.appearance.primaryStrongColor,
    "--color-brand-primary-soft": config.appearance.primarySoftColor,
    "--color-brand-accent": config.appearance.accentColor,
    "--font-body": config.appearance.fontBody,
    "--font-display": config.appearance.fontDisplay,
    "--font-mono": config.appearance.fontMono,
    "--radius-sm": config.appearance.radiusSmall,
    "--radius-md": config.appearance.radiusMedium,
    "--radius-lg": config.appearance.radiusLarge,
  };

  Object.entries(tokens).forEach(([name, value]) => document.documentElement.style.setProperty(name, value));
  document.title = `Entrar · ${config.brand.name}`;
  document.querySelectorAll("[data-brand-name]").forEach((element) => (element.textContent = config.brand.name));
  document.querySelectorAll("[data-brand-tagline]").forEach((element) => (element.textContent = config.brand.tagline));
  document.querySelectorAll("[data-brand-short]").forEach((element) => (element.textContent = config.brand.shortName));
  if (config.brand.logo) {
    const mark = document.querySelector(".brand-mark");
    mark.innerHTML = `<img src="${config.brand.logo}" alt="">`;
    mark.classList.add("has-logo");
  }
  if (config.brand.favicon) {
    const favicon = document.createElement("link");
    favicon.rel = "icon";
    favicon.href = config.brand.favicon;
    document.head.appendChild(favicon);
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    errorBox.classList.remove("show");
    submitButton.disabled = true;
    submitButton.textContent = "Entrando…";
    try {
      await auth.login({
        email: form.elements.email.value.trim(),
        password: form.elements.password.value,
      });
      const requestedPage = new URLSearchParams(window.location.search).get("returnTo");
      const destination = /^[a-z-]+\.html$/.test(requestedPage || "") ? requestedPage : "dashboard.html";
      window.location.replace(destination);
    } catch (error) {
      errorBox.textContent = error.message || "Não foi possível entrar. Tente novamente.";
      errorBox.classList.add("show");
      submitButton.disabled = false;
      submitButton.textContent = "Entrar";
      form.elements.email.focus();
    }
  });
})();
