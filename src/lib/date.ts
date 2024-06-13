const CLOSED_DAYS = {
  Saturday: 6,
  Sunday: 0,
};

export function validateDay(date: Date): boolean {
  const day = date.getDay();

  if (day === CLOSED_DAYS.Saturday || day === CLOSED_DAYS.Sunday) {
    return false;
  }

  return true;
}

export function isBeforeHour(date: Date, hour: number): boolean {
  if (date.getUTCHours() < hour) return true;
  return false;
}

export function isAfterHour(date: Date, hour: number): boolean {
  if (date.getUTCHours() > hour) {
    return true;
  }

  if (date.getUTCHours() === hour && date.getUTCMinutes() >= 1) {
    return true;
  }

  return false;
}

export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getUTCFullYear() === date2.getUTCFullYear() &&
    date1.getUTCMonth() === date2.getUTCMonth() &&
    date1.getUTCDate() === date2.getUTCDate()
  );
}
