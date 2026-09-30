# imoses.me

Source for [imoses.me](https://imoses.me): Ido Moshe's lab of small, interactive experiments.

## Build

```bash
npm ci && npm run build        # interactive figures → assets/demos/
bundle install
bundle exec jekyll serve       # site → http://localhost:4000
```

Pushing to `main` builds and deploys to GitHub Pages (`.github/workflows/jekyll.yml`).

Working on this repo with an AI agent? Start with [`AGENTS.md`](AGENTS.md).
