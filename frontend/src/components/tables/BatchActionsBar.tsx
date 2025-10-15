import { X } from 'lucide-react';
import { ReactNode } from 'react';

import { Button } from '@/components/ui/Button';

/**
 * Definition for a single batch action
 */
export interface BatchAction {
  /**
   * Label for the action button
   */
  label: string;

  /**
   * Function to call when the action is triggered
   */
  onClick: () => void;

  /**
   * Variant of the action button
   */
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';

  /**
   * Icon to display in the action button
   */
  icon?: ReactNode;

  /**
   * Whether the action button is disabled
   */
  disabled?: boolean;

  /**
   * Additional className for the action button
   */
  className?: string;
}

/**
 * Props for the BatchActionsBar component
 */
export interface BatchActionsBarProps {
  /**
   * Number of selected items
   */
  selectedCount: number;

  /**
   * Type of items being selected (e.g., "user", "post")
   */
  itemType?: string;

  /**
   * Actions to perform on the selected items
   */
  actions: BatchAction[];

  /**
   * Function to call when the selection is cleared
   */
  onClearSelection: () => void;

  /**
   * Additional className for the batch actions bar
   */
  className?: string;
}

/**
 * A bar that appears when items are selected in a table, allowing batch actions.
 *
 * @example
 * ```tsx
 * <BatchActionsBar
 *   selectedCount={2}
 *   itemType="user"
 *   actions={[
 *     {
 *       label: 'Delete',
 *       onClick: () => console.log('Delete'),
 *       variant: 'destructive',
 *     },
 *     {
 *       label: 'Edit',
 *       onClick: () => console.log('Edit'),
 *       variant: 'outline',
 *     },
 *   ]}
 *   onClearSelection={() => console.log('Clear selection')}
 * />
 * ```
 */
export const BatchActionsBar = ({
  selectedCount,
  itemType = 'item',
  actions,
  onClearSelection,
  className = '',
}: BatchActionsBarProps) => {
  if (selectedCount === 0) return null;

  return (
    <div
      className={`bg-background border-border flex items-center justify-between gap-5 rounded-lg border px-4 py-3 ${className}`}
    >
      <div className="flex items-center gap-4">
        <div className="text-muted-foreground text-sm">
          <span className="text-foreground font-medium">{selectedCount}</span>{' '}
          {selectedCount === 1 ? itemType : `${itemType}s`} selected
        </div>
        <div className="flex items-center gap-2">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant={action.variant || 'outline'}
              size="sm"
              onClick={action.onClick}
              disabled={action.disabled}
              className={`h-8 text-xs ${action.className || ''}`}
            >
              {action.icon && <span className="mr-2">{action.icon}</span>}
              {action.label}
            </Button>
          ))}
        </div>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={onClearSelection}
        className="text-muted-foreground hover:text-foreground h-8 w-8 p-0"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
};
