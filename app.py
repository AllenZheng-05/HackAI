"""Flask backend for the AI-powered website generator.

Flow:
  1. User submits a natural-language prompt via the web UI.
  2. The backend calls OpenAI to generate a complete, self-contained HTML/CSS/JS frontend.
  3. A new GitHub repository is created using the GitHub API.
  4. The generated files are committed to the new repository.
  5. The repository URL is returned to the frontend.
"""

import os
import re
import json
import textwrap

from flask import Flask, render_template, request, jsonify
from dotenv import load_dotenv
from openai import OpenAI
from github import Github, GithubException

load_dotenv()

app = Flask(__name__)

OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY", "")
GITHUB_TOKEN = os.environ.get("GITHUB_TOKEN", "")
GITHUB_ORG = os.environ.get("GITHUB_ORG", "").strip()

SYSTEM_PROMPT = textwrap.dedent("""\
    You are an expert frontend web developer. Given a description, produce a complete,
    modern, responsive, and visually appealing website frontend.

    Return ONLY valid JSON with the following keys and no additional text:
    {
      "repo_name": "<short-kebab-case-name for the repository>",
      "description": "<one-sentence description of the project>",
      "files": {
        "index.html": "<full HTML content>",
        "style.css":  "<full CSS content>",
        "script.js":  "<full JavaScript content>"
      }
    }

    Rules:
    - index.html must reference style.css via <link> and script.js via <script>.
    - Use modern HTML5 / CSS3 / vanilla ES6+. No external CDN links required (but
      you may include them for fonts or icons if it significantly improves the design).
    - Make the design polished, pixel-perfect, and production-ready.
    - repo_name must be all lowercase, hyphens only (no spaces or underscores).
    - Do NOT wrap the JSON in markdown code fences.
""")


def sanitize_repo_name(name: str) -> str:
    """Ensure repo name is valid for GitHub (lowercase, hyphens, alphanumeric)."""
    name = name.lower().strip()
    name = re.sub(r"[^a-z0-9-]", "-", name)
    name = re.sub(r"-{2,}", "-", name)
    name = name.strip("-") or "generated-website"
    return name[:100]  # GitHub limit


def generate_website_code(prompt: str) -> dict:
    """Call OpenAI to generate the website files and metadata."""
    client = OpenAI(api_key=OPENAI_API_KEY)

    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": prompt},
        ],
        temperature=0.7,
        max_tokens=4096,
        response_format={"type": "json_object"},
    )

    raw = response.choices[0].message.content
    data = json.loads(raw)

    # Validate expected structure
    required_keys = {"repo_name", "description", "files"}
    if not required_keys.issubset(data.keys()):
        raise ValueError(f"OpenAI response missing required keys: {required_keys - data.keys()}")

    data["repo_name"] = sanitize_repo_name(data.get("repo_name", "generated-website"))
    return data


def create_github_repo(repo_name: str, description: str, files: dict) -> str:
    """Create a new GitHub repository and push the generated files. Returns the HTML URL."""
    gh = Github(GITHUB_TOKEN)

    if GITHUB_ORG:
        org = gh.get_organization(GITHUB_ORG)
        repo = org.create_repo(
            repo_name,
            description=description,
            auto_init=False,
            private=False,
        )
    else:
        user = gh.get_user()
        repo = user.create_repo(
            repo_name,
            description=description,
            auto_init=False,
            private=False,
        )

    # Commit each generated file
    for filename, content in files.items():
        repo.create_file(
            path=filename,
            message=f"Add {filename}",
            content=content,
        )

    return repo.html_url


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/generate", methods=["POST"])
def generate():
    """Generate a website from a user prompt and push it to a new GitHub repository."""
    if not OPENAI_API_KEY:
        return jsonify({"error": "Server is missing OPENAI_API_KEY configuration."}), 500
    if not GITHUB_TOKEN:
        return jsonify({"error": "Server is missing GITHUB_TOKEN configuration."}), 500

    body = request.get_json(silent=True) or {}
    prompt = (body.get("prompt") or "").strip()
    if not prompt:
        return jsonify({"error": "Prompt is required."}), 400
    if len(prompt) > 2000:
        return jsonify({"error": "Prompt must be 2,000 characters or fewer."}), 400

    try:
        data = generate_website_code(prompt)
    except (json.JSONDecodeError, ValueError) as exc:
        return jsonify({"error": f"Failed to parse AI response: {exc}"}), 500
    except Exception as exc:  # noqa: BLE001
        return jsonify({"error": f"OpenAI error: {exc}"}), 500

    try:
        repo_url = create_github_repo(data["repo_name"], data["description"], data["files"])
    except GithubException as exc:
        msg = exc.data.get("message", str(exc)) if isinstance(exc.data, dict) else str(exc)
        return jsonify({"error": f"GitHub error: {msg}"}), 500
    except Exception as exc:  # noqa: BLE001
        return jsonify({"error": f"Unexpected error creating repository: {exc}"}), 500

    return jsonify({
        "repo_url": repo_url,
        "repo_name": data["repo_name"],
        "description": data["description"],
    })


if __name__ == "__main__":
    app.run(debug=False)
