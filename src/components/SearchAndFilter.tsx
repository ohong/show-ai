"use client"

interface SearchAndFilterProps {
  search: string
  onSearchChange: (value: string) => void
  showPurchased: boolean
  onShowPurchasedChange: (value: boolean) => void
}

export function SearchAndFilter({ 
  search, 
  onSearchChange, 
  showPurchased, 
  onShowPurchasedChange 
}: SearchAndFilterProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-2 w-full">
      <div className="flex-1">
        <input
          type="text"
          placeholder="Search skills..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="input-field w-full text-xs h-8"
        />
      </div>
      
      <div className="flex items-center gap-1">
        <label className="flex items-center gap-1 cursor-pointer">
          <input
            type="checkbox"
            checked={showPurchased}
            onChange={(e) => onShowPurchasedChange(e.target.checked)}
            className="w-3 h-3 text-accent bg-background border border-border rounded focus:ring-accent"
          />
          <span className="caption text-xs">Purchased</span>
        </label>
      </div>
    </div>
  )
}
