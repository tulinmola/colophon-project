function recordOf(source) {
  return {
    clean: source.clean,
    commit: source.commit,
    committedAt: source.committedAt,
    origin: source.origin,
    ref: source.ref,
    repository: source.repository,
    slug: source.slug
  }
}

export function buildRecord(site, builtAt) {
  const sources = site.sources.map(recordOf)

  return { baseUrl: site.baseUrl, builtAt, pages: site.pages.length, sources, title: site.title }
}
