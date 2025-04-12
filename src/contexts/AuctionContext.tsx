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
      createdAt: Date.now(),
      unsoldPlayerIds: []
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
              unsoldPlayerIds: []
            } 
          : auction
      )
    );

    if (currentAuction?.id === auctionId) {
      setCurrentAuction(prevAuction => {
        if (!prevAuction) return null;
        return {
          ...prevAuction,
          status: 'active',
          startedAt: Date.now(),
          unsoldPlayerIds: []
        };
      });
    }

    toast({
      title: "Auction Started",
      description: "The auction has begun! Select a player to start bidding.",
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
    if (!currentAuction) {
      toast({
        title: "Bid Error",
        description: "No active auction for bidding.",
        variant: "destructive"
      });
      return;
    }

    if (!currentAuction.currentPlayerId) {
      toast({
        title: "Bid Error",
        description: "No player selected for bidding.",
        variant: "destructive"
      });
      return;
    }

    const team = currentAuction.teams.find(t => t.id === teamId);
    if (!team) {
      toast({
        title: "Bid Error",
        description: "Team not found.",
        variant: "destructive"
      });
      return;
    }

    if (team.remainingBudget < amount) {
      toast({
        title: "Bid Error",
        description: "Insufficient budget to place this bid.",
        variant: "destructive"
      });
      return;
    }

    if (amount < currentAuction.minPlayerPrice) {
      toast({
        title: "Bid Error",
        description: `Bid must be at least ${currentAuction.minPlayerPrice}.`,
        variant: "destructive"
      });
      return;
    }

    if (amount <= currentAuction.currentBid?.amount) {
      toast({
        title: "Bid Error",
        description: `Bid must be higher than current bid of ${currentAuction.currentBid?.amount}.`,
        variant: "destructive"
      });
      return;
    }

    const playersNeeded = Math.max(0, team.minPlayers - team.players.length);
    const minBudgetNeeded = playersNeeded > 1 ? (playersNeeded - 1) * currentAuction.minPlayerPrice : 0;
    const maxPossibleBid = team.remainingBudget - minBudgetNeeded;

    if (playersNeeded > 1 && amount > maxPossibleBid) {
      toast({
        title: "Bid Error",
        description: `Bid exceeds maximum allowed. You must reserve at least ${minBudgetNeeded} for ${playersNeeded - 1} more players.`,
        variant: "destructive"
      });
      return;
    }

    setAuctions(prevAuctions => 
      prevAuctions.map(auction => 
        auction.id === currentAuction.id 
          ? { 
              ...auction, 
              currentBid: { amount, teamId },
              history: [
                ...auction.history,
                {
                  playerId: auction.currentPlayerId || "",
                  teamId,
                  amount,
                  timestamp: Date.now()
                }
              ]
            } 
          : auction
      )
    );

    setCurrentAuction(prevAuction => {
      if (!prevAuction) return null;
      return {
        ...prevAuction,
        currentBid: { amount, teamId },
        history: [
          ...prevAuction.history,
          {
            playerId: prevAuction.currentPlayerId || "",
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

  const updateBidAmount = (amount: number) => {
    if (!currentAuction || !currentAuction.currentBid) {
      toast({
        title: "Error",
        description: "No active bid to update.",
        variant: "destructive"
      });
      return;
    }

    if (!currentAuction.currentPlayerId) {
      toast({
        title: "Error",
        description: "No player selected for bidding.",
        variant: "destructive"
      });
      return;
    }

    const teamId = currentAuction.currentBid.teamId;
    const team = currentAuction.teams.find(t => t.id === teamId);
    if (!team) {
      toast({
        title: "Error",
        description: "Team not found.",
        variant: "destructive"
      });
      return;
    }

    if (amount < currentAuction.minPlayerPrice) {
      toast({
        title: "Error",
        description: `Bid amount must be at least ${currentAuction.minPlayerPrice}.`,
        variant: "destructive"
      });
      return;
    }

    if (amount > team.remainingBudget) {
      toast({
        title: "Error",
        description: "Updated amount exceeds team's remaining budget.",
        variant: "destructive"
      });
      return;
    }

    const playersNeeded = Math.max(0, team.minPlayers - team.players.length);
    const minBudgetNeeded = playersNeeded > 1 ? (playersNeeded - 1) * currentAuction.minPlayerPrice : 0;
    const maxPossibleBid = team.remainingBudget - minBudgetNeeded;

    if (playersNeeded > 1 && amount > maxPossibleBid) {
      toast({
        title: "Bid Error",
        description: `Bid exceeds maximum allowed. You must reserve at least ${minBudgetNeeded} for ${playersNeeded - 1} more players.`,
        variant: "destructive"
      });
      return;
    }

    setAuctions(prevAuctions =>
      prevAuctions.map(auction =>
        auction.id === currentAuction.id
          ? {
              ...auction,
              currentBid: { ...auction.currentBid!, amount },
              history: auction.history.map((item, index) => {
                if (index === auction.history.length - 1 && item.playerId === auction.currentPlayerId) {
                  return { ...item, amount };
                }
                return item;
              })
            }
          : auction
      )
    );

    setCurrentAuction(prevAuction => {
      if (!prevAuction) return null;
      return {
        ...prevAuction,
        currentBid: { ...prevAuction.currentBid!, amount },
        history: prevAuction.history.map((item, index) => {
          if (index === prevAuction.history.length - 1 && item.playerId === prevAuction.currentPlayerId) {
            return { ...item, amount };
          }
          return item;
        })
      };
    });

    toast({
      title: "Bid Updated",
      description: `${team.name}'s bid has been updated to ${amount}.`,
    });
  };

  const markPlayerUnsold = (playerId: string) => {
    if (!currentAuction) {
      toast({
        title: "Action Failed",
        description: "No active auction.",
        variant: "destructive"
      });
      return;
    }

    setAuctions(prevAuctions => 
      prevAuctions.map(auction => 
        auction.id === currentAuction.id 
          ? { 
              ...auction,
              unsoldPlayerIds: [...(auction.unsoldPlayerIds || []), playerId],
              currentBid: undefined,
              currentPlayerId: undefined
            } 
          : auction
      )
    );

    setCurrentAuction(prevAuction => {
      if (!prevAuction) return null;
      return {
        ...prevAuction,
        unsoldPlayerIds: [...(prevAuction.unsoldPlayerIds || []), playerId],
        currentBid: undefined,
        currentPlayerId: undefined
      };
    });

    toast({
      title: "Player Unsold",
      description: "Player has been marked as unsold and will be available for the next round.",
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

    if (!currentAuction.currentPlayerId) {
      toast({
        title: "Action Failed",
        description: "Please select a player first.",
        variant: "destructive"
      });
      return;
    }

    if (currentAuction.currentBid) {
      const { teamId, amount } = currentAuction.currentBid;
      const playerId = currentAuction.currentPlayerId;

      const teamToUpdate = currentAuction.teams.find(team => team.id === teamId);
      if (!teamToUpdate) {
        toast({
          title: "Error",
          description: "Team not found.",
          variant: "destructive"
        });
        return;
      }

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

      setAuctions(prevAuctions => 
        prevAuctions.map(auction => 
          auction.id === currentAuction.id 
            ? { 
                ...auction,
                teams: updatedTeams,
                currentPlayerId: undefined,
                currentBid: undefined
              } 
            : auction
        )
      );

      setCurrentAuction(prevAuction => {
        if (!prevAuction) return null;
        return {
          ...prevAuction,
          teams: updatedTeams,
          currentPlayerId: undefined,
          currentBid: undefined
        };
      });

      toast({
        title: "Player Sold",
        description: `Player assigned to team. Select the next player for bidding.`,
      });
    } else {
      markPlayerUnsold(currentAuction.currentPlayerId);
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
    markPlayerUnsold,
    toggleAdmin,
    updateBidAmount
  };

  return (
    <AuctionContext.Provider value={value}>
      {children}
    </AuctionContext.Provider>
  );
};
