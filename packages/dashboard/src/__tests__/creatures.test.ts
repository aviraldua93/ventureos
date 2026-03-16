import { describe, test, expect } from 'bun:test';
import {
  speciesFromRole,
  SPECIES_META,
  type CreatureSpecies,
} from '../components/Thronglet/engine/creatures';

describe('Creature System', () => {
  describe('speciesFromRole', () => {
    test('engineer roles map to robot', () => {
      expect(speciesFromRole('Engineer')).toBe('robot');
      expect(speciesFromRole('Frontend Engineer')).toBe('robot');
      expect(speciesFromRole('Backend Developer')).toBe('robot');
      expect(speciesFromRole('Fullstack Engineer')).toBe('robot');
    });

    test('QA roles map to cat', () => {
      expect(speciesFromRole('QA Lead')).toBe('cat');
      expect(speciesFromRole('Test Analyst')).toBe('cat');
      expect(speciesFromRole('Quality Assurance')).toBe('cat');
    });

    test('management roles map to owl', () => {
      expect(speciesFromRole('PM')).toBe('owl');
      expect(speciesFromRole('Product Manager')).toBe('owl');
      // Note: 'Lead Engineer' matches 'engineer' first → robot
      expect(speciesFromRole('Lead Engineer')).toBe('robot');
      expect(speciesFromRole('CEO')).toBe('owl');
      expect(speciesFromRole('CTO')).toBe('owl');
      expect(speciesFromRole('Director of Sales')).toBe('owl');
    });

    test('design roles map to fox', () => {
      expect(speciesFromRole('Designer')).toBe('fox');
      expect(speciesFromRole('UX Researcher')).toBe('fox');
      // Note: 'UI Designer' has 'design' → fox (checked before blob)
      expect(speciesFromRole('UI Designer')).toBe('fox');
      // Note: 'Creative Director' matches 'director' → owl (checked before fox)
      expect(speciesFromRole('Creative Director')).toBe('owl');
    });

    test('unknown roles map to blob', () => {
      expect(speciesFromRole('Intern')).toBe('blob');
      expect(speciesFromRole('Marketing')).toBe('blob');
      expect(speciesFromRole('HR')).toBe('blob');
      expect(speciesFromRole('')).toBe('blob');
    });

    test('case insensitive matching', () => {
      expect(speciesFromRole('ENGINEER')).toBe('robot');
      expect(speciesFromRole('quality assurance')).toBe('cat');
      expect(speciesFromRole('DESIGNER')).toBe('fox');
    });
  });

  describe('SPECIES_META', () => {
    test('all 5 species have metadata', () => {
      const species: CreatureSpecies[] = ['robot', 'cat', 'owl', 'fox', 'blob'];
      for (const s of species) {
        expect(SPECIES_META[s]).toBeDefined();
        expect(SPECIES_META[s].label).toBeTruthy();
        expect(SPECIES_META[s].baseColor).toMatch(/^#/);
        expect(SPECIES_META[s].accent).toMatch(/^#/);
      }
    });

    test('species labels are human-readable', () => {
      expect(SPECIES_META.robot.label).toBe('Robot');
      expect(SPECIES_META.cat.label).toBe('Detective Cat');
      expect(SPECIES_META.owl.label).toBe('Owl Manager');
      expect(SPECIES_META.fox.label).toBe('Painter Fox');
      expect(SPECIES_META.blob.label).toBe('Blobby');
    });
  });
});
