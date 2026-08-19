import { renderMarkdown } from "./markdown.js"

export class Site {
  #basePath
  #config
  #origins
  #pages

  constructor(config, pages, origins = {}) {
    this.#basePath = new URL(config.baseUrl).pathname
    this.#config = config
    this.#origins = origins
    this.#pages = pages
  }

  get defaultLanguage() {
    return this.#config.defaultLanguage
  }

  get languages() {
    return this.#config.languages
  }

  get origins() {
    return this.#origins
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

  childrenOf(section) {
    const depth = section.segments.length + 1,
      children = this.#pages.filter(
        page =>
          page.language == section.language &&
          page.segments.length == depth &&
          section.segments.every((segment, index) => page.segments[index] == segment)
      )

    return children.sort((first, second) => first.order - second.order)
  }

  pageAt(relativePath) {
    return this.#pages.find(page => page.relativePath == relativePath)
  }

  notFoundPage() {
    return this.#pages.find(page => page.notFound && page.language == this.defaultLanguage)
  }

  render(page) {
    return renderMarkdown(page, this)
  }

  url(path) {
    return `${this.#basePath}${path.slice(1)}`
  }
}
