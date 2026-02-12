# System Architecture

## Architecture Overview

QR Track follows a **serverless monolith** architecture pattern, leveraging Next.js App Router for both frontend and backend functionality. The application is deployed entirely on Vercel's edge network with Vercel Postgres as the managed database.

**High-Level Architecture:**

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Browser                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ Generator UI │  │ Analytics UI │  │ Redirect     │          │
│  │ (Client)     │  │ (Client)     │  │ Handler      │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
└─────────┼──────────────────┼──────────────────┼─────────────────┘
          │                  │                  │
          │ HTTPS            │ HTTPS            │ HTTPS
          ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Vercel Edge Network                          │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ API Route:   │  │ API Route:   │  │ API Route:   │          │
│  │ /api/qr      │  │ /api/analytics│ │ /r/[id]      │          │
│  │ (Generate)   │  │ (Fetch stats)│  │ (Redirect +  │          │
│  │              │  │              │  │  Track)      │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         │                 │                  │                  │
│         └─────────────────┴──────────────────┘                  │
│                           │                                     │
│                           │ SQL Queries                         │
│                           ▼                                     │
│                  ┌─────────────────┐                            │
│                  │ Vercel Postgres │                            │
│                  │ (Database)      │                            │
│                  └─────────────────┘                            │
└─────────────────────────────────────────────────────────────────┘
```

## Architecture Style

**Chosen: Serverless Monolith (Next.js App Router)**

**Justification:**
- **Vercel deployment requirement**: Next.js is Vercel's native framework with first-class support
- **Solo developer efficiency**: Single codebase, shared types, collocated frontend/backend
- **Zero infrastructure management**: No server provisioning, automatic scaling
- **Cost efficiency**: Pay-per-execution on free tier, no idle costs
- **Fast iteration**: Hot reloading, file-based routing, API routes as functions
- **Built-in optimizations**: Edge caching, image optimization, automatic code splitting

**Trade-offs:**
- ✅ Simpler deployment and developer experience
- ✅ Lower operational complexity
- ✅ Better cold start times than microservices
- ⚠️ Less flexible for service-specific scaling (acceptable at 1-100 users)
- ⚠️ Harder to migrate individual components to other platforms (unlikely need)

## System Components

### Frontend (Next.js Client Components)

**Technology:** React 18+ with Next.js 14+ App Router, TypeScript

**Pages:**
1. **Landing/Generator Page (`/`)**
   - URL input field with validation
   - Color pickers for foreground/background
   - Real-time QR code preview canvas
   - Download button (generates PNG)
   - Short URL display after generation
   - Link to analytics dashboard

2. **Analytics Dashboard (`/analytics/[qrId]`)**
   - Total scans counter
   - Time series chart (scans over time)
   - Device breakdown (pie/bar chart)
   - Browser breakdown (pie/bar chart)
   - Geographic distribution (table or simple map)
   - Shareable URL

**Key Libraries:**
- `qrcode` or `qrcode.react` - QR code generation
- `recharts` or `chart.js` - Analytics visualizations
- `tailwindcss` - Styling
- `zod` - Client-side validation
- `react-colorful` - Color picker component

### Backend (Next.js API Routes)

**Technology:** Next.js App Router Route Handlers (serverless functions)

**API Endpoints:**

1. **POST `/api/qr/generate`**
   - Input: `{ targetUrl, fgColor, bgColor }`
   - Validation: URL format, color hex format
   - Generate unique short code (nanoid)
   - Store QR metadata in database
   - Return: `{ shortUrl, qrId, qrCodeDataUrl }`

2. **GET `/api/analytics/[qrId]`**
   - Input: `qrId` (path parameter)
   - Query scans table for all events
   - Aggregate by date, device, browser, location
   - Return: `{ totalScans, scansByDate[], deviceBreakdown, browserBreakdown, locationBreakdown }`

3. **GET `/r/[shortCode]`**
   - Input: `shortCode` (path parameter)
   - Look up target URL from database
   - Record scan event (timestamp, user-agent, IP → geolocation)
   - Redirect to target URL (302)
   - Track event asynchronously (non-blocking)

### Database (Vercel Postgres)

**Technology:** PostgreSQL 15+ (managed by Vercel)

**Connection:**
- `@vercel/postgres` SDK for edge compatibility
- Connection pooling built-in
- Environment variable configuration

**Tables:**
1. `qr_codes` - Stores QR code metadata
2. `scans` - Stores scan events for analytics

See `DATA_MODEL.md` for detailed schema.

### External Services/APIs

**Minimal external dependencies for MVP:**

1. **IP Geolocation (Optional):**
   - Use `@vercel/edge` request headers for basic country/city detection
   - Alternative: `ipapi.co` free tier (1000 requests/day)
   - Fallback: Store IP only, defer geolocation to post-processing

2. **User Agent Parsing:**
   - `ua-parser-js` library (client-side parsing, no API calls)

3. **Vercel Analytics:**
   - Built-in, zero config
   - Tracks page views, web vitals

## Data Flow

### QR Code Generation Flow

```
User Input (URL + Colors)
    ↓
