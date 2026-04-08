import React, { useState, useEffect } from 'react';
import { supabase, Profile, UserRole } from '../lib/supabase';
import { 
  Users, 
  UserPlus, 
  Mail, 
  Shield, 
  MoreVertical, 
  Search,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../lib/utils';

export default function Team() {
  const { profile: currentUserProfile } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAgent, setNewAgent] = useState({ email: '', fullName: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'members' | 'settings'>('members');
  const [workspace, setWorkspace] = useState<any>(null);
  const [senderEmail, setSenderEmail] = useState('');
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  useEffect(() => {
    fetchProfiles();
    fetchWorkspace();
  }, []);

  async function fetchWorkspace() {
    try {
      const { data, error } = await supabase
        .from('workspaces')
        .select('*')
        .limit(1)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No workspace found, create a default one
          const { data: newData, error: createError } = await supabase
            .from('workspaces')
            .insert([{ name: 'Zuboc Desk', slug: 'zuboc-desk', settings: { sender_email: 'zuboc@vdermauae.com' } }])
            .select()
            .single();
          
          if (createError) throw createError;
          setWorkspace(newData);
          setSenderEmail(newData.settings?.sender_email || '');
        } else {
          throw error;
        }
      } else {
        setWorkspace(data);
        setSenderEmail(data.settings?.sender_email || '');
      }
    } catch (error: any) {
      console.error('Error fetching workspace:', error);
    }
  }

  const handleSaveSettings = async () => {
    if (!workspace) return;
    setIsSavingSettings(true);
    try {
      const newSettings = { ...workspace.settings, sender_email: senderEmail };
      const { error } = await supabase
        .from('workspaces')
        .update({ settings: newSettings })
        .eq('id', workspace.id);

      if (error) throw error;
      setWorkspace({ ...workspace, settings: newSettings });
      toast.success('System settings updated');
    } catch (error: any) {
      toast.error('Failed to update settings');
    } finally {
      setIsSavingSettings(false);
    }
  };

  async function fetchProfiles() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProfiles(data || []);
    } catch (error: any) {
      toast.error('Failed to fetch team members');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  const handleAddAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // In a real app, you'd use a server-side function to create the auth user.
      // For this demo, we'll inform the admin that the agent needs to sign up.
      toast.info(`Agent account for ${newAgent.email} initialized. Please ask them to sign up with this email.`);
      
      // We could pre-create the profile here if we had a way to know the ID, 
      // but Supabase profiles are linked to auth.users.id.
      // So we'll just close the modal for now.
      
      setShowAddModal(false);
      setNewAgent({ email: '', fullName: '' });
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateRole = async (userId: string, newRole: UserRole) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw error;
      
      setProfiles(profiles.map(p => p.id === userId ? { ...p, role: newRole } : p));
      toast.success('Role updated successfully');
    } catch (error: any) {
      toast.error('Failed to update role');
    }
  };

  const filteredProfiles = profiles.filter(p => 
    p.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.full_name?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (currentUserProfile?.role !== 'admin') {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-500 mb-6">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h1>
        <p className="text-slate-500 max-w-md">
          Only administrators can access the team management page.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Admin Console</h1>
          <p className="text-slate-500">Manage your team and system-wide configurations.</p>
        </div>
        {activeTab === 'members' && (
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-zuboc-plum text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-zuboc-plum/90 transition-colors flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            Add Agent
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-6 border-b border-slate-200">
        <button 
          onClick={() => setActiveTab('members')}
          className={cn(
            "pb-4 text-sm font-bold transition-all border-b-2",
            activeTab === 'members' ? "border-zuboc-plum text-zuboc-plum" : "border-transparent text-slate-400 hover:text-slate-600"
          )}
        >
          Team Members
        </button>
        <button 
          onClick={() => setActiveTab('settings')}
          className={cn(
            "pb-4 text-sm font-bold transition-all border-b-2",
            activeTab === 'settings' ? "border-zuboc-plum text-zuboc-plum" : "border-transparent text-slate-400 hover:text-slate-600"
          )}
        >
          System Settings
        </button>
      </div>

      {activeTab === 'members' ? (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50/50">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-zuboc-plum/20 outline-none transition-all"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Joined</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center">
                      <Loader2 className="w-8 h-8 animate-spin text-zuboc-plum/20 mx-auto mb-4" />
                      <p className="text-slate-400 text-sm">Loading team members...</p>
                    </td>
                  </tr>
                ) : filteredProfiles.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center">
                      <p className="text-slate-400 text-sm">No team members found.</p>
                    </td>
                  </tr>
                ) : (
                  filteredProfiles.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-zuboc-plum/5 flex items-center justify-center text-zuboc-plum font-bold mr-3">
                            {p.full_name?.[0] || p.email[0].toUpperCase()}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-slate-900">{p.full_name || 'No Name'}</div>
                            <div className="text-xs text-slate-500">{p.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <select 
                          value={p.role}
                          onChange={(e) => updateRole(p.id, e.target.value as UserRole)}
                          disabled={p.id === currentUserProfile?.id}
                          className="text-xs font-medium bg-slate-100 border-none rounded-full px-3 py-1 focus:ring-2 focus:ring-zuboc-plum/20 outline-none cursor-pointer disabled:opacity-50"
                        >
                          <option value="admin">Admin</option>
                          <option value="agent">Agent</option>
                          <option value="viewer">Viewer</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {new Date(p.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="max-w-2xl space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Email Configuration</h3>
                <p className="text-sm text-slate-500">Set the default sender address for system notifications.</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Sender Email Address</label>
                <input 
                  type="email"
                  value={senderEmail}
                  onChange={(e) => setSenderEmail(e.target.value)}
                  placeholder="support@zuboc.com"
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-zuboc-plum/20 outline-none"
                />
                <p className="text-[10px] text-slate-400 mt-2 italic">
                  This email will be used as the "From" address for all ticket notifications.
                </p>
              </div>

              <div className="pt-4">
                <button 
                  onClick={handleSaveSettings}
                  disabled={isSavingSettings}
                  className="bg-zuboc-plum text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-zuboc-plum/90 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {isSavingSettings ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  Save Changes
                </button>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 rounded-xl border border-amber-100 p-6 flex gap-4">
            <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-amber-900 mb-1">Important Note</h4>
              <p className="text-xs text-amber-700 leading-relaxed">
                Changing the sender email requires proper SPF/DKIM configuration on your domain to ensure deliverability. 
                Currently, this system uses a demo Mailtrap account for testing.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Add Agent Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Add New Agent</h2>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddAgent} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Full Name</label>
                <input 
                  type="text"
                  required
                  placeholder="Agent Name"
                  value={newAgent.fullName}
                  onChange={(e) => setNewAgent({...newAgent, fullName: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-zuboc-plum/20 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email Address</label>
                <input 
                  type="email"
                  required
                  placeholder="agent@example.com"
                  value={newAgent.email}
                  onChange={(e) => setNewAgent({...newAgent, email: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-zuboc-plum/20 outline-none"
                />
              </div>
              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-zuboc-plum text-white rounded-lg text-sm font-medium hover:bg-zuboc-plum/90 transition-colors flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Add Agent'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
