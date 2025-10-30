/**
 * Helper utility functions
 */

import { format, formatDistanceToNow } from 'date-fns';
import {
  JOURNEY_STATUS_LABELS,
  JOURNEY_STATUS_COLORS,
  HEALTH_SCORE_LABELS,
  HEALTH_SCORE_COLORS,
  DATE_FORMAT,
  DATETIME_FORMAT,
} from './constants';

/**
 * Format date to readable string
 */
export const formatDate = (dateString) => {
  if (!dateString) return '-';
  try {
    return format(new Date(dateString), DATE_FORMAT);
  } catch (error) {
    return dateString;
  }
};

/**
 * Format datetime to readable string
 */
export const formatDateTime = (dateString) => {
  if (!dateString) return '-';
  try {
    return format(new Date(dateString), DATETIME_FORMAT);
  } catch (error) {
    return dateString;
  }
};

/**
 * Format relative time (e.g., "2 days ago")
 */
export const formatRelativeTime = (dateString) => {
  if (!dateString) return '-';
  try {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  } catch (error) {
    return dateString;
  }
};

/**
 * Get journey status label
 */
export const getJourneyStatusLabel = (status) => {
  return JOURNEY_STATUS_LABELS[status] || status;
};

/**
 * Get journey status color
 */
export const getJourneyStatusColor = (status) => {
  return JOURNEY_STATUS_COLORS[status] || '#000000';
};

/**
 * Get health score label
 */
export const getHealthScoreLabel = (score) => {
  return HEALTH_SCORE_LABELS[score] || score;
};

/**
 * Get health score color
 */
export const getHealthScoreColor = (score) => {
  return HEALTH_SCORE_COLORS[score] || '#808080';
};

/**
 * Truncate text to specified length
 */
export const truncateText = (text, maxLength = 50) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Get initials from name
 */
export const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

/**
 * Copy text to clipboard
 */
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy:', error);
    return false;
  }
};

/**
 * Validate email format
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate URL format
 */
export const isValidURL = (url) => {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Get health score sort value (for sorting: RED > YELLOW > GREEN)
 */
export const getHealthScoreSortValue = (score) => {
  const sortMap = {
    RED: 1,
    YELLOW: 2,
    GREEN: 3,
  };
  return sortMap[score] || 999;
};

/**
 * Sort creators by health score (most urgent first)
 */
export const sortByHealthScore = (creators) => {
  return [...creators].sort((a, b) => {
    return getHealthScoreSortValue(a.health_score) - getHealthScoreSortValue(b.health_score);
  });
};

/**
 * Filter creators by search term
 */
export const filterCreatorsBySearch = (creators, searchTerm) => {
  if (!searchTerm) return creators;

  const term = searchTerm.toLowerCase();
  return creators.filter((creator) => {
    return (
      creator.creator_name?.toLowerCase().includes(term) ||
      creator.brand_name?.toLowerCase().includes(term) ||
      creator.creator_email?.toLowerCase().includes(term) ||
      creator.brand_niche?.toLowerCase().includes(term)
    );
  });
};

/**
 * Get badge color for journey status (MUI colors)
 */
export const getStatusBadgeColor = (status) => {
  const colorMap = {
    ONBOARDING: 'warning',
    BRAND_BUILDING: 'info',
    LAUNCH: 'secondary',
    LIVE: 'success',
    PAUSED: 'default',
    CLOSED: 'error',
  };
  return colorMap[status] || 'default';
};

/**
 * Get severity for health score (MUI Alert severity)
 */
export const getHealthSeverity = (score) => {
  const severityMap = {
    RED: 'error',
    YELLOW: 'warning',
    GREEN: 'success',
  };
  return severityMap[score] || 'info';
};
