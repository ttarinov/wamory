# Wamory - Secure WhatsApp Business Chat History Viewer

> **Wa**tsApp + Me**mory** - Your secure solution for preserving WhatsApp Business conversations

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)

**Built with Next.js 16, React 19, and stored as encrypted JSON** - no SQL database needed because JSON is fast enough for thousands of chats.

## The Problem I Faced

I was switching phones and needed to keep my WhatsApp Business chats - years of client conversations that I couldn't afford to lose. Everything I found was either sketchy cloud services with no encryption, or complicated self-hosted solutions that required too much setup. I just wanted something simple and secure that I could trust with my business data. So I spent a weekend building this.

### Planned Features (if the repo gets traction)
- [ ] **Multi-account support** - Manage multiple WhatsApp Business accounts
- [ ] **Vector search** - Semantic search across conversations
- [ ] **SaaS version** - Hosted option if the project gains stars
- [ ] **Analytics dashboard** - Insights from your chat history
- [ ] **Export to PDF** - Generate conversation reports

## Quick Start

Fork this repo, deploy to Vercel, and add your `BLOB_READ_WRITE_TOKEN` from the [Vercel Blob Dashboard](https://vercel.com/dashboard/stores) to your environment variables.

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

## Security

True zero-knowledge encryption - your 12-word passphrase is never stored anywhere, not even as a hash. The server has literally no way to validate your passphrase. When you log in, the app just tries to decrypt your data with the key derived from your passphrase - if it works, you're in. If it fails, wrong passphrase. All encryption (AES-256-GCM) happens in your browser before anything touches the server.

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
