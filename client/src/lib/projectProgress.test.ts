import { describe, expect, it } from "vitest";
import { splitMilestoneDescription, visibleMilestoneDescriptionParagraphs } from "./projectProgress";

describe("project milestone details", () => {
  it("splits single and blank lines into non-empty display paragraphs", () => {
    expect(splitMilestoneDescription("Intro\n\nSection one\r\nSection two\n")).toEqual([
      "Intro",
      "Section one",
      "Section two",
    ]);
  });

  it("shows only the first paragraph until the user expands details", () => {
    const paragraphs = ["First paragraph", "Second paragraph", "Third paragraph"];
    expect(visibleMilestoneDescriptionParagraphs(paragraphs, false)).toEqual(["First paragraph"]);
    expect(visibleMilestoneDescriptionParagraphs(paragraphs, true)).toEqual(paragraphs);
  });

  it("handles an empty description", () => {
    expect(splitMilestoneDescription(null)).toEqual([]);
    expect(visibleMilestoneDescriptionParagraphs([], false)).toEqual([]);
  });
});
