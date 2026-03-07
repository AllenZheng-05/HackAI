# HackAI – AI Website Generator

A web application that takes a natural-language prompt from the user, uses **OpenAI GPT-4o** to generate a complete HTML/CSS/JavaScript frontend, and then automatically creates a **new GitHub repository** and commits all the generated files to it.

---

## Features

- 🤖 **AI-powered code generation** – GPT-4o produces polished, production-ready HTML, CSS, and JavaScript from your description.
- 🐙 **Automatic GitHub repo creation** – A brand-new repository is created and the code is committed in seconds.
- ⚡ **Real-time progress UI** – A step-by-step progress indicator keeps you informed throughout the process.
- 💡 **Example prompts** – Quick-start chips let you try the generator with a single click.

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/AllenZheng-05/HackAI.git
cd HackAI
```

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure environment variables

Copy the example file and fill in your credentials:

```bash
cp .env.example .env
```

| Variable | Description |
|---|---|
| `OPENAI_API_KEY` | Your OpenAI API key ([platform.openai.com/api-keys](https://platform.openai.com/api-keys)) |
| `GITHUB_TOKEN` | A GitHub Personal Access Token with the **repo** scope ([github.com/settings/tokens](https://github.com/settings/tokens)) |
| `GITHUB_ORG` | *(Optional)* GitHub organisation to create repos under. Leave blank to use your personal account. |

### 4. Run the application

```bash
python app.py
```

Then open [http://localhost:5000](http://localhost:5000) in your browser.

---

## Project Structure

```
HackAI/
├── app.py               # Flask backend (OpenAI + GitHub API logic)
├── requirements.txt     # Python dependencies
├── .env.example         # Environment variable template
├── templates/
│   └── index.html       # Main frontend page
└── static/
    ├── css/style.css    # Styles
    └── js/app.js        # Frontend JavaScript
```

---

## How It Works

1. The user types a prompt describing the desired website.
2. The Flask backend sends the prompt to **OpenAI GPT-4o**, which returns `index.html`, `style.css`, and `script.js` as structured JSON.
3. A new **GitHub repository** is created via the GitHub API.
4. The three generated files are committed to the repository.
5. The repository URL is returned and displayed in the UI.
