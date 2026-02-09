# DocuAI - Enterprise-Grade AI Document Workspace

DocuAI is a powerful, full-stack application designed to transform raw data into professional documents (Invoices, Reports, Memos) using state-of-the-art AI.

## ✨ Core Features
- **Intelligent Generation**: Seamlessly generate PDF, DOCX, and XLSX documents.
- **AI Hub**: Support for multiple providers including OpenAI, Google Gemini, and local Ollama.
- **Enterprise Admin Suite**: Real-time analytics, user management, and dynamic template management.
- **Ultra-Premium UI**: Glassmorphism design system with perfect dark mode support and micro-animations.
- **Secure by Default**: JWT-based authentication with Role-Based Access Control (RBAC).

## 🚀 Technical Stack
- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- **Database**: [Prisma](https://www.prisma.io/) with SQLite (Dev) & PostgreSQL (Prod)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Authentication**: Custom JWT Middleware
- **AI Integration**: OpenAI SDK, Google Generative AI, and local Ollama API
- **Generators**: `docx` (Word), `puppeteer` (PDF), `exceljs` (Excel)

## 🛠️ Quick Start

### 1. Installation
```powershell
npm install
```

### 2. Environment Setup
Create a `.env` file in the root:
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-super-secret-key"
AI_PROVIDER="ollama" # or "openai", "gemini"
OLLAMA_BASE_URL="http://localhost:11434"
OPENAI_API_KEY="sk-..."
GOOGLE_API_KEY="AIza..."
```

### 3. Database Initialization
```powershell
npx prisma migrate dev
npx tsx prisma/seed.ts
```

### 4. Run Development Server
```powershell
npm run dev
```

## 📂 Architecture Overview
- `app/`: Next.js App Router routes and Server Actions.
- `components/`: Reusable UI components.
- `lib/`: Core service layers (AI factory, generators, auth).
- `prisma/`: Database schema and seeding logic.
- `public/`: Static assets and generated files.

## 🤝 License
Licensed under the MIT License.
