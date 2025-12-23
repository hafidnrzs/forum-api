# Forum API

Back-End API for forum application built using JavaScript (Node.js). This is first project Dicoding Back-End Developer Expert

## How to run

1. Copy `test.example.json` and rename to `test.json` and fill with your configuration
2. Copy `.env.example` and rename to `.env` and fill with your environment variable
3. Install dependencies

```bash
npm install
```

3. Run the server

```bash
npm run start:dev  # run the development server
npm run start      # run production server
```

## Development command

```bash
npm run start:dev  # run the development server
npm run test       # run test and check test coverage using Jest

# Database Migration
npm run migrate                            # master command to run the database migration
npm run migrate up                         # run the migration
npm run migrate create "create-table-xxx"  # create a new migration file to create a table
npm run migrate:test                       # master command to run the database migration for testing
```
