# Exibe a lista de comandos
default:
    just --list

# Sobe todos os contêineres em modo desenvolvimento
up:
    docker compose up -d

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

# Exibe as informações dos contêineres rodando
ps:
    docker ps

# Exibe a URL da documentação Swagger da API
doc:
    echo "http://localhost:8080/swagger-ui/index.html"

