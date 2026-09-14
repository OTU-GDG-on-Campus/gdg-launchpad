# Contributing

This is a student project and a good place to make a first open source pull request. If something
here is unclear, that is a bug in this document. Say so in Discord and we will fix it.

## Setup

Requires Node 20 or newer.

```bash
git clone https://github.com/gdg-otu/launchpad.git
cd launchpad
npm install
npm run dev
```

Open http://localhost:5173. The app runs on mock data, so there is nothing else to configure.

## Making a change

1. Branch off `main`: `git checkout -b your-change`
2. Make the change. Read [AGENTS.md](AGENTS.md) for the conventions, they are short.
3. Run `npm run check`. It must pass.
4. Commit and push, then open a pull request.

Vercel builds a preview URL for every pull request. Put it in the description if your change is
visual, and a screenshot if it is worth one.

## What to work on

Good first issues are labelled in the issue tracker. If you want to propose something instead,
open an issue first so nobody duplicates your work.

## Conventions worth knowing up front

These trip people up most often. The full set is in [AGENTS.md](AGENTS.md).

- **Every file starts with a one or two line comment saying what it is for.** If you change what a
  file does, update that header in the same commit.
- **Comments are rare and short.** Name things well instead. Write a comment only for something
  the code cannot say on its own, and never more than two lines.
- **No em dashes.** Anywhere. Use a regular hyphen with spaces around it, or rewrite the sentence.
- **All data access goes through `src/lib/api/client.ts`.** Never import mock data or call an API
  from a component.
- **Nothing secret behind a `VITE_` prefix.** Those variables are shipped to the browser.

## Using AI tools

Using Claude Code, Copilot, or anything similar is fine and encouraged. Two conditions:

1. Point the tool at [AGENTS.md](AGENTS.md) so it follows the same conventions you would.
2. Read and understand what it wrote before you open the pull request. You are the author, and
   review questions come to you.

## Reviews

Someone from the tech team reviews each pull request. Expect comments, including on small things
like a stale file header. That is normal and not a judgement of the work.

If a review stalls for more than a few days, ping in Discord.
