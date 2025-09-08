import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckCircle, FileText, Shield } from "lucide-react";

interface TermsAndConditionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
}

const TermsAndConditionsModal = ({ isOpen, onClose, onAccept }: TermsAndConditionsModalProps) => {
  const [hasRead, setHasRead] = useState(false);
  const [isAccepted, setIsAccepted] = useState(false);

  const handleAccept = () => {
    if (isAccepted) {
      onAccept();
    }
  };

  const handleReadChange = (checked: boolean) => {
    setHasRead(checked);
    if (checked) {
      // Auto-enable accept when read is checked
      setIsAccepted(true);
    } else {
      setIsAccepted(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 bg-gradient-to-r from-[#040458] to-[#faa51a] text-white rounded-t-lg">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold">
                Terms & Conditions
              </DialogTitle>
              <p className="text-white/90 text-sm mt-1">
                Please read and accept our terms to continue
              </p>
            </div>
          </div>
        </DialogHeader>
        
        <ScrollArea className="max-h-[50vh] px-6 py-4">
          <div className="prose prose-sm max-w-none">
            <h2>Terms of Service</h2>
            <p><strong>Last updated:</strong> September 07, 2025</p>
            
            <h3>1. Acceptance of Terms</h3>
            <p>By accessing and using OTIC Business Solution, you accept and agree to be bound by the terms and provision of this agreement.</p>
            
            <h3>2. Use License</h3>
            <p>Permission is granted to temporarily use OTIC Business Solution for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:</p>
            <ul>
              <li>modify or copy the materials</li>
              <li>use the materials for any commercial purpose or for any public display</li>
              <li>attempt to reverse engineer any software contained in the service</li>
              <li>remove any copyright or other proprietary notations from the materials</li>
            </ul>
            
            <h3>3. Privacy Policy</h3>
            <p>Your privacy is important to us. Our Privacy Policy explains how we collect, use, and protect your information when you use our service.</p>
            
            <h3>4. User Accounts</h3>
            <p>When you create an account with us, you must provide information that is accurate, complete, and current at all times. You are responsible for safeguarding the password and for all activities that occur under your account.</p>
            
            <h3>5. Prohibited Uses</h3>
            <p>You may not use our service:</p>
            <ul>
              <li>For any unlawful purpose or to solicit others to perform unlawful acts</li>
              <li>To violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances</li>
              <li>To infringe upon or violate our intellectual property rights or the intellectual property rights of others</li>
              <li>To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate</li>
            </ul>
            
            <h3>6. Service Availability</h3>
            <p>We reserve the right to withdraw or amend our service, and any service or material we provide, in our sole discretion without notice. We will not be liable if for any reason all or any part of the service is unavailable at any time or for any period.</p>
            
            <h3>7. Limitation of Liability</h3>
            <p>In no event shall OTIC Foundation, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your use of the service.</p>
            
            <h3>8. Governing Law</h3>
            <p>These Terms shall be interpreted and governed by the laws of Uganda, without regard to its conflict of law provisions.</p>
            
            <h3>9. Contact Information</h3>
            <p>If you have any questions about these Terms and Conditions, please contact us at:</p>
            <ul>
              <li>Email: info@oticfoundation.org</li>
              <li>Phone: +256 700 123 456</li>
              <li>Address: Kampala, Uganda</li>
            </ul>
          </div>
        </ScrollArea>
        
        <div className="p-6 border-t bg-gray-50">
          <div className="space-y-4">
            <div className="flex items-start space-x-3 p-4 bg-white rounded-lg border">
              <Checkbox
                id="read-terms"
                checked={hasRead}
                onCheckedChange={handleReadChange}
                className="mt-1"
              />
              <div className="flex-1">
                <label htmlFor="read-terms" className="text-sm font-medium text-gray-700 cursor-pointer">
                  I have read and understood the Terms & Conditions
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  {hasRead ? '✓ Terms have been read and accepted' : 'Please check this box to continue'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 mt-6">
            <Button
              variant="outline"
              onClick={onClose}
              className="border-gray-300 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAccept}
              disabled={!isAccepted}
              className="bg-[#040458] hover:bg-[#030345] text-white disabled:opacity-50 disabled:cursor-not-allowed px-6"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Accept & Continue
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TermsAndConditionsModal;
