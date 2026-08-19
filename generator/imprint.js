function rowFor(source, strings) {
  const repository = `[${source.repository}](https://github.com/${source.repository})`

  if (!source.commit) {
    return `| ${repository} | ${strings.imprintUnclean} |`
  }

  const short = source.commit.slice(0, 7),
    commit = `[\`${short}\`](https://github.com/${source.repository}/commit/${source.commit})`

  return `| ${repository} | ${commit} |`
}

export function imprint(sources, strings) {
  const rows = sources.map(source => rowFor(source, strings)),
    lines = [
      "---",
      `title: ${strings.imprintTitle}`,
      `description: ${strings.imprintDescription}`,
      "generated: true",
      "order: 99",
      "---",
      "",
      strings.imprintIntro,
      "",
      `| ${strings.imprintRepository} | ${strings.imprintCommit} |`,
      "| --- | --- |",
      ...rows,
      "",
      "The same account is written as [`build.json`](/build.json), with the hour it was made."
    ]

  return `${lines.join("\n")}\n`
}
