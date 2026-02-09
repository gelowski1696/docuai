# Files to Copy to Target Computer

When deploying to another computer, copy these files/folders:

## ✅ Required Files

```
docuai-nextjs/
├── .env                          ← Your API keys and settings
├── .dockerignore
├── .next/                        ← (if exists, optional)
├── app/                          ← All application code
├── lib/                          ← All library code
├── prisma/                       ← Database schema and seeds
├── public/                       ← Static files
├── scripts/                      ← Utility scripts
├── Dockerfile                    ← Docker configuration
├── docker-compose.yml            ← Docker orchestration
├── docker-entrypoint.sh          ← Startup script
├── next.config.ts                ← Next.js config
├── package.json                  ← Dependencies
├── package-lock.json             ← Lock file
├── tsconfig.json                 ← TypeScript config
├── tailwind.config.ts            ← Tailwind config
├── postcss.config.mjs            ← PostCSS config
├── START-DOCUAI.bat             ← ⭐ ONE-CLICK START
├── STOP-DOCUAI.bat              ← Stop application
├── VIEW-LOGS.bat                ← View logs
└── SETUP-GUIDE.md               ← User instructions
```

## ❌ NOT Needed

These will be generated automatically:
- `node_modules/` - Will be installed by Docker
- `.next/` - Will be built by Docker
- `dev.db` - Will be created automatically
- `*.log` files

## Quick Copy Method

**Option 1: Copy Entire Folder**
Just copy the entire `docuai-nextjs` folder to a USB drive or network share.

**Option 2: Zip and Transfer**
1. Right-click the `docuai-nextjs` folder
2. Send to → Compressed (zipped) folder
3. Transfer the zip file
4. Extract on target computer

## What the User Needs to Do

1. Install Docker Desktop (one-time)
2. Double-click `START-DOCUAI.bat`
3. Wait for browser to open
4. Login and use!

That's it! 🎉
