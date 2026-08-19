import { describe, expect, it } from "vitest"
import { Page } from "./page.js"
import { Site } from "./site.js"
import { structuredData } from "./structured_data.js"

const CONFIG = {
  baseUrl: "https://tulinmola.github.io/colophon-project/",
  defaultLanguage: "en",
  description: "A description of the site.",
  languages: {
    en: { name: "English", direction: "ltr" },
    es: { name: "Castellano", direction: "ltr" }
  },
  title: "The Colophon Project"
}

function pageAt(relativePath, metadata = "title: A page\ndescription: A description.") {
  const source = `---\n${metadata}\n---\nProse.\n`

  return new Page(relativePath, source, "en")
}

function siteOf(pages) {
  return new Site(CONFIG, pages, [])
}

describe("structuredData", function () {
  it("writes every angle bracket as an escape, so no title can close the script", function () {
    const page = pageAt("vision/index.en.md", "title: A </script> title\ndescription: A."),
      site = siteOf([page]),
      record = structuredData(page, site),
      json = record.toString()

    expect(json).not.toContain("</script>")
    expect(json).toContain("\\u003c/script>")
  })
})
