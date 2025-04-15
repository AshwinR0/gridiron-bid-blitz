export type PlayerPosition = 'Forward' | 'Defence' | 'Goalkeeper';

export type ForwardStats = {
  finishing: number;
  pace: number;
  dribbling: number;
};

export type DefenceStats = {
  defending: number;
  physicality: number;
  aerialSuperiority: number;
};

export type GoalkeeperStats = {
  diving: number;
  reflexes: number;
  positioning: number;
};

export type PlayerStats = ForwardStats | DefenceStats | GoalkeeperStats;

export interface Player {
  id: string;
  name: string;
  position: PlayerPosition;
  image?: string;
  stats: PlayerStats;
  purchaseAmount?: number; // Amount player was purchased for
  team: string;
  value: number;
}

export interface Team {
  id: string;
  name: string;
  logo?: string;
  budget: number;
  remainingBudget: number;
  minPlayers: number;
  maxPlayers: number;
  color?: string;
  players: {
    playerId: string;
    purchaseAmount: number;
  }[];
}

export interface BidIncrementRule {
  minAmount: number;
  maxAmount: number;
  increment: number;
}

export interface Auction {
  id: string;
  name: string;
  status: 'upcoming' | 'active' | 'completed';
  teams: Team[];
  players: Player[];
  minPlayerPrice: number;
  currentBid: {
    teamId: string;
    amount: number;
    timestamp: number;
  } | null;
  currentPlayerId: string | null;
  history: {
    type: 'bid' | 'unsold' | 'next_player';
    playerId?: string;
    teamId?: string;
    amount?: number;
    timestamp: number;
  }[];
  createdAt: number;
  startedAt?: number;
  completedAt?: number;
  unsoldPlayerIds: string[];
  soldPlayerIds: string[];
  bidIncrementRules?: BidIncrementRule[];
}

export interface AuctionContextType {
  auctions: Auction[];
  currentAuction: Auction | null;
  isAdmin: boolean;
  validationError: string | null;
  createAuction: (auctionData: Omit<Auction, 'id' | 'createdAt' | 'history' | 'status'>) => string | null;
  updateAuction: (auctionId: string, auctionData: Omit<Auction, 'id' | 'createdAt' | 'history' | 'status'>) => boolean;
  startAuction: (auctionId: string) => void;
  completeAuction: (auctionId: string) => void;
  setCurrentAuctionById: (auctionId: string) => void;
  placeBid: (teamId: string, amount: number) => void;
  updateBidAmount: (amount: number) => void;
  markPlayerUnsold: (playerId: string) => void;
  nextPlayer: () => void;
  toggleAdmin: () => void;
}
