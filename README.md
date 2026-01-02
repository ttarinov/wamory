# Wamory - Secure WhatsApp Business Chat History Viewer

> **Wa**tsApp + Me**mory** - Your secure solution for preserving WhatsApp Business conversations

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)

## The Problem I Faced

When I needed to transfer my WhatsApp Business account to a new phone, I discovered a critical challenge: **finding a safe way to preserve all my client conversations**.

For business owners, these chat histories are **physical assets** worth protecting:
- Years of client communications
- Important agreements and discussions
- Order histories and customer preferences
- Business relationships documented over time

The existing solutions were either:
- 🔴 Unsafe (cloud-based with no encryption)
- 🔴 Complicated (requiring technical expertise)
- 🔴 Expensive (SaaS subscriptions for simple viewing)

I needed a **secure, simple, and free** way to preserve my WhatsApp Business history during phone transfers. So I built **Wamory**.

## The Solution

Wamory is a **privacy-first WhatsApp chat history viewer** that runs entirely on your infrastructure:

✅ **End-to-end encrypted** - Your data never leaves your control
✅ **Self-hosted** - Deploy to Vercel in minutes
✅ **No database required** - JSON storage is efficient even for thousands of chats
✅ **Import/Export** - Easy WhatsApp chat file imports
✅ **Modern UI** - Clean, intuitive interface for browsing history

## Features

### Current Features
- 🔐 **Military-grade encryption** using BIP39 mnemonic phrases (12 words)
- 📱 **WhatsApp export support** (.txt and .zip formats)
- 🖼️ **Media handling** (images, videos, attachments)
- 🔍 **Search functionality** across all your chats
- 💾 **JSON-based storage** (no SQL database needed)
- 🎨 **Clean, responsive UI** built with Next.js 16 and React 19

### Planned Features (if the repo gets traction)
- [ ] **Multi-account support** - Manage multiple WhatsApp Business accounts
- [ ] **Vector search** - Semantic search across conversations
- [ ] **SaaS version** - Hosted option if the project gains stars
- [ ] **Analytics dashboard** - Insights from your chat history
- [ ] **Export to PDF** - Generate conversation reports

## Why No SQL Database?

**Short answer:** JSON is perfect for this use case.

Even with **thousands of chats**, JSON storage:
- ✅ Loads instantly with modern browser APIs
- ✅ Easy to backup (single file)
- ✅ No database migrations or maintenance
- ✅ Works seamlessly with Vercel deployment
- ✅ Perfect for read-heavy workloads

I personally prefer **NoSQL/JSON approaches for fast projects** until you hit real scale limits. For a chat viewer with occasional imports, SQL would be over-engineering.

## Quick Start

### Prerequisites
- Node.js 18+ and pnpm
- A Vercel account (for Blob storage)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/wamory.git
cd wamory

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# Add your BLOB_READ_WRITE_TOKEN from Vercel Blob Dashboard

# Run development server
pnpm dev
```

Visit `http://localhost:3000` and set up your encryption mnemonic.

### Environment Variables

Create `.env.local`:

```env
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token
```

