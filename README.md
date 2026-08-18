# The Colophon Project

## Prologue

A manuscript was copied in one place and read in another. The scriptorium bound it; somewhere else a room was kept warm and lit for the people who came to read what had been written.

This is that room. [Colophon](https://github.com/tulinmola/colophon-emulator) opens the boxes of the 8-bit era and [the player](https://github.com/tulinmola/colophon-player) carries the machine into a page; here is where the account of them is read, in whatever language the reader has, by people and by machines alike.

## Building

Node and npm are the whole toolchain. The site is plain markdown, rendered by a generator small enough to read in one sitting.

```sh
npm install
npm start        # serve the site, rebuilding on every save
npm run build    # write the site to dist/
npm run check    # formatting, linting and the tests
```

`npm start` serves the site under the path its `baseUrl` carries, so a link that works locally works published.

## Writing

A page is a folder holding `index.<language>.md`: front matter with a title and a description, then markdown starting at `##`. The folder is the page's own, so anything the prose cites can sit beside it.

Adding a page is adding that file. Nothing else knows the site's shape.

## The parts

The documentation of each project belongs to the repository that writes it, and is gathered here when the site is built. There is nothing to gather yet: the emulator and the player still keep everything in their READMEs, and `sources` in `site.config.json` is empty until they do not.

## License

MIT, like the rest of Colophon.
