import { cpSync, mkdirSync, rmSync, writeFileSync } from "node:fs"
import { buildRecord } from "./build_record.js"
import { catalogue } from "./catalogue.js"
import { join } from "node:path"
import { llmsText } from "./llms.js"
import { robots } from "./robots.js"
import { sitemap } from "./sitemap.js"

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
  const rules = robots(site),
    urls = sitemap(site),
    guide = llmsText(site),
    index = catalogue(site),
    record = buildRecord(site, builtAt),
    indexJson = JSON.stringify(index, null, 2),
    recordJson = JSON.stringify(record, null, 2)

  write(outputDirectory, "robots.txt", rules)
  write(outputDirectory, "sitemap.xml", urls)
  write(outputDirectory, "llms.txt", guide)
  write(outputDirectory, "index.json", indexJson)
  write(outputDirectory, "build.json", recordJson)
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
