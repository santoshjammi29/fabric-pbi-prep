#!/usr/bin/env python3
"""
scripts/redefine_repetitive_architect_questions.py

Rewrites repetitive boilerplate questions in data_architecture.json and questions.json:
1. Replaces mechanical prefixes in data_architecture.json:
   - "How do you architect and design the core distributed principles of <Topic> in enterprise <Cat> pipelines?"
   - "How do you implement, configure, and harden <Topic> for high-throughput enterprise <Cat> workloads?"
   - "How do you architect and optimize <Topic> Advanced Architecture in enterprise <Cat> architectures?"
   with authentic, scenario-driven, senior/staff/principal architect questions from SPECS.
2. Replaces generic placeholder dummy code (@dataclass class ConfiguredArchitecture) in answers
   with concrete, production-grade technical code snippets and failure mode remediations.
3. Rewrites repetitive "Explain the concepts and production implementations of <Topic>." in questions.json
   into sharp, realistic interview questions.
"""

import json
import re
import os
import sys

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, BASE_DIR)

from scripts.specs_data import SPECS

DATA_ARCH_FILE = os.path.join(BASE_DIR, "src", "data", "json", "data_architecture.json")
QUESTIONS_FILE = os.path.join(BASE_DIR, "src", "data", "json", "questions.json")

def clean_question_title(category: str, topic: str, role: str, old_q: str) -> str:
    """Return a clean, distinctive, scenario-driven question title from SPECS."""
    clean_topic = topic.replace(" Advanced Architecture", "").strip()
    spec = SPECS.get((category, clean_topic))
    if spec:
        return spec.get(role, old_q)
    
    # Try searching for topic without case or minor differences
    for (c, t), s in SPECS.items():
        if c == category and (t.lower() == clean_topic.lower() or t.lower() in clean_topic.lower() or clean_topic.lower() in t.lower()):
            return s.get(role, old_q)

    print(f"Warning: Spec not found for ({category}, {clean_topic}) role={role}")
    return old_q

def build_refined_answer(category: str, topic: str, role: str, old_ans: str) -> str:
    """If old_ans has dummy class ConfiguredArchitecture, replace with rich answer."""
    if "class ConfiguredArchitecture" not in old_ans and "topic_name: str =" not in old_ans:
        return old_ans
    
    clean_topic = topic.replace(" Advanced Architecture", "").strip()
    spec = SPECS.get((category, clean_topic))
    if not spec:
        for (c, t), s in SPECS.items():
            if c == category and (t.lower() == clean_topic.lower() or t.lower() in clean_topic.lower() or clean_topic.lower() in t.lower()):
                spec = s
                clean_topic = t
                break

    if spec and "code" in spec:
        code_snip = spec["code"]
        f1, f2, f3 = spec["failures"]
        
        return f"""### Phase 1: Conceptual Foundation & Core Architecture
In enterprise data architecture, designing **{clean_topic}** within the **{category}** domain requires balancing throughput, isolation, and distributed resource coordination. Under high-scale production workloads, data platforms must enforce deterministic execution boundaries to prevent cross-node contention and cascading failovers.

Architecturally, this pattern establishes clear separation between compute allocation, state synchronization, and storage consistency, ensuring high availability and strict SLA compliance across analytical pipelines.

### Phase 2: Low-Level Mechanics & Implementation
The following implementation demonstrates the production architecture, configuration parameters, and execution logic:

```python
{code_snip}
```

Key operational parameters:
- Enforce strict concurrency limits and timeouts to protect shared cluster resources.
- Configure buffer memory quotas to absorb traffic spikes without triggering executor OOM.
- Implement structured telemetry emission across all critical execution stages.

### Phase 3: Production Hardening & Gotchas
In high-throughput enterprise pipelines, several critical failure states must be anticipated and mitigated:

- **{f1[0]}**: {f1[1]} *Remediation*: {f1[2]}
- **{f2[0]}**: {f2[1]} *Remediation*: {f2[2]}
- **{f3[0]}**: {f3[1]} *Remediation*: {f3[2]}"""

    return old_ans

def process_data_architecture():
    print(f"Reading {DATA_ARCH_FILE}...")
    with open(DATA_ARCH_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)

    arch_spec_count = 0
    updated_questions = 0
    updated_answers = 0
    unmatched_specs = []

    for item in data:
        qid = item.get("id", "")
        if not qid.startswith("arch-spec-"):
            continue

        arch_spec_count += 1
        q = item.get("question", "")
        cat = item.get("category", "")
        
        # Detect role and topic
        role = None
        topic = None
        
        m1 = re.search(r"core distributed principles of (.*?) in enterprise", q)
        if m1:
            role = "principles"
            topic = m1.group(1).strip()
            
        m2 = re.search(r"implement, configure, and harden (.*?) for high-throughput", q)
        if m2:
            role = "hardening"
            topic = m2.group(1).strip()
            
        m3 = re.search(r"architect and optimize (.*?) Advanced Architecture in enterprise", q)
        if not m3:
            m3 = re.search(r"architect and optimize (.*?) in enterprise", q)
        if m3:
            role = "optimization"
            topic = m3.group(1).strip()
            
        if not topic or not role:
            print(f"Warning: Could not parse {qid}: {q}")
            continue

        new_q = clean_question_title(cat, topic, role, q)
        if new_q != q:
            item["question"] = new_q
            updated_questions += 1
        else:
            unmatched_specs.append((qid, cat, topic, role))

        old_ans = item.get("answer", "")
        new_ans = build_refined_answer(cat, topic, role, old_ans)
        if new_ans != old_ans:
            item["answer"] = new_ans
            updated_answers += 1

    print(f"Total arch-spec items: {arch_spec_count}")
    print(f"Updated questions: {updated_questions}")
    print(f"Updated answers: {updated_answers}")
    if unmatched_specs:
        print(f"Unmatched specs count: {len(unmatched_specs)}")
        for u in unmatched_specs[:5]:
            print("  Unmatched:", u)

    with open(DATA_ARCH_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print("Saved updated data_architecture.json successfully.")

def process_questions_json():
    print(f"Reading {QUESTIONS_FILE}...")
    with open(QUESTIONS_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)

    updated_count = 0
    for item in data:
        q = item.get("question", "")
        if q.startswith("Explain the concepts and production implementations of "):
            raw = q.replace("Explain the concepts and production implementations of ", "").rstrip(".")
            cat = item.get("category", "")
            diff = item.get("difficulty", "MEDIUM")
            
            # Format natural question based on raw topic
            if diff == "ARCHITECT":
                new_q = f"How do you architect and govern {raw} in enterprise {cat} platforms?"
            elif diff == "HARD":
                new_q = f"How do you implement and troubleshoot {raw} in production {cat} pipelines?"
            elif "vs" in raw.lower() or "comparison" in raw.lower():
                new_q = f"What are the architectural differences and trade-offs in {raw}?"
            elif raw.lower().startswith("what is") or raw.lower().startswith("how to"):
                new_q = f"{raw} in production {cat} systems?"
            else:
                new_q = f"What are the core design principles and production best practices for {raw} in {cat}?"
                
            item["question"] = new_q
            updated_count += 1

    print(f"Updated {updated_count} questions in questions.json")
    with open(QUESTIONS_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print("Saved updated questions.json successfully.")

if __name__ == "__main__":
    process_data_architecture()
    process_questions_json()
