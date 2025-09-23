import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Mail, Phone, MapPin, Send, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";

const Contact = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Auto-fill email if user is logged in
      const emailToUse = user?.email || formData.email;
      
      // Create contact message record
      const { data, error } = await supabase
        .from('contact_messages')
        .insert([{
          name: formData.name,
          email: emailToUse,
          subject: formData.subject,
          message: formData.message,
          user_id: user?.id || null,
          status: 'new',
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        console.error('Error submitting contact form:', error);
        toast.error('Failed to send message. Please try again.');
        return;
      }

      // Send notification email to admin (using Supabase Edge Function)
      try {
        const { error: emailError } = await supabase.functions.invoke('send-contact-notification', {
          body: {
            contactId: data.id,
            name: formData.name,
            email: emailToUse,
            subject: formData.subject,
            message: formData.message,
            userId: user?.id || null
          }
        });

        if (emailError) {
          console.warn('Email notification failed:', emailError);
          // Don't fail the form submission if email fails
        }
      } catch (emailError) {
        console.warn('Email notification error:', emailError);
        // Don't fail the form submission if email fails
      }

      toast.success('Message sent successfully! We\'ll get back to you within 24 hours.');
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });

    } catch (error) {
      console.error('Contact form error:', error);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Auto-fill email if user is logged in
  useState(() => {
    if (user?.email && !formData.email) {
      setFormData(prev => ({ ...prev, email: user.email }));
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-[#040458] to-[#faa51a] rounded-lg flex items-center justify-center">
                <Mail className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Contact Us</h1>
                <p className="text-gray-600">Get in touch with our team</p>
              </div>
            </div>
            <Link to="/">
              <Button variant="outline" className="flex items-center space-x-2">
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Home</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Send className="h-6 w-6 text-[#040458]" />
                <span>Send us a Message</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full"
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full"
                      placeholder="your.email@example.com"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                    Subject
                  </label>
                  <Input
                    id="subject"
                    name="subject"
                    type="text"
                    required
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full"
                    placeholder="What's this about?"
                  />
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Message
                  </label>
                  <Textarea
                    id="message"
                    name="message"
                    required
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full min-h-[120px]"
                    placeholder="Tell us how we can help you..."
                  />
                </div>
                
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-[#040458] hover:bg-[#faa51a] text-white disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Send Message
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Mail className="h-6 w-6 text-[#040458]" />
                  <span>Get in Touch</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-start space-x-4">
                  <Mail className="h-6 w-6 text-[#faa51a] mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Email</h3>
                    <p className="text-gray-600">info@oticbusiness.com</p>
                    <p className="text-sm text-gray-500">We'll respond within 24 hours</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <Phone className="h-6 w-6 text-[#faa51a] mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Phone</h3>
                    <p className="text-gray-600">+256 700 123 456</p>
                    <p className="text-sm text-gray-500">Mon-Fri 9AM-6PM EAT</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <MapPin className="h-6 w-6 text-[#faa51a] mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Office</h3>
                    <p className="text-gray-600">Kampala, Uganda</p>
                    <p className="text-sm text-gray-500">East Africa</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Why Contact Us?</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-[#faa51a] rounded-full mt-2"></div>
                    <span>Get help with your business setup</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-[#faa51a] rounded-full mt-2"></div>
                    <span>Technical support and troubleshooting</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-[#faa51a] rounded-full mt-2"></div>
                    <span>Custom solutions for your business</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-[#faa51a] rounded-full mt-2"></div>
                    <span>Partnership and collaboration opportunities</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;

