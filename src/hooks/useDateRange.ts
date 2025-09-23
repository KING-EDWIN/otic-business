import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabaseClient'
import { DateRange } from '@/components/DateRangePicker'

export const useDateRange = (defaultRange?: DateRange) => {
  const { user } = useAuth()
  const [dateRange, setDateRange] = useState<DateRange>(defaultRange || { from: undefined, to: undefined })
  const [accountCreatedAt, setAccountCreatedAt] = useState<Date | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAccountCreationDate = async () => {
      if (!user?.id) {
        setLoading(false)
        return
      }

      try {
        // Get user profile to find account creation date
        const { data: profile, error } = await supabase
          .from('user_profiles')
          .select('created_at')
          .eq('id', user.id)
          .single()

        if (error) {
          console.error('Error fetching user profile:', error)
          // Fallback to user creation date from auth
          if (user.created_at) {
            setAccountCreatedAt(new Date(user.created_at))
          }
        } else if (profile?.created_at) {
          setAccountCreatedAt(new Date(profile.created_at))
        }

        // Set default date range if not provided
        if (!defaultRange) {
          const endDate = new Date()
          const startDate = new Date()
          startDate.setDate(endDate.getDate() - 30) // Default to last 30 days
          
          setDateRange({
            from: startDate,
            to: endDate
          })
        }
      } catch (error) {
        console.error('Error in useDateRange:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAccountCreationDate()
  }, [user?.id, defaultRange])

  const updateDateRange = (newRange: DateRange) => {
    setDateRange(newRange)
  }

  const getMinDate = () => {
    return accountCreatedAt || new Date('2020-01-01') // Fallback to 2020 if no account date
  }

  const getMaxDate = () => {
    return new Date()
  }

  const getDateRangeString = () => {
    if (!dateRange.from || !dateRange.to) return ''
    
    const formatDate = (date: Date) => {
      return date.toISOString().split('T')[0]
    }
    
    return {
      startDate: formatDate(dateRange.from),
      endDate: formatDate(dateRange.to)
    }
  }

  return {
    dateRange,
    updateDateRange,
    accountCreatedAt,
    minDate: getMinDate(),
    maxDate: getMaxDate(),
    dateRangeString: getDateRangeString(),
    loading
  }
}


