# BullMarket

Personal financial monitoring dashboard for **BİST**, **crypto**, and **FX/gold**.

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS v4 + shadcn-style UI primitives
- `@tanstack/react-query` (15s polling)
- `recharts`, `lucide-react`
- Server cache: `node-cache` (optional Redis later)
- Data: `yahoo-finance2`, Binance public API, TCMB XML

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Docs

- [Architecture](docs/ARCHITECTURE.md)
- [API Reference](docs/API.md)

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | ESLint |
