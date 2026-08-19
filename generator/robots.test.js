import { describe, expect, it } from "vitest"
import { Site } from "./site.js"
import { robots } from "./robots.js"

const CONFIG = {
  baseUrl: "https://tulinmola.github.io/colophon-project/",
  defaultLanguage: "en",
  languages: { en: { name: "English", direction: "ltr" } },
  title: "The Colophon Project"
}

describe("robots", function () {
  it("points at the sitemap by its whole address", function () {
    const site = new Site(CONFIG, []),
      text = robots(site)

    expect(text).toContain("Sitemap: https://tulinmola.github.io/colophon-project/sitemap.xml")
  })
})
