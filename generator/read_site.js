import { Site } from "./site.js"
import { join } from "node:path"
import { readConfig } from "./config.js"
import { readContent } from "./content.js"
import { resolveSource } from "./sources.js"

const ROOT = join(import.meta.dirname, "..")

export function readSite() {
  const config = readConfig(),
    contentDirectory = join(ROOT, "content"),
    pages = readContent(contentDirectory, config.defaultLanguage),
    sources = []

  for (const source of config.sources) {
    const resolved = resolveSource(source),
      gathered = readContent(resolved.directory, config.defaultLanguage, resolved.slug)

    sources.push(resolved)
    pages.push(...gathered)
  }

  return new Site(config, pages, sources)
}
