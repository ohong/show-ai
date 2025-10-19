import { NextRequest, NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { createServerClient } from "@/lib/supabase"
import Stripe from "stripe"

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get("stripe-signature")

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    )
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    )
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch (err) {
    console.error("Webhook signature verification failed:", err)
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    )
  }

  const supabase = createServerClient()

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        
        // Update purchase status to completed
        const { error } = await supabase
          .from("purchases")
          .update({ payment_status: "completed" })
          .eq("payment_intent_id", paymentIntent.id)

        if (error) {
          console.error("Failed to update purchase status:", error)
          return NextResponse.json(
            { error: "Failed to update purchase status" },
            { status: 500 }
          )
        }

        console.log(`Payment succeeded for intent ${paymentIntent.id}`)
        break
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        
        // Update purchase status to failed
        const { error } = await supabase
          .from("purchases")
          .update({ payment_status: "failed" })
          .eq("payment_intent_id", paymentIntent.id)

        if (error) {
          console.error("Failed to update purchase status:", error)
          return NextResponse.json(
            { error: "Failed to update purchase status" },
            { status: 500 }
          )
        }

        console.log(`Payment failed for intent ${paymentIntent.id}`)
        break
      }

      case "payment_intent.canceled": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        
        // Update purchase status to canceled
        const { error } = await supabase
          .from("purchases")
          .update({ payment_status: "canceled" })
          .eq("payment_intent_id", paymentIntent.id)

        if (error) {
          console.error("Failed to update purchase status:", error)
          return NextResponse.json(
            { error: "Failed to update purchase status" },
            { status: 500 }
          )
        }

        console.log(`Payment canceled for intent ${paymentIntent.id}`)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Webhook handler error:", error)
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    )
  }
}
