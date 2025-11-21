'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const setAdmin = useAuthStore((state) => state.setAdmin);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data } = await api.post('/admin/login', { email, password });
      setAdmin(data.admin, data.token);

      if (data.admin.role === 'super-admin') {
        router.push('/super-admin');
      } else {
        router.push('/university-admin');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background:
          'linear-gradient(135deg, #00B4D8 0%, #0090BB 40%, #FF7A00 100%)',
        padding: '20px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Blurred Animated Bubbles */}
      <div
        style={{
          position: 'absolute',
          top: '-150px',
          right: '-150px',
          width: '300px',
          height: '300px',
          background: 'rgba(255,255,255,0.12)',
          borderRadius: '50%',
          filter: 'blur(80px)',
          animation: 'pulse 4s infinite ease-in-out',
        }}
      ></div>

      <div
        style={{
          position: 'absolute',
          bottom: '-150px',
          left: '-150px',
          width: '300px',
          height: '300px',
          background: 'rgba(255,255,255,0.12)',
          borderRadius: '50%',
          filter: 'blur(80px)',
          animation: 'pulse 4s infinite ease-in-out',
        }}
      ></div>

      {/* Main Card */}
      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          zIndex: 10,
          animation: 'fadeIn 0.6s ease-out',
        }}
      >
        {/* LOGO */}
        <div style={{ textAlign: 'center', marginBottom: '35px' }}>
          <img
            src="/unimigo_letter_logo.png"
            alt="UNIMIGO"
            style={{
              width: '200px',
              height: 'auto',
              filter: 'drop-shadow(0px 4px 8px rgba(0,0,0,0.25))',
            }}
          />
          <p
            style={{
              color: 'rgba(255,255,255,0.9)',
              fontSize: '17px',
              fontWeight: '500',
              // marginTop: '1px',
            }}
          >
            Your Campus, Your Circle
          </p>
        </div>

        {/* Card */}
        <div
          style={{
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(12px)',
            padding: '32px',
            borderRadius: '22px',
            boxShadow: '0 8px 25px rgba(0,0,0,0.18)',
            border: '1px solid rgba(255,255,255,0.3)',
          }}
        >
          <h2
            style={{
              fontSize: '28px',
              fontWeight: '700',
              background: 'linear-gradient(to right, #00B4D8, #FF7A00)',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
              marginBottom: '12px',
            }}
          >
            Admin Login
          </h2>

          <p
            style={{
              color: '#555',
              fontSize: '15px',
              marginBottom: '25px',
              fontWeight: '500',
            }}
          >
            Access your administrative dashboard
          </p>

          <form onSubmit={handleLogin} style={{ display: 'grid', gap: '18px' }}>
            {/* Email */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#222',
                  marginBottom: '6px',
                }}
              >
                Email Address
              </label>
              <input
                type="email"
                placeholder="admin@unimigo.co"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  border: '2px solid rgba(0,180,216,0.35)',
                  fontSize: '15px',
                  fontWeight: '500',
                }}
                required
              />
            </div>

            {/* Password */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#222',
                  marginBottom: '6px',
                }}
              >
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  border: '2px solid rgba(0,180,216,0.35)',
                  fontSize: '15px',
                  fontWeight: '500',
                }}
                required
              />
            </div>

            {/* Error */}
            {error && (
              <p
                style={{
                  background: '#ffe5e5',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  color: '#d60000',
                  fontSize: '14px',
                  borderLeft: '4px solid red',
                  fontWeight: '600',
                }}
              >
                {error}
              </p>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '12px',
                background:
                  'linear-gradient(to right, #00B4D8, #FF7A00)',
                color: 'white',
                fontSize: '18px',
                fontWeight: '700',
                cursor: 'pointer',
                transform: loading ? 'scale(0.97)' : 'scale(1)',
                opacity: loading ? 0.7 : 1,
                transition: '0.2s ease',
              }}
            >
              {loading ? 'Logging in...' : 'Login to Dashboard'}
            </button>
          </form>

          <p
            style={{
              marginTop: '20px',
              textAlign: 'center',
              fontSize: '13px',
              color: '#666',
              fontWeight: '500',
            }}
          >
            🔒 Secure admin access • Protected by UNIMIGO
          </p>
        </div>

        <p
          style={{
            textAlign: 'center',
            marginTop: '18px',
            fontSize: '13px',
            color: 'rgba(255,255,255,0.8)',
          }}
        >
          Admin Panel v1.0.0
        </p>
      </div>
    </div>
  );
}
