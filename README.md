# Forum API

Back-End API for forum application built using JavaScript (Node.js). This is first project Dicoding Back-End Developer Expert

## How to run

1. Copy `test.example.json` and rename to `test.json` and fill with your configuration
2. Install dependencies (Recommended using pnpm)

```bash
pnpm install
```

3. Run the server

```bash
pnpm run start:dev  # run the development server
pnpm run start      # run production server
```

## Development command

```bash
pnpm run start:dev  # run the development server
pnpm run test       # run test and check test coverage using Jest

# Database Migration
pnpm run migrate                            # master command to run the database migration
pnpm run migrate up                         # run the migration
pnpm run migrate create "create-table-xxx"  # create a new migration file to create a table
pnpm run migrate:test                       # master command to run the database migration for testing
```
