import assert from "node:assert/strict";
import { test } from "node:test";
import { applicableInductionSections, roleMatchesDepartment, surveyMatchesRoles } from "./templateFilters";

test("department filtering prefers stable IDs and supports legacy names", () => {
  const department = { id: 1, name: "Engineering" };
  assert.equal(roleMatchesDepartment({ departmentId: 1, department: "Old name" }, department), true);
  assert.equal(roleMatchesDepartment({ departmentId: 2, department: "Engineering" }, department), false);
  assert.equal(roleMatchesDepartment({ departmentId: null, department: " engineering " }, department), true);
  assert.equal(roleMatchesDepartment({ departmentId: null, department: "Accounts" }, department), false);
});

test("surveys match role IDs or legacy normalized titles, without overriding an explicit ID", () => {
  const roles = [{ id: 1, title: "Service Engineer" }];
  assert.equal(surveyMatchesRoles({ jobRoleId: 1, roleTitle: "Old title" }, roles), true);
  assert.equal(surveyMatchesRoles({ jobRoleId: null, roleTitle: " service   ENGINEER " }, roles), true);
  assert.equal(surveyMatchesRoles({ jobRoleId: 2, roleTitle: "Service Engineer" }, roles), false);
  assert.equal(surveyMatchesRoles({ jobRoleId: null, roleTitle: "Accountant" }, roles), false);
  assert.equal(surveyMatchesRoles({ jobRoleId: 1, roleTitle: "Service Engineer" }, []), false);
});

test("role induction includes universal sections, keeps template order and excludes unrelated sections", () => {
  assert.deepEqual(applicableInductionSections(
    ["Welcome", "Safety", "Engineering", "Accounts"],
    ["Safety", "Welcome"],
    ["Engineering", "Safety", "Deleted section"],
  ), ["Welcome", "Safety", "Engineering"]);
});

test("unconfigured induction roles preserve the existing all-sections fallback", () => {
  const all = ["Welcome", "Engineering"];
  assert.deepEqual(applicableInductionSections(all, [], []), all);
  assert.deepEqual(applicableInductionSections(all, ["Welcome"], []), ["Welcome"]);
  assert.deepEqual(applicableInductionSections(all, [], ["Engineering"]), ["Engineering"]);
});
