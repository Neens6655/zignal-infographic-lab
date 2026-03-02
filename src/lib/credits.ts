import { GUEST_CREDIT_LIMIT } from './constants';

const STORAGE_KEY = 'zignal-lab-guest';

type GuestData = {
  generationCount: number;
  lastGeneratedAt: string;
};

function getGuestData(): GuestData {
  if (typeof window === 'undefined') return { generationCount: 0, lastGeneratedAt: '' };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { generationCount: 0, lastGeneratedAt: '' };
    return JSON.parse(raw);
  } catch {
    return { generationCount: 0, lastGeneratedAt: '' };
  }
}

function setGuestData(data: GuestData) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function getGuestCreditsUsed(): number {
  return getGuestData().generationCount;
}

export function getGuestCreditsRemaining(): number {
  return Math.max(0, GUEST_CREDIT_LIMIT - getGuestData().generationCount);
}

export function incrementGuestCredits(): number {
  const data = getGuestData();
  data.generationCount += 1;
  data.lastGeneratedAt = new Date().toISOString();
  setGuestData(data);
  return getGuestCreditsRemaining();
}

export function hasGuestCredits(): boolean {
  return getGuestCreditsRemaining() > 0;
}
