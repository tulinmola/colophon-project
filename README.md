# The Colophon Project

## Prologue

A manuscript was copied in one place and read in another. The scriptorium bound it; somewhere else a room was kept warm and lit for the people who came to read what had been written.

This is that room. The [emulator](https://github.com/tulinmola/colophon-emulator) opens the boxes of the 8-bit era and the [player](https://github.com/tulinmola/colophon-player) carries the machine into a page; here is where the account of them is read, in whatever language the reader has, by people and by machines alike.

## Building

Node and npm are the whole toolchain. The site is plain markdown, rendered by a generator small enough to read in one sitting.

```sh
npm install
npm start        # serve the site, rebuilding on every save
npm run gather   # fetch the documentation of the sibling projects
npm run build    # write the site to dist/
npm run check    # formatting, linting, the tests and verify
```

`npm start` serves the site under the path its `baseUrl` carries, so a link that works locally works published.

## Writing

A page is a markdown file named `<name>.<language>.md`: front matter with a title and a description, then markdown starting at `##`. It becomes a folder holding `index.<language>.md` the day it carries artifacts, so that whatever the prose cites sits beside it; both spellings address the same page.

A link names the markdown file it points at, which is what makes it work in an editor, on GitHub, and once published.

Adding a page is adding that file. Nothing else knows the site's shape.

## The parts

The documentation of each project belongs to the repository that writes it, and is gathered here when the site is built. `sources` in `site.config.json` names them; the [player](https://github.com/tulinmola/colophon-player) is the first, and the emulator still keeps everything in its README.

A source is read where it stands. When the sibling repository is checked out beside this one it is read from there, so a page can be written and looked at before it is committed; `npm run gather` clones what is missing into `.cache/` for a machine with no siblings beside it. Nothing is copied into this repository, and every build says which of the two it read.

## Publishing

Pushing to `main` builds the site and publishes it to GitHub Pages.

A change in a sibling repository does not. Its documentation is gathered when the site is built, so the site carries what stood there the last time it was built; running the Pages workflow from the Actions tab is what goes back for it.

## License

MIT, like the rest of Colophon.
