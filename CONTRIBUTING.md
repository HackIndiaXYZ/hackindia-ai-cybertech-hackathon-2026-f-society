Contributing to CodeLens AI

Thank you for your interest in contributing to CodeLens AI, developed by Team F Society for the HackIndia AI & CyberTech Hackathon 2026.

We welcome bug reports, feature suggestions, documentation improvements, and code contributions that help make AI-assisted code review more useful and reliable.

🚀 Getting Started

1. Fork the Repository

Fork the official repository to your GitHub account:

"CodeLens AI — Team F Society" (https://github.com/HackIndiaXYZ/hackindia-ai-cybertech-hackathon-2026-f-society)

2. Clone Your Fork

Replace "<your-username>" with your GitHub username.

git clone https://github.com/<your-username>/hackindia-ai-cybertech-hackathon-2026-f-society.git
cd hackindia-ai-cybertech-hackathon-2026-f-society

3. Install Dependencies

Make sure Node.js and npm are installed, then run:

npm install

4. Configure Environment Variables

Create a local ".env" file using ".env.example", if available.

Linux or macOS:

cp .env.example .env

Windows PowerShell:

Copy-Item .env.example .env

Add your own Gemini API key using the environment variable expected by the backend:

GEMINI_API_KEY=your_gemini_api_key

Never commit ".env", API keys, passwords, or other sensitive information.

5. Start the Development Server

npm run dev

Open the local URL displayed in your terminal.

🛠️ Development Guidelines

Please follow these guidelines when contributing:

- Keep changes focused: Avoid unrelated changes or unnecessary refactoring.
- Type Safety: Run "npm run lint" to check TypeScript compilation.
- Production Build: Run "npm run build" before submitting changes.
- Code Quality: Write readable, maintainable code and handle errors appropriately.
- Security: Never expose API credentials or submit confidential code and user data.
- Documentation: Update the README or relevant documentation when behavior or setup instructions change.
- Dependencies: Avoid adding unnecessary packages or upgrading dependencies without a clear reason.

Branch Naming

Use descriptive branch names, such as:

feature/improved-code-review
fix/review-history
docs/update-readme

Commit Messages

Use clear, descriptive commit messages. Conventional Commit prefixes are encouraged:

feat: improve code review feedback
fix: handle empty code submissions
docs: update installation instructions
test: add review validation tests

📬 Submitting a Pull Request

1. Create a feature branch:
   
   git checkout -b feature/your-feature-name

2. Make your changes and test them locally.

3. Review your changes:
   
   git diff --check
git status --short

4. Stage and commit the intended files:
   
   git add <files-to-include>
git commit -m "feat: describe your change"

5. Push your branch to your fork:
   
   git push -u origin feature/your-feature-name

6. Open a Pull Request from your fork against the official repository's "main" branch, if that is the repository's configured default contribution branch.

Pull Request Checklist

Before submitting your pull request, ensure that:

- [ ] Your changes have a clear purpose.
- [ ] The application builds successfully.
- [ ] TypeScript checks pass.
- [ ] Existing functionality is preserved.
- [ ] No API keys, credentials, or private user data are included.
- [ ] Documentation is updated when necessary.
- [ ] Screenshots are included for relevant UI changes.

Describe the problem, your solution, and how you tested the changes. Mention any known limitations.

🐛 Reporting Bugs

When reporting an issue, include:

- A clear description of the problem.
- Steps to reproduce it.
- Expected and actual behavior.
- Relevant error messages with sensitive information removed.
- Your operating system and Node.js version, when relevant.

Do not post API keys, passwords, confidential source code, or private review history in public issues.

💡 Suggesting Features

We welcome suggestions that improve code analysis, usability, security, performance, accessibility, and developer experience.

Please explain the problem your proposed feature solves and how it could benefit users.

🤝 Code of Conduct

Be respectful, constructive, and welcoming. Treat contributors fairly, discuss disagreements professionally, and focus feedback on improving the project.

📄 License

Contributions are subject to the license and contribution terms applicable to this repository. Please review the repository's "LICENSE" file before contributing.

---

Built collaboratively by Team F Society for HackIndia AI & CyberTech Hackathon 2026.

Thank you for helping improve CodeLens AI!