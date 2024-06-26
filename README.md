# Cinema API 🎥

> Fast, reliable and easy to use API.

[![Docker Build](https://github.com/Jayllyz/cinema-api/actions/workflows/docker-build.yml/badge.svg)](https://github.com/Jayllyz/cinema-api/actions/workflows/docker-build.yml)
[![CI](https://github.com/Jayllyz/cinema-api/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/Jayllyz/cinema-api/actions/workflows/ci.yml)
[![Biome Badge](https://img.shields.io/badge/Checked_with-Biome-60a5fa?style=flat&logo=biome)](https://biomejs.dev/)

This project implements all the necessary endpoints for a cinema, including:

- Clients
- Movies
- Screenings / Tickets
- Rooms
- Employees

## Built With 🛠

![Hono](https://img.shields.io/badge/hono-E36002?style=for-the-badge&logo=hono&logoColor=white)
![Typescript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Biome](https://img.shields.io/badge/biome-60a5fa?style=for-the-badge&logo=biome&logoColor=white)
![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)
![Postgres](https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)

## Development setup 💻

> [!NOTE]
> Requirements: Docker, pnpm (v9.1.1)

```sh
git clone https://github.com/Jayllyz/cinema-api.git

cd cinema-api

cp .env.example .env

docker compose up

pnpm prisma:init
```

You can access the Swagger documentation at `/doc` and the Swagger UI at `/ui`.

## License 📄

Distributed under the MIT License. See `LICENSE` for more information.
