# Technology Stack

## Frontend

**Framework:** Next.js 14+ (App Router)
**Language:** TypeScript 5+
**Runtime:** React 18+

**State Management:** React Context API + useState
- No global state library needed for MVP
- Local component state for form inputs
- Context for sharing short URL after generation (if needed)

**Styling:** Tailwind CSS 3+
- Utility-first CSS framework
- Built-in dark mode support
- Responsive design utilities
- Zero runtime cost

**UI Components:**
- `shadcn/ui` (optional, for pre-built accessible components)
- Native HTML5 inputs with Tailwind styling
- Custom components for QR preview

**Key Libraries:**
| Library | Purpose | Version |
|---------|---------|---------|
| `qrcode` | Server-side QR code generation | ^1.5.0 |
| `qrcode.react` | Client-side QR preview (optional) | ^3.1.0 |
| `react-colorful` | Color picker component | ^5.6.0 |
| `recharts` | Analytics charts (time series, pie charts) | ^2.10.0 |
| `zod` | Schema validation (client + server) | ^3.22.0 |
| `date-fns` | Date formatting and manipulation | ^3.0.0 |
| `ua-parser-js` | User agent parsing for device/browser detection | ^1.0.37 |

**Justification:**
- **Next.js 14 App Router**: Required for Vercel deployment, provides server/client components, built-in API routes, excellent DX
- **TypeScript**: Type safety reduces bugs, better autocomplete, easier refactoring
- **Tailwind CSS**: Fastest way to build responsive UI, no CSS-in-JS runtime cost, consistent design system
- **Minimal dependencies**: Fewer libraries = faster builds, smaller bundle, less maintenance

---

## Backend

**Framework:** Next.js 14 App Router (Route Handlers)
**Language:** TypeScript 5+
**Runtime:** Node.js 18+ (Vercel serverless functions)

**API Style:** RESTful JSON APIs
- Simple, well-understood
- No need for GraphQL complexity at this scale
- Easy to test and document

**Key Libraries:**
| Library | Purpose | Version |
|---------|---------|---------|
| `@vercel/postgres` | Postgres client for Vercel edge | ^0.5.0 |
| `nanoid` | Generate unique short codes | ^5.0.0 |
| `zod` | Schema validation | ^3.22.0 |
| `qrcode` | QR code generation | ^1.5.0 |

**Justification:**
- **Next.js Route Handlers**: Collocated with frontend, serverless auto-scaling, zero config
- **Vercel Postgres SDK**: Optimized for Vercel edge runtime, built-in connection pooling
- **nanoid**: Cryptographically secure, URL-safe, 21-char IDs provide 126-bit entropy (collision-resistant)
- **No ORM for MVP**: Direct SQL queries are faster to write and debug at this scale; can add Prisma later if needed

---

## Database

**Primary Database:** PostgreSQL 15+ (Vercel Postgres)
**ORM/Query Builder:** None (raw SQL via `@vercel/postgres`)
- Can add Prisma later for migrations and type-safe queries

**Caching:** None for MVP
- Add Redis (Upstash) if needed for hot QR codes or analytics caching

**Search:** Not required

**Connection Pooling:** Built-in via Vercel Postgres

**Justification:**
- **PostgreSQL**: Industry-standard relational database, excellent for analytics queries (GROUP BY, aggregations), strong consistency
- **Vercel Postgres**: Zero-config setup, generous free tier (256 MB storage), automatic backups, built-in pooling
- **No ORM for MVP**: Direct SQL is faster to prototype; Prisma adds complexity we don't need yet (100 LoC vs 500 LoC)
- **Trade-offs**:
  - ✅ Fast queries with proper indexes
  - ✅ Familiar SQL syntax
  - ✅ Zero infrastructure management
  - ⚠️ Manual migration management (acceptable for 2-table schema)
  - ⚠️ No type-safe queries (mitigated by TypeScript interfaces)

---

## Infrastructure & DevOps

**Containerization:** None (Vercel handles deployment)
**Orchestration:** N/A

**Cloud Provider:** Vercel
- Deployment platform: Vercel Serverless Functions
- Database: Vercel Postgres (managed PostgreSQL)
- CDN: Vercel Edge Network (global CDN)

