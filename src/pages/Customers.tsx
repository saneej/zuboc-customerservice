import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  MoreVertical, 
  Mail, 
  Phone, 
  Building2, 
  Tag as TagIcon,
  ExternalLink,
  Loader2
} from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Customers() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('full_name', { ascending: true });
      
      if (error) throw error;
      setCustomers(data || []);
    } catch (error: any) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(customer => 
    customer.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Customers</h1>
          <p className="text-slate-500">Manage your contacts and their interaction history.</p>
        </div>
        <button className="flex items-center justify-center px-4 py-2 bg-zuboc-plum rounded-lg text-sm font-medium text-white hover:bg-zuboc-plum/90 transition-colors shadow-sm">
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
            placeholder="Search customers by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-zuboc-plum focus:border-zuboc-plum transition-all outline-none"
          />
        </div>
      </div>

      {/* Customers Grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-zuboc-plum/20 mb-4" />
          <p className="text-slate-400 text-sm">Loading customers...</p>
        </div>
      ) : filteredCustomers.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-slate-400">No customers found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredCustomers.map((customer) => (
            <div key={customer.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-lg mr-4 group-hover:bg-zuboc-plum/10 group-hover:text-zuboc-plum transition-colors">
                    {customer.full_name?.split(' ').map((n: string) => n[0]).join('') || '?'}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{customer.full_name}</h3>
                    <div className="flex items-center text-xs text-slate-500 mt-0.5">
                      <Building2 className="w-3 h-3 mr-1" />
                      {customer.organization_id ? 'Organization Member' : 'Individual'}
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
                {customer.phone && (
                  <div className="flex items-center text-sm text-slate-600">
                    <Phone className="w-4 h-4 mr-3 text-slate-400" />
                    {customer.phone}
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {customer.tags?.map((tag: string) => (
                  <span key={tag} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-bold uppercase tracking-wider">
                    {tag}
                  </span>
                ))}
                {(!customer.tags || customer.tags.length === 0) && <span className="text-xs text-slate-400 italic">No tags</span>}
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700">
                  Active
                </span>
                <button className="text-zuboc-plum text-sm font-bold flex items-center hover:text-zuboc-plum/80">
                  View Profile
                  <ExternalLink className="w-3 h-3 ml-1" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
