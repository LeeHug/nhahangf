/**
 * Date & Time Utilities for Restaurant Booking Flow
 * Restaurant operational timezone: Asia/Ho_Chi_Minh (UTC+7)
 */

export const VIETNAM_TIMEZONE = 'Asia/Ho_Chi_Minh';

export const LUNCH_TIME_SLOTS = ['11:00', '11:30', '12:00', '12:30', '13:00', '13:30'];
export const DINNER_TIME_SLOTS = ['17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00'];
export const ALL_BOOKING_SLOTS = [...LUNCH_TIME_SLOTS, ...DINNER_TIME_SLOTS];

/**
 * Gets the current date and time components in Vietnam timezone (Asia/Ho_Chi_Minh).
 */
export function getVietnamNow(date: Date = new Date()): {
  year: number;
  month: number;
  day: number;
  dateStr: string; // YYYY-MM-DD
  hour: number;
  minute: number;
  totalMinutes: number; // minutes from 00:00
} {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: VIETNAM_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  });

  const parts = formatter.formatToParts(date);
  const partMap: Record<string, string> = {};
  for (const part of parts) {
    partMap[part.type] = part.value;
  }

  const year = parseInt(partMap.year || '2026', 10);
  const month = parseInt(partMap.month || '1', 10);
  const day = parseInt(partMap.day || '1', 10);
  const hour = parseInt(partMap.hour || '0', 10);
  const minute = parseInt(partMap.minute || '0', 10);
  const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  const totalMinutes = hour * 60 + minute;

  return { year, month, day, dateStr, hour, minute, totalMinutes };
}

/**
 * Returns date in YYYY-MM-DD format based on Vietnam timezone
 */
export function getLocalDateString(d: Date = new Date()): string {
  return getVietnamNow(d).dateStr;
}

/**
 * Returns tomorrow date string in YYYY-MM-DD based on Vietnam timezone
 */
export function getVietnamTomorrowDateStr(): string {
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
  return getVietnamNow(tomorrow).dateStr;
}

/**
 * Checks if a specific time slot on a given date has already passed based on Vietnam timezone.
 * @param timeSlot e.g. "11:00", "18:30"
 * @param dateStr e.g. "2026-09-28"
 * @param bufferMinutes minimum preparation buffer (default 10 minutes)
 */
export function isTimeSlotInPast(
  timeSlot: string,
  dateStr: string,
  bufferMinutes: number = 10
): boolean {
  if (!timeSlot || !dateStr) return false;

  const vnNow = getVietnamNow();
  const todayVnStr = vnNow.dateStr;

  // Local browser time
  const localNow = new Date();
  const localYear = localNow.getFullYear();
  const localMonth = String(localNow.getMonth() + 1).padStart(2, '0');
  const localDay = String(localNow.getDate()).padStart(2, '0');
  const localDateStr = `${localYear}-${localMonth}-${localDay}`;
  const localMinutes = localNow.getHours() * 60 + localNow.getMinutes();

  // If date is before today in either Vietnam or local client timezone
  if (dateStr < todayVnStr || dateStr < localDateStr) return true;

  // If date is in the future for both
  if (dateStr > todayVnStr && dateStr > localDateStr) return false;

  const [h, m] = timeSlot.split(':').map(Number);
  if (isNaN(h) || isNaN(m)) return false;
  const slotMinutes = h * 60 + m;

  // Check against Vietnam operational time
  if (dateStr === todayVnStr && slotMinutes <= (vnNow.totalMinutes + bufferMinutes)) {
    return true;
  }

  // Check against local browser time
  if (dateStr === localDateStr && slotMinutes <= (localMinutes + bufferMinutes)) {
    return true;
  }

  return false;
}

/**
 * Checks if all lunch slots have passed for a specific date in Vietnam.
 */
export function isLunchPastForDate(dateStr: string, bufferMinutes = 10): boolean {
  return LUNCH_TIME_SLOTS.every(slot => isTimeSlotInPast(slot, dateStr, bufferMinutes));
}

/**
 * Checks if all dinner slots have passed for a specific date in Vietnam.
 */
export function isDinnerPastForDate(dateStr: string, bufferMinutes = 10): boolean {
  return DINNER_TIME_SLOTS.every(slot => isTimeSlotInPast(slot, dateStr, bufferMinutes));
}

/**
 * Checks if all available booking slots have passed for a specific date in Vietnam.
 */
export function isAllSlotsPastForDate(dateStr: string, bufferMinutes = 10): boolean {
  return ALL_BOOKING_SLOTS.every(slot => isTimeSlotInPast(slot, dateStr, bufferMinutes));
}

/**
 * Returns all valid future booking slots for a given date in Vietnam.
 */
export function getAvailableSlotsForDate(dateStr: string, bufferMinutes = 10): string[] {
  return ALL_BOOKING_SLOTS.filter(slot => !isTimeSlotInPast(slot, dateStr, bufferMinutes));
}

/**
 * Computes an initial default available date & time slot.
 * If today has passed all slots (or currently in late evening in Vietnam), defaults to tomorrow.
 */
export function getDefaultBookingDateTime(): { date: string; time: string; isTomorrowSuggested?: boolean } {
  const vnNow = getVietnamNow();
  const today = vnNow.dateStr;
  
  // Find first available slot today with at least 15 min buffer
  const nextSlotToday = ALL_BOOKING_SLOTS.find(slot => !isTimeSlotInPast(slot, today, 15));

  if (nextSlotToday) {
    return { date: today, time: nextSlotToday, isTomorrowSuggested: false };
  }

  // All slots today have passed in Vietnam: suggest tomorrow at 18:30 (or 11:30 for lunch)
  const tomorrowStr = getVietnamTomorrowDateStr();
  return { date: tomorrowStr, time: '18:30', isTomorrowSuggested: true };
}
