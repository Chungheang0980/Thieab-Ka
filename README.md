# ធៀបការ (Thieab Ka)

Thieab Ka is a bilingual Khmer/English digital wedding invitation application. Organizers can design an invitation, manage guests, create personal invitation links and QR codes, collect RSVPs, and run a lucky draw for attending guests.

## Features

- Account signup and login with seven-day database-backed sessions
- Wedding editor with six invitation themes and optional animation
- YouTube song links plus uploaded pre-wedding photo galleries and video displayed on invitations
- Guest management with individual entry and Excel/CSV import
- Unique invitation URL, QR code, and lucky ID for each guest
- Public guest invitation with attending/declined RSVP actions
- RSVP dashboard and lucky draw for confirmed guests
- Responsive Khmer/English interface

## Technology

- Next.js 15 App Router
- React 19 and TypeScript
- PostgreSQL through `pg`
- Framer Motion, Lucide React, and `react-qr-code`
- Papa Parse and `read-excel-file` for guest imports
- Plain CSS in `app/globals.css`

## Requirements

- Node.js 20.9 or newer
- npm
- A PostgreSQL database with SSL support

## Local Setup

1. Enter the application directory and install dependencies:

   ```bash
   cd thieab-ka
   npm install
   ```

2. Create the local environment file:

   ```bash
   cp .env.example .env.local
   ```

3. Set `POSTGRES_URL` in `.env.local` to a PostgreSQL connection string:

   ```dotenv
   POSTGRES_URL=postgresql://USER:PASSWORD@HOST:5432/DATABASE
   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   ```

4. Initialize the database:

   ```bash
   psql "$POSTGRES_URL" -f db/schema.sql
   ```

   The database user must be allowed to create the `pgcrypto` extension. If the extension is already installed, it only needs permission to create the application tables and indexes.

5. Start the development server:

   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000). The home page redirects to `/admin/login`; create an account from the signup tab on first use.

## Environment Variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `POSTGRES_URL` | Yes | PostgreSQL connection string used by authentication, wedding, guest, and RSVP APIs |
| `NEXT_PUBLIC_BASE_URL` | Optional | Legacy deployment setting; invitation links now use the active application origin |

Invitation QR codes use the active deployment origin. During local development, the share page detects the computer's LAN address so phones on the same Wi-Fi can open invitations.

## Scripts

```bash
npm run dev      # Start the development server
npm run build    # Type-check and create a production build
npm run start    # Serve the production build
npm run lint     # Currently requires ESLint migration; see Project Review
```

## Main Routes

| Route | Access | Purpose |
| --- | --- | --- |
| `/` | Public | Redirects to admin login |
| `/admin/login` | Public | Account login and signup |
| `/admin` | Authenticated | Dashboard and RSVP summary |
| `/admin/designer` | Authenticated | Wedding details and invitation theme editor |
| `/admin/guests` | Authenticated | Guest entry, search, deletion, and Excel/CSV import |
| `/admin/share` | Authenticated | Personal links and QR codes |
| `/admin/draw` | Authenticated | Lucky draw for attending guests |
| `/invite/[id]` | Public link | Guest invitation and RSVP |

## API Routes

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET|PUT /api/data`
- `POST /api/data/guests`
- `DELETE /api/data/guests/[id]`
- `GET|PATCH /api/invitations/[id]`

Admin APIs resolve the account from the `thieab-ka-client` HTTP-only session cookie. Public invitation IDs act as access tokens for viewing and updating an RSVP, so invitation links should only be shared with their intended guests.

## Data Model

The schema in `db/schema.sql` creates:

- `client_accounts`: organizer usernames and scrypt password hashes
- `client_sessions`: hashed session tokens and expiry times
- `weddings`: one JSON wedding document per organizer, including theme and media links
- `guests`: guest contact data, table, lucky ID, and RSVP status

Deleting an account cascades to its sessions, wedding, and guests.

## Guest Import

The guest manager accepts `.xlsx` and `.csv` files. The first row must contain a name column; phone and table are optional.

Recognized English headers include `name`, `phone`, and `table`. Khmer header aliases are also supported. A sample is available at `public/guest-import-template.csv`.

## Production

```bash
npm run build
npm run start
```

For Vercel, connect the repository, set the root directory to `thieab-ka`, configure `POSTGRES_URL` and `NEXT_PUBLIC_BASE_URL`, and run `db/schema.sql` against the production database before creating the first account.

## Project Review

Review performed on June 12, 2026:

- `npm run build` passes, including TypeScript validation and generation of all application routes.
- The application now persists accounts, wedding data, guests, and RSVPs in PostgreSQL. The previous README statement about browser local storage and Supabase was outdated.
- `npm run lint` is not currently usable in non-interactive environments. It invokes the deprecated `next lint` command, but no ESLint packages or configuration are installed.
- No automated unit, integration, or browser tests are present.
- Several client-side writes are optimistic and do not display API or database failures. Production hardening should add response checks and user-visible retry/error states.
- Public invitation URLs permit RSVP updates by design. Anyone with a guest URL can update that guest's response.

The generated venue image used by the invitation is stored at `public/khmer-wedding-venue.png`.