Client-side validation
    ↓
POST /api/qr/generate
    ↓
Server validation (Zod schema)
    ↓
Generate unique short code (nanoid, check uniqueness)
    ↓
Generate QR code image (qrcode library)
    ↓
Store metadata in qr_codes table
    ↓
Return short URL + QR data URL
    ↓
Client displays QR + download button
```

### QR Code Scan & Redirect Flow

```
User scans QR code
    ↓
Browser requests GET /r/[shortCode]
    ↓
Lookup targetUrl in qr_codes table
    ↓
Parse user-agent, IP from request
    ↓
Insert scan event into scans table (async, non-blocking)
    ↓
302 Redirect to targetUrl
    ↓
User lands on destination
```

### Analytics Dashboard Flow

```
User visits /analytics/[qrId]
    ↓
GET /api/analytics/[qrId]
    ↓
Query scans table (filter by qr_code_id)
    ↓
Aggregate:
  - COUNT(*) for total scans
  - GROUP BY date for time series
  - GROUP BY device_type, browser, country
    ↓
Return aggregated data
    ↓
Client renders charts/tables
```

## Key Design Decisions

### Decision 1: No Authentication System

**Context:** Need to balance security, user friction, and development time.

**Options Considered:**
- A) Full auth with NextAuth.js (email/password)
- B) OAuth only (Google/GitHub)
- C) No auth - public QR codes and analytics
- D) Cookie-based anonymous sessions

**Decision:** No authentication (Option C)

**Rationale:**
- **Fastest to market**: No auth flow development, no user management
- **Lowest user friction**: Generate QR codes instantly without signup
- **Acceptable security model**: QR codes are public by nature, analytics URLs are unguessable
- **Simplifies data model**: No users table, no sessions, no permissions
- **MVP-appropriate**: Can add auth later if users request private QR codes

**Trade-offs:**
- ✅ Zero friction for users
- ✅ 50% less development time
- ⚠️ No way to "claim" or manage QR codes later
- ⚠️ Analytics URLs must be kept private by users (security by obscurity)

**Mitigation:**
- Use long, random QR IDs (nanoid, 21 chars) to prevent enumeration
- Implement rate limiting to prevent abuse
- Consider adding optional "claim code" in post-MVP

### Decision 2: Server-Side QR Generation

**Context:** QR codes can be generated client-side or server-side.

**Options Considered:**
- A) Client-side only (browser generates QR, no server storage)
- B) Server-side generation and storage
- C) Hybrid (client preview, server canonical)

**Decision:** Server-side generation (Option B)

**Rationale:**
- **Consistent short URLs**: Must store metadata server-side for redirect
- **Analytics linkage**: Need QR ID to link scans to QR codes
- **Canonical source**: Server-generated QR ensures consistency across downloads
- **Audit trail**: Know exactly what QR codes were created

**Trade-offs:**
- ✅ Single source of truth
- ✅ Analytics work seamlessly
- ✅ Can add features like "view past QR codes" later
- ⚠️ Slight latency vs client-only (acceptable: <1s)
- ⚠️ Server cost for QR generation (minimal on Vercel free tier)

**Implementation:**
- Use `qrcode` npm library in API route
- Return data URL for immediate display
- Store PNG blob in database (or generate on-demand)

### Decision 3: PostgreSQL Over NoSQL

**Context:** Need to choose database for QR metadata and analytics.

**Options Considered:**
- A) PostgreSQL (Vercel Postgres)
- B) MongoDB (Atlas)
- C) Firebase/Firestore
- D) Redis (Upstash)

**Decision:** PostgreSQL via Vercel Postgres (Option A)

**Rationale:**
- **Vercel integration**: First-class support, zero config
- **Relational data**: QR codes → scans is clear 1:many relationship
- **Analytics queries**: SQL aggregations (GROUP BY, COUNT) are perfect for analytics
- **Cost**: Generous free tier (256 MB storage, 10k rows)
- **Developer experience**: Familiar SQL, great TypeScript support

**Trade-offs:**
- ✅ Excellent for aggregations and joins
- ✅ Strong consistency guarantees
- ✅ Familiar query language
- ⚠️ Less flexible schema vs NoSQL (not a concern here)
- ⚠️ Vertical scaling limits (not a concern at 1-100 users)

### Decision 4: Asynchronous Scan Tracking

**Context:** Redirect should be fast, but we need to track analytics.

**Options Considered:**
- A) Synchronous: Insert scan event, then redirect (blocking)
- B) Asynchronous: Redirect immediately, track in background
- C) Client-side: JavaScript beacon after redirect
- D) Defer to queue (e.g., Vercel KV + worker)

**Decision:** Asynchronous server-side tracking (Option B)

**Rationale:**
- **User experience**: Redirect latency is critical, aim for <200ms
- **Reliability**: Server-side tracking more reliable than client-side
- **Simplicity**: No queue infrastructure needed for MVP scale
- **Acceptable risk**: If tracking fails, redirect still works

**Implementation:**
```typescript
// Pseudo-code
const targetUrl = await getTargetUrl(shortCode);
const scanEvent = parseScanData(request);

