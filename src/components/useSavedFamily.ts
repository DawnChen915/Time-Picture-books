"use client";

import { useCallback, useEffect, useState } from "react";
import type { Family } from "@/lib/types";

const FAMILY_KEY = "tpb.familyId";

export function readFamilyId() {
  try {
    return localStorage.getItem(FAMILY_KEY);
  } catch {
    return null;
  }
}

export function rememberFamily(id: string) {
  try {
    localStorage.setItem(FAMILY_KEY, id);
  } catch {}
}

export function avatarUrl(family: Family, role: string) {
  const file = family.members[role as keyof Family["members"]]?.avatar.file ?? "";
  return `/api/families/${family.id}/avatars/${role}?v=${encodeURIComponent(file)}`;
}

/** The family profile this browser saved last time (child's info and avatars), so nothing is typed twice. */
export function useSavedFamily() {
  const [family, setFamily] = useState<Family | null>(null);
  const [loaded, setLoaded] = useState(false);

  const reload = useCallback(async () => {
    const id = readFamilyId();
    if (!id) {
      setLoaded(true);
      return null;
    }
    const f = await fetch(`/api/families/${id}`, { cache: "no-store" })
      .then((r) => (r.ok ? (r.json() as Promise<Family>) : null))
      .catch(() => null);
    setFamily(f);
    setLoaded(true);
    return f;
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { family, setFamily, loaded, reload };
}
