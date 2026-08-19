import { describe, expect, it } from "vitest"
import { imprint } from "./imprint.js"

const STRINGS = {
  imprintCommit: "Commit",
  imprintDescription: "A description.",
  imprintIntro: "An account.",
  imprintRepository: "Repository",
  imprintTitle: "The imprint",
  imprintUnclean: "an unclean tree"
}

describe("imprint", function () {
  it("names a clean source by the commit it stands on", function () {
    const source = {
        clean: true,
        commit: "1954b4e9605c16ee49a8db2846635370091583a3",
        repository: "tulinmola/colophon-emulator"
      },
      written = imprint([source], STRINGS)

    expect(written).toContain("[`1954b4e`]")
    expect(written).toContain("/commit/1954b4e9605c16ee49a8db2846635370091583a3")
  })

  it("refuses to name a commit for a tree with changes in it", function () {
    const source = { clean: false, commit: null, repository: "tulinmola/colophon-player" },
      written = imprint([source], STRINGS)

    expect(written).toContain("an unclean tree")
    expect(written).not.toContain("/commit/")
  })

  it("marks itself generated, so nothing looks for the file it came from", function () {
    const source = { clean: true, commit: "abc1234", repository: "a/b" },
      written = imprint([source], STRINGS)

    expect(written).toContain("generated: true")
  })
})
