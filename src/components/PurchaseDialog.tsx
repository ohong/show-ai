"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { loadStripe } from "@stripe/stripe-js"
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js"

type MarketplaceVideo = {
  id: string
  user_id: string
  source_type: "s3" | "youtube" | "url"
  youtube_title: string | null
  youtube_thumbnail_url: string | null
  youtube_duration: number | null
  file_name: string | null
  file_type: string | null
  source_url: string | null
  status: string | null
  processing_status: string | null
  is_processed: boolean
  analysis_result: string | null
  description: string | null
  is_monetized: boolean
  price_per_access: number
  created_at: string
  updated_at: string
  user_first_name: string | null
  user_last_name: string | null
  user_email: string | null
  user_image_url: string | null
  is_purchased?: boolean
  purchase_date?: string
}

interface PurchaseDialogProps {
  isOpen: boolean
  onClose: () => void
  video: MarketplaceVideo
  onSuccess: () => void
}

// Payment form component that uses Stripe Elements
function PaymentForm({ 
  video, 
  clientSecret,
  onSuccess, 
  onError 
}: { 
  video: MarketplaceVideo
  clientSecret: string
  onSuccess: () => void
  onError: (error: string) => void 
}) {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsProcessing(true)

    try {
      // Confirm payment with Stripe
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/purchase/success?video_id=${video.id}`,
        },
        redirect: "if_required",
      })

      if (error) {
        onError(error.message || "Payment failed")
      } else {
        onSuccess()
      }
    } catch (err) {
      onError(err instanceof Error ? err.message : "Payment failed")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className="button-inline w-full bg-accent text-background hover:bg-accent/90 disabled:opacity-50"
      >
        {isProcessing ? "Processing..." : `Pay $${video.price_per_access.toFixed(2)}`}
      </button>
    </form>
  )
}

export function PurchaseDialog({ isOpen, onClose, video, onSuccess }: PurchaseDialogProps) {
  const [error, setError] = useState<string | null>(null)
  const [stripePromise, setStripePromise] = useState<any>(null)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Initialize Stripe
    const initializeStripe = async () => {
      const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
      setStripePromise(stripe)
    }
    initializeStripe()
  }, [])

  useEffect(() => {
    if (isOpen && !clientSecret && !isLoading) {
      // Get client secret when dialog opens
      const getClientSecret = async () => {
        setIsLoading(true)
        setError(null)
        
        try {
          const response = await fetch("/api/purchase", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              videoId: video.id,
              amount: video.price_per_access,
            }),
          })

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || "Failed to create payment intent")
          }

          const { clientSecret: secret } = await response.json()
          setClientSecret(secret)
        } catch (err) {
          setError(err instanceof Error ? err.message : "Failed to initialize payment")
        } finally {
          setIsLoading(false)
        }
      }

      getClientSecret()
    }
  }, [isOpen, clientSecret, isLoading, video.id, video.price_per_access])

  if (!isOpen) return null

  const title = video.youtube_title || video.file_name || "Untitled Skill"
  const thumbnail = video.youtube_thumbnail_url || "/simple-logo.png"
  const creatorName = `${video.user_first_name || ""} ${video.user_last_name || ""}`.trim() || "Anonymous"
  const price = video.price_per_access

  const handleSuccess = () => {
    setError(null)
    onSuccess()
  }

  const handleError = (errorMessage: string) => {
    setError(errorMessage)
  }

  return (
    <div 
      className="backdrop-blur-sm"
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(0, 0, 0, 0.45)",
      }}
    >
      <div 
        className="relative w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        style={{ backgroundColor: "var(--color-background)", border: "4px solid var(--color-border)" }}
      >
        <div className="p-4">
          {/* Header */}
          <div className="border-b-4 border-border px-4 py-3">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl tracking-[0.05em]">Purchase Skill</h2>
              <button
                onClick={onClose}
                className="text-xl hover:text-accent transition-colors"
              >
                ×
              </button>
            </div>
          </div>

          <div className="px-4 py-4 space-y-4">
            {/* Video Info */}
            <div className="flex gap-4">
              <div className="relative w-32 h-20 bg-border rounded overflow-hidden flex-shrink-0">
                <Image
                  src={thumbnail}
                  alt={title}
                  fill
                  className="object-cover"
                />
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-mono text-lg font-bold mb-1">{title}</h3>
                <p className="caption text-sm mb-2">by {creatorName}</p>
                {video.description && (
                  <p className="caption text-sm line-clamp-3">{video.description}</p>
                )}
              </div>
            </div>

          {/* Purchase Details */}
          <div className="accent-block p-4 space-y-3">
            <h4 className="font-mono font-bold">Purchase Details</h4>
            <div className="flex justify-between items-center">
              <span>Skill Package</span>
              <span className="font-mono">${price.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Processing Fee</span>
              <span className="font-mono">$0.00</span>
            </div>
            <div className="border-t border-border pt-2 flex justify-between items-center font-bold">
              <span>Total</span>
              <span className="font-mono text-lg">${price.toFixed(2)}</span>
            </div>
          </div>

          {/* What's Included */}
          <div className="space-y-3">
            <h4 className="font-mono font-bold">What's Included</h4>
            <ul className="space-y-2 caption text-sm">
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <span>Step-by-step skill instructions (SKILL.md)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <span>Automation scripts and code</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <span>Configuration templates</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <span>Reference screenshots and assets</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <span>Lifetime access to updates</span>
              </li>
            </ul>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border-2 border-red-200 p-3 rounded">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Payment Form */}
          <div className="space-y-4">
            <h4 className="font-mono font-bold">Payment Information</h4>
            {isLoading ? (
              <div className="text-center py-4">
                <p className="caption">Initializing payment...</p>
              </div>
            ) : stripePromise && clientSecret ? (
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <PaymentForm 
                  video={video}
                  clientSecret={clientSecret}
                  onSuccess={handleSuccess}
                  onError={handleError}
                />
              </Elements>
            ) : (
              <div className="text-center py-4">
                <p className="caption">Loading payment form...</p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="button-inline flex-1"
            >
              Cancel
            </button>
          </div>

            {/* Payment Info */}
            <div className="caption text-xs text-center">
              <p>Secure payment processing powered by Stripe</p>
              <p>You'll receive an email confirmation with your purchase details</p>
            </div>
          </div>

          {/* Footer Info */}
          <div className="border-t-4 border-border bg-accent-thin px-4 py-2">
            
          </div>
        </div>
      </div>
    </div>
  )
}
