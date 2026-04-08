import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Clock, 
  User as UserIcon, 
  Send, 
  Paperclip, 
  MoreHorizontal,
  Hash,
  Tag as TagIcon,
  ShieldAlert,
  CheckCircle2,
  History,
  Lock,
  Globe,
  Loader2,
  ExternalLink,
  Plus
} from 'lucide-react';
import { supabase, Ticket } from '../lib/supabase';
import { cn } from '../lib/utils';
import { toast } from 'sonner';

export default function TicketDetail() {
  const { id } = useParams();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState('');
  const [isInternal, setIsInternal] = useState(false);

  useEffect(() => {
    if (id) fetchTicket();
  }, [id]);

  async function fetchTicket() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setTicket(data);
    } catch (error: any) {
      toast.error('Failed to fetch ticket details');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-zuboc-plum/20" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Ticket Not Found</h1>
        <Link to="/tickets" className="text-zuboc-plum hover:underline">Back to tickets</Link>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col -m-10">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center space-x-4">
          <Link to="/tickets" className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-slate-400 font-mono text-sm">#{ticket.ticket_number || ticket.id.slice(0, 8)}</span>
              <h1 className="text-lg font-bold text-slate-900">{ticket.title}</h1>
            </div>
            <div className="flex items-center space-x-3 mt-1">
              <span className={cn(
                "px-2 py-0.5 rounded text-xs font-medium capitalize",
                ticket.status === 'resolved' ? "bg-emerald-100 text-emerald-700" : "bg-indigo-100 text-indigo-700"
              )}>{ticket.status}</span>
              <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded text-xs font-medium capitalize">{ticket.priority}</span>
              <span className="text-slate-400 text-xs">Created {new Date(ticket.created_at).toLocaleString()}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
            Resolve
          </button>
          <button className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Conversation */}
        <div className="flex-1 flex flex-col bg-slate-50 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-8 space-y-8">
            {/* Original Message */}
            <div className="flex space-x-4 max-w-4xl">
              <div className="w-10 h-10 rounded-full bg-zuboc-plum/5 flex-shrink-0 flex items-center justify-center text-zuboc-plum font-bold">
                {ticket.customer_email?.[0].toUpperCase() || 'C'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-900">{ticket.customer_email}</span>
                    <span className="text-xs text-slate-400 px-1.5 py-0.5 bg-slate-100 rounded">Customer</span>
                  </div>
                  <span className="text-xs text-slate-400">{new Date(ticket.created_at).toLocaleString()}</span>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="text-slate-700 leading-relaxed whitespace-pre-wrap mb-6">
                    {ticket.description}
                  </div>
                  
                  {ticket.attachments && ticket.attachments.length > 0 && (
                    <div className="border-t border-slate-100 pt-4">
                      <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3">Attachments</h4>
                      <div className="flex flex-wrap gap-3">
                        {ticket.attachments.map((url: string, idx: number) => (
                          <a 
                            key={idx} 
                            href={url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="group relative w-24 h-24 rounded-xl overflow-hidden border border-slate-200 hover:border-zuboc-plum/30 transition-all"
                          >
                            <img 
                              src={url} 
                              alt="" 
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                              referrerPolicy="no-referrer"
                            />
                            <div className="absolute inset-0 bg-zuboc-plum/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <ExternalLink className="w-4 h-4 text-white" />
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Placeholder for replies - in a real app these would be fetched from ticket_messages */}
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <History className="w-6 h-6" />
              </div>
              <p className="text-sm">No replies yet. Start the conversation below.</p>
            </div>
          </div>

          {/* Reply Area */}
          <div className="bg-white border-t border-slate-200 p-6 flex-shrink-0">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center space-x-4 mb-4">
                <button 
                  onClick={() => setIsInternal(false)}
                  className={cn(
                    "text-sm font-medium pb-2 border-b-2 transition-all",
                    !isInternal ? "border-zuboc-plum text-zuboc-plum" : "border-transparent text-slate-500 hover:text-slate-700"
                  )}
                >
                  Public Reply
                </button>
                <button 
                  onClick={() => setIsInternal(true)}
                  className={cn(
                    "text-sm font-medium pb-2 border-b-2 transition-all",
                    isInternal ? "border-amber-600 text-amber-600" : "border-transparent text-slate-500 hover:text-slate-700"
                  )}
                >
                  Internal Note
                </button>
              </div>
              <div className={cn(
                "border rounded-xl transition-all focus-within:ring-2",
                isInternal ? "border-amber-200 bg-amber-50/20 focus-within:ring-amber-500" : "border-slate-200 focus-within:ring-zuboc-plum/20"
              )}>
                <textarea 
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder={isInternal ? "Write a private note for your team..." : "Reply to the customer..."}
                  className="w-full bg-transparent border-none rounded-xl p-4 text-sm focus:ring-0 min-h-[120px] resize-none"
                />
                <div className="flex items-center justify-between px-4 py-3 border-t border-inherit">
                  <div className="flex items-center space-x-2">
                    <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                      <Paperclip className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                      <TagIcon className="w-5 h-5" />
                    </button>
                  </div>
                  <button className={cn(
                    "flex items-center px-4 py-2 rounded-lg text-sm font-bold text-white shadow-sm transition-all",
                    isInternal ? "bg-amber-600 hover:bg-amber-700" : "bg-zuboc-plum hover:bg-zuboc-plum/90"
                  )}>
                    <Send className="w-4 h-4 mr-2" />
                    {isInternal ? 'Add Note' : 'Send Reply'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-80 border-l border-slate-200 bg-white overflow-y-auto p-6 space-y-8">
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Customer Details</h3>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                <UserIcon className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-bold text-slate-900 truncate">{ticket.customer_email}</div>
                <div className="text-xs text-slate-500 truncate">{ticket.customer_email}</div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Query Type</span>
                <span className="font-medium text-slate-700">{ticket.query_type}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Source</span>
                <span className="font-medium text-slate-700">{ticket.source}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {ticket.tags?.map((tag) => (
                <span key={tag} className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-[10px] font-bold uppercase tracking-wider">
                  {tag}
                </span>
              ))}
              <button className="px-2 py-1 border border-dashed border-slate-300 text-slate-400 rounded text-[10px] font-bold uppercase tracking-wider hover:border-slate-400 hover:text-slate-500 transition-colors">
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
