import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { BarChart3, TrendingUp, FileText, ChevronDown, Brain } from 'lucide-react'

const AnalyticsReportsDropdown = () => {
  const navigate = useNavigate()

  const handleNavigation = (path: string) => {
    navigate(path)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-gray-700 hover:text-white hover:bg-gradient-to-r hover:from-[#040458] hover:to-[#faa51a] transition-all duration-300 rounded-lg px-3 py-2 font-medium"
        >
          <BarChart3 className="h-4 w-4 mr-2" />
          <span>Analytics & Reports</span>
          <ChevronDown className="h-4 w-4 ml-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="start">
        <DropdownMenuLabel className="text-xs font-semibold text-gray-500 px-2 py-1.5">
          ANALYTICS
        </DropdownMenuLabel>
        <DropdownMenuItem 
          onClick={() => handleNavigation('/analytics')}
          className="cursor-pointer"
        >
          <BarChart3 className="mr-2 h-4 w-4" />
          <span>Analytics Dashboard</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleNavigation('/ai-insights')}
          className="cursor-pointer"
        >
          <Brain className="mr-2 h-4 w-4" />
          <span>AI Insights</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-xs font-semibold text-gray-500 px-2 py-1.5">
          REPORTS
        </DropdownMenuLabel>
        <DropdownMenuItem 
          onClick={() => handleNavigation('/reports')}
          className="cursor-pointer"
        >
          <FileText className="mr-2 h-4 w-4" />
          <span>Business Reports</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleNavigation('/analytics')}
          className="cursor-pointer"
        >
          <TrendingUp className="mr-2 h-4 w-4" />
          <span>Sales Trends</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default AnalyticsReportsDropdown
