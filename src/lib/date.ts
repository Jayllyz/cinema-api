const CLOSED_DAYS = {
  Saturday: 6,
  Sunday: 0,
};

const OPEN_HOUR = 9;
const CLOSE_HOUR = 20;

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
  if (date.getUTCHours() > hour) return true;
  return false;
}
