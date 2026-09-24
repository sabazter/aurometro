export interface UserPreferences {
  theme: 'LIGHT' | 'DARK';
  participationMode: 'SPECTATOR' | 'CONTROLLED' | 'FULL';
  showScore: boolean;
  showInRanking: boolean;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  nickname?: string;
  avatarUrl?: string;
  year: number;
  section: string;
  role: 'STUDENT' | 'ADMIN';
  isFrozen: boolean;
  emailVerified: boolean;
  onboardingCompleted: boolean;
  preferences: UserPreferences;
}

export interface Budget {
  positiveAvailable: number;
  negativeAvailable: number;
  positiveUsed: number;
  negativeUsed: number;
  weekStart: string;
}

export interface StudentListItem {
  id: string;
  firstName: string;
  lastName: string;
  nickname?: string;
  avatarUrl?: string;
  participationMode: string;
}

export interface RankingEntry {
  position: number;
  firstName: string;
  lastName: string;
  nickname?: string;
  avatarUrl?: string;
  aura: number | null;
  year: number;
  section: string;
}
