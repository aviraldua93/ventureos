import { describe, test, expect } from 'bun:test';
import {
  habitatTier,
  habitatBounds,
  type HabitatTier,
} from '../components/Thronglet/engine/habitat';

describe('Habitat System', () => {
  describe('habitatTier', () => {
    test('1-4 agents = cozy-room', () => {
      expect(habitatTier(1)).toBe('cozy-room');
      expect(habitatTier(4)).toBe('cozy-room');
    });

    test('5-10 agents = workshop', () => {
      expect(habitatTier(5)).toBe('workshop');
      expect(habitatTier(10)).toBe('workshop');
    });

    test('11-20 agents = village', () => {
      expect(habitatTier(11)).toBe('village');
      expect(habitatTier(20)).toBe('village');
    });

    test('21+ agents = campus', () => {
      expect(habitatTier(21)).toBe('campus');
      expect(habitatTier(100)).toBe('campus');
    });

    test('zero agents = cozy-room', () => {
      expect(habitatTier(0)).toBe('cozy-room');
    });
  });

  describe('habitatBounds', () => {
    test('all tiers return valid bounds', () => {
      const tiers: HabitatTier[] = ['cozy-room', 'workshop', 'village', 'campus'];
      for (const tier of tiers) {
        const bounds = habitatBounds(tier);
        expect(bounds.width).toBeGreaterThan(0);
        expect(bounds.height).toBeGreaterThan(0);
        expect(bounds.right).toBeGreaterThan(bounds.left);
        expect(bounds.bottom).toBeGreaterThan(bounds.top);
        expect(bounds.width).toBe(bounds.right - bounds.left);
        expect(bounds.height).toBe(bounds.bottom - bounds.top);
      }
    });

    test('larger tiers have larger bounds', () => {
      const cozy = habitatBounds('cozy-room');
      const workshop = habitatBounds('workshop');
      const village = habitatBounds('village');
      const campus = habitatBounds('campus');

      expect(workshop.width).toBeGreaterThan(cozy.width);
      expect(village.width).toBeGreaterThan(workshop.width);
      expect(campus.width).toBeGreaterThan(village.width);
    });

    test('bounds are centered around origin', () => {
      const tiers: HabitatTier[] = ['cozy-room', 'workshop', 'village', 'campus'];
      for (const tier of tiers) {
        const bounds = habitatBounds(tier);
        expect(bounds.left).toBe(-bounds.right);
        expect(bounds.top).toBe(-bounds.bottom);
      }
    });

    test('cozy-room specific dimensions', () => {
      const b = habitatBounds('cozy-room');
      expect(b).toEqual({ left: -200, top: -150, right: 200, bottom: 150, width: 400, height: 300 });
    });
  });
});
