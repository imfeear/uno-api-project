# UNO API + Frontend React

## Visão geral

Este projeto implementa um jogo de UNO com:

- **Backend** em **Node.js + Express**
- **Banco de dados PostgreSQL** com **Sequelize**
- **Autenticação JWT**
- **Comunicação em tempo real** com **Socket.IO**
- **Frontend** em **React + Vite**
- **Documentação da API** com **Swagger**

O sistema cobre desde o cadastro e login de usuários até a criação de lobbies, entrada em partidas, início do jogo, jogadas em tempo real, declaração de UNO e consulta de scores.

---

## O que o sistema faz

O projeto foi dividido em duas partes principais:

### Backend
Responsável por:

- autenticação de usuários
- gerenciamento de lobbies
- controle da lógica do jogo
- persistência de dados no PostgreSQL
- emissão de eventos em tempo real via Socket.IO
- documentação Swagger
- endpoints REST para CRUD e ações do jogo

### Frontend
Responsável por:

- registro e login
- visualização do lobby
- entrada em salas
- acompanhamento da partida em tempo real
- visualização do perfil do usuário
- consulta de scores

---

## Estrutura do projeto

```text
project/
├── src/                         # Backend
│   ├── app.js                   # Configuração principal do Express
│   ├── server.js                # Inicialização do servidor HTTP + Socket.IO
│   ├── config/                  # Configurações (cache, db, swagger)
│   ├── controllers/             # Camada de entrada HTTP
│   ├── middlewares/             # Autenticação, cache, tratamento de erro
│   ├── models/                  # Modelos Sequelize e relacionamentos
│   ├── realtime/                # Socket.IO e eventos em tempo real
│   ├── repositories/            # Acesso a dados
│   ├── routes/                  # Rotas da API
│   ├── services/                # Regras de negócio
│   ├── tests/                   # Testes automatizados
│   ├── utils/                   # Utilitários auxiliares
│   └── validators/              # Validações específicas
│
├── frontend/                    # Frontend React + Vite
│   ├── src/
│   │   ├── api/                 # Chamadas para a API
│   │   ├── components/          # Componentes reutilizáveis
│   │   ├── context/             # Contextos de autenticação e socket
│   │   └── pages/               # Páginas da aplicação
│   └── package.json
│
├── docker-compose.yml           # PostgreSQL via Docker
├── .env.example                 # Exemplo de variáveis de ambiente
├── package.json                 # Dependências do backend
└── README.md
```

---

## Tecnologias utilizadas

### Backend
- Node.js
- Express
- Sequelize
- PostgreSQL
- JWT (`jsonwebtoken`)
- `bcryptjs`
- Socket.IO
- Swagger (`swagger-jsdoc`, `swagger-ui-express`)
- Jest

### Frontend
- React
- React Router
- Vite
- Socket.IO Client

---

## Requisitos para rodar o projeto

Você precisa ter instalado:

- **Node.js**
- **npm**
- **PostgreSQL**

Opcionalmente:

- **Docker** e **Docker Compose**, se quiser subir o banco por container

---

## Variáveis de ambiente

Arquivo de exemplo:

```env
PORT=3000

DB_HOST=localhost
DB_PORT=5432
DB_NAME=uno_api_js
DB_USER=postgres
DB_PASSWORD=postgres
DB_SSL=false
DB_SYNC_ALTER=true

JWT_SECRET=change_me
```

### Atenção importante
No arquivo `docker-compose.yml`, o PostgreSQL está exposto assim:

```yml
ports:
  - "5433:5432"
```

Ou seja:

- **porta interna do container**: `5432`
- **porta da sua máquina**: `5433`

Se você usar Docker, o seu `.env` deve ficar com:

```env
DB_PORT=5433
```

Se você usar um PostgreSQL instalado localmente na máquina e ele estiver na porta padrão, então use:

```env
DB_PORT=5432
```

---

## Como rodar o backend

### Opção 1: com PostgreSQL em Docker

1. Suba o banco:

```bash
docker compose up -d
```

2. Crie um arquivo `.env` na raiz do projeto com base no `.env.example`

3. Ajuste a porta do banco:

