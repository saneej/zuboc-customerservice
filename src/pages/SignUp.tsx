import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { AlertCircle, Loader2 } from 'lucide-react';

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          }
        }
      });

      if (signUpError) throw signUpError;
      
      if (data.user) {
        // In a real app, we might wait for email confirmation or redirect to a "check your email" page
        // For this demo, we'll assume auto-confirm or just redirect to login
        alert('Account created! Please sign in.');
        navigate('/login');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to sign up');
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
          Join Zuboc Desk
        </h2>
        <p className="mt-3 text-center text-sm text-zuboc-plum/50 font-light">
          Create your agent account to get started
        </p>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-12 px-6 shadow-2xl shadow-zuboc-plum/5 sm:rounded-[2rem] sm:px-12 border border-zuboc-plum/5">
          <form className="space-y-8" onSubmit={handleSignUp}>
            {error && (
              <div className="bg-rose-50 border border-rose-100 text-rose-700 px-5 py-4 rounded-2xl flex items-center text-sm font-medium">
                <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
                {error}
              </div>
            )}
            
            <div>
              <label htmlFor="fullName" className="block text-xs font-bold text-zuboc-plum/60 uppercase tracking-widest mb-3">
                Full Name
              </label>
              <div className="mt-1">
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="zuboc-input"
                  placeholder="John Doe"
                />
              </div>
            </div>

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
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="zuboc-input"
                  placeholder="••••••••"
                />
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
                  'Create Account'
                )}
              </button>
            </div>
          </form>

          <div className="mt-10 text-center">
            <p className="text-sm text-zuboc-plum/60 font-light">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-zuboc-plum hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
