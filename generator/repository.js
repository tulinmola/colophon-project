import { spawnSync } from "node:child_process"

function gitOutput(args, cwd) {
  const result = spawnSync("git", args, { cwd, encoding: "utf8" })

  if (result.status != 0) {
    return null
  }

  return result.stdout.trim()
}

// A working tree with uncommitted changes is not the commit it stands on, so
// it answers to no commit at all rather than to one it has already left.
export function stateOf(directory) {
  const status = gitOutput(["status", "--porcelain"], directory)

  if (status == null) {
    return { clean: null, commit: null, committedAt: null }
  }

  const clean = status == "",
    commit = clean ? gitOutput(["rev-parse", "HEAD"], directory) : null,
    committedAt = clean ? gitOutput(["log", "-1", "--format=%cI"], directory) : null

  return { clean, commit, committedAt }
}
