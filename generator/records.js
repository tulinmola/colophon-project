import { buildRecord } from "./build_record.js"
import { catalogue } from "./catalogue.js"
import { llmsText } from "./llms.js"
import { robots } from "./robots.js"
import { sitemap } from "./sitemap.js"

// `emit` writes these and `verify` takes their names, so a page linking to
// one is not a broken link and the list is never written down twice.
export function recordsOf(site, builtAt) {
  const index = catalogue(site),
    record = buildRecord(site, builtAt)

  return {
    "build.json": JSON.stringify(record, null, 2),
    "index.json": JSON.stringify(index, null, 2),
    "llms.txt": llmsText(site),
    "robots.txt": robots(site),
    "sitemap.xml": sitemap(site)
  }
}
