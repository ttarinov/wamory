# Contributing to WhatsApp History Viewer

Thank you for your interest in contributing! This project follows simple guidelines.

## Development Setup

1. Fork and clone the repository
2. Install dependencies: `pnpm install`
3. Create `.env.local` from `.env.example`
4. Add your Vercel Blob token
5. Run dev server: `pnpm dev`

## Code Style

- Use TypeScript for all files
- Follow existing naming conventions (kebab-case for files)
- Keep services simple and single-responsibility
- No console.log or debug code in production

## Architecture Principles

- **KISS**: Keep it simple
- **Client-side encryption**: All crypto happens in browser
- **Blob-only storage**: No database, just encrypted JSON
- **Minimal API**: Thin routes that just store/retrieve blobs

## Pull Request Process

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit PR with clear description
5. Ensure all checks pass

## Security

If you discover a security vulnerability, please email the maintainer privately rather than opening a public issue.
