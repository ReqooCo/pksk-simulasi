#!/usr/bin/env python3
import json, os, sys
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
errors=[]
for n in range(1,101):
    path=os.path.join(ROOT,"data","sets",f"set{n:02d}.json")
    if not os.path.exists(path):
        errors.append(f"Missing set {n:02d}"); continue
    d=json.load(open(path,encoding="utf-8"))
    qs=d.get("questions",[])
    if len(qs)!=100: errors.append(f"Set {n:02d}: expected 100 questions")
    if sum(q.get("section")=="BAHAGIAN A" for q in qs)!=30: errors.append(f"Set {n:02d}: A != 30")
    if sum(q.get("section")=="BAHAGIAN B" for q in qs)!=70: errors.append(f"Set {n:02d}: B != 70")
    if len(d.get("writing",[]))!=3: errors.append(f"Set {n:02d}: C != 3")
    for q in qs:
        if len(q.get("options",[]))!=4: errors.append(f"Set {n:02d} {q['id']}: options")
        if len(set(q.get("options",[])))!=4: errors.append(f"Set {n:02d} {q['id']}: duplicate options")
        if q.get("section")=="BAHAGIAN B" and not q.get("explanation"): errors.append(f"Set {n:02d} {q['id']}: no explanation")
        if q.get("visual"):
            v=os.path.join(ROOT,"assets","visuals",q["visual"])
            if not os.path.exists(v): errors.append(f"Set {n:02d} {q['id']}: missing visual {q['visual']}")
if errors:
    print("FAIL",len(errors)); print("\n".join(errors[:50])); sys.exit(1)
print("PASS: 100 sets structurally valid; visuals present; options unique; B explanations present.")
