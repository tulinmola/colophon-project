import { mkdirSync, rmSync } from "node:fs"
import { join } from "node:path"
import { readConfig } from "./config.js"
import { spawnSync } from "node:child_process"

const ROOT = join(import.meta.dirname, ".."),
  CACHE = join(ROOT, ".cache")

function git(args, cwd) {
  const result = spawnSync("git", args, { cwd, stdio: "inherit" })

  if (result.status != 0) {
    const command = args.join(" ")

    throw new Error(`git ${command} failed`)
  }
}

export function gather(sources) {
  rmSync(CACHE, { force: true, recursive: true })
  mkdirSync(CACHE, { recursive: true })

  for (const source of sources) {
    const target = join(CACHE, source.slug),
      url = `https://github.com/${source.repository}.git`,
      clone = [
        "clone",
        "--depth",
        "1",
        "--filter=blob:none",
        "--sparse",
        "--branch",
        source.ref,
        url,
        target
      ]

    git(clone)
    git(["sparse-checkout", "set", source.path], target)
  }
}

if (import.meta.main) {
  const config = readConfig()

  gather(config.sources)

  for (const source of config.sources) {
    console.log(`Gathered ${source.slug} from ${source.repository}@${source.ref}.`)
  }
}
