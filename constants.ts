import { Generation, Player, Region } from './types';

export const AI_OPPONENTS: Player[] = [
  { id: 'ai-zoe', name: 'Zoe', generation: Generation.GenZ, isAI: true, region: 'California', score: 0, hasSubmitted: false, wins: 0 },
  { id: 'ai-mike', name: 'Mike', generation: Generation.Millennials, isAI: true, region: 'New York', score: 0, hasSubmitted: false, wins: 0 },
  { id: 'ai-xander', name: 'Xander', generation: Generation.GenX, isAI: true, region: 'Quebec', score: 0, hasSubmitted: false, wins: 0 },
  { id: 'ai-barbara', name: 'Barbara', generation: Generation.Boomers, isAI: true, region: 'Illinois', score: 0, hasSubmitted: false, wins: 0 },
  { id: 'ai-kyle', name: 'Kyle', generation: Generation.GenZ, isAI: true, region: 'Georgia', score: 0, hasSubmitted: false, wins: 0 },
  { id: 'ai-ashley', name: 'Ashley', generation: Generation.Millennials, isAI: true, region: 'Ontario', score: 0, hasSubmitted: false, wins: 0 },
  { id: 'ai-heather', name: 'Heather', generation: Generation.GenX, isAI: true, region: 'California', score: 0, hasSubmitted: false, wins: 0 },
  { id: 'ai-richard', name: 'Richard', generation: Generation.Boomers, isAI: true, region: 'New York', score: 0, hasSubmitted: false, wins: 0 },
  { id: 'ai-liam', name: 'Liam', generation: Generation.GenZ, isAI: true, region: 'Illinois', score: 0, hasSubmitted: false, wins: 0 },
  { id: 'ai-chad', name: 'Chad', generation: Generation.Millennials, isAI: true, region: 'Quebec', score: 0, hasSubmitted: false, wins: 0 },
];

export const ALL_REGIONS: Region[] = ['Ontario', 'California', 'New York', 'Quebec', 'Illinois', 'Georgia'];

export const GENERATION_COLORS: Record<Generation, string> = {
    [Generation.GenZ]: 'bg-purple-500',
    [Generation.Millennials]: 'bg-blue-500',
    [Generation.GenX]: 'bg-orange-500',
    [Generation.Boomers]: 'bg-green-500',
};
