import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { showToast } from '../components/ui/ToastContainer';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login, signup, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if already logged in
    if (user) {
      if (user.role === 'manager') navigate('/manager');
      else navigate('/');
    }
  }, [user, navigate]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    let res;
    if (isLogin) {
      res = await login(formData.email, formData.password);
    } else {
      res = await signup(formData.name, formData.email, formData.password);
    }

    if (res.success) {
      showToast('Welcome to Savoria! 🎉');
    } else {
      showToast(res.message, 'error');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center py-20 bg-stone-100 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden fade-in">
        <div className="bg-stone-900 p-6 text-center text-white">
          <span className="text-4xl mb-2 block">🍽️</span>
          <h2 className="font-display text-3xl font-bold">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-stone-400 mt-2">
            {isLogin ? 'Sign in to track your orders and bookings' : 'Join us for exclusive rewards and faster checkout'}
          </p>
        </div>

        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div>
                <label className="block text-stone-700 font-medium mb-2 text-sm">Full Name</label>
                <input 
                  type="text" name="name" required={!isLogin} value={formData.name} onChange={handleChange}
                  className="w-full px-4 py-3 border border-stone-300 rounded-lg text-stone-800 focus:border-amber-500 focus:outline-none bg-stone-50 focus:bg-white" 
                  placeholder="John Doe"
                />
              </div>
            )}
            
            <div>
              <label className="block text-stone-700 font-medium mb-2 text-sm">Email Address</label>
              <input 
                type="email" name="email" required value={formData.email} onChange={handleChange}
                className="w-full px-4 py-3 border border-stone-300 rounded-lg text-stone-800 focus:border-amber-500 focus:outline-none bg-stone-50 focus:bg-white" 
                placeholder="you@example.com"
              />
            </div>
            
            <div>
              <label className="block text-stone-700 font-medium mb-2 text-sm">Password</label>
              <input 
                type="password" name="password" required value={formData.password} onChange={handleChange}
                className="w-full px-4 py-3 border border-stone-300 rounded-lg text-stone-800 focus:border-amber-500 focus:outline-none bg-stone-50 focus:bg-white" 
                placeholder="••••••••"
                minLength={6}
              />
            </div>

            <button 
              type="submit" disabled={loading}
              className={`w-full py-4 text-white font-bold rounded-lg transition-all shadow-md ${
                loading ? 'bg-amber-400 cursor-not-allowed' : 'bg-amber-600 hover:bg-amber-700 transform hover:scale-[1.02]'
              }`}
            >
              {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button 
              onClick={() => { setIsLogin(!isLogin); setFormData({name:'', email:'', password:''}); }}
              className="text-amber-700 hover:text-amber-800 font-medium transition-colors"
            >
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </div>
          
          <div className="mt-6 pt-6 border-t border-stone-100 text-center text-sm text-stone-500">
            Manager Access: Sign in with registered manager credentials provided by admin.
          </div>
        </div>
      </div>
    </div>
  );
}
