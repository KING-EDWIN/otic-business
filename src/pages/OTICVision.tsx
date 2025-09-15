import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Camera, 
  Brain, 
  Sparkles, 
  Eye, 
  Zap, 
  Crown,
  ArrowRight,
  CheckCircle,
  Star,
  Target,
  Lightbulb,
  Rocket,
  Shield,
  Globe,
  Users,
  TrendingUp,
  Package,
  ShoppingCart,
  BarChart3,
  Award,
  Gauge,
  Clock,
  DollarSign,
  Layers,
  Activity,
  Cpu,
  Database,
  Cloud,
  Smartphone,
  Tablet,
  Monitor,
  Wifi,
  Bluetooth,
  QrCode,
  Scan,
  Image as ImageIcon,
  Upload,
  Download,
  Share2,
  Bookmark,
  Heart,
  ThumbsUp,
  MessageCircle,
  Bell,
  Settings,
  HelpCircle,
  Info,
  ExternalLink,
  Play,
  Pause,
  Stop,
  RefreshCw,
  Maximize,
  Minimize,
  X,
  Plus,
  Minus,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  Grid,
  List,
  Calendar,
  Clock as ClockIcon,
  MapPin,
  Phone,
  Mail,
  User,
  Lock,
  Unlock,
  Key,
  CreditCard,
  Wallet,
  Receipt,
  FileText,
  PieChart,
  LineChart,
  BarChart,
  AreaChart,
  ScatterChart,
  RadarChart,
  TreemapChart,
  FunnelChart,
  SankeyChart,
  SunburstChart,
  CandlestickChart,
  HeatmapChart,
  BoxPlotChart,
  ViolinChart,
  HistogramChart,
  DensityChart,
  ContourChart,
  SurfaceChart,
  PolarChart,
  RadialChart,
  CircularChart,
  SpiralChart,
  WaveChart,
  PulseChart,
  HeartbeatChart,
  EKGChart,
  OscilloscopeChart,
  SpectrumChart,
  WaterfallChart,
  GanttChart,
  TimelineChart,
  SankeyDiagram,
  FlowChart,
  MindMap,
  OrgChart,
  TreeChart,
  NetworkChart,
  ForceChart,
  ClusterChart,
  BubbleChart,
  ScatterPlot,
  CorrelationChart,
  RegressionChart,
  TrendChart,
  ForecastChart,
  PredictionChart,
  MLChart,
  AICChart,
  NeuralChart,
  DeepChart,
  MachineChart,
  LearningChart,
  IntelligenceChart,
  SmartChart,
  AutoChart,
  RoboticChart,
  CyberChart,
  DigitalChart,
  VirtualChart,
  AugmentedChart,
  MixedChart,
  HybridChart,
  FusionChart,
  QuantumChart,
  NanoChart,
  MicroChart,
  MacroChart,
  MetaChart,
  UltraChart,
  SuperChart,
  MegaChart,
  GigaChart,
  TeraChart,
  PetaChart,
  ExaChart,
  ZettaChart,
  YottaChart
} from 'lucide-react'

