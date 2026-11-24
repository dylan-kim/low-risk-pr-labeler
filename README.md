# Low-risk PR labeler

Adds a `low-risk` label to pull requests that only need a quick review, and removes it when a later push stops qualifying. Reviewers can then filter with `is:pr is:open label:low-risk` and approve these first.

A PR gets the label when **all** of these are true:
- it is not a draft
- its author is not a bot and has **3 or more merged PRs in this repo** (this PR is not counted)
- its change size (additions + deletions) is **below 1,000**, not counting lockfiles and `**/generated/**`
- it touches no Flyway migration (`**/db/migration/**`, `**/V*__*.sql`, `**/R__*.sql`) and no BPMN file (`**/*.bpmn`, `**/*.bpmn20.xml`)

Each run's job summary explains the result, e.g. `❌ risky change: db/migration/V12__x.sql`.

> The label only signals a quick review. It never approves anything and doesn't bypass branch protection.

## Usage

`.github/workflows/low-risk.yml`:

```yaml
name: low-risk
on:
  pull_request:
    types: [opened, synchronize, reopened, ready_for_review, converted_to_draft]
permissions:
  pull-requests: write
concurrency:
  group: low-risk-${{ github.event.pull_request.number }}
  cancel-in-progress: true
jobs:
  label:
    runs-on: ubuntu-latest
    steps:
      - uses: dylan-kim/low-risk-pr-labeler@v1
        # with:                    # all optional
        #   max_lines: "500"
        #   min_merged_prs: "3"
        #   risky_globs: |
        #     **/db/migration/**
        #     **/*.bpmn
        #   ignored_globs: |
        #     **/package-lock.json
        #   label: low-risk
        #   label_color: "0E8A16"
```

## Inputs

| Input | Default |
|---|---|
| `max_lines` | `1000` |
| `min_merged_prs` | `3` |
| `risky_globs` | Flyway migrations and BPMN files (see above) |
| `ignored_globs` | `package-lock.json`, `yarn.lock`, `pnpm-lock.yaml`, `gradle.lockfile`, `**/generated/**` |
| `label` | `low-risk` |
| `label_color` | `0E8A16` (green). Only used when the action creates the label; an existing label keeps its colour |
| `github-token` | `${{ github.token }}` |

Setting `risky_globs` or `ignored_globs` replaces the defaults instead of adding to them. Globs support `**`, `*` and `?`.

## Limitations

- PRs opened from forks don't get the label, because GitHub gives those runs a read-only token.
- Each run makes one search API call to count the author's merged PRs.

## Development

`node test/low-risk.test.mjs` runs the action's script against mocked PRs. It needs `node` and `ruby` to read `action.yml`.

The terms used here are defined in [GLOSSARY.md](./GLOSSARY.md).
