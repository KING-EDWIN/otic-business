import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDemo } from '@/contexts/DemoContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { demoUsers } from '@/services/demoData'
import { 
  Building2, 
  ShoppingCart, 
  Package, 
  BarChart3, 
  CreditCard,
  Users,
  Star,
  Play,
  Eye,
  CheckCircle
} from 'lucide-react'

const Demo = () => {
  const navigate = useNavigate()
  const { enterDemo } = useDemo()
  const [selectedTier, setSelectedTier] = useState<'basic' | 'standard' | 'premium'>('basic')
  const [loading, setLoading] = useState(false)

  const handleTryDemo = async () => {
    setLoading(true)
    try {
      await enterDemo(selectedTier)
      navigate('/dashboard')
    } catch (error) {
      console.error('Error entering demo:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSignUp = () => {
    navigate('/signup')
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-hero p-2 rounded-lg">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-primary">Otic Business</span>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => navigate('/signin')}>
                Sign In
              </Button>
              <Button variant="hero" onClick={handleSignUp}>
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl lg:text-7xl font-bold text-white mb-6">
            Try Before You Buy
          </h1>
          <p className="text-xl lg:text-2xl text-white/90 mb-8 max-w-3xl mx-auto">
            Experience the full power of Otic Business with our interactive demo. 
            See how different plans work for businesses of all sizes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="text-lg px-8 py-4 h-auto bg-white text-primary hover:bg-white/90"
              onClick={handleTryDemo}
            >
              <Play className="mr-2 h-5 w-5" />
              Try Interactive Demo
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="text-lg px-8 py-4 h-auto bg-white/10 border-white/30 text-white hover:bg-white/20"
              onClick={handleSignUp}
            >
              <Eye className="mr-2 h-5 w-5" />
              Create Free Account
            </Button>
          </div>
        </div>

        {/* Demo Tiers */}
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Choose Your Demo Experience
          </h2>
          
          <Tabs value={selectedTier} onValueChange={(value) => setSelectedTier(value as any)} className="space-y-8">
            <TabsList className="grid w-full grid-cols-3 bg-white/10">
              <TabsTrigger value="basic" className="data-[state=active]:bg-white data-[state=active]:text-primary">
                Basic Plan
              </TabsTrigger>
              <TabsTrigger value="standard" className="data-[state=active]:bg-white data-[state=active]:text-primary">
                Standard Plan
              </TabsTrigger>
              <TabsTrigger value="premium" className="data-[state=active]:bg-white data-[state=active]:text-primary">
                Premium Plan
              </TabsTrigger>
            </TabsList>

            <TabsContent value={selectedTier} className="space-y-8">
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Demo User Info */}
                <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-white text-2xl">{demoUsers[selectedTier].name}</CardTitle>
                        <CardDescription className="text-white/80">
                          {demoUsers[selectedTier].description}
                        </CardDescription>
                      </div>
                      <Badge className="bg-white/20 text-white border-white/30">
                        {demoUsers[selectedTier].tier} Plan
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h4 className="text-white font-semibold mb-3">Features Included:</h4>
                      <ul className="space-y-2">
                        {demoUsers[selectedTier].features.map((feature, index) => (
                          <li key={index} className="flex items-center space-x-2 text-white/90">
                            <CheckCircle className="h-4 w-4 text-green-400" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/10 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-white">{demoUsers[selectedTier].stats.totalSales}</div>
                        <div className="text-sm text-white/80">Total Sales</div>
                      </div>
                      <div className="bg-white/10 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-white">UGX {demoUsers[selectedTier].stats.totalRevenue.toLocaleString()}</div>
                        <div className="text-sm text-white/80">Revenue</div>
                      </div>
                      <div className="bg-white/10 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-white">{demoUsers[selectedTier].stats.totalProducts}</div>
                        <div className="text-sm text-white/80">Products</div>
                      </div>
                      <div className="bg-white/10 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-white text-red-300">{demoUsers[selectedTier].stats.lowStockItems}</div>
                        <div className="text-sm text-white/80">Low Stock</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Demo Features Preview */}
                <div className="space-y-6">
                  <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center space-x-2">
                        <ShoppingCart className="h-5 w-5" />
                        <span>POS System</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-white/80 mb-4">
                        Experience our mobile-first POS with barcode scanning, real-time inventory updates, and instant receipt generation.
                      </p>
                      <div className="flex space-x-2">
                        <Badge className="bg-white/20 text-white">Barcode Scanning</Badge>
                        <Badge className="bg-white/20 text-white">Receipt Generation</Badge>
                        <Badge className="bg-white/20 text-white">Payment Processing</Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center space-x-2">
                        <BarChart3 className="h-5 w-5" />
                        <span>AI Analytics</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-white/80 mb-4">
                        Get AI-powered insights, sales forecasting, and business intelligence to drive growth.
                      </p>
                      <div className="flex space-x-2">
                        <Badge className="bg-white/20 text-white">Sales Forecasting</Badge>
                        <Badge className="bg-white/20 text-white">Trend Analysis</Badge>
                        <Badge className="bg-white/20 text-white">Smart Insights</Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center space-x-2">
                        <Package className="h-5 w-5" />
                        <span>Inventory Management</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-white/80 mb-4">
                        Manage products, track stock levels, and get automated alerts for low inventory.
                      </p>
                      <div className="flex space-x-2">
                        <Badge className="bg-white/20 text-white">Auto Barcodes</Badge>
                        <Badge className="bg-white/20 text-white">Stock Alerts</Badge>
                        <Badge className="bg-white/20 text-white">Product Management</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Demo Action Buttons */}
              <div className="text-center space-y-4">
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    size="lg" 
                    className="text-lg px-8 py-4 h-auto bg-white text-primary hover:bg-white/90"
                    onClick={handleTryDemo}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary mr-2"></div>
                        Loading Demo...
                      </>
                    ) : (
                      <>
                        <Play className="mr-2 h-5 w-5" />
                        Try {demoUsers[selectedTier].tier} Demo
                      </>
                    )}
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="text-lg px-8 py-4 h-auto bg-white/10 border-white/30 text-white hover:bg-white/20"
                    onClick={handleSignUp}
                  >
                    <Star className="mr-2 h-5 w-5" />
                    Upgrade to {demoUsers[selectedTier].tier}
                  </Button>
                </div>
                <p className="text-white/70 text-sm">
                  Demo data is pre-populated • No signup required • Full feature access
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Pricing Comparison */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Choose Your Plan
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader className="text-center">
                <CardTitle className="text-white">Basic</CardTitle>
                <div className="text-3xl font-bold text-white">UGX 1,000,000</div>
                <div className="text-white/70">per month</div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-white/90">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span>POS System</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span>Basic Reports</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span>Single User</span>
                  </li>
                </ul>
                <Button className="w-full bg-white text-primary hover:bg-white/90" onClick={handleSignUp}>
                  Get Started
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border-white/20 ring-2 ring-white/30">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-2">
                  <Badge className="bg-yellow-400 text-black">Most Popular</Badge>
                </div>
                <CardTitle className="text-white">Standard</CardTitle>
                <div className="text-3xl font-bold text-white">UGX 3,000,000</div>
                <div className="text-white/70">per month</div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-white/90">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span>Everything in Basic</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span>QuickBooks Integration</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span>AI Analytics</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span>Multi-user Access</span>
                  </li>
                </ul>
                <Button className="w-full bg-white text-primary hover:bg-white/90" onClick={handleSignUp}>
                  Get Started
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader className="text-center">
                <CardTitle className="text-white">Premium</CardTitle>
                <div className="text-3xl font-bold text-white">UGX 5,000,000</div>
                <div className="text-white/70">per month</div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-white/90">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span>Everything in Standard</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span>Multi-branch Management</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span>AI Forecasting</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span>Priority Support</span>
                  </li>
                </ul>
                <Button className="w-full bg-white text-primary hover:bg-white/90" onClick={handleSignUp}>
                  Get Started
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Demo
