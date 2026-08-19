import { join } from "node:path"
import { parse as parseYaml } from "yaml"
import { readFileSync } from "node:fs"

const ROOT = join(import.meta.dirname, "..")

export function readStrings() {
  const path = join(ROOT, "src", "strings.yml"),
    text = readFileSync(path, "utf8")

  return parseYaml(text)
}
