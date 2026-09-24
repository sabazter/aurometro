export const getWeekStart = (date: Date = new Date()): Date => {
  const d = new Date(date);
  const day = d.getDay(); // 0 is Sunday, 1 is Monday
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
  const monday = new Date(d.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
};

export const getElapsedWeekdays = (date: Date = new Date()): number => {
  const day = date.getDay();
  // 0: Sunday (5 days elapsed from Mon-Fri)
  // 1: Monday (1 day elapsed)
  // 2: Tuesday (2 days elapsed)
  // ...
  // 6: Saturday (5 days elapsed)
  if (day === 0 || day === 6) {
    return 5;
  }
  return day;
};
