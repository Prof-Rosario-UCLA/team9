// GlobalOfflineWrapper.jsx
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
      {isOffline && (
        <div className="fixed inset-0 z-50 bg-base-100/80 backdrop-blur-sm flex flex-col items-center justify-center text-center p-6">
          <span className="loading loading-dots loading-lg text-primary" />
          <p className="mt-4 text-lg text-gray-600">We are trying to fetch the data...</p>
        </div>
      )}
      {children}
    </>
  );
}
