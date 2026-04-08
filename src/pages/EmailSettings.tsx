import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Save, 
  ArrowLeft, 
  Loader2,
  CheckCircle2,
  AlertCircle,
  Info
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

export default function EmailSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [workspace, setWorkspace] = useState<any>(null);
  const [settings, setSettings] = useState({
    sender_email: '',
    support_email: '',
    email_signature: '',
    notify_on_new_ticket: true,
    notify_on_reply: true
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    try {
      const { data, error } = await supabase
        .from('workspaces')
        .select('*')
        .limit(1)
        .single();

      if (error) throw error;
      setWorkspace(data);
      setSettings({
        sender_email: data.settings?.sender_email || 'zuboc@vdermauae.com',
        support_email: data.settings?.support_email || '',
        email_signature: data.settings?.email_signature || '',
        notify_on_new_ticket: data.settings?.notify_on_new_ticket ?? true,
        notify_on_reply: data.settings?.notify_on_reply ?? true
      });
    } catch (error: any) {
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('workspaces')
        .update({
          settings: {
            ...workspace.settings,
            ...settings
          }
        })
        .eq('id', workspace.id);

      if (error) throw error;
      toast.success('Email settings updated successfully');
    } catch (error: any) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-zuboc-plum/20" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <Link to="/settings" className="flex items-center text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-zuboc-plum transition-colors mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Settings
          </Link>
          <h1 className="text-3xl font-serif italic text-zuboc-plum">Email Settings</h1>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center px-6 py-3 bg-zuboc-plum text-white rounded-2xl font-bold text-sm hover:bg-zuboc-plum/90 transition-all shadow-sm disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
          Save Changes
        </button>
      </div>

      <div className="space-y-8">
        <div className="bg-white rounded-[32px] border border-slate-200 p-8 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center">
            <Mail className="w-5 h-5 mr-2 text-zuboc-plum" />
            Email Configuration
          </h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Sender Email Address</label>
              <input 
                type="email"
                value={settings.sender_email}
                onChange={(e) => setSettings({...settings, sender_email: e.target.value})}
                className="w-full bg-slate-50 border-slate-100 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-zuboc-plum/10 transition-all"
                placeholder="support@yourcompany.com"
              />
              <p className="mt-2 text-[10px] text-slate-400 flex items-center">
                <Info className="w-3 h-3 mr-1" />
                This email will be used as the "From" address for all system notifications.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Support Email Address</label>
              <input 
                type="email"
                value={settings.support_email}
                onChange={(e) => setSettings({...settings, support_email: e.target.value})}
                className="w-full bg-slate-50 border-slate-100 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-zuboc-plum/10 transition-all"
                placeholder="help@yourcompany.com"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Email Signature</label>
              <textarea 
                rows={4}
                value={settings.email_signature}
                onChange={(e) => setSettings({...settings, email_signature: e.target.value})}
                className="w-full bg-slate-50 border-slate-100 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-zuboc-plum/10 transition-all resize-none"
                placeholder="Best regards,\nThe Zuboc Team"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[32px] border border-slate-200 p-8 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-6">Notification Preferences</h2>
          <div className="space-y-4">
            <label className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 transition-all cursor-pointer border border-transparent hover:border-slate-100">
              <div className="flex-1">
                <div className="text-sm font-bold text-slate-900">New Ticket Notifications</div>
                <p className="text-xs text-slate-500">Notify agents when a new ticket is created</p>
              </div>
              <input 
                type="checkbox"
                checked={settings.notify_on_new_ticket}
                onChange={(e) => setSettings({...settings, notify_on_new_ticket: e.target.checked})}
                className="w-5 h-5 rounded border-slate-300 text-zuboc-plum focus:ring-zuboc-plum/20"
              />
            </label>

            <label className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 transition-all cursor-pointer border border-transparent hover:border-slate-100">
              <div className="flex-1">
                <div className="text-sm font-bold text-slate-900">Reply Notifications</div>
                <p className="text-xs text-slate-500">Notify customers when an agent replies to their ticket</p>
              </div>
              <input 
                type="checkbox"
                checked={settings.notify_on_reply}
                onChange={(e) => setSettings({...settings, notify_on_reply: e.target.checked})}
                className="w-5 h-5 rounded border-slate-300 text-zuboc-plum focus:ring-zuboc-plum/20"
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
