
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuction } from "@/contexts/AuctionContext";
import { Auction, Player, Team } from "@/types";
import { ArrowLeftRight, ChevronsRight, DollarSign, Users, Clock, Gavel, Trophy } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";

interface AuctionInterfaceProps {
  auctionId: string;
}

const AuctionInterface = ({ auctionId }: AuctionInterfaceProps) => {
  const { auctions, currentAuction, setCurrentAuction, isAdmin, startAuction, completeAuction, placeBid, nextPlayer } = useAuction();
  const [customBidAmount, setCustomBidAmount] = useState("");
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);

  // If no current auction, try to set it
  if (!currentAuction && auctionId) {
    setCurrentAuction(auctionId);
  }

  if (!currentAuction) {
    return <div className="p-8 text-center">Auction not found</div>;
  }

  const handleStartAuction = () => {
    startAuction(currentAuction.id);
  };

  const handleCompleteAuction = () => {
    completeAuction(currentAuction.id);
  };

  const handleNextPlayer = () => {
    nextPlayer();
  };

  const handlePlaceBid = () => {
    if (!selectedTeamId) {
      toast({
        title: "Error",
        description: "Please select a team first",
        variant: "destructive"
      });
      return;
    }

    const amount = Number(customBidAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid bid amount",
        variant: "destructive"
      });
      return;
    }

    placeBid(selectedTeamId, amount);
    setCustomBidAmount("");
  };

  // Find the current player being auctioned
  const currentPlayer = currentAuction.currentPlayerId 
    ? currentAuction.playerPool.find(p => p.id === currentAuction.currentPlayerId) 
    : null;

  // Get sold players
  const soldPlayers = currentAuction.history.filter(h => {
    // Get the last bid for each player
    const playerBids = currentAuction.history.filter(bid => bid.playerId === h.playerId);
    const lastBid = playerBids[playerBids.length - 1];
    return lastBid.teamId === h.teamId && lastBid.amount === h.amount;
  });

  // Create a set of sold player IDs for quick lookup
  const soldPlayerIds = new Set(soldPlayers.map(p => p.playerId));

  // Get remaining players (not sold yet)
  const remainingPlayers = currentAuction.playerPool.filter(
    p => !soldPlayerIds.has(p.id) && p.id !== currentAuction.currentPlayerId
  );

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold">{currentAuction.name}</h1>
          <p className="text-muted-foreground capitalize">Status: {currentAuction.status}</p>
        </div>

        <div className="flex space-x-2">
          {currentAuction.status === 'upcoming' && isAdmin && (
            <Button onClick={handleStartAuction} className="bg-fieldGreen hover:bg-fieldGreen-dark">
              Start Auction
            </Button>
          )}
          {currentAuction.status === 'active' && isAdmin && (
            <Button onClick={handleCompleteAuction} variant="outline">
              End Auction
            </Button>
          )}
        </div>
      </div>

      {currentAuction.status === 'upcoming' && (
        <div className="my-8 rounded-lg border border-dashed border-muted-foreground p-8 text-center">
          <h2 className="mb-4 text-2xl font-semibold">Auction Setup Complete</h2>
          <p className="mb-6 text-muted-foreground">
            This auction has been created and is ready to start. 
            {isAdmin 
              ? " As an admin, you can start the auction when all participants are ready."
              : " Please wait for the admin to start the auction."
            }
          </p>
          {isAdmin && (
            <Button onClick={handleStartAuction} size="lg">Start Bidding Now</Button>
          )}
        </div>
      )}

      {currentAuction.status === 'completed' && (
        <div className="mb-8 rounded-lg bg-accentGold/10 p-8 text-center">
          <Trophy className="mx-auto mb-4 h-16 w-16 text-accentGold" />
          <h2 className="mb-2 text-2xl font-semibold">Auction Completed</h2>
          <p className="mb-6 text-muted-foreground">
            This auction has been completed. You can view the results below.
          </p>
        </div>
      )}

      {currentAuction.status === 'active' && (
        <div className="mb-6 grid gap-6 md:grid-cols-3">
          <Card className="md:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between">
                <span>Current Player</span>
                {isAdmin && (
                  <Button size="sm" onClick={handleNextPlayer} className="flex items-center gap-1">
                    Next Player <ChevronsRight className="h-4 w-4" />
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            {currentPlayer ? (
              <CardContent>
                <div className="flex flex-col items-center rounded-lg bg-muted p-6 md:flex-row md:gap-8">
                  <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-fieldGreen text-4xl font-bold text-white md:mb-0">
                    {currentPlayer.name.substring(0, 1)}
                  </div>
                  <div className="text-center md:text-left">
                    <h3 className="text-2xl font-bold">{currentPlayer.name}</h3>
                    <p className="mb-2 text-muted-foreground">{currentPlayer.position}</p>
                    
                    <div className="flex flex-wrap gap-3">
                      {currentPlayer.stats && Object.entries(currentPlayer.stats).map(([key, value]) => (
                        <div key={key} className="stat-box min-w-20">
                          <div className="text-xs uppercase">{key}</div>
                          <div className="text-lg font-semibold">{value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <h4 className="mb-2 font-medium">Current Bid</h4>
                  {currentAuction.currentBid ? (
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-accentGold" />
                      <span className="text-2xl font-bold">{currentAuction.currentBid.amount}</span>
                      <span className="text-muted-foreground">by</span>
                      <span className="font-medium">
                        {currentAuction.teams.find(t => t.id === currentAuction.currentBid?.teamId)?.name}
                      </span>
                    </div>
                  ) : (
                    <div className="text-muted-foreground">
                      No bids yet. Starting price: {currentAuction.minPlayerPrice}
                    </div>
                  )}
                </div>

                {!isAdmin && (
                  <div className="mt-6 space-y-4">
                    <h4 className="font-medium">Place Your Bid</h4>
                    <div className="grid gap-4 md:grid-cols-5">
                      <div className="md:col-span-2">
                        <Select onValueChange={(value) => setSelectedTeamId(value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Team" />
                          </SelectTrigger>
                          <SelectContent>
                            {currentAuction.teams.map(team => (
                              <SelectItem key={team.id} value={team.id}>
                                {team.name} (Budget: {team.remainingBudget})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="md:col-span-2">
                        <Input
                          type="number"
                          placeholder="Enter bid amount"
                          value={customBidAmount}
                          onChange={(e) => setCustomBidAmount(e.target.value)}
                          min={currentAuction.currentBid 
                            ? currentAuction.currentBid.amount + 1 
                            : currentAuction.minPlayerPrice}
                        />
                      </div>
                      <div>
                        <Button 
                          className="w-full" 
                          onClick={handlePlaceBid}
                          disabled={!selectedTeamId || !customBidAmount}
                        >
                          Bid
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-2">
                      {[5, 10, 25, 50].map(amount => {
                        const bidAmount = (currentAuction.currentBid?.amount || currentAuction.minPlayerPrice) + amount;
                        return (
                          <Button 
                            key={amount} 
                            variant="outline" 
                            onClick={() => {
                              if (selectedTeamId) {
                                placeBid(selectedTeamId, bidAmount);
                              } else {
                                toast({
                                  title: "Error",
                                  description: "Please select a team first",
                                  variant: "destructive"
                                });
                              }
                            }}
                            disabled={!selectedTeamId}
                          >
                            +{amount}
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            ) : (
              <CardContent>
                <div className="p-6 text-center text-muted-foreground">
                  No player currently active for bidding
                </div>
              </CardContent>
            )}
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="mr-2 h-5 w-5" />
                Bid History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {currentAuction.history.length > 0 ? (
                <div className="max-h-72 space-y-3 overflow-y-auto pr-2">
                  {[...currentAuction.history].reverse().map((bid, i) => {
                    const player = currentAuction.playerPool.find(p => p.id === bid.playerId);
                    const team = currentAuction.teams.find(t => t.id === bid.teamId);
                    if (!player || !team) return null;
                    
                    return (
                      <div key={i} className="flex items-center justify-between rounded border p-2 text-sm">
                        <div>
                          <p className="font-medium">{player.name}</p>
                          <div className="flex items-center text-xs text-muted-foreground">
                            <ArrowLeftRight className="mr-1 h-3 w-3" />
                            {team.name}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-fieldGreen">${bid.amount}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(bid.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-4 text-center text-muted-foreground">
                  No bids yet
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {(currentAuction.status === 'active' || currentAuction.status === 'completed') && (
        <Tabs defaultValue="teams" className="mt-8">
          <TabsList className="w-full">
            <TabsTrigger value="teams" className="flex-1">
              <Users className="mr-2 h-4 w-4" />
              Teams
            </TabsTrigger>
            <TabsTrigger value="players" className="flex-1">
              <Gavel className="mr-2 h-4 w-4" />
              Player Pool
            </TabsTrigger>
          </TabsList>
          <TabsContent value="teams" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {currentAuction.teams.map(team => (
                <TeamCard 
                  key={team.id} 
                  team={team} 
                  auction={currentAuction}
                  soldPlayers={soldPlayers}
                />
              ))}
            </div>
          </TabsContent>
          <TabsContent value="players" className="mt-6">
            <div className="mb-4 grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                  <h3 className="mb-1 text-lg font-medium">Total</h3>
                  <p className="text-3xl font-bold">{currentAuction.playerPool.length}</p>
                  <p className="text-sm text-muted-foreground">Players</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                  <h3 className="mb-1 text-lg font-medium">Sold</h3>
                  <p className="text-3xl font-bold">{soldPlayers.length}</p>
                  <p className="text-sm text-muted-foreground">Players</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                  <h3 className="mb-1 text-lg font-medium">Remaining</h3>
                  <p className="text-3xl font-bold">{remainingPlayers.length + (currentPlayer ? 1 : 0)}</p>
                  <p className="text-sm text-muted-foreground">Players</p>
                </CardContent>
              </Card>
            </div>

            <h3 className="mb-4 text-xl font-bold">Player Pool</h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {/* Current player (if any) */}
              {currentPlayer && (
                <PlayerCard 
                  player={currentPlayer} 
                  status="current" 
                  bid={currentAuction.currentBid}
                  team={currentAuction.currentBid 
                    ? currentAuction.teams.find(t => t.id === currentAuction.currentBid?.teamId) 
                    : undefined}
                />
              )}
              
              {/* Sold players */}
              {soldPlayers.map(sold => {
                const player = currentAuction.playerPool.find(p => p.id === sold.playerId);
                const team = currentAuction.teams.find(t => t.id === sold.teamId);
                if (!player || !team) return null;
                
                return (
                  <PlayerCard 
                    key={player.id} 
                    player={player} 
                    status="sold" 
                    bid={{ amount: sold.amount, teamId: team.id }}
                    team={team}
                  />
                );
              })}
              
              {/* Remaining players */}
              {remainingPlayers.map(player => (
                <PlayerCard 
                  key={player.id}
                  player={player}
                  status="pending"
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

interface TeamCardProps {
  team: Team;
  auction: Auction;
  soldPlayers: Array<{
    playerId: string;
    teamId: string;
    amount: number;
    timestamp: number;
  }>;
}

const TeamCard = ({ team, auction, soldPlayers }: TeamCardProps) => {
  // Get players purchased by this team
  const teamPurchases = soldPlayers.filter(sold => sold.teamId === team.id);
  
  // Calculate needed players
  const neededPlayers = Math.max(0, team.minPlayers - teamPurchases.length);
  
  // Calculate budget usage
  const spentBudget = team.budget - team.remainingBudget;
  const budgetPercentage = (spentBudget / team.budget) * 100;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>{team.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Budget</span>
            <span className="font-medium">{team.remainingBudget} / {team.budget}</span>
          </div>
          <div className="h-2 rounded-full bg-muted">
            <div 
              className="h-2 rounded-full bg-fieldGreen" 
              style={{ width: `${budgetPercentage}%` }} 
            />
          </div>
        </div>
        
        <div className="mb-4 grid grid-cols-2 gap-2">
          <div className="rounded-md bg-muted p-3 text-center">
            <p className="text-xs text-muted-foreground">Players</p>
            <p className="text-lg font-medium">{teamPurchases.length}</p>
          </div>
          <div className="rounded-md bg-muted p-3 text-center">
            <p className="text-xs text-muted-foreground">Needed</p>
            <p className="text-lg font-medium">{neededPlayers}</p>
          </div>
        </div>

        <h4 className="mb-2 font-medium">Acquired Players</h4>
        {teamPurchases.length > 0 ? (
          <div className="max-h-40 space-y-2 overflow-y-auto pr-1">
            {teamPurchases.map(purchase => {
              const player = auction.playerPool.find(p => p.id === purchase.playerId);
              if (!player) return null;
              
              return (
                <div key={player.id} className="flex items-center justify-between rounded border p-2">
                  <div className="flex items-center">
                    <div className="mr-2 h-8 w-8 rounded-full bg-muted text-center font-medium leading-8">
                      {player.name.substring(0, 1)}
                    </div>
                    <div>
                      <p className="font-medium">{player.name}</p>
                      <p className="text-xs text-muted-foreground">{player.position}</p>
                    </div>
                  </div>
                  <span className="font-medium text-fieldGreen">${purchase.amount}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-center text-sm text-muted-foreground">No players acquired yet</p>
        )}
      </CardContent>
    </Card>
  );
};

interface PlayerCardProps {
  player: Player;
  status: 'current' | 'sold' | 'pending';
  bid?: {
    amount: number;
    teamId: string;
  };
  team?: Team;
}

const PlayerCard = ({ player, status, bid, team }: PlayerCardProps) => {
  const getStatusBadge = () => {
    switch (status) {
      case 'current':
        return <span className="absolute right-2 top-2 rounded-full bg-orange-500 px-2 py-0.5 text-xs text-white animate-pulse">Current</span>;
      case 'sold':
        return <span className="absolute right-2 top-2 rounded-full bg-green-500 px-2 py-0.5 text-xs text-white">Sold</span>;
      case 'pending':
        return <span className="absolute right-2 top-2 rounded-full bg-gray-200 px-2 py-0.5 text-xs">Pending</span>;
    }
  };

  return (
    <Card className={`player-card ${status === 'current' ? 'border-accentGold bg-accentGold/5' : ''}`}>
      {getStatusBadge()}
      <CardContent className="p-4">
        <div className="mb-3 flex items-center">
          <div className="mr-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted text-xl font-bold">
            {player.name.substring(0, 1)}
          </div>
          <div>
            <h4 className="font-bold">{player.name}</h4>
            <p className="text-sm text-muted-foreground">{player.position}</p>
          </div>
        </div>

        {(bid && team) && (
          <div className="mb-2 rounded border p-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{team.name}</span>
              <span className="font-bold text-fieldGreen">${bid.amount}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-3 gap-1">
          {player.stats && Object.entries(player.stats).map(([key, value]) => (
            <div key={key} className="rounded bg-muted p-1 text-center">
              <p className="text-xs capitalize">{key}</p>
              <p className="font-medium">{value}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// These are custom implementations for components to avoid import errors
const Select = ({ children, onValueChange }: { children: React.ReactNode, onValueChange: (value: string) => void }) => {
  return <div className="relative">{children}</div>;
};

const SelectTrigger = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring">
      {children}
      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="6 9 12 15 18 9"></polyline>
      </svg>
    </div>
  );
};

const SelectValue = ({ placeholder }: { placeholder: string }) => {
  return <span className="text-muted-foreground">{placeholder}</span>;
};

const SelectContent = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="absolute left-0 z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-popover text-popover-foreground shadow-md">
      <div className="p-1">{children}</div>
    </div>
  );
};

const SelectItem = ({ value, children }: { value: string, children: React.ReactNode }) => {
  return (
    <div className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground">
      {children}
    </div>
  );
};

export default AuctionInterface;
