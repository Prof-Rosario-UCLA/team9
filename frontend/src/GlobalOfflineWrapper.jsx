import { useEffect, useState } from 'react';

export default function GlobalOfflineWrapper({ children }) {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const checkConnection = () => {
      fetch("http://localhost:8080/ping")
        .then((res) => {
          if (!res.ok) throw new Error("Backend not OK");
          setIsOffline(false);
        })
        .catch(() => setIsOffline(true));
    };

    checkConnection();
    window.addEventListener("online", checkConnection);
    window.addEventListener("offline", () => setIsOffline(true));

    return () => {
      window.removeEventListener("online", checkConnection);
      window.removeEventListener("offline", () => setIsOffline(true));
    };
  }, []);

  return (
    <>
      <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 px-3 py-1 rounded-full shadow bg-base-100 border">
        <span className={`font-bold ${isOffline ? 'text-red-500' : 'text-green-500'}`}>
          {isOffline ? 'Offline' : 'Online'}
        </span>
        <div className={`w-3 h-3 rounded-full ${isOffline ? 'bg-red-500' : 'bg-green-400'}`} />
      </div>
      {children}
    </>
  );
}
