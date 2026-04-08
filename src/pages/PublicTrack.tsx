import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Ticket, 
  Search, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  ArrowLeft,
  Loader2,
  MessageSquare
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { cn } from '../lib/utils';

export default function PublicTrack() {
  const { token } = useParams<{ token: string }>();
  const [email, setEmail] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [ticket, setTicket] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifying(true);
    setError(null);

    try {
      // Search by Ticket Number and verify email in metadata
      const { data, error: fetchError } = await supabase
        .from('tickets')
        .select('*')
        .eq('ticket_number', token)
        .contains('metadata', { customer_email: email.toLowerCase().trim() })
        .single();

      if (fetchError || !data) {
        throw new Error('Verification failed. Please check the email address associated with this ticket.');
      }

      setTicket(data);
      setIsVerified(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setVerifying(false);
    }
  };

  if (!isVerified) {
    return (
      <div className="min-h-screen bg-zuboc-cream/30 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl shadow-zuboc-plum/5 border border-zuboc-plum/5 p-10 md:p-12">
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-zuboc-cream rounded-2xl flex items-center justify-center text-zuboc-plum mx-auto mb-6">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-serif font-medium text-zuboc-plum italic mb-2">Security Verification</h1>
            <p className="text-zuboc-plum/50 text-sm font-light">
              To view ticket <span className="font-semibold text-zuboc-plum">{token}</span>, please enter the email address used to raise it.
            </p>
          </div>

          <form onSubmit={handleVerify} className="space-y-6">
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

            {error && (
              <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start text-rose-800 animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            <button 
              type="submit" 
              disabled={verifying}
              className="zuboc-button-primary w-full py-4 flex items-center justify-center"
            >
              {verifying ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <ShieldCheck className="w-5 h-5 mr-2" />}
              Verify & View Status
            </button>

            <Link to="/" className="flex items-center justify-center text-sm text-zuboc-plum/40 hover:text-zuboc-plum transition-colors mt-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zuboc-cream/30 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <Link to="/" className="flex items-center text-sm font-medium text-zuboc-plum/60 hover:text-zuboc-plum transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <div className="px-4 py-1.5 bg-zuboc-plum text-white text-xs font-bold rounded-full tracking-widest uppercase">
            {token}
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-zuboc-plum/5 border border-zuboc-plum/5 overflow-hidden">
          <div className="p-10 md:p-16 border-b border-zuboc-plum/5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
              <div>
                <h1 className="text-4xl font-serif font-medium text-zuboc-plum italic mb-2">{ticket.title}</h1>
                <div className="flex items-center text-zuboc-plum/40 text-sm font-light">
                  <Clock className="w-4 h-4 mr-2" />
                  Raised on {new Date(ticket.created_at).toLocaleDateString(undefined, { dateStyle: 'long' })}
                </div>
              </div>
              <div className={cn(
                "px-6 py-3 rounded-2xl text-sm font-bold uppercase tracking-widest flex items-center",
                ticket.status === 'resolved' ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
              )}>
                {ticket.status === 'resolved' ? <CheckCircle2 className="w-5 h-5 mr-2" /> : <Clock className="w-5 h-5 mr-2" />}
                {ticket.status}
              </div>
            </div>

            <div className="space-y-8">
              <div>
                <h3 className="text-xs font-semibold text-zuboc-plum/60 uppercase tracking-widest mb-4">Description</h3>
                <div className="p-6 bg-zuboc-cream/30 rounded-2xl text-zuboc-plum/80 leading-relaxed">
                  {ticket.description}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xs font-semibold text-zuboc-plum/60 uppercase tracking-widest mb-4">Query Type</h3>
                  <div className="flex items-center p-4 bg-white border border-zuboc-plum/5 rounded-2xl">
                    <MessageSquare className="w-5 h-5 text-zuboc-plum/40 mr-3" />
                    <span className="text-sm font-medium text-zuboc-plum capitalize">{ticket.query_type?.replace('_', ' ') || 'General'}</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-zuboc-plum/60 uppercase tracking-widest mb-4">Priority</h3>
                  <div className="flex items-center p-4 bg-white border border-zuboc-plum/5 rounded-2xl">
                    <div className={cn(
                      "w-2 h-2 rounded-full mr-3",
                      ticket.priority === 'high' ? "bg-rose-500" : ticket.priority === 'medium' ? "bg-amber-500" : "bg-emerald-500"
                    )} />
                    <span className="text-sm font-medium text-zuboc-plum capitalize">{ticket.priority}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-10 md:p-16 bg-zuboc-cream/10">
            <h3 className="text-xl font-serif font-medium text-zuboc-plum italic mb-8">Ticket Timeline</h3>
            <div className="space-y-10 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-px before:bg-zuboc-plum/10">
              <div className="relative pl-12">
                <div className="absolute left-0 top-1 w-8 h-8 bg-zuboc-plum text-white rounded-full flex items-center justify-center z-10">
                  <PlusCircle className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-zuboc-plum mb-1">Ticket Created</h4>
                  <p className="text-xs text-zuboc-plum/40 mb-2">{new Date(ticket.created_at).toLocaleString()}</p>
                  <p className="text-sm text-zuboc-plum/60 font-light">Your support request has been successfully registered in our system.</p>
                </div>
              </div>
              
              {ticket.status !== 'new' && (
                <div className="relative pl-12">
                  <div className="absolute left-0 top-1 w-8 h-8 bg-zuboc-cream text-zuboc-plum border border-zuboc-plum/10 rounded-full flex items-center justify-center z-10">
                    <Loader2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-zuboc-plum mb-1">Under Review</h4>
                    <p className="text-xs text-zuboc-plum/40 mb-2">Updated recently</p>
                    <p className="text-sm text-zuboc-plum/60 font-light">An agent is currently reviewing your request.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PlusCircle(props: any) {
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
      <path d="M8 12h8" />
      <path d="M12 8v8" />
    </svg>
  );
}
