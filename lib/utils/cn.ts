import { type ClassValue, clsx } from "clsx";

/**
 * Utility function to merge Tailwind CSS classes
 * Handles conditional classes and removes duplicates
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}
