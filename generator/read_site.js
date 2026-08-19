import { Site } from "./site.js"
import { join } from "node:path"
import { readConfig } from "./config.js"
import { readContent } from "./content.js"

const ROOT = join(import.meta.dirname, "..")

export function readSite() {
  const config = readConfig(),
    contentDirectory = join(ROOT, "content"),
    pages = readContent(contentDirectory, config.defaultLanguage)

  return new Site(config, pages)
}
