export type PlayerPosition = 'Forward' | 'Defence' | 'Goalkeeper';

export interface Player {
    id: string;
    name: string;
    position: PlayerPosition;
}

export interface Team {
    id: string;
    name: string;
    budget: number;
    remainingBudget: number;
    minPlayers: number;
    players: Player[];
    color: string;
} 