```env
DB_PORT=5433
```

4. Instale as dependências do backend:

```bash
npm install
```

5. Inicie a API:

```bash
npm run dev
```

ou

```bash
npm start
```

### Opção 2: com PostgreSQL local

1. Crie um banco chamado:

```text
uno_api_js
```

2. Configure o `.env` com os dados corretos da sua instância local

3. Instale as dependências:

```bash
npm install
```

4. Rode o projeto:

```bash
npm run dev
```

---

## Como rodar o frontend

Entre na pasta do frontend:

```bash
cd frontend
```

Instale as dependências:

```bash
npm install
```

Rode o servidor de desenvolvimento:

```bash
npm run dev
```

O frontend usa, por padrão, a API em:

```text
http://localhost:3000/api
```

E normalmente o Vite sobe em:

```text
http://localhost:5173
```

---

## URLs importantes

Com o backend rodando:

- API base: `http://localhost:3000`
- API REST: `http://localhost:3000/api`
- Health check: `http://localhost:3000/health`
- Swagger UI: `http://localhost:3000/unoAPI`
- Página HTML de teste realtime: `http://localhost:3000/realtime.html`

Com o frontend rodando:

- Frontend React: `http://localhost:5173`

---

## Como a aplicação inicializa

A inicialização principal está em `src/server.js`.

Fluxo de inicialização:

1. carrega as variáveis de ambiente
2. conecta no banco de dados
3. sincroniza os modelos Sequelize
4. cria o servidor HTTP
5. inicializa o Socket.IO
6. sobe a aplicação na porta definida

Na inicialização, o sistema também imprime no terminal:

- URL da API
- URL do Swagger
- URL da página de testes realtime

---

## Como o backend está organizado

O backend segue uma separação por camadas simples:

### Routes
Recebem as rotas HTTP e encaminham para os controllers.

### Controllers
Recebem `req` e `res`, extraem dados da requisição e chamam os services.

### Services
Contêm a regra de negócio principal.

### Repositories
Centralizam o acesso aos dados via Sequelize.

### Models
Definem as tabelas, campos e relacionamentos.

### Middlewares
Trabalham autenticação, cache e tratamento de erro.

---

## Modelos principais do banco

### `User`
Representa o usuário autenticado do sistema.

Campos principais:

- `id`
- `username`
- `email`
- `passwordHash` (persistido no campo `password`)

### `Game`
Representa uma partida ou lobby.

Campos principais:

- `id`
- `title`
- `rules`
- `status`
- `maxPlayers`
- `creatorId`
- `currentPlayerIndex`
- `startedAt`

### `PlayerGame`
Tabela de associação entre usuários e partidas.

Ela registra, por exemplo:

- em qual jogo o usuário entrou
- se ele está pronto (`isReady`)

### `GameState`
Guarda o estado da partida em tempo real.

Campos principais:

- `deck`
- `discardPile`
- `direction`
- `currentPlayerIndex`
- `started`
- `winnerUserId`

### `PlayerHand`
Guarda a mão de cartas de cada jogador dentro de uma partida.

Campos principais:

- `gameId`
- `userId`
- `cards`
- `mustDeclareUno`
- `unoDeclared`

### `Score`
Guarda a pontuação persistida no banco.

Campos principais:

- `playerId`
- `gameId`
- `score`

### `Player`
Existe como entidade separada para o CRUD clássico de players.

Observação importante: o fluxo principal do jogo em tempo real usa fortemente **User + PlayerGame + PlayerHand**, enquanto a entidade `Player` aparece mais no CRUD tradicional e no vínculo de scores já persistidos.

---

## Relacionamentos principais

O arquivo `src/models/index.js` define as associações.

Principais relações:

- `User hasMany PlayerGame`
- `Game hasMany PlayerGame`
- `User belongsToMany Game through PlayerGame`
- `Game belongsToMany User through PlayerGame`
- `Game hasOne GameState`
- `Game hasMany PlayerHand`
- `User hasMany PlayerHand`
- `Player hasMany Score`
- `Game hasMany Score`

---

## Autenticação

A autenticação usa **JWT**.