// Non-blocking insert
insertScanEvent(scanEvent).catch(err => logError(err));

// Immediate redirect
return redirect(targetUrl, 302);
```

**Trade-offs:**
- ✅ Fast redirects (<200ms)
- ✅ Simple implementation
- ⚠️ Potential data loss if insert fails (log errors for monitoring)
- ⚠️ No retry mechanism (acceptable for MVP)

### Decision 5: Vercel-Only Deployment

**Context:** Target platform is Vercel, but should we design for portability?

**Options Considered:**
- A) Vercel-only (use Vercel Postgres, Edge functions)
- B) Portable (use generic Postgres, avoid Vercel-specific APIs)
- C) Multi-cloud from day 1

**Decision:** Vercel-only for MVP (Option A)

**Rationale:**
- **Speed to market**: Leverage Vercel's zero-config tooling
- **Cost**: Free tier is generous (100GB bandwidth, 100k edge requests)
- **Developer experience**: Single platform, integrated observability
- **YAGNI principle**: Don't design for portability we don't need yet

**Trade-offs:**
- ✅ Fastest development
- ✅ Zero infrastructure management
- ✅ Excellent DX (preview deployments, analytics, logs)
- ⚠️ Vendor lock-in (mitigated: Next.js is portable, Postgres is standard)
- ⚠️ Harder to migrate later (acceptable risk for MVP)

**Mitigation:**
- Use standard SQL (no Vercel Postgres-specific features)
- Abstract database queries into repository layer
- Use environment variables for all config

## Security Considerations

### Input Validation
- **URL validation**: Validate target URLs to prevent XSS (allow http/https only)
- **Color validation**: Validate hex colors (regex: `^#[0-9A-Fa-f]{6}$`)
- **Short code validation**: Alphanumeric only, fixed length

### SQL Injection Prevention
- Use parameterized queries exclusively (Vercel Postgres SDK handles this)
- Never interpolate user input into SQL strings

### XSS Prevention
- Sanitize all user inputs before rendering
- Use React's built-in XSS protections (auto-escaping)
- Set proper Content-Security-Policy headers

### Rate Limiting
- Implement rate limiting on `/api/qr/generate` (e.g., 10 requests/minute per IP)
- Implement rate limiting on redirect route (prevent DDoS)
- Use Vercel Edge Middleware for rate limiting

### HTTPS Only
- Enforce HTTPS via Vercel (automatic)
- Set `Strict-Transport-Security` header

### Analytics Privacy
- Do NOT store full IP addresses (hash or truncate last octet)
- Comply with GDPR: Store minimal PII, allow data deletion
- No cookies for tracking (use server-side logging)

