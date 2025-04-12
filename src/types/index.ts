
export type PlayerPosition = 'Forward' | 'Defence' | 'Goalkeeper';

export interface Player {
  id: string;
  name: string;
  position: PlayerPosition;
  image?: string;
  stats?: {
    [key: string]: number;
  };
  purchaseAmount?: number; // Amount player was purchased for
}

export interface Team {
  id: string;
  name: string;
  logo?: string;
  budget: number;
  remainingBudget: number;
  minPlayers: number;
  players: Array<{
    playerId: string;
    purchaseAmount: number;
  }>;
}

export interface Auction {
  id: string;
  name: string;
  status: 'upcoming' | 'active' | 'completed';
  minPlayerPrice: number;
  teams: Team[];
  playerPool: Player[];
  currentPlayerId?: string;
  currentBid?: {
    amount: number;
    teamId: string;
  };
  history: Array<{
    playerId: string;
    teamId: string;
    amount: number;
    timestamp: number;
  }>;
  unsoldPlayerIds?: string[]; // IDs of players that were marked as unsold
  createdAt: number;
  startedAt?: number;
  completedAt?: number;
}

export interface AuctionContextType {
  auctions: Auction[];
  currentAuction: Auction | null;
  isAdmin: boolean;
  createAuction: (auction: Omit<Auction, 'id' | 'createdAt' | 'history' | 'status'>) => void;
  startAuction: (auctionId: string) => void;
  completeAuction: (auctionId: string) => void;
  setCurrentAuction: (auctionId: string) => void;
  placeBid: (teamId: string, amount: number) => void;
  nextPlayer: () => void;
  markPlayerUnsold: (playerId: string) => void;
  toggleAdmin: () => void;
}
