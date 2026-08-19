import { TrustedHtml } from "./trusted_html.js"

function articleOf(page, site) {
  const home = site.homeOf(page.language),
    type = page == home ? "WebSite" : "TechArticle"

  return {
    "@context": "https://schema.org",
    "@type": type,
    description: page.description,
    inLanguage: page.language,
    isPartOf: { "@type": "WebSite", name: site.title, url: site.absoluteUrl("/") },
    name: page.title,
    url: site.absoluteUrl(page.path)
  }
}

function breadcrumbOf(trail, site) {
  const elements = []

  for (let position = 0; position < trail.length; position++) {
    const step = trail[position]

    elements.push({
      "@type": "ListItem",
      item: site.absoluteUrl(step.path),
      name: step.title,
      position: position + 1
    })
  }

  return { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: elements }
}

// A script element ends at the first </script> in its text, whatever the
// grammar around it, so every < inside the JSON is written as an escape.
export function structuredData(page, site, trail) {
  const records = [articleOf(page, site)]

  if (trail.length > 0) {
    const breadcrumb = breadcrumbOf(trail, site)

    records.push(breadcrumb)
  }

  const json = JSON.stringify(records),
    escaped = json.replace(/</gu, "\\u003c")

  return new TrustedHtml(escaped)
}
