import { supabase } from '@/lib/supabaseClient'
import CacheService from '@/services/cacheService'

export interface TimeEntry {
  id: string
  user_id: string
  business_id: string
  start_time: string
  end_time?: string
  duration_minutes: number
  description: string
  task_category: string
  hourly_rate: number
  total_earnings: number
  status: 'active' | 'completed' | 'paused'
  created_at: string
  updated_at: string
}

export interface Task {
  id: string
  user_id: string
  business_id: string
  title: string
  description?: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  due_date?: string
  estimated_hours: number
  actual_hours: number
  category: string
  tags: string[]
  assigned_by?: string
  completed_at?: string
  created_at: string
  updated_at: string
}

export interface WorkReport {
  id: string
  user_id: string
  business_id: string
  report_type: 'daily' | 'weekly' | 'monthly' | 'custom'
  report_period_start: string
  report_period_end: string
  total_hours_worked: number
  total_tasks_completed: number
  total_earnings: number
  productivity_score: number
  summary?: string
  detailed_breakdown: any
  generated_at: string
  created_at: string
}

export interface WorkSession {
  id: string
  user_id: string
  business_id: string
  session_type: 'work' | 'break' | 'meeting'
  start_time: string
  end_time?: string
  duration_minutes: number
  description?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ProductivityMetrics {
  id: string
  user_id: string
  business_id: string
  metric_date: string
  total_hours: number
  tasks_completed: number
  tasks_pending: number
  productivity_score: number
  efficiency_rating: number
  notes?: string
  created_at: string
}

export class IndividualUserService {
  // Time Tracking Methods
  static async startTimeEntry(
    userId: string, 
    businessId: string, 
    description: string, 
    taskCategory: string = 'general',
    hourlyRate: number = 0
  ): Promise<{ success: boolean; data?: TimeEntry; error?: string }> {
    try {
      // Stop any active time entries first
      await this.stopActiveTimeEntries(userId)

      const { data, error } = await supabase
        .from('individual_time_entries')
        .insert({
          user_id: userId,
          business_id: businessId,
          start_time: new Date().toISOString(),
          description,
          task_category: taskCategory,
          hourly_rate: hourlyRate,
          status: 'active'
        })
        .select()
        .single()

      if (error) {
        console.error('Error starting time entry:', error)
        return { success: false, error: error.message }
      }

      // Invalidate cache after successful time entry creation
      CacheService.invalidateTimeEntriesCache(userId, businessId)

      return { success: true, data }
    } catch (error) {
      console.error('Error in startTimeEntry:', error)
      return { success: false, error: 'Failed to start time entry' }
    }
  }

  static async stopTimeEntry(entryId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('individual_time_entries')
        .update({
          end_time: new Date().toISOString(),
          status: 'completed'
        })
        .eq('id', entryId)

      if (error) {
        console.error('Error stopping time entry:', error)
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      console.error('Error in stopTimeEntry:', error)
      return { success: false, error: 'Failed to stop time entry' }
    }
  }

  static async stopActiveTimeEntries(userId: string): Promise<void> {
    try {
      await supabase
        .from('individual_time_entries')
        .update({
          end_time: new Date().toISOString(),
          status: 'completed'
        })
        .eq('user_id', userId)
        .eq('status', 'active')
    } catch (error) {
      console.error('Error stopping active time entries:', error)
    }
  }

