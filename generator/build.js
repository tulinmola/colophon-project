import { base } from "../src/layouts/base.js"
import { emit } from "./emit.js"
import { join } from "node:path"
import { readSite } from "./read_site.js"

const ROOT = join(import.meta.dirname, "..")

export function build() {
  const site = readSite(),
    outputDirectory = join(ROOT, "dist"),
    styleDirectory = join(ROOT, "src", "css")

  emit(site, base, outputDirectory, styleDirectory)

  return site
}

if (import.meta.main) {
  const site = build(),
    origins = Object.entries(site.origins)

  console.log(`Wrote ${site.pages.length} pages to dist/.`)

  for (const [slug, origin] of origins) {
    console.log(`  ${slug} from ${origin}`)
  }
}
