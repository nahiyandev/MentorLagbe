<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Tailwind CSS v4 Canonical Rules
- Always use Tailwind v4 canonical gradient utilities: `bg-linear-to-r`, `bg-linear-to-br`, `bg-linear-to-b`, `bg-linear-to-t` instead of legacy `bg-gradient-to-*`.
- Prefer numeric scale classes (e.g. `max-w-32.5` for 130px) instead of arbitrary bracket values where applicable.
- Never let VS Code `suggestCanonicalClasses` or `cssConflict` lint warnings appear in the project.
- Never use conflicting CSS utility classes on the same element (e.g. combining `mt-auto` with `mt-5`, or duplicate margin/padding/display classes).

