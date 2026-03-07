# UNO API (JavaScript + PostgreSQL)

## Opção 1: Subir o PostgreSQL com Docker
1) `docker compose up -d`
2) Copie `.env.example` para `.env` (os valores padrão já batem com o docker)

## Opção 2: PostgreSQL já instalado
Crie um database chamado `uno_api_js` (ou ajuste DB_NAME no `.env`).

## Rodar a API
1) `npm i`
2) `npm run dev`

Base URL: `http://localhost:3000`
Base URL Swagger UI: `hhttp://localhost:3000/unoApi`
Health: `GET /health`

CRUD:
- Players: `/api/players`
- Games: `/api/games`
- Cards: `/api/cards`
- Scores: `/api/scores`

Observação:
- As tabelas são criadas automaticamente ao iniciar (`sequelize.sync()`).
