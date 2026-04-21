

import os
import json
from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import anthropic


app = Flask(__name__)
CORS(app)

from dotenv import load_dotenv
load_dotenv()

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/analyze", methods=["POST"])
def analyze_resume():
    """
    Analyze resume using Claude AI.
    Expects JSON body: { "resume": "...", "job_description": "..." }
    Returns structured analysis JSON.
    """
    data = request.get_json()
    resume_text = data.get("resume", "").strip()
    job_text = data.get("job_description", "").strip()

    if not resume_text:
        return jsonify({"error": "Resume text is required"}), 400

    prompt = f"""You are an expert resume analyzer and career coach. Analyze this resume and return ONLY a JSON object — no markdown, no explanation, no backticks.

RESUME:
{resume_text}

JOB DESCRIPTION (if provided):
{job_text if job_text else "Not provided"}

Return exactly this JSON structure:
{{
  "overallScore": <number 0-100>,
  "verdict": "<one line verdict about candidate strength>",
  "atsScore": <number 0-100>,
  "keywordMatchScore": <number 0-100>,
  "impactScore": <number 0-100>,
  "sections": {{
    "summary": "<present|missing|weak>",
    "experience": "<present|missing|weak>",
    "education": "<present|missing|weak>",
    "skills": "<present|missing|weak>",
    "certifications": "<present|missing|weak>",
    "projects": "<present|missing|weak>"
  }},
  "keywordsFound": ["<keyword1>", "<keyword2>", "<keyword3>", "<keyword4>", "<keyword5>"],
  "keywordsMissing": ["<kw1>", "<kw2>", "<kw3>", "<kw4>"],
  "topSkills": [
    {{"name": "<skill>", "level": <0-100>}},
    {{"name": "<skill>", "level": <0-100>}},
    {{"name": "<skill>", "level": <0-100>}},
    {{"name": "<skill>", "level": <0-100>}},
    {{"name": "<skill>", "level": <0-100>}}
  ],
  "suggestions": [
    {{"title": "<short title>", "description": "<actionable advice>"}},
    {{"title": "<short title>", "description": "<actionable advice>"}},
    {{"title": "<short title>", "description": "<actionable advice>"}},
    {{"title": "<short title>", "description": "<actionable advice>"}}
  ],
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "weaknesses": ["<weakness 1>", "<weakness 2>", "<weakness 3>"]
}}"""

    try:
        message = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=1500,
            messages=[{"role": "user", "content": prompt}],
        )

        raw = message.content[0].text
        # Strip any accidental markdown fences
        clean = raw.replace("```json", "").replace("```", "").strip()
        result = json.loads(clean)
        return jsonify(result)

    except json.JSONDecodeError as e:
        return jsonify({"error": f"Failed to parse AI response: {str(e)}"}), 500
    except anthropic.APIError as e:
        return jsonify({"error": f"Anthropic API error: {str(e)}"}), 500
    except Exception as e:
        return jsonify({"error": f"Unexpected error: {str(e)}"}), 500


if __name__ == "__main__":
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        print("⚠️  WARNING: ANTHROPIC_API_KEY not set!")
        print("   Set it with: export ANTHROPIC_API_KEY=your_key_here")
        print()

    print("🚀 AI Resume Scanner starting...")
    print("   Open http://localhost:5000 in your browser")
    print()
    app.run(debug=True, port=5000)
