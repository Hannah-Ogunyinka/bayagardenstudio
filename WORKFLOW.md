# Development workflow

How changes to bayagardenstudio.com are made, checked and released.

## Branches
- **main** is the live site. Whenever something is merged into it, Cloudflare builds it and publishes it to bayagardenstudio.com.
- **staged** is where changes are checked before they go live. Cloudflare builds it to a preview link that stays the same every time. *Why:* you and your clients can review the real site online at the same address, without touching the live one.
- **Never edit main directly.** Changes reach it only when staged is merged into it. *Why:* the two branches never get out of step, and nothing goes live unchecked.

## Claude's process (developer partner)
1. Make each change on its own short-lived branch, named after what it does. *Why:* Hannah can review each change on its own, and turn it down if needed.
2. Open a pull request into staged. The title says what changed, such as "Fix footer spacing", and the description says what changed and why. *Why:* it shows every change side by side, keeps a record of why it was made, and runs a build check.
3. Tell Hannah in the project chat when it's ready for review (only necessary for an AI developer; a human developer will probably text Hannah).

## Hannah's process (chief decision maker)
1. **Review the pull request.** Auto-fetch brings in its branch. Switch to that branch in VS Code and run npm run dev to see it at localhost:4321, or read the changes on GitHub or in the GitHub Pull Requests extension. *Why:* see the change working before accepting it.
2. **Merge it into staged** if happy. The staged preview link updates within a couple of minutes. *Why:* check it on real devices and share it with clients.
3. **Own edits go straight onto staged.** Pull first, edit, check at localhost, then commit and push. Use a separate branch only for a big feature. *Why:* a new branch for every small edit is extra work with no benefit for the decision maker.
4. **Release.** Open a pull request from staged into main, titled "Release: [date]" with a list of what's included, then merge it. Adding a "release" label is optional. *Why:* one last overview of everything going live, a build check, and a history of releases that helps if one ever needs undoing.
5. **If a live build fails,** the old site stays up. Fix the problem in staged and release again.

## Good habits
- Run git pull before editing, to start from the latest version.
- Keep the project outside iCloud, in ~/Sites. *Why:* iCloud syncing creates stray files that confuse git.
- Don't commit package-lock.json when it changes unexpectedly. *Why:* npm install rewrites that file on its own.
- Don't edit the generated design token files. Edit tokens.template.css and run npm run tokens instead. *Why:* the next npm run tokens overwrites direct edits.