**CI/CD:** GitHub Actions (optional) + Vercel Git Integration
- **Vercel Git Integration** (default):
  - Auto-deploy on push to `main` → production
  - Auto-deploy on PRs → preview environments
  - Zero configuration
- **GitHub Actions** (optional, for advanced workflows):
  - Run tests before deployment
  - Lint code
  - Type-check with TypeScript

**Hosting:**
- **Frontend**: Vercel Edge Network (static + SSR)
- **Backend**: Vercel Serverless Functions (API routes)
- **Database**: Vercel Postgres (managed service)

**Environment Management:**
- Development: `localhost:3000` + local or dev Postgres
- Preview: Auto-generated preview URLs per PR
- Production: `qr-track.vercel.app` (or custom domain)

**Justification:**
- **Vercel-native deployment**: Zero config, instant preview deployments, automatic HTTPS, edge caching
- **No Docker needed**: Vercel abstracts infrastructure, no need to manage containers
- **Git-based workflow**: Push to deploy, rollback is instant (revert deployment in Vercel dashboard)
- **Free tier**: 100 GB bandwidth, unlimited requests (with fair use), perfect for MVP

---

## Development Tools

**Version Control:** Git + GitHub
- Repository: GitHub (public or private)
- Branching strategy: GitHub Flow (main + feature branches)

**Package Manager:** pnpm (recommended) or npm
- **pnpm**: Faster installs, disk-space efficient, strict dependency resolution
- Alternative: npm (ships with Node.js, simpler for solo dev)

**Linting:** ESLint 8+
- Next.js built-in ESLint config (`next lint`)
- Extends: `next/core-web-vitals`
- Add Prettier for formatting

**Formatting:** Prettier 3+
- Auto-format on save (VSCode extension)
- Config: `.prettierrc` with Tailwind plugin

**Testing:**
- **Frontend:** Vitest + React Testing Library (optional for MVP)
  - Fast, Vite-powered test runner
  - Component testing for critical UI
- **Backend:** Vitest for unit tests (API route logic)
- **E2E:** Playwright (post-MVP)
  - Test full QR generation → scan → analytics flow

**Development Server:** Next.js dev server (`next dev`)
- Hot module replacement
- Fast refresh
- Auto-compilation

**IDE:** VSCode (recommended)
- Extensions:
  - ESLint
  - Prettier
  - Tailwind CSS IntelliSense
  - TypeScript + JavaScript

**Justification:**
- **pnpm**: 2-3x faster than npm, saves disk space, better for monorepos (future-proof)
- **ESLint + Prettier**: Catch errors early, consistent code style
- **Vitest over Jest**: Faster, better ESM support, Vite-compatible
- **Minimal testing for MVP**: Focus on happy path, add comprehensive tests post-MVP

---

## Third-Party Services

**Authentication:** None (public-only MVP)
- Post-MVP: NextAuth.js (OAuth + email/password)

**Payments:** None
- Post-MVP: Stripe for paid tiers

**Email:** None
- Post-MVP: Resend or SendGrid for transactional emails

**Analytics:**
- **Web Analytics:** Vercel Analytics (built-in)
  - Page views, web vitals, traffic sources
  - Zero config, privacy-friendly
- **Application Analytics:** Custom (QR scans tracked in database)

**Monitoring:**
- **Platform Monitoring:** Vercel Logs + Vercel Analytics
  - Function execution logs
  - Error tracking (console.error)
- **Error Tracking (Post-MVP):** Sentry
  - Client + server error tracking
  - Performance monitoring
  - User session replay

**Geolocation:**
- **Option 1 (Free):** Vercel Edge request headers
  - `x-vercel-ip-country`, `x-vercel-ip-city`
  - Built-in, zero cost, sufficient for MVP
- **Option 2 (Fallback):** ipapi.co or ip-api.com
  - Free tier: 1000 requests/day
  - More detailed data (lat/long, timezone)

**CDN:** Vercel Edge Network (built-in)
- Global CDN with 100+ edge locations
- Automatic static asset caching
- Edge functions for low-latency redirects

**Justification:**
- **Vercel-first approach**: Leverage built-in services to minimize external dependencies
- **Zero-config analytics**: Vercel Analytics requires no setup, privacy-compliant
- **Defer error tracking**: Vercel logs are sufficient for MVP, add Sentry if error rate becomes unmanageable
- **Free geolocation**: Vercel headers are good enough for country/city analytics

