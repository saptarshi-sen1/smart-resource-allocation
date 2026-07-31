/**
 * CrisisConnect — Resource Matcher
 * Scores the mismatch between a volunteer's skills and a request's requirements.
 * Lower score = better match = lower cost.
 */

/**
 * Normalizes a skill string for comparison:
 * lowercases, trims, removes punctuation.
 */
function normalizeSkill(skill: string): string {
  return skill.toLowerCase().trim().replace(/[^a-z0-9\s]/g, '');
}

/**
 * Checks whether two skill strings are considered equivalent.
 * Uses exact match after normalization, plus substring containment
 * to handle variants like "First Aid" vs "First Aid Certified".
 */
function skillsMatch(a: string, b: string): boolean {
  const na = normalizeSkill(a);
  const nb = normalizeSkill(b);
  return na === nb || na.includes(nb) || nb.includes(na);
}

/**
 * Counts how many of the required skills are covered by the volunteer's skills.
 */
function countMatchedSkills(
  volunteerSkills: string[],
  requiredSkills: string[],
): number {
  if (requiredSkills.length === 0) return volunteerSkills.length;

  return requiredSkills.filter((req) =>
    volunteerSkills.some((vol) => skillsMatch(vol, req)),
  ).length;
}

/**
 * Calculates the resource/skill mismatch penalty on a 0–10 scale.
 *
 * - Perfect match (all required skills covered): 0
 * - Partial match: proportional between 0 and 7
 * - No match at all: 10
 * - Empty required skills (generic volunteer): 2
 *
 * @param volunteerSkills - Skills the volunteer possesses
 * @param requiredSkills  - Skills the disaster request requires
 * @returns Mismatch score from 0 (perfect) to 10 (no match)
 */
export function calculateResourceMismatch(
  volunteerSkills: string[],
  requiredSkills: string[],
): number {
  // No specific skills required — any volunteer can help
  if (requiredSkills.length === 0) return 2;

  const matched = countMatchedSkills(volunteerSkills, requiredSkills);
  const total = requiredSkills.length;

  if (matched === 0) return 10;
  if (matched >= total) return 0;

  // Partial match: scale between 0 and 7 based on coverage ratio
  const coverageRatio = matched / total;
  return Math.round((1 - coverageRatio) * 7 * 10) / 10;
}

/**
 * Returns matched and unmatched skill arrays for explainability display.
 */
export function getSkillMatchDetails(
  volunteerSkills: string[],
  requiredSkills: string[],
): {
  matched: string[];
  missing: string[];
  matchPercent: number;
} {
  if (requiredSkills.length === 0) {
    return { matched: [], missing: [], matchPercent: 100 };
  }

  const matched: string[] = [];
  const missing: string[] = [];

  for (const req of requiredSkills) {
    const hasIt = volunteerSkills.some((vol) => skillsMatch(vol, req));
    if (hasIt) {
      matched.push(req);
    } else {
      missing.push(req);
    }
  }

  const matchPercent = Math.round((matched.length / requiredSkills.length) * 100);
  return { matched, missing, matchPercent };
}
