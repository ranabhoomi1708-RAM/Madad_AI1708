import React, { useState } from 'react';
import { Eye, EyeOff, KeyRound, Mail, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// 10 Core Application Pages
import Home from './pages/Home';
import FindHelp from './pages/FindHelp';
import RequestHelp from './pages/RequestHelp';
import MatchingResults from './pages/MatchingResults';
import GiveHelp from './pages/GiveHelp';
import TrackRequest from './pages/TrackRequest';
import AboutUs from './pages/AboutUs';
import SafetyPrivacy from './pages/SafetyPrivacy';
import LoginSignup from './pages/LoginSignup';
import AdminDashboard from './pages/AdminDashboard';
import { authForgotPassword, authResetPassword, fetchUserRequests } from './services/api';

// ── Inline ForgotPassword Page ─────────────────────────────────
function ForgotPassword({ setActivePage }) {
  const [step, setStep] = useState('email'); // email | reset | done
  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [msg, setMsg] = useState(null);

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await authForgotPassword(email.trim());
      if (res.success) {
        setResetToken(res.data.resetToken);
        setStep('reset');
        setMsg('Verification reset token generated! Enter your new password below.');
      } else {
        setError(res.error?.message || 'Password reset request failed.');
      }
    } catch {
      setError('Unable to connect to server. Please try again.');
    }
    setLoading(false);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError(null);
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }
    setLoading(true);
    try {
      const res = await authResetPassword(email.trim(), resetToken, newPassword);
      if (res.success) {
        setStep('done');
        setMsg('Your password has been successfully reset! You can now log in.');
      } else {
        setError(res.error?.message || 'Password reset failed. Invalid or expired token.');
      }
    } catch {
      setError('Unable to connect to server. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 bg-orange-50 border border-orange-200 rounded-2xl flex items-center justify-center text-[#ea580c] mx-auto">
          <KeyRound className="w-6 h-6 stroke-[2]" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Reset Password</h1>
        <p className="text-xs text-slate-500 max-w-xs mx-auto">
          {step === 'email' && "Enter your registered email and we'll help you regain access."}
          {step === 'reset' && "Choose a secure new password for your account."}
          {step === 'done' && "Account recovered successfully."}
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3.5 rounded-2xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {msg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3.5 rounded-2xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{msg}</span>
        </div>
      )}

      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-md">
        {step === 'email' && (
          <form onSubmit={handleRequestReset} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Your Email Address *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full text-xs p-3.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#ea580c]/20 focus:border-[#ea580c]"
                placeholder="your-email@example.com"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#ea580c] hover:bg-[#d44a05] text-white py-3.5 rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Sending Request...' : 'Generate Reset Token'}
            </button>
          </form>
        )}

        {step === 'reset' && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                New Password *
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="w-full text-xs p-3.5 pr-11 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#ea580c]/20 focus:border-[#ea580c]"
                  placeholder="Min 6 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  aria-label={showNewPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Confirm New Password *
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full text-xs p-3.5 pr-11 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#ea580c]/20 focus:border-[#ea580c]"
                  placeholder="Repeat new password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#ea580c] hover:bg-[#d44a05] text-white py-3.5 rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Updating Password...' : 'Save New Password'}
            </button>
          </form>
        )}

        {step === 'done' && (
          <div className="space-y-4 text-center">
            <p className="text-xs text-slate-600">Your password was changed. You can now log into your MADAD account.</p>
            <button
              onClick={() => setActivePage('login')}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              Go to Sign In
            </button>
          </div>
        )}
      </div>

      <div className="text-center">
        <button
          onClick={() => setActivePage('login')}
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-[#ea580c] font-semibold cursor-pointer transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Sign In</span>
        </button>
      </div>
    </div>
  );
}

