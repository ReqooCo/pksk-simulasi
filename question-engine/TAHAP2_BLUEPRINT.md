# REQOO PKSK — Tahap 2 Question Engine Blueprint V2.0

Status: FOUNDATION / CONTROLLED PILOT

## Goal
Build original PKSK-style practice assessment items from a research/data foundation. Source material is used as knowledge and topic input, never as a template. The bank must be substantively diverse, cognitively aligned, age-appropriate, auditable, and suitable for later empirical item analysis.

## Format boundary
- Tahap 2 = target learner band for this product.
- `plannedLevel` 1–5 = item difficulty/cognitive demand progression, not learner year level.
- Existing architecture: 100 scored/live questions per set; writing is handled separately.
- Product content is original practice material and is not represented as official KPM/PKSK questions.

## Evidence foundation
Research/data sources currently available include Matematik, Sains, IQ/Logik, EQ, SQ, SSQ, Bahasa Melayu, English, Pengetahuan Am, Penyelesaian Masalah, technology/digital literacy, and other topic/reference material. Source data must first be classified:
- GREEN = usable knowledge/topic facts and clean concepts
- YELLOW = reference/inspiration only; requires independent rewriting and verification
- RED = corrupted, duplicated, answer-leaking, generator-contaminated, unverifiable, or otherwise unsafe for direct reuse

## Core rule: source is not a template
Never create a new item merely by changing names, numbers, answer order, superficial context, wording, or by reusing the same reasoning structure. Cosmetic variation does not count as a new item.

## Assessment development model
DATA → KNOWLEDGE MAP → CONSTRUCT MAP → BLUEPRINT → ITEM MODEL → STIMULUS/SCENARIO → GENERATE → CONTENT REVIEW → COGNITIVE REVIEW → SEMANTIC SIMILARITY → ITEM AUDIT → PILOT → ITEM ANALYSIS → REVISE/RETIRE → SET ASSEMBLY → FINAL LOCK

## Item blueprint schema
Every item must have:
- id
- set
- section
- domain
- subdomain/topic
- plannedLevel (1–5)
- cognitiveTarget
- scenarioType
- informationLoad
- reasoningPattern
- questionType
- stimulusType (none/text/table/chart/diagram/etc.)
- question
- options[4]
- answer
- explanation
- visualRequired
- visualAsset (only when required)
- sourceKnowledgeTags
- itemModelId
- similarityFingerprint
- auditStatus

## Item model
Before generation, define the construct and reasoning recipe. Minimum fields:
- domain/topic
- cognitive target
- knowledge dependency
- information pieces
- reasoning operations
- scenario/stimulus family
- distractor mechanisms
- intended difficulty
- forbidden patterns

Two items using the same topic are acceptable only when their construct, reasoning path, stimulus structure, or decision demand is materially different.

## Stimulus/unit principle
Prefer purposeful context over filler. Every sentence, table, graph, diagram, number, or scenario detail must either provide information needed for reasoning or establish a meaningful decision context. Context that does not affect the answer is a quality defect.

A stimulus may support multiple related items only when each item has an independent answer path and does not simply repeat the same reasoning task.

## Cognitive-demand levels
### L1 — Foundation
One main relation; one-step application; clear age-appropriate context. Avoid giveaway wording and trivial distractors.
### L2 — Application
Known concept in a new context; 1–2 reasoning steps; plausible distractors; limited direct recall.
### L3 — Multi-step reasoning
Combine 2–3 information pieces; inference/comparison; strategy selection; irrelevant information may be present but must be deliberate.
### L4 — Complex reasoning
Multiple constraints; trade-offs; sequencing; data/spatial/logic inference; more than one plausible intermediate path.
### L5 — High aptitude
Novel multi-step problems; competing hypotheses; abstraction/optimisation; difficulty must come from reasoning, not obscure facts.

Difficulty and cognitive demand are related but not identical. Do not make an item artificially difficult by using obscure facts, unnecessarily complex language, or confusing wording.

## Domain construction rules
### EQ / SQ / SSQ
Use realistic dilemmas with competing legitimate considerations. Avoid obvious good-vs-bad options. The best answer should require judgement, prioritisation, empathy, responsibility, fairness, communication, or consequence evaluation.

### Matematik
Prefer interpretation + strategy + calculation + decision over isolated one-operation arithmetic. Use tables, ratios, percentages, measurement, time, data, spatial reasoning, constraints, and multi-step problems where appropriate.

### IQ / Logik
Diversify across sequence, classification, analogy, coding, ordering, conditional logic, deduction, spatial reasoning, rule discovery, data logic, and novel transformations.

### BM / English
Prioritise comprehension, inference, meaning-in-context, evidence selection, organisation, and language use. Avoid excessive direct grammar/recall unless it serves the intended construct.

### Sains
Prefer prediction, controlled observation, evidence, variable identification, explanation of phenomena, and application of concepts rather than isolated fact recall.

### Pengetahuan Am
Use verified, age-appropriate facts. Where current facts can change, record the verification date/source. Do not make obscure trivia the main difficulty mechanism.

### Penyelesaian Masalah
Require constraint identification, feasibility checking, prioritisation, planning, trade-off, or strategy selection.

## Diversity matrix
Across each set and across adjacent sets vary:
- domain/subdomain
- cognitive operation
- scenario family
- stimulus type
- information load
- reasoning pattern
- distractor mechanism
- wording pattern
- answer position
- context
- visual/non-visual format

## Anti-repeat gates
Reject an item if any of these is true:
- exact duplicate
- near-exact wording
- same underlying problem with cosmetic changes
- same scenario + same reasoning structure
- same data pattern with changed numbers
- same item model used excessively within an assessment
- same cognitive path repeated excessively across adjacent sets
- answer can be guessed from option wording or extremeness
- explanation reveals the answer
- visual contains answer/explanation clues
- context is decorative/filler and not functionally related to the task

Similarity must be assessed at three levels:
1. lexical similarity
2. semantic/problem similarity
3. reasoning-structure similarity

## Distractor rules
Every distractor must represent a plausible misconception, calculation error, interpretation error, rule misuse, or decision trade-off. Avoid joke answers, absurd extremes, category mismatches, or options that are visibly longer/more precise only because they are correct.

## Quality gates
1. one best answer
2. sufficient information
3. every sentence/detail has a function
4. construct alignment
5. sound logic
6. competitive distractors
7. natural BM/BI
8. level alignment
9. lexical + semantic + reasoning duplicate check
10. explanation matches stem + answer
11. visual integrity
12. factual/current-risk check
13. answer-position balance
14. scenario diversity
15. cognitive-operation balance
16. no giveaway wording
17. no artificial difficulty
18. no generator contamination

## Pilot and empirical analysis
Do not generate all 50 sets in one uncontrolled batch. Produce Set 01 as a controlled pilot. Review it completely before scaling. After real usage data exists, track item difficulty, option distribution, response time, and discrimination indicators. Items with poor behaviour are revised or retired rather than automatically retained.

## Production gate
Set 01 → full audit → approve → Set 02–05 → cross-set similarity/balance audit → approve → scale remaining sets.

## Release rule
A set is not considered complete because it contains 100 JSON objects. It is complete only when its items pass content, cognitive, similarity, distractor, language, visual, factual, and set-balance gates.
