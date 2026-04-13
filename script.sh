#!/bin/bash

generate_jwt() {
    if command -v openssl &> /dev/null; then
        openssl rand -base64 32
    elif command -v python3 &> /dev/null; then
        python3 -c "import secrets; print(secrets.token_urlsafe(32))"
    elif command -v node &> /dev/null; then
        node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
    else
        date +%s | sha256sum | base64 | head -c 32
    fi
}

askUser() {
	echo "- - - Banco de Dados - - -"
	read -rp "Digite seu nome de usuário: " dbUser
	read -rsp "Digite sua senha do usuário padrão: " dbPassword
	echo ""
	read -rsp "Digite sua senha de usuário root: " dbRootPassword
	echo ""
	read -rp "Em qual porta gostaria que o serviço rodasse (vazio para usar o padrão): " dbPort

	echo ""
	echo "- - - Backend - - -"
	read -rp "Digite um JWT (Em branco para gerar aleatóriamente): " backJwtSecret
	read -rp "Em qual porta gostaria que o serviço rodasse (vazio para usar o padrão): " backPort

	echo ""
	echo "- - - Frontend - - -"
	read -rp "Em qual porta gostaria que o serviço rodasse (vazio para usar o padrão): " frontPort

	echo "
#MySQL
MYSQL_USER=${dbUser}
MYSQL_PASSWORD=${dbPassword}
MYSQL_ROOT_PASSWORD=${dbRootPassword}
MY_SQL_PORT=${dbPort:-3036}

#Backend
JWT_SECRET=${backJwtSecret:-$(generate_jwt)}
BACKEND_PORT=${backPort:-8080}
SPRING_DATASOURCE_URL=jdbc:mysql://db-mysql:3306/classify?createDatabaseIfNotExist=true&characterEncoding=UTF-8&serverTimezone=America/Sao_Paulo&useSSL=false&allowPublicKeyRetrieval=true
CORS_ALLOWED_ORIGINS=http://localhost:${frontPort:-3000}

#Frontend
FRONTEND_PORT=${frontPort:-3000}
	" > .env
}

if [ ! -f ".env" ]; then
	askUser
fi

echo "Iniciando containers..."
sudo docker compose up --build -d
