import { join } from "node:path"
import { readFileSync } from "node:fs"

const ROOT = join(import.meta.dirname, "..")

// baseUrl always ends in a slash, so the path it carries can be joined to a
// page's without either end deciding who owns the separator.
export function readConfig() {
  const text = readFileSync(join(ROOT, "site.config.json"), "utf8"),
    config = JSON.parse(text)

  config.baseUrl = config.baseUrl.replace(/\/?$/u, "/")

  return config
}
