import { describe, expect, it } from "vitest"
import { Page } from "./page.js"
import { Site } from "./site.js"

const LANGUAGES = { en: { name: "English", direction: "ltr" } }

function configFor(baseUrl) {
  return { baseUrl, defaultLanguage: "en", languages: LANGUAGES, title: "The Colophon Project" }
}

function pageAt(relativePath, metadata = "title: A page\ndescription: A description.") {
  const source = `---\n${metadata}\n---\nProse.\n`

  return new Page(relativePath, source, "en")
}

describe("Site", function () {
  it("carries the base path of a project page into every url", function () {
    const config = configFor("https://tulinmola.github.io/colophon-project/"),
      site = new Site(config, [])

    expect(site.url("/")).toBe("/colophon-project/")
    expect(site.url("/en/vision/")).toBe("/colophon-project/en/vision/")
    expect(site.url("/css/index.css")).toBe("/colophon-project/css/index.css")
  })

  it("carries no base path when the site owns its domain", function () {
    const config = configFor("https://colophon-project.com/"),
      site = new Site(config, [])

    expect(site.url("/")).toBe("/")
    expect(site.url("/en/vision/")).toBe("/en/vision/")
  })

  it("tolerates a baseUrl written without its final slash", function () {
    const config = configFor("https://colophon-project.com"),
      site = new Site(config, [])

    expect(site.url("/en/vision/")).toBe("/en/vision/")
  })

  it("writes an absolute url against the base", function () {
    const config = configFor("https://tulinmola.github.io/colophon-project/"),
      site = new Site(config, [])

    expect(site.absoluteUrl("/")).toBe("https://tulinmola.github.io/colophon-project/")
    expect(site.absoluteUrl("/en/vision/")).toBe(
      "https://tulinmola.github.io/colophon-project/en/vision/"
    )
  })

  it("navigates the sections of one language in their stated order", function () {
    const home = pageAt("index.en.md"),
      second = pageAt("player/index.en.md", "title: Player\ndescription: A.\norder: 2"),
      first = pageAt("vision/index.en.md", "title: Vision\ndescription: B.\norder: 1"),
      config = configFor("https://colophon-project.com/"),
      site = new Site(config, [home, second, first]),
      titles = site.navigation("en").map(page => page.title)

    expect(titles).toEqual(["Vision", "Player"])
  })

  it("rewrites a link written as a site path", function () {
    const source =
        "---\ntitle: A page\ndescription: A description.\n---\nSee [the vision](/en/vision/).\n",
      page = new Page("index.en.md", source, "en"),
      config = configFor("https://tulinmola.github.io/colophon-project/"),
      site = new Site(config, [page]),
      markup = site.render(page).toString()

    expect(markup).toContain('href="/colophon-project/en/vision/"')
  })

  it("leaves an outside link alone", function () {
    const source =
        "---\ntitle: A page\ndescription: A description.\n---\nSee [it](https://example.com/).\n",
      page = new Page("index.en.md", source, "en"),
      config = configFor("https://tulinmola.github.io/colophon-project/"),
      site = new Site(config, [page]),
      markup = site.render(page).toString()

    expect(markup).toContain('href="https://example.com/"')
  })
})
