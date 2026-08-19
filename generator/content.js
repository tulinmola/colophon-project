import { join, sep } from "node:path"
import { readFileSync, readdirSync } from "node:fs"
import { Page } from "./page.js"

export function readContent(directory, defaultLanguage, prefix = "") {
  const names = readdirSync(directory, { recursive: true }),
    pages = []

  names.sort()

  for (const name of names) {
    if (!name.endsWith(".md")) {
      continue
    }

    const relativeName = name.split(sep).join("/"),
      relativePath = prefix ? `${prefix}/${relativeName}` : relativeName,
      path = join(directory, name),
      source = readFileSync(path, "utf8"),
      page = new Page(relativePath, source, defaultLanguage)

    pages.push(page)
  }

  return pages
}
