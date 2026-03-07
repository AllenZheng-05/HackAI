/* =========================================================
   app.js – Website Generator frontend logic
   ========================================================= */

const MAX_CHARS = 2000;

const promptEl      = document.getElementById('prompt');
const charCountEl   = document.getElementById('charCount');
const generateBtn   = document.getElementById('generateBtn');
const statusSection = document.getElementById('statusSection');
const progressBar   = document.getElementById('progressBar');
const errorBanner   = document.getElementById('errorBanner');
const errorMsg      = document.getElementById('errorMsg');
const resultCard    = document.getElementById('resultCard');
const repoLink      = document.getElementById('repoLink');
const repoDesc      = document.getElementById('repoDesc');
const btnCopy       = document.getElementById('btnCopy');
const btnAnother    = document.getElementById('btnAnother');
const copyText      = document.getElementById('copyText');

const STEPS = [
  { id: 'step1', label: 'Analyzing your prompt…',           progress: 20 },
  { id: 'step2', label: 'Generating HTML, CSS & JS…',       progress: 55 },
  { id: 'step3', label: 'Creating GitHub repository…',      progress: 80 },
  { id: 'step4', label: 'Committing files to the repo…',    progress: 95 },
];

// ── Character counter ─────────────────────────────────────
promptEl.addEventListener('input', () => {
  const len = promptEl.value.length;
  charCountEl.textContent = `${len} / ${MAX_CHARS}`;
  charCountEl.className = 'char-count' +
    (len > MAX_CHARS * 0.9 ? (len >= MAX_CHARS ? ' danger' : ' warn') : '');
  generateBtn.disabled = len === 0 || len > MAX_CHARS;
});

// ── Suggestion chips ──────────────────────────────────────
document.querySelectorAll('.chip').forEach(chip => {
  chip.addEventListener('click', () => {
    const text = chip.dataset.prompt;
    promptEl.value = text;
    promptEl.dispatchEvent(new Event('input'));
    promptEl.focus();
  });
});

// ── Step helpers ──────────────────────────────────────────
function setStepState(stepId, state /* 'idle'|'active'|'done'|'error' */) {
  const row  = document.getElementById(stepId);
  if (!row) return;
  const icon = row.querySelector('.step-icon');

  row.className = `step ${state !== 'idle' ? state : ''}`;

  if (state === 'active') {
    icon.innerHTML = '<div class="step-spinner"></div>';
  } else if (state === 'done') {
    icon.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
           stroke-linecap="round" stroke-linejoin="round" width="16" height="16">
        <polyline points="20 6 9 17 4 12"/>
      </svg>`;
  } else if (state === 'error') {
    icon.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
           stroke-linecap="round" stroke-linejoin="round" width="16" height="16">
        <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/>
        <line x1="9" y1="9" x2="15" y2="15"/>
      </svg>`;
  } else {
    icon.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
           stroke-linecap="round" stroke-linejoin="round" width="16" height="16">
        <circle cx="12" cy="12" r="10"/>
      </svg>`;
  }
}

function resetSteps() {
  STEPS.forEach(s => setStepState(s.id, 'idle'));
  progressBar.style.width = '0%';
}

function advanceStep(index, done = false, error = false) {
  STEPS.forEach((s, i) => {
    if (i < index)       setStepState(s.id, 'done');
    else if (i === index) setStepState(s.id, error ? 'error' : done ? 'done' : 'active');
    else                  setStepState(s.id, 'idle');
  });
  progressBar.style.width = STEPS[index].progress + '%';
}

// ── Main generate flow ────────────────────────────────────
generateBtn.addEventListener('click', async () => {
  const prompt = promptEl.value.trim();
  if (!prompt) return;

  // Reset UI
  hideError();
  resultCard.classList.remove('visible');
  statusSection.classList.add('visible');
  resetSteps();
  generateBtn.disabled = true;
  generateBtn.innerHTML = `<div class="spinner"></div> Generating…`;

  // Simulate step 1 (client-side "analysing") before request
  advanceStep(0);
  await delay(600);
  advanceStep(0, true);
  advanceStep(1);

  let data;
  try {
    const response = await fetch('/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });

    data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `Server error ${response.status}`);
    }
  } catch (err) {
    advanceStep(1, false, true);
    showError(err.message || 'An unexpected error occurred. Please try again.');
    resetBtn();
    return;
  }

  // Step 2 done (code generated on server)
  advanceStep(1, true);
  advanceStep(2);
  await delay(400);

  advanceStep(2, true);
  advanceStep(3);
  await delay(400);

  advanceStep(3, true);
  progressBar.style.width = '100%';
  await delay(200);

  // Show result
  repoLink.href        = data.repo_url;
  repoLink.textContent = data.repo_url;
  repoDesc.textContent = data.description || '';

  statusSection.classList.remove('visible');
  resultCard.classList.add('visible');
  resetBtn();
});

// ── Copy URL ──────────────────────────────────────────────
btnCopy.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(repoLink.href);
    copyText.textContent = 'Copied!';
    setTimeout(() => { copyText.textContent = 'Copy'; }, 2000);
  } catch {
    copyText.textContent = 'Failed';
    setTimeout(() => { copyText.textContent = 'Copy'; }, 2000);
  }
});

// ── Generate another ──────────────────────────────────────
btnAnother.addEventListener('click', () => {
  resultCard.classList.remove('visible');
  statusSection.classList.remove('visible');
  promptEl.value = '';
  charCountEl.textContent = `0 / ${MAX_CHARS}`;
  charCountEl.className = 'char-count';
  generateBtn.disabled = false;
  promptEl.focus();
});

// ── Helpers ───────────────────────────────────────────────
function showError(msg) {
  errorMsg.textContent = msg;
  errorBanner.classList.add('visible');
  statusSection.classList.remove('visible');
}

function hideError() {
  errorBanner.classList.remove('visible');
}

function resetBtn() {
  generateBtn.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
         stroke-linecap="round" stroke-linejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
    Generate Website`;
  generateBtn.disabled = promptEl.value.trim() === '';
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
