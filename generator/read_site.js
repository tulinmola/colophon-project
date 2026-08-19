import { Page } from "./page.js"
import { Site } from "./site.js"
import { imprint } from "./imprint.js"
import { join } from "node:path"
import { readConfig } from "./config.js"
import { readContent } from "./content.js"
import { readStrings } from "./strings.js"
import { resolveSource } from "./sources.js"
import { stateOf } from "./repository.js"

const ROOT = join(import.meta.dirname, "..")

function ownSourceOf(config) {
  const state = stateOf(ROOT)

  return {
    ...state,
    directory: join(ROOT, "content"),
    origin: "content",
    path: "content",
    ref: config.ref,
    repository: config.repository,
    slug: ""
  }
}

export function readSite() {
  const config = readConfig(),
    contentDirectory = join(ROOT, "content"),
    pages = readContent(contentDirectory, config.defaultLanguage),
    strings = readStrings(),
    own = ownSourceOf(config),
    sources = [own]

  for (const source of config.sources) {
    const resolved = resolveSource(source),
      gathered = readContent(resolved.directory, config.defaultLanguage, resolved.slug)

    sources.push(resolved)
    pages.push(...gathered)
  }

  const draft = new Site(config, pages, sources, strings),
    languages = Object.keys(config.languages),
    imprints = []

  for (const language of languages) {
    const words = draft.stringsFor(language),
      written = imprint(sources, words),
      page = new Page(`imprint/index.${language}.md`, written, config.defaultLanguage)

    imprints.push(page)
  }

  return new Site(config, [...pages, ...imprints], sources, strings)
}
