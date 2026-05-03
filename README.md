# Passo a passo para executar o projeto

**Para rodar o projeto é necessário ter o Docker e o _plugin_ Docker Compose instalados.**

1. Na raiz do projeto, abra um terminal (Linux) ou o Git Bash (Windows):
```bash
bash script.sh
```

2. Preencha as perguntas do _script_, e, caso tudo seja preenchido corretamente, os contêineres subirão automaticamente.

3. Para saber se todos os contêineres estão rodando corretamente, utilize:
```bash
docker ps
```

4. Se todos os serviços estiverem rodando, será possível acessá-los usando as portas escolhidas no _script_.

5. Enquanto os contêineres estiverem rodando, será possível alterar o conteúdo do _frontend_ e _backend_ apenas modificando e salvando o arquivo, utilizando qualquer IDE ou editor de texto.

### Observação
- Não é necessário utilizar a extensão **Dev Containers** para utilizar a modificação em tempo real.
- Alterações em dependências ainda necessitam de _rebuild_, por meio do comando `just build`.

## Extensão Dev Containers

Caso não queira baixar as ferramentas como NodeJS ou JDK (Java), é possível utilizá-las diretamente do container Docker rodando. 

1. Abra o VSCode na raiz do projeto.
2. Baixe a extensão **Dev Containers** do VSCode.
3. Aperte `Ctrl + Shift + p`, digite e escolha a opção "**Dev Containers: Reopen in Container**". 
4. Duas opções aparecerão, uma para o _backend_ e outra para o _frontend_, escolha a que deseja utilizar.

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
Para acessar a documentação dos endpoints da API, enquanto os contêineres estiverem rodando, acesse: 
- `http://localhost:backendPort/swagger-ui/index.html`