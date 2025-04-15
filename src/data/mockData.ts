import { Auction, Player, PlayerPosition, Team } from "@/types";

// Utility to generate unique IDs
const generateId = () => Math.random().toString(36).substring(2, 10);

// Generate mock players with positions
export const generateMockPlayers = (count: number): Player[] => {
  const positions: PlayerPosition[] = ['Forward', 'Defence', 'Goalkeeper'];
  const players: Player[] = [];

  for (let i = 0; i < count; i++) {
    const position = positions[i % positions.length];

    // Different stats based on position
    let stats: { [key: string]: number } = {};

    if (position === 'Forward') {
      stats = {
        finishing: Math.floor(Math.random() * 20),
        pace: Math.floor(Math.random() * 15),
        dribbling: 50 + Math.floor(Math.random() * 50),
      };
    } else if (position === 'Defence') {
      stats = {
        defending: Math.floor(Math.random() * 100),
        physicality: Math.floor(Math.random() * 80),
        aerialSuperiority: 60 + Math.floor(Math.random() * 40),
      };
    } else {
      stats = {
        diving: Math.floor(Math.random() * 120),
        reflexes: Math.floor(Math.random() * 10),
        positioning: 65 + Math.floor(Math.random() * 35),
      };
    }

    players.push({
      id: generateId(),
      name: `Player ${i + 1}`,
      position,
      stats
    });
  }

  return players;
};

// Generate mock teams
export const generateMockTeams = (count: number, budgetMin: number, budgetMax: number): Team[] => {
  const teams: Team[] = [];

  for (let i = 0; i < count; i++) {
    const budget = budgetMin + Math.floor(Math.random() * (budgetMax - budgetMin));

    teams.push({
      id: generateId(),
      name: `Team ${i + 1}`,
      budget,
      remainingBudget: budget,
      minPlayers: 11,
      players: [],
      maxPlayers: 0
    });
  }

  return teams;
};

// Create a sample auction
export const createSampleAuction = (): Auction => {
  const players = generateMockPlayers(30);
  const teams = generateMockTeams(4, 1000, 1500);

  return {
    id: generateId(),
    name: "Sample Football Auction",
    status: 'upcoming',
    minPlayerPrice: 50,
    teams,
    playerPool: players,
    history: [],
    createdAt: Date.now()
  };
};

// Initialize with one sample auction
export const initialAuctions: Auction[] = [
  {
    id: "1",
    name: "Fantasy Football Auction 2024",
    status: "upcoming",
    teams: [
      {
        id: "team1",
        name: "Team Alpha",
        budget: 200,
        remainingBudget: 200,
        minPlayers: 8,
        maxPlayers: 10,
        players: [],
      },
      {
        id: "team2",
        name: "Team Beta",
        budget: 200,
        remainingBudget: 200,
        minPlayers: 8,
        maxPlayers: 10,
        players: [],
      },
    ],
    players: [
      {
        id: "player1",
        name: "John Smith",
        position: "Forward",
        team: "DAL",
        value: 50,
        stats: {
          finishing: 0,
          pace: 0,
          dribbling: 0
        }
      },
      {
        id: "player2",
        name: "Mike Johnson",
        position: "Defence",
        team: "SF",
        value: 45,
        stats: {
          finishing: 0,
          pace: 0,
          dribbling: 0
        }
      },
      {
        id: "player3",
        name: "David Wilson",
        position: "Goalkeeper",
        team: "KC",
        value: 40,
        stats: {
          finishing: 0,
          pace: 0,
          dribbling: 0
        }
      },
    ],
    minPlayerPrice: 1,
    currentBid: null,
    currentPlayerId: null,
    history: [],
    createdAt: Date.now(),
    unsoldPlayerIds: [],
    soldPlayerIds: [],
    bidIncrementRules: [
      { minAmount: 1, maxAmount: 10, increment: 1 },
      { minAmount: 11, maxAmount: 50, increment: 2 },
      { minAmount: 51, maxAmount: 100, increment: 5 },
      { minAmount: 101, maxAmount: 200, increment: 10 },
    ],
  },
];
