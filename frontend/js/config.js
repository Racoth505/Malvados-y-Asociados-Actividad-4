(function initConfig() {
  const defaultApiBaseUrl = "http://localhost:3000/api";
  const metaApiBaseUrl =
    document.querySelector('meta[name="api-base-url"]')?.content?.trim() || "";
  const windowApiBaseUrl =
    typeof window.API_BASE_URL === "string" ? window.API_BASE_URL.trim() : "";

  const apiBaseUrl = windowApiBaseUrl || metaApiBaseUrl || defaultApiBaseUrl;

  window.APP_CONFIG = {
    API_BASE_URL: apiBaseUrl.replace(/\/+$/, "")
  };
})();

