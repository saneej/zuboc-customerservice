import React from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  MoreVertical, 
  Mail, 
  Phone, 
  Building2, 
  Tag as TagIcon,
  ExternalLink
} from 'lucide-react';

const mockCustomers = [
  { id: 1, name: 'John Cooper', email: 'john@example.com', company: 'Cooper Design', tickets: 12, status: 'active', tags: ['vip', 'design'] },
  { id: 2, name: 'Sarah Miller', email: 'sarah.m@techcorp.com', company: 'TechCorp Inc.', tickets: 4, status: 'active', tags: ['enterprise'] },
  { id: 3, name: 'Alex Rivera', email: 'alex@rivera.io', company: 'Rivera Studio', tickets: 1, status: 'new', tags: ['trial'] },
  { id: 4, name: 'Elena Rodriguez', email: 'elena@logistics.com', company: 'Global Logistics', tickets: 45, status: 'active', tags: ['vip', 'logistics'] },
  { id: 5, name: 'Mark Thompson', email: 'mark@thompson.me', company: 'Individual', tickets: 2, status: 'inactive', tags: [] },
];

export default function Customers() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Customers</h1>
          <p className="text-slate-500">Manage your contacts and their interaction history.</p>
        </div>
        <button className="flex items-center justify-center px-4 py-2 bg-indigo-600 rounded-lg text-sm font-medium text-white hover:bg-indigo-700 transition-colors shadow-sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Customer
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 md:max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search customers by name, email, or company..."
            className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
          />
        </div>
        <div className="flex items-center space-x-3">
          <select className="text-sm border-slate-200 bg-white rounded-lg px-3 py-2 text-slate-600">
            <option>All Segments</option>
            <option>VIP Customers</option>
            <option>Enterprise</option>
            <option>New Trials</option>
          </select>
          <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
            Export CSV
          </button>
        </div>
      </div>

      {/* Customers Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {mockCustomers.map((customer) => (
          <div key={customer.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-lg mr-4 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                  {customer.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">{customer.name}</h3>
                  <div className="flex items-center text-xs text-slate-500 mt-0.5">
                    <Building2 className="w-3 h-3 mr-1" />
                    {customer.company}
                  </div>
                </div>
              </div>
              <button className="p-2 text-slate-400 hover:text-slate-600">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center text-sm text-slate-600">
                <Mail className="w-4 h-4 mr-3 text-slate-400" />
                {customer.email}
              </div>
              <div className="flex items-center text-sm text-slate-600">
                <Users className="w-4 h-4 mr-3 text-slate-400" />
                {customer.tickets} tickets total
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              {customer.tags.map(tag => (
                <span key={tag} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-bold uppercase tracking-wider">
                  {tag}
                </span>
              ))}
              {customer.tags.length === 0 && <span className="text-xs text-slate-400 italic">No tags</span>}
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className={cn(
                "px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider",
                customer.status === 'active' ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"
              )}>
                {customer.status}
              </span>
              <button className="text-indigo-600 text-sm font-bold flex items-center hover:text-indigo-700">
                View Profile
                <ExternalLink className="w-3 h-3 ml-1" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
