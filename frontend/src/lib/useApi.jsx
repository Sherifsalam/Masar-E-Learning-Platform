import { useCallback, useEffect, useState } from "react";

/**
 * Runs an async loader and tracks loading/error/data for it.
 * `deps` behaves like a useEffect dependency list; `reload()` re-runs it.
 */
export function useApi(loader, deps = []) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [nonce, setNonce] = useState(0);

  const reload = useCallback(() => setNonce((n) => n + 1), []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    Promise.resolve()
      .then(loader)
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || "Something went wrong");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, nonce]);

  return { data, error, loading, reload, setData };
}

export function Loading({ label = "Loading…" }) {
  return <div className="state-msg">{label}</div>;
}

export function ErrorMsg({ error, onRetry }) {
  if (!error) return null;
  return (
    <div className="state-msg error">
      {error}
      {onRetry && (
        <button className="btn btn-ghost btn-sm" style={{ marginLeft: 10 }} onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  );
}

export function Empty({ label = "Nothing here yet." }) {
  return <div className="state-msg">{label}</div>;
}
