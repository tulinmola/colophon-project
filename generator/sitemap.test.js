import { describe, expect, it } from "vitest"
import { Page } from "./page.js"
import { Site } from "./site.js"
import { sitemap } from "./sitemap.js"

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

describe("sitemap", function () {
  it("declares a page in one language as its own default", function () {
    const page = pageAt("vision/index.en.md"),
      site = siteOf([page]),
      xml = sitemap(site)

    expect(xml).toContain("<loc>https://tulinmola.github.io/colophon-project/en/vision/</loc>")
    expect(xml).toContain(
      'hreflang="en" href="https://tulinmola.github.io/colophon-project/en/vision/"'
    )
    expect(xml).toContain('hreflang="x-default"')
  })

  it("names every translation of a page against every one of them", function () {
    const english = pageAt("vision/index.en.md"),
      spanish = new Page(
        "vision/index.es.md",
        "---\ntitle: La visión\ndescription: Una.\n---\nProsa.\n",
        "en"
      ),
      site = siteOf([english, spanish]),
      xml = sitemap(site)

    expect(xml).toContain(
      'hreflang="es" href="https://tulinmola.github.io/colophon-project/es/vision/"'
    )
    expect(xml.match(/hreflang="es"/gu)).toHaveLength(2)
    expect(xml.match(/hreflang="x-default"/gu)).toHaveLength(2)
  })

  it("leaves out the page that answers an unknown address", function () {
    const missing = pageAt("not-found/index.en.md", "title: No\ndescription: A.\nnotFound: true"),
      site = siteOf([missing]),
      xml = sitemap(site)

    expect(xml).not.toContain("not-found")
  })
})
