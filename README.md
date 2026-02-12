# QR Track

A modern QR code generator with built-in analytics tracking. Generate custom QR codes with color customization, get unique trackable short URLs, and view detailed scan analytics in an intuitive dashboard.

## Features

- **Custom QR Code Generation**: Create QR codes with customizable foreground and background colors
- **Trackable Short URLs**: Each QR code gets a unique short URL for easy sharing
- **Real-time Analytics**: Track scans with detailed metrics including:
  - Total scan count
  - Scans over time (time series)
  - Device breakdown (mobile, tablet, desktop)
  - Browser breakdown
  - Geographic distribution (country, city)
- **No Authentication Required**: Generate and track QR codes instantly without signup
- **Privacy-Focused**: IP addresses are truncated for GDPR compliance
- **Fast Redirects**: <200ms redirect latency with asynchronous tracking

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 3
- **Database**: Vercel Postgres (PostgreSQL 15)
- **Deployment**: Vercel
- **Charts**: Recharts
- **QR Generation**: qrcode library

## Prerequisites

- Node.js 18.17.0 or higher
- pnpm 8.0.0 or higher (recommended) or npm
- Vercel account (for deployment and database)

## Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd qr-track
```

### 2. Install Dependencies

```bash
# Using pnpm (recommended)
pnpm install

# Or using npm
npm install
```

### 3. Set Up Environment Variables

```bash
cp .env.example .env
```

Edit `.env` and add your Vercel Postgres credentials:

```env
POSTGRES_URL="postgres://..."
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

To get Vercel Postgres credentials:
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Create a new project or select existing
3. Go to Storage → Create Database → Postgres
4. Copy the connection strings to your `.env` file

### 4. Set Up Database

Run the database migrations:

```bash
# Connect to your Postgres database and run:
psql $POSTGRES_URL -f db/schema.sql

# Optional: Load sample data for testing
psql $POSTGRES_URL -f db/seed.sql
```

### 5. Run Development Server

```bash
pnpm dev
# or
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
qr-track/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/                # API routes
│   │   │   ├── qr/generate/    # QR code generation endpoint
│   │   │   └── analytics/[qrId]/ # Analytics endpoint
│   │   ├── r/[shortCode]/      # Redirect handler
│   │   ├── analytics/[qrId]/   # Analytics dashboard page
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Home page (generator)
│   │   └── globals.css         # Global styles
│   ├── components/             # React components
│   │   ├── QRGenerator.tsx     # QR code generator UI
│   │   └── AnalyticsDashboard.tsx # Analytics dashboard UI
│   ├── lib/                    # Utility functions
│   │   ├── db.ts               # Database queries
│   │   ├── qr-generator.ts     # QR code generation
│   │   └── utils.ts            # Helper functions
│   └── types/                  # TypeScript types
│       ├── database.ts         # Database entity types
│       └── api.ts              # API request/response types
├── db/                         # Database files
│   ├── schema.sql              # Complete database schema
│   ├── migrations/             # Migration files
│   │   ├── 001_create_qr_codes_table.sql
│   │   └── 002_create_scans_table.sql
│   └── seed.sql                # Sample data for testing
├── docs/                       # Documentation
│   ├── PRD.md                  # Product Requirements
│   ├── ARCHITECTURE.md         # System Architecture
│   ├── TECH_STACK.md           # Technology Stack
│   └── DATA_MODEL.md           # Database Schema
├── public/                     # Static assets
├── package.json                # Dependencies and scripts
├── tsconfig.json               # TypeScript configuration
├── tailwind.config.ts          # Tailwind CSS configuration
├── next.config.js              # Next.js configuration
└── README.md                   # This file
```

## API Endpoints

### POST /api/qr/generate

Generate a new QR code with tracking.

**Request Body:**
```json
{
  "targetUrl": "https://example.com",
  "fgColor": "#000000",
  "bgColor": "#FFFFFF"
}
```

**Response:**
```json
{
  "id": 1,
  "short_code": "abc123xyz",
  "short_url": "https://qr-track.vercel.app/r/abc123xyz",
  "qr_code_data_url": "data:image/png;base64,...",
  "analytics_url": "https://qr-track.vercel.app/analytics/1"
}
```

### GET /api/analytics/[qrId]

Fetch analytics for a QR code.

