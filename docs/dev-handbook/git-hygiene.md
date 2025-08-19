## Git hygiene

### What is blocked (and why)
The repo blocks committing IDE metadata, build outputs, Gradle caches, and secrets to keep the history clean and secure:

- .idea/, *.iml, .gradle/, any build/ directories
- android-app/local.properties, android-app/app/google-services.json

### Tracked pre-commit hook
Install the tracked hook so everyone gets the same checks:

```bash
git config core.hooksPath .githooks
```

The hook scans staged files and blocks commits that include forbidden paths. To bypass (rarely), you can use `--no-verify`, but doing so may introduce noisy or sensitive files.

### CI guard for PRs
Workflow `.github/workflows/guard-no-garbage.yml` fails the PR if any forbidden paths are included, ensuring consistency even if local hooks are not installed.


