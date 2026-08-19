import { html } from "../../generator/html.js"

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

export function base(page, site) {
  const home = site.homeOf(page.language),
    language = site.languages[page.language],
    documentTitle = page == home ? site.title : `${page.title} — ${site.title}`

  const homeUrl = site.url(home.path),
    canonicalUrl = site.absoluteUrl(page.path),
    styleUrl = site.url("/css/index.css"),
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
        <link rel="stylesheet" href="${styleUrl}" />
      </head>
      <body>
        <header>
          <a href="${homeUrl}">${site.title}</a>
          <nav aria-label="Sections">
            <ul>
              ${items}
            </ul>
          </nav>
        </header>
        <main>
          <article>
            <h1>${page.title}</h1>
            ${site.render(page)}
          </article>
        </main>
        <footer>
          <p>The Colophon Project, written in the open under the MIT licence.</p>
        </footer>
      </body>
    </html> `
}
