import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Minus, X } from 'lucide-react'
import { getAccountingService } from '@/services/accountingService'
import { Invoice, InvoiceItem, Customer } from '@/services/accountingService'

interface CreateInvoiceModalProps {
  children: React.ReactNode
  onInvoiceCreated?: (invoice: Invoice) => void
}

const CreateInvoiceModal: React.FC<CreateInvoiceModalProps> = ({ children, onInvoiceCreated }) => {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<string>('')
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  })
  const [invoice, setInvoice] = useState({
    issue_date: new Date().toISOString().split('T')[0],
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'draft' as const,
    currency_code: 'UGX',
    notes: ''
  })
  const [items, setItems] = useState<InvoiceItem[]>([
    {
      name: '',
      description: '',
      quantity: 1,
      price: 0,
      total: 0
    }
  ])

  const accountingService = getAccountingService()

  useEffect(() => {
    loadCustomers()
  }, [])

  const loadCustomers = async () => {
    try {
      const customersData = await accountingService.getCustomers()
      setCustomers(customersData)
    } catch (error) {
      console.error('Error loading customers:', error)
    }
  }

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + item.total, 0)
    const tax = subtotal * 0.18 // 18% VAT for Uganda
    const total = subtotal + tax

    return { subtotal, tax, total }
  }

  const updateItem = (index: number, field: keyof InvoiceItem, value: any) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    
    if (field === 'quantity' || field === 'price') {
      newItems[index].total = newItems[index].quantity * newItems[index].price
    }
    
    setItems(newItems)
  }

  const addItem = () => {
    setItems([...items, {
      name: '',
      description: '',
      quantity: 1,
      price: 0,
      total: 0
    }])
  }

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index))
    }
  }

  const handleCreateCustomer = async () => {
    if (!newCustomer.name) return

    try {
      const customer = await accountingService.createCustomer({
        name: newCustomer.name,
        email: newCustomer.email,
        phone: newCustomer.phone,
        address: newCustomer.address,
        currency_code: 'UGX',
        enabled: true
      })
      
      setCustomers([customer, ...customers])
      setSelectedCustomer(customer.id!)
      setNewCustomer({ name: '', email: '', phone: '', address: '' })
    } catch (error) {
      console.error('Error creating customer:', error)
    }
  }

  const handleSubmit = async () => {
    if (!selectedCustomer && !newCustomer.name) {
      alert('Please select a customer or create a new one')
      return
    }

    if (items.some(item => !item.name || item.quantity <= 0 || item.price <= 0)) {
      alert('Please fill in all item details correctly')
      return
    }

    setLoading(true)
    try {
      let customerId = selectedCustomer
      
      // Create new customer if needed
      if (!customerId && newCustomer.name) {
        const customer = await accountingService.createCustomer({
          name: newCustomer.name,
          email: newCustomer.email,
          phone: newCustomer.phone,
          address: newCustomer.address,
          currency_code: 'UGX',
          enabled: true
        })
        customerId = customer.id!
      }

      const { subtotal, tax, total } = calculateTotals()

      const newInvoice = await accountingService.createInvoice({
        customer_id: customerId,
        issue_date: invoice.issue_date,
        due_date: invoice.due_date,
        status: invoice.status,
        currency_code: invoice.currency_code,
        currency_rate: 1,
        subtotal,
        discount: 0,
        tax,
        total,
        notes: invoice.notes,
        items: items.filter(item => item.name && item.quantity > 0 && item.price > 0)
      })

      onInvoiceCreated?.(newInvoice)
      setOpen(false)
      resetForm()
    } catch (error) {
      console.error('Error creating invoice:', error)
      alert('Failed to create invoice. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setSelectedCustomer('')
    setNewCustomer({ name: '', email: '', phone: '', address: '' })
    setInvoice({
      issue_date: new Date().toISOString().split('T')[0],
      due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'draft',
      currency_code: 'UGX',
      notes: ''
    })
    setItems([{
      name: '',
      description: '',
      quantity: 1,
      price: 0,
      total: 0
    }])
  }

  const { subtotal, tax, total } = calculateTotals()

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[#040458]">Create New Invoice</DialogTitle>
          <DialogDescription>
            Create a professional invoice for your customer
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Customer Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="customer">Select Existing Customer</Label>
                  <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map(customer => (
                        <SelectItem key={customer.id} value={customer.id!}>
                          {customer.name} {customer.email && `(${customer.email})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="text-center text-gray-500">OR</div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="customer-name">Customer Name *</Label>
                  <Input
                    id="customer-name"
                    value={newCustomer.name}
                    onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                    placeholder="Enter customer name"
                  />
                </div>
                <div>
                  <Label htmlFor="customer-email">Email</Label>
                  <Input
                    id="customer-email"
                    type="email"
                    value={newCustomer.email}
                    onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                    placeholder="customer@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="customer-phone">Phone</Label>
                  <Input
                    id="customer-phone"
                    value={newCustomer.phone}
                    onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                    placeholder="+256 700 000 000"
                  />
                </div>
                <div>
                  <Label htmlFor="customer-address">Address</Label>
                  <Input
                    id="customer-address"
                    value={newCustomer.address}
                    onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                    placeholder="Customer address"
                  />
                </div>
              </div>

              {newCustomer.name && (
                <Button onClick={handleCreateCustomer} variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Customer
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Invoice Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Invoice Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="issue-date">Issue Date</Label>
                  <Input
                    id="issue-date"
                    type="date"
                    value={invoice.issue_date}
                    onChange={(e) => setInvoice({ ...invoice, issue_date: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="due-date">Due Date</Label>
                  <Input
                    id="due-date"
                    type="date"
                    value={invoice.due_date}
                    onChange={(e) => setInvoice({ ...invoice, due_date: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={invoice.status} onValueChange={(value: any) => setInvoice({ ...invoice, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="sent">Sent</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={invoice.notes}
                  onChange={(e) => setInvoice({ ...invoice, notes: e.target.value })}
                  placeholder="Additional notes for the invoice"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Invoice Items */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Invoice Items</CardTitle>
                <Button onClick={addItem} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {items.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-end">
                    <div className="col-span-4">
                      <Label>Item Name *</Label>
                      <Input
                        value={item.name}
                        onChange={(e) => updateItem(index, 'name', e.target.value)}
                        placeholder="Product or service name"
                      />
                    </div>
                    <div className="col-span-3">
                      <Label>Description</Label>
                      <Input
                        value={item.description || ''}
                        onChange={(e) => updateItem(index, 'description', e.target.value)}
                        placeholder="Item description"
                      />
                    </div>
                    <div className="col-span-2">
                      <Label>Qty</Label>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                      />
                    </div>
                    <div className="col-span-2">
                      <Label>Price (UGX)</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.price}
                        onChange={(e) => updateItem(index, 'price', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div className="col-span-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeItem(index)}
                        disabled={items.length === 1}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Totals */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>UGX {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>VAT (18%):</span>
                  <span>UGX {tax.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total:</span>
                  <span className="text-[#040458]">UGX {total.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading} className="bg-[#faa51a] hover:bg-[#040458]">
              {loading ? 'Creating...' : 'Create Invoice'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default CreateInvoiceModal


