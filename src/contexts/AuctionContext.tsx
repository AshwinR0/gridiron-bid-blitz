
import React, { createContext, useContext, useState } from "react";
import { Auction, AuctionContextType } from "@/types";
import { initialAuctions } from "@/data/mockData";
import { toast } from '@/components/ui/use-toast';

const AuctionContext = createContext<AuctionContextType | undefined>(undefined);

export const useAuction = () => {
  const context = useContext(AuctionContext);
  if (!context) {
    throw new Error("useAuction must be used within an AuctionProvider");
  }
  return context;
};

export const AuctionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [auctions, setAuctions] = useState<Auction[]>(initialAuctions);
  const [currentAuction, setCurrentAuction] = useState<Auction | null>(null);
  const [isAdmin, setIsAdmin] = useState(true); // Default to admin for demo purposes

  const createAuction = (auctionData: Omit<Auction, 'id' | 'createdAt' | 'history' | 'status'>) => {
    const newAuction: Auction = {
      ...auctionData,
      id: Math.random().toString(36).substring(2, 10),
      status: 'upcoming',
      history: [],
      createdAt: Date.now()
    };

    setAuctions([...auctions, newAuction]);
    toast({
      title: "Auction Created",
      description: `${newAuction.name} has been created successfully.`,
    });
    return newAuction.id;
  };

  const startAuction = (auctionId: string) => {
    setAuctions(prevAuctions => 
      prevAuctions.map(auction => 
        auction.id === auctionId 
          ? { 
              ...auction, 
              status: 'active', 
              startedAt: Date.now(),
              currentPlayerId: auction.playerPool[0]?.id // Set the first player as current
            } 
          : auction
      )
    );

    // Also update current auction if it's the one being started
    if (currentAuction?.id === auctionId) {
      setCurrentAuction(prevAuction => {
        if (!prevAuction) return null;
        return {
          ...prevAuction,
          status: 'active',
          startedAt: Date.now(),
          currentPlayerId: prevAuction.playerPool[0]?.id
        };
      });
    }

    toast({
      title: "Auction Started",
      description: "The auction has begun! First player is up for bidding.",
    });
  };

  const completeAuction = (auctionId: string) => {
    setAuctions(prevAuctions => 
      prevAuctions.map(auction => 
        auction.id === auctionId 
          ? { ...auction, status: 'completed', completedAt: Date.now() } 
          : auction
      )
    );

    // Also update current auction if it's the one being completed
    if (currentAuction?.id === auctionId) {
      setCurrentAuction(prevAuction => {
        if (!prevAuction) return null;
        return {
          ...prevAuction,
          status: 'completed',
          completedAt: Date.now()
        };
      });
    }

    toast({
      title: "Auction Completed",
      description: "The auction has been marked as complete.",
    });
  };

  const setCurrentAuctionById = (auctionId: string) => {
    const auction = auctions.find(a => a.id === auctionId) || null;
    setCurrentAuction(auction);
  };

  const placeBid = (teamId: string, amount: number) => {
    if (!currentAuction || !currentAuction.currentPlayerId) {
      toast({
        title: "Bid Error",
        description: "No active player for bidding.",
        variant: "destructive"
      });
      return;
    }

    // Find the team
    const team = currentAuction.teams.find(t => t.id === teamId);
    if (!team) {
      toast({
        title: "Bid Error",
        description: "Team not found.",
        variant: "destructive"
      });
      return;
    }

    // Check if team has enough budget
    if (team.remainingBudget < amount) {
      toast({
        title: "Bid Error",
        description: "Insufficient budget to place this bid.",
        variant: "destructive"
      });
      return;
    }

    // Check if the bid meets minimum price
    if (amount < currentAuction.minPlayerPrice) {
      toast({
        title: "Bid Error",
        description: `Bid must be at least ${currentAuction.minPlayerPrice}.`,
        variant: "destructive"
      });
      return;
    }

    // Check if the bid is higher than current bid
    if (currentAuction.currentBid && amount <= currentAuction.currentBid.amount) {
      toast({
        title: "Bid Error",
        description: `Bid must be higher than current bid of ${currentAuction.currentBid.amount}.`,
        variant: "destructive"
      });
      return;
    }

    // Calculate max possible bid based on remaining requirements
    const playersNeeded = Math.max(0, team.minPlayers - team.players.length);
    const minBudgetNeeded = playersNeeded * currentAuction.minPlayerPrice;
    const maxPossibleBid = team.remainingBudget - minBudgetNeeded;

    if (playersNeeded > 0 && amount > maxPossibleBid) {
      toast({
        title: "Bid Error",
        description: `Bid exceeds maximum allowed. You must reserve at least ${minBudgetNeeded} for ${playersNeeded} more players.`,
        variant: "destructive"
      });
      return;
    }

    // Update the auction with new bid
    setAuctions(prevAuctions => 
      prevAuctions.map(auction => 
        auction.id === currentAuction.id 
          ? { 
              ...auction, 
              currentBid: { amount, teamId },
              history: [
                ...auction.history,
                {
                  playerId: auction.currentPlayerId!,
                  teamId,
                  amount,
                  timestamp: Date.now()
                }
              ]
            } 
          : auction
      )
    );

    // Update current auction state too
    setCurrentAuction(prevAuction => {
      if (!prevAuction) return null;
      return {
        ...prevAuction,
        currentBid: { amount, teamId },
        history: [
          ...prevAuction.history,
          {
            playerId: prevAuction.currentPlayerId!,
            teamId,
            amount,
            timestamp: Date.now()
          }
        ]
      };
    });

    toast({
      title: "Bid Placed",
      description: `${team.name} placed a bid of ${amount}.`,
    });
  };

  const nextPlayer = () => {
    if (!currentAuction || currentAuction.status !== 'active') {
      toast({
        title: "Action Failed",
        description: "No active auction or auction is not in progress.",
        variant: "destructive"
      });
      return;
    }

    // If there's a current bid, assign the player to the team
    if (currentAuction.currentBid && currentAuction.currentPlayerId) {
      const { teamId, amount } = currentAuction.currentBid;
      const playerId = currentAuction.currentPlayerId;

      // Update teams (assign player and reduce budget)
      const updatedTeams = currentAuction.teams.map(team => {
        if (team.id === teamId) {
          return {
            ...team,
            players: [...team.players, { playerId, purchaseAmount: amount }],
            remainingBudget: team.remainingBudget - amount
          };
        }
        return team;
      });

      // Find next available player
      const soldPlayerIds = new Set([
        ...currentAuction.history
          .filter(h => h.playerId !== currentAuction.currentPlayerId)
          .map(h => h.playerId),
        currentAuction.currentPlayerId
      ]);
      
      const nextPlayer = currentAuction.playerPool.find(p => !soldPlayerIds.has(p.id));

      // Check if all players are sold
      if (!nextPlayer) {
        // Complete the auction if all players are sold
        completeAuction(currentAuction.id);
        toast({
          title: "Auction Complete",
          description: "All players have been sold. The auction is now complete.",
        });
        return;
      }

      // Update the auction
      setAuctions(prevAuctions => 
        prevAuctions.map(auction => 
          auction.id === currentAuction.id 
            ? { 
                ...auction,
                teams: updatedTeams,
                currentPlayerId: nextPlayer.id,
                currentBid: undefined
              } 
            : auction
        )
      );

      // Update current auction state too
      setCurrentAuction(prevAuction => {
        if (!prevAuction) return null;
        return {
          ...prevAuction,
          teams: updatedTeams,
          currentPlayerId: nextPlayer.id,
          currentBid: undefined
        };
      });

      toast({
        title: "Player Sold",
        description: `Player assigned to team and next player is up for bidding.`,
      });
    } else {
      toast({
        title: "No Bids",
        description: "No valid bids were placed for this player. Moving to next player.",
      });
      
      // Find next available player (skipping current one)
      const soldPlayerIds = new Set([
        ...currentAuction.history.map(h => h.playerId),
        currentAuction.currentPlayerId
      ]);
      
      const nextPlayer = currentAuction.playerPool.find(p => !soldPlayerIds.has(p.id));

      // Check if all players are processed
      if (!nextPlayer) {
        // Complete the auction if all players are processed
        completeAuction(currentAuction.id);
        toast({
          title: "Auction Complete",
          description: "All players have been processed. The auction is now complete.",
        });
        return;
      }

      // Update the auction with next player
      setAuctions(prevAuctions => 
        prevAuctions.map(auction => 
          auction.id === currentAuction.id 
            ? { 
                ...auction,
                currentPlayerId: nextPlayer.id,
                currentBid: undefined
              } 
            : auction
        )
      );

      // Update current auction state too
      setCurrentAuction(prevAuction => {
        if (!prevAuction) return null;
        return {
          ...prevAuction,
          currentPlayerId: nextPlayer.id,
          currentBid: undefined
        };
      });
    }
  };

  const toggleAdmin = () => {
    setIsAdmin(prev => !prev);
  };

  const value: AuctionContextType = {
    auctions,
    currentAuction,
    isAdmin,
    createAuction,
    startAuction,
    completeAuction,
    setCurrentAuction: setCurrentAuctionById,
    placeBid,
    nextPlayer,
    toggleAdmin
  };

  return (
    <AuctionContext.Provider value={value}>
      {children}
    </AuctionContext.Provider>
  );
};
