export enum Generation {
  GenZ = "Gen Z",
  Millennials = "Millennials",
  GenX = "Gen X",
  Boomers = "Boomers",
}

export type GamePhase = 'Lobby' | 'GeneratingContent' | 'Submitting' | 'Voting' | 'Results';

export type Region = 'Ontario' | 'California' | 'New York' | 'Quebec' | 'Illinois' | 'Georgia';


export interface Player {
  id: string; // socket.id
  name: string;
  generation: Generation;
  isAI: boolean;
  region: Region;
  score: number;
  hasSubmitted: boolean;
}

export interface Submission {
  playerId: string;
  playerName: string; // Denormalized for easier display
  backronym: string;
  votes: string[]; // Array of player IDs who voted
}

export interface ChatMessage {
  sender: string;
  senderId: string;
  text: string;
}

export interface Game {
  id: string;
  hostId: string;
  players: Player[];
  phase: GamePhase;
  acronym: string;
  theme: string;
  submissions: Submission[];
  difficulty: number;
  roundWinnerId?: string;
  countdown: number;
}
