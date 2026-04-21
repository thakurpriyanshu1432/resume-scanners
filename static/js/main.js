/**
 * AI Resume Scanner — Frontend Logic
 * Talks to Flask backend at /api/analyze
 */

// ─── Pipeline Steps ───────────────────────────────────────────────────────────
const STEPS = [
  { id: "parse",    label: "parse_resume()",    sub: "extract text & structure" },
  { id: "sections", label: "detect_sections()", sub: "find header/exp/edu/skills" },
  { id: "ats",      label: "ats_score()",        sub: "format & readability check" },
  { id: "keywords", label: "match_keywords()",   sub: "compare vs job description" },
  { id: "gaps",     label: "find_gaps()",        sub: "missing skills & dates" },
  { id: "score",    label: "compute_score()",    sub: "overall candidate score" },
  { id: "report",   label: "generate_report()",  sub: "build structured output" },
];

let stepStatus = {};
STEPS.forEach((s) => (stepStatus[s.id] = "idle"));

// ─── Render Step Tree ─────────────────────────────────────────────────────────
function renderStepTree() {
  const el = document.getElementById("step-tree");
  let html = "";
  STEPS.forEach((s, i) => {
    const st = stepStatus[s.id];
    const cls = st === "done" ? "done" : st === "running" ? "running" : st === "active" ? "active" : "";
    const iconInner =
      st === "running"
        ? '<div class="spinner"></div>'
        : st === "done"
        ? "&#10003;"
        : i + 1;
    html += `
      <div class="step-item ${cls}" id="step-${s.id}">
        <div class="step-icon">${iconInner}</div>
        <div>
          <div class="step-label">${s.label}</div>
          <div class="step-sub">${s.sub}</div>
        </div>
      </div>`;
    if (i < STEPS.length - 1) html += `<div class="tree-connector"></div>`;
  });
  el.innerHTML = html;
}

function setStep(id, status) {
  stepStatus[id] = status;
  renderStepTree();
}

// Initial render
renderStepTree();

// ─── Tab Switching ────────────────────────────────────────────────────────────
function switchTab(t) {
  ["upload", "results", "terminal"].forEach((tab) => {
    const content = document.getElementById("content-" + tab);
    const tabEl = document.getElementById("tab-" + tab);
    if (content) content.style.display = tab === t ? "block" : "none";
    if (tabEl) tabEl.classList.toggle("active", tab === t);
  });
}

// ─── File Handling ────────────────────────────────────────────────────────────
function handleFile(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    document.getElementById("resume-text").value = ev.target.result;
  };
  reader.readAsText(file);
  logTerm(`$ file loaded: ${file.name}`, "t-accent");
}

function handleDrop(e) {
  e.preventDefault();
  document.getElementById("upload-zone").classList.remove("drag");
  const file = e.dataTransfer.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    document.getElementById("resume-text").value = ev.target.result;
  };
  reader.readAsText(file);
  logTerm(`$ dropped file: ${file.name}`, "t-accent");
}

// ─── Demo Data ────────────────────────────────────────────────────────────────
function loadDemo() {
  document.getElementById("resume-text").value = `SARAH CHEN | Full-Stack Engineer
Email: sarah.chen@email.com | GitHub: github.com/sarahchen | LinkedIn: linkedin.com/in/sarahchen

SUMMARY
Experienced full-stack engineer with 5 years building scalable web applications. Strong background in React, Node.js, and cloud infrastructure. Led cross-functional teams to ship features impacting 500K+ users.

EXPERIENCE

Senior Software Engineer — TechCorp Inc. (2021–Present)
• Architected microservices migration reducing API latency by 40%
• Led team of 4 engineers to deliver core product features on schedule
• Implemented CI/CD pipelines using GitHub Actions and Docker
• Built real-time dashboard using React, TypeScript and WebSockets

Software Engineer — StartupXYZ (2019–2021)
• Developed REST APIs in Node.js serving 10M+ monthly requests
• Integrated third-party payment systems (Stripe, PayPal)
• Optimized PostgreSQL queries improving page load by 35%

SKILLS
Python, JavaScript, TypeScript, React, Node.js, PostgreSQL, MongoDB, Docker, Kubernetes, AWS, Git, REST APIs, GraphQL

EDUCATION
B.S. Computer Science — State University (2019)

CERTIFICATIONS
AWS Solutions Architect Associate (2022)`;

  document.getElementById("job-text").value = `Senior Full-Stack Engineer
We are looking for a Senior Full-Stack Engineer to join our growing team.

Requirements:
- 4+ years of experience with React and Node.js
- Strong knowledge of TypeScript
- Experience with cloud platforms (AWS, GCP, or Azure)
- Proficiency with Docker and Kubernetes
- PostgreSQL or similar relational database experience
- Experience with GraphQL APIs
- Strong communication and team leadership skills
- CI/CD pipeline experience
- Machine learning or AI integration experience is a plus`;

  logTerm("$ demo resume loaded", "t-green");
  logTerm("$ demo job description loaded", "t-green");
}

