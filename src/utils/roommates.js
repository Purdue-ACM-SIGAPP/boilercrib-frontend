import { CLASS_YEARS } from "../api/roommates";

export const yearLabel = (year) => CLASS_YEARS[year] ?? "";

// "Junior · Computer Science · 20"; skips whatever is missing.
export const roommateSummary = (bio) =>
  [yearLabel(bio?.year), bio?.major, bio?.age ? String(bio.age) : null].filter(Boolean).join(" · ");

const same = (a, b) => Boolean(a) && Boolean(b) && a.trim().toLowerCase() === b.trim().toLowerCase();

const sharedBy = (mine = [], theirs = []) => {
  const lower = new Set(mine.map((v) => v.trim().toLowerCase()));
  return theirs.filter((v) => lower.has(v.trim().toLowerCase()));
};

// Points out of 100. Interests count 10 each, up to 4 of them.
const POINTS = { interest: 10, maxInterests: 4, year: 20, major: 20, building: 20 };

/**
 * How well `theirs` fits `mine`, from what the two bios share.
 * Returns { score (0–100), reasons: [string], sharedInterests: [string] }, or null when there's no bio of your own to compare.
 */
export function compatibility(mine, theirs) {
  if (!mine || !theirs) return null;

  const interests = sharedBy(mine.interests, theirs.interests);
  const buildings = sharedBy(mine.preferredBuildingIds, theirs.preferredBuildingIds);
  const sameYear = mine.year != null && mine.year === theirs.year;
  const sameMajor = same(mine.major, theirs.major);

  const score =
    Math.min(interests.length, POINTS.maxInterests) * POINTS.interest +
    (sameYear ? POINTS.year : 0) +
    (sameMajor ? POINTS.major : 0) +
    (buildings.length ? POINTS.building : 0);

  const reasons = [
    interests.length ? `Shared interests: ${interests.join(", ")}` : null,
    sameYear ? `Same year: ${yearLabel(theirs.year)}` : null,
    sameMajor ? `Both study ${theirs.major.trim()}` : null,
    buildings.length ? `Want to live in the same ${buildings.length === 1 ? "building" : "buildings"}` : null,
  ].filter(Boolean);

  return { score, reasons, sharedInterests: interests };
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE = /^\+?[\d\s().-]{7,}$/;

// A link that opens the contact info in the right app, or null when it's plain text (e.g. a social handle).
export function contactLink(contactInfo) {
  const value = contactInfo?.trim();
  if (!value) return null;
  if (EMAIL.test(value)) return `mailto:${value}`;
  if (PHONE.test(value)) return `tel:${value.replace(/[^\d+]/g, "")}`;
  if (/^https?:\/\//i.test(value)) return value;
  return null;
}