---

## Trade-offs & Alternatives

### Alternative Considered: T3 Stack (Next.js + tRPC + Prisma + Tailwind)

**Pros:**
- Type-safe API calls with tRPC (no manual API routes)
- Prisma provides type-safe database queries and migrations
- Batteries-included template for rapid development

**Cons:**
- Overkill for 3 API endpoints
- Steeper learning curve (tRPC + Prisma + Zod)
- More boilerplate code
- Slower build times

**Why Not Chosen:**
- MVP has only 3 API routes → REST is simpler
- Prisma migrations add complexity for 2-table schema
- Can migrate to T3 stack later if complexity grows

---

### Alternative Considered: Supabase (PostgreSQL + Auth + Storage)

**Pros:**
- Built-in authentication (no NextAuth setup)
- Real-time database subscriptions (live analytics)
- File storage (could store QR code PNGs)
- Generous free tier

**Cons:**
- Not required since we're skipping auth
- Real-time not needed for MVP
- Vercel Postgres is simpler (one less platform)
- Supabase JS SDK adds bundle size

**Why Not Chosen:**
- No auth requirement → Supabase's main value prop unused
- Vercel Postgres is more tightly integrated with Vercel deployment
- Simpler architecture with fewer external services

---

### Alternative Considered: Cloudflare Pages + Workers + D1

**Pros:**
- Cheaper at scale (free tier: 100k requests/day)
- Faster cold starts (V8 isolates vs Node.js)
- D1 is built for edge (global replication)

**Cons:**
- Less mature ecosystem (D1 is beta)
- Harder to debug Workers vs Next.js
- Not Next.js native (would need Remix or SvelteKit)
- No requirement for extreme edge performance at 1-100 users

**Why Not Chosen:**
- User specified Next.js + Vercel as target stack
- Vercel free tier is sufficient for MVP scale
- Better DX with Next.js on Vercel (preview deployments, logs, analytics)

---

### Alternative Considered: MongoDB (NoSQL)

**Pros:**
- Flexible schema (easy to add fields)
- Good for rapid prototyping
- JSON-native (matches JavaScript objects)

**Cons:**
- Worse for analytics queries (aggregations are slower)
- No built-in JOINs (need to denormalize or multiple queries)
- Less familiar for relational data (QR codes → scans)
- Vercel Postgres is easier to set up

**Why Not Chosen:**
- Analytics require GROUP BY, COUNT, aggregations → SQL excels here
- Schema is stable (2 tables, unlikely to change)
- PostgreSQL JSON columns provide flexibility if needed

---

## Dependency Version Lock

**For Production Stability:**
```json
{
  "engines": {
    "node": ">=18.17.0",
    "pnpm": ">=8.0.0"
  }
}
```

**Lockfile:** `pnpm-lock.yaml` (committed to Git)

**Update Strategy:**
- Patch updates: Auto-update (security fixes)
- Minor updates: Review changelog, test before upgrading
- Major updates: Defer to post-MVP (breaking changes)

---

## Summary

**Tech Stack at a Glance:**

| Layer | Technology | Justification |
|-------|------------|---------------|
| **Frontend Framework** | Next.js 14 (App Router) | Vercel-native, server + client components, built-in routing |
| **Language** | TypeScript 5 | Type safety, better DX, fewer bugs |
| **Styling** | Tailwind CSS 3 | Fastest UI development, consistent design, zero runtime |
| **Backend** | Next.js Route Handlers | Collocated API routes, serverless, auto-scaling |
| **Database** | Vercel Postgres (PostgreSQL 15) | Zero-config, perfect for analytics, generous free tier |
| **Deployment** | Vercel | One-click deploy, preview environments, global CDN |
| **Analytics** | Vercel Analytics + Custom DB | Built-in web analytics + custom QR scan tracking |
| **Monitoring** | Vercel Logs | Sufficient for MVP, upgrade to Sentry post-MVP |

**Total External Services:** 1 (Vercel Postgres)
**Total Third-Party APIs:** 0 (Vercel headers for geolocation)

This stack is optimized for:
- ✅ Solo developer productivity
- ✅ Fast iteration (2-4 week MVP)
- ✅ Zero infrastructure management
- ✅ Generous free tier (under $0/month for MVP)
- ✅ Production-ready with minimal config
