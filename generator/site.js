import { renderMarkdown } from "./markdown.js"

export class Site {
  #basePath
  #config
  #pages

  constructor(config, pages) {
    this.#basePath = new URL(config.baseUrl).pathname
    this.#config = config
    this.#pages = pages
  }

  get defaultLanguage() {
    return this.#config.defaultLanguage
  }

  get languages() {
    return this.#config.languages
  }

  get pages() {
    return this.#pages
  }

  get title() {
    return this.#config.title
  }

  absoluteUrl(path) {
    const relativePath = path.slice(1)

    return new URL(relativePath, this.#config.baseUrl).href
  }

  homeOf(language) {
    return this.#pages.find(page => page.language == language && page.segments.length == 0)
  }

  navigation(language) {
    const sections = this.#pages.filter(
      page => page.language == language && page.segments.length == 1 && !page.notFound
    )

    return sections.sort((first, second) => first.order - second.order)
  }

  notFoundPage() {
    return this.#pages.find(page => page.notFound && page.language == this.defaultLanguage)
  }

  render(page) {
    return renderMarkdown(page.body, this)
  }

  url(path) {
    return `${this.#basePath}${path.slice(1)}`
  }
}
