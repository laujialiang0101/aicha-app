# 🧋 Ai-CHA Operations App

Inventory & Operations Management System for Langkah F&B / Ai-CHA Franchise

## Features

### 📋 Stock Take
- Mobile-first stock counting
- Count by **Carton → Pack → Unit** (auto-converts)
- Real-time totals calculation
- Grouped by category for easy navigation

### 🔄 Transfer Requests
- Outlet requests stock from Warehouse
- Approval workflow: Pending → Approved → In Transit → Received
- Full tracking and history

### ✅ Daily Checklists
- Opening checklist (before first customer)
- Closing checklist (prep for next day)
- Photo evidence support
- Track completion history

### 📊 Dashboard
- Stock value by location
- Low stock alerts
- Expiring items (7-day warning)
- Pending tasks summary

### 📥 GRN (Goods Received Note)
- Record incoming stock
- Batch & expiry tracking
- Link to PO reference

### 🛒 PO Generator
- Auto-suggest based on stock levels
- Export to Ai-CHA Excel format

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Environment Variables
Copy `.env.local` is already configured with your Render database.

### 3. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 4. Deploy to Vercel
```bash
npm install -g vercel
vercel
```

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL (Render)
- **Deployment**: Vercel

## Project Structure

```
aicha-app/
├── src/
│   ├── app/
│   │   ├── page.tsx          # Dashboard
│   │   ├── stock-take/       # Stock counting
│   │   ├── transfer/         # Transfer requests
│   │   ├── checklist/        # Daily checklists
│   │   ├── grn/              # Goods received
│   │   ├── po/               # Purchase orders
│   │   ├── more/             # Settings & more
│   │   └── api/              # API routes
│   ├── components/           # Shared components
│   └── lib/
│       └── db.ts             # Database connection
├── .env.local                # Environment variables
└── package.json
```

## Database Tables

| Table | Purpose |
|-------|---------|
| locations | Warehouse + 3 outlets |
| raw_materials | 71 items with costs |
| finished_products | 65 menu items with prices |
| unit_conversions | Carton/pack/unit mapping |
| stock_movements | All stock changes |
| stock_takes | Stock count records |
| stock_requests | Transfer requests |
| batches | Expiry tracking |
| checklists | Daily task templates |
| audit_log | Full traceability |

## Support

Built for Langkah F&B by Claude AI
