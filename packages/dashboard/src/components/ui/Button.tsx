import { type ButtonHTMLAttributes, forwardRef } from 'react';
import styles from './Button.module.css';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className, children, ...props }, ref) => {
    const cls = [
      styles.button,
      styles[variant],
      styles[size],
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <button ref={ref} className={cls} {...props}>
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';
