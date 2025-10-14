'use client';

import { Filter, Search, X } from 'lucide-react';
import { ReactNode, useState } from 'react';

import { Button } from '@/components/ui/Button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils/cn';

export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterGroup {
  id: string;
  label: string;
  options: FilterOption[];
  multiple?: boolean;
}

export interface TableFiltersProps {
  /**
   * Search value
   */
  searchValue?: string;

  /**
   * Search placeholder text
   */
  searchPlaceholder?: string;

  /**
   * Callback when search value changes
   */
  onSearchChange?: (value: string) => void;

  /**
   * Filter groups configuration
   */
  filterGroups?: FilterGroup[];

  /**
   * Active filters
   */
  activeFilters?: Record<string, string[]>;

  /**
   * Callback when filters change
   */
  onFilterChange?: (filterId: string, values: string[]) => void;

  /**
   * Items per page options
   */
  limitOptions?: number[];

  /**
   * Current limit value
   */
  limit?: number;

  /**
   * Callback when limit changes
   */
  onLimitChange?: (limit: number) => void;

  /**
   * Custom actions to display
   */
  actions?: ReactNode;

  /**
   * Show filter button
   */
  showFilters?: boolean;

  /**
   * Show limit selector
   */
  showLimit?: boolean;

  /**
   * Custom className
   */
  className?: string;
}

/**
 * Reusable table filters component with search, filters, and limit selector
 *
 * @example
 * ```tsx
 * <TableFilters
 *   searchValue={search}
 *   searchPlaceholder="Search users..."
 *   onSearchChange={setSearch}
 *   filterGroups={[
 *     {
 *       id: 'role',
 *       label: 'Role',
 *       options: [
 *         { label: 'Admin', value: 'ADMIN' },
 *         { label: 'User', value: 'USER' },
 *       ],
 *     },
 *   ]}
 *   activeFilters={{ role: ['ADMIN'] }}
 *   onFilterChange={(id, values) => setFilters({ ...filters, [id]: values })}
 *   limitOptions={[10, 25, 50, 100]}
 *   limit={10}
 *   onLimitChange={setLimit}
 * />
 * ```
 */
export function TableFilters({
  searchValue = '',
  searchPlaceholder = 'Search...',
  onSearchChange,
  filterGroups = [],
  activeFilters = {},
  onFilterChange,
  limitOptions = [10, 25, 50, 100],
  limit = 10,
  onLimitChange,
  actions,
  showFilters = true,
  showLimit = true,
  className,
}: TableFiltersProps) {
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  // Count active filters
  const activeFilterCount = Object.values(activeFilters).reduce((count, values) => count + (values?.length || 0), 0);

  // Clear all filters
  const handleClearFilters = () => {
    filterGroups.forEach((group) => {
      onFilterChange?.(group.id, []);
    });
  };

  // Handle filter selection
  const handleFilterSelect = (groupId: string, value: string, isMultiple: boolean) => {
    const currentValues = activeFilters[groupId] || [];

    if (isMultiple) {
      // Toggle value in array
      const newValues = currentValues.includes(value)
        ? currentValues.filter((v) => v !== value)
        : [...currentValues, value];
      onFilterChange?.(groupId, newValues);
    } else {
      // Single selection
      const newValues = currentValues.includes(value) ? [] : [value];
      onFilterChange?.(groupId, newValues);
    }
  };

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      {/* Search and Actions Row */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search Input */}
        {onSearchChange && (
          <div className="max-w-sm min-w-[200px] flex-1">
            <Input
              icon={<Search className="h-4 w-4" />}
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              className="h-9"
            />
          </div>
        )}

        {/* Filters Button */}
        {showFilters && filterGroups.length > 0 && (
          <DropdownMenu open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 font-normal">
                <Filter className="mr-2" />
                Filters
                {activeFilterCount > 0 && (
                  <span className="bg-primary text-primary-foreground ml-2 flex h-5 w-5 items-center justify-center rounded-full text-xs">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              {filterGroups.map((group, groupIndex) => (
                <div key={group.id}>
                  <DropdownMenuLabel>{group.label}</DropdownMenuLabel>
                  {group.options.map((option) => (
                    <DropdownMenuCheckboxItem
                      key={option.value}
                      checked={activeFilters[group.id]?.includes(option.value) || false}
                      onCheckedChange={() => handleFilterSelect(group.id, option.value, group.multiple ?? false)}
                    >
                      {option.label}
                    </DropdownMenuCheckboxItem>
                  ))}
                  {groupIndex < filterGroups.length - 1 && <DropdownMenuSeparator />}
                </div>
              ))}
              {activeFilterCount > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <div className="p-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleClearFilters}
                      className="w-full justify-start text-xs"
                    >
                      <X className="mr-2 h-3 w-3" />
                      Clear filters
                    </Button>
                  </div>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Limit Selector */}
        {showLimit && onLimitChange && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 px-5 font-normal">
                Show: {limit}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Items per page</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {limitOptions.map((option) => (
                <DropdownMenuCheckboxItem
                  key={option}
                  checked={limit === option}
                  onCheckedChange={() => onLimitChange(option)}
                >
                  {option} items
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Custom Actions */}
        {actions && <div className="ml-auto">{actions}</div>}
      </div>

      {/* Active Filters Pills */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-muted-foreground text-xs">Active filters:</span>
          {filterGroups.map((group) => {
            const selectedValues = activeFilters[group.id] || [];
            return selectedValues.map((value) => {
              const option = group.options.find((opt) => opt.value === value);
              if (!option) return null;

              return (
                <button
                  key={`${group.id}-${value}`}
                  onClick={() => handleFilterSelect(group.id, value, group.multiple ?? false)}
                  className="bg-primary/10 text-primary hover:bg-primary/20 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors"
                >
                  {option.label}
                  <X className="h-3 w-3" />
                </button>
              );
            });
          })}
          <button
            onClick={handleClearFilters}
            className="text-muted-foreground hover:text-foreground text-xs transition-colors"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}
