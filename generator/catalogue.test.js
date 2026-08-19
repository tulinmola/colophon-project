import { describe, expect, it } from "vitest"
import { Page } from "./page.js"
import { Site } from "./site.js"
import { catalogue } from "./catalogue.js"

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

describe("catalogue", function () {
  it("gives every page its address and the markdown beside it", function () {
    const vision = pageAt("vision/index.en.md"),
      site = siteOf([vision]),
      index = catalogue(site)

    expect(index.pages).toHaveLength(1)
    expect(index.pages[0].url).toBe("https://tulinmola.github.io/colophon-project/en/vision/")
    expect(index.pages[0].markdown).toBe(
      "https://tulinmola.github.io/colophon-project/en/vision/index.md"
    )
  })
})
