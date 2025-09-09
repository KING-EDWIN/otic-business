import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Building2, Users, Target, Award, Shield, FileText } from "lucide-react";
import { Link } from "react-router-dom";

const About = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">About OTIC Business</h1>
                <p className="text-gray-600">Empowering businesses with intelligent solutions</p>
              </div>
            </div>
            <Link to="/">
              <Button variant="outline" className="flex items-center space-x-2">
                <ArrowRight className="h-4 w-4" />
                <span>Back to Home</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Transforming Business Operations with AI-Powered Solutions
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            OTIC Foundation is dedicated to empowering businesses across Uganda with cutting-edge 
            technology solutions that streamline operations, enhance productivity, and drive growth.
          </p>
        </div>

        {/* Mission & Vision */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-6 w-6 text-blue-600" />
                <span>Our Mission</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                To democratize access to advanced business management tools by providing 
                affordable, intelligent solutions that help small and medium enterprises 
                compete effectively in the digital economy.
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Award className="h-6 w-6 text-purple-600" />
                <span>Our Vision</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                To become the leading provider of AI-powered business solutions in East Africa, 
                enabling every business to harness the power of technology for sustainable growth.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* What We Offer */}
        <div className="mb-16">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">What We Offer</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Building2 className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle>POS System</CardTitle>
                <CardDescription>
                  Complete point-of-sale solution with barcode scanning
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Mobile POS with barcode scanning</li>
                  <li>• Receipt generation</li>
                  <li>• Multiple payment methods</li>
                  <li>• Real-time inventory updates</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle>Inventory Management</CardTitle>
                <CardDescription>
                  Smart inventory tracking and management
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Real-time stock tracking</li>
                  <li>• Automated reorder alerts</li>
                  <li>• Multi-location support</li>
                  <li>• Supplier management</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="h-8 w-8 text-purple-600" />
                </div>
                <CardTitle>AI Analytics</CardTitle>
                <CardDescription>
                  Intelligent insights and forecasting
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Sales trend analysis</li>
                  <li>• Financial forecasting</li>
                  <li>• Customer behavior insights</li>
                  <li>• Performance optimization</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Pricing Tiers */}
        <div className="mb-16">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">Flexible Pricing Plans</h3>
          <div className="grid md:grid-cols-4 gap-6">
            <Card className="text-center">
              <CardHeader>
                <Badge variant="secondary" className="w-fit mx-auto">Free Trial</Badge>
                <CardTitle className="text-2xl">0 UGX</CardTitle>
                <CardDescription>30 days free</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">Try everything for free</p>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• Full access to all features</li>
                  <li>• POS system</li>
                  <li>• Inventory management</li>
                  <li>• AI analytics</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="text-center border-2 border-blue-500 relative">
              <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-blue-500">Popular</Badge>
              <CardHeader>
                <CardTitle className="text-2xl">Start Smart</CardTitle>
                <CardDescription>1m UGX Per Month</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">Perfect for small businesses</p>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• Mobile POS</li>
                  <li>• Basic inventory</li>
                  <li>• Sales reporting</li>
                  <li>• Single user</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <CardTitle className="text-2xl">Grow Intelligence</CardTitle>
                <CardDescription>3m UGX Per Month</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">Ideal for growing SMEs</p>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• Everything in Start Smart</li>
                  <li>• QuickBooks integration</li>
                  <li>• AI analytics</li>
                  <li>• Multi-user (up to 5)</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <CardTitle className="text-2xl">Enterprise</CardTitle>
                <CardDescription>5m UGX Per Month</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">Enterprise solution</p>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• Everything in Grow</li>
                  <li>• Multi-branch sync</li>
                  <li>• Advanced compliance</li>
                  <li>• Unlimited users</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Contact Information */}
        <div className="mb-16">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">Get in Touch</h3>
          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Building2 className="h-6 w-6 text-blue-600" />
                  <span>Contact Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="font-semibold text-gray-900">Email</p>
                  <p className="text-gray-600">info@oticbusiness.com</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Phone</p>
                  <p className="text-gray-600">+256 700 123 456</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Location</p>
                  <p className="text-gray-600">Kampala, Uganda</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-6 w-6 text-green-600" />
                  <span>Legal & Compliance</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600 mb-4">
                  We are committed to transparency and protecting your privacy. 
                  Review our terms and policies to understand how we handle your data.
                </p>
                <div className="space-y-2">
                  <Link to="/terms">
                    <Button variant="outline" className="w-full justify-start">
                      <FileText className="h-4 w-4 mr-2" />
                      Terms & Conditions
                    </Button>
                  </Link>
                  <Link to="/privacy">
                    <Button variant="outline" className="w-full justify-start">
                      <Shield className="h-4 w-4 mr-2" />
                      Privacy Policy
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-white">
          <h3 className="text-3xl font-bold mb-4">Ready to Transform Your Business?</h3>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of businesses already using OTIC Business to streamline their operations.
          </p>
          <div className="space-x-4">
            <Link to="/get-started">
              <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100">
                Get Started Free
              </Button>
            </Link>
            <Link to="/signup">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                Sign Up Now
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
