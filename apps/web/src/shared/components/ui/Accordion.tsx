import * as React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../utils/cn';

interface AccordionContextType {
  openItem: string | null;
  toggleItem: (id: string) => void;
}

const AccordionContext = React.createContext<AccordionContextType | null>(null);

export interface AccordionProps extends React.HTMLAttributes<HTMLDivElement> {
  type?: 'single';
  defaultValue?: string;
}

export function Accordion({ defaultValue, className, children, ...props }: AccordionProps) {
  const [openItem, setOpenItem] = React.useState<string | null>(defaultValue || null);

  const toggleItem = React.useCallback((id: string) => {
    setOpenItem((prev) => (prev === id ? null : id));
  }, []);

  return (
    <AccordionContext.Provider value={{ openItem, toggleItem }}>
      <div className={cn('divide-y divide-border/60 rounded-2xl border border-border bg-card shadow-xs', className)} {...props}>
        {children}
      </div>
    </AccordionContext.Provider>
  );
}

interface AccordionItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

const AccordionItemContext = React.createContext<{ value: string }>({ value: '' });

export function AccordionItem({ value, className, children, ...props }: AccordionItemProps) {
  return (
    <AccordionItemContext.Provider value={{ value }}>
      <div className={cn('overflow-hidden first:rounded-t-2xl last:rounded-b-2xl', className)} {...props}>
        {children}
      </div>
    </AccordionItemContext.Provider>
  );
}

export interface AccordionTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export function AccordionTrigger({ className, children, ...props }: AccordionTriggerProps) {
  const context = React.useContext(AccordionContext);
  const itemContext = React.useContext(AccordionItemContext);

  if (!context) throw new Error('AccordionTrigger must be used within Accordion');

  const isOpen = context.openItem === itemContext.value;
  const contentId = `accordion-content-${itemContext.value}`;
  const triggerId = `accordion-trigger-${itemContext.value}`;

  return (
    <button
      id={triggerId}
      type="button"
      aria-expanded={isOpen}
      aria-controls={contentId}
      onClick={() => context.toggleItem(itemContext.value)}
      className={cn(
        'flex w-full items-center justify-between p-4 sm:p-5 text-left text-sm sm:text-base font-semibold text-foreground transition-all hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500',
        className
      )}
      {...props}
    >
      <span>{children}</span>
      <ChevronDown
        className={cn(
          'h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200',
          isOpen && 'rotate-180 text-emerald-600'
        )}
      />
    </button>
  );
}

export interface AccordionContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function AccordionContent({ className, children, ...props }: AccordionContentProps) {
  const context = React.useContext(AccordionContext);
  const itemContext = React.useContext(AccordionItemContext);

  if (!context) throw new Error('AccordionContent must be used within Accordion');

  const isOpen = context.openItem === itemContext.value;
  const contentId = `accordion-content-${itemContext.value}`;
  const triggerId = `accordion-trigger-${itemContext.value}`;

  if (!isOpen) return null;

  return (
    <div
      id={contentId}
      role="region"
      aria-labelledby={triggerId}
      className={cn('px-4 sm:px-5 pb-5 pt-0 text-xs sm:text-sm text-muted-foreground leading-relaxed animate-in fade-in-50 duration-200', className)}
      {...props}
    >
      {children}
    </div>
  );
}

