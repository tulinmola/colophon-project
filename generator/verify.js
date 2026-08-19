import { readSite } from "./read_site.js"

const HREF = /href="(?<href>[^"]*)"/gu

function hrefsIn(markup) {
  const hrefs = []

  for (const match of markup.matchAll(HREF)) {
    hrefs.push(match.groups.href)
  }

  return hrefs
}

function stringProblems(site) {
  const languages = Object.keys(site.languages),
    entries = Object.entries(site.strings),
    problems = []

  for (const [name, translations] of entries) {
    for (const language of languages) {
      if (!translations[language]) {
        problems.push(`strings: ${name} says nothing in ${language}`)
      }
    }

    const spoken = Object.keys(translations)

    for (const language of spoken) {
      if (!languages.includes(language)) {
        problems.push(`strings: ${name} speaks ${language}, which the site does not`)
      }
    }
  }

  return problems
}

function tiesIn(site, pages) {
  const taken = new Map(),
    problems = []

  for (const page of pages) {
    const order = site.orderOf(page)

    if (taken.has(order)) {
      const other = taken.get(order)

      problems.push(`${page.path}: stands at ${order}, where ${other} already stands`)
    }

    taken.set(order, page.path)
  }

  return problems
}

function orderProblems(site) {
  const languages = Object.keys(site.languages),
    problems = []

  for (const language of languages) {
    const sections = site.navigation(language),
      ties = tiesIn(site, sections)

    problems.push(...ties)
  }

  for (const page of site.pages) {
    if (page.segments.length == 0) {
      continue
    }

    const children = site.childrenOf(page),
      ties = tiesIn(site, children)

    problems.push(...ties)
  }

  return problems
}

export function verify(site) {
  const problems = [],
    addresses = new Set()

  for (const page of site.pages) {
    const address = site.url(page.path)

    if (addresses.has(address)) {
      problems.push(`${page.relativePath}: a second page claims ${page.path}`)
    }

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
      const address = href.replace(/[?#].*$/u, ""),
        inside = address.startsWith("/") || address.endsWith(".md")

      if (inside && !addresses.has(address)) {
        problems.push(`${page.path}: links to ${href}, which is no page`)
      }
    }
  }

  const stringGaps = stringProblems(site),
    orderTies = orderProblems(site)

  problems.push(...stringGaps, ...orderTies)

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