### Registro
Endpoint:

```http
POST /api/auth/register
```

Body:

```json
{
  "username": "bruno",
  "email": "bruno@email.com",
  "password": "123456"
}
```

O serviço:

- valida campos obrigatórios
- verifica se username já existe
- verifica se email já existe
- gera hash com `bcryptjs`
- salva o usuário

### Login
Endpoint:

```http
POST /api/auth/login
```

Body:

```json
{
  "username": "bruno",
  "password": "123456"
}
```

Resposta esperada:

```json
{
  "access_token": "..."
}
```

### Logout
Endpoint:

```http
POST /api/auth/logout
```

Body:

```json
{
  "access_token": "..."
}
```

Observação importante: o logout usa uma **blacklist em memória** (`Set`).

Isso significa que:

- o token passa a ser inválido para a instância atual da aplicação
- se o servidor reiniciar, essa blacklist é perdida
- o token não é invalidado de forma persistente no banco

### Rotas protegidas
O middleware `authMiddleware` aceita token de duas formas:

1. no header:

```http
Authorization: Bearer SEU_TOKEN
```

2. no body, via `access_token`

---

## Perfil do usuário

Endpoint:

```http
GET /api/users/profile
```

ou

```http
POST /api/users/profile
```

O sistema localiza o usuário pelo token e retorna:

- id
- username
- email

---

## Fluxo principal do lobby

O lobby é a área de preparação da partida.

### Criar lobby
```http
POST /api/game-lobby/create
```

Body:

```json
{
  "name": "Sala do Bruno",
  "rules": "Regras padrão",
  "max_players": 4
}
```

Ao criar:

- o jogo é salvo com status `waiting`
- o criador entra automaticamente no lobby
- um evento em tempo real é disparado

### Entrar em lobby
```http
POST /api/game-lobby/join
```

Body:

```json
{
  "game_id": 1
}
```

Validações importantes:

- o jogo precisa existir
- o jogo não pode estar finalizado
- o usuário não pode já estar na sala
- a sala não pode estar cheia

### Marcar como pronto
```http
POST /api/game-lobby/ready
```

### Iniciar partida
```http
POST /api/game-lobby/start
```

Regras importantes:

- somente o criador pode iniciar
- o jogo precisa existir
- o jogo não pode já estar em andamento nem finalizado
- precisa haver ao menos 2 jogadores
- todos precisam estar prontos

Quando a partida começa:

- o status vai para `in_progress`
- `startedAt` é preenchido
- a lógica do jogo em tempo real é inicializada

### Sair do lobby/jogo
```http
POST /api/game-lobby/leave
```

### Encerrar jogo
```http
POST /api/game-lobby/end
```

### Consultar estado do lobby
```http
POST /api/game-lobby/state
```

---

## Fluxo principal da partida em tempo real

As rotas de tempo real ficam em:

```text
/api/realtime-game
```

### Consultar estado do jogo
```http
POST /api/realtime-game/state
```

Retorna a visão da partida para o usuário autenticado.

### Jogar carta
```http
POST /api/realtime-game/play
```

Body:

```json
{
  "game_id": 1,
  "card_index": 0,
  "chosen_color": "red"
}
```

`chosen_color` é usado quando a carta exige escolha de cor.

### Comprar carta
```http
POST /api/realtime-game/draw
```

Body:

```json
{
  "game_id": 1
}
```

### Declarar UNO
```http
POST /api/realtime-game/uno
```

Body:

```json
{
  "game_id": 1
}
```

Regra importante:

- só pode declarar UNO quando estiver com exatamente 1 carta na mão

---

## Socket.IO e eventos em tempo real

O servidor de socket é inicializado em `src/realtime/socketServer.js`.

### Autenticação do socket
O socket usa o mesmo token JWT da API.

Ele pode ser enviado em:

- `socket.handshake.auth.token`
- header `Authorization: Bearer ...`

### Salas usadas pelo socket
Ao conectar:

- o usuário entra automaticamente em `user:{id}`

Ao entrar em uma partida:

- o cliente entra em `game:{gameId}`

### Eventos importantes emitidos pelo backend