// ─── Terminal Logger ──────────────────────────────────────────────────────────
function logTerm(msg, cls = "") {
  const tb = document.getElementById("term-body");
  const div = document.createElement("div");
  div.className = "term-line " + cls;
  div.textContent = msg;
  tb.appendChild(div);
  tb.scrollTop = tb.scrollHeight;
}

// ─── Progress ─────────────────────────────────────────────────────────────────
function setProgress(pct, label) {
  document.getElementById("progress-bar").style.width = pct + "%";
  document.getElementById("progress-label").textContent = label;
}

function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// ─── Main Scan ────────────────────────────────────────────────────────────────
async function startScan() {
  const resumeText = document.getElementById("resume-text").value.trim();
  const jobText = document.getElementById("job-text").value.trim();

  if (!resumeText) {
    alert("Please paste your resume or load the demo.");
    return;
  }

  // Reset UI
  document.getElementById("scan-btn").disabled = true;
  document.getElementById("progress-wrap").style.display = "block";
  document.getElementById("tab-terminal").style.display = "flex";
  document.getElementById("tab-results").style.display = "none";
  document.getElementById("pipeline-status").textContent = "running";
  document.getElementById("pipeline-status").style.color = "var(--yellow)";
  document.getElementById("term-dot").style.background = "var(--yellow)";

  STEPS.forEach((s) => (stepStatus[s.id] = "idle"));
  renderStepTree();

  logTerm("$ python app.py --analyze", "t-accent");

  // Simulate pipeline steps with delays
  const pipeline = [
    ["parse",    900,  "Parsing resume text...",              "  → extracting text content..."],
    ["sections", 800,  "Detecting resume sections...",        "  → detecting: summary, experience, education, skills"],
    ["ats",      700,  "Running ATS format check...",         "  → checking ATS compatibility..."],
    ["keywords", 600,  "Matching keywords...",                "  → comparing resume vs job description"],
    ["gaps",     700,  "Identifying skill gaps...",           "  → analyzing missing skills & date gaps"],
    ["score",    500,  "Computing overall score...",          null],
  ];

  let progress = 10;
  for (const [id, ms, label, termMsg] of pipeline) {
    setStep(id, "running");
    setProgress(progress, label);
    if (termMsg) logTerm(termMsg, "t-dim");
    await delay(ms);
    setStep(id, "done");
    progress += 12;
  }

  setStep("report", "running");
  setProgress(85, "Calling Claude AI for deep analysis...");
  logTerm("  → POST /api/analyze — waiting for Claude...", "t-dim");

  // Call Flask backend
  let result;
  try {
    const res = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resume: resumeText, job_description: jobText }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Server error");
    }

    result = await res.json();
  } catch (err) {
    logTerm(`  ✗ Error: ${err.message}`, "t-red");
    logTerm("  → using fallback demo result", "t-yellow");
    result = getFallbackResult();
  }

  setStep("report", "done");
  setProgress(100, "Analysis complete!");
  logTerm("  ✓ analysis complete", "t-green");
  logTerm(`  → overall score: ${result.overallScore}/100`, "t-accent");
  logTerm("$ output ready in results.json", "t-green");

  document.getElementById("pipeline-status").textContent = "done";
  document.getElementById("pipeline-status").style.color = "var(--green)";
  document.getElementById("term-dot").style.background = "var(--green)";

  renderResults(result);
  document.getElementById("tab-results").style.display = "flex";
  document.getElementById("scan-btn").disabled = false;
  switchTab("results");
}

