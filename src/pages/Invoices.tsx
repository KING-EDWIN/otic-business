import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Invoices = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-[#040458] to-[#faa51a] rounded-full flex items-center justify-center mb-4">
            <FileText className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-[#040458]">Invoicing System</CardTitle>
          <CardDescription className="text-gray-600">
            Coming Soon
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-center text-gray-500">
            <Clock className="h-4 w-4 mr-2" />
            <span className="text-sm">This feature is under development</span>
          </div>
          <p className="text-sm text-gray-600">
            We're working hard to bring you a comprehensive invoicing system that will integrate seamlessly with your business management tools.
          </p>
          <Button 
            onClick={() => navigate('/dashboard')}
            className="w-full bg-[#040458] hover:bg-[#040458]/90 text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Invoices;