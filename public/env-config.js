// Runtime configuration overrides — the nginx entrypoint rewrites this file
// at container startup so the same image can be reused across environments.
window.__APP_CONFIG__ = window.__APP_CONFIG__ || {};
