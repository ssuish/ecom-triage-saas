#!/bin/sh
set -eu

export PORT="${PORT:-8080}"
export CSP_API_ORIGIN="${CSP_API_ORIGIN:-http://localhost:8080}"
envsubst '${PORT} ${CSP_API_ORIGIN}' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf
exec nginx -g 'daemon off;'
