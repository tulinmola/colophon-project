function entryFor(site, page) {
  const url = site.absoluteUrl(page.path)

  return `- [${page.title}](${url}): ${page.description}`
}

// https://llmstxt.org — the file an agent reads first. An H1 naming the site,
// a blockquote summarising it, then free prose, then sections listing pages:
// prose belongs before the sections, never after them.
export function llmsText(site) {
  const home = site.homeOf(site.defaultLanguage),
    markdownUrl = site.absoluteUrl("/index.md"),
    lines = [
      `# ${site.title}`,
      "",
      `> ${site.description}`,
      "",
      `Every page is served as the markdown it was set from, at its own address with \`index.md\` appended: ${markdownUrl} is this front page.`,
      "",
      "## Pages",
      ""
    ]

  for (const page of site.pages) {
    if (page.notFound || page == home || page.language != site.defaultLanguage) {
      continue
    }

    const entry = entryFor(site, page)

    lines.push(entry)
  }

  return `${lines.join("\n")}\n`
}
