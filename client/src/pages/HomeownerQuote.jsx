import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  FileText,
  Download,
  Mail,
  Phone,
  Home,
  CheckCircle,
  MessageSquare,
  ThumbsUp,
} from 'lucide-react';
import { Card, Button } from '../components/ui';
import {
  generateEstimateFromIntake,
  calculateEstimateTotals,
  formatCurrency,
  BUILD_TIERS,
} from '../lib/estimateHelpers';
import { getProject, updateProject } from '../services/api';

/**
 * HomeownerQuote - Professional quote view for homeowners
 *
 * Simplified scope:
 * - Clean, professional quote presentation
 * - Scope summary by area (transparent)
 * - "Looks Good" / "I Have Questions" response buttons
 * - No digital signature (contractor handles actual contracts)
 * - No payment schedule (varies by contractor)
 */
export function HomeownerQuote() {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lineItems, setLineItems] = useState([]);
  const [selectedTier, setSelectedTier] = useState('better');
  const [totals, setTotals] = useState({});
  const [responded, setResponded] = useState(false);
  const [responseType, setResponseType] = useState(null); // 'approved' | 'questions'

  // Load project data
  useEffect(() => {
    async function loadProject() {
      setLoading(true);
      const { data } = await getProject(projectId);
      if (data) {
        setProject(data);
        setSelectedTier(data.build_tier || 'better');

        // Check if already responded
        if (data.quote_response) {
          setResponded(true);
          setResponseType(data.quote_response);
        }

        // Generate estimate
        const estimate = generateEstimateFromIntake(data);
        setLineItems(estimate.lineItems);
        setTotals(calculateEstimateTotals(estimate.lineItems));
      }
      setLoading(false);
    }
    loadProject();
  }, [projectId]);

  // Group line items by category for display
  const groupedItems = lineItems.reduce((acc, item) => {
    const category = item.roomLabel || item.category || 'Other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(item);
    return acc;
  }, {});

  // Calculate category totals
  const getCategoryTotal = (items) => {
    const tierKey = `unitPrice${selectedTier.charAt(0).toUpperCase() + selectedTier.slice(1)}`;
    return items.reduce((sum, item) => sum + (item[tierKey] || 0) * item.quantity, 0);
  };

  // Handle "Looks Good" response
  const handleApprove = async () => {
    await updateProject(projectId, {
      quote_response: 'approved',
      quote_response_at: new Date().toISOString(),
    });
    setResponded(true);
    setResponseType('approved');
  };

  // Handle "I Have Questions" response
  const handleQuestions = async () => {
    await updateProject(projectId, {
      quote_response: 'questions',
      quote_response_at: new Date().toISOString(),
    });
    setResponded(true);
    setResponseType('questions');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="h-12 bg-gray-200 rounded animate-pulse" />
          <div className="h-96 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-3xl mx-auto">
          <p className="text-gray-500">Quote not found</p>
        </div>
      </div>
    );
  }

  const quoteTotal = totals[selectedTier] || totals.better || 0;
  const quoteDate = project.updated_at ? new Date(project.updated_at).toLocaleDateString() : new Date().toLocaleDateString();

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 print:static">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors print:hidden"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-charcoal">Project Quote</h1>
                <p className="text-sm text-gray-500">Quote #{projectId?.slice(-8)}</p>
              </div>
            </div>

            <Button variant="secondary" onClick={() => window.print()} className="print:hidden">
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* Company Header */}
        <Card className="p-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-charcoal">Hooomz Construction</h2>
              <p className="text-gray-500 mt-1">Quality Home Building & Renovation</p>
              <div className="mt-3 space-y-1 text-sm text-gray-600">
                <p className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  (506) 555-0123
                </p>
                <p className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  quotes@hooomz.com
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Quote Date</p>
              <p className="font-medium text-charcoal">{quoteDate}</p>
              <p className="text-sm text-gray-500 mt-2">Valid For</p>
              <p className="font-medium text-charcoal">30 Days</p>
            </div>
          </div>
        </Card>

        {/* Client & Project Info */}
        <Card className="p-6 mb-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
                Prepared For
              </h3>
              <p className="font-semibold text-charcoal">{project.client_name}</p>
              {project.client_email && <p className="text-gray-600">{project.client_email}</p>}
              {project.client_phone && <p className="text-gray-600">{project.client_phone}</p>}
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
                Project Location
              </h3>
              <p className="font-semibold text-charcoal flex items-center gap-2">
                <Home className="w-4 h-4 text-gray-400" />
                {project.address || 'Address pending'}
              </p>
              <p className="text-gray-600 mt-1">
                {project.intake_type === 'new_construction' ? 'New Construction' : 'Renovation'}
              </p>
            </div>
          </div>
        </Card>

        {/* Selected Package */}
        <Card className="p-6 mb-6">
          <h3 className="text-lg font-semibold text-charcoal mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-gray-400" />
            Your Quote
          </h3>

          <div className="bg-gradient-to-r from-charcoal to-gray-700 rounded-lg p-4 text-white mb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-300">Package Level</p>
                <p className="text-xl font-bold">{BUILD_TIERS[selectedTier]?.label || 'Better'}</p>
                <p className="text-sm text-gray-300 mt-1">
                  {BUILD_TIERS[selectedTier]?.description || 'Enhanced quality finishes'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-300">Estimated Total</p>
                <p className="text-3xl font-bold">{formatCurrency(quoteTotal)}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Scope Breakdown */}
        <Card className="p-6 mb-6">
          <h3 className="text-lg font-semibold text-charcoal mb-4">What's Included</h3>

          <div className="divide-y divide-gray-100">
            {Object.entries(groupedItems).map(([category, items]) => (
              <div key={category} className="py-3 first:pt-0 last:pb-0">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-charcoal">{category}</p>
                    <p className="text-sm text-gray-500">
                      {items.length} {items.length === 1 ? 'item' : 'items'} included
                    </p>
                  </div>
                  <p className="font-semibold text-charcoal">
                    {formatCurrency(getCategoryTotal(items))}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-200 mt-4 pt-4">
            <div className="flex items-center justify-between text-lg">
              <span className="font-semibold text-charcoal">Total</span>
              <span className="font-bold text-charcoal">{formatCurrency(quoteTotal)}</span>
            </div>
          </div>
        </Card>

        {/* Response Section */}
        {!responded ? (
          <Card className="p-6 mb-6 print:hidden">
            <h3 className="text-lg font-semibold text-charcoal mb-2">What do you think?</h3>
            <p className="text-gray-600 mb-4">
              Let us know if this quote looks good or if you have questions.
              We'll follow up to discuss next steps.
            </p>

            <div className="flex gap-3">
              <Button onClick={handleApprove} className="flex-1">
                <ThumbsUp className="w-4 h-4 mr-2" />
                Looks Good
              </Button>
              <Button variant="secondary" onClick={handleQuestions} className="flex-1">
                <MessageSquare className="w-4 h-4 mr-2" />
                I Have Questions
              </Button>
            </div>
          </Card>
        ) : (
          <Card className={`p-6 mb-6 ${responseType === 'approved' ? 'bg-emerald-50 border-emerald-200' : 'bg-blue-50 border-blue-200'}`}>
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-full ${responseType === 'approved' ? 'bg-emerald-100' : 'bg-blue-100'}`}>
                {responseType === 'approved' ? (
                  <CheckCircle className="w-6 h-6 text-emerald-600" />
                ) : (
                  <MessageSquare className="w-6 h-6 text-blue-600" />
                )}
              </div>
              <div>
                <h3 className={`text-lg font-semibold ${responseType === 'approved' ? 'text-emerald-800' : 'text-blue-800'}`}>
                  {responseType === 'approved' ? 'Thanks for your response!' : 'We\'ll be in touch!'}
                </h3>
                <p className={responseType === 'approved' ? 'text-emerald-700' : 'text-blue-700'}>
                  {responseType === 'approved'
                    ? 'Your contractor has been notified that you\'re ready to move forward. They\'ll be in touch shortly to discuss the contract and next steps.'
                    : 'Your contractor has been notified that you have questions. They\'ll reach out soon to address your concerns.'}
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Contact Info */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-charcoal mb-4">Questions?</h3>
          <p className="text-gray-600 mb-4">
            We're here to help. Reach out anytime if you'd like to discuss this quote.
          </p>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => window.location.href = 'mailto:quotes@hooomz.com'}>
              <Mail className="w-4 h-4 mr-2" />
              Email Us
            </Button>
            <Button variant="secondary" onClick={() => window.location.href = 'tel:5065550123'}>
              <Phone className="w-4 h-4 mr-2" />
              Call Us
            </Button>
          </div>
        </Card>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body { background: white !important; }
          .print\\:hidden { display: none !important; }
          .print\\:static { position: static !important; }
        }
      `}</style>
    </div>
  );
}

export default HomeownerQuote;
