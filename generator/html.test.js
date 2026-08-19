import { describe, expect, it } from "vitest"
import { TrustedHtml } from "./trusted_html.js"
import { html } from "./html.js"

describe("html", function () {
  it("escapes every character that would change the markup", function () {
    const document = html`<p>${"<script>&\"'"}</p>`,
      markup = document.toString()

    expect(markup).toBe("<p>&lt;script&gt;&amp;&quot;&#39;</p>")
  })

  it("neutralises markup arriving in front matter", function () {
    const title = "</title><script>alert(1)</script>",
      document = html`<title>${title}</title>`,
      markup = document.toString()

    expect(markup).not.toContain("<script>")
    expect(markup).toContain("&lt;script&gt;")
  })

  it("returns markup another template will trust", function () {
    const document = html`<p></p>`

    expect(document).toBeInstanceOf(TrustedHtml)
  })

  it("writes a nested template through without escaping it twice", function () {
    const inner = html`<em>${"a & b"}</em>`,
      outer = html`<p>${inner}</p>`,
      markup = outer.toString()

    expect(markup).toBe("<p><em>a &amp; b</em></p>")
  })

  it("joins an array with nothing between its parts", function () {
    const items = ["first", "second"].map(text => html`<li>${text}</li>`),
      document = html`<ul>
        ${items}
      </ul>`,
      markup = document.toString()

    expect(markup).toContain("<li>first</li><li>second</li>")
  })

  it("escapes the parts of an array that are not markup", function () {
    const document = html`<p>${["<a>", "<b>"]}</p>`,
      markup = document.toString()

    expect(markup).toBe("<p>&lt;a&gt;&lt;b&gt;</p>")
  })

  it("writes a value that is not a string as text", function () {
    const document = html`<p>${1984}</p>`,
      markup = document.toString()

    expect(markup).toBe("<p>1984</p>")
  })
})
