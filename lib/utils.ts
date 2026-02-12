import { type ClassValue, clsx } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/**
 * Format temperature to string with degree symbol
 */
export function formatTemp(temp: number): string {
  return `${Math.round(temp)}°C`;
}

/**
 * Format time to HH:mm
 */
export function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false 
  });
}

/**
 * Get time difference in minutes
 */
export function getMinutesDifference(date1: Date, date2: Date): number {
  return Math.abs(Math.round((date1.getTime() - date2.getTime()) / (1000 * 60)));
}

/**
 * Check if date is today
 */
export function isToday(date: Date): boolean {
  const today = new Date();
  return date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();
}
