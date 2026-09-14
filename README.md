# OTU LaunchPad

A public showcase for projects built by Ontario Tech University students. Anyone can browse.
Verified Ontario Tech students can post their projects and upvote others.

Built and maintained by GDG on Campus at Ontario Tech University.

> LaunchPad is an independent student club project. It is not affiliated with, endorsed by, or an
> official service of Ontario Tech University. "OTU" is in the name because the site is for Ontario
> Tech students. No university logo or mark is used anywhere in this repository.

## Status

Working skeleton. Layout, routing, and components are real. Data and authentication are stubbed
behind seams so the backend can be built without touching the UI. See the state table in
[AGENTS.md](AGENTS.md#current-state).

## Quick start

Requires Node 20 or newer.

```bash
git clone https://github.com/gdg-otu/launchpad.git
cd launchpad
npm install
npm run dev
```

Open http://localhost:5173. No environment variables are needed while the app runs on mock data.

## Scripts

| Command           | What it does                                    |
| ----------------- | ----------------------------------------------- |
| `npm run dev`     | Dev server with hot reload                      |
| `npm run check`   | Typecheck, lint, and format check. The CI gate. |
| `npm run format`  | Apply Prettier formatting                       |
| `npm run build`   | Production build into `dist/`                   |
| `npm run preview` | Serve the production build locally              |

## Stack

React 19, TypeScript, Vite, Tailwind CSS v4, react-router. Planned backend is Supabase with Vercel
serverless functions, deployed on Vercel.

## Documentation

- [CONTRIBUTING.md](CONTRIBUTING.md) - how to make your first change
- [TODO.md](TODO.md) - the feature backlog, with priorities and known gaps
- [AGENTS.md](AGENTS.md) - conventions, recipes, and rules for AI coding agents
- [docs/architecture.md](docs/architecture.md) - why the code is shaped this way
- [docs/auth.md](docs/auth.md) - how student verification works and what is not yet secure

## Contributing

Students are welcome to contribute, and this is a good repository to make a first open source pull
request in. Start with [CONTRIBUTING.md](CONTRIBUTING.md).
