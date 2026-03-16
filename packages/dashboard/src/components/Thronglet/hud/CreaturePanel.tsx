import { useState } from 'react';
import type { Agent, Task } from '@ventureos/shared';
import type { Creature } from '../engine/creatures';
import { SPECIES_META } from '../engine/creatures';
import { MOOD_COLORS, MOOD_EMOJI, MOOD_LABEL, computeMood } from '../engine/moods';
import css from '../ThrongletOffice.module.css';

interface CreaturePanelProps {
  creature: Creature | null;
  agent: Agent | null;
  tasks: Task[];
  onPet: (id: string) => void;
  onClose: () => void;
}

export function CreaturePanel({ creature, agent, tasks, onPet, onClose }: CreaturePanelProps) {
  const [feedInput, setFeedInput] = useState('');

  if (!creature || !agent) return null;

  const mood = computeMood(agent, tasks);
  const moodColors = MOOD_COLORS[mood.mood];
  const speciesMeta = SPECIES_META[creature.species];
  const agentTasks = tasks.filter(t => t.assigneeId === agent.id);
  const activeTasks = agentTasks.filter(t => t.status !== 'done');
  const completedTasks = agentTasks.filter(t => t.status === 'done');

  return (
    <div className={css.creaturePanel}>
      <div className={css.creaturePanelHeader} style={{ borderBottomColor: moodColors.primary }}>
        <div className={css.creaturePanelTitle}>
          <span className={css.creatureSpeciesBadge} style={{ background: moodColors.bg, color: moodColors.primary }}>
            {MOOD_EMOJI[mood.mood]} {speciesMeta.label}
          </span>
          <h3 className={css.creatureName}>{agent.name}</h3>
          <span className={css.creatureRole}>{agent.role}</span>
        </div>
        <button className={css.creaturePanelClose} onClick={onClose}>✕</button>
      </div>

      {/* Mood Status */}
      <div className={css.creatureMoodSection}>
        <div className={css.creatureMoodBar} style={{ background: moodColors.bg }}>
          <div
            className={css.creatureMoodFill}
            style={{ width: `${mood.intensity * 100}%`, background: moodColors.primary }}
          />
        </div>
        <span className={css.creatureMoodLabel} style={{ color: moodColors.primary }}>
          {MOOD_LABEL[mood.mood]}
        </span>
      </div>

      {/* Stats */}
      <div className={css.creatureStats}>
        <div className={css.creatureStat}>
          <span className={css.creatureStatLabel}>Status</span>
          <span className={css.creatureStatValue}>{agent.status}</span>
        </div>
        <div className={css.creatureStat}>
          <span className={css.creatureStatLabel}>Active Tasks</span>
          <span className={css.creatureStatValue}>{activeTasks.length}</span>
        </div>
        <div className={css.creatureStat}>
          <span className={css.creatureStatLabel}>Completed</span>
          <span className={css.creatureStatValue}>{completedTasks.length}</span>
        </div>
      </div>

      {/* Current Tasks */}
      {activeTasks.length > 0 && (
        <div className={css.creatureTaskList}>
          <h4 className={css.creatureTaskListTitle}>Current Tasks</h4>
          {activeTasks.map(t => (
            <div key={t.id} className={css.creatureTaskItem}>
              <span className={css.creatureTaskStatus} data-status={t.status}>
                {t.status === 'in_progress' ? '🔄' : t.status === 'review' ? '👀' : '📝'}
              </span>
              <span className={css.creatureTaskName}>{t.title}</span>
            </div>
          ))}
        </div>
      )}

      {/* Interaction Buttons */}
      <div className={css.creatureActions}>
        <button
          className={css.creatureActionBtn}
          onClick={() => onPet(creature.id)}
          title="Acknowledge good work!"
        >
          💛 Pet
        </button>
        <div className={css.creatureFeedRow}>
          <input
            className={css.creatureFeedInput}
            placeholder="Feed a task…"
            value={feedInput}
            onChange={e => setFeedInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && feedInput.trim()) {
                // In a real app this would create a task via the API
                setFeedInput('');
              }
            }}
          />
          <button
            className={css.creatureActionBtn}
            disabled={!feedInput.trim()}
            onClick={() => {
              if (feedInput.trim()) setFeedInput('');
            }}
          >
            🍕 Feed
          </button>
        </div>
      </div>
    </div>
  );
}
