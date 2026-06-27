import { useState, useEffect } from 'react';

interface Props {
  onLogin: () => void;
}

export default function Login({ onLogin }: Props) {
  const [id, setId]           = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  // URLパラメータによる自動ログイン
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlId  = params.get('id');
    const urlPw  = params.get('pw');
    if (urlId && urlPw) {
      attempt(urlId, urlPw);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const attempt = async (tryId: string, tryPw: string) => {
    setLoading(true);
    setError('');
    try {
      const res  = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: tryId, password: tryPw }),
      });
      const data = await res.json() as { ok?: boolean; error?: string };
      if (data.ok) {
        // URLパラメータをアドレスバーから消す
        window.history.replaceState({}, '', window.location.pathname);
        sessionStorage.setItem('auth', '1');
        onLogin();
      } else {
        setError(data.error ?? 'ログインに失敗しました');
      }
    } catch {
      setError('通信エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    attempt(id, password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-violet-50 px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-indigo-100 rounded-2xl mb-4">
            <span className="text-2xl">🧭</span>
          </div>
          <h1 className="text-xl font-extrabold text-gray-900">職業興味×価値観</h1>
          <p className="text-sm text-gray-500 mt-1">ワークショップ</p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center gap-3 py-6">
            <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
            <p className="text-sm text-gray-500">認証中...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">ID</label>
              <input
                type="text"
                value={id}
                onChange={e => setId(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                placeholder="IDを入力"
                autoComplete="username"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">パスワード</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                placeholder="パスワードを入力"
                autoComplete="current-password"
              />
            </div>

            {error && (
              <p className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-2">{error}</p>
            )}

            <button
              type="submit"
              disabled={!id || !password}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-bold py-3 rounded-xl transition-colors"
            >
              ログイン
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
