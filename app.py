import os
import json
import google.generativeai as genai
from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel("gemini-1.5-flash")

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/analyze", methods=["POST"])
def analyze_resume():
    data = request.get_json()
    resume_text = data.get("resume", "").strip()
    job_text = data.get("job_description", "").strip()

    if not resume_text:
        return jsonify({"error": "Resume text is required"}), 400

    prompt = f"""You are an expert resume analyzer and career coach.
Analyze this resume and return ONLY a JSON object.
No markdown, no explanation, no backticks. Just raw JSON.

RESUME:
{resume_text}

JOB DESCRIPTION:
{job_text if job_text else "Not provided"}

Return exactly this JSON structure:
{{
  "overallScore": <number 0-100>,
  "verdict": "<one line verdict>",
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
  "keywordsFound": ["kw1", "kw2", "kw3", "kw4", "kw5"],
  "keywordsMissing": ["kw1", "kw2", "kw3", "kw4"],
  "topSkills": [
    {{"name": "skill", "level": 80}},
    {{"name": "skill", "level": 75}},
    {{"name": "skill", "level": 70}},
    {{"name": "skill", "level": 65}},
    {{"name": "skill", "level": 60}}
  ],
  "suggestions": [
    {{"title": "title", "description": "advice"}},
    {{"title": "title", "description": "advice"}},
    {{"title": "title", "description": "advice"}},
    {{"title": "title", "description": "advice"}}
  ],
  "strengths": ["s1", "s2", "s3"],
  "weaknesses": ["w1", "w2", "w3"]
}}"""

    try:
        response = model.generate_content(prompt)
        raw = response.text
        clean = raw.replace("```json", "").replace("```", "").strip()
        result = json.loads(clean)
        return jsonify(result)

    except json.JSONDecodeError as e:
        return jsonify({"error": f"JSON parse error: {str(e)}"}), 500
    except Exception as e:
        return jsonify({"error": f"Gemini API error: {str(e)}"}), 500

if __name__ == "__main__":
    print("=" * 45)
    print("  AI Resume Scanner — Gemini Edition")
    print("  Open http://localhost:5000")
    print("=" * 45)
    port = int(os.environ.get("PORT", 5000))
    app.run(debug=False, host="0.0.0.0", port=port)