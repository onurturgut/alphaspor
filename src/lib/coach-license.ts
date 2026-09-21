/** Legacy biographies remain usable until their dedicated license field is saved. */
export function coachLicense(person: { license?: string; bio?: string }): string {
  if (person.license !== undefined) return person.license.trim();
  const bio = person.bio ?? "";
  const application = bio.match(/UEFA\s+(PRO|[ABC])\s+Lisans\s+başvurusunu/iu);
  if (application) return `UEFA ${application[1].toUpperCase()} · Başvuru aşamasında`;
  const held = bio.match(/UEFA\s+(PRO|[ABC])\s+Lisans(?:ı\s+sahibi|ımı\s+tamamladım)/iu);
  return held ? `UEFA ${held[1].toUpperCase()}` : "";
}
