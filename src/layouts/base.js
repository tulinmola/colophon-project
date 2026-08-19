import { html } from "../../generator/html.js"
import { structuredData } from "../../generator/structured_data.js"

function pageLink(site, target, current) {
  const url = site.url(target.path)

  if (target.path == current.path) {
    return html`<a href="${url}" aria-current="page">${target.title}</a>`
  }

  return html`<a href="${url}">${target.title}</a>`
}

function pageItem(site, target, current) {
  const link = pageLink(site, target, current),
    children = current.isWithin(target) ? site.childrenOf(target) : []

  if (children.length == 0) {
    return html`<li>${link}</li>`
  }

  const items = children.map(child => pageItem(site, child, current))

  return html`<li>
    ${link}
    <ul>
      ${items}
    </ul>
  </li>`
}

// Google refuses a BreadcrumbList that names steps the page does not show,
// so the trail rendered here and the one written into the structured data are
// the same list and are read from the same place.
function trailItem(site, step, page) {
  const link = pageLink(site, step, page)

  return html`<li>${link}</li>`
}

function breadcrumb(site, trail, page, strings) {
  const items = trail.map(step => trailItem(site, step, page))

  return html`<nav aria-label="${strings.breadcrumb}">
    <ol>
      ${items}
    </ol>
  </nav>`
}

function keptIn(site, page, strings) {
  const source = site.sourceOf(page),
    url = site.sourceUrl(page)

  return html`<footer>
    <p>${strings.keptIn} <a href="${url}">${source.repository}</a>.</p>
  </footer>`
}

export function base(page, site) {
  const home = site.homeOf(page.language),
    language = site.languages[page.language],
    documentTitle = page == home ? site.title : `${page.title} — ${site.title}`

  const homeUrl = site.url(home.path),
    canonicalUrl = site.absoluteUrl(page.path),
    styleUrl = site.url("/css/index.css"),
    markdownUrl = site.url(`${page.path}index.md`),
    strings = site.stringsFor(page.language),
    trail = site.trailTo(page),
    record = structuredData(page, site, trail),
    written = page.generated ? "" : keptIn(site, page, strings),
    trailNav = trail.length > 0 ? breadcrumb(site, trail, page, strings) : "",
    sections = site.navigation(page.language),
    items = sections.map(section => pageItem(site, section, page))

  return html`<!doctype html>
    <html lang="${page.language}" dir="${language.direction}">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>${documentTitle}</title>
        <meta name="description" content="${page.description}" />
        <link rel="canonical" href="${canonicalUrl}" />
        <link rel="alternate" type="text/markdown" href="${markdownUrl}" />
        <link rel="stylesheet" href="${styleUrl}" />
        <script type="application/ld+json">
          ${record}
        </script>
      </head>
      <body>
        <a href="#text">${strings.skipToText}</a>
        <header>
          <a href="${homeUrl}">${site.title}</a>
          <nav aria-label="${strings.sections}">
            <ul>
              ${items}
            </ul>
          </nav>
        </header>
        <main id="text">
          ${trailNav}
          <article>
            <h1>${page.title}</h1>
            ${site.render(page)} ${written}
          </article>
        </main>
        <footer>
          <p>${strings.footer}</p>
        </footer>
      </body>
    </html> `
}
