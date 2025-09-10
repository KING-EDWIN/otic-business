import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Building2, Users, Target, Award, Shield, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const About = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-[#040458] via-purple-600 to-[#faa51a] text-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex items-center justify-center mb-8">
              <img 
                src="/Otic icon@2x.png" 
                alt="Otic Business Logo" 
                className="h-20 w-20 mr-4"
              />
              <div className="text-left">
                <h1 className="text-5xl lg:text-6xl font-bold mb-2">
                  About Otic Business
                </h1>
                <p className="text-xl lg:text-2xl opacity-90">
                  Empowering businesses with intelligent solutions
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Content */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-[#040458] mb-6">
            Transforming Business Operations with AI-Powered Solutions
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Otic Business is dedicated to empowering businesses across Uganda with cutting-edge 
            technology solutions that streamline operations, enhance productivity, and drive growth.
          </p>
        </div>

        {/* Mission & Vision */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <Card className="border-l-4 border-l-[#faa51a]">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-6 w-6 text-[#faa51a]" />
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

          <Card className="border-l-4 border-l-[#040458]">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Award className="h-6 w-6 text-[#040458]" />
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
          <h3 className="text-3xl font-bold text-center text-[#040458] mb-12">What We Offer</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-16 h-16 bg-[#faa51a]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Building2 className="h-8 w-8 text-[#faa51a]" />
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
                <div className="w-16 h-16 bg-[#040458]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-[#040458]" />
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
                <div className="w-16 h-16 bg-gradient-to-r from-[#faa51a]/10 to-[#040458]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="h-8 w-8 text-[#faa51a]" />
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
          <h3 className="text-3xl font-bold text-center text-[#040458] mb-12">Flexible Pricing Plans</h3>
          <div className="grid md:grid-cols-4 gap-6">
            <Card className="text-center">
              <CardHeader>
                <Badge variant="secondary" className="w-fit mx-auto">Free Trial</Badge>
                <CardTitle className="text-2xl">0 UGX</CardTitle>
                <CardDescription>14 days free</CardDescription>
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

            <Card className="text-center border-2 border-[#faa51a] relative">
              <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-[#faa51a]">Popular</Badge>
              <CardHeader>
                <CardTitle className="text-2xl">Start Smart</CardTitle>
                <CardDescription>1,000,000 UGX Per Month</CardDescription>
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
                <CardDescription>3,000,000 UGX Per Month</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">Ideal for growing SMEs</p>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• Everything in Start Smart</li>
                  <li>• Advanced financial reporting</li>
                  <li>• AI analytics</li>
                  <li>• Multi-user (up to 5)</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <CardTitle className="text-2xl">Enterprise</CardTitle>
                <CardDescription>5,000,000 UGX Per Month</CardDescription>
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
          <h3 className="text-3xl font-bold text-center text-[#040458] mb-12">Get in Touch</h3>
          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Building2 className="h-6 w-6 text-[#faa51a]" />
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
                  <Shield className="h-6 w-6 text-[#040458]" />
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
                    <Button variant="outline" className="w-full justify-start hover:bg-[#faa51a]/10 hover:border-[#faa51a]">
                      <FileText className="h-4 w-4 mr-2" />
                      Terms & Conditions
                    </Button>
                  </Link>
                  <Link to="/privacy">
                    <Button variant="outline" className="w-full justify-start hover:bg-[#040458]/10 hover:border-[#040458]">
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
        <div className="text-center bg-gradient-to-r from-[#040458] to-[#faa51a] rounded-2xl p-12 text-white">
          <h3 className="text-3xl font-bold mb-4">Ready to Transform Your Business?</h3>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of businesses already using Otic Business to streamline their operations.
          </p>
          <div className="space-x-4">
            <Link to="/get-started">
              <Button size="lg" variant="secondary" className="bg-white text-[#040458] hover:bg-gray-100">
                Get Started Free
              </Button>
            </Link>
            <Link to="/user-type">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-[#040458]">
                Sign Up Now
              </Button>
            </Link>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default About;
