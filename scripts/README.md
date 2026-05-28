# Scripts — Developer Tooling

This directory contains all developer scripts for building and maintaining the question database.

---

## Build Pipeline

```
data/*.json  ─── compile_db.py ───▶  questions.js  (runtime, loaded by browser)
```

The browser loads `questions.js` directly. The JSON files in `data/` are the **source of truth** and are not loaded by the browser.

---

## 📦 compile_db.py — Main Build Script

Merges all source JSON files from `data/` into the `questions.js` runtime database.

**Run from project root:**
```bash
python3 scripts/compile_db.py
```

After running, `questions.js` will be regenerated. Re-deploy to Vercel:
```bash
npx vercel --prod
```

---

## Adding New Questions

1. Create or edit a JSON file in `data/` (see schema below)
2. Add the filename to the `FILES` list in `scripts/compile_db.py`
3. Run `python3 scripts/compile_db.py`
4. Verify the count output, then deploy

### Question Schema
```json
{
  "id": "unique-question-id",
  "category": "FABRIC | POWER BI | ADF | SQL SERVER | DATA LAKE | SPARK",
  "niche": "Topic / Sub-domain name",
  "difficulty": "EASY | MEDIUM | HARD",
  "question": "The question text",
  "answer": "The answer text (supports numbered lists like 1. ... 2. ...)"
}
```

---

## 📁 generators/

Scripts that generate the source JSON files. Each script produces one `data/*.json` file containing a batch of Q&As for a specific topic.

Run a generator to (re)create its output file:
```bash
python3 scripts/generators/generate_pbi_part1.py
```

Then re-run `compile_db.py` to rebuild `questions.js`.

### generators/batches/

Historical batch injector scripts (`add_batch_1.py` through `add_batch_11.py`). These were one-time scripts used to inject medium-difficulty questions. They are preserved for reference but should not need to be run again — the questions are already in the data files.

---

## 🧪 ../tests/

Puppeteer tests for the web app UI. Run with:
```bash
node tests/test_ui.js
node tests/test_portal.js
node tests/test_dom.js
node tests/test_explainer.js
```

Requires the app to be running locally (`npm run dev` or open `index.html` in a browser).
