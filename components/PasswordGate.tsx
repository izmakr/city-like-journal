'use client';

import { useState, FormEvent } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export function PasswordGate() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { authenticate } = useAuth();

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    
    const success = authenticate(password);
    
    if (!success) {
      setError('パスワードが正しくありません');
      setPassword('');
    }
    // 成功した場合は何もしない（AuthWrapperが自動的にサイトを表示する）
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: '#0B0E13' }}
    >
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 
            className="text-4xl font-bold mb-3"
            style={{ 
              fontFamily: 'var(--font-cormorant)',
              color: '#E6EAF2',
              letterSpacing: '0.02em'
            }}
          >
            City Like Journal
          </h1>
          <p className="text-sm" style={{ color: '#9CA3AF' }}>
            このサイトは限定公開されています
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label 
              htmlFor="password" 
              className="block text-sm font-medium mb-2"
              style={{ color: '#E6EAF2' }}
            >
              パスワードを入力してください
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border"
              style={{
                backgroundColor: '#1A1F2E',
                borderColor: error ? '#EF4444' : '#374151',
                color: '#E6EAF2',
                outline: 'none'
              }}
              placeholder="パスワード"
              autoFocus
              required
            />
            {error && (
              <p className="mt-2 text-sm" style={{ color: '#EF4444' }}>
                {error}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 rounded-lg font-medium"
            style={{
              backgroundColor: '#60A5FA',
              color: '#FFFFFF'
            }}
          >
            ログイン
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-xs" style={{ color: '#6B7280' }}>
            パスワードをお持ちでない方は、管理者にお問い合わせください
          </p>
        </div>
      </div>
    </div>
  );
}
