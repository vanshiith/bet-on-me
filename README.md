# BetOnMe

A habit tracking app with financial accountability. Build better habits by putting (simulated) money on the line.

## Current Status: Phase 1 Complete ✅

**What's Working:**
- ✅ User authentication (sign up, login, logout)
- ✅ Protected dashboard
- ✅ Database with tables for habits, occurrences, and penalties

**Next Up:** Phase 2 - Habit Management

## Quick Start

See [SETUP_GUIDE.md](SETUP_GUIDE.md) for complete setup instructions.

```bash
# 1. Install dependencies
pnpm install

# 2. Set up Supabase (see SETUP_GUIDE.md)

# 3. Configure .env.local with your Supabase credentials

# 4. Run database migrations (copy supabase/schema.sql to Supabase SQL Editor)

# 5. Start the app
pnpm dev
```

## Development Roadmap

See [DEVELOPMENT_PLAN.md](DEVELOPMENT_PLAN.md) for the complete 6-phase plan.

### Phase 1: Foundation & Authentication ✅ COMPLETE
- Next.js + Supabase setup
- Sign up / Login / Logout
- Protected routes

### Phase 2: Habit Management (Next)
- Create, edit, delete habits
- Custom penalty amounts
- Habit dashboard

### Phase 3: Daily Check-ins
- Today view with check-in buttons
- Bedtime cutoff settings
- Mark habits completed/missed

### Phase 4: Penalties & Tracking
- Automatic penalty calculation
- View total "donated"
- Penalty history

### Phase 5: Streaks & Analytics
- Streak tracking
- Completion charts
- Progress visualization

### Phase 6: Notifications & Polish
- Email reminders
- UI improvements
- Settings page

## Tech Stack

- **Frontend:** Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend:** Supabase (PostgreSQL + Auth)
- **Hosting:** Vercel (planned)

## Documentation

- [SETUP_GUIDE.md](SETUP_GUIDE.md) - How to set up and test Phase 1
- [DEVELOPMENT_PLAN.md](DEVELOPMENT_PLAN.md) - Complete development roadmap
