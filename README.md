# Como executar o projeto com Docker

Passo a passo (modo recomendado: usando docker compose)

1. Abra um terminal na raiz do repositório.

2. Subir os containers (reconstrói imagens se necessário):

   - Com o plugin moderno:
     ```
     docker compose up --build -d
     ```
   - Se der erro, tenta:
     ```
     docker-compose up --build -d
     ```

3. Verificar status:
```
docker ps
```

4. Vai no navegador e digite:
    - Backend:
    ```
    http://localhost:8080
    ```

    - Frontend:
    ```
    http://localhost:3000
    ```

5. Pra tentar acessar o banco de dados precisa ser por algum programa de administrar banco de dados 
    - se souber como configura é na porta http://localhost:3000
    - se não souber me dá um toque