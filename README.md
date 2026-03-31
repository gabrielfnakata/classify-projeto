# Passo a passo para executar o projeto

**Para rodar o projeto é necessário ter o Docker e o plugin Docker Compose instalados.**

1. Na raiz do projeto, crie um arquivo `.env` e o preencha com os seguintes parâmetros:
```text
MYSQL_DATABASE=
MYSQL_USER=
MYSQL_PASSWORD=
MYSQL_ROOT_PASSWORD=

SPRING_DATASOURCE_URL=jdbc:mysql://db-mysql:3306/classify
SPRING_DATASOURCE_USERNAME=
SPRING_DATASOURCE_PASSWORD=
SPRING_APPLICATION_NAME=Classify
```
2. Ainda na raiz do projeto, abra um terminal.

3. Suba os _containers_ por meio do comando:
```bash
docker compose up --build -d
```

4. Para saber se todos os _containers_ estão rodando corretamente, utilize:
```bash
docker ps
```

5. Se tudo ocorreu bem até aqui, será possível acessar:
- O frontend em `http://localhost:3000`
- O backend, por meio de um cliente HTTP, em `http://localhost:8080`

## Acessando o Banco de Dados

Para conseguir acessar o banco de dados, entre na sua ferramenta de gerenciamento de banco de dados e crie uma nova conexão.

1. Caso haja a opção, conecte usando Host.
2. Insira como URL, a mesma do arquivo `.env`.
3. Servidor: `localhost`.
4. Porta: `3306`.
5. Insira o mesmo usuário e senha informados no `.env`.
6. Caso necessário, instale e configure o _driver_ do MySQL.