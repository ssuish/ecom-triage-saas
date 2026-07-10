# ---- Build stage ----
FROM node:22-alpine AS build
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9.15.9 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
RUN pnpm install --frozen-lockfile

COPY . .
ARG VITE_API_URL=http://localhost:8080
ARG VITE_CLERK_PUBLISHABLE_KEY=
ARG VITE_API_KEY=
ARG VITE_TALLY_FORM_ID=
ARG VITE_WAITLIST_COUNT=
RUN test -n "$VITE_API_KEY" || (echo "VITE_API_KEY build arg is required" >&2 && exit 1)
ENV VITE_API_URL=$VITE_API_URL \
    VITE_CLERK_PUBLISHABLE_KEY=$VITE_CLERK_PUBLISHABLE_KEY \
    VITE_API_KEY=$VITE_API_KEY \
    VITE_TALLY_FORM_ID=$VITE_TALLY_FORM_ID \
    VITE_WAITLIST_COUNT=$VITE_WAITLIST_COUNT
RUN pnpm run build

# ---- Serve stage ----
FROM nginx:1.27-alpine
ARG VITE_API_URL=http://localhost:8080
ENV CSP_API_ORIGIN=$VITE_API_URL
RUN apk add --no-cache gettext
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf.template /etc/nginx/templates/default.conf.template
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh
EXPOSE 8080
ENTRYPOINT ["/docker-entrypoint.sh"]
