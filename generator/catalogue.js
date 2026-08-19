export function catalogue(site) {
  const pages = []

  for (const page of site.pages) {
    if (page.notFound) {
      continue
    }

    pages.push({
      description: page.description,
      language: page.language,
      markdown: site.absoluteUrl(`${page.path}index.md`),
      title: page.title,
      url: site.absoluteUrl(page.path)
    })
  }

  return { baseUrl: site.baseUrl, description: site.description, pages, title: site.title }
}
