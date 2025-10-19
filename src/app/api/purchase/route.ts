import { NextRequest, NextResponse } from "next/server"
import { auth, currentUser } from "@clerk/nextjs/server"
import { getSupabaseUser, syncClerkUserToSupabase } from "@/lib/clerk-supabase"
import { createServerClient } from "@/lib/supabase"
import { stripe } from "@/lib/stripe"
import { z } from "zod"

const PurchaseSchema = z.object({
  videoId: z.string().uuid("Invalid video ID"),
  amount: z.number().positive("Amount must be positive"),
})

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    // Get or create user in Supabase
    let user = await getSupabaseUser()
    if (!user) {
      const clerk = await currentUser()
      if (!clerk) {
        return NextResponse.json(
          { error: "User not found" },
          { status: 404 }
        )
      }
      user = await syncClerkUserToSupabase(clerk)
      if (!user) {
        return NextResponse.json(
          { error: "Failed to sync user" },
          { status: 500 }
        )
      }
    }

    // Parse and validate request body
    let body
    try {
      body = await req.json()
    } catch (error) {
      console.error("Failed to parse request body:", error)
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      )
    }

    const { videoId, amount } = PurchaseSchema.parse(body)

    const supabase = createServerClient()

    // Check if video exists and is monetized
    const { data: video, error: videoError } = await supabase
      .from("videos")
      .select("id, user_id, is_monetized, price_per_access, youtube_title, file_name")
      .eq("id", videoId)
      .eq("is_monetized", true)
      .single()

    if (videoError || !video) {
      return NextResponse.json(
        { error: "Video not found or not available for purchase" },
        { status: 404 }
      )
    }

    // Verify price matches
    if (Math.abs(video.price_per_access - amount) > 0.01) {
      return NextResponse.json(
        { error: "Price mismatch" },
        { status: 400 }
      )
    }

    // Check if user already purchased this video
    const { data: existingPurchase } = await supabase
      .from("purchases")
      .select("id, payment_status")
      .eq("buyer_id", user.id)
      .eq("video_id", videoId)
      .single()

    if (existingPurchase) {
      if (existingPurchase.payment_status === "completed") {
        return NextResponse.json(
          { error: "Video already purchased" },
          { status: 400 }
        )
      } else if (existingPurchase.payment_status === "pending") {
        // Return the existing payment intent
        const { data: existingVideo } = await supabase
          .from("purchases")
          .select("payment_intent_id, amount_paid")
          .eq("id", existingPurchase.id)
          .single()
        
        if (existingVideo?.payment_intent_id) {
          // Retrieve the existing payment intent from Stripe
          const paymentIntent = await stripe.paymentIntents.retrieve(existingVideo.payment_intent_id)
          return NextResponse.json({
            success: true,
            clientSecret: paymentIntent.client_secret,
            purchase: {
              id: existingPurchase.id,
              videoId: videoId,
              amount: existingVideo.amount_paid,
              status: existingPurchase.payment_status,
            },
          })
        }
      }
    }

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'usd',
      metadata: {
        videoId,
        buyerId: user.id,
        videoTitle: video.youtube_title || video.file_name || 'Untitled Skill',
      },
      automatic_payment_methods: {
        enabled: true,
      },
    })

    // Create pending purchase record
    const { data: purchase, error: purchaseError } = await supabase
      .from("purchases")
      .insert({
        buyer_id: user.id,
        video_id: videoId,
        amount_paid: amount,
        payment_status: "pending",
        payment_intent_id: paymentIntent.id,
      })
      .select()
      .single()

    if (purchaseError) {
      console.error("Failed to create purchase:", purchaseError)
      return NextResponse.json(
        { error: "Failed to process purchase" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      purchase: {
        id: purchase.id,
        videoId: purchase.video_id,
        amount: purchase.amount_paid,
        status: purchase.payment_status,
        createdAt: purchase.created_at,
      },
    })

  } catch (error) {
    console.error("Purchase error:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
