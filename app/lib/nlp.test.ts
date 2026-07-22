import { test } from "node:test";
import assert from "node:assert/strict";
import { parse } from "./nlp.ts";
import { buildStrip } from "./dates.ts";

// Deterministic strip. 2026-07-22 is a Wednesday; todayIndex is TODAY_OFFSET (10).
const REF = new Date(2026, 6, 22);
const { days, todayIndex } = buildStrip(REF);

/** Nearest upcoming index whose full weekday matches `name` (today counts). */
function upcoming(name: string): number {
  for (let i = todayIndex; i < days.length; i++) {
    if (days[i].full === name) return i;
  }
  throw new Error(`no upcoming ${name}`);
}

const run = (text: string) => parse(text, days, todayIndex);

// ── Date ──────────────────────────────────────────────────────────────────────
test("today / сьогодні → today index, word stripped", () => {
  assert.equal(run("wash dishes today").date, todayIndex);
  assert.equal(run("wash dishes today").cleanTitle, "wash dishes");
  const uk = run("помити посуд сьогодні");
  assert.equal(uk.date, todayIndex);
  assert.equal(uk.cleanTitle, "помити посуд");
});

test("tomorrow / завтра → today+1", () => {
  assert.equal(run("call mom tomorrow").date, todayIndex + 1);
  assert.equal(run("call mom tomorrow").cleanTitle, "call mom");
  const uk = run("подзвонити мамі завтра");
  assert.equal(uk.date, todayIndex + 1);
  assert.equal(uk.cleanTitle, "подзвонити мамі");
});

test("післязавтра → today+2", () => {
  assert.equal(run("зустріч післязавтра").date, todayIndex + 2);
});

test("weekday (full + short, both langs) → nearest upcoming", () => {
  assert.equal(run("submit report friday").date, upcoming("Friday"));
  assert.equal(run("submit report friday").cleanTitle, "submit report");
  assert.equal(run("standup fri").date, upcoming("Friday"));
  assert.equal(run("здати звіт у пʼятницю").date, upcoming("Friday"));
  assert.equal(run("здати звіт у пʼятницю").cleanTitle, "здати звіт");
  assert.equal(run("дейлі пн").date, upcoming("Monday"));
});

test("leading connector (on/at/у/в) is stripped with the token", () => {
  assert.equal(run("meeting on monday").cleanTitle, "meeting");
});

// ── Time ────────────────────────────────────────────────────────────────────
test("English am/pm", () => {
  assert.deepEqual(run("meeting 4pm").time, { start: "16:00", durationMin: null });
  assert.deepEqual(run("gym 9 am").time, { start: "09:00", durationMin: null });
  assert.deepEqual(run("call 4:30pm").time, { start: "16:30", durationMin: null });
  assert.deepEqual(run("lunch 12pm").time, { start: "12:00", durationMin: null });
  assert.deepEqual(run("bed 12am").time, { start: "00:00", durationMin: null });
  assert.equal(run("meeting at 4pm").cleanTitle, "meeting");
});

test("24h with colon", () => {
  assert.deepEqual(run("зустріч 16:00").time, { start: "16:00", durationMin: null });
  assert.deepEqual(run("call о 16:00").time, { start: "16:00", durationMin: null });
  assert.equal(run("call о 16:00").cleanTitle, "call");
});

test("Ukrainian part-of-day hours", () => {
  assert.deepEqual(run("біг о 9 ранку").time, { start: "09:00", durationMin: null });
  assert.deepEqual(run("обід о 4 дня").time, { start: "16:00", durationMin: null });
  assert.deepEqual(run("зустріч о 8 вечора").time, { start: "20:00", durationMin: null });
  assert.deepEqual(run("сон о 11 ночі").time, { start: "23:00", durationMin: null });
  assert.deepEqual(run("будильник о 2 ночі").time, { start: "02:00", durationMin: null });
});

test("bare small number is NOT a time (anti false-positive)", () => {
  assert.equal(run("купити 3 яблука").time, null);
  assert.equal(run("купити 3 яблука").date, null);
  assert.equal(run("купити 3 яблука").cleanTitle, "купити 3 яблука");
  assert.equal(run("call 15 people").time, null);
  assert.equal(run("call 15 people").cleanTitle, "call 15 people");
});

// ── Priority ──────────────────────────────────────────────────────────────────
test("!!N and pN", () => {
  assert.equal(run("!!1 fix bug").priority, 1);
  assert.equal(run("!!1 fix bug").cleanTitle, "fix bug");
  assert.equal(run("buy milk p3").priority, 3);
  assert.equal(run("buy milk P2").priority, 2);
});

test("explicit priority words → P1", () => {
  assert.equal(run("urgent call boss").priority, 1);
  assert.equal(run("терміново подзвонити").priority, 1);
  assert.equal(run("терміново подзвонити").cleanTitle, "подзвонити");
});

// ── Combinations & precedence ─────────────────────────────────────────────────
test("date + time + priority together, title fully cleaned", () => {
  const r = run("!!2 подзвонити завтра о 9 ранку");
  assert.equal(r.priority, 2);
  assert.equal(r.date, todayIndex + 1);
  assert.deepEqual(r.time, { start: "09:00", durationMin: null });
  assert.equal(r.cleanTitle, "подзвонити");
});

test("last-mentioned date wins", () => {
  assert.equal(run("today tomorrow").date, todayIndex + 1);
});

test("nothing recognised → single plain segment, unchanged title", () => {
  const r = run("just a plain task");
  assert.equal(r.date, null);
  assert.equal(r.time, null);
  assert.equal(r.priority, null);
  assert.equal(r.cleanTitle, "just a plain task");
  assert.deepEqual(r.segments, [{ text: "just a plain task", kind: "plain" }]);
});

// ── Segments (for the highlight mirror) ────────────────────────────────────────
test("segments tag matched runs by kind and cover the whole string", () => {
  const r = run("call mom tomorrow");
  assert.equal(r.segments.map((s) => s.text).join(""), "call mom tomorrow");
  const date = r.segments.find((s) => s.kind === "date");
  assert.ok(date && /tomorrow/.test(date.text));
});
