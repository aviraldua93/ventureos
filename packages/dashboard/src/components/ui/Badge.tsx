import { type HTMLAttributes, forwardRef } from 'react';
import styles from './Badge.module.css';

export type BadgeStatus = 'active' | 'idle' | 'error' | 'offline';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  status?: BadgeStatus;
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ status = 'active', className, children, ...props }, ref) => {
    const cls = [
      styles.badge,
      styles[status],
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <span ref={ref} className={cls} {...props}>
        <span className={styles.dot} />
        {children}
      </span>
    );
  },
);

Badge.displayName = 'Badge';
