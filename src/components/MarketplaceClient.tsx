"use client"

import { useState, useMemo } from "react"
import { VideoCard } from "@/components/VideoCard"
import { MarketplaceVideoCard } from "@/components/MarketplaceVideoCard"
import { SearchAndFilter } from "@/components/SearchAndFilter"
import { SortOptions } from "@/components/SortOptions"
import { PriceRangeFilter } from "@/components/PriceRangeFilter"

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

type SortOption = "newest" | "oldest" | "price_low" | "price_high" | "popular"

type FilterState = {
  search: string
  sort: SortOption
  priceRange: [number, number]
  showPurchased: boolean
}

interface MarketplaceClientProps {
  videos: MarketplaceVideo[]
}

export function MarketplaceClient({ videos }: MarketplaceClientProps) {
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    sort: "newest",
    priceRange: [0, 1000],
    showPurchased: false,
  })

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  // Filter and sort videos
  const filteredVideos = useMemo(() => {
    let filtered = videos.filter((video) => {
      // Search filter
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase()
        const title = (video.youtube_title || video.file_name || "").toLowerCase()
        const description = (video.description || "").toLowerCase()
        const creator = `${video.user_first_name || ""} ${video.user_last_name || ""}`.toLowerCase()
        
        if (!title.includes(searchTerm) && 
            !description.includes(searchTerm) && 
            !creator.includes(searchTerm)) {
          return false
        }
      }

      // Price range filter
      if (video.price_per_access < filters.priceRange[0] || 
          video.price_per_access > filters.priceRange[1]) {
        return false
      }

      // Show purchased filter
      if (!filters.showPurchased && video.is_purchased) {
        return false
      }

      return true
    })

    // Sort videos
    filtered.sort((a, b) => {
      switch (filters.sort) {
        case "newest":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case "oldest":
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        case "price_low":
          return a.price_per_access - b.price_per_access
        case "price_high":
          return b.price_per_access - a.price_per_access
        case "popular":
          // For now, sort by creation date (could be enhanced with view counts)
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        default:
          return 0
      }
    })

    return filtered
  }, [videos, filters])

  const updateFilter = (key: keyof FilterState, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters({
      search: "",
      sort: "newest",
      priceRange: [0, 1000],
      showPurchased: false,
    })
  }


  return (
    <div className="space-y-3">

      {/* Filters and Search */}
      <div className="space-y-2">
        <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center justify-between">
          <SearchAndFilter
            search={filters.search}
            onSearchChange={(value) => updateFilter("search", value)}
            showPurchased={filters.showPurchased}
            onShowPurchasedChange={(value) => updateFilter("showPurchased", value)}
          />
          
          <div className="flex gap-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`px-2 py-1 text-xs border ${
                viewMode === "grid" 
                  ? "border-accent bg-accent-thin" 
                  : "border-border hover:border-accent"
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`px-2 py-1 text-xs border ${
                viewMode === "list" 
                  ? "border-accent bg-accent-thin" 
                  : "border-border hover:border-accent"
              }`}
            >
              List
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <SortOptions
            value={filters.sort}
            onChange={(value) => updateFilter("sort", value)}
          />
          
          <PriceRangeFilter
            value={filters.priceRange}
            onChange={(value) => updateFilter("priceRange", value)}
          />
          
          <div className="flex items-end">
            <button
              onClick={clearFilters}
              className="button-inline w-full text-xs h-8"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="caption text-sm">
            {filteredVideos.length} of {videos.length} skills
          </p>
        </div>

        {filteredVideos.length === 0 ? (
          <div className="accent-block text-center py-8">
            <p className="font-mono mb-1">No skills found</p>
            <p className="caption text-sm">
              {filters.search || filters.priceRange[0] > 0 || filters.priceRange[1] < 1000
                ? "Try adjusting your filters."
                : "No monetized skills available yet."}
            </p>
          </div>
        ) : (
          <div className={
            viewMode === "grid" 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
              : "space-y-3"
          }>
            {filteredVideos.map((video) => (
              <MarketplaceVideoCard
                key={video.id}
                video={video}
                viewMode={viewMode}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
