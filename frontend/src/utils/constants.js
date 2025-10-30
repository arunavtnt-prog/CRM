/**
 * Constants for Wavelaunch Studio OS
 * Journey statuses, health scores, colors
 */

// Journey Status (Epic 2)
export const JOURNEY_STATUS = {
  ONBOARDING: 'ONBOARDING',
  BRAND_BUILDING: 'BRAND_BUILDING',
  LAUNCH: 'LAUNCH',
  LIVE: 'LIVE',
  PAUSED: 'PAUSED',
  CLOSED: 'CLOSED',
};

export const JOURNEY_STATUS_LABELS = {
  ONBOARDING: 'Onboarding',
  BRAND_BUILDING: 'Brand Building',
  LAUNCH: 'Launch',
  LIVE: 'Live',
  PAUSED: 'Paused',
  CLOSED: 'Closed',
};

export const JOURNEY_STATUS_COLORS = {
  ONBOARDING: '#FFA500', // Orange
  BRAND_BUILDING: '#1E90FF', // DodgerBlue
  LAUNCH: '#FFD700', // Gold
  LIVE: '#32CD32', // LimeGreen
  PAUSED: '#808080', // Gray
  CLOSED: '#DC143C', // Crimson
};

// Health Score (Story 2.3)
export const HEALTH_SCORE = {
  GREEN: 'GREEN',
  YELLOW: 'YELLOW',
  RED: 'RED',
};

export const HEALTH_SCORE_LABELS = {
  GREEN: 'Green - On Track',
  YELLOW: 'Yellow - Needs Attention',
  RED: 'Red - Urgent',
};

export const HEALTH_SCORE_COLORS = {
  GREEN: '#28a745',
  YELLOW: '#ffc107',
  RED: '#dc3545',
};

// Priority Levels
export const PRIORITY_LEVELS = [
  { value: 1, label: '1 - Highest' },
  { value: 2, label: '2 - High' },
  { value: 3, label: '3 - Medium' },
  { value: 4, label: '4 - Low' },
  { value: 5, label: '5 - Lowest' },
];

// Communication Channels
export const COMMUNICATION_CHANNELS = [
  'Email',
  'WhatsApp',
  'Slack',
  'Phone',
  'Video Call',
  'In-Person',
];

// Deliverable Types (Epic 3)
export const DELIVERABLE_TYPES = [
  'Brand Guidelines',
  'Progress Report',
  'Launch Plan',
  'Strategy Document',
  'Social Media Kit',
  'Content Calendar',
];

// AI Models (Epic 3)
export const AI_MODELS = [
  { value: 'claude-3-5-sonnet', label: 'Claude 3.5 Sonnet' },
  { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
  { value: 'gpt-4', label: 'GPT-4' },
];

// Date Formats
export const DATE_FORMAT = 'MMM dd, yyyy';
export const DATETIME_FORMAT = 'MMM dd, yyyy HH:mm';
