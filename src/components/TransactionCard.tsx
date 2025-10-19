"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"

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

interface TransactionCardProps {
  transaction: Transaction
}

function getStatusColor(status: string) {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800 border-green-200'
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'failed':
      return 'bg-red-100 text-red-800 border-red-200'
    case 'canceled':
      return 'bg-gray-100 text-gray-800 border-gray-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

function getStatusText(status: string) {
  switch (status) {
    case 'completed':
      return 'Completed'
    case 'pending':
      return 'Pending'
    case 'failed':
      return 'Failed'
    case 'canceled':
      return 'Canceled'
    default:
      return status
  }
}

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
}

export function TransactionCard({ transaction }: TransactionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  
  const video = transaction.videos
  const videoTitle = video.youtube_title || video.file_name || 'Untitled Skill'
  const creatorName = video.users 
    ? `${video.users.first_name || ''} ${video.users.last_name || ''}`.trim() || 'Unknown Creator'
    : 'Unknown Creator'
  
  const thumbnailUrl = video.youtube_thumbnail_url || '/simple-logo.png'

  return (
    <div className="accent-block">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="font-mono text-sm line-clamp-1">{videoTitle}</h3>
            <span className={`badge ${getStatusColor(transaction.payment_status)}`}>
              {getStatusText(transaction.payment_status)}
            </span>
          </div>
          <p className="caption text-sm mb-1">
            by {creatorName}
          </p>
          <p className="caption text-sm">
            {formatDate(transaction.created_at)}
          </p>
        </div>
        
        <div className="text-right">
          <div className="font-mono text-lg font-bold">
            {formatCurrency(transaction.amount_paid)}
          </div>
          <div className="meta-label">
            #{transaction.id.slice(0, 8)}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative w-16 h-16 bg-accent-muted flex-shrink-0">
          <Image
            src={thumbnailUrl}
            alt={videoTitle}
            fill
            className="object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.src = '/simple-logo.png'
            }}
          />
        </div>
        
        <div className="flex-1 min-w-0">
          {video.description && (
            <p className="caption text-sm line-clamp-2 mb-2">
              {video.description}
            </p>
          )}
          
          <div className="flex items-center gap-2">
            <Link href={`/video/watch?id=${video.id}`} className="button-inline text-xs">
              Watch Video
            </Link>
            
            {transaction.payment_status === 'completed' && (
              <Link href={`/my-skills`} className="button-inline text-xs">
                View in My Skills
              </Link>
            )}
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-4 pt-4 divider">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="meta-label">Payment Intent ID:</span>
              <p className="font-mono text-xs break-all">{transaction.payment_intent_id}</p>
            </div>
            <div>
              <span className="meta-label">Transaction ID:</span>
              <p className="font-mono text-xs break-all">{transaction.id}</p>
            </div>
            <div>
              <span className="meta-label">Created:</span>
              <p className="caption">{formatDate(transaction.created_at)}</p>
            </div>
            <div>
              <span className="meta-label">Updated:</span>
              <p className="caption">{formatDate(transaction.updated_at)}</p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 flex items-center justify-between">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="button-inline text-xs"
        >
          {isExpanded ? 'Show Less' : 'Show Details'}
        </button>
        
        {transaction.payment_status === 'failed' && (
          <Link href="/marketplace" className="button-inline text-xs">
            Try Again
          </Link>
        )}
      </div>
    </div>
  )
}
