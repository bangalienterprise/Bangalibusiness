import { 
  startOfDay, 
  endOfDay, 
  subDays, 
  startOfMonth, 
  endOfMonth, 
  format,
  subMonths
} from 'date-fns';

export const DATE_PRESETS = {
  TODAY: 'today',
  LAST_7_DAYS: 'last_7_days',
  THIS_MONTH: 'this_month',
  LAST_30_DAYS: 'last_30_days',
  LAST_MONTH: 'last_month',
  CUSTOM: 'custom'
};

export const getDateRangeFromPreset = (preset) => {
  const now = new Date();
  
  switch (preset) {
    case DATE_PRESETS.TODAY:
      return { from: startOfDay(now), to: endOfDay(now) };
    case DATE_PRESETS.LAST_7_DAYS:
      return { from: startOfDay(subDays(now, 6)), to: endOfDay(now) };
    case DATE_PRESETS.THIS_MONTH:
      return { from: startOfMonth(now), to: endOfDay(now) };
    case DATE_PRESETS.LAST_30_DAYS:
      return { from: startOfDay(subDays(now, 29)), to: endOfDay(now) };
    case DATE_PRESETS.LAST_MONTH:
       const lastMonth = subMonths(now, 1);
       return { from: startOfMonth(lastMonth), to: endOfMonth(lastMonth) };
    default:
      return { from: startOfDay(now), to: endOfDay(now) };
  }
};

export const formatDateRange = (from, to) => {
  if (!from) return '';
  if (!to || from === to) return format(from, 'MMM d, yyyy');
  return `${format(from, 'MMM d, yyyy')} - ${format(to, 'MMM d, yyyy')}`;
};