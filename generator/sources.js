import { existsSync } from "node:fs"
import { join } from "node:path"
import { spawnSync } from "node:child_process"

const ROOT = join(import.meta.dirname, ".."),
  CACHE = join(ROOT, ".cache")

function gitOutput(args, cwd) {
  const result = spawnSync("git", args, { cwd, encoding: "utf8" })

  if (result.status != 0) {
    return null
  }

  return result.stdout.trim()
}

// A working tree with uncommitted changes is not the commit it stands on, so
// it answers to no commit at all rather than to one it has already left.
function stateOf(directory) {
  const status = gitOutput(["status", "--porcelain"], directory)

  if (status == null) {
    return { clean: null, commit: null, committedAt: null }
  }

  const clean = status == "",
    commit = clean ? gitOutput(["rev-parse", "HEAD"], directory) : null,
    committedAt = clean ? gitOutput(["log", "-1", "--format=%cI"], directory) : null

  return { clean, commit, committedAt }
}

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
    ref: source.ref,
    repository: source.repository,
    slug: source.slug
  }
}