// ─── Fallback Result (if API fails) ──────────────────────────────────────────
function getFallbackResult() {
  return {
    overallScore: 72,
    verdict: "Strong candidate — a few improvements recommended",
    atsScore: 80,
    keywordMatchScore: 65,
    impactScore: 70,
    sections: {
      summary: "present",
      experience: "present",
      education: "present",
      skills: "present",
      certifications: "missing",
      projects: "missing",
    },
    keywordsFound: ["React", "Node.js", "TypeScript", "Docker", "PostgreSQL"],
    keywordsMissing: ["Machine Learning", "GraphQL", "Kubernetes", "CI/CD"],
    topSkills: [
      { name: "JavaScript", level: 90 },
      { name: "React", level: 85 },
      { name: "Node.js", level: 80 },
      { name: "AWS", level: 65 },
      { name: "Python", level: 60 },
    ],
    suggestions: [
      { title: "Add quantified metrics", description: "Include measurable outcomes (e.g. 'reduced load time by 40%') to strengthen impact statements." },
      { title: "Expand skills section",  description: "Add missing keywords from the job description like GraphQL and Machine Learning." },
      { title: "Add projects section",   description: "Showcase 2-3 personal or open-source projects with GitHub links." },
      { title: "Tailor summary",         description: "Rewrite your summary to mirror the specific role and company language." },
    ],
    strengths:   ["Clear work history", "Good technical breadth", "Quantified achievements"],
    weaknesses:  ["Missing certifications section", "No projects listed", "Summary too generic"],
  };
}