### Short Code Security
- Use cryptographically random short codes (nanoid)
- Make codes long enough to prevent enumeration (21 chars = 2^126 space)
- Check uniqueness before insertion

## Scalability Strategy

**Current Scale:** 1-100 concurrent users

**Vertical Scaling (Vercel handles automatically):**
- Serverless functions auto-scale with traffic
- Edge network distributes load globally
- Database connection pooling via Vercel Postgres

**Horizontal Scaling (Future):**
- **Database**: Migrate to dedicated Postgres instance (Supabase, Neon, RDS)
- **Caching**: Add Redis (Upstash) for hot QR codes
- **CDN**: Cache QR code images on Vercel Edge
- **Read replicas**: Separate analytics queries to read replica

**Performance Optimizations:**
- Index frequently queried columns (qr_code_id, created_at)
- Implement pagination for analytics (if >1000 scans)
- Cache aggregated analytics (e.g., 5-minute TTL)
- Use Vercel Edge Caching for static QR code images

**Monitoring Triggers:**
- If database connections > 80% → add connection pooler
- If redirect latency > 500ms → investigate slow queries
- If analytics load time > 3s → implement caching

## Deployment Architecture

**Platform:** Vercel

**Environments:**
1. **Development** (`localhost:3000`)
   - Local Next.js dev server
   - Vercel Postgres (dev database or local Docker)

2. **Preview** (Vercel preview deployments)
   - Auto-deployed on every PR
   - Separate preview database (or shared dev database)
   - Preview URLs: `qr-track-git-<branch>-<username>.vercel.app`

3. **Production** (`qr-track.vercel.app` or custom domain)
   - Deployed from `main` branch
   - Production Vercel Postgres instance
   - Edge network CDN

**Deployment Pipeline:**
```
Git Push to GitHub
    ↓
Vercel Webhook triggers
    ↓
Install dependencies (pnpm)
    ↓
Build Next.js app (next build)
    ↓
Run database migrations (Prisma or raw SQL)
    ↓
Deploy to Edge Network
    ↓
Health checks
    ↓
Route traffic to new deployment
```

**Rollback Strategy:**
- Vercel instant rollback to previous deployment
- Database migrations are versioned (use Prisma migrations or dbmate)

**Environment Variables:**
```
# Production
POSTGRES_URL=<vercel-postgres-url>
NEXT_PUBLIC_BASE_URL=https://qr-track.vercel.app

# Preview
POSTGRES_URL=<preview-db-url>
NEXT_PUBLIC_BASE_URL=https://<preview>.vercel.app
```

## Monitoring & Observability

### Vercel Analytics (Built-in)
- Page views and traffic
- Web Vitals (LCP, FID, CLS)
- Edge function execution times
- Bandwidth usage

### Application Logging
- Next.js console logs → Vercel logs dashboard
- Log errors on scan tracking failures
- Log rate limit violations

### Metrics to Track
1. **Performance:**
   - QR generation latency (target: <1s)
   - Redirect latency (target: <200ms)
   - Analytics API response time (target: <2s)

2. **Business:**
   - QR codes generated per day
   - Total scans per day
   - Average scans per QR code
   - Analytics dashboard views

3. **Errors:**
   - Failed QR generations (validation errors)
   - Failed database inserts
   - Failed redirects (404s for missing short codes)

### Alerting (Post-MVP)
- Set up Vercel Notifications for deployment failures
- Consider adding Sentry for error tracking in production

### Debugging
- Vercel logs for runtime errors
- Chrome DevTools for client-side debugging
- Database query logs for slow queries

## Future Architecture Considerations

**If we need to scale beyond 100 users:**
1. Add Redis caching layer (Upstash)
2. Implement database read replicas
3. Move analytics to time-series database (ClickHouse, TimescaleDB)
4. Add background job queue (Vercel Cron or Quirrel)
5. Implement CDN caching for QR code images

**If we add authentication:**
1. Integrate NextAuth.js
2. Add users table and foreign keys
3. Implement row-level security in database
4. Add user dashboard for managing QR codes

**If we need multi-tenancy:**
1. Add organizations/workspaces table
2. Implement data isolation per tenant
3. Add billing integration (Stripe)
