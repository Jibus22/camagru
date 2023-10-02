FROM node:18-buster-slim AS build
WORKDIR /app
COPY package* vite.config.js ./
RUN npm ci
COPY src ./src
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY ./nginx/config/nginx.conf /etc/nginx/conf.d
COPY ./nginx/ssl /etc/nginx/ssl
