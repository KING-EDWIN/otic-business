import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { 
  Plus, 
  Search, 
  Download, 
  Send, 
  Eye, 
  Edit, 
  Trash2, 
  FileText,
  Calculator,
  Receipt
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { getCurrentUserInfo } from '@/utils/userUtils'
import { toast } from 'sonner'

interface Invoice {
  id: string
  invoice_number: string
  customer_name: string
  customer_email: string
  customer_phone: string
  subtotal: number
  tax_rate: number
  tax_amount: number
  total: number
  status: 'draft' | 'sent' | 'paid' | 'overdue'
  due_date: string
  created_at: string
  items: InvoiceItem[]
}

interface InvoiceItem {
  id: string
  product_name: string
  description: string
  quantity: number
  unit_price: number
  total: number
}

const InvoiceManager: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null)

  // New invoice form state
  const [newInvoice, setNewInvoice] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    due_date: '',
    tax_rate: 18, // 18% VAT for Uganda
    items: [] as InvoiceItem[]
  })

  useEffect(() => {
    loadInvoices()
  }, [])

  const loadInvoices = async () => {
    try {
      setLoading(true)
      const userInfo = await getCurrentUserInfo()
      if (!userInfo) return

      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          invoice_items (*)
        `)
        .eq('user_id', userInfo.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      const formattedInvoices = data?.map(invoice => ({
        ...invoice,
        items: invoice.invoice_items || []
      })) || []

      setInvoices(formattedInvoices)
    } catch (error) {
      console.error('Error loading invoices:', error)
      toast.error('Failed to load invoices')
    } finally {
      setLoading(false)
    }
  }

  const createInvoice = async () => {
    try {
      const userInfo = await getCurrentUserInfo()
      if (!userInfo) return

      // Calculate totals
      const subtotal = newInvoice.items.reduce((sum, item) => sum + item.total, 0)
      const tax_amount = (subtotal * newInvoice.tax_rate) / 100
      const total = subtotal + tax_amount

      // Generate invoice number
      const invoice_number = `INV-${Date.now().toString().slice(-6)}`

      // Create invoice
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert({
          user_id: userInfo.id,
          invoice_number,
          customer_name: newInvoice.customer_name,
          customer_email: newInvoice.customer_email,
          customer_phone: newInvoice.customer_phone,
          subtotal,
          tax_rate: newInvoice.tax_rate,
          tax_amount,
          total,
          status: 'draft',
          due_date: newInvoice.due_date
        })
        .select()
        .single()

      if (invoiceError) throw invoiceError

      // Create invoice items
      if (newInvoice.items.length > 0) {
        const { error: itemsError } = await supabase
          .from('invoice_items')
          .insert(
            newInvoice.items.map(item => ({
              invoice_id: invoice.id,
              product_name: item.product_name,
              description: item.description,
              quantity: item.quantity,
              unit_price: item.unit_price,
              total: item.total
            }))
          )

        if (itemsError) throw itemsError
      }

      toast.success('Invoice created successfully!')
      setIsCreateModalOpen(false)
      setNewInvoice({
        customer_name: '',
        customer_email: '',
        customer_phone: '',
        due_date: '',
        tax_rate: 18,
        items: []
      })
      loadInvoices()
    } catch (error) {
      console.error('Error creating invoice:', error)
      toast.error('Failed to create invoice')
    }
  }

  const addInvoiceItem = () => {
    setNewInvoice(prev => ({
      ...prev,
      items: [...prev.items, {
        id: Date.now().toString(),
        product_name: '',
        description: '',
        quantity: 1,
        unit_price: 0,
        total: 0
      }]
    }))
  }

  const updateInvoiceItem = (index: number, field: keyof InvoiceItem, value: any) => {
    setNewInvoice(prev => ({
      ...prev,
      items: prev.items.map((item, i) => {
        if (i === index) {
          const updatedItem = { ...item, [field]: value }
          if (field === 'quantity' || field === 'unit_price') {
            updatedItem.total = updatedItem.quantity * updatedItem.unit_price
          }
          return updatedItem
        }
        return item
      })
    }))
  }

  const removeInvoiceItem = (index: number) => {
    setNewInvoice(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }))
  }

  const sendInvoice = async (invoiceId: string) => {
    try {
      const { error } = await supabase
        .from('invoices')
        .update({ status: 'sent' })
        .eq('id', invoiceId)

      if (error) throw error

      toast.success('Invoice sent successfully!')
      loadInvoices()
    } catch (error) {
      console.error('Error sending invoice:', error)
      toast.error('Failed to send invoice')
    }
  }

  const markAsPaid = async (invoiceId: string) => {
    try {
      const { error } = await supabase
        .from('invoices')
        .update({ status: 'paid' })
        .eq('id', invoiceId)

      if (error) throw error

      toast.success('Invoice marked as paid!')
      loadInvoices()
    } catch (error) {
      console.error('Error marking invoice as paid:', error)
      toast.error('Failed to update invoice status')
    }
  }

  const downloadInvoice = (invoice: Invoice) => {
    // Generate PDF content
    const content = `
      INVOICE
      Invoice #: ${invoice.invoice_number}
      Date: ${new Date(invoice.created_at).toLocaleDateString()}
      Due Date: ${new Date(invoice.due_date).toLocaleDateString()}
      
      Bill To:
      ${invoice.customer_name}
      ${invoice.customer_email}
      ${invoice.customer_phone}
      
      Items:
      ${invoice.items.map(item => 
        `${item.product_name} - ${item.quantity} x ${item.unit_price} = ${item.total}`
      ).join('\n')}
      
      Subtotal: ${invoice.subtotal}
      Tax (${invoice.tax_rate}%): ${invoice.tax_amount}
      Total: ${invoice.total}
    `

    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `invoice-${invoice.invoice_number}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { variant: 'secondary' as const, label: 'Draft' },
      sent: { variant: 'default' as const, label: 'Sent' },
      paid: { variant: 'default' as const, label: 'Paid' },
      overdue: { variant: 'destructive' as const, label: 'Overdue' }
    }
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const filteredInvoices = invoices.filter(invoice =>
    invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.customer_name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Invoice Management</h2>
          <p className="text-gray-600">Create, manage, and track your invoices</p>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Invoice
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Invoice</DialogTitle>
              <DialogDescription>
                Fill in the details to create a new invoice
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Customer Information */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="customer_name">Customer Name *</Label>
                  <Input
                    id="customer_name"
                    value={newInvoice.customer_name}
                    onChange={(e) => setNewInvoice(prev => ({ ...prev, customer_name: e.target.value }))}
                    placeholder="Enter customer name"
                  />
                </div>
                <div>
                  <Label htmlFor="customer_email">Email</Label>
                  <Input
                    id="customer_email"
                    type="email"
                    value={newInvoice.customer_email}
                    onChange={(e) => setNewInvoice(prev => ({ ...prev, customer_email: e.target.value }))}
                    placeholder="customer@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="customer_phone">Phone</Label>
                  <Input
                    id="customer_phone"
                    value={newInvoice.customer_phone}
                    onChange={(e) => setNewInvoice(prev => ({ ...prev, customer_phone: e.target.value }))}
                    placeholder="+256 700 000 000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="due_date">Due Date *</Label>
                  <Input
                    id="due_date"
                    type="date"
                    value={newInvoice.due_date}
                    onChange={(e) => setNewInvoice(prev => ({ ...prev, due_date: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="tax_rate">Tax Rate (%)</Label>
                  <Input
                    id="tax_rate"
                    type="number"
                    value={newInvoice.tax_rate}
                    onChange={(e) => setNewInvoice(prev => ({ ...prev, tax_rate: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
              </div>

              {/* Invoice Items */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Invoice Items</h3>
                  <Button onClick={addInvoiceItem} variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                  </Button>
                </div>

                <div className="space-y-4">
                  {newInvoice.items.map((item, index) => (
                    <div key={item.id} className="grid grid-cols-12 gap-4 items-end">
                      <div className="col-span-4">
                        <Label>Product/Service</Label>
                        <Input
                          value={item.product_name}
                          onChange={(e) => updateInvoiceItem(index, 'product_name', e.target.value)}
                          placeholder="Product or service name"
                        />
                      </div>
                      <div className="col-span-3">
                        <Label>Description</Label>
                        <Input
                          value={item.description}
                          onChange={(e) => updateInvoiceItem(index, 'description', e.target.value)}
                          placeholder="Description"
                        />
                      </div>
                      <div className="col-span-2">
                        <Label>Qty</Label>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateInvoiceItem(index, 'quantity', parseInt(e.target.value) || 0)}
                        />
                      </div>
                      <div className="col-span-2">
                        <Label>Unit Price</Label>
                        <Input
                          type="number"
                          value={item.unit_price}
                          onChange={(e) => updateInvoiceItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <div className="col-span-1">
                        <Button
                          onClick={() => removeInvoiceItem(index)}
                          variant="outline"
                          size="sm"
                          className="w-full"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                {newInvoice.items.length > 0 && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>{formatCurrency(newInvoice.items.reduce((sum, item) => sum + item.total, 0))}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax ({newInvoice.tax_rate}%):</span>
                      <span>{formatCurrency((newInvoice.items.reduce((sum, item) => sum + item.total, 0) * newInvoice.tax_rate) / 100)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total:</span>
                      <span>{formatCurrency(newInvoice.items.reduce((sum, item) => sum + item.total, 0) * (1 + newInvoice.tax_rate / 100))}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={createInvoice} disabled={!newInvoice.customer_name || !newInvoice.due_date}>
                  Create Invoice
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search invoices..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {/* Invoices Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2">Loading invoices...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{invoice.customer_name}</div>
                        <div className="text-sm text-gray-500">{invoice.customer_email}</div>
                      </div>
                    </TableCell>
                    <TableCell>{formatCurrency(invoice.total)}</TableCell>
                    <TableCell>{new Date(invoice.due_date).toLocaleDateString()}</TableCell>
                    <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" onClick={() => downloadInvoice(invoice)}>
                          <Download className="h-4 w-4" />
                        </Button>
                        {invoice.status === 'draft' && (
                          <Button size="sm" variant="outline" onClick={() => sendInvoice(invoice.id)}>
                            <Send className="h-4 w-4" />
                          </Button>
                        )}
                        {invoice.status === 'sent' && (
                          <Button size="sm" variant="outline" onClick={() => markAsPaid(invoice.id)}>
                            <Receipt className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default InvoiceManager

