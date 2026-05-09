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
    read -rp "Digite a porta para rodar o banco (Em branco para rodar a padrão: 3306): " dbPort

	echo ""
	echo "- - - Backend - - -"
    read -rp "Digite a porta para rodar o backend (Em branco para rodar a padrão: 8080): " backPort
	read -rp "Digite um JWT (Em branco para gerar aleatóriamente): " backJwtSecret

    echo ""
    echo "- - - Frontend - - -"
    read -rp "Digite a porta para rodar o frontend (Em branco para rodar a padrão: 5173): " frontPort

	echo "
# MySQL
MYSQL_USER=${dbUser}
MYSQL_PASSWORD=${dbPassword}
MYSQL_ROOT_PASSWORD=${dbRootPassword}
MYSQL_PORT=${dbPort:-3306}

# Backend
JWT_SECRET=${backJwtSecret:-$(generate_jwt)}
BACK_PORT=${backPort:-8080}

# Frontend
FRONT_PORT=${frontPort:-5173}
VITE_API_URL=http://localhost:${backPort:-8080}
	" > .env
}

start_docker () {
    echo "Iniciando contêineres..."

    if docker compose up --build -d >/dev/null 2>&1; then
        echo "Aplicação rodando"
    else
        echo "Erro ao subir aplicação!"
    fi
}

askUser
start_docker