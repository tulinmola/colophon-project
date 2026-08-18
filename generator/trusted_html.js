// The marker that a string is already HTML: `html` writes these through and
// escapes everything else.
export class TrustedHtml {
  #markup

  constructor(markup) {
    this.#markup = markup
  }

  toString() {
    return this.#markup
  }
}
