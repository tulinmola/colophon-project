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
  it("numbers a breadcrumb from one, in the order it is read", function () {
    const player = pageAt("player/index.en.md", "title: Player\ndescription: A."),
      crtc = pageAt("player/debugger/crtc.en.md", "title: CRTC\ndescription: B."),
      site = siteOf([player, crtc]),
      record = structuredData(crtc, site, [player, crtc]),
      records = JSON.parse(record.toString()),
      breadcrumb = records.find(entry => entry["@type"] == "BreadcrumbList"),
      steps = breadcrumb.itemListElement.map(item => [item.position, item.name])

    expect(steps).toEqual([
      [1, "Player"],
      [2, "CRTC"]
    ])
  })

  it("writes no breadcrumb for a page with nothing above it", function () {
    const page = pageAt("vision/index.en.md"),
      site = siteOf([page]),
      record = structuredData(page, site, []),
      records = JSON.parse(record.toString())

    expect(records).toHaveLength(1)
  })

  it("writes every angle bracket as an escape, so no title can close the script", function () {
    const page = pageAt("vision/index.en.md", "title: A </script> title\ndescription: A."),
      site = siteOf([page]),
      record = structuredData(page, site, []),
      json = record.toString()

    expect(json).not.toContain("</script>")
    expect(json).toContain("\\u003c/script>")
  })
})
