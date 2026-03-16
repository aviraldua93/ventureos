import * as TabsPrimitive from '@radix-ui/react-tabs';
import { forwardRef } from 'react';
import styles from './Tabs.module.css';

/* Root */
export const Tabs = TabsPrimitive.Root;

/* TabsList */
export const TabsList = forwardRef<
  HTMLDivElement,
  TabsPrimitive.TabsListProps
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={[styles.list, className].filter(Boolean).join(' ')}
    {...props}
  />
));
TabsList.displayName = 'TabsList';

/* TabsTrigger */
export const TabsTrigger = forwardRef<
  HTMLButtonElement,
  TabsPrimitive.TabsTriggerProps
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={[styles.trigger, className].filter(Boolean).join(' ')}
    {...props}
  />
));
TabsTrigger.displayName = 'TabsTrigger';

/* TabsContent */
export const TabsContent = forwardRef<
  HTMLDivElement,
  TabsPrimitive.TabsContentProps
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={[styles.content, className].filter(Boolean).join(' ')}
    {...props}
  />
));
TabsContent.displayName = 'TabsContent';
