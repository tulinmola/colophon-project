export function robots(site) {
  const sitemap = site.absoluteUrl("/sitemap.xml")

  return `User-agent: *\nAllow: /\n\nSitemap: ${sitemap}\n`
}
