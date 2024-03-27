const CLOSED_DAYS = {
  Saturday: 6,
  Sunday: 0,
};

export function validateDay(date: Date) {
  const day = date.getDay();

  if (day == CLOSED_DAYS.Saturday || day == CLOSED_DAYS.Sunday) {
    return false;
  }

  return true;
}

export function isBeforeHour(date: Date, hour: number) {
  if (date.getUTCHours() < hour) return true;
  return false;
}

export function isAfterHour(date: Date, hour: number) {
  if (date.getUTCHours() > hour) {
    return true;
  }

  if (date.getUTCHours() === hour && date.getUTCMinutes() >= 1) {
    return true;
  }

  return false;
}