import { cpSync, mkdirSync, rmSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { recordsOf } from "./records.js"

function withFinalNewline(content) {
  const text = content.toString()

  return `${text.trimEnd()}\n`
}

function write(directory, name, content) {
  const path = join(directory, name),
    text = withFinalNewline(content)

  writeFileSync(path, text)
}

// GitHub Pages answers an unknown path with /404.html, which is why the page
// that says so is written twice: once at its own address, once at that one.
function emitNotFound(site, layout, outputDirectory) {
  const page = site.notFoundPage(),
    document = layout(page, site)

  write(outputDirectory, "404.html", document)
}

function emitRecords(site, outputDirectory, builtAt) {
  const records = recordsOf(site, builtAt),
    entries = Object.entries(records)

  for (const [name, content] of entries) {
    write(outputDirectory, name, content)
  }
}

export function emit(site, layout, outputDirectory, styleDirectory, builtAt) {
  rmSync(outputDirectory, { force: true, recursive: true })

  for (const page of site.pages) {
    const directory = join(outputDirectory, page.path),
      document = layout(page, site)

    mkdirSync(directory, { recursive: true })
    write(directory, "index.html", document)
    write(directory, "index.md", page.source)
  }

  const styleOutput = join(outputDirectory, "css")

  cpSync(styleDirectory, styleOutput, { recursive: true })
  emitNotFound(site, layout, outputDirectory)
  emitRecords(site, outputDirectory, builtAt)
}
