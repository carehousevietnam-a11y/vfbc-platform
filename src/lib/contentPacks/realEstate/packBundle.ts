import type { ContentPackBundle } from "../engine/types";
import {
  REAL_ESTATE_F_PATHS,
  REAL_ESTATE_PATH_ALIASES,
  REAL_ESTATE_RE01_GOAL_ADJUST_RAW,
} from "./generated/meta";
import {
  REAL_ESTATE_NODES,
  REAL_ESTATE_PHASE1_ORDER,
  REAL_ESTATE_Q1,
  REAL_ESTATE_RISKS,
} from "./generated/pack";

export function realEstatePackBundle(): ContentPackBundle {
  return {
    q1: REAL_ESTATE_Q1,
    nodes: REAL_ESTATE_NODES,
    phase1Order: REAL_ESTATE_PHASE1_ORDER,
    risks: REAL_ESTATE_RISKS,
    fPaths: REAL_ESTATE_F_PATHS,
    pathAliases: REAL_ESTATE_PATH_ALIASES,
    goalAdjustDocRaw: REAL_ESTATE_RE01_GOAL_ADJUST_RAW,
  };
}
