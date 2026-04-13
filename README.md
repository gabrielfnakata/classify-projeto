# Passo a passo para executar o projeto

**Para rodar o projeto é necessário ter o Docker e o _plugin_ Docker Compose instalados.**

1. Na raiz do projeto, abra um terminal (Linux) ou o Git Bash (Windows):
```bash
bash script.sh  # Linux

sh script.sh    # Windows
```

2. Preencha as perguntas do _script_, e, caso tudo seja preenchido corretamente, os _containers_ subirão automaticamente.

3. Para saber se todos os _containers_ estão rodando corretamente, utilize:
```bash
docker ps
```

4. Se todos os serviços estiverem rodando, será possível acessá-los usando as portas escolhidas no _script_.

## Acessando o Banco de Dados

Para conseguir acessar o banco de dados, entre na sua ferramenta de gerenciamento de banco de dados e crie uma nova conexão.

1. Caso haja a opção, conecte usando Host.
2. Servidor: `localhost`.
3. Porta: _**PORTA**_ escolhida no _script_.
4. Insira o mesmo usuário e senha informados no _script_.
5. Caso necessário, instale e configure o _driver_ do **MySQL**.

## Cliente HTTP
É necessário cadastrar um usuário para poder fazer requisições, crie-o em **POST** `/employee`. Em seguida, faça outra requisição para **POST** `/auth/login`
e utilize o recém-gerado `acessToken` em `Auth` > `Bearer token`.

Ao utilizar clientes HTTP, caso apareça o erro de _status_ 415 - "_Unsupported Media Type_", defina nos _headers_ da requisição:
|     Name     |      Value       |
|--------------|------------------|
| Content-Type | application/json |

## Documentação da API
Para acessar a documentação dos endpoints da API, enquanto os _containers_ estiverem rodando, acesse: 
- `http://localhost:backendPort/swagger-ui/index.html`

### Observação
Se ao instalar o projeto, o VSCode acusar o erro:

> This JSX tag requires the module path 'react/jsx-runtime' to exist, but none could be found. Make sure you have types for the appropriate package installed.

Em `/frontend`, digite o comando: `npm install --save-dev @types/react @types/react-dom`