// ── Inline User Dashboard Page ─────────────────────────────────
function Dashboard({ auth, setAuth, setActivePage }) {
  const [requests, setRequests] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!auth?.user?.id) return;
    fetchUserRequests(auth.user.id)
      .then(res => { if (res.success) setRequests(res.data || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [auth?.user?.id]);

  if (!auth?.user) return null;

  const statusColors = {
    matched: 'bg-blue-100 text-blue-800',
    contact_attempted: 'bg-yellow-100 text-yellow-800',
    assistance_promised: 'bg-emerald-100 text-emerald-800',
    resolved_by_user_confirmation: 'bg-green-100 text-green-800',
    unresolved: 'bg-red-100 text-red-800'
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">My Dashboard</h1>
          <p className="text-sm text-slate-500">Welcome, {auth.user.full_name}</p>
        </div>
        <button onClick={() => setActivePage('request-help')}
          className="bg-[#ea580c] text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-[#d44a05]">
          + New Request
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-lg font-bold text-slate-800 mb-4">My Assistance Requests</h2>
        {loading ? (
          <p className="text-sm text-slate-500">Loading your requests...</p>
        ) : requests.length === 0 ? (
          <p className="text-sm text-slate-500">You haven't submitted any requests yet.</p>
        ) : (
          <div className="space-y-3">
            {requests.map(r => (
              <div key={r.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div>
                  <p className="font-semibold text-sm text-slate-800">{r.title}</p>
                  <p className="text-xs text-slate-500">{r.tracking_code} · {r.category?.replace(/_/g, ' ')}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusColors[r.status] || 'bg-slate-100 text-slate-600'}`}>
                  {r.status?.replace(/_/g, ' ')}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main App ───────────────────────────────────────────────────
export default function App() {
  const [activePage, setActivePage] = useState('home');

  // Unified auth state – token and user profile persisted in localStorage
  const [auth, setAuth] = useState(() => {
    try {
      const token = localStorage.getItem('madad_token');
      const userStr = localStorage.getItem('madad_user');
      if (token && userStr) {
        return { token, user: JSON.parse(userStr) };
      }
    } catch (e) {}
    return { token: null, user: null };
  });

  const handleSetAuth = (newAuth) => {
    setAuth(newAuth);
    if (newAuth && newAuth.token && newAuth.user) {
      try {
        localStorage.setItem('madad_token', newAuth.token);
        localStorage.setItem('madad_user', JSON.stringify(newAuth.user));
      } catch (e) {}
    } else {
      try {
        localStorage.removeItem('madad_token');
        localStorage.removeItem('madad_user');
      } catch (e) {}
    }
  };

  // Bridge: Navbar uses user/setUser props
  const user = auth.user;
  const handleSetUser = (newUser) => {
    if (!newUser) {
      handleSetAuth({ token: null, user: null });
    } else {
      handleSetAuth({ token: auth.token || 'session', user: newUser });
    }
  };

  // Navigation & session state
  const [activeRequest, setActiveRequest] = useState(null);
  const [trackingCodeToSearch, setTrackingCodeToSearch] = useState('MD-2026-EDU1');
  const [preselectedCategory, setPreselectedCategory] = useState('all');

  // Triggered when RequestHelp form is successfully submitted
  const handleHelpSubmitted = (newRequestData) => {
    setActiveRequest(newRequestData);
    setTrackingCodeToSearch(newRequestData.tracking_code);
    setActivePage('matching-results');
  };

  const handleNavigateToTrack = (code) => {
    setTrackingCodeToSearch(code);
    setActivePage('track-request');
  };

  const handleCategorySelectFromHome = (category) => {
    setPreselectedCategory(category);
    setActivePage('find-help');
  };

  // Simple route guard – redirect to login if a protected page is requested without auth
  const isProtected = ['dashboard', 'request-help', 'give-help'];
  if (isProtected.includes(activePage) && !auth.user) {
    // Use setTimeout to avoid state update during render
    setTimeout(() => setActivePage('login'), 0);
  }

  return (
    <div className="min-h-screen flex flex-col text-slate-900">
      {/* Global Navigation Bar */}
      <Navbar
        activePage={activePage}
        setActivePage={setActivePage}
        user={user}
        setUser={handleSetUser}
      />

      {/* Main Content Router */}
      <main className="flex-1">
        {activePage === 'home' && (
          <Home setActivePage={setActivePage} onCategorySelect={handleCategorySelectFromHome} />
        )}

        {activePage === 'find-help' && (
          <FindHelp selectedCategory={preselectedCategory} onSelectRequestHelp={() => setActivePage('request-help')} />
        )}

        {activePage === 'request-help' && (
          <RequestHelp onHelpSubmitted={handleHelpSubmitted} setActivePage={setActivePage} auth={auth} />
        )}

        {activePage === 'matching-results' && (
          <MatchingResults requestData={activeRequest} onNavigateToTrack={handleNavigateToTrack} />
        )}

        {activePage === 'give-help' && (
          <GiveHelp user={user} />
        )}

        {activePage === 'track-request' && (
          <TrackRequest initialCode={trackingCodeToSearch} />
        )}

        {activePage === 'about' && <AboutUs />}
        {activePage === 'safety' && <SafetyPrivacy />}

        {activePage === 'login' && (
          <LoginSignup
            user={user}
            setUser={handleSetUser}
            setActivePage={setActivePage}
            setAuth={handleSetAuth}
          />
        )}

        {activePage === 'forgot-password' && (
          <ForgotPassword setActivePage={setActivePage} />
        )}

        {activePage === 'dashboard' && (
          <Dashboard auth={auth} setAuth={handleSetAuth} setActivePage={setActivePage} />
        )}

        {activePage === 'admin' && (
          <AdminDashboard user={user} setActivePage={setActivePage} />
        )}
      </main>

      {/* Global Footer */}
      <Footer setActivePage={setActivePage} />
    </div>
  );
}