  static async getTimeEntries(
    userId: string, 
    businessId?: string, 
    limit: number = 50
  ): Promise<TimeEntry[]> {
    try {
      let query = supabase
        .from('individual_time_entries')
        .select('*')
        .eq('user_id', userId)
        .order('start_time', { ascending: false })
        .limit(limit)

      if (businessId) {
        query = query.eq('business_id', businessId)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching time entries:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error in getTimeEntries:', error)
      return []
    }
  }

  // Task Management Methods
  static async createTask(
    userId: string,
    businessId: string,
    title: string,
    description?: string,
    priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium',
    dueDate?: string,
    estimatedHours: number = 0,
    category: string = 'general',
    tags: string[] = []
  ): Promise<{ success: boolean; data?: Task; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('individual_tasks')
        .insert({
          user_id: userId,
          business_id: businessId,
          title,
          description,
          priority,
          due_date: dueDate,
          estimated_hours: estimatedHours,
          category,
          tags
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating task:', error)
        return { success: false, error: error.message }
      }

      // Invalidate cache after successful task creation
      CacheService.invalidateTasksCache(userId, businessId)

      return { success: true, data }
    } catch (error) {
      console.error('Error in createTask:', error)
      return { success: false, error: 'Failed to create task' }
    }
  }

  static async updateTaskStatus(
    taskId: string, 
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled',
    actualHours?: number
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const updateData: any = { status }
      
      if (status === 'completed') {
        updateData.completed_at = new Date().toISOString()
      }
      
      if (actualHours !== undefined) {
        updateData.actual_hours = actualHours
      }

      const { error } = await supabase
        .from('individual_tasks')
        .update(updateData)
        .eq('id', taskId)

      if (error) {
        console.error('Error updating task status:', error)
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      console.error('Error in updateTaskStatus:', error)
      return { success: false, error: 'Failed to update task status' }
    }
  }

  static async getTasks(
    userId: string, 
    businessId?: string, 
    status?: string,
    limit: number = 50
  ): Promise<Task[]> {
    try {
      let query = supabase
        .from('individual_tasks')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (businessId) {
        query = query.eq('business_id', businessId)
      }

      if (status) {
        query = query.eq('status', status)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching tasks:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error in getTasks:', error)
      return []
    }
  }

  // Work Reports Methods
  static async generateWorkReport(
    userId: string,
    businessId: string,
    reportType: 'daily' | 'weekly' | 'monthly' | 'custom',
    periodStart: string,
    periodEnd: string
  ): Promise<{ success: boolean; data?: WorkReport; error?: string }> {
    try {
      // Get time entries for the period
      const timeEntries = await this.getTimeEntries(userId, businessId, 1000)
      const periodTimeEntries = timeEntries.filter(entry => 
        new Date(entry.start_time) >= new Date(periodStart) &&
        new Date(entry.start_time) <= new Date(periodEnd)
      )

      // Get tasks for the period
      const tasks = await this.getTasks(userId, businessId, 'completed', 1000)
      const periodTasks = tasks.filter(task => 
        task.completed_at && 
        new Date(task.completed_at) >= new Date(periodStart) &&
        new Date(task.completed_at) <= new Date(periodEnd)
      )

      // Calculate metrics
      const totalHours = periodTimeEntries.reduce((sum, entry) => sum + entry.duration_minutes, 0) / 60
      const totalEarnings = periodTimeEntries.reduce((sum, entry) => sum + entry.total_earnings, 0)
      const totalTasksCompleted = periodTasks.length
      const productivityScore = Math.min(100, (totalTasksCompleted * 10) + (totalHours * 5))

      const detailedBreakdown = {
        timeEntries: periodTimeEntries.length,
        tasksCompleted: totalTasksCompleted,
        averageHoursPerDay: totalHours / Math.max(1, Math.ceil((new Date(periodEnd).getTime() - new Date(periodStart).getTime()) / (1000 * 60 * 60 * 24))),
        topCategories: this.getTopCategories(periodTimeEntries),
        taskBreakdown: this.getTaskBreakdown(periodTasks)
      }

      const { data, error } = await supabase
        .from('individual_work_reports')
        .insert({
          user_id: userId,
          business_id: businessId,
          report_type: reportType,
          report_period_start: periodStart,
          report_period_end: periodEnd,
          total_hours_worked: totalHours,
          total_tasks_completed: totalTasksCompleted,
          total_earnings: totalEarnings,
          productivity_score: productivityScore,
          summary: `Worked ${totalHours.toFixed(1)} hours, completed ${totalTasksCompleted} tasks, earned UGX ${totalEarnings.toFixed(2)}`,
          detailed_breakdown: detailedBreakdown
        })
        .select()
        .single()

      if (error) {
        console.error('Error generating work report:', error)
        return { success: false, error: error.message }
      }

      return { success: true, data }
    } catch (error) {
      console.error('Error in generateWorkReport:', error)
      return { success: false, error: 'Failed to generate work report' }
    }
  }

  static async getWorkReports(
    userId: string, 
    businessId?: string, 
    limit: number = 20
  ): Promise<WorkReport[]> {
    try {
      let query = supabase
        .from('individual_work_reports')
        .select('*')
        .eq('user_id', userId)
        .order('generated_at', { ascending: false })
        .limit(limit)

      if (businessId) {
        query = query.eq('business_id', businessId)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching work reports:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error in getWorkReports:', error)
      return []
    }
  }

  // Work Session Methods
  static async startWorkSession(
    userId: string,
    businessId: string,
    sessionType: 'work' | 'break' | 'meeting' = 'work',
    description?: string
  ): Promise<{ success: boolean; data?: WorkSession; error?: string }> {
    try {
      // Stop any active sessions first
      await this.stopActiveWorkSessions(userId)

      const { data, error } = await supabase
        .from('individual_work_sessions')
        .insert({
          user_id: userId,
          business_id: businessId,
          session_type: sessionType,
          start_time: new Date().toISOString(),
          description,
          is_active: true
        })
        .select()
        .single()

      if (error) {
        console.error('Error starting work session:', error)
        return { success: false, error: error.message }
      }

      return { success: true, data }
    } catch (error) {
      console.error('Error in startWorkSession:', error)
      return { success: false, error: 'Failed to start work session' }
    }
  }

  static async stopWorkSession(sessionId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('individual_work_sessions')
        .update({
          end_time: new Date().toISOString(),
          is_active: false
        })
        .eq('id', sessionId)

      if (error) {
        console.error('Error stopping work session:', error)
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      console.error('Error in stopWorkSession:', error)
      return { success: false, error: 'Failed to stop work session' }
    }
  }

  static async stopActiveWorkSessions(userId: string): Promise<void> {
    try {
      await supabase
        .from('individual_work_sessions')
        .update({
          end_time: new Date().toISOString(),
          is_active: false
        })
        .eq('user_id', userId)
        .eq('is_active', true)
    } catch (error) {
      console.error('Error stopping active work sessions:', error)
    }
  }

  static async getActiveWorkSession(userId: string): Promise<WorkSession | null> {
    try {
      const { data, error } = await supabase
        .from('individual_work_sessions')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return null // No active session
        }
        console.error('Error fetching active work session:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error in getActiveWorkSession:', error)
      return null
    }
  }

  // Productivity Metrics Methods
  static async getProductivityMetrics(
    userId: string,
    businessId?: string,
    days: number = 30
  ): Promise<ProductivityMetrics[]> {
    try {
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)

      let query = supabase
        .from('individual_productivity_metrics')
        .select('*')
        .eq('user_id', userId)
        .gte('metric_date', startDate.toISOString().split('T')[0])
        .order('metric_date', { ascending: false })

      if (businessId) {
        query = query.eq('business_id', businessId)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching productivity metrics:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error in getProductivityMetrics:', error)
      return []
    }
  }

  // Helper Methods
  private static getTopCategories(timeEntries: TimeEntry[]): any[] {
    const categoryCount: { [key: string]: number } = {}
    timeEntries.forEach(entry => {
      categoryCount[entry.task_category] = (categoryCount[entry.task_category] || 0) + 1
    })
    
    return Object.entries(categoryCount)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
  }

  private static getTaskBreakdown(tasks: Task[]): any {
    const statusCount: { [key: string]: number } = {}
    const priorityCount: { [key: string]: number } = {}
    
    tasks.forEach(task => {
      statusCount[task.status] = (statusCount[task.status] || 0) + 1
      priorityCount[task.priority] = (priorityCount[task.priority] || 0) + 1
    })

    return {
      byStatus: statusCount,
      byPriority: priorityCount
    }
  }

  // Dashboard Stats
  static async getDashboardStats(userId: string): Promise<{
    totalHours: number
    todayHours: number
    thisWeekHours: number
    activeBusinesses: number
    completedTasks: number
  }> {
    try {
      const today = new Date().toISOString().split('T')[0]
      const weekStart = new Date()
      weekStart.setDate(weekStart.getDate() - weekStart.getDay())
      const weekStartStr = weekStart.toISOString().split('T')[0]

      // Get all time entries
      const timeEntries = await this.getTimeEntries(userId, undefined, 1000)
      
      // Get all tasks
      const tasks = await this.getTasks(userId, undefined, 'completed', 1000)
      
      // Get unique businesses
      const businesses = await IndividualBusinessAccessService.getAccessibleBusinesses(userId)

      // Calculate stats
      const totalHours = timeEntries.reduce((sum, entry) => sum + entry.duration_minutes, 0) / 60
      
      const todayHours = timeEntries
        .filter(entry => entry.start_time.startsWith(today))
        .reduce((sum, entry) => sum + entry.duration_minutes, 0) / 60

      const thisWeekHours = timeEntries
        .filter(entry => entry.start_time >= weekStartStr)
        .reduce((sum, entry) => sum + entry.duration_minutes, 0) / 60

      return {
        totalHours: Math.round(totalHours * 10) / 10,
        todayHours: Math.round(todayHours * 10) / 10,
        thisWeekHours: Math.round(thisWeekHours * 10) / 10,
        activeBusinesses: businesses.length,
        completedTasks: tasks.length
      }
    } catch (error) {
      console.error('Error getting dashboard stats:', error)
      return {
        totalHours: 0,
        todayHours: 0,
        thisWeekHours: 0,
        activeBusinesses: 0,
        completedTasks: 0
      }
    }
  }
}

export default IndividualUserService
