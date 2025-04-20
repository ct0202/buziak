// Просто функция генерации начального онлайна по времени
export function getInitialOnline() {
  const now = new Date();
  const utc2Hour = (now.getUTCHours() + 2) % 24;

  let min = 5000;
  let max = 10000;

  if (utc2Hour >= 12 && utc2Hour < 20) {
    min = 10000;
    max = 15000;
  } else if (utc2Hour >= 20 || utc2Hour < 0) {
    min = 15000;
    max = 30000;
  }

  return Math.floor(Math.random() * (max - min + 1)) + min;
}
