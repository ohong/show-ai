"use client"

import { useState } from "react"

type FilterOption = 'all' | 'completed' | 'pending' | 'failed' | 'canceled'
type SortOption = 'newest' | 'oldest' | 'amount_high' | 'amount_low'

interface TransactionFiltersProps {
  onFilterChange?: (filter: FilterOption) => void
  onSortChange?: (sort: SortOption) => void
  currentFilter?: FilterOption
  currentSort?: SortOption
}

export function TransactionFilters({ 
  onFilterChange, 
  onSortChange,
  currentFilter = 'all',
  currentSort = 'newest'
}: TransactionFiltersProps) {
  const [activeFilter, setActiveFilter] = useState<FilterOption>(currentFilter)
  const [activeSort, setActiveSort] = useState<SortOption>(currentSort)
  const [isOpen, setIsOpen] = useState(false)

  const filterOptions: { value: FilterOption; label: string }[] = [
    { value: 'all', label: 'All Transactions' },
    { value: 'completed', label: 'Completed' },
    { value: 'pending', label: 'Pending' },
    { value: 'failed', label: 'Failed' },
    { value: 'canceled', label: 'Canceled' }
  ]

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'amount_high', label: 'Highest Amount' },
    { value: 'amount_low', label: 'Lowest Amount' }
  ]

  const handleFilterChange = (filter: FilterOption) => {
    setActiveFilter(filter)
    onFilterChange?.(filter)
  }

  const handleSortChange = (sort: SortOption) => {
    setActiveSort(sort)
    onSortChange?.(sort)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="button-inline flex items-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
        </svg>
        Filter & Sort
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-80 accent-block z-20 p-4">
            <div className="stack gap-4">
              <div>
                <h4 className="font-mono text-sm mb-2">Filter by Status</h4>
                <div className="stack gap-1">
                  {filterOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleFilterChange(option.value)}
                      className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                        activeFilter === option.value
                          ? 'bg-accent-muted'
                          : 'hover:bg-accent-thin'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="divider pt-4">
                <h4 className="font-mono text-sm mb-2">Sort by</h4>
                <div className="stack gap-1">
                  {sortOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleSortChange(option.value)}
                      className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                        activeSort === option.value
                          ? 'bg-accent-muted'
                          : 'hover:bg-accent-thin'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="divider pt-4 flex gap-2">
                <button
                  onClick={() => {
                    setActiveFilter('all')
                    setActiveSort('newest')
                    onFilterChange?.('all')
                    onSortChange?.('newest')
                    setIsOpen(false)
                  }}
                  className="button-inline flex-1 text-xs"
                >
                  Reset
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="button-inline flex-1 text-xs"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
