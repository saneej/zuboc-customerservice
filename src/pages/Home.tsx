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
  RefreshCw,
  ExternalLink,
  X,
  Copy,
  Check,
  Image as ImageIcon,
  Paperclip,
  Upload
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
    priority: 'medium',
    queryType: 'order'
  });
  
  // Robot Verification
  const [captcha, setCaptcha] = useState({ num1: 0, num2: 0, result: 0 });
  const [userCaptcha, setUserCaptcha] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdTicket, setCreatedTicket] = useState<{ number: string, email: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);

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
      // Search by ID or Ticket Number in metadata
      let query = supabase.from('tickets').select('*');
      
      if (ticketId.startsWith('ZUB')) {
        query = query.eq('ticket_number', ticketId);
      } else {
        query = query.eq('id', ticketId);
      }

      const { data, error } = await query.single();

      if (error || !data) {
        throw new Error('Ticket not found. Please check your ID and try again.');
      }

      // Navigate to the permanent tracking link
      const token = data.ticket_number || data.id;
      navigate(`/track/${token}`);
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
      // 1. Upload files if any
      const attachmentUrls: string[] = [];
      if (selectedFiles.length > 0) {
        setUploadingFiles(true);
        for (const file of selectedFiles) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
          const filePath = `public/${fileName}`;

          const { error: uploadError, data } = await supabase.storage
            .from('attachments')
            .upload(filePath, file);

          if (uploadError) {
            console.error('Upload error:', uploadError);
            continue;
          }

          const { data: { publicUrl } } = supabase.storage
            .from('attachments')
            .getPublicUrl(filePath);
          
          attachmentUrls.push(publicUrl);
        }
        setUploadingFiles(false);
      }

      // Fetch workspace ID
      let workspaceId = '00000000-0000-0000-0000-000000000000';
      const { data: workspaces } = await supabase.from('workspaces').select('id').limit(1);
      if (workspaces && workspaces.length > 0) {
        workspaceId = workspaces[0].id;
      }

      // Call our backend API to handle ticket creation and email
      const response = await fetch('/api/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject: formData.subject,
          description: formData.message,
          customer_email: formData.email,
          query_type: formData.queryType,
          workspace_id: workspaceId,
          priority: formData.priority,
          attachments: attachmentUrls
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to raise ticket');
      }

      setCreatedTicket({ number: result.ticket.ticket_number, email: formData.email });
      setShowSuccessModal(true);
      
      setFormData({ name: '', email: '', subject: '', message: '', priority: 'medium', queryType: 'order' });
      setSelectedFiles([]);
      generateCaptcha();
    } catch (err: any) {
      setStatus({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zuboc-cream font-sans text-zuboc-plum">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-zuboc-plum/5 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center">
              <img 
                src="https://zuboc.com/cdn/shop/files/zuboc_logo_1.svg?v=1748579899" 
                alt="Zuboc Logo" 
                className="h-10 w-auto"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex items-center space-x-6">
              <a 
                href="https://www.zuboc.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm font-medium text-zuboc-plum/70 hover:text-zuboc-plum transition-colors flex items-center"
              >
                Go to Website
                <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
              </a>
              <Link to="/login" className="text-sm font-medium text-zuboc-plum/70 hover:text-zuboc-plum transition-colors">
                Agent Login
              </Link>
              <Link to="/signup" className="zuboc-button-primary text-sm">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0 100 C 20 0 50 0 100 100" fill="none" stroke="currentColor" strokeWidth="0.5" />
          </svg>
        </div>
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h1 className="text-5xl md:text-7xl font-serif font-medium text-zuboc-plum tracking-tight mb-6 italic">
            Zuboc Desk
          </h1>
          <p className="text-xl text-zuboc-plum/60 mb-12 max-w-2xl mx-auto font-light leading-relaxed">
            Elegance in assistance. Raise a support ticket or track your existing requests with ease.
          </p>
          
          <div className="flex flex-wrap justify-center gap-6">
            <button 
              onClick={() => setActiveTab('track')}
              className={cn(
                "flex items-center px-8 py-4 rounded-2xl font-medium transition-all duration-300",
                activeTab === 'track' 
                  ? "bg-zuboc-plum text-white shadow-xl shadow-zuboc-plum/20 scale-105" 
                  : "bg-white text-zuboc-plum hover:bg-white/80 border border-zuboc-plum/10"
              )}
            >
              <Search className="w-5 h-5 mr-2" />
              Track Token
            </button>
            <button 
              onClick={() => setActiveTab('raise')}
              className={cn(
                "flex items-center px-8 py-4 rounded-2xl font-medium transition-all duration-300",
                activeTab === 'raise' 
                  ? "bg-zuboc-plum text-white shadow-xl shadow-zuboc-plum/20 scale-105" 
                  : "bg-white text-zuboc-plum hover:bg-white/80 border border-zuboc-plum/10"
              )}
            >
              <PlusCircle className="w-5 h-5 mr-2" />
              Raise Token
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

        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-zuboc-plum/5 border border-zuboc-plum/5 overflow-hidden">
          {activeTab === 'track' ? (
            <div className="p-10 md:p-16">
              <div className="flex items-center mb-10">
                <div className="w-14 h-14 bg-zuboc-cream rounded-2xl flex items-center justify-center text-zuboc-plum mr-5">
                  <Ticket className="w-7 h-7" />
                </div>
                <div>
                  <h2 className="text-3xl font-serif font-medium text-zuboc-plum italic">Track your Token</h2>
                  <p className="text-zuboc-plum/50 text-sm font-light">Enter your details to see the latest updates.</p>
                </div>
              </div>

              <form onSubmit={handleTrack} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-xs font-semibold text-zuboc-plum/60 uppercase tracking-widest mb-3">Token Number</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. ZB-1234"
                      value={ticketId}
                      onChange={(e) => setTicketId(e.target.value)}
                      className="zuboc-input"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zuboc-plum/60 uppercase tracking-widest mb-3">Email Address</label>
                    <input 
                      type="email" 
                      required
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="zuboc-input"
                    />
                  </div>
                </div>

                {/* Robot Verification */}
                <div className="bg-zuboc-cream/50 p-8 rounded-3xl border border-zuboc-plum/5">
                  <div className="flex items-center mb-6">
                    <ShieldCheck className="w-5 h-5 text-zuboc-plum mr-2" />
                    <span className="text-xs font-bold text-zuboc-plum uppercase tracking-widest">Human Verification</span>
                  </div>
                  <div className="flex items-center space-x-6">
                    <div className="bg-white px-6 py-3 rounded-xl border border-zuboc-plum/10 font-serif text-xl font-medium text-zuboc-plum select-none italic">
                      {captcha.num1} + {captcha.num2} = ?
                    </div>
                    <input 
                      type="number" 
                      required
                      placeholder="Result"
                      value={userCaptcha}
                      onChange={(e) => setUserCaptcha(e.target.value)}
                      className="w-28 px-4 py-3 border border-zuboc-plum/10 rounded-xl focus:ring-2 focus:ring-zuboc-plum/20 outline-none"
                    />
                    <button 
                      type="button"
                      onClick={generateCaptcha}
                      className="p-2 text-zuboc-plum/40 hover:text-zuboc-plum transition-colors"
                      title="Refresh Captcha"
                    >
                      <RefreshCw className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={loading}
                  className="zuboc-button-primary w-full py-5 text-lg flex items-center justify-center"
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
            <div className="p-10 md:p-16">
              <div className="flex items-center mb-10">
                <div className="w-14 h-14 bg-zuboc-cream rounded-2xl flex items-center justify-center text-zuboc-plum mr-5">
                  <PlusCircle className="w-7 h-7" />
                </div>
                <div>
                  <h2 className="text-3xl font-serif font-medium text-zuboc-plum italic">Raise a Token</h2>
                  <p className="text-zuboc-plum/50 text-sm font-light">Tell us about your issue and we'll get back to you.</p>
                </div>
              </div>

              <form onSubmit={handleRaise} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-xs font-semibold text-zuboc-plum/60 uppercase tracking-widest mb-3">Full Name</label>
                    <input 
                      type="text" 
                      required
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="zuboc-input"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zuboc-plum/60 uppercase tracking-widest mb-3">Email Address</label>
                    <input 
                      type="email" 
                      required
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="zuboc-input"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-xs font-semibold text-zuboc-plum/60 uppercase tracking-widest mb-3">Query Type</label>
                    <select 
                      required
                      value={formData.queryType}
                      onChange={(e) => setFormData({...formData, queryType: e.target.value})}
                      className="zuboc-input appearance-none bg-no-repeat bg-[right_1rem_center] bg-[length:1em_1em]"
                      style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%235B4B51'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")` }}
                    >
                      <option value="order">Order Related</option>
                      <option value="account">Account Related</option>
                      <option value="delivery">Delivery Related</option>
                      <option value="return">Return Related</option>
                      <option value="product">Product Related</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zuboc-plum/60 uppercase tracking-widest mb-3">Subject</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Brief summary"
                      value={formData.subject}
                      onChange={(e) => setFormData({...formData, subject: e.target.value})}
                      className="zuboc-input"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zuboc-plum/60 uppercase tracking-widest mb-3">Message</label>
                  <textarea 
                    required
                    rows={4}
                    placeholder="Describe your issue in detail..."
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    className="zuboc-input resize-none"
                  />
                </div>

                {/* File Upload */}
                <div>
                  <label className="block text-xs font-semibold text-zuboc-plum/60 uppercase tracking-widest mb-3">Attachments (Optional)</label>
                  <div className="relative">
                    <input 
                      type="file" 
                      multiple
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files) {
                          setSelectedFiles(Array.from(e.target.files));
                        }
                      }}
                      className="hidden"
                      id="file-upload"
                    />
                    <label 
                      htmlFor="file-upload"
                      className="flex items-center justify-center gap-3 w-full p-8 border-2 border-dashed border-zuboc-plum/10 rounded-3xl hover:border-zuboc-plum/30 hover:bg-zuboc-cream/30 transition-all cursor-pointer group"
                    >
                      <div className="w-12 h-12 bg-zuboc-cream rounded-2xl flex items-center justify-center text-zuboc-plum group-hover:scale-110 transition-transform">
                        <Upload className="w-6 h-6" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-bold text-zuboc-plum">Click to upload images</p>
                        <p className="text-xs text-zuboc-plum/40 font-light">PNG, JPG up to 5MB</p>
                      </div>
                    </label>
                  </div>
                  {selectedFiles.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-3">
                      {selectedFiles.map((file, idx) => (
                        <div key={idx} className="flex items-center gap-2 bg-zuboc-cream/50 px-4 py-2 rounded-xl border border-zuboc-plum/5 text-xs font-medium text-zuboc-plum">
                          <ImageIcon className="w-3 h-3" />
                          <span className="max-w-[150px] truncate">{file.name}</span>
                          <button 
                            type="button"
                            onClick={() => setSelectedFiles(selectedFiles.filter((_, i) => i !== idx))}
                            className="p-1 hover:bg-zuboc-plum/10 rounded-full"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Robot Verification */}
                <div className="bg-zuboc-cream/50 p-8 rounded-3xl border border-zuboc-plum/5">
                  <div className="flex items-center mb-6">
                    <ShieldCheck className="w-5 h-5 text-zuboc-plum mr-2" />
                    <span className="text-xs font-bold text-zuboc-plum uppercase tracking-widest">Human Verification</span>
                  </div>
                  <div className="flex items-center space-x-6">
                    <div className="bg-white px-6 py-3 rounded-xl border border-zuboc-plum/10 font-serif text-xl font-medium text-zuboc-plum select-none italic">
                      {captcha.num1} + {captcha.num2} = ?
                    </div>
                    <input 
                      type="number" 
                      required
                      placeholder="Result"
                      value={userCaptcha}
                      onChange={(e) => setUserCaptcha(e.target.value)}
                      className="w-28 px-4 py-3 border border-zuboc-plum/10 rounded-xl focus:ring-2 focus:ring-zuboc-plum/20 outline-none"
                    />
                    <button 
                      type="button"
                      onClick={generateCaptcha}
                      className="p-2 text-zuboc-plum/40 hover:text-zuboc-plum transition-colors"
                    >
                      <RefreshCw className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={loading || uploadingFiles}
                  className="zuboc-button-primary w-full py-5 text-lg flex items-center justify-center"
                >
                  {loading || uploadingFiles ? (
                    <div className="flex items-center gap-3">
                      <Loader2 className="w-6 h-6 animate-spin" />
                      <span>{uploadingFiles ? 'Uploading files...' : 'Raising ticket...'}</span>
                    </div>
                  ) : (
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
        <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="zuboc-card p-10">
            <div className="w-14 h-14 bg-zuboc-cream rounded-2xl flex items-center justify-center text-zuboc-plum mb-8">
              <Clock className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-serif font-medium text-zuboc-plum italic mb-3">24/7 Support</h3>
            <p className="text-zuboc-plum/50 text-sm leading-relaxed font-light">
              Our dedicated support team is always available to help you with any issues.
            </p>
          </div>
          <div className="zuboc-card p-10">
            <div className="w-14 h-14 bg-zuboc-cream rounded-2xl flex items-center justify-center text-zuboc-plum mb-8">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-serif font-medium text-zuboc-plum italic mb-3">Secure Tracking</h3>
            <p className="text-zuboc-plum/50 text-sm leading-relaxed font-light">
              Track your tickets securely with our encrypted token system.
            </p>
          </div>
          <div className="zuboc-card p-10">
            <div className="w-14 h-14 bg-zuboc-cream rounded-2xl flex items-center justify-center text-zuboc-plum mb-8">
              <MessageSquare className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-serif font-medium text-zuboc-plum italic mb-3">Direct Chat</h3>
            <p className="text-zuboc-plum/50 text-sm leading-relaxed font-light">
              Communicate directly with our agents for faster resolution.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-zuboc-plum text-white py-20 mt-32">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center mb-10">
            <img 
              src="https://zuboc.com/cdn/shop/files/zuboc_logo_1.svg?v=1748579899" 
              alt="Zuboc Logo" 
              className="h-10 w-auto filter invert brightness-0"
              referrerPolicy="no-referrer"
            />
          </div>
          <p className="text-white/40 text-sm font-light tracking-widest uppercase">
            &copy; {new Date().getFullYear()} Zuboc Desk. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Success Modal */}
      {showSuccessModal && createdTicket && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zuboc-plum/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="relative p-10 text-center">
              <button 
                onClick={() => setShowSuccessModal(false)}
                className="absolute top-6 right-6 p-2 hover:bg-zuboc-cream rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-zuboc-plum/40" />
              </button>

              <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-8">
                <CheckCircle2 className="w-10 h-10 text-emerald-500" />
              </div>

              <h2 className="text-3xl font-serif italic text-zuboc-plum mb-4">Token Raised!</h2>
              <p className="text-zuboc-plum/60 font-light mb-8">
                Your request has been registered successfully. A confirmation email has been sent to <span className="font-bold text-zuboc-plum">{createdTicket.email}</span>.
              </p>

              <div className="bg-zuboc-cream/50 p-6 rounded-3xl mb-8">
                <p className="text-[10px] font-bold text-zuboc-plum/40 uppercase tracking-widest mb-2">Your Token Number</p>
                <div className="flex items-center justify-center gap-3">
                  <span className="text-3xl font-mono font-bold text-zuboc-plum tracking-tighter">
                    {createdTicket.number}
                  </span>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(createdTicket.number);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="p-2 hover:bg-white rounded-xl transition-all active:scale-95"
                    title="Copy to clipboard"
                  >
                    {copied ? <Check className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5 text-zuboc-plum/40" />}
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <button 
                  onClick={() => navigate(`/track/${createdTicket.number}`)}
                  className="zuboc-button-primary w-full py-4 flex items-center justify-center gap-2"
                >
                  Track Status
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setShowSuccessModal(false)}
                  className="w-full py-4 text-sm font-bold text-zuboc-plum/60 hover:text-zuboc-plum transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
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
