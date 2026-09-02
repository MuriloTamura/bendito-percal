/**
 * config.js — a segunda metade da identidade white-label (a primeira é theme.css).
 *
 * Numa nova implantação (novo cliente), troque os valores abaixo.
 * apiBaseUrl vazio ("") significa "mesma origem" — funciona porque o
 * frontend é servido pelo próprio Spring Boot (src/main/resources/static).
 * Se um dia o frontend for hospedado separado da API, defina a URL completa
 * aqui (ex: "https://api.clientex.com.br") e configure CORS no backend.
 */
window.APP_CONFIG = {
  companyName: "Sistema de Gestão",
  companyTagline: "Gerencie sua empresa",
  apiBaseUrl: "",
};
