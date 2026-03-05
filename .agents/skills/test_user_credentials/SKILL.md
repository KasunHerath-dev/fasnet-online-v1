---
name: test_user_credentials
description: Stores the test user credentials for logging into the student portal, and the Learnify UI design system reference for this project.
---

# AI Work Instructions & Priority Rules

**ALWAYS READ AND FOLLOW THIS ORDER EVERY TIME YOU START:**
1. **Frontend Server:** The frontend must ALWAYS be run on port `3000` (e.g., in `vite.config.js`). Never use 5173 or 3001 unless specifically forced.
2. **Network Access:** Ensure `npm run dev -- --host` (or configure vite to `host: '0.0.0.0'`) is used so the user can see it on mobile/local network.
3. **Efficiency:** Stick precisely to the tasks, read files directly through tools, and do not trigger bloated loaders.
4. **Design Requirements:** Always match the Learnify standard perfectly.

---

# Test User Credentials

Use these credentials to log in as a student for testing the portal.

| Field    | Value  |
|----------|--------|
| Username | 242074 |
| Password | abc123 |

---

# Learnify UI Design System

This project's student portal is themed after the **Learnify** design system. Use this as a reference whenever building or editing UI components.

## Font
- **Primary Font:** `Kodchasan` (from Google Fonts)
- Apply using Tailwind: `font-['Kodchasan'] tracking-wide`

## Color Palette

| Name             | Hex       | Usage                                          |
|------------------|-----------|------------------------------------------------|
| Primary Dark     | `#151313` | Sidebar background, dark promo cards, text     |
| Accent Orange    | `#ff5734` | Buttons (CTA), highlights, active states      |
| Soft Purple      | `#be94f5` | Accent color, pill tags, decorative elements  |
| Warm Yellow      | `#fccc42` | Active sidebar icon background, category pills |
| Light Background | `#f7f7f5` | Main page background                           |

## Layout Structure

The dashboard has a **split layout**:
- **Left Sidebar:** Dark (`#151313`) with large rounded-right corners. Active nav icon uses a yellow (`#fccc42`) rounded-square background.
- **Top Navbar:** Shows "Welcome to Learnify/FASNET", a pill-shaped search bar with an orange search button, and a user profile (avatar + name).
- **Main Content Area:** Light background (`#f7f7f5`), uses rounded cards (`rounded-[2rem]`) with `shadow-sm`.

## Key Dashboard Components

### Stat/Course Cards (Top Row)
- Background: Pastel colors — **Yellow** (`#fde047`), **Purple** (`#e9d5ff`), **Sky Blue** (`#bae6fd`)
- Style: `rounded-[2rem]`, category pill, bold title, progress bar, stacked avatar row, orange "Continue" button.

### "My Next Lessons" / Notice Board (White Card)
- Background: **White**, `border border-slate-200`, `rounded-[2rem]`
- Columns: Lesson / Teacher (avatar + name) / Duration
- "View all lessons" link in **orange** (`#ff5734`) top-right

### Promo / Resources Card (Dark Card)
- Background: `#151313` (dark)
- Category pill: `#fccc42` (yellow) text on dark
- Title: Large, bold, white
- "They are already studying" with stacked avatars + count badge
- Full-width orange CTA button (`#ff5734`)

## General Rules
- **Rounded corners everywhere:** `rounded-[2rem]` for cards, `rounded-xl` for buttons/pills.
- **Hover effects:** Cards gently lift on hover: `hover:-translate-y-1 transition-transform`
- **Animations:** Use `animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both` for page-load reveal.
- **No harsh shadows:** Use `shadow-sm` mostly; dark cards use `shadow-xl shadow-black/10`.
- **Typography:** Bold headings (`font-bold` or `font-black`), muted subtitles in `text-slate-400` or `text-slate-500`.
