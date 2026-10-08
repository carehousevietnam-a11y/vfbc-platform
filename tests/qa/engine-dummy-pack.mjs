/**
 * Generic packRunner smoke — dummy pack (3 questions, show_if, 1 F row, 3 metric steps)
 */
import { evalExpr } from "../../src/lib/contentPacks/engine/showIf.ts";
import {
  buildProfile,
  nodeVisible,
  phase1QuestionIds,
  phase2QuestionIds,
} from "../../src/lib/contentPacks/engine/packRunner.ts";

const dummy = {
  q1: [{ value: "a", label: "A", caseId: "D01" }],
  nodes: {
    D01: [
      { id: "q1", phase: 1, kind: "single", showIf: "항상", profileFields: [], question: "Q1", placeholder: "", options: [{ value: "v1", label: "L1", meaning: "x=1" }] },
      { id: "q2", phase: 1, kind: "single", showIf: "q1 = v1", profileFields: [], question: "Q2", placeholder: "", options: [{ value: "v2", label: "L2", meaning: "y=2" }] },
      { id: "q3", phase: 2, kind: "single", showIf: "항상", profileFields: [], question: "Q3", placeholder: "", options: [{ value: "v3", label: "L3", meaning: "z=3" }] },
    ],
  },
  phase1Order: { D01: ["q1", "q2"] },
  risks: { D01: { expert: [], caution: [], check: [], special: [] } },
  fPaths: { D01: [{ pathId: "P1", condition: "q1 = v1", label: "p1", chain: ["q3"] }] },
  pathAliases: {},
};

const answers = { q1: "v1", q2: "v2" };
if (!evalExpr("q1 = v1", answers)) throw new Error("evalExpr failed");
const p1 = phase1QuestionIds(dummy, "D01");
const p2 = phase2QuestionIds(dummy, "D01", answers);
if (p1.join(",") !== "q1,q2") throw new Error("phase1 order");
if (p2.join(",") !== "q3") throw new Error("phase2 from F");
const n = dummy.nodes.D01[2];
if (!nodeVisible(dummy, n, answers, "D01")) throw new Error("visible");
const profile = buildProfile(dummy, "D01", answers);
if (profile.fields.x !== "1") throw new Error("profile");
console.log("engine-dummy-pack: PASS");
