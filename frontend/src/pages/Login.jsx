import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Smartphone } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import CaptchaQuiz from '../components/CaptchaQuiz';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [step, setStep] = useState('CREDENTIALS');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [captchaToken, setCaptchaToken] = useState(null);
  const [mfaCode, setMfaCode] = useState('');
  const [tempUser, setTempUser] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCredentials = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!captchaToken) {
      setError('Please complete the security verification (CAPTCHA quiz).');
      return;
    }

    setLoading(true);
    try {
      const result = await api.auth.login(username, password);
      
      // MFA is now mandatory - always required
      if (result.mfaRequired) {
        setTempUser({ username, ...result });
        setStep('MFA');
        setError(''); // Clear any previous errors
      } else {
        // This should not happen - MFA is mandatory
        setError('Authentication error. Please try again.');
      }
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleMFA = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const result = await api.auth.verifyOtp(tempUser.username, mfaCode);
      if (result.user && result.accessToken) {
        login(result);
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Invalid OTP code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="bg-slate-800 p-8 rounded-xl shadow-2xl w-full max-w-md border border-slate-700">
        <div className="flex justify-center mb-6">
          <div className="p-3 bg-blue-600 rounded-full">
            <Shield className="w-8 h-8 text-white" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-center text-white mb-2">Secure Archive</h2>
        <p className="text-slate-400 text-center mb-8 text-sm">Enterprise Archive Management System</p>

        {step === 'CREDENTIALS' ? (
          <form onSubmit={handleCredentials} className="space-y-4">
            <div>
              <label className="block text-slate-300 mb-1 text-sm font-medium">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none transition"
                placeholder="Enter your username"
                required
              />
            </div>
            <div>
              <label className="block text-slate-300 mb-1 text-sm font-medium">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none transition"
                placeholder="Enter your password"
                required
              />
            </div>
            <CaptchaQuiz 
              onVerify={(token) => setCaptchaToken(token)}
              verified={!!captchaToken}
            />
            {error && (
              <div className="text-red-400 text-sm bg-red-900/20 p-3 rounded border border-red-900/30">
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
            <div className="text-center">
              <Link to="/register" className="text-sm text-blue-400 hover:text-blue-300">
                Don't have an account? Register
              </Link>
            </div>
          </form>
        ) : (
          <form onSubmit={handleMFA} className="space-y-6">
            <div className="text-center">
              <Smartphone className="w-12 h-12 text-blue-400 mx-auto mb-4" />
              <h3 className="text-white text-lg font-medium">Multi-Factor Authentication</h3>
              <p className="text-slate-400 text-sm mt-2">Enter the 6-digit code sent to your email</p>
              <p className="text-slate-500 text-xs mt-1">Check your inbox for the verification code</p>
            </div>
            <input
              type="text"
              value={mfaCode}
              onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-center text-white text-2xl tracking-widest focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="000000"
              maxLength={6}
              required
            />
            {error && (
              <div className="text-red-400 text-sm text-center bg-red-900/20 p-2 rounded">
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={loading || mfaCode.length !== 6}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors"
            >
              {loading ? 'Verifying...' : 'Verify Code'}
            </button>
            <button
              type="button"
              onClick={() => {
                setStep('CREDENTIALS');
                setMfaCode('');
                setError('');
              }}
              className="w-full text-slate-400 hover:text-white text-sm"
            >
              Back to login
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;
