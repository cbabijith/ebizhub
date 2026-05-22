// Shared types and utilities for EzhavaClub

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  created_at: string;
}

export interface Club {
  id: string;
  name: string;
  description: string;
  location: string;
  created_at: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  club_id: string;
  created_at: string;
}

export const APP_ROLES = {
  ADMIN: 'admin',
  USER: 'user',
} as const;

export const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString();
};

export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15);
};
