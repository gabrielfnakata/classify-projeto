# Exibe a lista de comandos
default:
    just --list

# Sobe todos os contêineres em modo desenvolvimento
up:
    docker compose up -d

# Para todos os contêineres e apaga o banco
clean:
    docker compose down -v

# Subir apenas o front
front:
    docker compose up -d frontend

# Subir o banco e o backend
back:
    docker compose up -d db backend

# Rebuilda o projeto (mudança de Dockerfile, package.json ou pom.xml)
build:
    docker compose up --build -d

# Exibe os logs do backend
log-b:
    docker compose logs -f backend

# Para todos os contêineres
down:
    docker compose down

# Exibe as informações de todos os contêineres
ps:
    docker ps -a

# Exibe a URL da documentação Swagger da API
doc:
    echo "http://localhost:8080/swagger-ui/index.html"

