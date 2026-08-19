import { existsSync, readFileSync, statSync, watch } from "node:fs"
import { extname, join, resolve } from "node:path"
import { createServer } from "node:http"
import { readConfig } from "./config.js"
import { resolveSource } from "./sources.js"
import { spawnSync } from "node:child_process"

const ROOT = join(import.meta.dirname, ".."),
  OUTPUT = join(ROOT, "dist"),
  BUILD_SCRIPT = join(ROOT, "generator", "build.js"),
  WATCHED = ["content", "generator", "src"],
  PORT = Number(process.env.PORT ?? 3000),
  SETTLE_MILLISECONDS = 50

const CONTENT_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".wasm": "application/wasm",
  ".woff2": "font/woff2",
  ".xml": "application/xml; charset=utf-8"
}

// Served under the path baseUrl carries, so a link that works here works
// published and a base path cannot be got wrong without it showing.
const config = readConfig(),
  BASE_PATH = new URL(config.baseUrl).pathname

// A rebuild runs as a child so that editing the generator takes effect too:
// a long-lived process keeps the first version of a module it loaded.
function rebuild() {
  spawnSync(process.execPath, [BUILD_SCRIPT], { stdio: "inherit" })
}

function fileFor(pathname) {
  const relativePath = decodeURIComponent(pathname),
    path = resolve(OUTPUT, `.${relativePath}`)

  if (!path.startsWith(OUTPUT)) {
    return null
  }

  if (existsSync(path) && statSync(path).isDirectory()) {
    return join(path, "index.html")
  }

  return existsSync(path) ? path : null
}

function watchedDirectories() {
  const directories = WATCHED.map(name => join(ROOT, name))

  for (const source of config.sources) {
    const resolved = resolveSource(source)

    directories.push(resolved.directory)
  }

  return directories
}

function watchSources() {
  let pending = null

  function schedule() {
    clearTimeout(pending)
    pending = setTimeout(rebuild, SETTLE_MILLISECONDS)
  }

  const directories = watchedDirectories()

  for (const directory of directories) {
    watch(directory, { recursive: true }, schedule)
  }
}

rebuild()
watchSources()

createServer(function (request, response) {
  const url = new URL(request.url, `http://localhost:${PORT}`)

  if (!url.pathname.startsWith(BASE_PATH)) {
    response.writeHead(302, { location: BASE_PATH })
    response.end()

    return
  }

  const pathname = url.pathname.slice(BASE_PATH.length - 1),
    path = fileFor(pathname)

  if (!path) {
    response.writeHead(404, { "content-type": CONTENT_TYPES[".html"] })
    response.end("<h1>404</h1>")

    return
  }

  const extension = extname(path),
    contentType = CONTENT_TYPES[extension] ?? "application/octet-stream",
    body = readFileSync(path)

  response.writeHead(200, { "content-type": contentType })
  response.end(body)
}).listen(PORT, function () {
  console.log(`Serving http://localhost:${PORT}${BASE_PATH}`)
})
