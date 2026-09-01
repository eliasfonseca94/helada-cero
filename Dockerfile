# syntax=docker/dockerfile:1

# ---- Etapa 1: build ---------------------------------------------------------
# Vite incrusta VITE_API_BASE_URL en el JS en tiempo de build (no de
# ejecución): por eso es un build ARG y no una variable de entorno del
# contenedor final — este es un sitio estático, no tiene "runtime" propio.
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
ARG VITE_API_BASE_URL=http://localhost:8080
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
RUN npm run build

# ---- Etapa 2: runtime ---------------------------------------------------------
# nginx sirviendo los archivos estáticos ya compilados. Sin código propio
# corriendo en el contenedor final: nada de Node, nada de npm.
FROM nginx:alpine AS runtime
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
