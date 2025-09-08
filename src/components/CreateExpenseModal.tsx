import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus } from 'lucide-react'
import { getAccountingService } from '@/services/accountingService'
import { Expense, Account, ExpenseCategory } from '@/services/accountingService'

interface CreateExpenseModalProps {
  children: React.ReactNode
  onExpenseCreated?: (expense: Expense) => void
}

const CreateExpenseModal: React.FC<CreateExpenseModalProps> = ({ children, onExpenseCreated }) => {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [accounts, setAccounts] = useState<Account[]>([])
  const [categories, setCategories] = useState<ExpenseCategory[]>([])
  const [expense, setExpense] = useState({
    paid_at: new Date().toISOString().split('T')[0],
    amount: 0,
    description: '',
    reference: '',
    payment_method: 'cash'
  })
  const [selectedAccount, setSelectedAccount] = useState<string>('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')

  const accountingService = getAccountingService()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [accountsData, categoriesData] = await Promise.all([
        accountingService.getAccounts(),
        accountingService.getExpenseCategories()
      ])
      setAccounts(accountsData)
      setCategories(categoriesData)
      
      // Set default account if available
      if (accountsData.length > 0) {
        setSelectedAccount(accountsData[0].id)
      }
    } catch (error) {
      console.error('Error loading data:', error)
    }
  }

  const handleSubmit = async () => {
    if (!expense.description || expense.amount <= 0) {
      alert('Please fill in all required fields')
      return
    }

    setLoading(true)
    try {
      const newExpense = await accountingService.createExpense({
        account_id: selectedAccount,
        paid_at: expense.paid_at,
        amount: expense.amount,
        currency_code: 'UGX',
        currency_rate: 1,
        description: expense.description,
        category_id: selectedCategory || undefined,
        reference: expense.reference,
        payment_method: expense.payment_method
      })

      onExpenseCreated?.(newExpense)
      setOpen(false)
      resetForm()
    } catch (error) {
      console.error('Error creating expense:', error)
      alert('Failed to create expense. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setExpense({
      paid_at: new Date().toISOString().split('T')[0],
      amount: 0,
      description: '',
      reference: '',
      payment_method: 'cash'
    })
    setSelectedAccount('')
    setSelectedCategory('')
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-[#040458]">Record New Expense</DialogTitle>
          <DialogDescription>
            Track your business expenses for better financial management
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Expense Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Expense Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Input
                    id="description"
                    value={expense.description}
                    onChange={(e) => setExpense({ ...expense, description: e.target.value })}
                    placeholder="What was this expense for?"
                  />
                </div>
                <div>
                  <Label htmlFor="amount">Amount (UGX) *</Label>
                  <Input
                    id="amount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={expense.amount}
                    onChange={(e) => setExpense({ ...expense, amount: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="paid-at">Date Paid</Label>
                  <Input
                    id="paid-at"
                    type="date"
                    value={expense.paid_at}
                    onChange={(e) => setExpense({ ...expense, paid_at: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="payment-method">Payment Method</Label>
                  <Select value={expense.payment_method} onValueChange={(value) => setExpense({ ...expense, payment_method: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="mobile_money">Mobile Money</SelectItem>
                      <SelectItem value="card">Card</SelectItem>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="reference">Reference/Receipt #</Label>
                  <Input
                    id="reference"
                    value={expense.reference}
                    onChange={(e) => setExpense({ ...expense, reference: e.target.value })}
                    placeholder="Receipt number or reference"
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Account Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="account">Debit Account</Label>
                <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select account" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map(account => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.name} ({account.number})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading} className="bg-[#faa51a] hover:bg-[#040458]">
              {loading ? 'Recording...' : 'Record Expense'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default CreateExpenseModal


