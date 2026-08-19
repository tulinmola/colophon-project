import { base } from "../src/layouts/base.js"
import { emit } from "./emit.js"
import { join } from "node:path"
import { readSite } from "./read_site.js"

const ROOT = join(import.meta.dirname, "..")

export function build(builtAt) {
  const site = readSite(),
    outputDirectory = join(ROOT, "dist"),
    styleDirectory = join(ROOT, "src", "css")

  emit(site, base, outputDirectory, styleDirectory, builtAt)

  return site
}

if (import.meta.main) {
  const now = new Date(),
    site = build(now.toISOString())

  console.log(`Wrote ${site.pages.length} pages to dist/.`)

  for (const source of site.sources) {
    const stamp = source.commit ? source.commit.slice(0, 7) : "an unclean tree"

    console.log(`  ${source.repository} from ${source.origin} at ${stamp}`)
  }
}
