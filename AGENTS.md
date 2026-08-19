# Colophon Project — agent instructions

The Colophon Project's pages: the prologue, the documentation each sibling repository writes about itself, and in time the archive of colophons. A static site, generated here and published as a GitHub page. The machine lives in `colophon-emulator` and the page that carries it in `colophon-player`, both under their own instructions; read those before touching anything that crosses into either. Read `README.md` for the prologue.

## Architecture

The generator is a pipeline over plain files, and a stage knows nothing of the stage after it. `verify` judges what was built and writes nothing. `build.js` is the only place that knows this site has layouts.

A page is a markdown file named `<name>.<language>.md`, and it becomes a folder holding `index.<language>.md` the day it carries artifacts — screenshots, snapshots, whatever a colophon's cells produce — so that what a page cites sits beside the prose citing it. Both spellings address the same page, and `verify` refuses a site where two files claim one address. The language tag is BCP 47 and reaches `<html lang>` unchanged. A page's title lives in its front matter and the layout sets it, so a document has exactly one `<h1>` and the markdown starts at `##`.

Every URL is built by `Site.url` or `Site.absoluteUrl` and never written down, including the ones inside prose: a link is written to the markdown file it points at, so it resolves in an editor and on GitHub as well as here, and is rewritten to the page's address as it is rendered. A link to a file resolves where that file sits; anything else resolves against the page's own address. The development server mounts the site under the path its `baseUrl` carries, so a link that works locally works published.

Markup is composed by the `html` tag, which escapes everything passing through it and leaves `TrustedHtml` alone. Front matter is written by whoever sends the pull request, so escaping is the default and trust is declared.

Documentation belongs to the repository that documents itself and is gathered here at build time. Nothing about a sibling project is written down in this repo: the gathering is driven by `sources` in `site.config.json`. A source is read where it stands — the sibling beside us when there is one, the clone `gather` makes when there is not — and is never copied in here. Where a gathered section sits in the navigation is said by `sources`, never by the sibling: a section's own order places only the pages inside it.

Beside every page the site writes what a machine reads: the markdown it was set from at `index.md`, `sitemap.xml` with an `hreflang` for every translation, `robots.txt`, `llms.txt`, `index.json` naming every page, and `build.json` recording what the build was made from. A record is generated and never written by hand.

The site signs its own work. `build.json` names each source, where it was read and the commit it stood on; a source read from a tree with uncommitted changes answers to no commit at all, because it is no longer the one it left.

Every word the layout says of its own accord lives in `src/strings.yml`, keyed by string and then by language, so the English is beside the translation of it. `verify` refuses a string that says nothing in a language the site is written in, and one that speaks a language it does not: a dozen words are too few to excuse a page half in one tongue. Nothing falls back, so no English can reach a Spanish page unnoticed.

The site is readable with no JavaScript at all. Script is spent on what cannot be done without it — search, and the machine a colophon runs — never on delivering prose.

## Voice

- The register is a scribe's: plain, declarative, a little antique. Take the manuscript metaphor completely seriously and never wink at it — pointing at the bit kills it.
- Like an illuminated manuscript: mood at the openings, discipline in the middles. A section's first sentence may sing; commands, specs, and rules stay dry.
- Humor only as a byproduct of honesty. None in code comments or error messages: comments pay rent in facts, and error messages are read on bad days.
- Write for 2036. Mood is timeless, jokes are timestamps; the prose meets the same bar as the code.

## Writing style

- One paragraph, one line: markdown is never hard-wrapped. Soft wrap does the work.
- Sources are cited at their point of use, in the code or doc that uses them: link, what we learned, what we changed. No link dumps.

## Build and test

- `package.json` is the list of scripts and this file does not repeat it. The code describes itself; this file carries the rules it must obey.
- Run `npm run check` before handing work back. The Pages workflow runs the same command, so what fails here fails there.
- `verify` is separate from `build` for the reason `make test` is separate from `make` in the emulator: building is not judging. It reads the same site and writes nothing.
- Tests cover what building the real site cannot: escaping, error paths, and the behaviour of languages, base paths and configurations no content exercises yet. What the build and `verify` already prove is left to them, and a module gets its tests in the commit that writes it.
- Never commit, never push. The human reviews; the human commits.

## Code style

- Prettier decides formatting and is never a discussion: `npm run prettier:write`, `npm run prettier:check` to verify. ESLint decides the rest: `npm run lint`.
- Prettier formats the markup inside an `html` template, so a layout's indentation is Prettier's and the emitted document carries it. A test asserts on what a template composes, never on its whitespace, which is Prettier's.
- ESLint allows snake_case in property names (`camelcase` with `properties: "never"`), because a foreign API's names are that API's to choose: `markdown-it` calls its rule `link_open` and we do not rename what we do not own.
- Imports carry their `.js` extension: Node resolves specifiers itself and there is no bundler to guess. This is the one place the player's rule does not hold, and only because it cannot.
- Plain CSS, not Sass. Custom properties, nesting and `light-dark()` cover what a stylesheet of tokens and typography needs, and the CSS in the browser is the CSS in the repository.
- Avoid defensive guards that hide implementation errors; only add checks when the condition can legitimately occur at runtime. A malformed page is an authoring error and says so.
- Use modern class features: prefer private fields/methods (`#`) for internal helpers and state.
- When multiple `const` values are tightly coupled, group them into a single declaration using commas (avoid moving unrelated declarations to the top of a function).
- Prefer `function` over arrow functions (`=>`) when it is semantically a vanilla function. In those cases, only use arrow functions when it ends with much shorter one-line code.
- Avoid cryptic shortened variable/function names.
- One export a file. A folder's `index.js` is its surface and may name several; it is for outsiders, so files inside a folder import their siblings directly.
- Avoid passing a call's result directly as an argument; hoist it to a named `const` first.
- Prefer self-documenting code over comments. Add a comment only when its absence would likely make a future editor introduce a bug (a non-obvious invariant, footgun, or external constraint). Explaining what the code does, or why an approach was chosen, does not qualify — that belongs in the commit message.
- Prefer `==` over `===`. Use strict comparison (`===`) only when strictly needed.
- Prefer `for...of` for plain value iteration. Use indexed `for` when index arithmetic is needed. Avoid `.forEach`.

## Simplicity And Ownership

- Keep behavior the same.
- Do not rewrite code unless explicitly requested or required to complete the task.
- When a rewrite/refactor is requested, prefer a clean rewrite over incremental patching if the final behavior is unchanged.
- Less code is better when semantics are equivalent.
- Avoid generic abstractions for app-specific workflows. This is one site's generator, not a static site generator.
- Keep APIs app-owned and explicit (use domain terms, not generic helpers).
- Do a final cleanup pass: remove redundant checks, temporary indirections, and duplicated logic.
- If two options work, choose the one with fewer concepts and fewer lines.
