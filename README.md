# One Learn

https://github.com/One-Learn-Platform/platform

## Development

### Prerequisites

- Node.js (Minimum version 18.x, LTS Version Recommended) ([Download](https://nodejs.org/en/download/))
- PNPM (Package Manager) ([Download](https://pnpm.io/installation))
- Git (Version Control System) ([Download](https://git-scm.com/downloads))
- Visual Studio Code (Recommended IDE) ([Download](https://code.visualstudio.com/Download))
- DB Browser (SQLite) ([Download](https://sqlitebrowser.org/))
- Cloudflare Account (For deployment) ([Sign Up](https://dash.cloudflare.com/sign-up))
- Bun (Optional, for local development) ([Download](https://bun.sh/))

### Cloning the Repository

1. Clone the repository to your local machine using the following command:

   ```bash
   git clone https://github.com/One-Learn-Platform/platform.git
   ```

2. Open the project in Visual Studio Code

   ```bash
   cd platform
   code .
   ```

### Project Structure

Inside the project, you will find the following folder structure:

```text
one-learn
├── e2e
├── r2-server         -> for running R2 locally
├── src               -> main application code
│   ├── lib
│   ├── routes
│   ├── app.css
│   ├── app.html
│   └── app.d.ts
├── static/
├── .env.example
├── .gitignore
├── .npmrc
├── .prettierignore
├── components.json
├── drizzle.config.ts
├── eslint.config.js
├── LICENSE
├── local.db
├── package.json
├── playwright.config.ts
├── pnpm-lock.yaml
├── prettier.config.js
├── README.md
├── svelte.config.js
├── tsconfig.json
├── vite.config.ts
└── wrangler.toml
```

**Important Files:**

- `src/app.css` - Global CSS styles
- `drizzle.config.ts` - Database schema and migration configuration
- `env.example` - Environment variables for development that mirror the production
- `wrangler.toml` - This contains the environment variables for Cloudflare Workers. Including the ones we set in `.env` file. Except the secret keys.

### Configuration

1. Rename the `.env.example` file to `.env` and update the environment variables if needed. This file is used for local development only and should not be used in production.
2. Install the required dependencies using PNPM:

   ```bash
   pnpm install
   ```

3. Build the database locally\
   This command use Wrangler, it's should be automatically installed with PNPM. You can find more information about all the commands in the [Wrangler Docs](https://developers.cloudflare.com/workers/wrangler/commands/).

   ```bash
   pnpm wrangler d1 migrations apply prod-db --local
   ```

   Key information:
   - `d1` - This is the name of the Cloudflare product for the database that One Learn uses.
   - `prod-db` - This is the name of the database that One Learn uses in production. This name mirror the one we use in production, but don't worry the data is totally separated because we use `--local`. If you want to change the database name, you can do so in the `wrangler.toml` file.
   - `--local` - This flag tells Wrangler to run the command locally instead of in the Cloudflare environment.

4. Seed the local database\
   This command will seed the local database with the initial data. This is useful for development and testing purposes.

   ```bash
   pnpm run seed
   ```

   This command will create the minimum data needed to run the app. This will seed a super admin so you can create a school and users. The default login credentials will be displayed in the console.

5. Run the application

   ```bash
   pnpm dev
   ```

   This will start the development server and you should be able to access the application at `http://localhost:5173`.

6. (Optional) Because we're using Cloudflare R2, we need to run the R2 server locally to test the file upload function

   ```bash
   cd r2-server
   bun run start
   ```

   This command will start the R2 server and you should be able to access the R2 server at `http://localhost:3000`.

## How To Self Host

One Learn can be self hosted on your own server. This guide will help you set up the server and deploy the application.

### Recommended Method (Serverless)

#### Requirements

1. Cloudflare Account\
   One Learn uses Cloudflare Pages for deployment, D1 for database and R2 for storage, all are services provided by Cloudflare. You will need to create an account on Cloudflare and set up the required services.
2. GitHub Account\
   You will need a GitHub account to clone and connect the repositories to Cloudflare pages.

#### Steps

1. Clone the repository\
   Clone the repository to your local machine using the following command:

   ```bash
   git clone https://github.com/One-Learn/one-learn.git
   ```

### Alternative Method (Docker)

Coming soon...
[Tutorial](https://www.sveltesociety.dev/recipes/publishing-and-deploying/dockerize-a-svelte-app)
