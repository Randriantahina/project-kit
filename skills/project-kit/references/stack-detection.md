# Stack detection heuristics

Check for these marker files/fields at the project root (and in immediate
subfolders for a monorepo — e.g. `backend/`, `frontend/`, `apps/*/`). A
project can match more than one row; detect all matches, don't stop at the
first one.

| Stack | Primary marker | Confirming signal |
|---|---|---|
| Laravel | `composer.json` | `"laravel/framework"` in `require` |
| Generic PHP (no framework match) | `composer.json` | no known framework package found |
| Flutter | `pubspec.yaml` | `flutter:` section present |
| Rust — Axum | `Cargo.toml` | `axum` in `[dependencies]` |
| Rust — Actix | `Cargo.toml` | `actix-web` in `[dependencies]` |
| Rust (generic) | `Cargo.toml` | no known web framework dependency found |
| Node/Express | `package.json` | `"express"` in `dependencies` |
| Next.js | `package.json` | `"next"` in `dependencies` |
| React (no meta-framework) | `package.json` | `"react"` present, no `next`/`remix` |
| NestJS | `package.json` | `"@nestjs/core"` in `dependencies` |
| Django | `requirements.txt` / `pyproject.toml` | `Django` listed |
| FastAPI | `requirements.txt` / `pyproject.toml` | `fastapi` listed |
| Go | `go.mod` | inspect imports for a router (`gin`, `echo`, `chi`) or note "stdlib net/http" |
| Ruby on Rails | `Gemfile` | `gem "rails"` |
| Java/Spring | `pom.xml` or `build.gradle` | `spring-boot` dependency |

## When nothing matches

1. Look for the closest single signal (a manifest file even without a known
   framework listed, or a dominant source file extension) and name that
   stack anyway (e.g. "generic PHP", "generic Rust") — coverage over a
   perfect taxonomy.
2. If genuinely nothing is identifiable (empty repo, docs-only repo, unusual
   setup), say so and ask the user what the stack is instead of guessing.

## Extending this list

Adding support for a new stack is just adding a row here — no code change
elsewhere in this skill is required. The generation logic in `init.md`
already handles "detected stack with no existing module" generically.
