import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Mail, Phone } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import CaptchaQuiz from '../components/CaptchaQuiz';

const Register = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    email: '',
    phone: '',
    department: 'All',
    captcha: false,
  });
  const [captchaToken, setCaptchaToken] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [verificationStep, setVerificationStep] = useState(false);
  const [verificationCodes, setVerificationCodes] = useState({ emailCode: '', phoneCode: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!captchaToken) {
      setError('Please complete the security verification (CAPTCHA quiz)');
      return;
    }

    setLoading(true);
    try {
      const result = await api.auth.register({
        username: formData.username,
        password: formData.password,
        email: formData.email,
        phone: formData.phone || undefined,
        department: formData.department,
        captchaToken: captchaToken,
      });

      // Registration successful - email verification code has been sent
      // User must check their email for the code
      if (result.emailSent || result.user) {
        setVerificationStep(true);
        setVerificationCodes({
          emailCode: '', // Don't display code
          phoneCode: '',
        });
      } else {
        login(result);
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  if (verificationStep) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
        <div className="bg-slate-800 p-8 rounded-xl shadow-2xl w-full max-w-md border border-slate-700">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Check Your Email</h3>
            <p className="text-slate-400 text-sm">
              A verification code has been sent to:
            </p>
            <p className="text-white font-medium mt-1">{formData.email}</p>
          </div>
          
          <div className="mb-6 p-4 bg-blue-900/20 border border-blue-800 rounded-lg">
            <div className="flex items-start space-x-3">
              <Mail className="w-5 h-5 text-blue-400 mt-0.5" />
              <div>
                <p className="text-blue-300 font-medium mb-1">Next Steps:</p>
                <ul className="text-slate-400 text-sm space-y-1 list-disc list-inside">
                  <li>Check your inbox for the verification code</li>
                  <li>Check your spam/junk folder if not in inbox</li>
                  <li>The code expires in 10 minutes</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/50 p-4 rounded-lg mb-6 border border-slate-700">
            <p className="text-slate-400 text-xs text-center">
              After verifying your email, you can login with your username and password. 
              You'll receive another code via email to complete the login process.
            </p>
          </div>

          <Link
            to="/login"
            className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors text-center"
          >
            Continue to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="bg-slate-800 p-8 rounded-xl shadow-2xl w-full max-w-md border border-slate-700">
        <div className="flex justify-center mb-6">
          <div className="p-3 bg-blue-600 rounded-full">
            <Shield className="w-8 h-8 text-white" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-center text-white mb-2">Create Account</h2>
        <p className="text-slate-400 text-center mb-8 text-sm">Register for Secure Archive</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-slate-300 mb-1 text-sm font-medium">Username</label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-slate-300 mb-1 text-sm font-medium">Email <span className="text-red-400">*</span></label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
            <p className="text-xs text-slate-500 mt-1">
              Verification code will be sent to this email
            </p>
          </div>
          <div>
            <label className="block text-slate-300 mb-1 text-sm font-medium">Phone (Optional)</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-slate-300 mb-1 text-sm font-medium">Department</label>
            <select
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="All">All</option>
              <option value="IT">IT</option>
              <option value="HR">HR</option>
              <option value="Finance">Finance</option>
              <option value="Payroll">Payroll</option>
            </select>
          </div>
          <div>
            <label className="block text-slate-300 mb-1 text-sm font-medium">Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
            <p className="text-xs text-slate-500 mt-1">
              Minimum 8 characters, lowercase letters and numbers only
            </p>
          </div>
          <div>
            <label className="block text-slate-300 mb-1 text-sm font-medium">Confirm Password</label>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
          </div>
          <CaptchaQuiz 
            onVerify={(token) => {
              setCaptchaToken(token);
              setFormData({ ...formData, captcha: true });
            }}
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
            {loading ? 'Registering...' : 'Register'}
          </button>
          <div className="text-center">
            <Link to="/login" className="text-sm text-blue-400 hover:text-blue-300">
              Already have an account? Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;

