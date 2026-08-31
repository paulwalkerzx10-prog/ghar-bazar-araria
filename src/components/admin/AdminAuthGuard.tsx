import React, { useState, useEffect } from 'react';
import { ShieldCheck, Lock, Key, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useNavigate } from 'react-router-dom';

interface AdminAuthGuardProps {
  children: React.ReactNode;
}

export default function AdminAuthGuard({ children }: AdminAuthGuardProps) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // Check stored admin session token
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('gharbazar_admin_session') === 'true';
  });

  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  // Automatically authenticate if Firebase user exists
  useEffect(() => {
    if (user) {
      setIsAdminAuthenticated(true);
      localStorage.setItem('gharbazar_admin_session', 'true');
    }
  }, [user]);

  const handleVerifyPin = (e: React.FormEvent) => {
    e.preventDefault();
    // Support standard admin passcodes
    if (pinInput === '1234' || pinInput === 'admin123' || pinInput.toLowerCase() === 'admin') {
      setIsAdminAuthenticated(true);
      localStorage.setItem('gharbazar_admin_session', 'true');
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

  const handleLogoutAdmin = () => {
    setIsAdminAuthenticated(false);
    localStorage.removeItem('gharbazar_admin_session');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white text-xs font-bold">
        <div className="animate-spin w-6 h-6 border-2 border-[#0b803f] border-t-transparent rounded-full mr-2" />
        Verifying Admin Credentials...
      </div>
    );
  }

  if (!isAdminAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-sm w-full shadow-2xl space-y-6 text-center animate-in fade-in zoom-in-95 duration-200">
          
          <div className="w-16 h-16 rounded-3xl bg-[#0b803f] text-[#facc15] flex items-center justify-center mx-auto shadow-lg shadow-emerald-950/50">
            <Lock size={32} />
          </div>

          <div>
            <h2 className="text-xl font-black text-white tracking-tight">
              Ghar<span className="text-[#facc15]">Bazar</span> Admin Portal
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Restricted management portal for store administrators.
            </p>
          </div>

          <form onSubmit={handleVerifyPin} className="space-y-4">
            <div>
              <input 
                type="password"
                maxLength={10}
                value={pinInput}
                onChange={e => { setPinInput(e.target.value); setPinError(false); }}
                placeholder="Enter Admin Passcode (Default: 1234)"
                className="w-full p-3 bg-slate-950 border border-slate-800 text-white placeholder-slate-500 rounded-2xl text-center text-sm font-extrabold tracking-widest focus:outline-none focus:border-[#0b803f] focus:ring-2 focus:ring-[#0b803f]/30"
              />
              {pinError && (
                <p className="text-[11px] font-bold text-rose-400 mt-1.5">
                  Invalid passcode. Try "1234"
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-[#0b803f] hover:bg-emerald-700 text-white font-black text-xs py-3 rounded-2xl shadow-md active:scale-95 transition-all cursor-pointer"
            >
              Access Admin Panel
            </button>
          </form>

          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white font-bold transition-colors"
          >
            <ArrowLeft size={14} /> Back to Customer App
          </button>

        </div>
      </div>
    );
  }

  return (
    <div className="admin-wrapper font-sans text-slate-900">
      {React.cloneElement(children as React.ReactElement, { onLogoutAdmin: handleLogoutAdmin })}
    </div>
  );
}
