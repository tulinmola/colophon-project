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
  const own = site.ownSource(),
    gathered = site.sources.filter(source => source.slug != ""),
    sources = gathered.map(recordOf)

  return {
    baseUrl: site.baseUrl,
    builtAt,
    clean: own.clean,
    commit: own.commit,
    committedAt: own.committedAt,
    pages: site.pages.length,
    repository: own.repository,
    sources,
    title: site.title
  }
}
