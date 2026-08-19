import { describe, expect, it } from "vitest"
import { Page } from "./page.js"

function sourceOf(metadata, body = "Prose.\n") {
  return `---\n${metadata}\n---\n${body}`
}

const METADATA = "title: The vision\ndescription: What this is for."

describe("Page", function () {
  it("puts the default language's root page at the root", function () {
    const source = sourceOf(METADATA),
      page = new Page("index.en.md", source, "en")

    expect(page.path).toBe("/")
  })

  it("prefixes a section with its language, default or not", function () {
    const source = sourceOf(METADATA),
      english = new Page("vision/index.en.md", source, "en"),
      spanish = new Page("vision/index.es.md", source, "en")

    expect(english.path).toBe("/en/vision/")
    expect(spanish.path).toBe("/es/vision/")
  })

  it("gives a language other than the default its own root", function () {
    const source = sourceOf(METADATA),
      page = new Page("index.es.md", source, "en")

    expect(page.path).toBe("/es/")
  })

  it("keeps every segment of a nested page", function () {
    const source = sourceOf(METADATA),
      page = new Page("emulator/building/index.en.md", source, "en")

    expect(page.path).toBe("/en/emulator/building/")
    expect(page.segments).toEqual(["emulator", "building"])
  })

  it("addresses a page written flat where its folder would have been", function () {
    const source = sourceOf(METADATA),
      flat = new Page("player/debugger/monitor.en.md", source, "en"),
      foldered = new Page("player/debugger/monitor/index.en.md", source, "en")

    expect(flat.path).toBe("/en/player/debugger/monitor/")
    expect(foldered.path).toBe(flat.path)
    expect(flat.segments).toEqual(foldered.segments)
  })

  it("keeps the path a page was read from", function () {
    const source = sourceOf(METADATA),
      page = new Page("player/debugger/monitor.en.md", source, "en")

    expect(page.relativePath).toBe("player/debugger/monitor.en.md")
  })

  it("accepts a language tag with a subtag", function () {
    const source = sourceOf(METADATA),
      page = new Page("index.pt-BR.md", source, "en")

    expect(page.language).toBe("pt-BR")
    expect(page.path).toBe("/pt-BR/")
  })

  it("reads its title, description and order from the front matter", function () {
    const source = sourceOf(`${METADATA}\norder: 3`),
      page = new Page("vision/index.en.md", source, "en")

    expect(page.title).toBe("The vision")
    expect(page.description).toBe("What this is for.")
    expect(page.order).toBe(3)
  })

  it("orders a page with no stated order first", function () {
    const source = sourceOf(METADATA),
      page = new Page("vision/index.en.md", source, "en")

    expect(page.order).toBe(0)
  })

  it("keeps the body and the source apart", function () {
    const source = sourceOf(METADATA, "## A heading\n"),
      page = new Page("vision/index.en.md", source, "en")

    expect(page.body).toBe("## A heading\n")
    expect(page.source).toBe(source)
  })

  it("places itself within the sections above it, and within itself", function () {
    const source = sourceOf(METADATA),
      page = new Page("player/debugger/crtc.en.md", source, "en"),
      debugger_ = new Page("player/debugger/index.en.md", source, "en"),
      player = new Page("player/index.en.md", source, "en")

    expect(page.isWithin(page)).toBe(true)
    expect(page.isWithin(debugger_)).toBe(true)
    expect(page.isWithin(player)).toBe(true)
  })

  it("places itself outside a section it does not descend from", function () {
    const source = sourceOf(METADATA),
      page = new Page("player/debugger/crtc.en.md", source, "en"),
      machine = new Page("player/machine.en.md", source, "en"),
      vision = new Page("vision/index.en.md", source, "en")

    expect(page.isWithin(machine)).toBe(false)
    expect(page.isWithin(vision)).toBe(false)
  })

  it("places every page within the root", function () {
    const source = sourceOf(METADATA),
      home = new Page("index.en.md", source, "en"),
      page = new Page("player/debugger/crtc.en.md", source, "en")

    expect(page.isWithin(home)).toBe(true)
    expect(home.isWithin(page)).toBe(false)
  })

  it("refuses a file that is not named for a language", function () {
    const source = sourceOf(METADATA)

    expect(() => new Page("vision/home.md", source, "en")).toThrow(/<name>\.<language>\.md/u)
  })

  it("refuses a file with no front matter", function () {
    expect(() => new Page("vision/index.en.md", "Prose.\n", "en")).toThrow(/front matter/u)
  })
})
