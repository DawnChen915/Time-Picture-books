import type { Family } from "./types";

/** Family data safe to send to the browser (no photo file names). */
export function publicFamily(f: Family): Family {
  const members: Family["members"] = {};
  for (const [role, m] of Object.entries(f.members)) {
    if (m) members[role as keyof Family["members"]] = { role: m.role, description: m.description, avatar: m.avatar };
  }
  return { ...f, members };
}
