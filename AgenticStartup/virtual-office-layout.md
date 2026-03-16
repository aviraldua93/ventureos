# VentureOS Virtual Office — Layout Specification

> **Designed by:** Dana Chen (VP PM) → Scoped by Leo / Iris → UX by Sana Matsuda & Elena Volkov
> **Approved by:** Jordan Park (CEO)
> **Grid:** 48 tiles wide × 30 tiles tall | 32 px/tile | 1536 × 960 px logical

---

## ASCII Floor Plan

```
 0         1         2         3         4
 0123456789012345678901234567890123456789012345678
 ════════════════════════════════════════════════════
0 ▓▓▓▓▓▓▓N▓▓▓▓▓▓▓▓N▓▓▓▓▓▓▓▓N▓▓▓▓▓▓▓▓▓N▓▓▓▓▓▓N▓▓▓▓▓▓N▓▓
  ┌──────┬───────┬──────────┬──────┬──────┬──────┐
1 │ CEO  │ Exec  │ PM War   │ Mtg  │ Mtg  │ Mtg  │
2 │Office│Meeting│ Room     │Alpha │ Beta │Gamma │
3 │  ⌂   D  ◻◻◻  D ⌂⌂⌂⌂ KB  D  ◻◻  D  ◻◻  D  ◻◻  │
4 │  ☘   │  ◻◻◻  │ ⌂⌂  KB  │  ◻◻  │  ◻◻  │  ◻◻  │
5 │  📚  │       │   ▒▒▒   │  WB  │  WB  │  WB  │
6 │      │  WB   │   KB    │      │      │      │
  ├──⊡───┼───⊡───┼────⊡────┼──⊡───┼──⊡───┼──⊡───┤
7 │ DOOR  DOOR     DOOR      DOOR   DOOR   DOOR  │
  ├──────────────────────┬───────────┬────────────┤
8 │ WB  ⌂⌂⌂  ⌂⌂⌂  WB 📚│ 🖥 ⌂⌂⌂ 📚│ TS TS 🖥   │
9 │  ⌂  ⌂  ⌂  ⌂  ⌂  ⌂  │   ⌂ ⌂ ⌂  │ ⌂ ⌂ ⌂ ⌂ ▣ │
  │                      │           │  QA Lab    │
  │  Engineering         │  AI/LLM   │            │
11│  Bullpen     WB  📚  │  Research 📚────⊡───────│
12│  ⌂  ⌂  ⌂  ⌂  ⌂  ⌂  D   🖥      D Playwright │
13│                      │   ⌂ ⌂ ⌂   │ Testing    │
  │                      │           │ Bay        │
15│  ⌂  ⌂  ⌂  ⌂  ⌂  ⌂  │   ⌂ ⌂ ⌂  │ ⌂ ⌂ ⌂ ⌂   │
  │               🌿     │        ▣  │ TS TS 🖥🖥  │
  │                      │     📚 📚 │            │
18│                      │           │            │
  ├───⊡───┬─────⊡──┬────⊡───┬──────⊡────────────┤
19│ DOOR   │  DOOR   │ DOOR   │     DOOR          │
  ├────────┼────────┼────────┼────────────────────┤
20│☘☘☘  ☘ │ ☕☕  ☘ │ ☘                          ☘│
  │Community│Break   │                             │
22│🛋   🛋  │Room /  │       Lobby /               │
23│        │Kitchen │       Entrance        🛋 🛋  │
24│📚 ⌂  ⌂ D ◻◻◻   D                         📚  │
  │        │  ◻◻    │                             │
26│🛋   🛋  │        │   ☘                     ☘   │
  │Lounge  │        │                             │
28│☘      ☘│     ☘  │ ☘                          ☘│
  └────────┴────────┴────────────[🚪]─────────────┘
29 ▓▓▓▓▓▓▓N▓▓▓▓▓▓▓▓▓N▓▓▓▓▓▓▓▓▓▓N▓▓▓▓▓▓▓▓▓▓▓▓▓N▓▓▓▓
```

**Legend:** ⌂ Desk | ◻ Chair | WB Whiteboard | KB Kanban Board | TS Test Station
🖥 Monitor | ▣ Server Rack | ☕ Coffee Machine | ☘ Plant | 🛋 Couch | 📚 Bookshelf
⊡ Door | N Window | ▓ Wall | D Internal Door

---

## Room Inventory

