
export enum Generation {
  GenZ = "Gen Z",
  Millennials = "Millennials",
  GenX = "Gen X",
  Boomers = "Boomers",
}

export type LobbyTheme = Generation | 'All Generations';

export type GamePhase = 
  | 'Lobby' 
  | 'RoundThemeReveal'   // Display theme for 5s
  | 'RoundAcronymReveal' // Display acronym for 5s
  | 'Submitting'         // 45s timer for input
  | 'Voting'
  | 'RoundResults'
  | 'FaceoffSubmitting'
  | 'FaceoffVoting'
  | 'FaceoffResults'
  | 'GameOver';

export type Region = 'Ontario' | 'California' | 'New York' | 'Quebec' | 'Illinois' | 'Georgia';


export interface Player {
  id: string; // socket.id
  name: string;
  generation: Generation;
  isAI: boolean;
  region: Region;
  score: number;
  hasSubmitted: boolean;
  wins: number;
}

export interface Submission {
  playerId: string;
  playerName:string; // Denormalized for easier display
  backronym: string;
  votes: string[]; // Array of player IDs who voted
}

export interface ChatMessage {
  sender: string;
  senderId: string;
  text: string;
}

export interface Game {
  id:string;
  hostId: string;
  players: Player[];
  phase: GamePhase;
  lobbyType: LobbyTheme;
  roundNumber: number; // 1, 2, or 3
  acronym: string;
  theme: string;
  submissions: Submission[];
  faceoffPlayers: string[];
  faceoffSubmissions: Submission[];
  roundWinnerId?: string;
  gameWinnerId?: string;
  countdown: number;
}
