export type PlayerPosition = 'Forward' | 'Defence' | 'Goalkeeper';

export interface Stats {
    [key: string]: string | number;
}

export interface Player {
    id: string;
    name: string;
    position: PlayerPosition;
    image?: string;
    stats?: Stats;
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