| # | Room | ID | Type | Position | Size | Desks | Visual Theme |
|---|------|----|------|----------|------|-------|--------------|
| 1 | CEO's Office | `ceo-office` | `corner_office` | (1,1) | 6×6 | 1 | Blue tint, bookshelf, plant |
| 2 | Exec Meeting Room | `exec-meeting` | `meeting_room` | (8,1) | 7×6 | 0 | Purple tint, whiteboard, 6 chairs |
| 3 | PM War Room | `pm-war-room` | `pm_war_room` | (16,1) | 10×6 | 6 | Amber tint, 3 kanban boards |
| 4 | Meeting Alpha | `meeting-alpha` | `meeting_room` | (27,1) | 6×6 | 0 | Purple tint, whiteboard, 4 chairs |
| 5 | Meeting Beta | `meeting-beta` | `meeting_room` | (34,1) | 6×6 | 0 | Purple tint, whiteboard, 4 chairs |
| 6 | Meeting Gamma | `meeting-gamma` | `meeting_room` | (41,1) | 6×6 | 0 | Purple tint, whiteboard, 4 chairs |
| 7 | Engineering Bullpen | `eng-bullpen` | `open_office` | (1,8) | 22×11 | 18 | Green tint, 4 whiteboards, clusters |
| 8 | AI/LLM Research | `ai-research` | `research_lab` | (24,8) | 11×11 | 6 | Violet tint, monitors, bookshelves |
| 9 | QA Lab | `qa-lab` | `qa_lab` | (36,8) | 11×5 | 4 | Cyan tint, test stations, server rack |
| 10 | Playwright Testing | `testing-bay` | `testing_bay` | (36,14) | 11×5 | 4 | Orange tint, test stations, monitors |
| 11 | Community Lounge | `community-lounge` | `community_lounge` | (1,20) | 13×9 | 2 | Emerald tint, plants, couches |
| 12 | Break Room / Kitchen | `break-room` | `break_room` | (15,20) | 10×9 | 0 | Pink tint, coffee machines, plants |
| 13 | Lobby / Entrance | `lobby` | `lobby` | (26,20) | 21×9 | 0 | Neutral tint, plants, visitor seating |

**Total desk positions: 41** (supports 35+ agents with room to grow)

---

## Desk Allocation by Team

| Team | Room | Desks | Key Members |
|------|------|-------|-------------|
| Executive | CEO's Office | 1 | Jordan Park |
| Product Management | PM War Room | 6 | Dana, Leo, Iris + PMs |
| Engineering | Engineering Bullpen | 18 | Kai's full engineering team |
| AI/LLM Research | AI/LLM Research | 6 | Noor's research team |
| QA | QA Lab | 4 | QA engineers |
| Playwright/E2E | Playwright Testing Bay | 4 | Riley's testing team |
| Community | Community Lounge | 2 | Ava's community team |

---

## Door & Connectivity Map

Agents navigate between all rooms via A* pathfinding on Floor + Door tiles.

### Top ↔ Middle (y=7 wall)
- CEO → Bullpen: (3,7)
- Exec Meeting → Bullpen: (11,7)
- PM War Room → Bullpen: (20,7)
- Meeting Alpha → AI Research: (29,7)
- Meeting Beta → QA Lab: (37,7)
- Meeting Gamma → QA Lab: (43,7)

### Middle Internal
- Bullpen ↔ AI Research: (23,12)
- AI Research ↔ QA Lab: (35,10)
- AI Research ↔ Testing Bay: (35,16)
- QA Lab ↔ Testing Bay: (40,13)

### Middle ↔ Bottom (y=19 wall)
- Bullpen → Community Lounge: (7,19)
- Bullpen → Break Room: (19,19)
- AI Research → Lobby: (30,19)
- Testing Bay → Lobby: (40,19)

### Bottom Internal
- Community Lounge ↔ Break Room: (14,24)
- Break Room ↔ Lobby: (25,24)

### Entrance
- Lobby front door: (36,29) — agent spawn point at (36,27)

---

## Visual Design per Room Type

| Room Type | Floor Color | Accent | Decorative Elements |
|-----------|-------------|--------|---------------------|
| `corner_office` | Blue tint `rgba(77,159,255,0.10)` | Executive blue | Bookshelf, plant, large desk |
| `meeting_room` | Purple tint `rgba(168,139,250,0.08)` | Meeting purple | Whiteboard, ring of chairs |
| `pm_war_room` | Amber tint `rgba(255,182,71,0.10)` | Strategy amber | Kanban boards on walls, desk clusters |
| `open_office` | Green tint `rgba(61,220,132,0.06)` | Engineering green | Whiteboards, desk rows, bookshelves |
| `research_lab` | Violet tint `rgba(139,92,246,0.12)` | Research violet | Monitors (neural net viz), bookshelves, server rack |
| `qa_lab` | Cyan tint `rgba(56,189,248,0.10)` | QA cyan | Test stations with status lights, server rack |
| `testing_bay` | Orange tint `rgba(251,146,60,0.10)` | Testing orange | Test stations, monitors showing results |
| `community_lounge` | Emerald tint `rgba(52,211,153,0.12)` | Community green | Plants everywhere, couches, warm lighting |
| `break_room` | Pink tint `rgba(255,110,180,0.08)` | Break pink | Coffee machines, plants, casual seating |
| `lobby` | Neutral tint `rgba(255,255,255,0.06)` | Clean white | Plants at corners, visitor couches, company bookshelf |

---

## Implementation Notes

- **Tile grid** is generated programmatically from room definitions using auto-wall detection
- **Pathfinding** uses A* on walkable tiles (Floor + Door)
- **Idle agents** wander to Break Room, Meeting Rooms, Lounge, and Lobby
- **New furniture types** added: `KanbanBoard`, `TestStation`, `Couch`
- **Room-specific floor overlays** applied during pre-render for visual distinction
- **Room labels** rendered with bold font and room-type accent colors
