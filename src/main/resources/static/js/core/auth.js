(function () {
  let currentUserPromise;

  function redirectToLogin() {
    const returnTo = encodeURIComponent(window.location.pathname.split("/").pop() || "dashboard.html");
    window.location.replace(`login.html?returnTo=${returnTo}`);
  }

  window.addEventListener("api:unauthorized", () => {
    if (!window.location.pathname.endsWith("/login.html")) redirectToLogin();
  });

  async function requireUser() {
    if (!currentUserPromise) {
      currentUserPromise = api.get("/api/v1/auth/me").catch((error) => {
        currentUserPromise = undefined;
        if (error.status === 401 || error.status === 403) redirectToLogin();
        throw error;
      });
    }
    return currentUserPromise;
  }

  async function login(credentials) {
    const user = await api.post("/api/v1/auth/login", credentials);
    currentUserPromise = Promise.resolve(user);
    return user;
  }

  async function logout() {
    try {
      await api.post("/api/v1/auth/logout");
    } finally {
      currentUserPromise = undefined;
      window.location.replace("login.html");
    }
  }

  window.auth = Object.freeze({ login, logout, requireUser });
})();
