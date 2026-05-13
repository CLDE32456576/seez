import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatDuration(seconds) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function getGradeColor(grade) {
  const map = {
    'A+': '#00e5a0',
    A: '#00c97a',
    B: '#3b82f6',
    C: '#f5c518',
    D: '#f97316',
    F: '#ff4757',
  }
  return map[grade] || '#5a6a8a'
}

export function getRankColor(tier) {
  const map = {
    'Grinder':   '#8e9192',
    'Hunter':    '#4ade80',
    'Closer':    '#3b82f6',
    'Slinger':   '#dcc662',
    'Rainmaker': '#f97316',
    'Wolf':      '#a855f7',
    'The Don':   '#ff4757',
  }
  return map[tier] || '#8e9192'
}

export function getRankEmoji(tier) {
  const map = {
    'Grinder':   '⚙️',
    'Hunter':    '🎯',
    'Closer':    '🤝',
    'Slinger':   '⚡',
    'Rainmaker': '💰',
    'Wolf':      '🐺',
    'The Don':   '👑',
  }
  return map[tier] || '⚙️'
}

export function calculateEloChange(grade, mode) {
  const base = { 'A+': 45, A: 35, B: 20, C: 0, D: -10, F: -20 }
  const multiplier = { easy: 1, medium: 1.25, hard: 1.5 }
  return Math.round((base[grade] || 0) * (multiplier[mode] || 1))
}

export function getStatColor(value) {
  if (value >= 80) return '#00e5a0'
  if (value >= 65) return '#3b82f6'
  if (value >= 50) return '#f5c518'
  return '#ff4757'
}
