import React, { createContext, useState, useContext, useEffect } from 'react';
import { Auction, BidHistory, Player, Team, Tournament } from '@/types';
import { v4 as uuidv4 } from 'uuid';

interface AuctionContextType {
  auctions: Auction[];
  currentAuction: Auction | null;
  setCurrentAuction: (auction: Auction | null) => void;
  createAuction: (auctionData: Omit<Auction, 'id' | 'createdAt' | 'history' | 'status'>) => void;
  startAuction: (auctionId: string) => void;
  completeAuction: (auctionId: string) => void;
  getAuction: (auctionId: string) => Auction | undefined;
  isAdmin: boolean;
  toggleAdmin: () => void;
  assignPlayerToTeam: (auctionId: string, playerId: string, teamId: string, amount: number) => void;
  tournaments: Tournament[];
  getTournament: (tournamentId: string) => Tournament | undefined;
  updateTournament: (tournamentId: string, updates: Partial<Tournament>) => void;
}

const AuctionContext = createContext<AuctionContextType | undefined>(undefined);

export const AuctionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [currentAuction, setCurrentAuction] = useState<Auction | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);

  useEffect(() => {
    // Load auctions from local storage on component mount
    const storedAuctions = localStorage.getItem('auctions');
    if (storedAuctions) {
      setAuctions(JSON.parse(storedAuctions));
    }

    const storedTournaments = localStorage.getItem('tournaments');
    if (storedTournaments) {
      setTournaments(JSON.parse(storedTournaments));
    }
  }, []);

  useEffect(() => {
    // Save auctions to local storage whenever auctions state changes
    localStorage.setItem('auctions', JSON.stringify(auctions));
  }, [auctions]);

  useEffect(() => {
    localStorage.setItem('tournaments', JSON.stringify(tournaments));
  }, [tournaments]);

  const createAuction = (auctionData: Omit<Auction, 'id' | 'createdAt' | 'history' | 'status'>) => {
    const newAuction: Auction = {
      id: uuidv4(),
      status: 'upcoming',
      createdAt: new Date().toISOString(),
      history: [],
      ...auctionData,
    };
    
    // If tournament type is provided, create a tournament
    if (auctionData.tournamentType) {
      const newTournament: Tournament = {
        id: uuidv4(),
        name: auctionData.name + ' Tournament',
        type: auctionData.tournamentType,
        startDate: new Date().toISOString(),
        status: 'upcoming',
        auctionId: newAuction.id,
        fixtures: [],
        playerStats: [],
        table: auctionData.teams.map(team => ({
          teamId: team.id,
          played: 0,
          won: 0,
          drawn: 0,
          lost: 0,
          goalsFor: 0,
          goalsAgainst: 0,
          points: 0
        }))
      };
      
      newAuction.tournamentId = newTournament.id;
      setTournaments(prev => [...prev, newTournament]);
    }
    
    setAuctions(prev => [...prev, newAuction]);
  };

  const startAuction = (auctionId: string) => {
    setAuctions(prevAuctions =>
      prevAuctions.map(auction =>
        auction.id === auctionId ? { ...auction, status: 'active' } : auction
      )
    );
  };

  const completeAuction = (auctionId: string) => {
    setAuctions(prevAuctions =>
      prevAuctions.map(auction =>
        auction.id === auctionId ? { ...auction, status: 'completed' } : auction
      )
    );
  };

  const getAuction = (auctionId: string) => {
    return auctions.find(auction => auction.id === auctionId);
  };

  const assignPlayerToTeam = (auctionId: string, playerId: string, teamId: string, amount: number) => {
    setAuctions(prevAuctions =>
      prevAuctions.map(auction => {
        if (auction.id === auctionId) {
          const newBid: BidHistory = {
            id: uuidv4(),
            playerId,
            teamId,
            amount,
            timestamp: new Date().toISOString(),
          };

          return {
            ...auction,
            history: [...auction.history, newBid],
          };
        }
        return auction;
      })
    );
  };

  const toggleAdmin = () => {
    setIsAdmin(prevIsAdmin => !prevIsAdmin);
  };

  const getTournament = (tournamentId: string) => {
    return tournaments.find(t => t.id === tournamentId);
  };

  const updateTournament = (tournamentId: string, updates: Partial<Tournament>) => {
    setTournaments(prev => 
      prev.map(tournament => 
        tournament.id === tournamentId ? { ...tournament, ...updates } : tournament
      )
    );
  };

  const value: AuctionContextType = {
    auctions,
    currentAuction,
    setCurrentAuction,
    createAuction,
    startAuction,
    completeAuction,
    getAuction,
    isAdmin,
    toggleAdmin,
    assignPlayerToTeam,
    tournaments,
    getTournament,
    updateTournament
  };

  return (
    <AuctionContext.Provider value={value}>
      {children}
    </AuctionContext.Provider>
  );
};

export const useAuction = () => {
  const context = useContext(AuctionContext);
  if (context === undefined) {
    throw new Error('useAuction must be used within an AuctionProvider');
  }
  return context;
};