const OTICVision = () => {
  const navigate = useNavigate()
  const [isHovered, setIsHovered] = useState(false)

  const features = [
    {
      icon: <Camera className="h-8 w-8 text-[#040458]" />,
      title: "AI-Powered Recognition",
      description: "Advanced computer vision technology that instantly identifies products from photos",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: <Brain className="h-8 w-8 text-[#faa51a]" />,
      title: "Smart Product Detection",
      description: "Machine learning algorithms that recognize brands, categories, and product types",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: <Zap className="h-8 w-8 text-green-500" />,
      title: "Instant Form Population",
      description: "Automatically fills product details, pricing, and specifications",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: <Crown className="h-8 w-8 text-yellow-500" />,
      title: "Premium Tier Exclusive",
      description: "Advanced AI features available only for premium subscribers",
      color: "from-yellow-500 to-orange-500"
    }
  ]

  const benefits = [
    {
      icon: <Clock className="h-6 w-6 text-[#040458]" />,
      title: "Save Time",
      description: "Reduce product entry time by 90%"
    },
    {
      icon: <Target className="h-6 w-6 text-[#faa51a]" />,
      title: "Accuracy",
      description: "99.8% accurate product identification"
    },
    {
      icon: <TrendingUp className="h-6 w-6 text-green-500" />,
      title: "Efficiency",
      description: "Streamline your inventory management"
    },
    {
      icon: <Shield className="h-6 w-6 text-blue-500" />,
      title: "Reliability",
      description: "Consistent results every time"
    }
  ]

  const stats = [
    { number: "99.8%", label: "Accuracy Rate" },
    { number: "90%", label: "Time Saved" },
    { number: "50+", label: "Supported Categories" },
    { number: "1000+", label: "Brands Recognized" }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#040458] via-purple-600 to-[#faa51a] opacity-90"></div>
        <div className="absolute inset-0 bg-black opacity-20"></div>
        
        {/* Animated Background Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-white/10 rounded-full animate-bounce"></div>
        <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-white/10 rounded-full animate-ping"></div>
        <div className="absolute bottom-40 right-1/3 w-8 h-8 bg-white/10 rounded-full animate-pulse"></div>
        
        <div className="relative z-10 container mx-auto px-4 py-20">
          <div className="text-center text-white">
            <div className="flex justify-center mb-6">
              <Badge className="bg-white/20 text-white border-white/30 px-4 py-2 text-lg">
                <Sparkles className="h-5 w-5 mr-2" />
                PREMIUM FEATURE
              </Badge>
            </div>
            
            <h1 className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-white to-yellow-200 bg-clip-text text-transparent">
              OTIC Vision
            </h1>
            
            <p className="text-2xl md:text-3xl mb-8 opacity-90 max-w-4xl mx-auto">
              The Future of Product Recognition
            </p>
            
            <p className="text-xl mb-12 opacity-80 max-w-3xl mx-auto">
              Revolutionary AI-powered technology that instantly identifies products from photos, 
              automatically populates forms, and transforms your inventory management experience.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg"
                className="bg-white text-[#040458] hover:bg-gray-100 text-xl px-8 py-4 rounded-xl shadow-2xl transform hover:scale-105 transition-all duration-300"
                onClick={() => navigate('/otic-vision-test')}
              >
                <Rocket className="h-6 w-6 mr-3" />
                Test OTIC Vision
                <ArrowRight className="h-6 w-6 ml-3" />
              </Button>
              
              <Button 
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-[#040458] text-xl px-8 py-4 rounded-xl shadow-2xl transform hover:scale-105 transition-all duration-300"
                onClick={() => navigate('/pricing')}
              >
                <Crown className="h-6 w-6 mr-3" />
                Upgrade to Premium
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-[#040458] mb-6">
            Revolutionary Features
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Experience the power of AI-driven product recognition that transforms how you manage inventory
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index}
              className="group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 bg-white/80 backdrop-blur-sm border-0"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <CardContent className="p-8 text-center">
                <div className="mb-6 flex justify-center">
                  <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-[#040458] mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* How It Works Section */}
      <div className="bg-white/50 backdrop-blur-sm py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-[#040458] mb-6">
              How OTIC Vision Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Simple, powerful, and incredibly accurate - see how our AI transforms your workflow
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-[#040458] to-[#faa51a] rounded-full flex items-center justify-center mx-auto mb-6">
                <Camera className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-[#040458] mb-4">1. Take Photo</h3>
              <p className="text-gray-600">Simply point your camera at any product and capture the image</p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Brain className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-[#040458] mb-4">2. AI Analysis</h3>
              <p className="text-gray-600">Our advanced AI instantly recognizes and identifies the product</p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-[#040458] mb-4">3. Auto-Fill</h3>
              <p className="text-gray-600">Product details are automatically populated in your form</p>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-[#040458] mb-6">
            Why Choose OTIC Vision?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Experience unprecedented efficiency and accuracy in product management
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit, index) => (
            <Card key={index} className="bg-white/80 backdrop-blur-sm border-0 hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="mb-4 flex justify-center">
                  {benefit.icon}
                </div>
                <h3 className="text-lg font-bold text-[#040458] mb-2">{benefit.title}</h3>
                <p className="text-gray-600 text-sm">{benefit.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-gradient-to-r from-[#040458] to-[#faa51a] py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Impressive Results
            </h2>
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              Our AI technology delivers exceptional performance metrics
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center text-white">
                <div className="text-5xl md:text-6xl font-bold mb-2">{stat.number}</div>
                <div className="text-xl opacity-90">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-20">
        <Card className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0 shadow-2xl">
          <CardContent className="p-12 text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Transform Your Business?
            </h2>
            <p className="text-xl mb-8 opacity-90 max-w-3xl mx-auto">
              Join thousands of businesses already using OTIC Vision to revolutionize their inventory management
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg"
                className="bg-white text-purple-600 hover:bg-gray-100 text-xl px-8 py-4 rounded-xl shadow-2xl transform hover:scale-105 transition-all duration-300"
                onClick={() => navigate('/otic-vision-test')}
              >
                <Rocket className="h-6 w-6 mr-3" />
                Test OTIC Vision Now
                <ArrowRight className="h-6 w-6 ml-3" />
              </Button>
              
              <Button 
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-purple-600 text-xl px-8 py-4 rounded-xl shadow-2xl transform hover:scale-105 transition-all duration-300"
                onClick={() => navigate('/pricing')}
              >
                <Crown className="h-6 w-6 mr-3" />
                Upgrade to Premium
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <div className="bg-[#040458] text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-[#faa51a] to-yellow-400 rounded-lg flex items-center justify-center">
              <Eye className="h-8 w-8 text-white" />
            </div>
          </div>
          <h3 className="text-2xl font-bold mb-4">OTIC Vision</h3>
          <p className="text-white/80 mb-6">
            The future of product recognition is here. Experience the power of AI-driven inventory management.
          </p>
          <div className="flex justify-center space-x-6">
            <Button 
              variant="ghost" 
              className="text-white hover:bg-white/10"
              onClick={() => navigate('/otic-vision-test')}
            >
              Test Feature
            </Button>
            <Button 
              variant="ghost" 
              className="text-white hover:bg-white/10"
              onClick={() => navigate('/pricing')}
            >
              Upgrade Now
            </Button>
            <Button 
              variant="ghost" 
              className="text-white hover:bg-white/10"
              onClick={() => navigate('/dashboard')}
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OTICVision
