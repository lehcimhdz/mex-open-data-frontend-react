#!/bin/sh
# Render /usr/share/nginx/html/env-config.js + the nginx config at boot
# so a single image can be reused across environments.

set -eu

BACKEND_URL=${BACKEND_URL:-http://mexdata-backend:8000}
PUBLIC_API_BASE_URL=${PUBLIC_API_BASE_URL:-/api}
PUBLIC_API_KEY=${PUBLIC_API_KEY:-}

cat > /usr/share/nginx/html/env-config.js <<EOF
window.__APP_CONFIG__ = {
  apiBaseUrl: "${PUBLIC_API_BASE_URL}",
  apiKey: "${PUBLIC_API_KEY}"
};
EOF

# Render BACKEND_URL into the nginx site config (token replace)
sed -i "s|\\\${BACKEND_URL}|${BACKEND_URL}|g" /etc/nginx/conf.d/default.conf

echo "env-config.js + nginx site rendered for BACKEND_URL=${BACKEND_URL}"
