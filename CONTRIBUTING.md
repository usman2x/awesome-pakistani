# Contributing to Awesome Pakistan

Thank you for helping maintain this public directory of Pakistani open-source developers, organizations, communities, and events.

## Who can be included

An entry should represent a Pakistani developer or an organization, community, or event connected to Pakistan's open-source ecosystem. It must have a public website or profile that allows maintainers to verify its identity and relevance.

Inclusion is not a ranking, endorsement, employment claim, or assessment of skill.

## Add or update an entry

1. Edit `awesome-data.json`; do not edit generated files directly.
2. Use the existing fields and place the entry in the appropriate section.
3. Keep technology names factual and concise.
4. Run the build and validation commands.
5. Open a pull request explaining what changed and link to public evidence when appropriate.

```bash
npm ci
npm run build
npm test
```

The build regenerates `README.md` and the files under `docs/`. Validation checks required fields, URLs, duplicate GitHub profiles, and generated-file synchronization.

## Corrections and removal

Open an issue or pull request if an entry is inaccurate, outdated, duplicated, or should be removed. A person may request correction or removal of their own profile without providing a reason.

## Data quality

- Use the canonical GitHub profile URL, not a repository URL.
- GitHub handle matching is case-insensitive.
- Do not add private information.
- Do not make subjective claims such as “best,” “top,” or “expert.”
- Prefer direct public evidence over inferred affiliations or roles.
