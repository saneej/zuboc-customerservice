import React, { useState } from 'react';
import { 
  Plus, 
  Filter, 
  Search, 
  MoreVertical, 
  ChevronRight,
  Clock,
  User as UserIcon,
  Tag as TagIcon
} from 'lucide-react';

const mockTickets = [
  { id: '4521', title: 'Cannot access my billing dashboard', customer: 'John Cooper', status: 'open', priority: 'high', assigned: 'Sarah M.', created: '2h ago' },
  { id: '4520', title: 'API integration returning 500 error', customer: 'TechCorp Inc.', status: 'pending', priority: 'urgent', assigned: 'Alex K.', created: '4h ago' },
  { id: '4519', title: 'Request for custom feature in mobile app', customer: 'Elena Rodriguez', status: 'new', priority: 'medium', assigned: null, created: '5h ago' },
  { id: '4518', title: 'Password reset link not working', customer: 'Mark Thompson', status: 'resolved', priority: 'low', assigned: 'Sarah M.', created: '1d ago' },
  { id: '4517', title: 'Subscription renewal question', customer: 'Global Logistics', status: 'open', priority: 'medium', assigned: 'Alex K.', created: '1d ago' },
];

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
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tickets</h1>
          <p className="text-slate-500">Manage and respond to customer requests.</p>
        </div>
        <button className="flex items-center justify-center px-4 py-2 bg-indigo-600 rounded-lg text-sm font-medium text-white hover:bg-indigo-700 transition-colors shadow-sm">
          <Plus className="w-4 h-4 mr-2" />
          Create Ticket
        </button>
      </div>

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
            {mockTickets.map((ticket) => (
              <tr 
                key={ticket.id} 
                onClick={() => navigate(`/tickets/${ticket.id}`)}
                className="hover:bg-slate-50 transition-colors cursor-pointer group"
              >
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      #{ticket.id} {ticket.title}
                    </span>
                    <div className="flex items-center mt-1 text-xs text-slate-500">
                      <Clock className="w-3 h-3 mr-1" />
                      {ticket.created}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center mr-3">
                      <UserIcon className="w-4 h-4 text-slate-400" />
                    </div>
                    <span className="text-sm text-slate-700">{ticket.customer}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={cn(
                    "px-2.5 py-1 rounded-full text-xs font-medium capitalize",
                    statusColors[ticket.status as keyof typeof statusColors]
                  )}>
                    {ticket.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={cn(
                    "px-2.5 py-1 rounded-full text-xs font-medium capitalize",
                    priorityColors[ticket.priority as keyof typeof priorityColors]
                  )}>
                    {ticket.priority}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center text-sm text-slate-600">
                    {ticket.assigned ? (
                      <>
                        <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center mr-2">
                          <span className="text-[10px] font-bold text-indigo-700">
                            {ticket.assigned.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        {ticket.assigned}
                      </>
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