- `connected`
- `game_created`
- `lobby_snapshot`
- `game_event`
- `game_state`
- `private_game_state`
- `chat_message`
- `room_joined`
- `room_left`
- `room_error`

### Eventos recebidos do cliente

- `join_game_room`
- `leave_game_room`
- `chat_message`
- `request_game_state`

### Diferença entre os eventos de estado

#### `game_state`
Mostra o estado da mesa/sala compartilhado para todos.

#### `private_game_state`
Mostra a visão privada do jogador, incluindo a própria mão.

Isso evita expor as cartas do jogador para todos os outros clientes.

---

## Cache de GETs

O backend possui um middleware de cache aplicado sobre `/api`.

Ele é configurado em `src/app.js` com:

- cache apenas para métodos `GET`
- variação de chave por URL
- suporte a diferenciação por token de autenticação
- invalidação por middleware `cacheBuster`

Existe ainda uma rota de teste em ambiente não produtivo:

- `GET /api/__cache_test`
- `POST /api/__cache_mutate`

Isso serve para validar o comportamento do cache durante desenvolvimento.

---

## Swagger

A documentação Swagger fica disponível em:

```text
http://localhost:3000/unoAPI
```

As anotações estão espalhadas nas rotas com comentários `@swagger`.

No Swagger você consegue testar, entre outros grupos:

- Auth
- Users
- Players
- Games
- Game Lobby
- Scores
- Realtime Game
- UNO Logic

---

## Endpoints principais

Abaixo está um resumo funcional das rotas mais importantes.

### Health
- `GET /health`

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`

### Users
- `GET /api/users/profile`
- `POST /api/users/profile`

### Players
- `POST /api/players`
- `GET /api/players`
- `GET /api/players/:id`
- `PUT /api/players/:id`
- `DELETE /api/players/:id`

### Games
- `POST /api/games`
- `GET /api/games`
- `GET /api/games/:id`
- `PUT /api/games/:id`
- `DELETE /api/games/:id`
- `POST /api/games/state`
- `POST /api/games/players`
- `POST /api/games/current-player`
- `POST /api/games/top-card`
- `POST /api/games/scores`

### Game Lobby
- `POST /api/game-lobby/create`
- `POST /api/game-lobby/join`
- `POST /api/game-lobby/ready`
- `POST /api/game-lobby/start`
- `POST /api/game-lobby/leave`
- `POST /api/game-lobby/end`
- `POST /api/game-lobby/state`

### Realtime Game
- `POST /api/realtime-game/state`
- `POST /api/realtime-game/play`
- `POST /api/realtime-game/draw`
- `POST /api/realtime-game/uno`

### Scores
- `POST /api/scores`
- `GET /api/scores`
- `GET /api/scores/:id`
- `PUT /api/scores/:id`
- `DELETE /api/scores/:id`

### UNO Logic
- `POST /api/nextTurn`
- `POST /api/playCard`
- `POST /api/drawCard`

Essas rotas de `UNO Logic` parecem servir como lógica auxiliar/testável fora do fluxo completo do realtime game.

---

## Como o frontend funciona

O frontend React está organizado com:

- `pages/` para telas
- `components/` para componentes reutilizáveis
- `api/` para consumo da API
- `context/` para autenticação e socket

### Rotas do frontend

- `/login`
- `/register`
- `/lobby`
- `/lobby/:gameId`
- `/game/:gameId`
- `/profile`
- `/scores`

### Páginas principais

#### LoginPage
Faz autenticação e salva o token no cliente.

#### RegisterPage
Cria uma nova conta.

#### LobbyPage
Lista partidas disponíveis e permite criar ou entrar em uma sala.

#### LobbyRoomPage
Mostra os detalhes de uma sala específica antes do início do jogo.

#### GamePage
Renderiza a partida em tempo real, acompanha eventos do socket e interage com as ações do jogo.

#### ProfilePage
Exibe os dados do usuário logado.

#### ScorePage
Mostra scores históricos e permite consultar o placar atual de uma partida.

---

## Comunicação frontend ↔ backend

O frontend usa `fetch` através de um client central em:

```text
frontend/src/api/client.js
```

Características:

- base URL fixa em `http://localhost:3000/api`
- envia `Content-Type: application/json`
- injeta o token JWT no header `Authorization`
- lança erro quando a resposta não vem com `response.ok`

