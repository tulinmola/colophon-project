import { cpSync, mkdirSync, rmSync, writeFileSync } from "node:fs"
import { join } from "node:path"

function withFinalNewline(content) {
  const text = content.toString()

  return `${text.trimEnd()}\n`
}

export function emit(site, layout, outputDirectory, styleDirectory) {
  rmSync(outputDirectory, { force: true, recursive: true })

  for (const page of site.pages) {
    const directory = join(outputDirectory, page.path),
      document = layout(page, site),
      markup = withFinalNewline(document),
      source = withFinalNewline(page.source),
      documentPath = join(directory, "index.html"),
      sourcePath = join(directory, "index.md")

    mkdirSync(directory, { recursive: true })
    writeFileSync(documentPath, markup)
    writeFileSync(sourcePath, source)
  }

  const styleOutput = join(outputDirectory, "css")

  cpSync(styleDirectory, styleOutput, { recursive: true })
}
