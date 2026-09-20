import React, { useState } from 'react';
import {
  X,
  Mail,
  Lock,
  User as UserIcon,
  Building,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ArrowRight,
  Copy,
  Check,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';
import { GdgLogo } from './GdgLogo.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import {
  signInWithEmail,
  signUpWithEmail,
  signInWithGoogle,
  resetPassword,
} from '../services/authService.ts';

interface AuthModalProps {
  onSuccess?: (message: string) => void;
}

interface AuthErrorInfo {
  type: 'unauthorized-domain' | 'operation-not-allowed' | 'permission-denied' | 'popup-blocked' | 'generic';
  title: string;
  message: string;
  host?: string;
  step?: string;
  link?: string;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onSuccess }) => {
  const { isAuthModalOpen, authModalTab, openAuthModal, closeAuthModal } = useAuth();

  const [tab, setTab] = useState<'signin' | 'signup'>(authModalTab);
  const [isForgotMode, setIsForgotMode] = useState<boolean>(false);

  // Form fields
  const [fullName, setFullName] = useState<string>('');
  const [organization, setOrganization] = useState<string>('FIEM Kolkata');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // State
  const [loading, setLoading] = useState<boolean>(false);
  const [googleLoading, setGoogleLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [errorInfo, setErrorInfo] = useState<AuthErrorInfo | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [copiedDomain, setCopiedDomain] = useState<boolean>(false);

  const currentHost = typeof window !== 'undefined' ? window.location.hostname : '';

  // Synchronize tab if changed from context
  React.useEffect(() => {
    setTab(authModalTab);
    setError(null);
    setErrorInfo(null);
    setInfoMessage(null);
    setIsForgotMode(false);
  }, [authModalTab, isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  const handleClose = () => {
    setError(null);
    setErrorInfo(null);
    setInfoMessage(null);
    closeAuthModal();
  };

  const parseFirebaseError = (err: any): { simpleMsg: string; info: AuthErrorInfo | null } => {
    const code = err?.code || '';
    const rawMsg = err?.message || '';

    if (code === 'auth/unauthorized-domain' || rawMsg.includes('unauthorized-domain')) {
      return {
        simpleMsg: 'This domain is not authorized in Firebase OAuth settings.',
        info: {
          type: 'unauthorized-domain',
          title: 'Domain Authorization Needed in Firebase',
          message: `Google Sign-In blocked this request because "${currentHost}" has not been added to your Firebase project's Authorized Domains list.`,
          host: currentHost,
          step: `Add "${currentHost}" (or "run.app") under Firebase Console > Authentication > Settings > Authorized domains.`,
          link: 'https://console.firebase.google.com/project/sarthak-62d28/authentication/settings',
        },
      };
    }

    if (code === 'auth/operation-not-allowed') {
      return {
        simpleMsg: 'Sign-in method is disabled in Firebase Console.',
        info: {
          type: 'operation-not-allowed',
          title: 'Sign-In Provider Disabled',
          message: 'The selected sign-in provider is disabled in your Firebase console for project "sarthak-62d28".',
          step: 'Enable Email/Password or Google provider in Firebase Console > Authentication > Sign-in method.',
          link: 'https://console.firebase.google.com/project/sarthak-62d28/authentication/providers',
        },
      };
    }

    if (code === 'permission-denied' || rawMsg.includes('Missing or insufficient permissions')) {
      return {
        simpleMsg: 'Account service access temporarily restricted.',
        info: {
          type: 'permission-denied',
          title: 'Authorization Required',
          message: 'Your account permissions are currently restricting access. Please contact event support or try logging in again.',
          step: 'Check your verified account credentials to confirm event access.',
        },
      };
    }

    if (code === 'auth/popup-blocked' || code === 'auth/cancelled-popup-request') {
      return {
        simpleMsg: 'Browser blocked Google sign-in popup.',
        info: {
          type: 'popup-blocked',
          title: 'Browser Popup Blocked',
          message: 'Your browser or iframe environment blocked the Google OAuth window. Please click your browser address bar to allow popups, or use Email & Password sign in below.',
        },
      };
    }

    if (code === 'auth/email-already-in-use') {
      return { simpleMsg: 'An account with this email already exists. Please sign in instead.', info: null };
    }
    if (code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
      return { simpleMsg: 'Incorrect email or password. Please verify your credentials.', info: null };
    }
    if (code === 'auth/user-not-found') {
      return { simpleMsg: 'No account found with this email. Please sign up first.', info: null };
    }
    if (code === 'auth/weak-password') {
      return { simpleMsg: 'Password should be at least 6 characters long.', info: null };
    }
    if (code === 'auth/invalid-email') {
      return { simpleMsg: 'Please enter a valid email address.', info: null };
    }
    if (code === 'auth/popup-closed-by-user') {
      return { simpleMsg: 'Google sign-in was cancelled before completion.', info: null };
    }
    if (code === 'auth/network-request-failed') {
      return { simpleMsg: 'Network issue. Please check your internet connection.', info: null };
    }

    return { simpleMsg: rawMsg || 'Authentication error. Please try again.', info: null };
  };

  const handleCopyDomain = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedDomain(true);
    setTimeout(() => setCopiedDomain(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setErrorInfo(null);
    setInfoMessage(null);

    if (isForgotMode) {
      if (!email.trim()) {
        setError('Please enter your email address to reset password.');
        return;
      }
      setLoading(true);
      try {
        await resetPassword(email.trim());
        setInfoMessage('Password reset email sent! Check your inbox.');
        setLoading(false);
      } catch (err: any) {
        const { simpleMsg, info } = parseFirebaseError(err);
        setError(simpleMsg);
        setErrorInfo(info);
        setLoading(false);
      }
      return;
    }

    if (!email.trim() || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (tab === 'signup' && !fullName.trim()) {
      setError('Please enter your full name.');
      return;
    }

    setLoading(true);
    try {
      if (tab === 'signup') {
        const { user } = await signUpWithEmail(
          email,
          password,
          fullName,
          organization
        );
        onSuccess?.(`Welcome, ${user.displayName || 'Developer'}! Account created successfully.`);
      } else {
        const { user } = await signInWithEmail(email, password);
        onSuccess?.(`Welcome back, ${user.displayName || user.email}! Signed in successfully.`);
      }
      closeAuthModal();
    } catch (err: any) {
      const { simpleMsg, info } = parseFirebaseError(err);
      setError(simpleMsg);
      setErrorInfo(info);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setErrorInfo(null);
    setInfoMessage(null);
    setGoogleLoading(true);
    try {
      const { user } = await signInWithGoogle();
      onSuccess?.(`Signed in successfully as ${user.displayName || user.email}!`);
      closeAuthModal();
    } catch (err: any) {
      const { simpleMsg, info } = parseFirebaseError(err);
      setError(simpleMsg);
      setErrorInfo(info);
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-gray-900/60 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-200/80 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Google Colors Accent Bar */}
        <div className="h-1.5 w-full grid grid-cols-4">
          <span className="bg-[#4285F4]"></span>
          <span className="bg-[#EA4335]"></span>
          <span className="bg-[#FBBC05]"></span>
          <span className="bg-[#34A853]"></span>
        </div>

        {/* Modal Header */}
        <div className="p-6 pb-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <GdgLogo className="h-6 w-auto" />
            <div>
              <h3 id="auth-modal-title" className="text-lg font-bold text-gray-900 leading-tight">
                {isForgotMode
                  ? 'Reset Password'
                  : tab === 'signup'
                  ? 'Create Your Account'
                  : 'Sign In to Build With AI'}
              </h3>
              <p className="text-xs text-gray-500">
                Google Developer Groups on Campus FIEM
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher (unless in forgot password mode) */}
        {!isForgotMode && (
          <div className="px-6 pt-4">
            <div className="grid grid-cols-2 p-1 bg-gray-100 rounded-xl">
              <button
                type="button"
                onClick={() => {
                  setTab('signin');
                  setError(null);
                  setErrorInfo(null);
                }}
                className={`py-2 text-sm font-semibold rounded-lg transition-all cursor-pointer ${
                  tab === 'signin'
                    ? 'bg-white text-gray-900 shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setTab('signup');
                  setError(null);
                  setErrorInfo(null);
                }}
                className={`py-2 text-sm font-semibold rounded-lg transition-all cursor-pointer ${
                  tab === 'signup'
                    ? 'bg-white text-gray-900 shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Create Account
              </button>
            </div>
          </div>
        )}

        {/* Body Content */}
        <div className="p-6 pt-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Quick Google Sign In */}
          {!isForgotMode && (
            <>
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={googleLoading || loading}
                className="w-full flex items-center justify-center gap-3 px-4 py-2.5 bg-white hover:bg-gray-50 text-gray-700 text-sm font-medium border border-gray-300 rounded-xl transition-all shadow-2xs hover:shadow-xs active:scale-[0.99] disabled:opacity-60 cursor-pointer"
              >
                {googleLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                ) : (
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17Z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24Z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.97 0 12s.45 3.82 1.25 5.42l4.03-3.15Z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98Z"
                    />
                  </svg>
                )}
                <span>
                  {tab === 'signup' ? 'Sign up with Google' : 'Continue with Google'}
                </span>
              </button>

              <div className="relative flex items-center justify-center">
                <div className="border-t border-gray-200 w-full"></div>
                <span className="bg-white px-3 text-xs text-gray-400 uppercase font-medium tracking-wider">
                  Or with email
                </span>
                <div className="border-t border-gray-200 w-full"></div>
              </div>
            </>
          )}

          {/* Actionable Firebase Authorization Diagnosis Card */}
          {errorInfo && (
            <div className="p-4 rounded-xl bg-amber-50/90 border border-amber-200 text-xs text-amber-900 space-y-2.5 animate-in fade-in">
              <div className="flex items-center gap-2 font-bold text-amber-800 text-sm">
                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{errorInfo.title}</span>
              </div>
              <p className="leading-relaxed text-amber-800">{errorInfo.message}</p>

              {/* Authorized Domain Copy Helper */}
              {errorInfo.type === 'unauthorized-domain' && currentHost && (
                <div className="mt-2 pt-2 border-t border-amber-200/80 space-y-2">
                  <div className="font-semibold text-amber-900">How to fix in Firebase Console:</div>
                  <div className="flex items-center gap-2 bg-white/90 p-2 rounded-lg border border-amber-200 font-mono text-[11px] text-gray-800 break-all">
                    <span className="flex-1 select-all">{currentHost}</span>
                    <button
                      type="button"
                      onClick={() => handleCopyDomain(currentHost)}
                      className="px-2 py-1 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded font-sans text-xs flex items-center gap-1 shrink-0 cursor-pointer"
                    >
                      {copiedDomain ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedDomain ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <ol className="list-decimal list-inside space-y-1 text-amber-800 pl-1 leading-normal">
                    <li>Open your Firebase Console (Project: <strong>sarthak-62d28</strong>)</li>
                    <li>Go to <strong>Authentication &gt; Settings &gt; Authorized domains</strong></li>
                    <li>Click <strong>Add domain</strong> and paste the domain above (or <strong>run.app</strong>)</li>
                  </ol>
                  {errorInfo.link && (
                    <a
                      href={errorInfo.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-blue-700 hover:text-blue-800 font-semibold underline mt-1"
                    >
                      <span>Open Firebase Auth Settings</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  <p className="text-[11px] text-amber-700 italic pt-1">
                    Tip: You can also use <strong>Email & Password</strong> sign-in or account creation below right now without waiting for domain authorization.
                  </p>
                </div>
              )}

              {/* Provider disabled Helper */}
              {errorInfo.type === 'operation-not-allowed' && errorInfo.link && (
                <div className="pt-2 border-t border-amber-200/80">
                  <p className="mb-2 font-medium">{errorInfo.step}</p>
                  <a
                    href={errorInfo.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-blue-700 hover:text-blue-800 font-semibold underline"
                  >
                    <span>Open Firebase Sign-in Providers</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Simple error banner (for common validation errors) */}
          {error && !errorInfo && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs leading-relaxed animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {infoMessage && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-xs leading-relaxed animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-green-500" />
              <span>{infoMessage}</span>
            </div>
          )}

          {/* Email / Password Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Full Name for Signup */}
            {!isForgotMode && tab === 'signup' && (
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sarthak Ghosh"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2 text-sm bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-gray-900"
                  />
                </div>
              </div>
            )}

            {/* Organization for Signup */}
            {!isForgotMode && tab === 'signup' && (
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  College / Organization
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="e.g. FIEM Kolkata"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2 text-sm bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-gray-900"
                  />
                </div>
              </div>
            )}

            {/* Email Address */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  required
                  placeholder="developer@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2 text-sm bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-gray-900"
                />
              </div>
            </div>

            {/* Password */}
            {!isForgotMode && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-gray-700">
                    Password <span className="text-red-500">*</span>
                  </label>
                  {tab === 'signin' && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsForgotMode(true);
                        setError(null);
                        setErrorInfo(null);
                        setInfoMessage(null);
                      }}
                      className="text-xs text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                    >
                      Forgot?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder={tab === 'signup' ? 'Min 6 characters' : 'Enter password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2 text-sm bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-gray-900"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* Action Button */}
            <button
              type="submit"
              disabled={loading || googleLoading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium text-sm rounded-xl transition-all shadow-xs hover:shadow-md disabled:opacity-60 mt-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>
                    {isForgotMode
                      ? 'Sending Email...'
                      : tab === 'signup'
                      ? 'Creating Account...'
                      : 'Verifying...'}
                  </span>
                </>
              ) : (
                <>
                  <span>
                    {isForgotMode
                      ? 'Send Reset Link'
                      : tab === 'signup'
                      ? 'Create Account & Sync'
                      : 'Sign In'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Back to sign in if in forgot mode */}
            {isForgotMode && (
              <button
                type="button"
                onClick={() => {
                  setIsForgotMode(false);
                  setError(null);
                  setErrorInfo(null);
                  setInfoMessage(null);
                }}
                className="w-full text-center text-xs text-gray-600 hover:text-blue-600 font-medium pt-1 cursor-pointer"
              >
                ← Back to Sign In
              </button>
            )}
          </form>

          {/* Footer note */}
          <div className="pt-2 border-t border-gray-100 text-center text-[11px] text-gray-400 flex items-center justify-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>Official Event Registration &amp; Account Portal</span>
          </div>
        </div>
      </div>
    </div>
  );
};
