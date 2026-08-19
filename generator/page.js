import { parse as parseYaml } from "yaml"

const FILE_NAME = /^(?<name>[a-z0-9-]+)\.(?<language>[a-z]{2,3}(?:-[A-Za-z0-9]+)*)\.md$/u
const FRONT_MATTER = /^---\r?\n(?<metadata>[\s\S]*?)\r?\n---\r?\n(?<body>[\s\S]*)$/u

function pathOf(segments, language, defaultLanguage) {
  if (language == defaultLanguage && segments.length == 0) {
    return "/"
  }

  return `/${[language, ...segments].join("/")}/`
}

export class Page {
  #body
  #language
  #metadata
  #path
  #relativePath
  #segments
  #source

  constructor(relativePath, source, defaultLanguage) {
    const segments = relativePath.split("/"),
      fileName = segments.pop(),
      name = FILE_NAME.exec(fileName),
      frontMatter = FRONT_MATTER.exec(source)

    if (!name) {
      throw new Error(`${relativePath}: a page is named <name>.<language>.md`)
    }

    if (!frontMatter) {
      throw new Error(`${relativePath}: a page opens with a YAML front matter block`)
    }

    if (name.groups.name != "index") {
      segments.push(name.groups.name)
    }

    this.#body = frontMatter.groups.body
    this.#language = name.groups.language
    this.#metadata = parseYaml(frontMatter.groups.metadata)
    this.#path = pathOf(segments, this.#language, defaultLanguage)
    this.#relativePath = relativePath
    this.#segments = segments
    this.#source = source
  }

  get body() {
    return this.#body
  }

  get description() {
    return this.#metadata.description
  }

  get generated() {
    return this.#metadata.generated == true
  }

  get language() {
    return this.#language
  }

  get notFound() {
    return this.#metadata.notFound == true
  }

  get order() {
    return this.#metadata.order ?? 0
  }

  get path() {
    return this.#path
  }

  get relativePath() {
    return this.#relativePath
  }

  get segments() {
    return this.#segments
  }

  get source() {
    return this.#source
  }

  get title() {
    return this.#metadata.title
  }

  isWithin(section) {
    return section.segments.every((segment, index) => this.#segments[index] == segment)
  }
}
