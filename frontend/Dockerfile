# Configuração da build do React
FROM node:20 AS build_react

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

# Configuração do Nginx
FROM nginx:stable-alpine

COPY --from=build_react /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]