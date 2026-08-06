# Pakistani Open-Source Developers and Organizations

> **Awesome Pakistan** is a community-maintained directory of Pakistani open-source developers, GitHub contributors, software organizations, technology communities, and open-source events.

Browse **<%= awesome.reduce((total, section) => total + section.profiles.length, 0) %> public profiles** by technology and category. The structured source is available in [`awesome-data.json`](./awesome-data.json), and the searchable web directory is published at [<%= metadata.canonical_url.replace(/^https?:\/\//, '').replace(/\/$/, '') %>](<%= metadata.canonical_url %>).

Last updated: **<%= metadata.last_updated %>**

## Directory

<% for (const section of awesome) { -%>
- [<%= section.type %>](#<%= section.type.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') %>) (<%= section.profiles.length %>)
<% } -%>

<% for (const section of awesome) { -%>
## <%= section.type %>

| Name | GitHub | Technologies and focus | Website |
| --- | --- | --- | --- |
<% for (const profile of section.profiles) { -%>
| <%= profile.name %> | <% if (profile.github_link) { %>[@<%= profile.github_user %>](<%= profile.github_link %>)<% } else { %>—<% } %> | <%= profile.technologies.join(', ') %> | [<%= profile.name %> website](<%= profile.web %>) |
<% } -%>

<% } -%>
## Inclusion and verification

Entries represent publicly identifiable Pakistani developers, open-source contributors, software organizations, communities, or events with verifiable public profiles. Inclusion is not a ranking or endorsement.

- GitHub handles and profile URLs must match.
- Links, required fields, duplicates, and generated outputs are checked automatically.
- Technology labels are self-described or derived from the submitted public profile.
- Corrections and removal requests are welcome through [GitHub issues](https://github.com/usman2x/awesome-pakistani/issues).

## Use the data

- [`awesome-data.json`](./awesome-data.json) — canonical JSON dataset
- [`awesome-data.schema.json`](./awesome-data.schema.json) — JSON Schema
- [Searchable directory](<%= metadata.canonical_url %>) — human-readable web version
- [`CITATION.cff`](./CITATION.cff) — citation metadata

## Contributing

Read [`CONTRIBUTING.md`](./CONTRIBUTING.md), add or update an entry in `awesome-data.json`, and run:

```bash
npm ci
npm run build
npm test
```

## License

The repository and dataset are available under the [MIT License](./LICENSE).
