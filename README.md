# ⚡ FlowMate

> **Automate your workflow, reclaim your time.**
> Connect triggers to actions and let FlowMate handle the rest — no code needed!

```
███████╗██╗      ██████╗ ██╗    ██╗███╗   ███╗ █████╗ ████████╗███████╗
██╔════╝██║     ██╔═══██╗██║    ██║████╗ ████║██╔══██╗╚══██╔══╝██╔════╝
█████╗  ██║     ██║   ██║██║ █╗ ██║██╔████╔██║███████║   ██║   █████╗
██╔══╝  ██║     ██║   ██║██║███╗██║██║╚██╔╝██║██╔══██║   ██║   ██╔══╝
██║     ███████╗╚██████╔╝╚███╔███╔╝██║ ╚═╝ ██║██║  ██║   ██║   ███████╗
╚═╝     ╚══════╝ ╚═════╝  ╚══╝╚══╝ ╚═╝     ╚═╝╚═╝  ╚═╝   ╚═╝   ╚══════╝
```

---

## 🗺️ How It All Works

```
  🌐 Webhook hits                📬 Outbox polled               ⚙️ Actions run!
  ┌─────────────┐               ┌──────────────┐               ┌───────────────┐
  │  Hook Server│──── writes ──►│  PostgreSQL  │◄── polls ────│   Processor   │
  │  :3002  🪝  │               │  :5439  🐘   │               │               │
  └─────────────┘               └──────────────┘               └───────┬───────┘
                                                                         │
  ┌─────────────┐               ┌──────────────┐               ┌───────▼───────┐
  │  Next.js 🎨 │──── REST ────►│  HTTP API    │    Kafka 📨   │    Worker     │
  │  :3001      │               │  :3000  🚀   │◄──────────────│  ✉️ ◎ 💬 🌐   │
  └─────────────┘               └──────────────┘               └───────────────┘
```

> **The magic:** Webhook fires → writes `ZapRun` + `ZapRunOutbox` row → Processor polls outbox & pushes to Kafka → Worker consumes & runs your actions. 🎯

---

## 📦 What's Inside

```
code/
├── 🎨 apps/web          → Next.js 16 frontend        (port 3001)
├── 🚀 apps/http         → Express REST API            (port 3000)
├── 🪝 apps/hook         → Webhook receiver            (port 3002)
├── ⚙️  apps/processor   → Outbox → Kafka publisher
├── 🔧 apps/worker       → Kafka consumer + executor
└── 🗄️  packages/db      → Prisma schema + client (@repo/db)
```

---

## 🛠️ Tech Stack

| 🏷️ Layer | 🔧 Tech |
|---|---|
| 🎨 Frontend | Next.js 16, Tailwind CSS v4, Sonner |
| 🚀 API | Express.js, Zod, JWT |
| 🗄️ Database | PostgreSQL 15, Prisma ORM |
| 📨 Messaging | Apache Kafka (KafkaJS) |
| 📦 Monorepo | Turborepo + pnpm workspaces |
| ⚙️ Runtime | Node.js v24, tsx |

---

## ⚡ Triggers & Actions

### 🔫 Triggers — *"When this happens..."*

| Trigger | Description |
|---|---|
| 🪝 **Webhook** | HTTP POST to `/hooks/catch/:userId/:zapId` |
| 🕐 **Schedule** | Runs every N minutes (set per Zap) |

### 🎬 Actions — *"...do this!"*

| Action | Description |
|---|---|
| ✉️ **Email** | Send via Gmail SMTP |
| ◎ **Solana Transfer** | Send SOL to a wallet address |
| 💬 **Slack** | Post to a Slack webhook |
| 🎮 **Discord** | Post to a Discord webhook |
| 🌐 **HTTP Request** | Call any external URL (GET / POST) |
| 📋 **Log** | Print a labeled log message |

> 💡 **Pro tip:** Use `{body.field}` in any config value — it gets replaced with the webhook payload at runtime!
>
> Example: `"Payment received: {body.amount} SOL"` → `"Payment received: 2.5 SOL"`

---

## 🚀 Getting Started

### Step 1 — Fire up the infrastructure 🐳

```bash
docker compose up -d
```

