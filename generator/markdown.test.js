import { describe, expect, it } from "vitest"
import { Page } from "./page.js"
import { Site } from "./site.js"

const CONFIG = {
  baseUrl: "https://colophon-project.com/",
  defaultLanguage: "en",
  languages: { en: { name: "English", direction: "ltr" } },
  title: "The Colophon Project"
}

function renderedFrom(body) {
  const source = `---\ntitle: A page\ndescription: A description.\n---\n${body}`,
    page = new Page("index.en.md", source, "en"),
    site = new Site(CONFIG, [page])

  return site.render(page).toString()
}

describe("renderMarkdown", function () {
  it("sets the words of a language it knows apart", function () {
    const markup = renderedFrom("```c\nuint64_t pins = cpc_tick(&cpc);\n```\n")

    expect(markup).toContain('<code class="language-c">')
    expect(markup).toContain('class="hljs-type"')
  })

  it("leaves a language it does not know as it was written", function () {
    const markup = renderedFrom("```python\ndef run(): pass\n```\n")

    expect(markup).not.toContain("hljs-")
    expect(markup).toContain("def run(): pass")
  })

  it("escapes a block it does not highlight", function () {
    const markup = renderedFrom("```python\nx = '<script>'\n```\n")

    expect(markup).not.toContain("<script>")
    expect(markup).toContain("&lt;script&gt;")
  })

  it("names the file a block was taken from, when the fence says", function () {
    const markup = renderedFrom("```c src/z80.c\nvoid z80_tick(void);\n```\n")

    expect(markup).toContain("<figcaption>src/z80.c</figcaption>")
    expect(markup).toContain("<figure>")
  })

  it("writes no figure for a block that names no file", function () {
    const markup = renderedFrom("```c\nvoid z80_tick(void);\n```\n")

    expect(markup).not.toContain("<figure>")
  })

  it("escapes the name of a file, which is written by whoever sends it", function () {
    const markup = renderedFrom("```c <script>alert(1)</script>\nvoid f(void);\n```\n")

    expect(markup).not.toContain("<script>")
    expect(markup).toContain("&lt;script&gt;")
  })
})
