import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  FileText, 
  Users, 
  BarChart3, 
  Calculator, 
  Settings, 
  Building2, 
  CreditCard, 
  Receipt, 
  TrendingUp, 
  PieChart, 
  Activity, 
  Banknote,
  Target,
  Zap,
  HelpCircle,
  Bell,
  Search,
  Menu,
  X
} from 'lucide-react'

interface ProfessionalSidebarProps {
  isCollapsed: boolean
  onToggle: () => void
}

const ProfessionalSidebar: React.FC<ProfessionalSidebarProps> = ({ isCollapsed, onToggle }) => {
  const location = useLocation()

  const navigationItems = [
    {
      title: 'Dashboard',
      icon: LayoutDashboard,
      path: '/dashboard',
      badge: null
    },
    {
      title: 'Point of Sale',
      icon: ShoppingCart,
      path: '/pos',
      badge: null
    },
    {
      title: 'Inventory',
      icon: Package,
      path: '/inventory',
      badge: null
    },
    {
      title: 'Accounting',
      icon: Calculator,
      path: '/accounting',
      badge: 'QuickBooks'
    },
    {
      title: 'Invoices',
      icon: FileText,
      path: '/invoices',
      badge: null
    },
    {
      title: 'Customers',
      icon: Users,
      path: '/customers',
      badge: null
    },
    {
      title: 'Reports',
      icon: BarChart3,
      path: '/reports',
      badge: null
    },
    {
      title: 'Banking',
      icon: CreditCard,
      path: '/banking',
      badge: null
    },
    {
      title: 'Expenses',
      icon: Receipt,
      path: '/expenses',
      badge: null
    },
    {
      title: 'Taxes & EFRIS',
      icon: Building2,
      path: '/taxes',
      badge: 'Uganda'
    },
    {
      title: 'Analytics',
      icon: TrendingUp,
      path: '/analytics',
      badge: 'AI'
    },
    {
      title: 'Settings',
      icon: Settings,
      path: '/settings',
      badge: null
    }
  ]

  const quickActions = [
    {
      title: 'Create Invoice',
      icon: FileText,
      action: () => console.log('Create Invoice')
    },
    {
      title: 'Add Product',
      icon: Package,
      action: () => console.log('Add Product')
    },
    {
      title: 'New Sale',
      icon: ShoppingCart,
      action: () => console.log('New Sale')
    },
    {
      title: 'Generate Report',
      icon: BarChart3,
      action: () => console.log('Generate Report')
    }
  ]

  return (
    <div className={`bg-gray-900 text-white transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'} h-screen flex flex-col`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold">Otic Vision</h1>
                <p className="text-xs text-gray-400">SME Solution</p>
              </div>
            </div>
          )}
          <Button
            onClick={onToggle}
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white hover:bg-gray-800"
          >
            {isCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Search */}
      {!isCollapsed && (
        <div className="p-4 border-b border-gray-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigationItems.map((item, index) => {
          const isActive = location.pathname === item.path
          const Icon = item.icon

          return (
            <Link
              key={index}
              to={item.path}
              className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {!isCollapsed && (
                <>
                  <span className="text-sm font-medium">{item.title}</span>
                  {item.badge && (
                    <Badge variant="secondary" className="ml-auto text-xs">
                      {item.badge}
                    </Badge>
                  )}
                </>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Quick Actions */}
      {!isCollapsed && (
        <div className="p-4 border-t border-gray-700">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Quick Actions
          </h3>
          <div className="space-y-2">
            {quickActions.map((action, index) => {
              const Icon = action.icon
              return (
                <Button
                  key={index}
                  onClick={action.action}
                  variant="ghost"
                  className="w-full justify-start text-gray-300 hover:bg-gray-800 hover:text-white"
                >
                  <Icon className="h-4 w-4 mr-3" />
                  <span className="text-sm">{action.title}</span>
                </Button>
              )
            })}
          </div>
        </div>
      )}

      {/* User Profile */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium">U</span>
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">User Name</p>
              <p className="text-xs text-gray-400 truncate">user@example.com</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProfessionalSidebar

