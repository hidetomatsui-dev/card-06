function getSessionId(): string {
  let id = sessionStorage.getItem('session_id');
  if (!id) {
    id = Math.random().toString(36).slice(2) + Date.now().toString(36);
    sessionStorage.setItem('session_id', id);
  }
  return id;
}

export function trackEvent(event: string): void {
  const key = `tracked_${event}`;
  if (sessionStorage.getItem(key)) return; // 1セッション1回のみ
  sessionStorage.setItem(key, '1');

  const sessionId = getSessionId();
  fetch('/api/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ event, sessionId }),
  }).catch(() => {}); // エラーは無視
}
