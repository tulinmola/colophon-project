import { Site } from "./site.js"
import { base } from "../src/layouts/base.js"
import { emit } from "./emit.js"
import { join } from "node:path"
import { readConfig } from "./config.js"
import { readContent } from "./content.js"

const ROOT = join(import.meta.dirname, "..")

export function build() {
  const config = readConfig(),
    contentDirectory = join(ROOT, "content"),
    pages = readContent(contentDirectory, config.defaultLanguage),
    site = new Site(config, pages)

  const outputDirectory = join(ROOT, "dist"),
    styleDirectory = join(ROOT, "src", "css")

  emit(site, base, outputDirectory, styleDirectory)

  return site
}

if (import.meta.main) {
  const site = build()

  console.log(`Wrote ${site.pages.length} pages to dist/.`)
}
