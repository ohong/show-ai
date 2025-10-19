"use client"

type SortOption = "newest" | "oldest" | "price_low" | "price_high" | "popular"

interface SortOptionsProps {
  value: SortOption
  onChange: (value: SortOption) => void
}

const sortOptions = [
  { value: "newest" as const, label: "Newest First" },
  { value: "oldest" as const, label: "Oldest First" },
  { value: "price_low" as const, label: "Price: Low to High" },
  { value: "price_high" as const, label: "Price: High to Low" },
  { value: "popular" as const, label: "Most Popular" },
]

export function SortOptions({ value, onChange }: SortOptionsProps) {
  return (
    <div className="space-y-1">
      <label className="block caption text-xs font-medium">Sort</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as SortOption)}
        className="input-field w-full text-xs h-8"
      >
        {sortOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}
