import { renderMarkdown } from "./markdown.js"

export class Site {
  #basePath
  #config
  #pages
  #sources
  #strings

  constructor(config, pages, sources = [], strings = {}) {
    this.#basePath = new URL(config.baseUrl).pathname
    this.#config = config
    this.#pages = pages
    this.#sources = sources
    this.#strings = strings
  }

  get defaultLanguage() {
    return this.#config.defaultLanguage
  }

  get languages() {
    return this.#config.languages
  }

  get baseUrl() {
    return this.#config.baseUrl
  }

  get description() {
    return this.#config.description
  }

  get sources() {
    return this.#sources
  }

  get strings() {
    return this.#strings
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

  translationsOf(page) {
    return this.#pages.filter(
      other =>
        other.segments.length == page.segments.length &&
        page.segments.every((segment, index) => other.segments[index] == segment)
    )
  }

  #ancestorsOf(page) {
    const ancestors = this.#pages.filter(
      other =>
        other.language == page.language &&
        other.segments.length > 0 &&
        other.segments.length < page.segments.length &&
        page.isWithin(other)
    )

    return ancestors.sort((first, second) => first.segments.length - second.segments.length)
  }

  stringsFor(language) {
    const entries = Object.entries(this.#strings),
      strings = {}

    for (const [name, translations] of entries) {
      strings[name] = translations[language]
    }

    return strings
  }

  trailTo(page) {
    const ancestors = this.#ancestorsOf(page)

    if (ancestors.length == 0) {
      return []
    }

    return [...ancestors, page]
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
