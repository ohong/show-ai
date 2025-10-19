import { NextRequest, NextResponse } from "next/server"
import { auth, currentUser } from "@clerk/nextjs/server"
import { getSupabaseUser, syncClerkUserToSupabase } from "@/lib/clerk-supabase"
import { createServerClient } from "@/lib/supabase"
import { z } from "zod"

const TransactionsQuerySchema = z.object({
  status: z.enum(['all', 'pending', 'completed', 'failed', 'canceled']).optional().default('all'),
  sort: z.enum(['newest', 'oldest', 'amount_high', 'amount_low']).optional().default('newest'),
  limit: z.coerce.number().min(1).max(100).optional().default(50),
  offset: z.coerce.number().min(0).optional().default(0)
})

export async function GET(req: NextRequest) {
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

    // Parse query parameters
    const { searchParams } = new URL(req.url)
    const queryParams = {
      status: searchParams.get('status') || 'all',
      sort: searchParams.get('sort') || 'newest',
      limit: searchParams.get('limit') || '50',
      offset: searchParams.get('offset') || '0'
    }

    const { status, sort, limit, offset } = TransactionsQuerySchema.parse(queryParams)

    const supabase = createServerClient()

    // Build the query
    let query = supabase
      .from("purchases")
      .select(`
        id,
        amount_paid,
        payment_status,
        payment_intent_id,
        created_at,
        updated_at,
        videos!purchases_video_id_fkey (
          id,
          youtube_title,
          file_name,
          youtube_thumbnail_url,
          description,
          users!videos_user_id_fkey (
            first_name,
            last_name
          )
        )
      `)
      .eq("buyer_id", user.id)

    // Apply status filter
    if (status !== 'all') {
      query = query.eq("payment_status", status)
    }

    // Apply sorting
    switch (sort) {
      case 'newest':
        query = query.order("created_at", { ascending: false })
        break
      case 'oldest':
        query = query.order("created_at", { ascending: true })
        break
      case 'amount_high':
        query = query.order("amount_paid", { ascending: false })
        break
      case 'amount_low':
        query = query.order("amount_paid", { ascending: true })
        break
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1)

    const { data: transactions, error } = await query

    if (error) {
      console.error("Failed to fetch transactions:", error)
      return NextResponse.json(
        { error: "Failed to fetch transactions" },
        { status: 500 }
      )
    }

    // Get total count for pagination
    let countQuery = supabase
      .from("purchases")
      .select("*", { count: "exact", head: true })
      .eq("buyer_id", user.id)

    if (status !== 'all') {
      countQuery = countQuery.eq("payment_status", status)
    }

    const { count, error: countError } = await countQuery

    if (countError) {
      console.error("Failed to fetch transaction count:", countError)
      return NextResponse.json(
        { error: "Failed to fetch transaction count" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        transactions: transactions || [],
        pagination: {
          total: count || 0,
          limit,
          offset,
          hasMore: (count || 0) > offset + limit
        },
        filters: {
          status,
          sort
        }
      }
    })

  } catch (error) {
    console.error("Transactions API error:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