**Response:**
```json
{
  "total_scans": 42,
  "scans_by_date": [
    { "date": "2026-02-12", "count": 15 }
  ],
  "device_breakdown": [
    { "device_type": "mobile", "count": 25 },
    { "device_type": "desktop", "count": 17 }
  ],
  "browser_breakdown": [
    { "browser": "Chrome", "count": 30 },
    { "browser": "Safari", "count": 12 }
  ],
  "location_breakdown": [
    { "country": "US", "city": "San Francisco", "count": 20 }
  ]
}
```

### GET /r/[shortCode]

Redirect to target URL and track scan event.

**Response:** 302 redirect to target URL

## Development

### Available Scripts

```bash
# Run development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Lint code
pnpm lint

# Type check
pnpm type-check
```

### Code Quality

The project uses:
- **ESLint**: Linting with Next.js recommended config
- **Prettier**: Code formatting with Tailwind plugin
- **TypeScript**: Strict mode enabled

## Deployment

### Deploy to Vercel

1. **Push to GitHub** (if not already)

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-repo-url>
git push -u origin main
```

2. **Connect to Vercel**

   - Go to [Vercel Dashboard](https://vercel.com/new)
   - Import your repository
   - Configure environment variables (copy from `.env`)
   - Deploy

3. **Set Up Database**

   - In Vercel dashboard: Storage → Create Database → Postgres
   - Run migrations using Vercel Postgres dashboard SQL editor
   - Paste contents of `db/schema.sql` and execute

4. **Update Environment Variables**

   - Set `NEXT_PUBLIC_BASE_URL` to your production URL
   - Vercel automatically provides `POSTGRES_URL` and related variables

### Environment Variables

Required environment variables:

```env
# Database (auto-provided by Vercel Postgres)
POSTGRES_URL=
POSTGRES_PRISMA_URL=
POSTGRES_URL_NON_POOLING=
POSTGRES_USER=
POSTGRES_HOST=
POSTGRES_PASSWORD=
POSTGRES_DATABASE=

# Application
NEXT_PUBLIC_BASE_URL=  # Your production URL
```

## Performance

Target performance metrics:
- **QR Generation**: <1 second
- **Redirect Latency**: <200ms
- **Analytics Load**: <2 seconds
- **Page Load**: <2 seconds on 3G

## Security

- ✅ HTTPS enforced (Vercel automatic)
- ✅ SQL injection prevention (parameterized queries)
- ✅ XSS protection (React auto-escaping)
- ✅ GDPR compliance (IP truncation)
- ✅ Secure short codes (nanoid, 21 chars)
- ✅ Security headers (CSP, HSTS, X-Frame-Options)

## Documentation

Detailed documentation is available in the `docs/` directory:

- [Product Requirements Document (PRD)](docs/PRD.md)
- [System Architecture](docs/ARCHITECTURE.md)
- [Technology Stack](docs/TECH_STACK.md)
- [Data Model](docs/DATA_MODEL.md)

## Troubleshooting

### Database Connection Error

**Error**: `Failed to connect to database`

**Solution**:
1. Verify Vercel Postgres is created and running
2. Check `.env` has correct connection strings
3. Ensure database schema is applied (`db/schema.sql`)

### QR Code Not Redirecting

**Error**: QR code scan shows "not found"

**Solution**:
1. Check short code exists in database
2. Verify `NEXT_PUBLIC_BASE_URL` is correct
3. Check Vercel deployment logs for errors

### Analytics Not Loading

**Error**: Dashboard shows "Failed to fetch analytics"

**Solution**:
1. Verify QR code ID is valid
2. Check database has scans table
3. Review Vercel function logs

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- Open an issue on GitHub
- Check [documentation](docs/)
- Review [architecture decisions](docs/ARCHITECTURE.md)

## Roadmap

Future enhancements (post-MVP):
- [ ] User authentication (NextAuth.js)
- [ ] Custom short URL slugs (vanity URLs)
- [ ] QR code templates and presets
- [ ] Logo embedding in QR codes
- [ ] Export analytics as CSV
- [ ] API access for programmatic generation
- [ ] Real-time analytics (live updates)
- [ ] QR code expiration dates
- [ ] Password-protected QR codes

---

Built with ❤️ using Next.js and deployed on Vercel
