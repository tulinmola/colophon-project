import MarkdownIt from "markdown-it"
import { TrustedHtml } from "./trusted_html.js"
import anchor from "markdown-it-anchor"
import bash from "highlight.js/lib/languages/bash"
import c from "highlight.js/lib/languages/c"
import hljs from "highlight.js/lib/core"
import xml from "highlight.js/lib/languages/xml"

const HREF = /^(?<path>[^?#]*)(?<suffix>[?#].*)?$/u,
  SCHEME = /^[a-z][a-z0-9+.-]*:/iu

hljs.registerLanguage("bash", bash)
hljs.registerLanguage("c", c)
hljs.registerLanguage("xml", xml)

// An empty string is what markdown-it takes for "escape it yourself", which is
// what a language nothing here is written in gets.
function highlight(code, language) {
  if (!hljs.getLanguage(language)) {
    return ""
  }

  const highlighted = hljs.highlight(code, { language })

  return highlighted.value
}

// Raw HTML passes through, which is what lets a page carry a custom element.
// It also means markdown is trusted input: the day pages arrive by pull
// request from strangers, this is the line that has to move.
const markdownIt = new MarkdownIt({ highlight, html: true, typographer: true }).use(anchor, {
  permalink: anchor.permalink.headerLink({ class: null })
})

const defaultFence = markdownIt.renderer.rules.fence

markdownIt.renderer.rules.fence = function (tokens, index, options, env, renderer) {
  const token = tokens[index],
    words = token.info.trim().split(/\s+/u),
    name = words.slice(1).join(" "),
    block = defaultFence(tokens, index, options, env, renderer)

  if (!name) {
    return block
  }

  const caption = markdownIt.utils.escapeHtml(name)

  return `<figure>\n<figcaption>${caption}</figcaption>\n${block}</figure>\n`
}

// A link to a markdown file resolves where the file sits, not where the page
// it becomes is addressed: a page written flat is a sibling of its neighbours
// on disc and a level above them in the site.
function pageFor(path, page, site) {
  const directory = page.relativePath.replace(/[^/]*$/u, ""),
    resolved = new URL(path, `https://site/${directory}`),
    relativePath = resolved.pathname.slice(1)

  return site.pageAt(relativePath)
}

function rewrite(href, page, site) {
  if (href.startsWith("#") || SCHEME.test(href)) {
    return null
  }

  const parts = HREF.exec(href),
    path = parts.groups.path,
    suffix = parts.groups.suffix ?? ""

  if (path.endsWith(".md")) {
    const target = pageFor(path, page, site)

    if (!target) {
      return null
    }

    const url = site.url(target.path)

    return `${url}${suffix}`
  }

  const resolved = new URL(path, `https://site${page.path}`),
    url = site.url(resolved.pathname)

  return `${url}${suffix}`
}

markdownIt.renderer.rules.link_open = function (tokens, index, options, env, renderer) {
  const token = tokens[index],
    href = token.attrGet("href"),
    rewritten = rewrite(href, env.page, env.site)

  if (rewritten) {
    token.attrSet("href", rewritten)
  }

  return renderer.renderToken(tokens, index, options)
}

export function renderMarkdown(page, site) {
  const markup = markdownIt.render(page.body, { page, site })

  return new TrustedHtml(markup)
}
