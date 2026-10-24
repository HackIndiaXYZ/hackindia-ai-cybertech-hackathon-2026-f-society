🚀 Deployment & GitHub Guide — CodeLens AI

HackIndia AI & CyberTech Hackathon 2026
Team: F Society

This guide explains how to prepare CodeLens AI for GitHub and deploy the application to a public URL.

1. 📦 Prepare and Push Code to GitHub

Step 1: Open the project directory

Open a terminal in the CodeLens AI project root, where "package.json" is located.

Check the current Git repository:

git rev-parse --show-toplevel
git status --short
git remote -v

If the project is already a Git repository, preserve its existing history and configuration. Do not run "git init" again unnecessarily.

Step 2: Review files before staging

Ensure ".gitignore" excludes at least:

.env
.env.*
!.env.example
node_modules/
dist/
coverage/
tmp/
database/*.json

Review these rules against the actual project structure. Add any other private local data or generated files that should remain untracked.

Check that sensitive files are ignored:

git check-ignore -v .env database/sqlite_reviews.json

If a file is not present, Git may report an error. If a sensitive file is already tracked, untrack it without deleting its local copy before proceeding.

Never publish API keys, passwords, private review history, or confidential code.

Step 3: Review and stage intended files

Inspect the files you plan to include:

git status --short
git diff --check
git diff

Stage specific files or directories that you have reviewed:

git add README.md CONTRIBUTING.md DEPLOYMENT.md .gitignore

Add the actual application source and other required project files after reviewing them. Do not blindly stage everything with "git add .".

Inspect the staged changes:

git diff --cached --check
git diff --cached
git status --short

Make sure ".env", private review data, dependencies, and generated build files are not staged.

Step 4: Commit the reviewed changes

If you have verified the staged files:

git commit -m "feat: prepare CodeLens AI hackathon submission"

If Git reports that there is nothing to commit, check the repository status instead of forcing another commit.

Step 5: Connect to the HackIndia repository

Official repository:

https://github.com/HackIndiaXYZ/hackindia-ai-cybertech-hackathon-2026-f-society

Check the existing remote:

git remote -v

If "origin" already points to the correct repository, keep it.

If no remote exists, add the official URL:

git remote add origin https://github.com/HackIndiaXYZ/hackindia-ai-cybertech-hackathon-2026-f-society.git

If "origin" points somewhere else, verify the current repository and team workflow before changing it.

Step 6: Push safely

Check the current branch:

git branch --show-current

Before pushing, confirm the branch and the HackIndia submission instructions with your team. Do not rename branches or overwrite remote history blindly.

If you have permission to push to the official repository and its configured target branch is "main", push your reviewed branch using the appropriate command:

git push -u origin main

If you are not authorized to push directly, push to your own fork and open a pull request instead.

Never use force-push to resolve an unfamiliar Git error.

---

2. 🌐 Deploy CodeLens AI

CodeLens AI uses a React/Vite frontend and a Node.js/Express backend with Google Gemini integration.

Before selecting a hosting provider, verify that the production build serves the frontend and exposes the backend API correctly.

Option A: Render

Website: https://render.com/

1. Sign in and connect your GitHub account.
2. Create a new Web Service.
3. Select the repository containing the complete CodeLens AI application.
4. Configure the service using the actual project build and start commands.
5. Add the required environment variables in Render's dashboard.
6. Deploy and inspect the build logs.
7. Open the public URL and test the application.

Example commands, subject to verification against "package.json":

Build command

npm install && npm run build

Start command

npm run start

Set "GEMINI_API_KEY" using Render's environment-variable settings.

Let the hosting provider supply the "PORT" value where supported. The Express server must listen on the configured port and an appropriate network interface.

Free-tier availability, usage limits, and persistent storage can change. Check the provider's current pricing and service limitations before deployment.

Option B: Railway

Website: https://railway.com/

1. Create a project and connect your GitHub repository.
2. Configure the Node.js service.
3. Add the required environment variables.
4. Verify the build and start commands.
5. Generate a public domain if supported by your service configuration.
6. Test the frontend, backend API, and Gemini integration.

Do not assume that the application will deploy correctly without verifying its start command, port handling, and production frontend routing.

Option C: Docker

If the repository includes a working Dockerfile, build and run the application locally:

docker build -t codelens-ai .
docker run --rm -p 3000:3000 \
  -e GEMINI_API_KEY=your_gemini_api_key \
  codelens-ai

Replace the placeholder with your own key. Avoid putting real credentials in shell history or shared logs.

Check the Dockerfile's configured port and entry point before running these commands.

---

3. 🔑 Obtain a Google Gemini API Key

1. Open https://aistudio.google.com/
2. Sign in with your Google account.
3. Create an API key using the available options.
4. Configure it locally in ".env" or in the hosting provider's secret settings.

Example:

GEMINI_API_KEY=your_gemini_api_key

Use the exact environment-variable name expected by the backend.

Never put a real key in GitHub, a public README, screenshots, or frontend JavaScript.

If a key is exposed, revoke or rotate it promptly.

---

4. 🧪 Validate the Deployment

After deployment, verify:

- The public application URL loads correctly.
- The frontend can communicate with the backend.
- Gemini API requests work with a valid key.
- API errors are handled gracefully.
- Review history behaves as expected.
- Private user data is not exposed.
- Secrets are not returned to the frontend or included in logs.
- The application works after a fresh deployment.

5. 🔐 Production Security Notes

The current project uses local JSON-based review history. Do not assume this is suitable for a multi-user production deployment.

Before exposing the service publicly, evaluate authentication, authorization, rate limiting, request-size limits, API usage controls, persistent storage, and user-data retention.

🏁 Project Information

Project: CodeLens AI
Team: F Society
Event: HackIndia AI & CyberTech Hackathon 2026

Goal: Make AI-assisted code review more accessible, understandable, and useful for developers.

---

Always verify the repository state, deployment configuration, and secrets before publishing or deploying the application.