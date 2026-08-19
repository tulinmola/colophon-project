import MarkdownIt from "markdown-it"
import { TrustedHtml } from "./trusted_html.js"
import anchor from "markdown-it-anchor"

// Raw HTML passes through, which is what lets a page carry a custom element.
// It also means markdown is trusted input: the day pages arrive by pull
// request from strangers, this is the line that has to move.
const markdownIt = new MarkdownIt({ html: true, typographer: true }).use(anchor, {
  permalink: anchor.permalink.headerLink({ class: null })
})

markdownIt.renderer.rules.link_open = function (tokens, index, options, env, renderer) {
  const token = tokens[index],
    href = token.attrGet("href")

  if (href.startsWith("/")) {
    const url = env.site.url(href)

    token.attrSet("href", url)
  }

  return renderer.renderToken(tokens, index, options)
}

export function renderMarkdown(text, site) {
  const markup = markdownIt.render(text, { site })

  return new TrustedHtml(markup)
}
