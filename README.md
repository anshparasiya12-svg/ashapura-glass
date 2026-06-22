# Ashapura Glass — Glass Business Suite

<div align="center">

![Ashapura Glass](https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/33b8d39e-516e-4b9d-8c70-d138f9eb5742/id-preview-0f8c34b4--4240510b-254b-4355-ac57-902e193f2adc.lovable.app-1781850240599.png)

**A complete glass business management suite — invoicing, inventory, GST, quotations & more.**

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-2-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)

</div>

---

## ✨ Features

| Module | Description |
|--------|-------------|
| 📊 **Dashboard** | Real-time sales, revenue, stock & customer stats |
| 🧾 **Invoicing** | Create, view, edit & PDF-export GST-compliant invoices |
| 📋 **Quotations** | Generate and manage customer quotations |
| 👥 **Customers** | Customer directory with history |
| 📦 **Products** | Product catalog with stock tracking & low-stock alerts |
| 🏭 **Glass Optimizer** | Smart glass cutting planner to minimize waste |
| 🔨 **Work Orders** | Factory job tracking |
| 🚚 **Deliveries** | Delivery management |
| 🗂️ **Projects** | Project management for large orders |
| 🛒 **Purchases** | Purchase order management |
| 🏷️ **Suppliers** | Supplier database |
| 💸 **Expenses** | Business expense tracking |
| 📈 **Reports** | Sales & GST reports (monthly, quarterly, all-time) |
| ⚙️ **Settings** | Company info, bank details, logo & UPI setup |

---

## 🛠 Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS 3 + Radix UI + shadcn/ui
- **Auth & DB**: Supabase (PostgreSQL + Auth)
- **Forms**: React Hook Form + Zod
- **PDF**: jsPDF + jsPDF-AutoTable
- **Charts**: Recharts
- **State**: TanStack Query

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- A [Supabase](https://supabase.com) project

### 1. Clone the repo
```bash
git clone https://github.com/YOUR_USERNAME/ashapura-glass.git
cd ashapura-glass
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables
```bash
cp .env.example .env
```
Edit `.env` and add your Supabase credentials:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Run the development server
```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📁 Project Structure

```
src/
├── components/        # Shared UI components (Sidebar, Layout, etc.)
│   └── ui/            # shadcn/ui primitives
├── contexts/          # React contexts (Auth)
├── hooks/             # Custom React hooks
├── integrations/      # Supabase + Lovable client setup
├── lib/               # Utilities, local store helpers
└── pages/             # All page-level components
    ├── Dashboard.tsx
    ├── Auth.tsx
    ├── AllInvoices.tsx
    ├── GlassOptimizer.tsx
    └── ...
```

---

## 🔑 Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Run the SQL migrations in `supabase/` folder
3. Enable **Email/Password** and **Google OAuth** in Authentication settings
4. Copy your **Project URL** and **Anon Key** into `.env`

---

## 🧪 Running Tests

```bash
npm test          # Unit tests (Vitest)
npm run test:e2e  # E2E tests (Playwright)
```

---

## 📦 Building for Production

```bash
npm run build
npm run preview
```

---

## 📄 License

MIT © Ashapura Glass

---

<div align="center">
  Made with ❤️ using <a href="https://lovable.dev">Lovable</a>
</div>
