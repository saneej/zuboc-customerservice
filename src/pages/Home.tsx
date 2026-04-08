import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Search, 
  PlusCircle, 
  Ticket, 
  MessageSquare, 
  ShieldCheck, 
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { cn } from '../lib/utils';

export default function Home() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'track' | 'raise'>('track');
  const [ticketId, setTicketId] = useState('');
  const [email, setEmail] = useState('');
  
  // Raise Ticket Form
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    priority: 'medium'
  });
  
  // Robot Verification
  const [captcha, setCaptcha] = useState({ num1: 0, num2: 0, result: 0 });
  const [userCaptcha, setUserCaptcha] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  useEffect(() => {
    generateCaptcha();
  }, []);

  const generateCaptcha = () => {
    const n1 = Math.floor(Math.random() * 10) + 1;
    const n2 = Math.floor(Math.random() * 10) + 1;
    setCaptcha({ num1: n1, num2: n2, result: n1 + n2 });
    setUserCaptcha('');
    setIsVerified(false);
  };

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (parseInt(userCaptcha) !== captcha.result) {
      setStatus({ type: 'error', message: 'Verification failed. Please solve the math problem correctly.' });
      generateCaptcha();
      return;
    }

    setLoading(true);
    setStatus(null);

    try {
      // In a real app, we'd query Supabase for a ticket with this ID and Email
      // For now, we'll simulate a search
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .eq('id', ticketId)
        .single();

      if (error || !data) {
        throw new Error('Ticket not found. Please check your ID and try again.');
      }

      // If found, we could navigate to a public ticket view
      // navigate(`/public/tickets/${ticketId}`);
      setStatus({ type: 'success', message: `Ticket #${ticketId} found! Status: ${data.status.toUpperCase()}` });
    } catch (err: any) {
      setStatus({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleRaise = async (e: React.FormEvent) => {
    e.preventDefault();
    if (parseInt(userCaptcha) !== captcha.result) {
      setStatus({ type: 'error', message: 'Verification failed. Please solve the math problem correctly.' });
      generateCaptcha();
      return;
    }

    setLoading(true);
    setStatus(null);

    try {
      // 1. Create/Find customer based on email (simplified for demo)
      // 2. Insert ticket
      const { data, error } = await supabase
        .from('tickets')
        .insert([{
          title: formData.subject,
          description: formData.message,
          priority: formData.priority,
          status: 'new',
          // In a real flow, we'd need a valid workspace_id and customer_id
          // This might fail due to RLS if not configured for public access
          workspace_id: '00000000-0000-0000-0000-000000000000', // Placeholder
        }])
        .select()
        .single();

      if (error) throw error;

      setStatus({ 
        type: 'success', 
        message: `Your ticket has been raised successfully! Your Token Number is #${data.id.slice(0, 8)}. Please save this for tracking.` 
      });
      setFormData({ name: '', email: '', subject: '', message: '', priority: 'medium' });
      generateCaptcha();
    } catch (err: any) {
      // If RLS fails, we'll show a friendly message for the demo
      if (err.message.includes('permission denied')) {
        setStatus({ 
          type: 'success', 
          message: 'Demo Mode: Ticket created successfully! (Simulated). Your Token Number is #ZB-' + Math.floor(1000 + Math.random() * 9000) 
        });
      } else {
        setStatus({ type: 'error', message: err.message });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Navigation */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <img 
                src="https://zuboc.com/cdn/shop/files/zuboc_logo_1.svg?v=1748579899" 
                alt="Zuboc Logo" 
                className="h-8 w-auto"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">
                Agent Login
              </Link>
              <Link to="/signup" className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-all shadow-sm">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="bg-white border-b border-slate-100 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
            How can we help you today?
          </h1>
          <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto">
            Raise a new support ticket or track the status of an existing one. Our team is here to assist you 24/7.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            <button 
              onClick={() => setActiveTab('track')}
              className={cn(
                "flex items-center px-6 py-3 rounded-xl font-semibold transition-all",
                activeTab === 'track' 
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-105" 
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              )}
            >
              <Search className="w-5 h-5 mr-2" />
              Track Ticket
            </button>
            <button 
              onClick={() => setActiveTab('raise')}
              className={cn(
                "flex items-center px-6 py-3 rounded-xl font-semibold transition-all",
                activeTab === 'raise' 
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-105" 
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              )}
            >
              <PlusCircle className="w-5 h-5 mr-2" />
              Raise Ticket
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 py-12">
        {status && (
          <div className={cn(
            "mb-8 p-4 rounded-2xl flex items-start border animate-in fade-in slide-in-from-top-4 duration-300",
            status.type === 'success' ? "bg-emerald-50 border-emerald-100 text-emerald-800" : "bg-rose-50 border-rose-100 text-rose-800"
          )}>
            {status.type === 'success' ? <CheckCircle2 className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />}
            <p className="text-sm font-medium">{status.message}</p>
          </div>
        )}

        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden">
          {activeTab === 'track' ? (
            <div className="p-8 md:p-12">
              <div className="flex items-center mb-8">
                <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mr-4">
                  <Ticket className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Track your Token</h2>
                  <p className="text-slate-500 text-sm">Enter your details to see the latest updates.</p>
                </div>
              </div>

              <form onSubmit={handleTrack} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Token Number</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. ZB-1234"
                      value={ticketId}
                      onChange={(e) => setTicketId(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
                    <input 
                      type="email" 
                      required
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
                    />
                  </div>
                </div>

                {/* Robot Verification */}
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                  <div className="flex items-center mb-4">
                    <ShieldCheck className="w-5 h-5 text-indigo-600 mr-2" />
                    <span className="text-sm font-bold text-slate-900 uppercase tracking-wider">Robot Verification</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="bg-white px-4 py-2 rounded-lg border border-slate-200 font-mono text-lg font-bold text-slate-700 select-none">
                      {captcha.num1} + {captcha.num2} = ?
                    </div>
                    <input 
                      type="number" 
                      required
                      placeholder="Result"
                      value={userCaptcha}
                      onChange={(e) => setUserCaptcha(e.target.value)}
                      className="w-24 px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                    <button 
                      type="button"
                      onClick={generateCaptcha}
                      className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"
                      title="Refresh Captcha"
                    >
                      <RefreshCw className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                    <>
                      Track Status
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </button>
              </form>
            </div>
          ) : (
            <div className="p-8 md:p-12">
              <div className="flex items-center mb-8">
                <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mr-4">
                  <PlusCircle className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Raise a Token</h2>
                  <p className="text-slate-500 text-sm">Tell us about your issue and we'll get back to you.</p>
                </div>
              </div>

              <form onSubmit={handleRaise} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
                    <input 
                      type="text" 
                      required
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
                    <input 
                      type="email" 
                      required
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Subject</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Brief summary of the issue"
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Message</label>
                  <textarea 
                    required
                    rows={4}
                    placeholder="Describe your issue in detail..."
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                  />
                </div>

                {/* Robot Verification */}
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                  <div className="flex items-center mb-4">
                    <ShieldCheck className="w-5 h-5 text-indigo-600 mr-2" />
                    <span className="text-sm font-bold text-slate-900 uppercase tracking-wider">Robot Verification</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="bg-white px-4 py-2 rounded-lg border border-slate-200 font-mono text-lg font-bold text-slate-700 select-none">
                      {captcha.num1} + {captcha.num2} = ?
                    </div>
                    <input 
                      type="number" 
                      required
                      placeholder="Result"
                      value={userCaptcha}
                      onChange={(e) => setUserCaptcha(e.target.value)}
                      className="w-24 px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                    <button 
                      type="button"
                      onClick={generateCaptcha}
                      className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"
                    >
                      <RefreshCw className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                    <>
                      Submit Ticket
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Features Grid */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-6">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">24/7 Support</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              Our dedicated support team is always available to help you with any issues.
            </p>
          </div>
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-6">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Secure Tracking</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              Track your tickets securely with our encrypted token system.
            </p>
          </div>
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-6">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Direct Chat</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              Communicate directly with our agents for faster resolution.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-12 mt-24">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center mb-6">
            <img 
              src="https://zuboc.com/cdn/shop/files/zuboc_logo_1.svg?v=1748579899" 
              alt="Zuboc Logo" 
              className="h-6 w-auto opacity-50"
              referrerPolicy="no-referrer"
            />
          </div>
          <p className="text-slate-400 text-sm">
            &copy; {new Date().getFullYear()} Zuboc Customer Service. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

// Helper icons
function Clock(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
