import { describe, expect, it } from "vitest"
import { Page } from "./page.js"
import { Site } from "./site.js"
import { llmsText } from "./llms.js"

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

describe("llmsText", function () {
  it("opens with the site named and summarised", function () {
    const home = pageAt("index.en.md"),
      site = siteOf([home]),
      text = llmsText(site)

    expect(text.startsWith("# The Colophon Project\n\n> A description of the site.")).toBe(true)
  })

  it("lists a page with its address and its description", function () {
    const home = pageAt("index.en.md"),
      vision = pageAt("vision/index.en.md", "title: The vision\ndescription: What this is for."),
      site = siteOf([home, vision]),
      text = llmsText(site)

    expect(text).toContain(
      "- [The vision](https://tulinmola.github.io/colophon-project/en/vision/): What this is for."
    )
  })
})
