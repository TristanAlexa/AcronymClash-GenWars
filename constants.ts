import { Generation, Player, Region } from './types';

export const AI_OPPONENTS: Player[] = [
  { id: 'ai-genz', name: 'Zoe', generation: Generation.GenZ, isAI: true, region: 'California', score: 0, hasSubmitted: false },
  { id: 'ai-millennial', name: 'Mike', generation: Generation.Millennials, isAI: true, region: 'New York', score: 0, hasSubmitted: false },
  { id: 'ai-genx', name: 'Xander', generation: Generation.GenX, isAI: true, region: 'Quebec', score: 0, hasSubmitted: false },
  { id: 'ai-boomer', name: 'Barbara', generation: Generation.Boomers, isAI: true, region: 'Illinois', score: 0, hasSubmitted: false },
];

export const ALL_REGIONS: Region[] = ['Ontario', 'California', 'New York', 'Quebec', 'Illinois', 'Georgia'];

export const GENERATION_COLORS: Record<Generation, string> = {
    [Generation.GenZ]: 'bg-purple-500',
    [Generation.Millennials]: 'bg-blue-500',
    [Generation.GenX]: 'bg-orange-500',
    [Generation.Boomers]: 'bg-green-500',
};