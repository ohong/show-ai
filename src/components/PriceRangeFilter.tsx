"use client"

interface PriceRangeFilterProps {
  value: [number, number]
  onChange: (value: [number, number]) => void
}

export function PriceRangeFilter({ value, onChange }: PriceRangeFilterProps) {
  const handleMinChange = (min: number) => {
    onChange([min, value[1]])
  }

  const handleMaxChange = (max: number) => {
    onChange([value[0], max])
  }

  return (
    <div className="space-y-1">
      <label className="block caption text-xs font-medium">Price</label>
      <div className="flex gap-1">
        <input
          type="number"
          placeholder="Min"
          value={value[0]}
          onChange={(e) => handleMinChange(Number(e.target.value))}
          min="0"
          step="0.01"
          className="input-field flex-1 text-xs h-8"
        />
        <span className="flex items-center text-xs">-</span>
        <input
          type="number"
          placeholder="Max"
          value={value[1]}
          onChange={(e) => handleMaxChange(Number(e.target.value))}
          min="0"
          step="0.01"
          className="input-field flex-1 text-xs h-8"
        />
      </div>
    </div>
  )
}
