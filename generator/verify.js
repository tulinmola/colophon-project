import { readSite } from "./read_site.js"

const HREF = /href="(?<href>[^"]*)"/gu

function hrefsIn(markup) {
  const hrefs = []

  for (const match of markup.matchAll(HREF)) {
    hrefs.push(match.groups.href)
  }

  return hrefs
}

export function verify(site) {
  const problems = [],
    addresses = new Set()

  for (const page of site.pages) {
    const address = site.url(page.path)

    addresses.add(address)
  }

  for (const page of site.pages) {
    if (!page.title) {
      problems.push(`${page.path}: no title`)
    }

    if (!page.description) {
      problems.push(`${page.path}: no description`)
    }

    const document = site.render(page),
      markup = document.toString()

    for (const href of hrefsIn(markup)) {
      if (href.startsWith("/") && !addresses.has(href)) {
        problems.push(`${page.path}: links to ${href}, which is no page`)
      }
    }
  }

  if (!site.notFoundPage()) {
    problems.push("no page is marked notFound, so there is nothing to serve as 404.html")
  }

  return problems
}

if (import.meta.main) {
  const site = readSite(),
    problems = verify(site)

  for (const problem of problems) {
    console.error(problem)
  }

  if (problems.length > 0) {
    process.exitCode = 1
  } else {
    console.log(`Checked ${site.pages.length} pages.`)
  }
}
