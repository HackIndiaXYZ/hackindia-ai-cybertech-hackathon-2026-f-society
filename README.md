# hackindia-ai-cybertech-hackathon-2026-f-society
Hackathon team repository for F Society - [hackindia-team:hackindia-ai-cybertech-hackathon-2026:f-society]

🔍 CodeLens AI

AI-Powered Code Review and Quality Analysis

HackIndia AI & CyberTech Hackathon 2026 | Team F Society

CodeLens AI is a full-stack web application that uses Google's Gemini AI to help developers review code, identify potential bugs, understand security risks, and improve code quality.

Our mission is to make code review easier, faster, and more understandable for students and developers.

🚀 Problem Statement

Developers spend significant time reviewing code, identifying bugs, finding security weaknesses, and improving maintainability. Beginners may also struggle to understand complex errors and how to fix them.

💡 Our Solution

CodeLens AI provides an interactive platform where users submit code and receive AI-assisted analysis, potential issue detection, and improvement suggestions.

✨ Key Features

- AI-powered code review using Google Gemini.
- Code quality indicators and review insights.
- Potential bug and security issue identification.
- Performance and readability suggestions.
- Interactive code editor and code file import.
- Structured AI feedback and improvement recommendations.
- Local review history, where supported by the application.
- Support for programming languages understood by the configured AI model.

Note: AI findings are suggestions, not guarantees. Developers should verify results and test recommended changes.

🛠️ Tech Stack

- Frontend: React 19, TypeScript, Vite
- Styling: Tailwind CSS
- UI and Animation: Motion, Lucide React
- Backend: Node.js, Express
- AI Integration: Google Gemini API
- Local Storage: JSON-based review history

🏗️ How It Works

User submits code
       |
       v
React Frontend
       |
       v
Express Backend
       |
       v
Google Gemini AI
       |
       v
Code Review Results
       |
       v
Issues and Suggestions

1. The user enters or imports code.
2. The frontend sends the review request to the backend.
3. The backend requests analysis from Gemini AI.
4. The application displays the generated review.
5. The developer examines the feedback and tests suitable improvements.

⚙️ Installation and Setup

Prerequisites

- Node.js and npm
- Git
- Google Gemini API key

1. Clone the repository

git clone https://github.com/HackIndiaXYZ/hackindia-ai-cybertech-hackathon-2026-f-society.git
cd hackindia-ai-cybertech-hackathon-2026-f-society

2. Install dependencies

npm install

3. Configure environment variables

Create a ".env" file in the project root, using ".env.example" if available.

GEMINI_API_KEY=your_gemini_api_key

Replace the placeholder with your own API key. Keep ".env" private and never commit credentials to GitHub.

4. Start the application

npm run dev

Open the local URL shown in your terminal.

5. Build for production

npm run build
npm run start

Run the production start command after a successful build. Refer to "package.json" and "DEPLOYMENT.md" for project-specific requirements.

🔐 Security and Privacy

- Keep API keys in environment variables.
- Never submit passwords or confidential code.
- Verify AI-generated security findings independently.
- Exclude private review history and local data from GitHub.
- Configure appropriate security controls before public deployment.

👥 Our Team — F Society

HackIndia AI & CyberTech Hackathon 2026

We developed CodeLens AI collaboratively, sharing ideas, coding, integration, debugging, and testing throughout the project.

Team Member| Role and Contribution
Aditya Patel| Project coordination, development, and application integration
Anjum Nisha| UI development, feature integration, and testing
Anushka Dubey| AI review workflow, feature development, and validation
Aradhya Srivastava| Backend integration, testing, and documentation

All team members contributed collaboratively to the project. The roles above describe our primary areas of responsibility, not exclusive ownership.

🔮 Future Scope

- Improved static analysis alongside AI-generated feedback.
- More detailed security reports and severity classifications.
- Exportable code review reports.
- GitHub repository and pull-request integration.
- Expanded automated testing.
- Secure database support for multi-user deployments.

These are planned improvements and may not yet be implemented.

🤝 Contributing

We welcome feedback, bug reports, and suggestions. Please include clear reproduction steps when reporting issues and never publish credentials or confidential code.

📄 License

See the ""LICENSE"" (LICENSE) file for the applicable license terms.

---

Built with teamwork by F Society ❤️ ( Aditya Patel , Anjum Nisha , Anushka dubey , Aradhya Srivastava )

CodeLens AI — Understand your code. Improve your code.

HackIndia AI & CyberTech Hackathon 2026
