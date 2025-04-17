import React, { createContext, useContext, useState } from "react";
import { Auction, AuctionContextType } from "@/types";
import { initialAuctions } from "@/data/mockData";
import { toast } from 'sonner';

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
  const [validationError, setValidationError] = useState<string | null>(null);

  const createAuction = (auctionData: Omit<Auction, 'id' | 'createdAt' | 'history' | 'status'>) => {
    // Reset validation error at the start
    setValidationError(null);

    // Calculate total minimum players required across all teams
    const totalMinPlayersRequired = auctionData.teams.reduce((total, team) => {
      return total + team.minPlayers;
    }, 0);

    // Check if there are enough players
    if (auctionData.players.length < totalMinPlayersRequired) {
      const errorMessage = `You need at least ${totalMinPlayersRequired} players for ${auctionData.teams.length} teams. Currently only ${auctionData.players.length} players available.`;
      setValidationError(errorMessage);
      toast.error("Insufficient Players", {
        description: errorMessage,
      });
      return null;
    }

    // Check if there are enough teams
    if (auctionData.teams.length < 2) {
      const errorMessage = "You need at least 2 teams to create an auction.";
      setValidationError(errorMessage);
      toast.error("Insufficient Teams", {
        description: errorMessage,
      });
      return null;
    }

    // Check if all teams have valid budgets
    const teamsWithInvalidBudgets = auctionData.teams.filter(team =>
      team.budget < auctionData.minPlayerPrice * team.minPlayers
    );

    if (teamsWithInvalidBudgets.length > 0) {
      const teamNames = teamsWithInvalidBudgets.map(team => team.name).join(", ");
      const errorMessage = `The following teams don't have enough budget to meet their minimum player requirements: ${teamNames}`;
      setValidationError(errorMessage);
      toast.error("Invalid Team Budgets", {
        description: errorMessage,
      });
      return null;
    }

    const newAuction: Auction = {
      ...auctionData,
      id: Math.random().toString(36).substring(2, 10),
      status: 'upcoming',
      history: [],
      createdAt: Date.now(),
      unsoldPlayerIds: [],
      soldPlayerIds: [],
    };

    setAuctions([...auctions, newAuction]);
    toast.success("Auction Created", {
      description: `${newAuction.name} has been created successfully.`,
    });
    return newAuction.id;
  };

  const updateAuction = (auctionId: string, auctionData: Omit<Auction, 'id' | 'createdAt' | 'history' | 'status'>) => {
    // Reset validation error at the start
    setValidationError(null);

    // Calculate total minimum players required across all teams
    const totalMinPlayersRequired = auctionData.teams.reduce((total, team) => {
      return total + team.minPlayers;
    }, 0);

    // Check if there are enough players
    if (auctionData.players.length < totalMinPlayersRequired) {
      const errorMessage = `You need at least ${totalMinPlayersRequired} players for ${auctionData.teams.length} teams. Currently only ${auctionData.players.length} players available.`;
      setValidationError(errorMessage);
      toast.error("Insufficient Players", {
        description: errorMessage,
      });
      return false;
    }

    // Check if there are enough teams
    if (auctionData.teams.length < 2) {
      const errorMessage = "You need at least 2 teams to create an auction.";
      setValidationError(errorMessage);
      toast.error("Insufficient Teams", {
        description: errorMessage,
      });
      return false;
    }

    // Check if all teams have valid budgets
    const teamsWithInvalidBudgets = auctionData.teams.filter(team =>
      team.budget < auctionData.minPlayerPrice * team.minPlayers
    );

    if (teamsWithInvalidBudgets.length > 0) {
      const teamNames = teamsWithInvalidBudgets.map(team => team.name).join(", ");
      const errorMessage = `The following teams don't have enough budget to meet their minimum player requirements: ${teamNames}`;
      setValidationError(errorMessage);
      toast.error("Invalid Team Budgets", {
        description: errorMessage,
      });
      return false;
    }

    // Update the auction
    setAuctions(prevAuctions =>
      prevAuctions.map(auction =>
        auction.id === auctionId
          ? {
            ...auction,
            ...auctionData,
            id: auctionId,
            status: auction.status,
            createdAt: auction.createdAt,
            history: auction.history
          }
          : auction
      )
    );

    // Update current auction if it's the one being edited
    if (currentAuction?.id === auctionId) {
      setCurrentAuction(prev => {
        if (!prev) return null;
        return {
          ...prev,
          ...auctionData,
          id: auctionId,
          status: prev.status,
          createdAt: prev.createdAt,
          history: prev.history
        };
      });
    }

    return true;
  };

  const startAuction = (auctionId: string) => {
    setAuctions(prevAuctions =>
      prevAuctions.map(auction =>
        auction.id === auctionId
          ? {
            ...auction,
            status: 'active',
            startedAt: Date.now(),
            unsoldPlayerIds: [],
            soldPlayerIds: []
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

    toast.success("Auction Started", {
      description: "The auction has begun! Select a player to start bidding.",
    });
  };

  const completeAuction = (auctionId: string) => {
    const auction = auctions.find(a => a.id === auctionId);
    if (!auction) return;

    // Get all sold players with their details from the auction history
    const soldPlayerDetails = auction.history
      .filter(h => h.type === 'next_player')
      .reduce((acc, h) => {
        acc[h.playerId] = {
          teamId: h.teamId,
          amount: h.amount
        };
        return acc;
      }, {} as Record<string, { teamId: string; amount: number }>);

    // Update teams with their purchased players and remaining budgets
    const updatedTeams = auction.teams.map(team => {
      const teamPurchases = Object.entries(soldPlayerDetails)
        .filter(([_, details]) => (details as { teamId: string; amount: number }).teamId === team.id)
        .map(([playerId, details]) => ({
          playerId,
          purchaseAmount: (details as { teamId: string; amount: number }).amount
        }));

      return {
        ...team,
        players: teamPurchases,
        remainingBudget: team.budget - teamPurchases.reduce((sum, p) => sum + p.purchaseAmount, 0)
      };
    });

    // Get all sold player IDs
    const soldPlayerIds = Object.keys(soldPlayerDetails);

    const updatedAuction = {
      ...auction,
      status: 'completed' as const,
      completedAt: Date.now(),
      teams: updatedTeams,
      soldPlayerIds: soldPlayerIds,
      players: auction.players.map(player => {
        const soldDetails = soldPlayerDetails[player.id];
        if (soldDetails) {
          return {
            ...player,
            purchaseAmount: soldDetails.amount,
            team: soldDetails.teamId
          };
        }
        return player;
      })
    };

    setAuctions(prevAuctions =>
      prevAuctions.map(a =>
        a.id === auctionId ? updatedAuction : a
      )
    );

    if (currentAuction?.id === auctionId) {
      setCurrentAuction(updatedAuction);
    }

    toast.success("Auction Completed", {
      description: "The auction has been completed successfully. View the results in the auction details.",
    });
  };

  const setCurrentAuctionById = (auctionId: string) => {
    const auction = auctions.find(a => a.id === auctionId) || null;
    setCurrentAuction(auction);
  };

  const placeBid = (teamId: string, amount: number) => {
    if (!currentAuction) return;

    const updatedAuction = {
      ...currentAuction,
      currentBid: {
        teamId,
        amount,
        timestamp: Date.now(),
      },
      history: [
        ...currentAuction.history,
        {
          type: 'bid' as const,
          teamId,
          amount,
          timestamp: Date.now(),
        },
      ],
    };

    setCurrentAuction(updatedAuction);
    setAuctions(prevAuctions =>
      prevAuctions.map(auction =>
        auction.id === currentAuction.id ? updatedAuction : auction
      )
    );

    toast.success("Bid Placed", {
      description: `Bid of $${amount} placed successfully.`,
    });
  };

  const updateBidAmount = (amount: number) => {
    if (!currentAuction) return;

    const updatedAuction = {
      ...currentAuction,
      currentBid: currentAuction.currentBid
        ? {
          ...currentAuction.currentBid,
          amount,
          timestamp: Date.now(),
        }
        : null,
    };

    setCurrentAuction(updatedAuction);
    setAuctions(prevAuctions =>
      prevAuctions.map(auction =>
        auction.id === currentAuction.id ? updatedAuction : auction
      )
    );
  };

  const markPlayerUnsold = (playerId: string) => {
    if (!currentAuction) return;

    const updatedAuction = {
      ...currentAuction,
      unsoldPlayerIds: [...currentAuction.unsoldPlayerIds, playerId],
      history: [
        ...currentAuction.history,
        {
          type: 'unsold' as const,
          playerId,
          timestamp: Date.now(),
        },
      ],
    };

    setCurrentAuction(updatedAuction);
    setAuctions(prevAuctions =>
      prevAuctions.map(auction =>
        auction.id === currentAuction.id ? updatedAuction : auction
      )
    );

    toast.success("Player Marked Unsold", {
      description: "The player has been marked as unsold.",
    });
  };

  const nextPlayer = () => {
    if (!currentAuction) return;

    const currentPlayer = currentAuction.players.find(p => p.id === currentAuction.currentPlayerId);
    if (!currentPlayer) return;

    const currentBid = currentAuction.currentBid;
    if (currentBid) {
      // Update the winning team's players and remaining budget
      const updatedTeams = currentAuction.teams.map(team => {
        if (team.id === currentBid.teamId) {
          return {
            ...team,
            players: [...team.players, { playerId: currentPlayer.id, purchaseAmount: currentBid.amount }],
            remainingBudget: team.remainingBudget - currentBid.amount
          };
        }
        return team;
      });

      // Update the player's team and purchase amount
      const updatedPlayers = currentAuction.players.map(player => {
        if (player.id === currentPlayer.id) {
          return {
            ...player,
            team: currentBid.teamId,
            purchaseAmount: currentBid.amount
          };
        }
        return player;
      });

      const updatedAuction: Auction = {
        ...currentAuction,
        teams: updatedTeams,
        players: updatedPlayers,
        currentBid: null,
        currentPlayerId: null,
        soldPlayerIds: [...currentAuction.soldPlayerIds, currentPlayer.id],
        history: [
          ...currentAuction.history,
          {
            type: 'next_player' as const,
            playerId: currentPlayer.id,
            teamId: currentBid.teamId,
            amount: currentBid.amount,
            timestamp: Date.now()
          }
        ]
      };

      // Update both states synchronously
      setAuctions(prevAuctions =>
        prevAuctions.map(auction =>
          auction.id === currentAuction.id ? updatedAuction : auction
        )
      );
      setCurrentAuction(updatedAuction);
    } else {
      // No bid was placed, mark player as unsold
      const updatedAuction: Auction = {
        ...currentAuction,
        currentBid: null,
        currentPlayerId: null,
        unsoldPlayerIds: [...currentAuction.unsoldPlayerIds, currentPlayer.id],
        history: [
          ...currentAuction.history,
          {
            type: 'unsold' as const,
            playerId: currentPlayer.id,
            timestamp: Date.now()
          }
        ]
      };

      setCurrentAuction(updatedAuction);
      setAuctions(prevAuctions =>
        prevAuctions.map(auction =>
          auction.id === currentAuction.id ? updatedAuction : auction
        )
      );

      toast.success("Player Marked Unsold", {
        description: `${currentPlayer.name} has been marked as unsold.`,
      });
    }
  };

  const toggleAdmin = () => {
    setIsAdmin(prev => !prev);
    toast.success("Mode Changed", {
      description: `Switched to ${!isAdmin ? 'Admin' : 'User'} mode.`,
    });
  };

  return (
    <AuctionContext.Provider
      value={{
        auctions,
        currentAuction,
        isAdmin,
        validationError,
        createAuction,
        updateAuction,
        startAuction,
        completeAuction,
        setCurrentAuctionById,
        placeBid,
        updateBidAmount,
        markPlayerUnsold,
        nextPlayer,
        toggleAdmin,
      }}
    >
      {children}
    </AuctionContext.Provider>
  );
};
