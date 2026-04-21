# AI Resume Scanner 🔍

A dark VS Code-themed AI-powered resume analyzer built with Python (Flask) + Claude AI.

## Project Structure

```
resume-scanner/
├── app.py                  ← Flask backend (main entry point)
├── requirements.txt        ← Python dependencies
├── README.md
├── templates/
│   └── index.html          ← Main HTML page
└── static/
    ├── css/
    │   └── style.css       ← Dark VS Code theme
    └── js/
        └── main.js         ← Frontend logic & pipeline animation
```

## Setup in VS Code

### 1. Clone / open the folder

Open the `resume-scanner/` folder in VS Code.

### 2. Create a virtual environment

```bash
python -m venv venv
```

Activate it:
- **Windows**: `venv\Scripts\activate`
- **Mac/Linux**: `source venv/bin/activate`

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Set your Anthropic API key

Get your key from https://console.anthropic.com

**Mac/Linux:**
```bash
export ANTHROPIC_API_KEY=sk-ant-your-key-here
```

**Windows (CMD):**
```cmd
set ANTHROPIC_API_KEY=sk-ant-your-key-here
```

**Windows (PowerShell):**
```powershell
$env:ANTHROPIC_API_KEY="sk-ant-your-key-here"
```

### 5. Run the app

```bash
python app.py
```

Open your browser at: **http://localhost:5000**

---

## How It Works

1. **Upload / paste** your resume text
2. **Paste a job description** (optional, but improves keyword matching)
3. Click **Run Scanner** — the 7-step pipeline runs:
   - `parse_resume()` — extract text & structure
   - `detect_sections()` — find summary/exp/edu/skills sections
   - `ats_score()` — format & readability check
   - `match_keywords()` — compare resume vs job description
   - `find_gaps()` — missing skills & date gaps
   - `compute_score()` — overall candidate score
   - `generate_report()` — Claude AI builds structured output
4. View results: **Overall Score**, **ATS/Keyword/Impact** sub-scores, keyword heatmap, section check, skill bars, and AI suggestions

---

## API Endpoint

`POST /api/analyze`

**Request:**
```json
{
  "resume": "Your resume text here...",
  "job_description": "Optional job description..."
}
```

**Response:**
```json
{
  "overallScore": 78,
  "verdict": "Strong candidate with some gaps",
  "atsScore": 82,
  "keywordMatchScore": 70,
  "impactScore": 75,
  "sections": { "summary": "present", "experience": "present", ... },
  "keywordsFound": ["React", "Python", ...],
  "keywordsMissing": ["Kubernetes", ...],
  "topSkills": [{ "name": "JavaScript", "level": 90 }, ...],
  "suggestions": [{ "title": "...", "description": "..." }, ...],
  "strengths": ["...", "..."],
  "weaknesses": ["...", "..."]
}
```

---

## Troubleshooting

| Issue | Fix |
|---|---|
| `ModuleNotFoundError` | Run `pip install -r requirements.txt` |
| `API key not set` | Set `ANTHROPIC_API_KEY` env variable |
| Port 5000 in use | Change port in `app.py`: `app.run(port=5001)` |
| CORS error | Already handled via `flask-cors` |
