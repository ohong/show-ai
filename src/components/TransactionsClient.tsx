"use client"

import { useState, useEffect } from "react"
import { TransactionCard } from "@/components/TransactionCard"
import { TransactionFilters } from "@/components/TransactionFilters"

type Transaction = {
  id: string
  amount_paid: number
  payment_status: 'pending' | 'completed' | 'failed' | 'canceled'
  payment_intent_id: string
  created_at: string
  updated_at: string
  videos: {
    id: string
    youtube_title: string | null
    file_name: string | null
    youtube_thumbnail_url: string | null
    description: string | null
    users: {
      first_name: string | null
      last_name: string | null
    } | null
  }
}

type FilterOption = 'all' | 'completed' | 'pending' | 'failed' | 'canceled'
type SortOption = 'newest' | 'oldest' | 'amount_high' | 'amount_low'

interface TransactionsResponse {
  success: boolean
  data: {
    transactions: Transaction[]
    pagination: {
      total: number
      limit: number
      offset: number
      hasMore: boolean
    }
    filters: {
      status: FilterOption
      sort: SortOption
    }
  }
}

export function TransactionsClient() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<FilterOption>('all')
  const [sort, setSort] = useState<SortOption>('newest')
  const [total, setTotal] = useState(0)

  const fetchTransactions = async (status: FilterOption = filter, sortBy: SortOption = sort) => {
    try {
      setLoading(true)
      setError(null)
      
      const params = new URLSearchParams({
        status,
        sort: sortBy,
        limit: '50',
        offset: '0'
      })
      
      const response = await fetch(`/api/transactions?${params}`)
      const data: TransactionsResponse = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch transactions')
      }
      
      if (data.success) {
        setTransactions(data.data.transactions)
        setTotal(data.data.pagination.total)
      } else {
        throw new Error('Invalid response format')
      }
    } catch (err) {
      console.error('Failed to fetch transactions:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch transactions')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTransactions()
  }, [])

  const handleFilterChange = (newFilter: FilterOption) => {
    setFilter(newFilter)
    fetchTransactions(newFilter, sort)
  }

  const handleSortChange = (newSort: SortOption) => {
    setSort(newSort)
    fetchTransactions(filter, newSort)
  }

  if (loading) {
    return <TransactionsLoading />
  }

  if (error) {
    return (
      <div className="accent-block">
        <div className="stack items-center gap-4 text-center">
          <div className="w-16 h-16 bg-accent-muted rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="font-mono text-sm mb-2">Error loading transactions</h3>
            <p className="caption text-sm mb-4">{error}</p>
            <button
              onClick={() => fetchTransactions()}
              className="button-inline"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (transactions.length === 0) {
    return (
      <div className="accent-block">
        <div className="stack items-center gap-4 text-center">
          <div className="w-16 h-16 bg-accent-muted rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h3 className="font-mono text-sm mb-2">No transactions yet</h3>
            <p className="caption text-sm mb-4">
              Your purchase history will appear here once you start buying skills from the marketplace.
            </p>
            <a
              href="/marketplace"
              className="button-inline"
            >
              Browse Marketplace
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="stack gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-mono text-sm mb-1">Purchase History</h2>
          <p className="caption">
            {total} transaction{total !== 1 ? 's' : ''}
            {filter !== 'all' && ` (${filter})`}
          </p>
        </div>
        <TransactionFilters 
          onFilterChange={handleFilterChange}
          onSortChange={handleSortChange}
          currentFilter={filter}
          currentSort={sort}
        />
      </div>

      <div className="stack gap-4">
        {transactions.map((transaction) => (
          <TransactionCard key={transaction.id} transaction={transaction} />
        ))}
      </div>
    </div>
  )
}

function TransactionsLoading() {
  return (
    <div className="stack gap-4">
      <div className="flex items-center justify-between">
        <div className="stack gap-2">
          <div className="h-6 w-48 bg-accent-muted animate-pulse" />
          <div className="h-4 w-32 bg-accent-muted animate-pulse" />
        </div>
        <div className="h-10 w-32 bg-accent-muted animate-pulse" />
      </div>
      
      {[...Array(3)].map((_, i) => (
        <div key={i} className="accent-block">
          <div className="flex items-start justify-between mb-4">
            <div className="stack gap-2">
              <div className="h-5 w-64 bg-accent-muted animate-pulse" />
              <div className="h-4 w-48 bg-accent-muted animate-pulse" />
            </div>
            <div className="h-6 w-20 bg-accent-muted animate-pulse" />
          </div>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-accent-muted animate-pulse" />
            <div className="stack gap-2 flex-1">
              <div className="h-4 w-32 bg-accent-muted animate-pulse" />
              <div className="h-3 w-24 bg-accent-muted animate-pulse" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
