// ═══════════════════════════════════════════════════
// ENGINE TESTS — Stat formulas regression safety net
// ═══════════════════════════════════════════════════
// These tests freeze the current behavior of engine.js.
// If a future change breaks these formulas (typo, accidental
// regression, etc.), tests will fail BEFORE you push.
//
// Note: these tests don't validate against the EL JAR — only
// Loïc can do that. They ensure that whatever the formulas
// were doing, they keep doing the same thing.
// ═══════════════════════════════════════════════════
import { describe, it, expect } from "vitest";
import {
  computeFullStats,
  getActiveRace,
  computeInnates,
} from "../engine.js";
import { RACES, CLASSES } from "../data/core.js";

const human = RACES.find((r) => r.id === "human");
const mage = CLASSES.find((c) => c.id === "mage");

describe("getActiveRace", () => {
  it("returns the base race when no evolution is selected", () => {
    const r = getActiveRace(human, null);
    expect(r.id).toBe("human");
    expect(r.name).toBe("Human");
    expect(r.attrs.life_force).toBe(98);
    expect(r.attrs.strength).toBe(0.85);
  });

  it("returns the same race object identity when evoId equals race id", () => {
    const r = getActiveRace(human, "human");
    expect(r.id).toBe("human");
  });

  it("does not crash when race is null", () => {
    expect(() => getActiveRace(null, null)).not.toThrow();
  });
});

describe("computeInnates", () => {
  it("returns an object with all stat keys", () => {
    const inn = computeInnates(human, mage, 0, null, 0, 1);
    const expectedKeys = [
      "life_force",
      "strength",
      "sorcery",
      "defense",
      "haste",
      "precision",
      "ferocity",
      "stamina",
      "flow",
      "discipline",
    ];
    expectedKeys.forEach((k) => expect(inn).toHaveProperty(k));
  });

  it("scales innates with level", () => {
    const innL1 = computeInnates(human, mage, 0, null, 0, 1);
    const innL60 = computeInnates(human, mage, 0, null, 0, 60);
    // Sorcery total should grow with level (mage tier 1 has 0.84 sorcery innate per level)
    expect(innL60.sorcery.total).toBeGreaterThan(innL1.sorcery.total);
    expect(innL60.sorcery.perLevel).toBe(innL1.sorcery.perLevel);
  });

  it("does not crash when secondary class is null", () => {
    expect(() => computeInnates(human, mage, 0, null, 0, 30)).not.toThrow();
  });
});

describe("computeFullStats — Human Mage baseline", () => {
  const baseScenario = {
    race: human,
    evoId: null,
    c1: mage,
    t1: 0,
    c2: null,
    t2: 0,
    level: 1,
    skillPoints: 0,
    selectedAugments: [],
    augBonus: {},
  };

  it("level 1, no augments, no SP — exact baseline", () => {
    const s = computeFullStats(baseScenario);
    expect(s.finalStats).toEqual({
      life_force: 99.3,
      strength: 0,
      sorcery: 0.84,
      defense: 0,
      haste: 0,
      precision: 7,
      ferocity: 35,
      stamina: 7,
      flow: 15.05,
      discipline: 0,
    });
  });

  it("level 60, SP=295 — exact baseline", () => {
    const s = computeFullStats({ ...baseScenario, level: 60, skillPoints: 295 });
    expect(s.finalStats).toEqual({
      life_force: 176,
      strength: 0,
      sorcery: 50.4,
      defense: 0,
      haste: 0,
      precision: 7,
      ferocity: 35,
      stamina: 7,
      flow: 77,
      discipline: 0,
    });
  });

  it("returns the expected shape (activeRace, finalStats, details, etc.)", () => {
    const s = computeFullStats(baseScenario);
    expect(s).toHaveProperty("activeRace");
    expect(s).toHaveProperty("finalStats");
    expect(s).toHaveProperty("details");
    expect(s).toHaveProperty("inn");
    expect(s).toHaveProperty("augMult");
    expect(s).toHaveProperty("augLock");
  });

  it("details contains breakdown for each stat", () => {
    const s = computeFullStats(baseScenario);
    expect(s.details.life_force).toHaveProperty("total");
    expect(s.details.sorcery).toHaveProperty("total");
  });

  it("strength stays 0 for a Mage (no innate strength)", () => {
    const s = computeFullStats({ ...baseScenario, level: 60, skillPoints: 295 });
    expect(s.finalStats.strength).toBe(0);
  });

  it("sorcery grows roughly linearly with level for a Mage", () => {
    const s1 = computeFullStats(baseScenario);
    const s30 = computeFullStats({ ...baseScenario, level: 30, skillPoints: 145 });
    const s60 = computeFullStats({ ...baseScenario, level: 60, skillPoints: 295 });
    expect(s30.finalStats.sorcery).toBeGreaterThan(s1.finalStats.sorcery);
    expect(s60.finalStats.sorcery).toBeGreaterThan(s30.finalStats.sorcery);
  });
});

describe("computeFullStats — sanity checks", () => {
  it("does not output negative final stats for valid inputs", () => {
    const s = computeFullStats({
      race: human,
      evoId: null,
      c1: mage,
      t1: 0,
      c2: null,
      t2: 0,
      level: 30,
      skillPoints: 145,
      selectedAugments: [],
      augBonus: {},
    });
    Object.values(s.finalStats).forEach((v) => {
      expect(v).toBeGreaterThanOrEqual(0);
    });
  });

  it("activeRace has same id as input race when no evo specified", () => {
    const s = computeFullStats({
      race: human,
      evoId: null,
      c1: mage,
      t1: 0,
      c2: null,
      t2: 0,
      level: 1,
      skillPoints: 0,
      selectedAugments: [],
      augBonus: {},
    });
    expect(s.activeRace.id).toBe("human");
  });
});
