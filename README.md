# MYOTT - Production-Ready OTT Platform

MYOTT is a modern, high-performance OTT-style platform built with Next.js 15, TypeScript, and Tailwind CSS.

## Features
- **Next.js 15 App Router**: Utilizing the latest features of Next.js for optimal performance.
- **Dark Mode by Default**: Seamless dark theme using `next-themes`.
- **Production-Ready Structure**: Clean and scalable folder architecture.
- **Tailwind CSS**: Utility-first styling with custom theme configuration.
- **TypeScript**: Type safety across the entire codebase.

## Getting Started

### Prerequisites
- Node.js 18.x or later
- npm or yarn

### Installation
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install --legacy-peer-deps
   ```

### TMDB API Key
This project requires a TMDB API key to fetch movie and TV show data.
1. Create an account on [The Movie Database (TMDB)](https://www.themoviedb.org/).
2. Generate an API Key (v3 auth).
3. Add your key to `.env.local`:
   ```env
   NEXT_PUBLIC_TMDB_API_KEY=your_api_key_here
   ```

### Running the Project
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to see the result.

## Folder Structure

- `src/app`: App router pages and layouts.
- `src/components`: Reusable UI components.
  - `ui/`: Base UI primitives (buttons, inputs, etc.).
  - `layout/`: Layout-specific components like Navbar.
  - `common/`: Shared components like ThemeProvider.
- `src/lib`: Utility functions and shared logic.
- `src/hooks`: Custom React hooks.
- `src/types`: TypeScript interfaces and types.
- `src/server`: Server-side logic and API interactions.

## Tech Stack
- [Next.js 15](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Lucide React](https://lucide.dev/)
- [Framer Motion](https://www.framer.com/motion/)
- [next-themes](https://github.com/pacocoursey/next-themes)