Get your token from [Vercel Blob Dashboard](https://vercel.com/dashboard/stores).

## How It Works

### First Visit
1. App generates a random 12-word mnemonic phrase
2. User backs up the phrase (write it down!)
3. App derives encryption key from mnemonic using PBKDF2
4. Key hash stored in Vercel Blob for validation
5. Empty encrypted data blob created

### Return Visits
1. User enters 12-word phrase
2. App derives key and checks hash
3. If valid, encrypted data is downloaded and decrypted in browser
4. User sees their chats

### Importing WhatsApp Chats

1. **Export from WhatsApp:**
   - Open WhatsApp > Chat > More > Export Chat
   - Choose "Without Media" or "Include Media"
   - Save the file (usually named `WhatsApp Chat - +1234567890.txt`)

2. **Import to Wamory:**
   - Click "Import Chats" in the app
   - Select your exported `.txt` or `.zip` files
   - Files are encrypted and stored securely

## Deployment

### Deploy to Vercel (Recommended)

```bash
pnpm build
vercel --prod
```

Add your `BLOB_READ_WRITE_TOKEN` in Vercel project settings.

Your data remains **100% encrypted** and stored in Vercel Blob Storage.

## Security & Privacy

- 🔒 **Zero-knowledge architecture** - Server never sees your unencrypted data
- 🔑 **BIP39 mnemonic encryption** - Industry-standard cryptography (same as crypto wallets)
- 🏠 **Self-hosted** - You control the infrastructure
- 🚫 **No tracking** - No analytics, no third-party services
- 📦 **AES-256-GCM encryption** - Military-grade encryption at rest
- ⚠️ **Lost mnemonic = lost data** - By design, no recovery possible

## Security Model

- **12-word mnemonic** = your master key (never stored anywhere)
- **Derived key** = AES-256 encryption key (exists only in browser memory)
- **Key hash** = SHA-256 hash stored in blob (for validation only)
- **All data encrypted** = before leaving your browser
- **Server is dumb** = only stores/retrieves encrypted blobs

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript 5
- **UI:** React 19 + Tailwind CSS 4
- **Components:** Radix UI + shadcn/ui
- **Encryption:** BIP39 (mnemonic) + Web Crypto API (AES-256-GCM)
- **Storage:** Vercel Blob (encrypted JSON)

## Architecture

```
Client (Browser)
├── Generate/Enter 12 words
├── Derive AES-256 key (PBKDF2)
├── Encrypt/decrypt all data
└── Upload/download encrypted blobs

API Routes (Thin Wrappers)
├── GET/POST /api/chats - Store encrypted JSON
├── POST /api/media - Store media files
└── GET /api/auth/check - Check if data exists

Vercel Blob Storage
├── chats.json.enc - Encrypted chat data
├── key-hash.txt - Key hash for validation
└── media/{chatId}/* - Media files
```

## Project Structure

```
wamory/
├── app/              # Next.js app router pages
├── components/       # React components
│   ├── auth/        # Authentication (mnemonic setup/login)
│   ├── chat/        # Chat UI components
│   ├── dialogs/     # Modal dialogs
│   └── ui/          # shadcn/ui components
├── lib/             # Core utilities
│   ├── services/    # Encryption, mnemonic, blob services
│   ├── utils/       # Helper functions (phone, media, path security)
│   └── models.ts    # TypeScript types
└── public/          # Static assets
```

## Contributing

Contributions are welcome! This is a side project, so I appreciate:

- 🐛 Bug reports and fixes
- 💡 Feature suggestions
- 📖 Documentation improvements
- ⭐ Stars (if you find this useful!)

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## Roadmap

The future of Wamory depends on community interest:

- **If we reach 100+ stars:** Multi-account support + vector search
- **If we reach 500+ stars:** SaaS hosted version
- **If we reach 1000+ stars:** Mobile app (React Native)

## License

MIT License - see [LICENSE](LICENSE) for details.

## Author

**Alex Tatarinov**
Created out of necessity, shared for the community.

---

**⭐ If Wamory helped you preserve your WhatsApp Business history, consider giving it a star!**

## FAQ

**Q: Is my data safe?**
A: Yes. All data is encrypted with your 12-word mnemonic phrase. Without it, the data is unreadable—even by you.

**Q: Can I use this for personal WhatsApp?**
A: Absolutely! It works with any WhatsApp export.

**Q: Why JSON instead of a database?**
A: JSON is simpler, faster for small-to-medium datasets, and requires zero maintenance. Perfect for a chat viewer. I prefer NoSQL/JSON for fast projects until you actually need SQL scale.

**Q: Can I migrate to a database later?**
A: Yes, the architecture is designed to be flexible. A migration path is planned if needed.

**Q: What if I lose my mnemonic phrase?**
A: Your data is permanently lost. This is by design—true zero-knowledge encryption. **Write down your 12 words and store them safely.**

**Q: Is this affiliated with WhatsApp/Meta?**
A: No. This is an independent project for viewing exported chat files.

## Disclaimer

This is an educational project. Always keep multiple backups of your mnemonic phrase. **Lost mnemonic = permanently lost data.**
