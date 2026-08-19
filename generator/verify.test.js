import { describe, expect, it } from "vitest"
import { Page } from "./page.js"
import { Site } from "./site.js"
import { verify } from "./verify.js"

const CONFIG = {
  baseUrl: "https://tulinmola.github.io/colophon-project/",
  defaultLanguage: "en",
  languages: { en: { name: "English", direction: "ltr" } },
  title: "The Colophon Project"
}

const COMPLETE = "title: A page\ndescription: A description.",
  MISSING = "title: No such page\ndescription: Nothing is kept there.\nnotFound: true"

function pageAt(relativePath, metadata, body = "Prose.\n") {
  const source = `---\n${metadata}\n---\n${body}`

  return new Page(relativePath, source, "en")
}

function siteOf(pages) {
  const missing = pageAt("not-found/index.en.md", MISSING)

  return new Site(CONFIG, [...pages, missing])
}

describe("verify", function () {
  it("finds nothing wrong with a complete site", function () {
    const page = pageAt("index.en.md", COMPLETE),
      site = siteOf([page]),
      problems = verify(site)

    expect(problems).toEqual([])
  })

  it("reports a page with no title", function () {
    const page = pageAt("index.en.md", "description: A description."),
      site = siteOf([page]),
      problems = verify(site)

    expect(problems).toEqual(["/: no title"])
  })

  it("reports a page with no description", function () {
    const page = pageAt("index.en.md", "title: A page"),
      site = siteOf([page]),
      problems = verify(site)

    expect(problems).toEqual(["/: no description"])
  })

  it("reports a link to a page that does not exist", function () {
    const page = pageAt("index.en.md", COMPLETE, "See [the vision](/en/vision/).\n"),
      site = siteOf([page]),
      problems = verify(site)

    expect(problems).toEqual(["/: links to /colophon-project/en/vision/, which is no page"])
  })

  it("accepts a link to a page that does exist", function () {
    const home = pageAt("index.en.md", COMPLETE, "See [the vision](/en/vision/).\n"),
      vision = pageAt("vision/index.en.md", COMPLETE),
      site = siteOf([home, vision]),
      problems = verify(site)

    expect(problems).toEqual([])
  })

  it("leaves a link out of the site alone", function () {
    const page = pageAt("index.en.md", COMPLETE, "See [it](https://example.com/).\n"),
      site = siteOf([page]),
      problems = verify(site)

    expect(problems).toEqual([])
  })

  it("reports two pages claiming one address", function () {
    const flat = pageAt("player/machine.en.md", COMPLETE),
      foldered = pageAt("player/machine/index.en.md", COMPLETE),
      site = siteOf([flat, foldered]),
      problems = verify(site)

    expect(problems).toEqual([
      "player/machine/index.en.md: a second page claims /en/player/machine/"
    ])
  })

  it("reports a link to a markdown file that resolved to nothing", function () {
    const page = pageAt("index.en.md", COMPLETE, "See [it](nowhere.en.md).\n"),
      site = siteOf([page]),
      problems = verify(site)

    expect(problems).toEqual(["/: links to nowhere.en.md, which is no page"])
  })

  it("reports a site with no page to answer an unknown address", function () {
    const page = pageAt("index.en.md", COMPLETE),
      site = new Site(CONFIG, [page]),
      problems = verify(site)

    expect(problems).toEqual([
      "no page is marked notFound, so there is nothing to serve as 404.html"
    ])
  })
})
