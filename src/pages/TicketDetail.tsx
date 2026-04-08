import React, { useState } from 'react';
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
  Globe
} from 'lucide-react';

const mockTicket = {
  id: '4521',
  title: 'Cannot access my billing dashboard',
  description: "I've been trying to access the billing section for the last 2 hours but it keeps showing a 404 error. My subscription is due tomorrow and I need to update my card details. Please help!",
  customer: { name: 'John Cooper', email: 'john@example.com', company: 'Cooper Design' },
  status: 'open',
  priority: 'high',
  assigned: 'Sarah Miller',
  created: '2026-04-08 10:30 AM',
  tags: ['billing', 'urgent', 'bug'],
  messages: [
    { id: 1, author: 'John Cooper', body: "I've been trying to access the billing section for the last 2 hours but it keeps showing a 404 error.", time: '10:30 AM', is_internal: false },
    { id: 2, author: 'Sarah Miller', body: "Hi John, I'm looking into this right now. Could you please clear your browser cache and try again?", time: '10:45 AM', is_internal: false },
    { id: 3, author: 'Sarah Miller', body: "Internal Note: Checking server logs for billing endpoint. Seems like a routing issue in the latest deployment.", time: '10:46 AM', is_internal: true },
  ]
};

export default function TicketDetail() {
  const { id } = useParams();
  const [reply, setReply] = useState('');
  const [isInternal, setIsInternal] = useState(false);

  return (
    <div className="h-full flex flex-col -m-8">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center space-x-4">
          <Link to="/tickets" className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-slate-400 font-mono text-sm">#{id || mockTicket.id}</span>
              <h1 className="text-lg font-bold text-slate-900">{mockTicket.title}</h1>
            </div>
            <div className="flex items-center space-x-3 mt-1">
              <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded text-xs font-medium capitalize">{mockTicket.status}</span>
              <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded text-xs font-medium capitalize">{mockTicket.priority}</span>
              <span className="text-slate-400 text-xs">Created {mockTicket.created}</span>
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
            {mockTicket.messages.map((msg) => (
              <div key={msg.id} className={cn(
                "flex space-x-4 max-w-4xl",
                msg.is_internal ? "bg-amber-50/50 p-4 rounded-xl border border-amber-100" : ""
              )}>
                <div className="w-10 h-10 rounded-full bg-slate-200 flex-shrink-0 flex items-center justify-center overflow-hidden">
                  <UserIcon className="w-6 h-6 text-slate-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-900">{msg.author}</span>
                      {msg.is_internal && (
                        <span className="flex items-center text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                          <Lock className="w-3 h-3 mr-1" /> Internal Note
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-400">{msg.time}</span>
                  </div>
                  <div className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {msg.body}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Reply Area */}
          <div className="bg-white border-t border-slate-200 p-6 flex-shrink-0">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center space-x-4 mb-4">
                <button 
                  onClick={() => setIsInternal(false)}
                  className={cn(
                    "text-sm font-medium pb-2 border-b-2 transition-all",
                    !isInternal ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-700"
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
                isInternal ? "border-amber-200 bg-amber-50/20 focus-within:ring-amber-500" : "border-slate-200 focus-within:ring-indigo-500"
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
                    isInternal ? "bg-amber-600 hover:bg-amber-700" : "bg-indigo-600 hover:bg-indigo-700"
                  )}>
                    <Send className="w-4 h-4 mr-2" />
                    {isInternal ? 'Add Note' : 'Send Reply'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="w-80 bg-white border-l border-slate-200 overflow-y-auto flex-shrink-0">
          <div className="p-6 space-y-8">
            {/* Customer Info */}
            <section>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Customer</h3>
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-lg mr-4">
                  JC
                </div>
                <div>
                  <p className="font-bold text-slate-900">{mockTicket.customer.name}</p>
                  <p className="text-xs text-slate-500">{mockTicket.customer.email}</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center text-sm">
                  <Globe className="w-4 h-4 text-slate-400 mr-2" />
                  <span className="text-slate-600">{mockTicket.customer.company}</span>
                </div>
                <div className="flex items-center text-sm">
                  <History className="w-4 h-4 text-slate-400 mr-2" />
                  <span className="text-slate-600">12 previous tickets</span>
                </div>
              </div>
            </section>

            {/* Ticket Properties */}
            <section className="space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Properties</h3>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Assignee</label>
                <select className="w-full text-sm border-slate-200 rounded-lg focus:ring-indigo-500">
                  <option>{mockTicket.assigned}</option>
                  <option>Alex K.</option>
                  <option>Unassigned</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Priority</label>
                <select className="w-full text-sm border-slate-200 rounded-lg focus:ring-indigo-500">
                  <option className="capitalize">{mockTicket.priority}</option>
                  <option>Low</option>
                  <option>Medium</option>
                  <option>Urgent</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Tags</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {mockTicket.tags.map(tag => (
                    <span key={tag} className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-[10px] font-bold uppercase tracking-wider">
                      {tag}
                    </span>
                  ))}
                  <button className="p-1 border border-dashed border-slate-300 rounded text-slate-400 hover:border-indigo-400 hover:text-indigo-400 transition-colors">
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </section>

            {/* SLA Timer */}
            <section className="bg-rose-50 p-4 rounded-xl border border-rose-100">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold text-rose-700 uppercase tracking-widest">SLA Status</h3>
                <ShieldAlert className="w-4 h-4 text-rose-600" />
              </div>
              <p className="text-sm font-bold text-rose-900">Next response due in</p>
              <p className="text-2xl font-black text-rose-600 mt-1">00:42:15</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}

function Plus({ className }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>;
}
