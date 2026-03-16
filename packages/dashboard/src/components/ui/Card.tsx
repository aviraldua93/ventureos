import { type HTMLAttributes, forwardRef } from 'react';
import styles from './Card.module.css';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  elevated?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ elevated = false, className, children, ...props }, ref) => {
    const cls = [
      styles.card,
      elevated && styles.elevated,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div ref={ref} className={cls} {...props}>
        {children}
      </div>
    );
  },
);

Card.displayName = 'Card';
