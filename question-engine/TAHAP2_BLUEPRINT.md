# REQOO PKSK — Tahap 2 Question Engine Blueprint

Status: FOUNDATION / DO NOT GENERATE FULL BANK YET

## Goal
Build Tahap 2 from the research/data foundation, not by cloning the previous bank. Every accepted item must be substantively distinct, cognitively aligned, age-appropriate, and auditable.

## Existing evidence used
- Current research bank has substantial coverage in Matematik, Sains, IQ/Logik, EQ, SQ, SSQ, BM, English, Pengetahuan Am and Penyelesaian Masalah.
- Existing 50-set architecture: 100 scored/live questions per set.
- Level progression: Set 01–10 L1, 11–20 L2, 21–30 L3, 31–40 L4, 41–50 L5.
- Public-format research used only as format/context guidance; bank is not claimed to contain official KPM/PKSK questions.

## Core rule
SOURCE MATERIAL IS KNOWLEDGE/TOPIC INPUT, NOT A TEMPLATE.

Never create a new item by merely:
1. changing names/numbers,
2. paraphrasing the stem,
3. rotating answer choices,
4. changing superficial context,
5. reusing the same reasoning structure.

## Item blueprint schema
Every item must have:
- id
- set
- domain
- subdomain/topic
- plannedLevel (1–5)
- cognitiveTarget
- scenarioType
- informationLoad
- reasoningPattern
- questionType
- options[4]
- answer
- explanation
- visualRequired
- visualAsset (only when required)
- sourceKnowledgeTags
- similarityFingerprint
- auditStatus

## Level rules
### L1 — Foundation
One main relation; one-step application; clear age-appropriate context. Avoid giveaway wording.
### L2 — Application
Known concept in a new context; 1–2 reasoning steps; plausible distractors.
### L3 — Multi-step reasoning
Combine 2–3 information pieces; inference/comparison; strategy selection.
### L4 — Complex reasoning
Multiple constraints; trade-offs; sequencing; data/spatial/logic inference.
### L5 — High aptitude
Novel multi-step problems; competing hypotheses; abstraction/optimisation. Difficulty must come from reasoning, not obscure facts.

## Diversity dimensions
Each set must vary across:
- topic
- scenario
- cognitive operation
- information structure
- answer position
- distractor mechanism
- wording pattern
- context
- visual/non-visual format

## Anti-repeat gates
Reject if any of these is true:
- exact duplicate
- near-exact wording
- same underlying problem with cosmetic changes
- same scenario + same reasoning structure
- same data pattern with changed numbers
- same answer logic repeated excessively
- explanation reveals the answer
- visual contains answer/explanation clues

## Quality gates
1. one best answer
2. sufficient information
3. every sentence has a function
4. construct alignment
5. sound logic
6. competitive distractors
7. natural BM/BI
8. level alignment
9. duplicate/near-duplicate check
10. explanation matches stem + answer
11. visual integrity
12. factual/current-risk check for knowledge items

## Workflow
DATA → CLASSIFY → BLUEPRINT → GENERATE → SIMILARITY AUDIT → ITEM AUDIT → SET BALANCE AUDIT → LOCK

Do not generate all 50 sets in one uncontrolled batch.

## First production gate
Generate a small pilot batch for Set 01 only. Audit it completely. Only after the pilot passes should the engine scale to subsequent sets.
