import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

const BASE_URL = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [ok, setOk] = useState(false);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/admin/me`, {
          credentials: "include",
        });
        if (!mounted) return;
        setOk(res.ok);
      } catch {
        if (!mounted) return;
        setOk(false);
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) return null;
  if (!ok) return <Navigate to="/admin/login" replace />;

  return <>{children}</>;
}
