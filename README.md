# BetOnMe

A habit tracking app with financial accountability. Build better habits by putting (simulated) money on the line.

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
