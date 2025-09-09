import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Building2, User, ArrowRight, ArrowLeft } from 'lucide-react'

const LoginTypeSelection = () => {
  const navigate = useNavigate()

  const handleBusinessLogin = () => {
    navigate('/signin?type=business')
  }

  const handleIndividualLogin = () => {
    navigate('/signin?type=individual')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#040458] via-purple-600 to-[#faa51a] flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <img 
              src="/Otic icon@2x.png" 
              alt="Otic Business Logo" 
              className="h-16 w-16 mr-4"
            />
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold text-white mb-2">
                Welcome to Otic Business
              </h1>
              <p className="text-xl text-white/90">
                Choose your account type to continue
              </p>
            </div>
          </div>
        </div>

        {/* Login Type Cards */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Business Account */}
          <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border-0 hover:shadow-3xl transition-all duration-300 hover:scale-105">
            <CardHeader className="text-center pb-4">
              <div className="w-20 h-20 bg-gradient-to-r from-[#040458] to-[#faa51a] rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="h-10 w-10 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-[#040458] mb-2">
                Business Account
              </CardTitle>
              <CardDescription className="text-gray-600 text-lg">
                For businesses, companies, and organizations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-[#faa51a] rounded-full"></div>
                  <span className="text-gray-700">Complete POS system with barcode scanning</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-[#faa51a] rounded-full"></div>
                  <span className="text-gray-700">Advanced inventory management</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-[#faa51a] rounded-full"></div>
                  <span className="text-gray-700">AI-powered analytics and insights</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-[#faa51a] rounded-full"></div>
                  <span className="text-gray-700">Multi-user access and permissions</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-[#faa51a] rounded-full"></div>
                  <span className="text-gray-700">Financial reporting and accounting</span>
                </div>
              </div>
              
              <Button 
                onClick={handleBusinessLogin}
                className="w-full bg-gradient-to-r from-[#040458] to-[#faa51a] hover:from-[#040458]/90 hover:to-[#faa51a]/90 text-white font-semibold py-3 text-lg"
              >
                Sign In as Business
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </CardContent>
          </Card>

          {/* Individual Account */}
          <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border-0 hover:shadow-3xl transition-all duration-300 hover:scale-105">
            <CardHeader className="text-center pb-4">
              <div className="w-20 h-20 bg-gradient-to-r from-[#faa51a] to-[#040458] rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="h-10 w-10 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-[#040458] mb-2">
                Individual Account
              </CardTitle>
              <CardDescription className="text-gray-600 text-lg">
                For personal use, freelancers, and small-scale operations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-[#faa51a] rounded-full"></div>
                  <span className="text-gray-700">Personal expense tracking</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-[#faa51a] rounded-full"></div>
                  <span className="text-gray-700">Simple income and expense management</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-[#faa51a] rounded-full"></div>
                  <span className="text-gray-700">Basic financial insights</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-[#faa51a] rounded-full"></div>
                  <span className="text-gray-700">Personal budget planning</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-[#faa51a] rounded-full"></div>
                  <span className="text-gray-700">Mobile-friendly interface</span>
                </div>
              </div>
              
              <Button 
                onClick={handleIndividualLogin}
                className="w-full bg-gradient-to-r from-[#faa51a] to-[#040458] hover:from-[#faa51a]/90 hover:to-[#040458]/90 text-white font-semibold py-3 text-lg"
              >
                Sign In as Individual
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center mt-12">
          <p className="text-white/80 mb-4">
            Don't have an account yet?
          </p>
          <div className="space-x-4">
            <Link to="/user-type">
              <Button 
                variant="outline" 
                className="bg-white/10 border-white/30 text-white hover:bg-white hover:text-[#040458] font-semibold"
              >
                Create Account
              </Button>
            </Link>
            <Link to="/">
              <Button 
                variant="ghost" 
                className="text-white/80 hover:text-white hover:bg-white/10 font-semibold"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginTypeSelection
