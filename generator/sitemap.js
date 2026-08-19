function alternates(site, page) {
  const translations = site.translationsOf(page),
    links = []

  for (const translation of translations) {
    const href = site.absoluteUrl(translation.path)

    links.push(
      `    <xhtml:link rel="alternate" hreflang="${translation.language}" href="${href}" />`
    )

    if (translation.language == site.defaultLanguage) {
      links.push(`    <xhtml:link rel="alternate" hreflang="x-default" href="${href}" />`)
    }
  }

  return links
}

export function sitemap(site) {
  const lines = [
    '<?xml version="1.0" encoding="utf-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">'
  ]

  for (const page of site.pages) {
    if (page.notFound) {
      continue
    }

    const location = site.absoluteUrl(page.path),
      links = alternates(site, page)

    lines.push("  <url>", `    <loc>${location}</loc>`, ...links, "  </url>")
  }

  lines.push("</urlset>")

  return `${lines.join("\n")}\n`
}
