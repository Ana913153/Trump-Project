# Trump Project source snapshot

- Captured from production project path `/opt/trump-project` on server `.126` at 2026-09-27 22:22 UTC.
- Includes all files in the project tree except dependency installs, VCS metadata, caches, runtime logs/temp files, secret/environment files, database dumps, and private keys.
- Includes frontend/backend source, tests, SQL/Drizzle schema and migrations, project configuration and lockfile, public/uploaded website assets, and the current compiled `dist` snapshot.
- The production MariaDB database and `/etc/trump-project.env` are not part of this source archive. No customer balances, transactions, or credentials are included.

## GitHub upload

Extract this archive, review `.gitignore` and the manifest, then create or clone the intended GitHub repository and copy the project folder contents into it. Review the files before making a repository public. Dependencies can be restored from `pnpm-lock.yaml`; `node_modules` is intentionally excluded.
