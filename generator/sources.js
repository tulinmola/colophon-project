import { existsSync } from "node:fs"
import { join } from "node:path"
import { stateOf } from "./repository.js"

const ROOT = join(import.meta.dirname, ".."),
  CACHE = join(ROOT, ".cache")

function locate(source) {
  const development = source.development && join(ROOT, source.development)

  if (development && existsSync(development)) {
    return { directory: development, origin: source.development }
  }

  const cached = join(CACHE, source.slug, source.path)

  if (existsSync(cached)) {
    return { directory: cached, origin: `.cache/${source.slug}` }
  }

  throw new Error(
    `${source.slug}: no documentation at ${source.development} or .cache/${source.slug}. Run npm run gather.`
  )
}

export function resolveSource(source) {
  const located = locate(source),
    state = stateOf(located.directory)

  return {
    ...state,
    ...located,
    order: source.order,
    path: source.path,
    ref: source.ref,
    repository: source.repository,
    slug: source.slug
  }
}
