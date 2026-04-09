import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
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
  Plus,
  MessageSquare,
  Phone
} from 'lucide-react';
import { supabase, Ticket, Profile } from '../lib/supabase';
import { cn } from '../lib/utils';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';

export default function TicketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { profile: currentUserProfile } = useAuth();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [agents, setAgents] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);

  useEffect(() => {
    if (id) {
      fetchTicket();
      fetchMessages();
      fetchAgents();
    }
  }, [id]);

  async function fetchTicket() {
    try {
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setTicket(data);
    } catch (error: any) {
      toast.error('Failed to fetch ticket details');
    } finally {
      setLoading(false);
    }
  }

  async function fetchMessages() {
    try {
      const { data, error } = await supabase
        .from('ticket_messages')
        .select(`
          *,
          author:profiles(full_name, avatar_url, email)
        `)
        .eq('ticket_id', id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error: any) {
      console.error('Error fetching messages:', error);
    }
  }

  async function fetchAgents() {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .in('role', ['admin', 'agent', 'manager']);

      if (error) throw error;
      setAgents(data || []);
    } catch (error: any) {
      console.error('Error fetching agents:', error);
    }
  }

  const handleSendReply = async () => {
    if (!reply.trim() && selectedFiles.length === 0) return;
    setIsSubmitting(true);

    try {
      // 1. Upload files if any
      const attachmentUrls: string[] = [];
      if (selectedFiles.length > 0) {
        setUploadingFiles(true);
        for (const file of selectedFiles) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
          const filePath = `public/${fileName}`;

          const { error: uploadError } = await supabase.storage
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

      const { error } = await supabase
        .from('ticket_messages')
        .insert([
          {
            ticket_id: id,
            author_id: currentUserProfile?.id,
            body: reply,
            is_internal: isInternal,
            attachments: attachmentUrls
          }
        ]);

      if (error) throw error;

      // If public reply, send email notification via server
      if (!isInternal && ticket) {
        try {
          await fetch('/api/notifications/reply', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ticket_id: ticket.id,
              ticket_number: ticket.ticket_number,
              subject: ticket.title,
              body: reply,
              customer_email: ticket.customer_email,
              workspace_id: ticket.workspace_id
            })
          });
        } catch (notifyError) {
          console.error('Failed to send email notification:', notifyError);
        }
      }

      setReply('');
      setSelectedFiles([]);
      fetchMessages();
      toast.success(isInternal ? 'Internal note added' : 'Reply sent');
    } catch (error: any) {
      toast.error('Failed to send reply');
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateTicketStatus = async (status: string) => {
    try {
      const { error } = await supabase
        .from('tickets')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
      setTicket(prev => prev ? { ...prev, status: status as any } : null);
      toast.success(`Ticket marked as ${status}`);
    } catch (error: any) {
      toast.error('Failed to update status');
    }
  };

  const updateTicketPriority = async (priority: string) => {
    try {
      const { error } = await supabase
        .from('tickets')
        .update({ priority })
        .eq('id', id);

      if (error) throw error;
      setTicket(prev => prev ? { ...prev, priority: priority as any } : null);
      toast.success(`Priority updated to ${priority}`);
    } catch (error: any) {
      toast.error('Failed to update priority');
    }
  };

  const updateTicketAssignee = async (assignedTo: string | null) => {
    try {
      const { error } = await supabase
        .from('tickets')
        .update({ assigned_to: assignedTo })
        .eq('id', id);

      if (error) throw error;
      setTicket(prev => prev ? { ...prev, assigned_to: assignedTo } : null);
      toast.success(assignedTo ? 'Ticket assigned' : 'Ticket unassigned');
    } catch (error: any) {
      toast.error('Failed to update assignee');
    }
  };

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
          {ticket.status !== 'resolved' && ticket.status !== 'closed' ? (
            <button 
              onClick={() => updateTicketStatus('resolved')}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
            >
              Resolve
            </button>
          ) : (
            <button 
              onClick={() => updateTicketStatus('open')}
              className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Reopen
            </button>
          )}
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

            {/* Messages */}
            {messages.map((msg) => (
              <div key={msg.id} className={cn(
                "flex space-x-4 max-w-4xl",
                msg.is_internal ? "bg-amber-50/50 p-4 rounded-xl border border-amber-100" : ""
              )}>
                <div className="w-10 h-10 rounded-full bg-slate-200 flex-shrink-0 flex items-center justify-center overflow-hidden">
                  {msg.author?.avatar_url ? (
                    <img src={msg.author.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon className="w-6 h-6 text-slate-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-900">{msg.author?.full_name || msg.author?.email || 'System'}</span>
                      {msg.is_internal && (
                        <span className="flex items-center text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                          <Lock className="w-3 h-3 mr-1" /> Internal Note
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-400">{new Date(msg.created_at).toLocaleString()}</span>
                  </div>
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                      {msg.body}
                    </div>

                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-slate-100">
                        <div className="flex flex-wrap gap-2">
                          {msg.attachments.map((url: string, idx: number) => (
                            <a 
                              key={idx} 
                              href={url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="group relative w-16 h-16 rounded-lg overflow-hidden border border-slate-200"
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
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-xs text-slate-400">
                      {new Date(msg.created_at).toLocaleString()}
                    </div>
                    {ticket.customer_phone && (
                      <a 
                        href={`https://wa.me/${ticket.customer_phone.replace(/\D/g, '')}?text=${encodeURIComponent(msg.body)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-[10px] font-bold text-[#25D366] hover:text-[#128C7E] transition-colors"
                      >
                        <Phone className="w-3 h-3" />
                        Share to WhatsApp
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <p className="text-sm">No replies yet. Start the conversation below.</p>
              </div>
            )}
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
                    <input 
                      type="file" 
                      id="reply-attachment" 
                      multiple 
                      className="hidden" 
                      onChange={(e) => {
                        if (e.target.files) {
                          setSelectedFiles(Array.from(e.target.files));
                        }
                      }}
                    />
                    <label 
                      htmlFor="reply-attachment"
                      className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                    >
                      <Paperclip className="w-5 h-5" />
                    </label>
                    <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                      <TagIcon className="w-5 h-5" />
                    </button>
                    
                    {selectedFiles.length > 0 && (
                      <span className="text-[10px] font-bold text-zuboc-plum bg-zuboc-cream px-2 py-1 rounded-full">
                        {selectedFiles.length} files
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    {ticket.customer_phone && !isInternal && (
                      <a 
                        href={`https://wa.me/${ticket.customer_phone.replace(/\D/g, '')}?text=${encodeURIComponent(reply)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                          "flex items-center px-4 py-2 rounded-lg text-sm font-bold text-white shadow-sm transition-all bg-[#25D366] hover:bg-[#128C7E]",
                          (!reply.trim()) && "opacity-50 cursor-not-allowed pointer-events-none"
                        )}
                      >
                        <Phone className="w-4 h-4 mr-2" />
                        Send via WhatsApp
                      </a>
                    )}
                    <button 
                      onClick={handleSendReply}
                      disabled={isSubmitting || (!reply.trim() && selectedFiles.length === 0)}
                      className={cn(
                        "flex items-center px-4 py-2 rounded-lg text-sm font-bold text-white shadow-sm transition-all",
                        isInternal ? "bg-amber-600 hover:bg-amber-700" : "bg-zuboc-plum hover:bg-zuboc-plum/90",
                        (isSubmitting || (!reply.trim() && selectedFiles.length === 0)) && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                      {isInternal ? 'Add Note' : 'Send Reply'}
                    </button>
                  </div>
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
                <span className="text-slate-400">Phone</span>
                <span className="font-medium text-slate-700">{ticket.customer_phone || 'Not provided'}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Query Type</span>
                <span className="font-medium text-slate-700">{ticket.query_type}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Source</span>
                <span className="font-medium text-slate-700">{ticket.source}</span>
              </div>
            </div>

            {ticket.customer_phone && (
              <div className="mt-6">
                <a 
                  href={`https://wa.me/${ticket.customer_phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hello, I'm responding to your Zuboc Desk ticket #${ticket.ticket_number}.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#25D366] text-white rounded-xl text-xs font-bold hover:bg-[#128C7E] transition-all shadow-sm"
                >
                  <Phone className="w-3.5 h-3.5" />
                  Send via WhatsApp
                </a>
              </div>
            )}
          </div>

          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Properties</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Assignee</label>
                <select 
                  value={ticket.assigned_to || ''}
                  onChange={(e) => updateTicketAssignee(e.target.value || null)}
                  className="w-full text-sm border-slate-200 rounded-lg focus:ring-zuboc-plum/20 outline-none"
                >
                  <option value="">Unassigned</option>
                  {agents.map(agent => (
                    <option key={agent.id} value={agent.id}>{agent.full_name || agent.email}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Priority</label>
                <select 
                  value={ticket.priority}
                  onChange={(e) => updateTicketPriority(e.target.value)}
                  className="w-full text-sm border-slate-200 rounded-lg focus:ring-zuboc-plum/20 outline-none"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
