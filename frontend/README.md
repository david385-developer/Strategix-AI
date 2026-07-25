# Strategix AI

An AI-Powered Marketing Operations Platform — plan, collaborate, execute, and optimize marketing campaigns from one intelligent workspace.

## Stack

- **React 18** + **TypeScript**
- **Vite** (build tooling, code-split routes)
- **Tailwind CSS** (design system, light/dark themes)
- **React Router v7** (routing)
- **Radix UI** primitives (accessible dialogs, dropdowns, tabs, selects, etc.)
- **Framer Motion** (animations & micro-interactions)
- **Recharts** (analytics dashboards)
- **React Hook Form** + **Zod** (auth forms)
- **TanStack Query** (data layer ready)
- **Lucide Icons**

## What's built

**Marketing site**
- Landing page — hero, features, benefits, how-it-works, AI features, testimonials, pricing, FAQ, CTA, footer

**Auth**
- Login, Register, Forgot Password (with split-screen brand panel + validation)

**Onboarding**
- 4-step guided flow: Workspace → Business info → Brand profile → Completion

**App (authenticated workspace)**
- Dashboard — welcome banner, stat cards with sparklines, current campaigns, AI recommendations, upcoming posts, quick actions, approvals, activity feed, performance snapshot, marketing health score
- Campaigns — grid/list views, filters, search, status tracking
- Campaign detail — overview (charts, channel split), content, timeline, AI strategy tabs
- New Campaign — AI Campaign Planner conversational interface with generated strategy cards
- Content Studio — 9 content types, AI generation, copy/edit/regenerate/favorite/save/schedule actions
- Content Calendar — month & week views, color-coded statuses, channel indicators
- Analytics — engagement charts, growth trends, channel distribution, content performance, posting frequency, marketing health score, AI insights panel
- AI Assistant — full chat page + floating assistant
- Brand Profile — business info, brand voice, goals, platforms
- Team — members table, kanban task board, activity feed
- Notifications — grouped (today/yesterday/this week), unread filter, action buttons
- Settings — workspace, profile, brand, notifications, security (2FA, sessions), subscription, appearance (theme)

**Design system**
- Reusable UI primitives: Button, Card, Badge, Input, Label, Dialog, Dropdown Menu, Tabs, Avatar, Progress, Switch, Separator, Tooltip, Select, Scroll Area, Skeleton, Toast
- Shared components: PageHeader, EmptyState, StatCard, Sparkline
- Light & dark themes, persistent sidebar, responsive layout (mobile → desktop)

## Dev

```bash
npm install
npm run dev      # start dev server
npm run build    # production build
npm run typecheck
```
