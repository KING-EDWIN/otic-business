import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import ProfessionalSidebar from './ProfessionalSidebar'
import { Button } from '@/components/ui/button'
import { 
  Bell, 
  Search, 
  Settings, 
  HelpCircle,
  Menu,
  X
} from 'lucide-react'

const ProfessionalDashboardLayout: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed)
  }

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <ProfessionalSidebar 
          isCollapsed={sidebarCollapsed} 
          onToggle={toggleSidebar} 
        />
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={toggleMobileMenu} />
          <div className="relative flex h-full">
            <ProfessionalSidebar 
              isCollapsed={false} 
              onToggle={toggleMobileMenu} 
            />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 shadow-sm">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Left side */}
              <div className="flex items-center space-x-4">
                {/* Mobile menu button */}
                <Button
                  onClick={toggleMobileMenu}
                  variant="ghost"
                  size="sm"
                  className="md:hidden"
                >
                  <Menu className="h-5 w-5" />
                </Button>

                {/* Desktop sidebar toggle */}
                <Button
                  onClick={toggleSidebar}
                  variant="ghost"
                  size="sm"
                  className="hidden md:block"
                >
                  <Menu className="h-5 w-5" />
                </Button>

                {/* Page title */}
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
                  <p className="text-sm text-gray-500">Welcome back! Here's what's happening with your business.</p>
                </div>
              </div>

              {/* Right side */}
              <div className="flex items-center space-x-4">
                {/* Search */}
                <div className="hidden sm:block">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search..."
                      className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Notifications */}
                <Button variant="ghost" size="sm" className="relative">
                  <Bell className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
                </Button>

                {/* Help */}
                <Button variant="ghost" size="sm">
                  <HelpCircle className="h-5 w-5" />
                </Button>

                {/* Settings */}
                <Button variant="ghost" size="sm">
                  <Settings className="h-5 w-5" />
                </Button>

                {/* User Profile */}
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-white">U</span>
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-sm font-medium text-gray-900">User Name</p>
                    <p className="text-xs text-gray-500">user@example.com</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="p-4 sm:p-6 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default ProfessionalDashboardLayout
