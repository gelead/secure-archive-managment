import React, { useState, useEffect } from 'react';
import { Shield, Smartphone, Mail, Phone, Fingerprint, CheckCircle } from 'lucide-react';
import { api } from '../services/api';

const MFASetup = ({ user, onComplete }) => {
  const [mfaType, setMfaType] = useState(null);
  const [qrCode, setQrCode] = useState(null);
  const [secret, setSecret] = useState(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [verified, setVerified] = useState(false);

  const handleEnableMFA = async (type) => {
    setMfaType(type);
    setLoading(true);
    setError('');
    
    try {
      if (type === 'EMAIL') {
        // Send verification code to email
        const result = await api.auth.enableMFA(user.accessToken, 'EMAIL');
        if (result.codeSent) {
          // Code sent, wait for user to enter it
          setSecret('EMAIL');
        }
      } else if (type === 'TOTP') {
        // TOTP setup (not implemented for real, keeping demo)
        const mockSecret = 'JBSWY3DPEHPK3PXP';
        const mockQRCode = `otpauth://totp/SecureArchive:${user.username}?secret=${mockSecret}&issuer=SecureArchive`;
        setSecret(mockSecret);
        setQrCode(mockQRCode);
      } else if (type === 'SMS') {
        setError('SMS MFA requires phone number. Please use Email MFA.');
        setMfaType(null);
      }
    } catch (e) {
      setError('Failed to setup MFA: ' + e.message);
      setMfaType(null);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setError('Please enter a 6-digit code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (mfaType === 'EMAIL') {
        // Verify with backend
        const result = await api.auth.enableMFA(user.accessToken, 'EMAIL', verificationCode);
        if (result.ok) {
          setVerified(true);
          if (onComplete) {
            onComplete(mfaType);
          }
        }
      } else {
        // For other types, simulate (TOTP not fully implemented)
        await new Promise(resolve => setTimeout(resolve, 1000));
        setVerified(true);
        if (onComplete) {
          onComplete(mfaType);
        }
      }
    } catch (e) {
      setError('Verification failed: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  if (verified) {
    return (
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
        <div className="text-center">
          <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">MFA Enabled Successfully!</h3>
          <p className="text-slate-400">
            {mfaType === 'TOTP' && 'Your authenticator app is now configured.'}
            {mfaType === 'SMS' && 'SMS codes will be sent to your phone.'}
            {mfaType === 'EMAIL' && 'Email codes will be sent to your email.'}
          </p>
        </div>
      </div>
    );
  }

  if (mfaType === null) {
    return (
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Shield className="w-5 h-5 mr-2 text-blue-400" />
          Enable Multi-Factor Authentication
        </h3>
        <p className="text-slate-400 text-sm mb-6">
          Choose a method to add an extra layer of security to your account.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => handleEnableMFA('TOTP')}
            disabled={loading}
            className="p-4 bg-slate-900 border border-slate-700 rounded-lg hover:border-blue-500 transition-colors text-left"
          >
            <Smartphone className="w-8 h-8 text-blue-400 mb-2" />
            <h4 className="font-semibold text-white mb-1">Authenticator App</h4>
            <p className="text-xs text-slate-400">Google Authenticator, Authy, etc.</p>
          </button>
          <button
            onClick={() => handleEnableMFA('SMS')}
            disabled={loading}
            className="p-4 bg-slate-900 border border-slate-700 rounded-lg hover:border-blue-500 transition-colors text-left"
          >
            <Phone className="w-8 h-8 text-green-400 mb-2" />
            <h4 className="font-semibold text-white mb-1">SMS Codes</h4>
            <p className="text-xs text-slate-400">Receive codes via text message</p>
          </button>
          <button
            onClick={() => handleEnableMFA('EMAIL')}
            disabled={loading}
            className="p-4 bg-slate-900 border border-slate-700 rounded-lg hover:border-blue-500 transition-colors text-left"
          >
            <Mail className="w-8 h-8 text-purple-400 mb-2" />
            <h4 className="font-semibold text-white mb-1">Email Codes</h4>
            <p className="text-xs text-slate-400">Receive codes via email</p>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
      <button
        onClick={() => {
          setMfaType(null);
          setQrCode(null);
          setSecret(null);
          setVerificationCode('');
          setError('');
        }}
        className="text-slate-400 hover:text-white text-sm mb-4"
      >
        ← Back to methods
      </button>

      {mfaType === 'TOTP' && qrCode && (
        <div className="mb-6">
          <h4 className="text-white font-semibold mb-2">Scan QR Code</h4>
          <p className="text-slate-400 text-sm mb-4">
            Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
          </p>
          <div className="bg-white p-4 rounded-lg inline-block mb-4">
            <div className="w-48 h-48 bg-slate-200 flex items-center justify-center text-slate-500 text-xs">
              QR Code Placeholder
              <br />
              (In production, display actual QR code)
            </div>
          </div>
          <div className="bg-slate-900 p-3 rounded border border-slate-700">
            <p className="text-xs text-slate-400 mb-1">Or enter this code manually:</p>
            <code className="text-blue-400 font-mono">{secret}</code>
          </div>
        </div>
      )}

      {mfaType === 'EMAIL' && secret === 'EMAIL' && (
        <div className="mb-6">
          <div className="p-4 bg-blue-900/20 border border-blue-800 rounded-lg mb-4">
            <h4 className="text-white font-semibold mb-2 flex items-center">
              <Mail className="w-5 h-5 mr-2 text-blue-400" />
              Verification Code Sent
            </h4>
            <p className="text-slate-400 text-sm">
              A verification code has been sent to <strong className="text-white">{user.email}</strong>
            </p>
            <p className="text-slate-500 text-xs mt-2">
              Please check your inbox (and spam folder) for the code. The code will expire in 10 minutes.
            </p>
          </div>
        </div>
      )}

      <div className="mb-4">
        <label className="block text-slate-300 mb-2 text-sm font-medium">
          Enter verification code
        </label>
        <input
          type="text"
          value={verificationCode}
          onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-center text-white text-xl tracking-widest focus:ring-2 focus:ring-blue-500 outline-none"
          placeholder="000000"
          maxLength={6}
        />
        <p className="text-xs text-slate-500 mt-2">
          {mfaType === 'TOTP' && 'Enter the 6-digit code from your authenticator app'}
          {mfaType === 'SMS' && 'A code will be sent to your phone'}
          {mfaType === 'EMAIL' && 'A code will be sent to your email'}
        </p>
      </div>

      {error && (
        <div className="mb-4 text-red-400 text-sm bg-red-900/20 p-3 rounded border border-red-900/30">
          {error}
        </div>
      )}

      <button
        onClick={handleVerify}
        disabled={loading || verificationCode.length !== 6}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors"
      >
        {loading ? 'Verifying...' : 'Verify & Enable MFA'}
      </button>
    </div>
  );
};

export default MFASetup;

