import assert from "node:assert/strict";
import { test } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import TrainingMatrixWizard from "./TrainingMatrixWizard";

const sectionGroups = [
  { key: "core", label: "Core", sortOrder: 0, categories: [{
    id: 1, slug: "core-skills", name: "Core skills", items: [{ id: 1, slug: "first", name: "First skill" }],
  }] },
  { key: "advanced", label: "Advanced", sortOrder: 1, categories: [{
    id: 2, slug: "advanced-skills", name: "Advanced skills", items: [{ id: 2, slug: "second", name: "Second skill" }],
  }] },
];
const competencyLevels = [0, 1, 2, 3, 4].map(value => ({
  value, label: `Level ${value}`, description: `Description ${value}`, color: `score-${value}`,
}));

function render(ratings: Record<string, number>, readOnly = false) {
  return renderToStaticMarkup(createElement(TrainingMatrixWizard, {
    title: "New self-assessment", sectionGroups, competencyLevels, ratings,
    previousRatings: { first: 4, second: 3 }, previousAssessmentDate: "2026-09-01",
    readOnly, onRate: () => {}, onSubmit: () => {},
  }));
}

test("previous scores are labelled reference text, not selected buttons or completed answers", () => {
  const html = render({});
  assert.match(html, /Previous assessment:/);
  assert.match(html, /4 - .*Level 4/);
  assert.match(html, /0 \/ 2 rated/);
  assert.match(html, /Not started/);
  assert.doesNotMatch(html, /aria-pressed="true"/);
  assert.doesNotMatch(html, /opacity-35/);
});

test("selecting the same score again counts as a current answer and keeps previous reference visible", () => {
  const html = render({ first: 4 });
  assert.match(html, /1 \/ 2 rated/);
  assert.match(html, /aria-pressed="true"/);
  assert.match(html, /Previous assessment:/);
  assert.match(html, /Complete, editable/);
});

test("read-only saved assessments disable rating controls", () => {
  const html = render({ first: 0, second: 4 }, true);
  assert.match(html, /Read-only assessment/);
  const button = html.match(/<button[^>]*data-testid="wizard-rate-first-0"[^>]*>/)?.[0];
  assert.ok(button);
  assert.match(button, /disabled=""/);
  assert.match(button, /aria-pressed="true"/);
});

test("an empty skill list shows an explicit configuration message instead of a completed section", () => {
  const html = renderToStaticMarkup(createElement(TrainingMatrixWizard, {
    title: "Assessment", sectionGroups: [], competencyLevels, ratings: {},
    onRate: () => {}, onSubmit: () => {},
  }));
  assert.match(html, /No skills are configured for this assessment/);
  assert.doesNotMatch(html, /Section complete/);
});
