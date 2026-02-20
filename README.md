# Next.js Boilerplate

This is a Next.js boilerplate designed to help you quickly start developing web applications based on a modern tech stack.

### Features

  - **Next.js 15+** with App Router
  - **React 19+**  JavaScript library for component-based architecture.
  - **TypeScript** for type safety
  - **Tailwind CSS** for utility-first styling
  - **Turbopack** for fast development speed
  - **ESLint & Prettier** for strict code conventions and auto-formatting on save
  - **Absolute Imports** using the `@/*` path alias

### Getting Started

Here is how to start a project using this boilerplate.

#### 1. Project Initialization

Follow the instructions below to complete the initial setup.

```bash
# 1. Clone the repository and navigate into the folder.
git clone https://github.com/Woolegend/Next-js-Boilerplate.git new-next-app
cd new-next-app

# 2. (Required) Run the interactive setup script.
npm run setup
```

The `npm run setup` command automatically performs the following tasks:

  - Create `.env.local`
  - Performs a clean installation of project dependencies (`node_modules`).
  - Deletes the boilerplate's existing Git history and creates a fresh initial commit for your project.

### Recommended VS Code Extensions

For the best development experience, we recommend installing the following VS Code extensions.
: Open Quick Open (`cmd` or `ctrl` + `p`) and paste the following commands.

  - **Prettier - Code formatter**
    ```
    ext install esbenp.prettier-vscode
    ```
  - **ESLint**
    ```
    ext install dbaeumer.vscode-eslint
    ```
  - **Tailwind CSS IntelliSense**
    ```
    ext install bradlc.vscode-tailwindcss
    ```

### Available Scripts

These are the main commands available in this boilerplate.

  - `npm run dev`: Runs the Next.js application in development mode (with Turbopack enabled).
  - `npm run build`: Builds the application for production.
  - `npm run start`: Starts the built production server.
  - `npm run lint`: Checks for code style issues using ESLint.
  - `npm run lint:fix`: Automatically fixes fixable ESLint and formatting issues.
  - `npm run setup`: **(Run once)** Performs all the initial setup tasks to start your project.

### License
This project is licensed under the MIT License. See the [LICENSE](https://opensource.org/license/MIT) file for details.