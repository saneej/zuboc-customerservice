import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { AlertCircle, Loader2 } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zuboc-cream flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-20 h-20 flex items-center justify-center">
            <img 
              src="https://zuboc.com/cdn/shop/files/zuboc_logo_1.svg?v=1748579899" 
              alt="Zuboc Logo" 
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
        <h2 className="mt-8 text-center text-4xl font-serif font-medium text-zuboc-plum italic tracking-tight">
          Zuboc Desk
        </h2>
        <p className="mt-3 text-center text-sm text-zuboc-plum/50 font-light">
          Sign in to your support workspace
        </p>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-12 px-6 shadow-2xl shadow-zuboc-plum/5 sm:rounded-[2rem] sm:px-12 border border-zuboc-plum/5">
          <form className="space-y-8" onSubmit={handleLogin}>
            {error && (
              <div className="bg-rose-50 border border-rose-100 text-rose-700 px-5 py-4 rounded-2xl flex items-center text-sm font-medium">
                <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
                {error}
              </div>
            )}
            
            <div>
              <label htmlFor="email" className="block text-xs font-bold text-zuboc-plum/60 uppercase tracking-widest mb-3">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="zuboc-input"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-bold text-zuboc-plum/60 uppercase tracking-widest mb-3">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="zuboc-input"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-zuboc-plum focus:ring-zuboc-plum border-zuboc-plum/20 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-zuboc-plum/60 font-light">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-zuboc-plum hover:underline">
                  Forgot password?
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="zuboc-button-primary w-full py-4 text-lg flex justify-center items-center"
              >
                {loading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  'Sign in'
                )}
              </button>
            </div>
          </form>
        </div>
        
        <p className="mt-10 text-center text-sm text-zuboc-plum/60 font-light">
          Don't have an account?{' '}
          <Link to="/signup" className="font-bold text-zuboc-plum hover:underline">
            Create one for free
          </Link>
        </p>
      </div>
    </div>
  );
}
