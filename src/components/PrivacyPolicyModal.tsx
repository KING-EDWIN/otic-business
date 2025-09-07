import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { X, CheckCircle, FileText, Shield, Clock } from "lucide-react";

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
}

const PrivacyPolicyModal = ({ isOpen, onClose, onAccept }: PrivacyPolicyModalProps) => {
  const [hasRead, setHasRead] = useState(false);
  const [isAccepted, setIsAccepted] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  const handleAccept = () => {
    if (isAccepted) {
      onAccept();
    }
  };

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
    const progress = (scrollTop / (scrollHeight - clientHeight)) * 100;
    setScrollProgress(progress);
    
    // Auto-mark as read when user scrolls to 80% of the content
    if (progress >= 80 && !hasRead) {
      setHasRead(true);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setHasRead(false);
      setIsAccepted(false);
      setScrollProgress(0);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[95vh] p-0 bg-gradient-to-br from-white to-gray-50">
        <DialogHeader className="p-6 pb-4 bg-gradient-to-r from-[#040458] to-[#faa51a] text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <Shield className="h-6 w-6" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold">
                  Privacy Policy & Terms of Service
                </DialogTitle>
                <p className="text-white/90 text-sm mt-1">
                  Please read and accept our privacy policy to continue
                </p>
              </div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-white/80 mb-2">
              <span>Reading Progress</span>
              <span>{Math.round(scrollProgress)}%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div 
                className="bg-white rounded-full h-2 transition-all duration-300 ease-out"
                style={{ width: `${scrollProgress}%` }}
              />
            </div>
          </div>
        </DialogHeader>
        
        <ScrollArea className="max-h-[60vh] px-6" onScrollCapture={handleScroll}>
          <div className="prose prose-sm max-w-none py-6">
            <h1>Privacy Policy</h1>
            <p>Last updated: September 07, 2025</p>
            <p>This Privacy Policy describes Our policies and procedures on the collection, use and disclosure of Your information when You use the Service and tells You about Your privacy rights and how the law protects You.</p>
            <p>We use Your Personal data to provide and improve the Service. By using the Service, You agree to the collection and use of information in accordance with this Privacy Policy. This Privacy Policy has been created with the help of the <a href="https://www.freeprivacypolicy.com/free-privacy-policy-generator/" target="_blank" rel="noopener noreferrer" className="text-[#040458] hover:underline">Free Privacy Policy Generator</a>.</p>
            
            <h2>Interpretation and Definitions</h2>
            <h3>Interpretation</h3>
            <p>The words of which the initial letter is capitalized have meanings defined under the following conditions. The following definitions shall have the same meaning regardless of whether they appear in singular or in plural.</p>
            
            <h3>Definitions</h3>
            <p>For the purposes of this Privacy Policy:</p>
            <ul>
              <li><p><strong>Account</strong> means a unique account created for You to access our Service or parts of our Service.</p></li>
              <li><p><strong>Affiliate</strong> means an entity that controls, is controlled by or is under common control with a party, where "control" means ownership of 50% or more of the shares, equity interest or other securities entitled to vote for election of directors or other managing authority.</p></li>
              <li><p><strong>Company</strong> (referred to as either "the Company", "We", "Us" or "Our" in this Agreement) refers to OTIC FOUNDATION, Kampala.</p></li>
              <li><p><strong>Cookies</strong> are small files that are placed on Your computer, mobile device or any other device by a website, containing the details of Your browsing history on that website among its many uses.</p></li>
              <li><p><strong>Country</strong> refers to: Uganda</p></li>
              <li><p><strong>Device</strong> means any device that can access the Service such as a computer, a cellphone or a digital tablet.</p></li>
              <li><p><strong>Personal Data</strong> is any information that relates to an identified or identifiable individual.</p></li>
              <li><p><strong>Service</strong> refers to the Website.</p></li>
              <li><p><strong>Service Provider</strong> means any natural or legal person who processes the data on behalf of the Company. It refers to third-party companies or individuals employed by the Company to facilitate the Service, to provide the Service on behalf of the Company, to perform services related to the Service or to assist the Company in analyzing how the Service is used.</p></li>
              <li><p><strong>Usage Data</strong> refers to data collected automatically, either generated by the use of the Service or from the Service infrastructure itself (for example, the duration of a page visit).</p></li>
              <li><p><strong>Website</strong> refers to Otic business, accessible from <a href="https://otic-businesssss.vercel.app" rel="external nofollow noopener" target="_blank" className="text-[#040458] hover:underline">https://otic-businesssss.vercel.app</a></p></li>
              <li><p><strong>You</strong> means the individual accessing or using the Service, or the company, or other legal entity on behalf of which such individual is accessing or using the Service, as applicable.</p></li>
            </ul>
            
            <h2>Collecting and Using Your Personal Data</h2>
            <h3>Types of Data Collected</h3>
            <h4>Personal Data</h4>
            <p>While using Our Service, We may ask You to provide Us with certain personally identifiable information that can be used to contact or identify You. Personally identifiable information may include, but is not limited to:</p>
            <ul>
              <li><p>Email address</p></li>
              <li><p>First name and last name</p></li>
              <li><p>Phone number</p></li>
              <li><p>Address, State, Province, ZIP/Postal code, City</p></li>
              <li><p>Usage Data</p></li>
            </ul>
            
            <h4>Usage Data</h4>
            <p>Usage Data is collected automatically when using the Service.</p>
            <p>Usage Data may include information such as Your Device's Internet Protocol address (e.g. IP address), browser type, browser version, the pages of our Service that You visit, the time and date of Your visit, the time spent on those pages, unique device identifiers and other diagnostic data.</p>
            <p>When You access the Service by or through a mobile device, We may collect certain information automatically, including, but not limited to, the type of mobile device You use, Your mobile device unique ID, the IP address of Your mobile device, Your mobile operating system, the type of mobile Internet browser You use, unique device identifiers and other diagnostic data.</p>
            <p>We may also collect information that Your browser sends whenever You visit our Service or when You access the Service by or through a mobile device.</p>
            
            <h4>Tracking Technologies and Cookies</h4>
            <p>We use Cookies and similar tracking technologies to track the activity on Our Service and store certain information. Tracking technologies used are beacons, tags, and scripts to collect and track information and to improve and analyze Our Service. The technologies We use may include:</p>
            <ul>
              <li><strong>Cookies or Browser Cookies.</strong> A cookie is a small file placed on Your Device. You can instruct Your browser to refuse all Cookies or to indicate when a Cookie is being sent. However, if You do not accept Cookies, You may not be able to use some parts of our Service. Unless you have adjusted Your browser setting so that it will refuse Cookies, our Service may use Cookies.</li>
              <li><strong>Web Beacons.</strong> Certain sections of our Service and our emails may contain small electronic files known as web beacons (also referred to as clear gifs, pixel tags, and single-pixel gifs) that permit the Company, for example, to count users who have visited those pages or opened an email and for other related website statistics (for example, recording the popularity of a certain section and verifying system and server integrity).</li>
            </ul>
            
            <p>Cookies can be "Persistent" or "Session" Cookies. Persistent Cookies remain on Your personal computer or mobile device when You go offline, while Session Cookies are deleted as soon as You close Your web browser. Learn more about cookies on the <a href="https://www.freeprivacypolicy.com/blog/sample-privacy-policy-template/#Use_Of_Cookies_And_Tracking" target="_blank" rel="noopener noreferrer" className="text-[#040458] hover:underline">Free Privacy Policy website</a> article.</p>
            
            <h3>Use of Your Personal Data</h3>
            <p>The Company may use Personal Data for the following purposes:</p>
            <ul>
              <li><p><strong>To provide and maintain our Service</strong>, including to monitor the usage of our Service.</p></li>
              <li><p><strong>To manage Your Account:</strong> to manage Your registration as a user of the Service. The Personal Data You provide can give You access to different functionalities of the Service that are available to You as a registered user.</p></li>
              <li><p><strong>For the performance of a contract:</strong> the development, compliance and undertaking of the purchase contract for the products, items or services You have purchased or of any other contract with Us through the Service.</p></li>
              <li><p><strong>To contact You:</strong> To contact You by email, telephone calls, SMS, or other equivalent forms of electronic communication, such as a mobile application's push notifications regarding updates or informative communications related to the functionalities, products or contracted services, including the security updates, when necessary or reasonable for their implementation.</p></li>
              <li><p><strong>To provide You</strong> with news, special offers and general information about other goods, services and events which we offer that are similar to those that you have already purchased or enquired about unless You have opted not to receive such information.</p></li>
              <li><p><strong>To manage Your requests:</strong> To attend and manage Your requests to Us.</p></li>
              <li><p><strong>For business transfers:</strong> We may use Your information to evaluate or conduct a merger, divestiture, restructuring, reorganization, dissolution, or other sale or transfer of some or all of Our assets, whether as a going concern or as part of bankruptcy, liquidation, or similar proceeding, in which Personal Data held by Us about our Service users is among the assets transferred.</p></li>
              <li><p><strong>For other purposes</strong>: We may use Your information for other purposes, such as data analysis, identifying usage trends, determining the effectiveness of our promotional campaigns and to evaluate and improve our Service, products, services, marketing and your experience.</p></li>
            </ul>
            
            <h3>Security of Your Personal Data</h3>
            <p>The security of Your Personal Data is important to Us, but remember that no method of transmission over the Internet, or method of electronic storage is 100% secure. While We strive to use commercially acceptable means to protect Your Personal Data, We cannot guarantee its absolute security.</p>
            
            <h2>Children's Privacy</h2>
            <p>Our Service does not address anyone under the age of 13. We do not knowingly collect personally identifiable information from anyone under the age of 13. If You are a parent or guardian and You are aware that Your child has provided Us with Personal Data, please contact Us. If We become aware that We have collected Personal Data from anyone under the age of 13 without verification of parental consent, We take steps to remove that information from Our servers.</p>
            
            <h2>Changes to this Privacy Policy</h2>
            <p>We may update Our Privacy Policy from time to time. We will notify You of any changes by posting the new Privacy Policy on this page.</p>
            <p>We will let You know via email and/or a prominent notice on Our Service, prior to the change becoming effective and update the "Last updated" date at the top of this Privacy Policy.</p>
            <p>You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.</p>
            
            <h2>Contact Us</h2>
            <p>If you have any questions about this Privacy Policy, You can contact us:</p>
            <ul>
              <li><p>By email: hello@oticbusiness.com</p></li>
              <li><p>By phone number: +256 700 123 456</p></li>
            </ul>
          </div>
        </ScrollArea>
        
        <div className="p-6 border-t bg-gray-50 rounded-b-lg">
          {/* Status Indicators */}
          <div className="flex items-center justify-center space-x-6 mb-6">
            <div className="flex items-center space-x-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                hasRead ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
              }`}>
                {hasRead ? <CheckCircle className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
              </div>
              <span className={`text-sm font-medium ${
                hasRead ? 'text-green-600' : 'text-gray-500'
              }`}>
                {hasRead ? 'Read' : 'Reading Required'}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                isAccepted ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
              }`}>
                {isAccepted ? <CheckCircle className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
              </div>
              <span className={`text-sm font-medium ${
                isAccepted ? 'text-green-600' : 'text-gray-500'
              }`}>
                {isAccepted ? 'Accepted' : 'Acceptance Required'}
              </span>
            </div>
          </div>

          {/* Checkboxes */}
          <div className="space-y-4 mb-6">
            <div className="flex items-start space-x-3 p-4 bg-white rounded-lg border border-gray-200">
              <Checkbox
                id="read-checkbox"
                checked={hasRead}
                onCheckedChange={(checked) => setHasRead(checked as boolean)}
                className="mt-1"
              />
              <div className="flex-1">
                <label htmlFor="read-checkbox" className="text-sm font-medium text-gray-700 cursor-pointer">
                  I have read and understood the Privacy Policy
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  {hasRead ? '✓ Policy has been read' : 'Please scroll through the policy above'}
                </p>
              </div>
            </div>
            
            <div className={`flex items-start space-x-3 p-4 rounded-lg border ${
              hasRead ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-100'
            }`}>
              <Checkbox
                id="accept-checkbox"
                checked={isAccepted}
                onCheckedChange={(checked) => setIsAccepted(checked as boolean)}
                disabled={!hasRead}
                className="mt-1"
              />
              <div className="flex-1">
                <label 
                  htmlFor="accept-checkbox" 
                  className={`text-sm font-medium cursor-pointer ${
                    hasRead ? 'text-gray-700' : 'text-gray-400'
                  }`}
                >
                  I accept the Privacy Policy and Terms of Service
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  {!hasRead ? 'Please read the policy first' : 
                   isAccepted ? '✓ Terms accepted' : 'Required to continue'}
                </p>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex justify-between items-center">
            <div className="text-xs text-gray-500">
              <Badge variant="outline" className="text-xs">
                <Shield className="h-3 w-3 mr-1" />
                Secure & Compliant
              </Badge>
            </div>
            
            <div className="flex space-x-3">
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
                Accept Terms & Continue
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PrivacyPolicyModal;
