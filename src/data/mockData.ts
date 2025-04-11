
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
        goals: Math.floor(Math.random() * 20),
        assists: Math.floor(Math.random() * 15),
        pace: 50 + Math.floor(Math.random() * 50),
      };
    } else if (position === 'Defence') {
      stats = {
        tackles: Math.floor(Math.random() * 100),
        interceptions: Math.floor(Math.random() * 80),
        strength: 60 + Math.floor(Math.random() * 40),
      };
    } else {
      stats = {
        saves: Math.floor(Math.random() * 120),
        cleanSheets: Math.floor(Math.random() * 10),
        reflexes: 65 + Math.floor(Math.random() * 35),
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
      players: []
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
export const initialAuctions: Auction[] = [createSampleAuction()];
