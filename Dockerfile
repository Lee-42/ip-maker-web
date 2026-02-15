FROM node:20-alpine AS builder

ARG VITE_WOWNOW_API_BASE
ARG VITE_WOWNOW_CHAT_BASE
ARG VITE_WOWNOW_NFC_BASE
ARG VITE_GOOGLE_CLIENT_ID
ARG VITE_CAPGO_UPDATE_URL

ENV VITE_WOWNOW_API_BASE=$VITE_WOWNOW_API_BASE
ENV VITE_WOWNOW_CHAT_BASE=$VITE_WOWNOW_CHAT_BASE
ENV VITE_WOWNOW_NFC_BASE=$VITE_WOWNOW_NFC_BASE
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID
ENV VITE_CAPGO_UPDATE_URL=$VITE_CAPGO_UPDATE_URL

WORKDIR /app
ARG PNPM_VERSION=9.15.4
ENV PNPM_HOME="/root/.local/share/pnpm"
ENV PATH="${PNPM_HOME}:${PATH}"
RUN corepack enable && corepack prepare "pnpm@${PNPM_VERSION}" --activate

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm run build

FROM nginx:1.27-alpine

RUN apk add --no-cache curl

COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=builder /app/dist /usr/share/nginx/html

ENV BACKEND_HOST=backend
ENV BACKEND_PORT=8000

RUN printf '#!/bin/sh\n\
set -e\n\
\n\
BACKEND_HOST=${BACKEND_HOST:-backend}\n\
BACKEND_PORT=${BACKEND_PORT:-8000}\n\
\n\
echo "Starting nginx with backend: $BACKEND_HOST:$BACKEND_PORT"\n\
sed -i "s|backend:8000|${BACKEND_HOST}:${BACKEND_PORT}|g" /etc/nginx/nginx.conf\n\
exec nginx -g "daemon off;"\n' > /docker-entrypoint.sh && \
  chmod +x /docker-entrypoint.sh

EXPOSE 80

CMD ["/docker-entrypoint.sh"]
