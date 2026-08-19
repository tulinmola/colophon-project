import { TrustedHtml } from "./trusted_html.js"

// A script element ends at the first </script> in its text, whatever the
// grammar around it, so every < inside the JSON is written as an escape.
export function structuredData(page, site) {
  const home = site.homeOf(page.language),
    type = page == home ? "WebSite" : "TechArticle"

  const record = {
    "@context": "https://schema.org",
    "@type": type,
    description: page.description,
    inLanguage: page.language,
    isPartOf: { "@type": "WebSite", name: site.title, url: site.absoluteUrl("/") },
    name: page.title,
    url: site.absoluteUrl(page.path)
  }

  const json = JSON.stringify(record),
    escaped = json.replace(/</gu, "\\u003c")

  return new TrustedHtml(escaped)
}