Spins up:
- 🐘 **PostgreSQL** on port `5439`
- 📨 **Kafka + Zookeeper** on port `9092`

---

### Step 2 — Install everything 📦

```bash
pnpm install
```

---

### Step 3 — Create your `.env` files 🔑

**`apps/http/.env`**
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5439/flowly"
JWT_PASSWORD="your-super-secret-jwt-password"
```

**`apps/hook/.env`**
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5439/flowly"
```

**`apps/processor/.env`**
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5439/flowly"
```

**`apps/worker/.env`**
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5439/flowly"
SMTP_ENDPOINT="smtp.gmail.com"
SMTP_USERNAME="your@gmail.com"
SMTP_PASSWORD="your-gmail-app-password"
SOL_PRIVATE_KEY="your-solana-private-key-base58"
```

---

### Step 4 — Migrate & seed the database 🌱

```bash
cd packages/db
npx prisma migrate dev
npx tsx seed.ts
```

This creates all the tables and seeds the available triggers + actions. ✅

---

### Step 5 — Run everything! 🎉

```bash
pnpm run dev
```

| 🟢 Service | 🌐 Port | 📝 What it does |
|---|---|---|
| `web` | **3001** | The cartoonish frontend UI |
| `http` | **3000** | REST API (auth, zaps, triggers) |
| `hook` | **3002** | Receives incoming webhooks |
| `processor` | — | Polls outbox → pushes to Kafka |
| `worker` | — | Consumes Kafka → runs actions |

---

## 🗺️ API Reference

### 🔐 Auth
```
POST /api/v1/user/signup    →  { name, username, password }
POST /api/v1/user/signin    →  { username, password }
```

### ⚡ Zaps  *(needs `Authorization: Bearer <token>`)*
```
GET  /api/v1/zap            →  List all your zaps
POST /api/v1/zap            →  Create a new zap
GET  /api/v1/zap/:zapId     →  Get one zap
```

### 🔍 Options
```
GET /api/v1/trigger/available   →  All available triggers
GET /api/v1/action/available    →  All available actions
```

### 🪝 Webhooks
```
POST /hooks/catch/:userId/:zapId   →  { ...your payload }
```

---

## 🎮 Build Your First Zap

```
  1️⃣  Sign up          →   http://localhost:3001/signup
       ↓
  2️⃣  New Zap          →   Dashboard → "+ New Zap"
       ↓
  3️⃣  Pick a trigger   →   e.g. "Webhook"
       ↓
  4️⃣  Add actions      →   e.g. Email → Slack
       ↓
  5️⃣  Publish!         →   Click "Publish Zap" ⚡
       ↓
  6️⃣  Fire it!         →   Copy webhook URL → send a POST
```

```bash
# 🔥 Fire your Zap!
curl -X POST http://localhost:3002/hooks/catch/1/<your-zap-id> \
  -H "Content-Type: application/json" \
  -d '{"type": "payment", "amount": 2.5, "from": "alice"}'
```

---

## 🗄️ Database Schema

```
👤 User
 └── ⚡ Zap (many)
      ├── 🔫 Trigger ──────► 🎯 AvailableTrigger
      ├── 🎬 Action[] ─────► 🎯 AvailableAction
      └── 📝 ZapRun[]
           └── 📤 ZapRunOutbox   ← processor deletes after Kafka publish
```

Key fields:
- **`Trigger.lastRunAt`** — tracks last schedule run time
- **`Action.sortingOrder`** — determines execution order in multi-step Zaps
- **`ZapRunOutbox`** — the transactional outbox; guarantees at-least-once delivery

---

## 🐛 Dev Gotchas

> **KafkaJS + Node v24** 🔴
> `processor` and `worker` use `node --import tsx/esm --watch` (NOT `tsx watch`) to avoid an ECANCELED error caused by KafkaJS's sync file reads conflicting with tsx's CJS transformer.

> **tsx watching node_modules** 🔴
> `http` and `hook` use `tsx watch --ignore node_modules` to stop the server from restarting every time a package file changes.

> **dotenv not auto-loaded** 🔴
> tsx doesn't auto-load `.env`. Each app has `import "dotenv/config"` as its very first line.

---

## 📄 License

MIT — build cool stuff! 🚀
