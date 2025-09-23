import React, { useState, useEffect } from 'react'
import { Calendar, X, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { format, subDays, subMonths, subYears, startOfDay, endOfDay } from 'date-fns'

export interface DateRange {
  from: Date | undefined
  to: Date | undefined
}

interface DateRangePickerProps {
  onDateRangeChange: (range: DateRange) => void
  initialRange?: DateRange
  maxDate?: Date
  minDate?: Date
  className?: string
  placeholder?: string
  showPresets?: boolean
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({
  onDateRangeChange,
  initialRange,
  maxDate = new Date(),
  minDate,
  className = '',
  placeholder = 'Select date range',
  showPresets = true
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [dateRange, setDateRange] = useState<DateRange>(initialRange || { from: undefined, to: undefined })
  const [tempRange, setTempRange] = useState<DateRange>({ from: undefined, to: undefined })

  // Preset date ranges
  const presets = [
    {
      label: 'Today',
      getValue: () => ({
        from: startOfDay(new Date()),
        to: endOfDay(new Date())
      })
    },
    {
      label: 'Yesterday',
      getValue: () => {
        const yesterday = subDays(new Date(), 1)
        return {
          from: startOfDay(yesterday),
          to: endOfDay(yesterday)
        }
      }
    },
    {
      label: 'Last 7 days',
      getValue: () => ({
        from: startOfDay(subDays(new Date(), 6)),
        to: endOfDay(new Date())
      })
    },
    {
      label: 'Last 30 days',
      getValue: () => ({
        from: startOfDay(subDays(new Date(), 29)),
        to: endOfDay(new Date())
      })
    },
    {
      label: 'Last 90 days',
      getValue: () => ({
        from: startOfDay(subDays(new Date(), 89)),
        to: endOfDay(new Date())
      })
    },
    {
      label: 'This month',
      getValue: () => {
        const now = new Date()
        return {
          from: startOfDay(new Date(now.getFullYear(), now.getMonth(), 1)),
          to: endOfDay(new Date())
        }
      }
    },
    {
      label: 'Last month',
      getValue: () => {
        const now = new Date()
        const lastMonth = subMonths(now, 1)
        return {
          from: startOfDay(new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1)),
          to: endOfDay(new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 0))
        }
      }
    },
    {
      label: 'This year',
      getValue: () => {
        const now = new Date()
        return {
          from: startOfDay(new Date(now.getFullYear(), 0, 1)),
          to: endOfDay(new Date())
        }
      }
    },
    {
      label: 'Last year',
      getValue: () => {
        const now = new Date()
        const lastYear = subYears(now, 1)
        return {
          from: startOfDay(new Date(lastYear.getFullYear(), 0, 1)),
          to: endOfDay(new Date(lastYear.getFullYear(), 11, 31))
        }
      }
    }
  ]

  useEffect(() => {
    if (initialRange) {
      setDateRange(initialRange)
    }
  }, [initialRange])

  const handleDateSelect = (range: DateRange | undefined) => {
    if (range) {
      setTempRange(range)
    }
  }

  const handleApply = () => {
    setDateRange(tempRange)
    onDateRangeChange(tempRange)
    setIsOpen(false)
  }

  const handleClear = () => {
    const clearedRange = { from: undefined, to: undefined }
    setDateRange(clearedRange)
    setTempRange(clearedRange)
    onDateRangeChange(clearedRange)
    setIsOpen(false)
  }

  const handlePresetSelect = (preset: typeof presets[0]) => {
    const range = preset.getValue()
    setTempRange(range)
    setDateRange(range)
    onDateRangeChange(range)
    setIsOpen(false)
  }

  const formatDateRange = () => {
    if (!dateRange.from) return placeholder
    
    if (dateRange.from && dateRange.to) {
      return `${format(dateRange.from, 'MMM dd, yyyy')} - ${format(dateRange.to, 'MMM dd, yyyy')}`
    } else if (dateRange.from) {
      return format(dateRange.from, 'MMM dd, yyyy')
    }
    
    return placeholder
  }

  const isRangeComplete = tempRange.from && tempRange.to

  return (
    <div className={`relative ${className}`}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={`w-full justify-between text-left font-normal ${
              !dateRange.from ? 'text-muted-foreground' : ''
            }`}
          >
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <Calendar className="h-4 w-4 flex-shrink-0" />
              <span className="truncate text-sm">{formatDateRange()}</span>
            </div>
            <ChevronDown className="h-4 w-4 opacity-50 flex-shrink-0" />
          </Button>
        </PopoverTrigger>
        
        <PopoverContent className="w-auto p-0 max-w-sm" align="start">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-3 max-h-96 overflow-y-auto">
              <div className="space-y-3">
                {/* Preset buttons */}
                {showPresets && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-medium text-gray-900">Quick Select</h4>
                    <div className="grid grid-cols-2 gap-1">
                      {presets.map((preset, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          className="text-xs h-7 px-2"
                          onClick={() => handlePresetSelect(preset)}
                        >
                          {preset.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Calendar */}
                <div className="space-y-2">
                  <h4 className="text-xs font-medium text-gray-900">Custom Range</h4>
                  <div className="scale-75 origin-top-left">
                    <CalendarComponent
                      mode="range"
                      selected={tempRange}
                      onSelect={handleDateSelect}
                      numberOfMonths={1}
                      disabled={(date) => {
                        if (minDate && date < minDate) return true
                        if (date > maxDate) return true
                        return false
                      }}
                      className="rounded-md border"
                    />
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center justify-between pt-2 border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClear}
                    className="text-gray-500 hover:text-gray-700 h-7 px-2 text-xs"
                  >
                    <X className="h-3 w-3 mr-1" />
                    Clear
                  </Button>
                  
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsOpen(false)}
                      className="h-7 px-2 text-xs"
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleApply}
                      disabled={!isRangeComplete}
                      className="h-7 px-2 text-xs"
                    >
                      Apply
                    </Button>
                  </div>
                </div>

                {/* Selected range display */}
                {isRangeComplete && (
                  <div className="pt-2 border-t">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs px-2 py-1">
                        {format(tempRange.from!, 'MMM dd')} - {format(tempRange.to!, 'MMM dd')}
                      </Badge>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </PopoverContent>
      </Popover>
    </div>
  )
}

export default DateRangePicker


