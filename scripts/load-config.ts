#!/usr/bin/env bun
// load-config.ts — Shared config loader for VentureOS generification
//
// Reads ventureos.config.json from the repo root and provides typed access
// to company, teams, agents, and room configuration.

import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

// ── Config Schema Types ─────────────────────────────────────────

export interface CompanyConfig {
  name: string;
  tagline: string;
  branding: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
  };
}

export interface TeamConfig {
  name: string;
  displayName: string;
  color: string;
  icon: string;
  roomType?: string;
}

export interface AgentConfig {
  id: string;
  name: string;
  role: string;
  team: string;
  parentId?: string;
  capabilities?: string[];
  isLead?: boolean;
}

export interface RoomConfig {
  id: string;
  name: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface VentureOSConfig {
  company: CompanyConfig;
  teams: TeamConfig[];
  agents: AgentConfig[];
  rooms: RoomConfig[];
}

// ── Config Loader ───────────────────────────────────────────────

function findConfigPath(): string {
  // Walk up from CWD to find ventureos.config.json
  let dir = process.cwd();
  for (let i = 0; i < 10; i++) {
    const candidate = resolve(dir, 'ventureos.config.json');
    if (existsSync(candidate)) return candidate;
    const parent = resolve(dir, '..');
    if (parent === dir) break;
    dir = parent;
  }
  throw new Error(
    'ventureos.config.json not found. Copy ventureos.config.example.json to ventureos.config.json and customize it.'
  );
}

let _cached: VentureOSConfig | null = null;

export function loadConfig(): VentureOSConfig {
  if (_cached) return _cached;

  const configPath = findConfigPath();
  const raw = readFileSync(configPath, 'utf-8');
  const config = JSON.parse(raw) as VentureOSConfig;

  // Validate required fields
  if (!config.company?.name) throw new Error('Config missing company.name');
  if (!config.teams?.length) throw new Error('Config missing teams array');
  if (!config.agents?.length) throw new Error('Config missing agents array');

  _cached = config;
  return config;
}

// ── Derived Helpers ─────────────────────────────────────────────

export function getTeamMembers(config: VentureOSConfig, teamName: string): AgentConfig[] {
  return config.agents.filter(a => a.team === teamName);
}

export function getTeamLead(config: VentureOSConfig, teamName: string): AgentConfig | undefined {
  return config.agents.find(a => a.team === teamName && a.isLead);
}

export function getTeamMap(config: VentureOSConfig): Record<string, { lead: string; members: AgentConfig[] }> {
  const map: Record<string, { lead: string; members: AgentConfig[] }> = {};
  for (const team of config.teams) {
    const members = getTeamMembers(config, team.name);
    const lead = getTeamLead(config, team.name);
    map[team.name] = {
      lead: lead?.id || members[0]?.id || '',
      members,
    };
  }
  return map;
}

export function getAllAgentIds(config: VentureOSConfig): string[] {
  return config.agents.map(a => a.id);
}