---

## Fluxo recomendado de uso

### 1. Registrar usuário
Use o frontend `/register` ou `POST /api/auth/register`.

### 2. Fazer login
Use o frontend `/login` ou `POST /api/auth/login`.

### 3. Criar lobby
O usuário autenticado cria uma sala.

### 4. Outros usuários entram
Os demais participantes entram com `join`.

### 5. Todos marcam ready
Cada usuário marca que está pronto.

### 6. Criador inicia a partida
A sala passa para `in_progress`.

### 7. Jogadores entram na sala realtime
O frontend passa a consumir o estado por API e Socket.IO.

### 8. Jogar, comprar carta e declarar UNO
As ações são feitas pelos endpoints do módulo realtime.

### 9. Consultar score
Ao final, os dados podem ser consultados em `/scores` e `/games/scores`.

---

## Testes

No backend existe pasta de testes em:

```text
src/tests
```

Para executar:

```bash
npm test
```

No `package.json` do backend, o comando atual é:

```json
"test": "jest --runInBand"
```

Ou seja, os testes rodam em série.

---

## Observações importantes do projeto

### 1. `sequelize.sync({ alter: true })`
O projeto sincroniza o banco automaticamente ao iniciar.

Isso ajuda no desenvolvimento, mas em ambientes mais sérios normalmente o ideal seria:

- usar migrations controladas
- evitar `alter: true` em produção

### 2. Blacklist de token em memória
O logout não persiste no banco.

Se o servidor reiniciar, a blacklist some.

### 3. Divergência de porta no Docker
Esse é um detalhe importante do setup atual:

- `docker-compose`: porta `5433`
- `.env.example`: porta `5432`

Isso precisa ser ajustado para evitar falha na conexão com o banco.

### 4. CORS configurado para o frontend local
O backend libera:

```text
http://localhost:5173
```

Se o frontend for publicado em outro endereço, será necessário atualizar a configuração de CORS.

### 5. URL do Swagger
O código imprime corretamente:

```text
http://localhost:3000/unoAPI
```

Esse caminho usa `unoAPI` com `API` maiúsculo no final.

---

## Troubleshooting

### Erro de conexão com o banco
Verifique:

- se o PostgreSQL está rodando
- se `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER` e `DB_PASSWORD` estão corretos
- se você ajustou a porta para `5433` ao usar Docker

### Erro `Invalid token`
Verifique:

- se você fez login
- se enviou `Authorization: Bearer TOKEN`
- se o token não expirou
- se o token não foi invalidado no logout

### Frontend sem conectar na API
Verifique:

- se o backend está em `localhost:3000`
- se o frontend está em `localhost:5173`
- se o CORS está permitindo essa origem

### Socket sem conectar
Verifique:

- se o token JWT está sendo enviado no socket
- se o usuário realmente faz parte da partida antes de entrar na room

---

## Sugestões de melhoria

Algumas melhorias naturais para evolução do projeto:

- persistir blacklist de tokens ou usar refresh tokens
- trocar `sequelize.sync({ alter: true })` por migrations formais
- padronizar melhor a nomenclatura entre `User` e `Player`
- melhorar a documentação de payloads retornados pelas rotas realtime
- parametrizar a URL da API no frontend por variável de ambiente
- adicionar testes mais amplos para realtime e integração
- revisar persistência e consolidação de score final da partida

---

## Resumo final

Este é um projeto full stack de UNO com foco em:

- autenticação de usuários
- lobbies de partidas
- partida em tempo real
- persistência em PostgreSQL
- frontend React
- documentação Swagger

A arquitetura está organizada de forma clara, separando rotas, controllers, services, repositories e models no backend, enquanto o frontend consome a API e os eventos de socket para entregar a experiência do jogo.

Para usar corretamente, o ponto mais importante do setup atual é alinhar a configuração do banco de dados, principalmente a **porta do PostgreSQL quando o Docker estiver sendo usado**.
