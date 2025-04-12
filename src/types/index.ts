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

export interface BidIncrementRule {
  fromAmount: number;
  toAmount: number;
  incrementBy: number;
}

export type TournamentType = 'league' | 'knockout' | 'combination';

export type TournamentFixture = {
  id: string;
  homeTeamId: string;
  awayTeamId: string;
  date: string;
  homeScore?: number;
  awayScore?: number;
  status: 'scheduled' | 'in_progress' | 'completed';
  round?: number; // For knockout tournaments
};

export type PlayerStat = {
  playerId: string;
  teamId: string;
  goals: number;
  assists: number;
  cleanSheets: number;
  yellowCards: number;
  redCards: number;
};

export type TournamentTable = {
  teamId: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
};

export type Tournament = {
  id: string;
  name: string;
  type: TournamentType;
  startDate: string;
  endDate?: string;
  status: 'upcoming' | 'active' | 'completed';
  auctionId: string;
  fixtures: TournamentFixture[];
  playerStats: PlayerStat[];
  table: TournamentTable[];
};

export interface Auction {
  id: string;
  name: string;
  minPlayerPrice: number;
  teams: Team[];
  playerPool: Player[];
  status: 'upcoming' | 'active' | 'completed';
  createdAt: string;
  history: BidHistory[];
  bidIncrementRules: BidIncrementRule[];
  tournamentId?: string;
  tournamentType?: TournamentType;
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
  updateBidAmount: (amount: number) => void; // New function to update bid amount
}
