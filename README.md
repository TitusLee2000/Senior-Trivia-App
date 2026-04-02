# Senior Trivia App

.NET API (`Server/TriviaApi`) + React (`client/trivia-ui`). Local SQL Server via Docker.

**Needs:** Docker Desktop, .NET 10 SDK, Node.js.

**1. Database** (repo root)

```bash
docker compose up -d
```

**2. API**

```bash
cd Server/TriviaApi
dotnet run --launch-profile http
```

Listens on `http://localhost:5251` and applies migrations on startup.

**3. UI** (new terminal)

```bash
cd client/trivia-ui
npm install
npm start
```

Open `http://localhost:3000`.

**Sign in:** admin `admin@trivia.local` / `Admin123!`. Or register as a player. Admins get an **Admin** link for quiz editing.

Connection string and SQL password live in `Server/TriviaApi/appsettings.json` and must match Docker (`sa` / `Strong_Password_1234` by default).
