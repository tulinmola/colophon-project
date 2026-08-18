import { TrustedHtml } from "./trusted_html.js"

const ESCAPED = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }

function escape(value) {
  if (Array.isArray(value)) {
    const escaped = value.map(escape)

    return escaped.join("")
  }

  if (value instanceof TrustedHtml) {
    return value.toString()
  }

  const text = String(value)

  return text.replace(/[&<>"']/gu, character => ESCAPED[character])
}

// Escaping is the default: a value is written as text unless it is TrustedHtml,
// which is what `html` returns, so nesting composes without escaping twice.
export function html(strings, ...values) {
  let markup = strings[0]

  for (let index = 0; index < values.length; index++) {
    markup += escape(values[index]) + strings[index + 1]
  }

  return new TrustedHtml(markup)
}
