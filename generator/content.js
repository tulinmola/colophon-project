import { join, sep } from "node:path"
import { readFileSync, readdirSync } from "node:fs"
import { Page } from "./page.js"

export function readContent(directory, defaultLanguage) {
  const names = readdirSync(directory, { recursive: true }),
    pages = []

  for (const name of names) {
    if (!name.endsWith(".md")) {
      continue
    }

    const relativePath = name.split(sep).join("/"),
      path = join(directory, name),
      source = readFileSync(path, "utf8"),
      page = new Page(relativePath, source, defaultLanguage)

    pages.push(page)
  }

  return pages
}
