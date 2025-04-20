import { useEffect, useState } from 'react';

function getInitialOnline() {
  const now = new Date();
  const utc2Hour = (now.getUTCHours() + 2) % 24;

  let min = 5000;
  let max = 10000;

  if (utc2Hour >= 12 && utc2Hour < 20) {
    min = 10000;
    max = 15000;
  } else if (utc2Hour >= 20 && utc2Hour <= 23) {
    min = 15000;
    max = 30000;
  }

  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export const useFakeOnline = () => {
  const [online, setOnline] = useState(() => {
    const stored = localStorage.getItem('onlineCount');
    const parsed = stored ? parseInt(stored, 10) : getInitialOnline();
    localStorage.setItem('onlineCount', parsed);
    return parsed;
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setOnline((prev) => {
        const change = Math.floor(Math.random() * 100) - 50; // ±50
        let updated = prev + change;

        if (updated < 0) updated = 0;

        localStorage.setItem('onlineCount', updated); // обновляем локально
        return updated;
      });
    }, 10000); // каждые 10 сек

    return () => clearInterval(interval);
  }, []);

  return online.toLocaleString('pl-PL');
};
