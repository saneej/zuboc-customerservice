import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Filter, 
  Search, 
  MoreVertical, 
  ChevronRight,
  Clock,
  User as UserIcon,
  Tag as TagIcon,
  X,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

const statusColors = {
  new: 'bg-blue-100 text-blue-700',
  open: 'bg-indigo-100 text-indigo-700',
  pending: 'bg-amber-100 text-amber-700',
  resolved: 'bg-emerald-100 text-emerald-700',
  closed: 'bg-slate-100 text-slate-700',
  on_hold: 'bg-rose-100 text-rose-700',
};

const priorityColors = {
  low: 'bg-slate-100 text-slate-600',
  medium: 'bg-blue-100 text-blue-600',
  high: 'bg-orange-100 text-orange-600',
  urgent: 'bg-red-100 text-red-600',
};

import { useNavigate } from 'react-router-dom';

export default function Tickets() {
  const [view, setView] = useState<'list' | 'kanban'>('list');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tickets, setTickets] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    customer_email: '',
    subject: '',
    description: '',
    priority: 'medium',
    query_type: 'order',
    source: 'whatsapp'
  });

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    setFetching(true);
    try {
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setTickets(data || []);
    } catch (error: any) {
      toast.error('Failed to fetch tickets: ' + error.message);
    } finally {
      setFetching(false);
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Get workspace ID
      let workspaceId = '00000000-0000-0000-0000-000000000000';
      const { data: workspaces } = await supabase.from('workspaces').select('id').limit(1);
      if (workspaces && workspaces.length > 0) {
        workspaceId = workspaces[0].id;
      }

      const response = await fetch('/api/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          workspace_id: workspaceId
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create ticket');
      }

      toast.success(`Ticket ${result.ticket.ticket_number} created successfully!`);
      setIsModalOpen(false);
      setFormData({
        customer_email: '',
        subject: '',
        description: '',
        priority: 'medium',
        query_type: 'order',
        source: 'whatsapp'
      });
      fetchTickets();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tickets</h1>
          <p className="text-slate-500">Manage and respond to customer requests.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center px-4 py-2 bg-zuboc-plum rounded-lg text-sm font-medium text-white hover:bg-zuboc-plum/90 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Ticket
        </button>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-zuboc-cream/20">
              <h2 className="text-xl font-bold text-zuboc-plum">Create New Ticket</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white rounded-full transition-colors">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            
            <form onSubmit={handleCreateTicket} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Customer Email</label>
                  <input 
                    type="email" 
                    required
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-zuboc-plum/20 focus:border-zuboc-plum outline-none transition-all"
                    value={formData.customer_email}
                    onChange={(e) => setFormData({...formData, customer_email: e.target.value})}
                    placeholder="customer@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Source / Medium</label>
                  <select 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-zuboc-plum/20 focus:border-zuboc-plum outline-none transition-all"
                    value={formData.source}
                    onChange={(e) => setFormData({...formData, source: e.target.value})}
                  >
                    <option value="whatsapp">WhatsApp</option>
                    <option value="email">Email</option>
                    <option value="phone">Phone Call</option>
                    <option value="instagram">Instagram</option>
                    <option value="facebook">Facebook</option>
                    <option value="web">Website</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Subject</label>
                <input 
                  type="text" 
                  required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-zuboc-plum/20 focus:border-zuboc-plum outline-none transition-all"
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  placeholder="Brief summary of the issue"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Description</label>
                <textarea 
                  required
                  rows={4}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-zuboc-plum/20 focus:border-zuboc-plum outline-none transition-all resize-none"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Detailed explanation of the customer's request"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Priority</label>
                  <select 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-zuboc-plum/20 focus:border-zuboc-plum outline-none transition-all"
                    value={formData.priority}
                    onChange={(e) => setFormData({...formData, priority: e.target.value})}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Query Type</label>
                  <select 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-zuboc-plum/20 focus:border-zuboc-plum outline-none transition-all"
                    value={formData.query_type}
                    onChange={(e) => setFormData({...formData, query_type: e.target.value})}
                  >
                    <option value="order">Order Related</option>
                    <option value="account">Account Related</option>
                    <option value="delivery">Delivery Related</option>
                    <option value="return">Return Related</option>
                    <option value="product">Product Related</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex gap-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-6 py-4 border border-slate-200 rounded-2xl font-bold text-slate-600 hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={loading}
                  className="flex-[2] px-6 py-4 bg-zuboc-plum text-white rounded-2xl font-bold hover:bg-zuboc-plum/90 transition-all shadow-lg shadow-zuboc-plum/20 flex items-center justify-center"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Plus className="w-5 h-5 mr-2" />}
                  Create Ticket & Send Email
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <div className="relative flex-1 md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search tickets..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            />
          </div>
          <button className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600">
            <Filter className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button 
              onClick={() => setView('list')}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                view === 'list' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
            >
              List
            </button>
            <button 
              onClick={() => setView('kanban')}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                view === 'kanban' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
            >
              Kanban
            </button>
          </div>
          <select className="text-sm border-slate-200 bg-white rounded-lg px-3 py-2 text-slate-600 focus:ring-indigo-500">
            <option>All Tickets</option>
            <option>My Tickets</option>
            <option>Unassigned</option>
            <option>Recently Updated</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Ticket</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Customer</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Priority</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Assignee</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {fetching ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-zuboc-plum/20 mb-4" />
                  <p className="text-slate-400 text-sm">Loading tickets...</p>
                </td>
              </tr>
            ) : tickets.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center">
                  <p className="text-slate-400 text-sm">No tickets found.</p>
                </td>
              </tr>
            ) : tickets.map((ticket) => (
              <tr 
                key={ticket.id} 
                onClick={() => navigate(`/tickets/${ticket.id}`)}
                className="hover:bg-slate-50 transition-colors cursor-pointer group"
              >
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-slate-900 group-hover:text-zuboc-plum transition-colors">
                      #{ticket.ticket_number || ticket.id.slice(0, 8)} {ticket.title}
                    </span>
                    <div className="flex items-center mt-1 text-xs text-slate-500">
                      <Clock className="w-3 h-3 mr-1" />
                      {new Date(ticket.created_at).toLocaleDateString()}
                      {ticket.source && (
                        <span className="ml-2 px-1.5 py-0.5 bg-slate-100 rounded text-[10px] uppercase font-bold text-slate-500">
                          via {ticket.source}
                        </span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center mr-3">
                      <UserIcon className="w-4 h-4 text-slate-400" />
                    </div>
                    <span className="text-sm text-slate-700">{ticket.customer_email || 'No Email'}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={cn(
                    "px-2.5 py-1 rounded-full text-xs font-medium capitalize",
                    statusColors[ticket.status as keyof typeof statusColors] || 'bg-slate-100 text-slate-600'
                  )}>
                    {ticket.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={cn(
                    "px-2.5 py-1 rounded-full text-xs font-medium capitalize",
                    priorityColors[ticket.priority as keyof typeof priorityColors] || 'bg-slate-100 text-slate-600'
                  )}>
                    {ticket.priority}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center text-sm text-slate-600">
                    {ticket.assigned_to ? (
                      <span className="text-xs">Assigned</span>
                    ) : (
                      <span className="text-slate-400 italic">Unassigned</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="p-2 rounded-lg hover:bg-slate-200 text-slate-400 transition-colors">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
