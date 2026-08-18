import { html } from "../../generator/html.js"

function sectionLink(site, section, current) {
  const url = site.url(section.path)

  if (section.path == current.path) {
    return html`<li><a href="${url}" aria-current="page">${section.title}</a></li>`
  }

  return html`<li><a href="${url}">${section.title}</a></li>`
}

export function base(page, site) {
  const home = site.homeOf(page.language),
    language = site.languages[page.language],
    documentTitle = page == home ? site.title : `${page.title} — ${site.title}`

  const homeUrl = site.url(home.path),
    canonicalUrl = site.absoluteUrl(page.path),
    styleUrl = site.url("/css/index.css"),
    sections = site.navigation(page.language),
    links = sections.map(section => sectionLink(site, section, page))

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
              ${links}
            </ul>
          </nav>
        </header>
        <main>
          <article>
            <h1>${page.title}</h1>
            ${page.html}
          </article>
        </main>
        <footer>
          <p>The Colophon Project, written in the open under the MIT licence.</p>
        </footer>
      </body>
    </html> `
}
