import { describe, expect, it } from "vitest"
import { Page } from "./page.js"
import { Site } from "./site.js"
import { buildRecord } from "./build_record.js"

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

describe("buildRecord", function () {
  it("records what each source was read from and at which commit", function () {
    const source = {
        clean: true,
        commit: "e7e16edbc1ef8478a44463b8b6a2da7a1c8d6f2f",
        committedAt: "2026-08-19T21:50:01+02:00",
        origin: ".cache/player",
        ref: "main",
        repository: "tulinmola/colophon-player",
        slug: "player"
      },
      site = new Site(CONFIG, [pageAt("index.en.md")], [source]),
      record = buildRecord(site, "2026-08-19T21:00:00.000Z")

    expect(record.builtAt).toBe("2026-08-19T21:00:00.000Z")
    expect(record.sources[0].commit).toBe("e7e16edbc1ef8478a44463b8b6a2da7a1c8d6f2f")
    expect(record.sources[0].clean).toBe(true)
  })
})
