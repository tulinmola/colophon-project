import MarkdownIt from "markdown-it"
import { TrustedHtml } from "./trusted_html.js"
import anchor from "markdown-it-anchor"

// Raw HTML passes through, which is what lets a page carry a custom element.
// It also means markdown is trusted input: the day pages arrive by pull
// request from strangers, this is the line that has to move.
const markdownIt = new MarkdownIt({ html: true, typographer: true }).use(anchor, {
  permalink: anchor.permalink.headerLink({ class: null })
})

export function renderMarkdown(text) {
  const markup = markdownIt.render(text)

  return new TrustedHtml(markup)
}
