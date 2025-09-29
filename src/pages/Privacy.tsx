import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Shield } from "lucide-react";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <Card className="shadow-xl">
          <CardHeader className="bg-gradient-to-r from-[#040458] to-[#faa51a] text-white rounded-t-lg">
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <Shield className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold">
                  OTIC TECHNOLOGIES LIMITED DATA PRIVACY AND PROTECTION POLICY
                </CardTitle>
                <p className="text-white/90 text-sm mt-1">
                  Last updated: September 27, 2025
                </p>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
            <ScrollArea className="max-h-[80vh] px-6">
              <div className="prose prose-sm max-w-none py-6">
                <h2>1.0 INTRODUCTION</h2>
                <p>At Otic Technologies Limited, we are committed to ensuring the lawful, secure, and ethical collection, use, and management of personal and institutional data and protecting of the right to privacy of our data subjects (our customers, employees, and other stake holders). This data privacy and protection policy outlines the guidelines, principles and procedures that govern how Otic Technologies Limited (herein after referred to as "the Company", "we", or "us") collects, processes, stores, shares, and disposes of data in a bid to ensure the protection and privacy of personal. It is designed to comply with the Data Privacy and Protection Laws of Uganda and the Regulations thereto.</p>
                
                <h2>2.0 DEFINITIONS</h2>
                <h3>2.1 Data:</h3>
                <p>means information which —</p>
                <ul>
                  <li>is processed by means of equipment operating automatically in response to instructions given for that purpose;</li>
                  <li>is recorded with the intention that it should be processed by means of such equipment;</li>
                  <li>is recorded as part of a relevant filing system or with the intention that it should form part of a relevant filing system; or</li>
                  <li>does not fall within paragraph (a), (b) or (c) but forms part of an accessible record;</li>
                </ul>
                
                <h3>2.2 Personal Data:</h3>
                <p>means information about a person from which the person can be identified, that is recorded in any form and includes data that relates to —</p>
                <ul>
                  <li>the nationality, age or marital status of the person;</li>
                  <li>the educational level, or occupation of the person;</li>
                  <li>an identification number, symbol or other particulars assigned to a person; identity data; or</li>
                  <li>other information which is in the possession of, or is likely to come into the possession of the data controller and includes an expression of opinion about the individual;</li>
                </ul>
                
                <h3>2.3 Data subject:</h3>
                <p>means an individual from whom or in respect of whom personal information has been requested, collected, collated, processed or stored;</p>
                
                <h3>2.4 Data collector:</h3>
                <p>means a person who collects personal data;</p>
                
                <h3>2.5 Data Controller:</h3>
                <p>means a person who alone, jointly with other persons or in common with other persons or as a statutory duty determines the purposes for and the manner in which personal data is processed or is to be processed;</p>
                
                <h3>2.6 Data Processor:</h3>
                <p>means a person other than an employee of the data controller who processes the data on behalf of the data controller;</p>
                
                <h3>2.7 Policy:</h3>
                <p>means the Otic Technologies Limited Privacy and Protection Policy.</p>
                
                <h2>3.0 SCOPE</h2>
                <h3>3.1</h3>
                <p>This Data Protection and Privacy policy is a critical need to the company because it is a move to adhere to the lawful requirement a data collector, controller or processor.</p>
                
                <h3>3.2</h3>
                <p>All the provisions therein apply and must be adhered to by all employees/staff, volunteers, contractors and third-party service providers so as the Company to meet the four corners of the law.</p>
                
                <h3>3.3</h3>
                <p>This policy covers data protection, records management, information security and provides links to other policies and procedures on the three areas.</p>
                
                <h2>4.0 POLICY STATEMENT</h2>
                <h3>4.1</h3>
                <p>Otic Technologies Limited, is committed to protect the privacy, integrity and authenticity of all personal data that is collected and processed from all data subjects and to address all complaints which may arise in case of mishandling of the same.</p>
                
                <h2>5.0 DATA PROTECTION PRINCIPLES AND DATA SUBJECT RIGHTS</h2>
                <h3>5.1 Data Protection Principles</h3>
                <p>Otic Technologies Limited is committed to upholding the following principles of data protection: -</p>
                <ul>
                  <li>the Company be accountable to the data subject for data collected, processed held or used;</li>
                  <li>the Company shall collect and process data fairly and lawfully;</li>
                  <li>the Company shall collect, process, use or hold adequate, relevant and not excessive or unnecessary personal data;</li>
                  <li>the Company shall retain personal data for the period authorised by law or for which the data is required;</li>
                  <li>the Company ensure quality of information collected, processed, used or held;</li>
                  <li>the Company shall ensure transparency and participation of the data subject in the collection, processing, use and holding of the personal data; and</li>
                  <li>the Company shall at all times observe security safeguards in respect of the data.</li>
                </ul>
                
                <h3>5.2 Data subject Rights</h3>
                <ul>
                  <li>A data subject has the right to request for the correction of his or her personal data.</li>
                  <li>A data subject has the right to know the purpose for which personal data is being collected.</li>
                  <li>A data subject has the right to request for the erasing of any personal data the company holds on him or her.</li>
                  <li>A data subject has the right to withdraw his or her consent at anytime in relation to collecting, controlling and processing of the personal data.</li>
                  <li>A data subject has the right to lodge complaints with the National Data Protection Office.</li>
                </ul>
                
                <h2>6.0 REPORTING DATA SECURITY BREACHES</h2>
                <p>All employees and contractors shall immediately report all security breaches that involve personal data to the Data Protection Officer of the Company and in return the DPO shall take all reasonable steps to remedy the breach.</p>
                
                <h3>6.1 Steps to be taken in case of a security breach</h3>
                <h4>6.1.1 Containment and Initial Response</h4>
                <p>The employees should take immediate action to stop the breach and prevent further unauthorized access to personal data.</p>
                <p>The employees should at all material times isolate the affected systems or devices from the network to prevent further damage and should preserve save logs, system data, and other relevant information that may be useful for investigations.</p>
                
                <h4>6.1.2 Notification</h4>
                <p>The employees should notify the following persons in case of any security breach;</p>
                <p><strong>Internal stakeholders</strong></p>
                <ul>
                  <li>The Data Protection Officer of the Company providing him or her detailed information about the incident or breach.</li>
                  <li>The management of the Company and IT and security team.</li>
                </ul>
                <p><strong>External stakeholders</strong></p>
                <ul>
                  <li>The data subjects to whose personal data has fallen victim to the breach.</li>
                  <li>The Personal Data Protection Office.</li>
                  <li>The Police.</li>
                </ul>
                
                <h4>6.1.3 Notify the affected individuals</h4>
                <p>The Data Protection Officer shall maintain transparent communication with all data subjects whose data was affected by the breach and provide clear information about; what happened, the potential risks and consequences and the steps that can be taken to protect themselves e.g. monitoring the accounts, changing passwords etc.</p>
                
                <h4>6.1.4 Cooperate with investigations</h4>
                <p>All employees should collaborate with internal and external investigators to determine the cause of the breach and implement measures to prevent further breaches.</p>
                
                <h2>7.0 STAFF AWARENESS</h2>
                <h3>7.1</h3>
                <p>All staff members shall be availed with a copy of this policy whenever possible by the company and in the alternative, the staff members can access the same on the Company website.</p>
                
                <h3>7.2</h3>
                <p>A summary pf the data protection guidelines and procedures of the Company will be pinned on a notice board that will be in a conspicuous place at the Company premises.</p>
                
                <h2>8.0 POLICY COMPLIANCE</h2>
                <h3>8.1</h3>
                <p>All staff must at all times comply with the policy and in case of non compliance by any staff member, he or she shall be subjected to any of the following disciplinary actions;</p>
                <ul>
                  <li>A reprimand.</li>
                  <li>Suspension for 1 month and without pay.</li>
                  <li>Dismissal from employment.</li>
                </ul>
                
                <h2>9.0 CONTACT INFORMATION</h2>
                <h3>9.1</h3>
                <p>The following are the contacts to call in case of any question in line with data protection and privacy in the company;</p>
                <p>info@oticgroup.net, legal@oticgroup.net</p>
                
                <h2>10.0 REVIEW AND APPROVAL</h2>
                <h3>10.1</h3>
                <p>All policies and procedures are reviewed by the Head Legal department and then forwarded to the CEO for approval.</p>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Privacy;
