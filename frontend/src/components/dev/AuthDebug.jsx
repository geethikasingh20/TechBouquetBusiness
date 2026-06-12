export function logAuthTrace(path, authorization) {
  if (!import.meta.env.DEV || !authorization) return;

  const tokenTail = authorization.replace(/^Bearer\s+/i, "").slice(-8);
  console.info(`[techbouquet] ${path} -> auth token ...${tokenTail}`);
}

export function AuthDebugBadge({ token }) {
  if (!import.meta.env.DEV) return null;

  return (
    <span
      className={`auth-debug-pill ${token ? "has-token" : "no-token"}`}
      title={token || "No auth token"}
    >
      {token ? `Auth token ...${token.slice(-8)}` : "No auth token"}
    </span>
  );
}
