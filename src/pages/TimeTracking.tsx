import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { IndividualUserService, TimeEntry, WorkSession } from '@/services/individualUserService'
import { IndividualBusinessAccessService, BusinessAccess } from '@/services/individualBusinessAccessService'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft,
  Timer,
  Play,
  Pause,
  Square,
  Clock,
  DollarSign,
  Building2,
  Calendar,
  TrendingUp,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { toast } from 'sonner'
import LoadingSpinner from '@/components/LoadingSpinner'
import IndividualBusinessSwitcher from '@/components/IndividualBusinessSwitcher'

const TimeTracking: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [selectedBusiness, setSelectedBusiness] = useState<BusinessAccess | null>(null)
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([])
  const [activeSession, setActiveSession] = useState<WorkSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [isTracking, setIsTracking] = useState(false)
  
  // Form state
  const [description, setDescription] = useState('')
  const [taskCategory, setTaskCategory] = useState('general')
  const [hourlyRate, setHourlyRate] = useState(0)

  useEffect(() => {
    if (user?.id) {
      loadData()
    }
  }, [user?.id])

  const loadData = async () => {
    if (!user?.id) return

    try {
      setLoading(true)
      
      // Load accessible businesses
      const businesses = await IndividualBusinessAccessService.getAccessibleBusinesses(user.id)
      if (businesses.length > 0) {
        setSelectedBusiness(businesses[0])
      }

      // Load time entries
      const entries = await IndividualUserService.getTimeEntries(user.id, undefined, 50)
      setTimeEntries(entries)

      // Check for active session
      const session = await IndividualUserService.getActiveWorkSession(user.id)
      setActiveSession(session)
      setIsTracking(!!session)

    } catch (error) {
      console.error('Error loading time tracking data:', error)
      toast.error('Failed to load time tracking data')
    } finally {
      setLoading(false)
    }
  }

  const handleBusinessSelect = (business: BusinessAccess) => {
    setSelectedBusiness(business)
  }

  const startTracking = async () => {
    if (!user?.id || !selectedBusiness || !description.trim()) {
      toast.error('Please select a business and enter a description')
      return
    }

    try {
      const result = await IndividualUserService.startTimeEntry(
        user.id,
        selectedBusiness.business_id,
        description,
        taskCategory,
        hourlyRate
      )

      if (result.success) {
        toast.success('Time tracking started!')
        setIsTracking(true)
        setDescription('')
        loadData() // Reload data to show new entry
      } else {
        toast.error(result.error || 'Failed to start tracking')
      }
    } catch (error) {
      console.error('Error starting time tracking:', error)
      toast.error('Failed to start time tracking')
    }
  }

  const stopTracking = async () => {
    if (!activeSession) return

    try {
      const result = await IndividualUserService.stopWorkSession(activeSession.id)
      
      if (result.success) {
        toast.success('Time tracking stopped!')
        setIsTracking(false)
        setActiveSession(null)
        loadData() // Reload data to show updated entry
      } else {
        toast.error(result.error || 'Failed to stop tracking')
      }
    } catch (error) {
      console.error('Error stopping time tracking:', error)
      toast.error('Failed to stop time tracking')
    }
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = Math.floor(minutes % 60)
    return `${hours}h ${mins}m`
  }

  const formatCurrency = (amount: number) => {
    return `UGX ${amount.toFixed(2)}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'pos': 'bg-blue-100 text-blue-800',
      'inventory': 'bg-green-100 text-green-800',
      'accounting': 'bg-purple-100 text-purple-800',
      'customers': 'bg-orange-100 text-orange-800',
      'general': 'bg-gray-100 text-gray-800'
    }
    return colors[category] || colors['general']
  }

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'active': 'bg-green-100 text-green-800',
      'completed': 'bg-blue-100 text-blue-800',
      'paused': 'bg-yellow-100 text-yellow-800'
    }
    return colors[status] || colors['completed']
  }

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/individual-dashboard')}
                className="text-[#040458] border-[#faa51a] hover:bg-[#faa51a] hover:text-white"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-[#040458] to-[#1e1e6b] rounded-xl shadow-lg">
                  <Timer className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-[#040458]">Time Tracking</h1>
                  <p className="text-sm text-gray-600">Track your work hours</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <IndividualBusinessSwitcher onBusinessSelect={handleBusinessSelect} />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Current Session */}
        {activeSession && (
          <Card className="mb-8 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-green-100 rounded-full">
                    <Play className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-green-900">Currently Tracking</h3>
                    <p className="text-green-700">
                      Started at {formatDate(activeSession.start_time)}
                    </p>
                    <p className="text-sm text-green-600">
                      {activeSession.description || 'No description provided'}
                    </p>
                  </div>
                </div>
                <Button
                  onClick={stopTracking}
                  className="bg-red-500 hover:bg-red-600 text-white"
                >
                  <Square className="h-4 w-4 mr-2" />
                  Stop Tracking
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Time Tracking Controls */}
        {!isTracking && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Play className="h-5 w-5" />
                <span>Start Time Tracking</span>
              </CardTitle>
              <CardDescription>
                Begin tracking your work time for {selectedBusiness?.business_name || 'selected business'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="description">What are you working on?</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe your current task or activity..."
                    rows={3}
                  />
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Task Category</Label>
                    <Select value={taskCategory} onValueChange={setTaskCategory}>
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General Work</SelectItem>
                        <SelectItem value="pos">POS Operations</SelectItem>
                        <SelectItem value="inventory">Inventory Management</SelectItem>
                        <SelectItem value="accounting">Accounting Tasks</SelectItem>
                        <SelectItem value="customers">Customer Service</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="hourlyRate">Hourly Rate (UGX)</Label>
                    <Input
                      id="hourlyRate"
                      type="number"
                      value={hourlyRate}
                      onChange={(e) => setHourlyRate(Number(e.target.value))}
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>
              
              <Button
                onClick={startTracking}
                disabled={!selectedBusiness || !description.trim()}
                className="w-full bg-[#040458] hover:bg-[#030345] text-white"
              >
                <Play className="h-4 w-4 mr-2" />
                Start Tracking Time
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Recent Time Entries */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Recent Time Entries</span>
            </CardTitle>
            <CardDescription>
              Your recent work sessions and time tracking history
            </CardDescription>
          </CardHeader>
          <CardContent>
            {timeEntries.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No time entries yet</p>
                <p className="text-sm text-gray-500 mt-2">
                  Start tracking your time to see entries here
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {timeEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="font-medium text-gray-900">{entry.description}</h4>
                          <Badge className={getCategoryColor(entry.task_category)}>
                            {entry.task_category}
                          </Badge>
                          <Badge className={getStatusColor(entry.status)}>
                            {entry.status}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>{formatDate(entry.start_time)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{formatDuration(entry.duration_minutes)}</span>
                          </div>
                          {entry.total_earnings > 0 && (
                            <div className="flex items-center space-x-1">
                              <DollarSign className="h-3 w-3" />
                              <span>{formatCurrency(entry.total_earnings)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-lg font-semibold text-[#040458]">
                          {formatDuration(entry.duration_minutes)}
                        </div>
                        {entry.total_earnings > 0 && (
                          <div className="text-sm text-green-600">
                            {formatCurrency(entry.total_earnings)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

export default TimeTracking
