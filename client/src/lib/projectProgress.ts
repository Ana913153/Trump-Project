export function splitMilestoneDescription(value?: string | null): string[] {
  return String(value || "").split(/\r?\n/).map((paragraph) => paragraph.trim()).filter(Boolean);
}

export function visibleMilestoneDescriptionParagraphs(paragraphs: string[], expanded: boolean): string[] {
  return expanded ? paragraphs : paragraphs.slice(0, 1);
}
