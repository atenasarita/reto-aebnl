export function startOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function addMonthsKeepingCalendar(date: Date, months: number): Date {
  const result = new Date(date);
  const day = result.getDate();

  result.setMonth(result.getMonth() + months);

  // Si el mes destino no tiene ese dia, JS mueve al siguiente mes; 
  if (result.getDate() < day) {
    result.setDate(0);
  }

  return result;
}
