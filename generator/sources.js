import { existsSync } from "node:fs"
import { join } from "node:path"

const ROOT = join(import.meta.dirname, ".."),
  CACHE = join(ROOT, ".cache")

export function resolveSource(source) {
  const development = source.development && join(ROOT, source.development)

  if (development && existsSync(development)) {
    return { directory: development, origin: source.development, slug: source.slug }
  }

  const cached = join(CACHE, source.slug, source.path)

  if (existsSync(cached)) {
    return { directory: cached, origin: `.cache/${source.slug}`, slug: source.slug }
  }

  throw new Error(
    `${source.slug}: no documentation at ${source.development} or .cache/${source.slug}. Run npm run gather.`
  )
}
