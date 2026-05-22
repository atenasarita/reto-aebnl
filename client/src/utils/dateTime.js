// Helper utilities for consistent date/time values across the app
export function nowISOString() {
  return new Date().toISOString();
}

export function todayDate() {
  return nowISOString().split('T')[0];
}

export default {
  nowISOString,
  todayDate,
};
