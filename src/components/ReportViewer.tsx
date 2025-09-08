import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Download, 
  Eye, 
  FileText, 
  BarChart3, 
  PieChart, 
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Building2,
  Users,
  Package,
  CreditCard,
  Receipt,
  Calculator,
  Target,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'
import { professionalReportService, ReportOptions } from '@/services/professionalReportService'

interface ReportViewerProps {
  reportType: 'profit-loss' | 'balance-sheet' | 'cash-flow' | 'efris'
  dateRange: { start: string; end: string }
  onClose: () => void
}

const ReportViewer: React.FC<ReportViewerProps> = ({ reportType, dateRange, onClose }) => {
  const [reportData, setReportData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadReport()
  }, [reportType, dateRange])

  const loadReport = async () => {
    try {
      setLoading(true)
      setError(null)

      const options: ReportOptions = {
        startDate: dateRange.start,
        endDate: dateRange.end,
        format: 'pdf',
        includeCharts: true,
        includeDetails: true
      }

      let data
      switch (reportType) {
        case 'profit-loss':
          data = await professionalReportService.generateProfitLossReport(options)
          break
        case 'balance-sheet':
          data = await professionalReportService.generateBalanceSheetReport(options)
          break
        case 'cash-flow':
          data = await professionalReportService.generateCashFlowReport(options)
          break
        case 'efris':
          data = await professionalReportService.generateEFRISReport(options)
          break
      }

      setReportData(data)
    } catch (err) {
      console.error('Error loading report:', err)
      setError(err instanceof Error ? err.message : 'Failed to load report')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount)
  }

  const downloadReport = async () => {
    try {
      const options: ReportOptions = {
        startDate: dateRange.start,
        endDate: dateRange.end,
        format: 'pdf',
        includeCharts: true,
        includeDetails: true
      }

      let data
      switch (reportType) {
        case 'profit-loss':
          data = await professionalReportService.generateProfitLossReport(options)
          break
        case 'balance-sheet':
          data = await professionalReportService.generateBalanceSheetReport(options)
          break
        case 'cash-flow':
          data = await professionalReportService.generateCashFlowReport(options)
          break
        case 'efris':
          data = await professionalReportService.generateEFRISReport(options)
          break
      }

      // Generate PDF
      const { generatePDF } = await import('@/utils/pdfGenerator')
      generatePDF({
        title: getReportTitle(),
        companyName: data.companyInfo?.name || 'Company Name',
        period: `${dateRange.start} to ${dateRange.end}`,
        data: data,
        generatedAt: new Date().toISOString()
      })
    } catch (error) {
      console.error('Error downloading report:', error)
      alert('Error downloading report. Please try again.')
    }
  }

  const getReportTitle = () => {
    switch (reportType) {
      case 'profit-loss': return 'Profit & Loss Statement'
      case 'balance-sheet': return 'Balance Sheet'
      case 'cash-flow': return 'Cash Flow Statement'
      case 'efris': return 'EFRIS Tax Report'
      default: return 'Financial Report'
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Generating report...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <div className="flex space-x-3">
              <Button onClick={loadReport} className="bg-blue-600 hover:bg-blue-700">
                Retry
              </Button>
              <Button onClick={onClose} variant="outline">
                Close
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!reportData) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <p className="text-gray-600">No data available</p>
            <Button onClick={onClose} className="mt-4">Close</Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{getReportTitle()}</h2>
            <p className="text-gray-600">{reportData.companyInfo?.name} • {dateRange.start} to {dateRange.end}</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button onClick={downloadReport} className="bg-blue-600 hover:bg-blue-700">
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
            <Button onClick={onClose} variant="outline">
              Close
            </Button>
          </div>
        </div>

        {/* Report Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {reportType === 'profit-loss' && (
            <div className="space-y-6">
              {/* Company Info */}
              <div className="text-center p-6 bg-gray-50 rounded-lg">
                <h3 className="text-xl font-bold text-gray-900">{reportData.companyInfo.name}</h3>
                <p className="text-gray-600">{reportData.companyInfo.address}</p>
                <p className="text-gray-600">{reportData.companyInfo.phone} • {reportData.companyInfo.email}</p>
                <p className="text-sm text-gray-500 mt-2">Period: {reportData.companyInfo.period}</p>
              </div>

              {/* Revenue Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-green-800">REVENUE</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                      <span className="font-medium text-green-800">Total Revenue</span>
                      <span className="text-2xl font-bold text-green-900">{formatCurrency(reportData.revenue.total)}</span>
                    </div>
                    <div className="space-y-2">
                      {reportData.revenue.breakdown.map((item: any, index: number) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                          <span className="text-gray-700">{item.account}</span>
                          <div className="text-right">
                            <span className="font-medium text-gray-900">{formatCurrency(item.amount)}</span>
                            <span className="text-sm text-gray-500 ml-2">({item.percentage.toFixed(1)}%)</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Expenses Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-red-800">EXPENSES</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-4 bg-red-50 rounded-lg">
                      <span className="font-medium text-red-800">Total Expenses</span>
                      <span className="text-2xl font-bold text-red-900">{formatCurrency(reportData.expenses.total)}</span>
                    </div>
                    <div className="space-y-2">
                      {reportData.expenses.breakdown.map((item: any, index: number) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                          <span className="text-gray-700">{item.account}</span>
                          <div className="text-right">
                            <span className="font-medium text-gray-900">{formatCurrency(item.amount)}</span>
                            <span className="text-sm text-gray-500 ml-2">({item.percentage.toFixed(1)}%)</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Taxes Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-blue-800">TAXES</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-blue-800">VAT Collected (18%)</span>
                        <span className="font-bold text-blue-900">{formatCurrency(reportData.taxes.vatCollected)}</span>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-blue-800">VAT Paid</span>
                        <span className="font-bold text-blue-900">{formatCurrency(reportData.taxes.vatPaid)}</span>
                      </div>
                      <div className="flex justify-between items-center border-t border-blue-200 pt-2">
                        <span className="text-blue-800 font-medium">Net VAT Payable</span>
                        <span className="font-bold text-blue-900">{formatCurrency(reportData.taxes.netVat)}</span>
                      </div>
                    </div>
                    <div className="p-4 bg-orange-50 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-orange-800">Income Tax (30%)</span>
                        <span className="font-bold text-orange-900">{formatCurrency(reportData.taxes.incomeTax)}</span>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-orange-800">Withholding Tax (6%)</span>
                        <span className="font-bold text-orange-900">{formatCurrency(reportData.taxes.withholdingTax)}</span>
                      </div>
                      <div className="flex justify-between items-center border-t border-orange-200 pt-2">
                        <span className="text-orange-800 font-medium">Total Tax</span>
                        <span className="font-bold text-orange-900">{formatCurrency(reportData.taxes.totalTax)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Summary Section */}
              <Card className="border-2 border-blue-200">
                <CardHeader>
                  <CardTitle className="text-blue-800">SUMMARY</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                      <span className="text-blue-800 font-medium">Gross Profit</span>
                      <span className="text-2xl font-bold text-blue-900">{formatCurrency(reportData.summary.grossProfit)}</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                      <span className="text-blue-800 font-medium">Operating Income</span>
                      <span className="text-2xl font-bold text-blue-900">{formatCurrency(reportData.summary.operatingIncome)}</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-blue-100 rounded-lg border-2 border-blue-300">
                      <span className="text-blue-800 font-bold text-lg">NET INCOME</span>
                      <span className="text-3xl font-bold text-blue-900">{formatCurrency(reportData.summary.netIncome)}</span>
                    </div>
                    <div className="text-center">
                      <span className="text-sm text-gray-600">Profit Margin: {reportData.summary.margin.toFixed(1)}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {reportType === 'balance-sheet' && (
            <div className="space-y-6">
              {/* Company Info */}
              <div className="text-center p-6 bg-gray-50 rounded-lg">
                <h3 className="text-xl font-bold text-gray-900">{reportData.companyInfo.name}</h3>
                <p className="text-gray-600">{reportData.companyInfo.address}</p>
                <p className="text-gray-600">{reportData.companyInfo.phone} • {reportData.companyInfo.email}</p>
                <p className="text-sm text-gray-500 mt-2">As of: {reportData.companyInfo.asOfDate}</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Assets */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-green-800">ASSETS</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-green-700 mb-2">Current Assets</h4>
                        <div className="space-y-2">
                          {reportData.assets.current.map((item: any, index: number) => (
                            <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                              <span className="text-gray-700">{item.account}</span>
                              <span className="font-medium text-gray-900">{formatCurrency(item.amount)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium text-green-700 mb-2">Fixed Assets</h4>
                        <div className="space-y-2">
                          {reportData.assets.fixed.map((item: any, index: number) => (
                            <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                              <span className="text-gray-700">{item.account}</span>
                              <span className="font-medium text-gray-900">{formatCurrency(item.amount)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="flex justify-between items-center p-4 bg-green-100 rounded-lg border-2 border-green-300">
                        <span className="font-bold text-green-800">TOTAL ASSETS</span>
                        <span className="text-2xl font-bold text-green-900">{formatCurrency(reportData.assets.total)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Liabilities & Equity */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-red-800">LIABILITIES & EQUITY</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-red-700 mb-2">Current Liabilities</h4>
                        <div className="space-y-2">
                          {reportData.liabilities.current.map((item: any, index: number) => (
                            <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                              <span className="text-gray-700">{item.account}</span>
                              <span className="font-medium text-gray-900">{formatCurrency(item.amount)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium text-red-700 mb-2">Long-term Liabilities</h4>
                        <div className="space-y-2">
                          {reportData.liabilities.longTerm.map((item: any, index: number) => (
                            <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                              <span className="text-gray-700">{item.account}</span>
                              <span className="font-medium text-gray-900">{formatCurrency(item.amount)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium text-blue-700 mb-2">Equity</h4>
                        <div className="space-y-2">
                          {reportData.equity.accounts.map((item: any, index: number) => (
                            <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                              <span className="text-gray-700">{item.account}</span>
                              <span className="font-medium text-gray-900">{formatCurrency(item.amount)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center p-3 bg-red-100 rounded-lg">
                          <span className="font-bold text-red-800">TOTAL LIABILITIES</span>
                          <span className="text-xl font-bold text-red-900">{formatCurrency(reportData.liabilities.total)}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-blue-100 rounded-lg">
                          <span className="font-bold text-blue-800">TOTAL EQUITY</span>
                          <span className="text-xl font-bold text-blue-900">{formatCurrency(reportData.equity.total)}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Summary */}
              <Card className="border-2 border-gray-300">
                <CardHeader>
                  <CardTitle className="text-gray-800">BALANCE SHEET SUMMARY</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">Working Capital</p>
                      <p className="text-2xl font-bold text-gray-900">{formatCurrency(reportData.summary.workingCapital)}</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">Debt-to-Equity Ratio</p>
                      <p className="text-2xl font-bold text-gray-900">{reportData.summary.debtToEquity.toFixed(2)}</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">Total Assets</p>
                      <p className="text-2xl font-bold text-gray-900">{formatCurrency(reportData.summary.totalAssets)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {reportType === 'efris' && (
            <div className="space-y-6">
              {/* Company Info */}
              <div className="text-center p-6 bg-gray-50 rounded-lg">
                <h3 className="text-xl font-bold text-gray-900">{reportData.companyInfo.name}</h3>
                <p className="text-gray-600">{reportData.companyInfo.address}</p>
                <p className="text-gray-600">{reportData.companyInfo.phone} • {reportData.companyInfo.email}</p>
                <p className="text-sm text-gray-500 mt-2">EFRIS Tax Report • {reportData.taxPeriod.startDate} to {reportData.taxPeriod.endDate}</p>
              </div>

              {/* VAT Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-blue-800">VAT SUMMARY</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-blue-800">Total Sales</span>
                        <span className="font-bold text-blue-900">{formatCurrency(reportData.vatSummary.totalSales)}</span>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-blue-800">VAT Collected (18%)</span>
                        <span className="font-bold text-blue-900">{formatCurrency(reportData.vatSummary.vatCollected)}</span>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-blue-800">VAT Paid</span>
                        <span className="font-bold text-blue-900">{formatCurrency(reportData.vatSummary.vatPaid)}</span>
                      </div>
                      <div className="flex justify-between items-center border-t border-blue-200 pt-2">
                        <span className="text-blue-800 font-medium">Net VAT Payable</span>
                        <span className="font-bold text-blue-900">{formatCurrency(reportData.vatSummary.netVatPayable)}</span>
                      </div>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-green-800">VAT Rate</span>
                        <span className="font-bold text-green-900">{reportData.vatSummary.vatRate}</span>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-green-800">EFRIS Status</span>
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tax Calculations */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-orange-800">TAX CALCULATIONS</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-orange-50 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-orange-800">Income Tax (30%)</span>
                        <span className="font-bold text-orange-900">{formatCurrency(reportData.incomeTax.incomeTax)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-orange-800">Net Income</span>
                        <span className="font-medium text-orange-900">{formatCurrency(reportData.incomeTax.netIncome)}</span>
                      </div>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-purple-800">Withholding Tax (6%)</span>
                        <span className="font-bold text-purple-900">{formatCurrency(reportData.withholdingTax.withholdingTax)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-purple-800">Total Revenue</span>
                        <span className="font-medium text-purple-900">{formatCurrency(reportData.withholdingTax.totalRevenue)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Total Tax Liability */}
              <Card className="border-2 border-red-200">
                <CardHeader>
                  <CardTitle className="text-red-800">TOTAL TAX LIABILITY</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center p-6 bg-red-50 rounded-lg">
                    <p className="text-4xl font-bold text-red-900">{formatCurrency(reportData.totalTaxLiability)}</p>
                    <p className="text-red-700 mt-2">Total amount due to URA</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ReportViewer

