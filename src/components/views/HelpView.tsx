import { Fingerprint, UserPlus, Scan, Database, Cloud, CheckCircle, HelpCircle, Mail, MessageCircle, Book } from 'lucide-react';

const faqs = [
  {
    question: 'How accurate is the biometric fingerprint recognition?',
    answer: 'BioSync uses advanced fingerprint recognition technology with 99.9% accuracy. The system can identify individuals in less than 1 second with a False Acceptance Rate (FAR) of 0.001%.'
  },
  {
    question: 'What happens if a device goes offline?',
    answer: 'Devices store attendance data locally and automatically sync when connection is restored. No attendance records are lost during offline periods.'
  },
  {
    question: 'How is biometric data protected?',
    answer: 'All biometric data is encrypted using AES-256 encryption. Fingerprints are stored as mathematical templates, not actual images, ensuring privacy and compliance with GDPR and ISO 27001 standards.'
  },
  {
    question: 'Can I export attendance reports?',
    answer: 'Yes, you can export reports in PDF and Excel formats with customizable date ranges and filters. Reports can be scheduled for automatic delivery via email.'
  },
  {
    question: 'How many fingerprints can the system store?',
    answer: 'BioSync can store unlimited fingerprint records in the cloud. Each device can cache up to 10,000 fingerprint templates for offline matching.'
  },
  {
    question: 'What if someone forgets to check in?',
    answer: 'Administrators can manually mark attendance with proper authorization. All manual entries are logged in the audit trail for transparency.'
  },
];

const howItWorks = [
  {
    step: 1,
    title: 'Enroll',
    description: 'Register individuals by capturing their fingerprint using a BioSync scanner. Personal details and biometric data are securely stored.',
    icon: UserPlus,
    color: 'bg-[#CDFF00]'
  },
  {
    step: 2,
    title: 'Match',
    description: 'When checking in, the scanner captures the fingerprint and matches it against enrolled templates in under 1 second.',
    icon: Scan,
    color: 'bg-blue-500'
  },
  {
    step: 3,
    title: 'Log',
    description: 'Successful matches are logged with timestamp and location. Attendance records are stored locally on the device.',
    icon: Database,
    color: 'bg-purple-500'
  },
  {
    step: 4,
    title: 'Sync',
    description: 'Devices automatically sync attendance data to the cloud every 5 minutes. Access reports from anywhere, anytime.',
    icon: Cloud,
    color: 'bg-green-500'
  },
];

export function HelpView() {
  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-black mb-2">Help & About</h1>
        <p className="text-gray-600">Product overview, documentation, and support</p>
      </div>

      {/* Product Overview */}
      <div className="bg-gradient-to-r from-black to-gray-900 rounded-xl p-8 shadow-lg mb-8">
        <div className="flex items-start gap-6">
          <div className="bg-[#CDFF00] p-4 rounded-xl">
            <Fingerprint className="w-12 h-12 text-black" />
          </div>
          <div className="flex-1">
            <h2 className="text-[#CDFF00] mb-3">About BioSync</h2>
            <p className="text-white mb-4">
              BioSync is an enterprise-grade biometric attendance management system designed for educational institutions, 
              corporate offices, and large organizations. Our solution combines cutting-edge fingerprint recognition technology 
              with powerful cloud-based analytics to provide accurate, secure, and efficient attendance tracking.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-[#CDFF00] mb-1">Version</p>
                <p className="text-white">2.4.0 Enterprise</p>
              </div>
              <div>
                <p className="text-[#CDFF00] mb-1">Release Date</p>
                <p className="text-white">December 2025</p>
              </div>
              <div>
                <p className="text-[#CDFF00] mb-1">License</p>
                <p className="text-white">Enterprise Unlimited</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 mb-8">
        <div className="text-center mb-8">
          <h2 className="text-black mb-2">How BioSync Works</h2>
          <p className="text-gray-600">A simple 4-step process from enrollment to cloud sync</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {howItWorks.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.step} className="relative">
                <div className="text-center">
                  <div className={`${item.color} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="mb-2">
                    <span className="inline-block w-8 h-8 bg-gray-100 rounded-full text-black leading-8">
                      {item.step}
                    </span>
                  </div>
                  <h3 className="text-black mb-2">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
                {item.step < 4 && (
                  <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-gray-200 -z-10" />
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-8 flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle className="w-6 h-6 text-green-600" />
          <p className="text-green-900">
            Complete attendance cycle from scan to cloud sync in under 10 seconds
          </p>
        </div>
      </div>

      {/* FAQs */}
      <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 mb-8">
        <div className="flex items-center gap-3 mb-6">
          <HelpCircle className="w-6 h-6 text-[#CDFF00]" />
          <h2 className="text-black">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-6 hover:border-[#CDFF00] transition-colors">
              <h3 className="text-black mb-3">{faq.question}</h3>
              <p className="text-gray-600">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Support Contact */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="bg-blue-500 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
            <Mail className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-black mb-2">Email Support</h3>
          <p className="text-gray-600 mb-4">Get help from our support team</p>
          <a href="mailto:support@biosync.com" className="text-blue-600 hover:underline">
            support@biosync.com
          </a>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="bg-[#CDFF00] w-12 h-12 rounded-lg flex items-center justify-center mb-4">
            <MessageCircle className="w-6 h-6 text-black" />
          </div>
          <h3 className="text-black mb-2">Live Chat</h3>
          <p className="text-gray-600 mb-4">Chat with us in real-time</p>
          <button className="text-blue-600 hover:underline">
            Start Chat →
          </button>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="bg-purple-500 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
            <Book className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-black mb-2">Documentation</h3>
          <p className="text-gray-600 mb-4">Comprehensive guides and API docs</p>
          <button className="text-blue-600 hover:underline">
            View Docs →
          </button>
        </div>
      </div>

      {/* Technical Specifications */}
      <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 mt-6">
        <h2 className="text-black mb-6">Technical Specifications</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-black mb-3">Biometric Engine</h3>
            <div className="space-y-2 text-gray-600">
              <p>• Recognition Algorithm: Neural Network ML</p>
              <p>• Matching Speed: &lt; 1 second</p>
              <p>• False Acceptance Rate: 0.001%</p>
              <p>• False Rejection Rate: 0.01%</p>
              <p>• Template Size: 512 bytes</p>
            </div>
          </div>
          <div>
            <h3 className="text-black mb-3">System Capacity</h3>
            <div className="space-y-2 text-gray-600">
              <p>• Max Users: Unlimited (cloud)</p>
              <p>• Device Cache: 10,000 templates</p>
              <p>• Concurrent Devices: Unlimited</p>
              <p>• Transaction Logging: Real-time</p>
              <p>• Data Retention: Configurable</p>
            </div>
          </div>
          <div>
            <h3 className="text-black mb-3">Security & Compliance</h3>
            <div className="space-y-2 text-gray-600">
              <p>• Encryption: AES-256</p>
              <p>• Data Privacy: GDPR Compliant</p>
              <p>• Security Standard: ISO 27001</p>
              <p>• Audit Logging: Complete trail</p>
              <p>• Role-Based Access: Multi-level</p>
            </div>
          </div>
          <div>
            <h3 className="text-black mb-3">Platform & Integration</h3>
            <div className="space-y-2 text-gray-600">
              <p>• Cloud Infrastructure: AWS/Azure</p>
              <p>• API: RESTful JSON</p>
              <p>• Webhooks: Event-driven</p>
              <p>• Export Formats: PDF, Excel, CSV</p>
              <p>• Uptime SLA: 99.99%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
