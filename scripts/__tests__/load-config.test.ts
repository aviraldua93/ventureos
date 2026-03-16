import { describe, test, expect } from 'bun:test';
import {
  type VentureOSConfig,
  type AgentConfig,
  getTeamMembers,
  getTeamLead,
  getTeamMap,
  getAllAgentIds,
} from '../load-config';

const MOCK_CONFIG: VentureOSConfig = {
  company: {
    name: 'Test Corp',
    tagline: 'Testing is everything',
    branding: {
      primaryColor: '#000',
      secondaryColor: '#111',
      accentColor: '#222',
    },
  },
  teams: [
    { name: 'leadership', displayName: 'Leadership', color: '#blue', icon: 'crown' },
    { name: 'engineering', displayName: 'Engineering', color: '#green', icon: 'code' },
    { name: 'design', displayName: 'Design', color: '#pink', icon: 'palette' },
  ],
  agents: [
    { id: 'alice', name: 'Alice', role: 'CEO', team: 'leadership' },
    { id: 'bob', name: 'Bob', role: 'CTO', team: 'leadership', parentId: 'alice' },
    { id: 'charlie', name: 'Charlie', role: 'Lead Engineer', team: 'engineering', parentId: 'bob', isLead: true },
    { id: 'diana', name: 'Diana', role: 'Frontend Engineer', team: 'engineering', parentId: 'charlie' },
    { id: 'evan', name: 'Evan', role: 'Backend Engineer', team: 'engineering', parentId: 'charlie' },
    { id: 'fiona', name: 'Fiona', role: 'Design Lead', team: 'design', parentId: 'bob', isLead: true },
  ],
  rooms: [],
};

describe('Config Helpers', () => {
  describe('getTeamMembers', () => {
    test('returns members of a specific team', () => {
      const members = getTeamMembers(MOCK_CONFIG, 'engineering');
      expect(members).toHaveLength(3);
      expect(members.map(m => m.id)).toEqual(['charlie', 'diana', 'evan']);
    });

    test('returns empty for non-existent team', () => {
      expect(getTeamMembers(MOCK_CONFIG, 'marketing')).toEqual([]);
    });

    test('returns leadership team', () => {
      const leaders = getTeamMembers(MOCK_CONFIG, 'leadership');
      expect(leaders).toHaveLength(2);
    });
  });

  describe('getTeamLead', () => {
    test('returns lead of a team', () => {
      const lead = getTeamLead(MOCK_CONFIG, 'engineering');
      expect(lead).toBeDefined();
      expect(lead!.id).toBe('charlie');
      expect(lead!.isLead).toBe(true);
    });

    test('returns undefined for team without lead', () => {
      const lead = getTeamLead(MOCK_CONFIG, 'leadership');
      expect(lead).toBeUndefined();
    });

    test('returns undefined for non-existent team', () => {
      expect(getTeamLead(MOCK_CONFIG, 'nonexistent')).toBeUndefined();
    });
  });

  describe('getTeamMap', () => {
    test('returns map of all teams with leads and members', () => {
      const map = getTeamMap(MOCK_CONFIG);
      expect(Object.keys(map)).toHaveLength(3);

      expect(map['engineering'].lead).toBe('charlie');
      expect(map['engineering'].members).toHaveLength(3);

      expect(map['design'].lead).toBe('fiona');
      expect(map['design'].members).toHaveLength(1);

      // Leadership has no isLead, so falls back to first member
      expect(map['leadership'].lead).toBe('alice');
    });
  });

  describe('getAllAgentIds', () => {
    test('returns all agent IDs', () => {
      const ids = getAllAgentIds(MOCK_CONFIG);
      expect(ids).toHaveLength(6);
      expect(ids).toEqual(['alice', 'bob', 'charlie', 'diana', 'evan', 'fiona']);
    });
  });
});
