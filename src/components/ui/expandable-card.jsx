import * as React from 'react';
import { XIcon } from 'lucide-react';
import { Dialog as DialogPrimitive } from 'radix-ui';
import {
  AnimatePresence,
  LayoutGroup,
  motion,
  useReducedMotion,
} from 'motion/react';
import { useControllableState } from '@radix-ui/react-use-controllable-state';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const ExpandableCardContext = React.createContext(null);

const expandableCardTransition = {
  type: 'spring',
  stiffness: 220,
  damping: 30,
  mass: 0.8,
};

function useExpandableCard() {
  const context = React.useContext(ExpandableCardContext);

  if (!context) {
    throw new Error('ExpandableCard components must be used within <ExpandableCard>.');
  }

  return context;
}

function ExpandableCard({
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  children,
  ...props
}) {
  const layoutGroupId = React.useId();
  const [open = false, setOpen] = useControllableState({
    prop: openProp,
    defaultProp: defaultOpen,
    onChange: onOpenChange,
  });

  return (
    <ExpandableCardContext.Provider
      value={{
        open,
        cardLayoutId: `${layoutGroupId}-card`,
        mediaLayoutId: `${layoutGroupId}-media`,
      }}
    >
      <LayoutGroup id={layoutGroupId}>
        <DialogPrimitive.Root open={open} onOpenChange={setOpen} {...props}>
          {children}
        </DialogPrimitive.Root>
      </LayoutGroup>
    </ExpandableCardContext.Provider>
  );
}

function ExpandableCardTrigger({
  className,
  transition = expandableCardTransition,
  type = 'button',
  ...props
}) {
  const context = useExpandableCard();
  const shouldReduceMotion = useReducedMotion();

  return (
    <DialogPrimitive.Trigger asChild>
      <motion.button
        data-slot="expandable-card-trigger"
        data-state={context.open ? 'open' : 'closed'}
        type={type}
        layoutId={context.cardLayoutId}
        transition={shouldReduceMotion ? { duration: 0 } : transition}
        className={cn(
          'sh:group/expandable-card sh:block sh:w-full sh:max-w-80 sh:cursor-pointer sh:overflow-hidden sh:rounded-2xl sh:border sh:bg-background sh:text-left sh:shadow-sm sh:outline-none',
          'sh:transition-[border-color,box-shadow] sh:duration-200 sh:hover:border-foreground/20 sh:hover:shadow-md',
          'sh:focus-visible:ring-2 sh:focus-visible:ring-ring sh:focus-visible:ring-offset-2 sh:focus-visible:ring-offset-background',
          'sh:disabled:pointer-events-none sh:disabled:opacity-50',
          className,
        )}
        {...props}
      />
    </DialogPrimitive.Trigger>
  );
}

function ExpandableCardMedia({
  className,
  transition = expandableCardTransition,
  ...props
}) {
  const context = useExpandableCard();
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.span
      data-slot="expandable-card-media"
      layoutId={context.mediaLayoutId}
      transition={shouldReduceMotion ? { duration: 0 } : transition}
      className={cn('sh:block sh:overflow-hidden', className)}
      {...props}
    />
  );
}

function ExpandableCardContent({
  className,
  children,
  showCloseButton = true,
  closeLabel = 'Close',
  overlayClassName,
  transition = expandableCardTransition,
  portalContainer,
  contained = false,
  ...props
}) {
  const context = useExpandableCard();
  const shouldReduceMotion = useReducedMotion();

  return (
    <DialogPrimitive.Portal forceMount container={portalContainer ?? undefined}>
      <AnimatePresence initial={false}>
        {context.open ? (
          <DialogPrimitive.Overlay key="overlay" forceMount asChild>
            <motion.div
              data-slot="expandable-card-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.16, ease: 'easeOut' }}
              className={cn(
                contained ? 'sh:absolute' : 'sh:fixed',
                'sh:inset-0 sh:z-[800] sh:bg-background/10 sh:backdrop-blur-sm',
                overlayClassName,
              )}
            />
          </DialogPrimitive.Overlay>
        ) : null}

        {context.open ? (
          <DialogPrimitive.Content key="content" forceMount asChild {...props}>
            <motion.div
              data-slot="expandable-card-content"
              layoutId={context.cardLayoutId}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={shouldReduceMotion ? { duration: 0 } : transition}
              className={cn(
                contained ? 'sh:absolute sh:max-h-[calc(100%-1rem)]' : 'sh:fixed sh:max-h-[90vh]',
                'sh:top-1/2 sh:left-1/2 sh:z-[800] sh:w-[calc(100%-1rem)] sh:max-w-3xl sh:-translate-x-1/2 sh:-translate-y-1/2 sh:overflow-hidden sh:rounded-3xl sh:border sh:bg-background sh:font-[family-name:var(--font-body)] sh:text-foreground sh:shadow-2xl sh:outline-none',
                className,
              )}
            >
              <div
                className={cn(
                  'sh:overflow-y-auto',
                  contained ? 'sh:max-h-[calc(100%-1rem)]' : 'sh:max-h-[90vh]',
                )}
              >
                {children}
              </div>

              {showCloseButton ? (
                <DialogPrimitive.Close asChild>
                  <Button
                    data-slot="expandable-card-close"
                    variant="outline"
                    size="icon"
                    className="sh:absolute sh:top-4 sh:right-4 sh:rounded-full sh:bg-background/80 sh:backdrop-blur"
                  >
                    <XIcon />
                    <span className="sh:sr-only">{closeLabel}</span>
                  </Button>
                </DialogPrimitive.Close>
              ) : null}
            </motion.div>
          </DialogPrimitive.Content>
        ) : null}
      </AnimatePresence>
    </DialogPrimitive.Portal>
  );
}

function ExpandableCardHeader({ className, ...props }) {
  return (
    <div
      data-slot="expandable-card-header"
      className={cn('sh:flex sh:flex-col sh:gap-3 sh:p-6', className)}
      {...props}
    />
  );
}

function ExpandableCardTitle({ className, ...props }) {
  return (
    <DialogPrimitive.Title
      data-slot="expandable-card-title"
      className={cn('sh:text-2xl sh:font-semibold sh:tracking-tight sh:text-foreground', className)}
      {...props}
    />
  );
}

function ExpandableCardDescription({ className, ...props }) {
  return (
    <DialogPrimitive.Description
      data-slot="expandable-card-description"
      className={cn('sh:max-w-2xl sh:text-sm sh:leading-6 sh:text-muted-foreground', className)}
      {...props}
    />
  );
}

function ExpandableCardBody({ className, ...props }) {
  return (
    <div
      data-slot="expandable-card-body"
      className={cn('sh:px-6 sh:pb-6', className)}
      {...props}
    />
  );
}

function ExpandableCardFooter({ className, ...props }) {
  return (
    <div
      data-slot="expandable-card-footer"
      className={cn(
        'sh:flex sh:flex-wrap sh:items-center sh:justify-between sh:gap-3 sh:border-t sh:bg-muted/30 sh:px-6 sh:py-4',
        className,
      )}
      {...props}
    />
  );
}

function ExpandableCardClose({ ...props }) {
  return <DialogPrimitive.Close data-slot="expandable-card-close" {...props} />;
}

export {
  ExpandableCard,
  ExpandableCardBody,
  ExpandableCardClose,
  ExpandableCardContent,
  ExpandableCardDescription,
  ExpandableCardFooter,
  ExpandableCardHeader,
  ExpandableCardMedia,
  ExpandableCardTitle,
  ExpandableCardTrigger,
  expandableCardTransition,
};
