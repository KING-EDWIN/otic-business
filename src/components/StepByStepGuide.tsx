import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, ArrowRight, Users, BarChart3, Smartphone, ShieldCheck } from "lucide-react";

const StepByStepGuide = () => {
  const steps = [
    {
      number: "01",
      title: "Sign Up & Choose Your Plan",
      description: "Create your account and select the perfect plan for your business needs. Start with our 14-day free trial.",
      icon: Users,
      color: "from-blue-500 to-blue-600"
    },
    {
      number: "02", 
      title: "Set Up Your Business Profile",
      description: "Add your business information, upload your logo, and configure your preferences in minutes.",
      icon: BarChart3,
      color: "from-green-500 to-green-600"
    },
    {
      number: "03",
      title: "Import Your Data",
      description: "Easily import your existing inventory, customer data, and sales history with our simple import tools.",
      icon: Smartphone,
      color: "from-purple-500 to-purple-600"
    },
    {
      number: "04",
      title: "Start Managing Your Business",
      description: "Begin using our POS system, track inventory, analyze sales, and grow your business with AI insights.",
      icon: ShieldCheck,
      color: "from-orange-500 to-orange-600"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-[#faa51a]/10 text-[#faa51a] border-[#faa51a]/20">
            Simple Setup Process
          </Badge>
          <h2 className="text-4xl lg:text-5xl font-bold text-[#040458] mb-6">
            Get Started in 4 Easy Steps
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Transform your business operations in minutes, not months. Our streamlined setup process gets you up and running quickly.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={step.number} className="relative">
              <Card className="h-full bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                <CardHeader className="text-center pb-4">
                  <div className={`w-16 h-16 bg-gradient-to-r ${step.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <step.icon className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-6xl font-bold text-gray-200 absolute top-4 right-4 -z-10">
                    {step.number}
                  </div>
                  <CardTitle className="text-xl font-bold text-[#040458] mb-2">
                    {step.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600 text-center leading-relaxed">
                    {step.description}
                  </CardDescription>
                </CardContent>
              </Card>
              
              {/* Arrow between steps */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                  <ArrowRight className="h-8 w-8 text-[#faa51a]" />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <div className="inline-flex items-center space-x-2 text-[#040458] font-semibold">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span>Average setup time: 15 minutes</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StepByStepGuide;
