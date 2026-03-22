# টালিখাতা (TaliKhata)

A Bangla-first mobile ledger app for small shop owners to track customer credit (বাকি/জমা).

Built with **Next.js 16**, **MUI v7**, **Prisma 5**, and **PostgreSQL / MySQL 8.0**.

---

## Database Setup

### PostgreSQL (default)

```bash
# 1. Copy and fill in the environment file
cp .env.example .env
# Edit .env and set your DATABASE_URL

# 2. Run migrations to create tables
npm run db:migrate

# 3. (Optional) Seed with sample data
npm run db:seed
```

**PostgreSQL connection string format:**
```
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/tolikhata?schema=public"
```

### MySQL 8.0

1. Open `prisma/schema.prisma` and change `provider = "postgresql"` to `provider = "mysql"`
2. Update `.env`:
   ```
   DATABASE_URL="mysql://USER:PASSWORD@HOST:3306/tolikhata"
   ```
3. Run migrations: `npm run db:migrate`

---

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Database Scripts

| Command | Description |
|---|---|
| `npm run db:generate` | Re-generate Prisma Client after schema changes |
| `npm run db:push` | Push schema to DB without creating a migration (dev/prototype) |
| `npm run db:migrate` | Create and apply a new migration |
| `npm run db:migrate:deploy` | Apply pending migrations in production |
| `npm run db:seed` | Seed the database with sample data |
| `npm run db:studio` | Open Prisma Studio (visual DB browser) |

---

## API Routes

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/customers` | List all customers |
| POST | `/api/customers` | Create a customer |
| GET | `/api/customers/:id` | Get a single customer |
| PUT | `/api/customers/:id` | Update a customer |
| DELETE | `/api/customers/:id` | Delete customer + all transactions |
| GET | `/api/transactions` | List transactions (filter with `?customerId=`) |
| POST | `/api/transactions` | Add a transaction (updates customer balance atomically) |
| GET | `/api/transactions/:id` | Get a single transaction |
| DELETE | `/api/transactions/:id` | Delete transaction (reverses balance atomically) |

---

## Production

```bash
npm run build
npm start
```

The app runs as a standard Node.js server — no Vercel or any other cloud platform required.
