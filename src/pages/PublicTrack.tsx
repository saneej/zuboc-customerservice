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
  MessageSquare,
  ExternalLink,
  Phone
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
  const [messages, setMessages] = useState<any[]>([]);
  const [reply, setReply] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isVerified && ticket) {
      fetchMessages();
      
      // Subscribe to new messages
      const channel = supabase
        .channel(`public-ticket-${ticket.id}`)
        .on('postgres_changes', { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'ticket_messages',
          filter: `ticket_id=eq.${ticket.id}`
        }, (payload) => {
          if (!payload.new.is_internal) {
            fetchMessages();
          }
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [isVerified, ticket]);

  async function fetchMessages() {
    try {
      const { data, error } = await supabase
        .from('ticket_messages')
        .select(`
          *,
          author:profiles(full_name, avatar_url)
        `)
        .eq('ticket_id', ticket.id)
        .eq('is_internal', false)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (err: any) {
      console.error('Error fetching messages:', err);
    }
  }

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reply.trim()) return;
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('ticket_messages')
        .insert([
          {
            ticket_id: ticket.id,
            body: reply,
            is_internal: false
          }
        ]);

      if (error) throw error;
      setReply('');
      fetchMessages();
    } catch (err: any) {
      console.error('Error sending reply:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifying(true);
    setError(null);

    try {
      // Search by Ticket Number and verify email
      const { data, error: fetchError } = await supabase
        .from('tickets')
        .select('*')
        .eq('ticket_number', token)
        .eq('customer_email', email.toLowerCase().trim())
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
            <div className="flex items-center space-x-3">
              <a 
                href={`https://wa.me/?text=${encodeURIComponent(`Track my Zuboc Desk ticket #${token}: https://zuboc-customerservice.vercel.app/track/${token}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center px-4 py-1.5 bg-[#25D366] text-white text-[10px] font-bold rounded-full tracking-widest uppercase hover:bg-[#128C7E] transition-colors"
              >
                <Phone className="w-3 h-3 mr-2" />
                Share
              </a>
              <div className="px-4 py-1.5 bg-zuboc-plum text-white text-xs font-bold rounded-full tracking-widest uppercase">
                {token}
              </div>
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

              {ticket.attachments && ticket.attachments.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-zuboc-plum/60 uppercase tracking-widest mb-4">Attachments</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {ticket.attachments.map((url: string, idx: number) => (
                      <a 
                        key={idx} 
                        href={url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="group relative aspect-square rounded-2xl overflow-hidden border border-zuboc-plum/5 hover:border-zuboc-plum/20 transition-all"
                      >
                        <img 
                          src={url} 
                          alt={`Attachment ${idx + 1}`} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-zuboc-plum/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <ExternalLink className="w-6 h-6 text-white" />
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}

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

          {/* Chat Interface */}
          <div className="p-10 md:p-16 border-t border-zuboc-plum/5">
            <h3 className="text-xl font-serif font-medium text-zuboc-plum italic mb-8">Conversation</h3>
            
            <div className="space-y-8 mb-10">
              {/* Initial Ticket Description */}
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-zuboc-cream flex-shrink-0 flex items-center justify-center text-zuboc-plum font-bold">
                  {ticket.customer_email?.[0].toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-bold text-zuboc-plum">You</span>
                    <span className="text-[10px] text-zuboc-plum/40 uppercase tracking-widest">{new Date(ticket.created_at).toLocaleString()}</span>
                  </div>
                  <div className="bg-zuboc-cream/30 p-5 rounded-2xl rounded-tl-none text-sm text-zuboc-plum/80 leading-relaxed">
                    {ticket.description}
                  </div>
                </div>
              </div>

              {/* Messages */}
              {messages.map((msg) => (
                <div key={msg.id} className={cn(
                  "flex gap-4",
                  !msg.author_id ? "flex-row" : "flex-row"
                )}>
                  <div className={cn(
                    "w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center font-bold overflow-hidden",
                    msg.author_id ? "bg-zuboc-plum text-white" : "bg-zuboc-cream text-zuboc-plum"
                  )}>
                    {msg.author?.avatar_url ? (
                      <img src={msg.author.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span>{(msg.author?.full_name || 'A')[0]}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-bold text-zuboc-plum">
                        {msg.author_id ? (msg.author?.full_name || 'Agent') : 'You'}
                      </span>
                      <span className="text-[10px] text-zuboc-plum/40 uppercase tracking-widest">{new Date(msg.created_at).toLocaleString()}</span>
                    </div>
                    <div className={cn(
                      "p-5 rounded-2xl rounded-tl-none text-sm leading-relaxed",
                      msg.author_id ? "bg-white border border-zuboc-plum/5 text-zuboc-plum/80" : "bg-zuboc-cream/30 text-zuboc-plum/80"
                    )}>
                      {msg.body}

                      {msg.attachments && msg.attachments.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-zuboc-plum/5">
                          <div className="flex flex-wrap gap-2">
                            {msg.attachments.map((url: string, idx: number) => (
                              <a 
                                key={idx} 
                                href={url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="group relative w-16 h-16 rounded-lg overflow-hidden border border-zuboc-plum/5"
                              >
                                <img 
                                  src={url} 
                                  alt="" 
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                                  referrerPolicy="no-referrer"
                                />
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Reply Form */}
            <form onSubmit={handleSendReply} className="relative">
              <textarea 
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder="Type your message here..."
                className="w-full bg-zuboc-cream/20 border border-zuboc-plum/10 rounded-3xl p-6 pr-20 text-sm focus:ring-2 focus:ring-zuboc-plum/20 outline-none min-h-[120px] resize-none"
              />
              <button 
                type="submit"
                disabled={isSubmitting || !reply.trim()}
                className="absolute bottom-4 right-4 w-12 h-12 bg-zuboc-plum text-white rounded-2xl flex items-center justify-center hover:bg-zuboc-plum/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </button>
            </form>
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

function Send(props: any) {
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
      <path d="m22 2-7 20-4-9-9-4Z" />
      <path d="M22 2 11 13" />
    </svg>
  );
}
