# apply_questions_fix.py
import json
import fix_questions_duplicates
import fix_questions_dag
import fix_questions_kafka
import fix_questions_dbt
import fix_questions_lakehouse
import fix_questions_databricks_1
import fix_questions_databricks_2

def apply_all_question_fixes():
    questions_file = "src/data/json/questions.json"
    with open(questions_file, "r", encoding="utf-8") as f:
        questions = json.load(f)

    print(f"Loaded {len(questions)} existing questions.")

    # 1. Gather all fixes
    dups = fix_questions_duplicates.get_duplicate_fixes()
    dag = fix_questions_dag.get_dag_fixes()
    kafka = fix_questions_kafka.get_kafka_fixes()
    dbt = fix_questions_dbt.get_dbt_fixes()
    lakehouse = fix_questions_lakehouse.get_lakehouse_fixes()
    db1 = fix_questions_databricks_1.get_databricks_fixes_part1()
    db2 = fix_questions_databricks_2.get_databricks_fixes_part2()

    # Combine partial updates (dups + dag + kafka + dbt + lakehouse)
    partial_updates = {**dups, **dag, **kafka, **dbt, **lakehouse}
    # Combine full Databricks updates
    databricks_updates = {**db1, **db2}

    print(f"Total partial updates (DAG/Kafka/dbt/Lakehouse/dups): {len(partial_updates)}")
    print(f"Total Databricks updates: {len(databricks_updates)}")
    total_expected = len(partial_updates) + len(databricks_updates)
    print(f"Total fixes to apply: {total_expected}")

    updated_count = 0
    new_questions = []

    for q in questions:
        qid = q["id"]
        if qid in databricks_updates:
            # Full replacement with updated metadata, unique question, and bespoke answer
            item = databricks_updates[qid]
            new_q = {
                "id": qid,
                "source": q.get("source", "Questions DB"),
                "category": item.get("category", "Databricks"),
                "niche": item.get("niche", q.get("niche", "Databricks Lakehouse")),
                "difficulty": item.get("difficulty", q.get("difficulty", "MEDIUM")),
                "question": item["question"],
                "answer": item["answer"],
                "domain": item.get("domain", q.get("domain", "Data Engineering")),
                "subdomain": item.get("subdomain", q.get("subdomain", "Lakehouse Architecture"))
            }
            new_questions.append(new_q)
            updated_count += 1
        elif qid in partial_updates:
            fix = partial_updates[qid]
            new_q = dict(q)
            if "question" in fix:
                new_q["question"] = fix["question"]
            new_q["answer"] = fix["answer"]
            new_questions.append(new_q)
            updated_count += 1
        else:
            new_questions.append(q)

    print(f"Applied fixes to {updated_count} questions.")
    assert updated_count == total_expected, f"Expected {total_expected} updates, applied {updated_count}"
    assert len(new_questions) == len(questions), f"Length mismatch: {len(new_questions)} vs {len(questions)}"

    # Audit assertions
    addressing_hits = [q["id"] for q in new_questions if "Addressing '" in q.get("answer", "") or 'Addressing "' in q.get("answer", "")]
    print(f"Remaining 'Addressing' template answers: {len(addressing_hits)}")
    assert len(addressing_hits) == 0, f"Found remaining template answers in: {addressing_hits}"

    generic_code_hits = [q["id"] for q in new_questions if 'spark.databricks.delta.properties.default.autoOptimize.optimizeWrite", "true")' in q.get("answer", "")]
    print(f"Remaining generic Databricks code snippet hits: {len(generic_code_hits)}")
    assert len(generic_code_hits) == 0, f"Found remaining generic code in: {generic_code_hits}"

    # Check for duplicate answers across all updated items
    from collections import defaultdict
    ans_map = defaultdict(list)
    for q in new_questions:
        ans_clean = q.get("answer", "").strip()
        ans_map[ans_clean].append(q["id"])

    dup_groups = {k: v for k, v in ans_map.items() if len(v) > 1}
    print(f"Total duplicate answer groups in entire questions database: {len(dup_groups)}")
    for ans_text, qids in dup_groups.items():
        print(f"  Duplicate answer group ({len(qids)}): {qids}")

    # Check unique Databricks question texts
    db_questions = [q["question"] for q in new_questions if q["id"].startswith("databricks-q-")]
    print(f"Total Databricks questions: {len(db_questions)}, Unique texts: {len(set(db_questions))}")
    assert len(db_questions) == len(set(db_questions)), "Duplicate questions found in Databricks set!"

    with open(questions_file, "w", encoding="utf-8") as f:
        json.dump(new_questions, f, indent=2, ensure_ascii=False)

    print(f"Successfully saved {len(new_questions)} questions to {questions_file}")

if __name__ == "__main__":
    apply_all_question_fixes()
