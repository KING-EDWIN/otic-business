import React from 'react'
import { useNavigate } from 'react-router-dom'
import InvoiceManager from '@/components/InvoiceManager'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

const Invoices: React.FC = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/accounting')}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Accounting</span>
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Invoice Management
                </h1>
                <p className="text-sm text-gray-500">
                  Create, manage, and track your invoices
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <InvoiceManager />
      </div>
    </div>
  )
}

export default Invoices