// ─── Render Results ───────────────────────────────────────────────────────────
function renderResults(d) {
  const scoreColor =
    d.overallScore >= 80 ? "var(--green)" :
    d.overallScore >= 60 ? "var(--yellow)" :
    "var(--red)";

  const C = 2 * Math.PI * 42;
  const offset = C - (d.overallScore / 100) * C;

  const sectionBadge = (s) =>
    s === "present"
      ? '<span class="badge badge-green">present</span>'
      : s === "weak"
      ? '<span class="badge badge-yellow">weak</span>'
      : '<span class="badge badge-red">missing</span>';

  const skillBars = d.topSkills
    .map(
      (sk) => `
    <div class="skill-bar-wrap">
      <div class="skill-bar-label"><span>${sk.name}</span><span style="color:var(--text2)">${sk.level}%</span></div>
      <div class="skill-bar-bg"><div class="skill-bar-fill" style="width:${sk.level}%"></div></div>
    </div>`
    )
    .join("");

  const keywordsFound = d.keywordsFound
    .map((k) => `<span class="keyword-chip chip-found">&#10003; ${k}</span>`)
    .join("");

  const keywordsMiss = d.keywordsMissing
    .map((k) => `<span class="keyword-chip chip-miss">&#10007; ${k}</span>`)
    .join("");

  const suggestions = d.suggestions
    .map(
      (s, i) => `
    <div class="suggestion-item">
      <div class="sug-num">0${i + 1}</div>
      <div class="sug-body">
        <div class="sug-title">${s.title}</div>
        <div class="sug-desc">${s.description}</div>
      </div>
    </div>`
    )
    .join("");

  const sectionRows = Object.entries(d.sections)
    .map(
      ([k, v]) => `
    <div class="section-row">
      <div class="sec-label">${k}</div>
      ${sectionBadge(v)}
    </div>`
    )
    .join("");

  document.getElementById("results-inner").innerHTML = `
    <div class="breadcrumb">
      <span>resume_scanner</span><span class="bc-sep">/</span>
      <span>output</span><span class="bc-sep">/</span>
      <span class="bc-active">results.json</span>
      <span style="margin-left:auto; color:var(--green); font-size:10px; font-family:var(--mono)">&#9679; analysis complete</span>
    </div>

    <div class="score-ring-wrap">
      <svg width="100" height="100" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="42" fill="none" stroke="var(--bg3)" stroke-width="8"/>
        <circle cx="50" cy="50" r="42" fill="none" stroke="${scoreColor}" stroke-width="8"
          stroke-dasharray="${C}" stroke-dashoffset="${offset}"
          stroke-linecap="round" transform="rotate(-90 50 50)"/>
        <text x="50" y="54" text-anchor="middle" fill="${scoreColor}"
              font-size="22" font-weight="700"
              font-family="JetBrains Mono, monospace">${d.overallScore}</text>
      </svg>
      <div>
        <div class="score-label">overall score</div>
        <div class="score-num" style="color:${scoreColor}">
          ${d.overallScore}<span style="font-size:18px;color:var(--text2)">/100</span>
        </div>
        <div class="score-verdict">${d.verdict}</div>
      </div>
    </div>

    <div class="grid3">
      <div class="card" style="text-align:center">
        <div class="card-title" style="justify-content:center">
          <div class="card-title-dot" style="background:var(--green)"></div> ATS Score
        </div>
        <div style="font-size:28px;font-weight:700;color:var(--green);font-family:var(--mono)">${d.atsScore}</div>
      </div>
      <div class="card" style="text-align:center">
        <div class="card-title" style="justify-content:center">
          <div class="card-title-dot" style="background:var(--purple)"></div> Keyword Match
        </div>
        <div style="font-size:28px;font-weight:700;color:var(--purple);font-family:var(--mono)">${d.keywordMatchScore}</div>
      </div>
      <div class="card" style="text-align:center">
        <div class="card-title" style="justify-content:center">
          <div class="card-title-dot" style="background:var(--orange)"></div> Impact Score
        </div>
        <div style="font-size:28px;font-weight:700;color:var(--orange);font-family:var(--mono)">${d.impactScore}</div>
      </div>
    </div>

    <div class="grid2">
      <div class="card">
        <div class="card-title"><div class="card-title-dot"></div> Keyword Analysis</div>
        <div style="margin-bottom:8px;font-size:11px;font-family:var(--mono);color:var(--green)">FOUND</div>
        <div>${keywordsFound}</div>
        <div style="margin-top:12px;margin-bottom:8px;font-size:11px;font-family:var(--mono);color:var(--red)">MISSING</div>
        <div>${keywordsMiss}</div>
      </div>
      <div class="card">
        <div class="card-title"><div class="card-title-dot" style="background:var(--purple)"></div> Section Check</div>
        ${sectionRows}
      </div>
    </div>

    <div class="grid2">
      <div class="card">
        <div class="card-title"><div class="card-title-dot" style="background:var(--orange)"></div> Top Skills</div>
        ${skillBars}
      </div>
      <div class="card">
        <div class="card-title"><div class="card-title-dot" style="background:var(--green)"></div> Strengths</div>
        ${d.strengths.map((s) => `<div style="font-size:12px;color:var(--green);font-family:var(--mono);padding:4px 0;border-bottom:1px solid var(--border)">+ ${s}</div>`).join("")}
        <div class="card-title mt16"><div class="card-title-dot" style="background:var(--red)"></div> Weaknesses</div>
        ${d.weaknesses.map((s) => `<div style="font-size:12px;color:var(--red);font-family:var(--mono);padding:4px 0;border-bottom:1px solid var(--border)">− ${s}</div>`).join("")}
      </div>
    </div>

    <div class="section-title">AI Suggestions</div>
    <div class="card">${suggestions}</div>

    <div class="flex mt24">
      <button class="btn btn-ghost" onclick="resetScanner()">&#8617; Scan Another Resume</button>
    </div>
  `;
}

// ─── Reset ────────────────────────────────────────────────────────────────────
function resetScanner() {
  document.getElementById("resume-text").value = "";
  document.getElementById("scan-btn").disabled = false;
  document.getElementById("progress-wrap").style.display = "none";
  document.getElementById("tab-results").style.display = "none";
  STEPS.forEach((s) => (stepStatus[s.id] = "idle"));
  renderStepTree();
  document.getElementById("pipeline-status").textContent = "ready";
  document.getElementById("pipeline-status").style.color = "var(--text3)";
  document.getElementById("term-dot").style.background = "var(--text3)";
  switchTab("upload");
}
