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

  it("keeps the page that answers for 404 out of the navigation", function () {
    const section = pageAt("vision/index.en.md"),
      missing = pageAt(
        "not-found/index.en.md",
        "title: No such page\ndescription: A.\nnotFound: true"
      ),
      config = configFor("https://colophon-project.com/"),
      site = new Site(config, [section, missing])

    expect(site.navigation("en")).toEqual([section])
    expect(site.notFoundPage()).toBe(missing)
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

  it("points a gathered page at the repository that keeps it", function () {
    const page = pageAt("emulator/core.en.md"),
      sources = [
        { slug: "", path: "content", ref: "main", repository: "tulinmola/colophon-project" },
        { slug: "emulator", path: "docs", ref: "main", repository: "tulinmola/colophon-emulator" }
      ],
      config = configFor("https://colophon-project.com/"),
      site = new Site(config, [page], sources)

    expect(site.sourceUrl(page)).toBe(
      "https://github.com/tulinmola/colophon-emulator/blob/main/docs/core.en.md"
    )
  })

  it("points a page of its own at this repository", function () {
    const page = pageAt("vision/index.en.md"),
      sources = [
        { slug: "", path: "content", ref: "main", repository: "tulinmola/colophon-project" }
      ],
      config = configFor("https://colophon-project.com/"),
      site = new Site(config, [page], sources)

    expect(site.sourceUrl(page)).toBe(
      "https://github.com/tulinmola/colophon-project/blob/main/content/vision/index.en.md"
    )
  })

  it("stands a gathered section where the site says, not where the source says", function () {
    const emulator = pageAt("emulator/index.en.md", "title: Emulator\ndescription: A.\norder: 9"),
      player = pageAt("player/index.en.md", "title: Player\ndescription: B.\norder: 9"),
      sources = [
        { slug: "emulator", order: 2 },
        { slug: "player", order: 3 }
      ],
      config = configFor("https://colophon-project.com/"),
      site = new Site(config, [player, emulator], sources),
      titles = site.navigation("en").map(page => page.title)

    expect(site.orderOf(emulator)).toBe(2)
    expect(titles).toEqual(["Emulator", "Player"])
  })

  it("leaves a page inside a source ordered by its own front matter", function () {
    const section = pageAt("emulator/index.en.md", "title: Emulator\ndescription: A.\norder: 9"),
      machine = pageAt("emulator/machine.en.md", "title: Machine\ndescription: B.\norder: 4"),
      sources = [{ slug: "emulator", order: 2 }],
      config = configFor("https://colophon-project.com/"),
      site = new Site(config, [section, machine], sources)

    expect(site.orderOf(machine)).toBe(4)
  })

  it("says each string in the language asked for", function () {
    const strings = {
        sections: { en: "Sections", es: "Secciones" },
        skipToText: { en: "Skip to the text", es: "Saltar al texto" }
      },
      config = configFor("https://colophon-project.com/"),
      site = new Site(config, [], [], strings)

    expect(site.stringsFor("es")).toEqual({
      sections: "Secciones",
      skipToText: "Saltar al texto"
    })
  })

  it("says nothing at all where a string has not been translated", function () {
    const strings = { sections: { en: "Sections" } },
      config = configFor("https://colophon-project.com/"),
      site = new Site(config, [], [], strings)

    expect(site.stringsFor("es").sections).toBeUndefined()
  })

  it("trails a page through the sections above it, from the top down", function () {
    const home = pageAt("index.en.md"),
      player = pageAt("player/index.en.md", "title: Player\ndescription: A."),
      debug = pageAt("player/debugger/index.en.md", "title: Debugger\ndescription: B."),
      crtc = pageAt("player/debugger/crtc.en.md", "title: CRTC\ndescription: C."),
      config = configFor("https://colophon-project.com/"),
      site = new Site(config, [crtc, home, debug, player]),
      titles = site.trailTo(crtc).map(page => page.title)

    expect(titles).toEqual(["Player", "Debugger", "CRTC"])
  })

  it("gives no trail to a page with nothing above it but the root", function () {
    const home = pageAt("index.en.md"),
      vision = pageAt("vision/index.en.md"),
      config = configFor("https://colophon-project.com/"),
      site = new Site(config, [home, vision])

    expect(site.trailTo(vision)).toEqual([])
  })

  it("does not climb out of a page's own language", function () {
    const english = pageAt("player/index.en.md", "title: Player\ndescription: A."),
      spanish = new Page(
        "player/debugger/index.es.md",
        "---\ntitle: Depurador\ndescription: B.\n---\nProsa.\n",
        "en"
      ),
      config = configFor("https://colophon-project.com/"),
      site = new Site(config, [english, spanish])

    expect(site.trailTo(spanish)).toEqual([])
  })

  it("resolves a link relative to the page that carries it", function () {
    const source =
        "---\ntitle: A page\ndescription: A description.\n---\nSee [the machine](../machine/).\n",
      page = new Page("player/debugger/index.en.md", source, "en"),
      config = configFor("https://tulinmola.github.io/colophon-project/"),
      site = new Site(config, [page]),
      markup = site.render(page).toString()

    expect(markup).toContain('href="/colophon-project/en/player/machine/"')
  })

  it("resolves a link relative to a section index", function () {
    const source =
        "---\ntitle: A page\ndescription: A description.\n---\nSee [the debugger](debugger/).\n",
      page = new Page("player/index.en.md", source, "en"),
      config = configFor("https://tulinmola.github.io/colophon-project/"),
      site = new Site(config, [page]),
      markup = site.render(page).toString()

    expect(markup).toContain('href="/colophon-project/en/player/debugger/"')
  })

  it("keeps a fragment when it resolves the path before it", function () {
    const source =
        "---\ntitle: A page\ndescription: A description.\n---\nSee [it](machine/#firmware).\n",
      page = new Page("player/index.en.md", source, "en"),
      config = configFor("https://tulinmola.github.io/colophon-project/"),
      site = new Site(config, [page]),
      markup = site.render(page).toString()

    expect(markup).toContain('href="/colophon-project/en/player/machine/#firmware"')
  })

  it("leaves a link to somewhere on this page alone", function () {
    const source = "---\ntitle: A page\ndescription: A description.\n---\nSee [below](#later).\n",
      page = new Page("player/index.en.md", source, "en"),
      config = configFor("https://tulinmola.github.io/colophon-project/"),
      site = new Site(config, [page]),
      markup = site.render(page).toString()

    expect(markup).toContain('href="#later"')
  })

  it("gathers the pages under a section, in their stated order", function () {
    const section = pageAt("player/index.en.md", "title: Player\ndescription: A."),
      machine = pageAt("player/machine/index.en.md", "title: Machine\ndescription: B.\norder: 2"),
      debugger_ = pageAt(
        "player/debugger/index.en.md",
        "title: Debugger\ndescription: C.\norder: 1"
      ),
      other = pageAt("vision/index.en.md", "title: Vision\ndescription: D."),
      config = configFor("https://colophon-project.com/"),
      site = new Site(config, [section, machine, debugger_, other]),
      titles = site.childrenOf(section).map(page => page.title)

    expect(titles).toEqual(["Debugger", "Machine"])
  })

  it("gathers no children for a page that has none", function () {
    const page = pageAt("player/machine/index.en.md"),
      config = configFor("https://colophon-project.com/"),
      site = new Site(config, [page])

    expect(site.childrenOf(page)).toEqual([])
  })

  it("resolves a link to a markdown file where that file sits", function () {
    const source =
        "---\ntitle: A page\ndescription: A description.\n---\nSee [the screen](screen.en.md).\n",
      page = new Page("player/debugger/monitor.en.md", source, "en"),
      screen = pageAt("player/debugger/screen.en.md"),
      config = configFor("https://tulinmola.github.io/colophon-project/"),
      site = new Site(config, [page, screen]),
      markup = site.render(page).toString()

    expect(markup).toContain('href="/colophon-project/en/player/debugger/screen/"')
  })

  it("keeps a fragment on a link to a markdown file", function () {
    const source =
        "---\ntitle: A page\ndescription: A description.\n---\nSee [it](../index.en.md#carrying).\n",
      page = new Page("player/debugger/monitor.en.md", source, "en"),
      home = pageAt("player/index.en.md"),
      config = configFor("https://tulinmola.github.io/colophon-project/"),
      site = new Site(config, [page, home]),
      markup = site.render(page).toString()

    expect(markup).toContain('href="/colophon-project/en/player/#carrying"')
  })

  it("leaves a link to a markdown file that is no page alone", function () {
    const source =
        "---\ntitle: A page\ndescription: A description.\n---\nSee [it](nowhere.en.md).\n",
      page = new Page("player/index.en.md", source, "en"),
      config = configFor("https://tulinmola.github.io/colophon-project/"),
      site = new Site(config, [page]),
      markup = site.render(page).toString()

    expect(markup).toContain('href="nowhere.en.md"')
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
