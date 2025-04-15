import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuction } from "@/contexts/AuctionContext";
import { Auction, Player, Team } from "@/types";
import { ArrowLeftRight, ChevronsRight, DollarSign, Users, Clock, Gavel, Trophy, Edit, Check, X, UserRound, Search } from "lucide-react";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AuctionInterfaceProps {
  auctionId: string;
}

const AuctionInterface = ({ auctionId }: AuctionInterfaceProps) => {
  const { auctions, currentAuction, setCurrentAuctionById, isAdmin, startAuction, completeAuction, placeBid, nextPlayer, updateBidAmount } = useAuction();
  const [editingBid, setEditingBid] = useState(false);
  const [editedBidAmount, setEditedBidAmount] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [positionFilter, setPositionFilter] = useState("all");
  const [teamFilter, setTeamFilter] = useState("all");

  // Set current auction when component mounts or auctionId changes
  useEffect(() => {
    if (auctionId && (!currentAuction || currentAuction.id !== auctionId)) {
      setCurrentAuctionById(auctionId);
    }
  }, [auctionId, currentAuction, setCurrentAuctionById]);

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

  // Handle saving edited bid amount
  const handleSaveEditedBid = () => {
    const amount = Number(editedBidAmount);
    if (isNaN(amount) || amount <= 0) {
      toast("Please enter a valid bid amount", {
        description: "Invalid bid amount entered"
      });
      return;
    }

    updateBidAmount(amount);
    setEditingBid(false);
  };

  // Find the current player being auctioned
  const currentPlayer = currentAuction.currentPlayerId
    ? currentAuction.players.find(p => p.id === currentAuction.currentPlayerId)
    : null;

  console.log(currentAuction)
  // Calculate maximum bid amount for each team
  const calculateMaxBid = (team: Team) => {
    const playersNeeded = Math.max(0, team.minPlayers - team.players.length);
    if (playersNeeded <= 1) {
      return team.remainingBudget;
    }

    // Reserve minimum budget for remaining required players
    const minBudgetNeeded = (playersNeeded - 1) * currentAuction.minPlayerPrice;
    return team.remainingBudget - minBudgetNeeded;
  };

  // Handle team bid
  const handleTeamBid = (teamId: string) => {
    if (!currentAuction.currentPlayerId) {
      toast("No player selected for bidding", {
        description: "Please select a player before placing a bid"
      });
      return;
    }

    // Determine the increment amount based on rules
    let incrementAmount = 1; // Default increment
    const currentBidAmount = currentAuction.currentBid?.amount || currentAuction.minPlayerPrice;

    if (currentAuction.bidIncrementRules && currentAuction.bidIncrementRules.length > 0) {
      for (const rule of currentAuction.bidIncrementRules) {
        if (currentBidAmount >= rule.minAmount && currentBidAmount <= rule.maxAmount) {
          incrementAmount = rule.increment;
          break;
        }
      }
    }

    // Calculate the new bid amount
    const newBidAmount = currentAuction.currentBid
      ? currentAuction.currentBid.amount + incrementAmount
      : currentAuction.minPlayerPrice;

    placeBid(teamId, newBidAmount);
  };

  // Get sold players
  const soldPlayers = currentAuction.history.filter(h => h.type === 'next_player').map(h => {
    const player = currentAuction.players.find(p => p.id === h.playerId);
    const team = currentAuction.teams.find(t => t.id === h.teamId);
    if (!player || !team) return null;
    return {
      playerId: h.playerId,
      teamId: h.teamId,
      amount: h.amount,
      timestamp: h.timestamp,
      type: h.type
    };
  }).filter(Boolean);

  // Create a set of sold player IDs for quick lookup
  const soldPlayerIds = new Set(soldPlayers.map(p => p.playerId));

  // Get remaining players (not sold yet)
  const remainingPlayers = currentAuction.players.filter(
    p => !soldPlayerIds.has(p.id) && p.id !== currentAuction.currentPlayerId
  );

  // Add this helper function
  const getIncrementAmount = (currentAmount: number) => {
    if (!currentAuction.bidIncrementRules || currentAuction.bidIncrementRules.length === 0) {
      return 1; // Default increment
    }

    for (const rule of currentAuction.bidIncrementRules) {
      if (currentAmount >= rule.minAmount && currentAmount <= rule.maxAmount) {
        return rule.increment;
      }
    }

    return 1; // Default increment if no rule matches
  };

  // Filter players based on search and filters
  const filterPlayers = (players: Player[]) => {
    return players.filter(player => {
      const matchesSearch = player.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPosition = positionFilter === "all" || player.position === positionFilter;
      const matchesTeam = teamFilter === "all" || (
        soldPlayers.some(sp => sp.playerId === player.id && sp.teamId === teamFilter)
      );
      return matchesSearch && matchesPosition && matchesTeam;
    });
  };

  // Apply filters to remaining players
  const filteredRemainingPlayers = filterPlayers(remainingPlayers);
  const filteredSoldPlayers = soldPlayers.filter(sold => {
    const player = currentAuction.players.find(p => p.id === sold.playerId);
    if (!player) return false;
    return filterPlayers([player]).length > 0;
  });

  { console.log('first') }

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
                  {currentPlayer.image ? (
                    <div className="mb-4 h-24 w-24 md:mb-0">
                      <img
                        src={currentPlayer.image}
                        alt={currentPlayer.name}
                        className="h-full w-full rounded-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-fieldGreen text-4xl font-bold text-white md:mb-0">
                      {currentPlayer.name.substring(0, 1)}
                    </div>
                  )}
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
                      {editingBid ? (
                        <div className="flex items-center space-x-2">
                          <Input
                            type="number"
                            value={editedBidAmount}
                            onChange={(e) => setEditedBidAmount(e.target.value)}
                            className="w-32"
                          />
                          <Button size="sm" onClick={handleSaveEditedBid}>
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setEditingBid(false)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <>
                          <span className="text-2xl font-bold">{currentAuction.currentBid.amount}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="ml-2"
                            onClick={() => {
                              setEditedBidAmount(currentAuction.currentBid!.amount.toString());
                              setEditingBid(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </>
                      )}
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
                    const player = currentAuction.players.find(p => p.id === bid.playerId);
                    const team = currentAuction.teams.find(t => t.id === bid.teamId);
                    if (!player || !team) return null;

                    return (
                      <div key={i} className="flex items-center justify-between rounded border p-2 text-sm">
                        <div className="flex items-center">
                          {player.image ? (
                            <img
                              src={player.image}
                              alt={player.name}
                              className="mr-2 h-8 w-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className="mr-2 flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                              <UserRound className="h-5 w-5 text-muted-foreground" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium">{player.name}</p>
                            <div className="flex items-center text-xs text-muted-foreground">
                              <ArrowLeftRight className="mr-1 h-3 w-3" />
                              {team.name}
                            </div>
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
                  <p className="text-3xl font-bold">{currentAuction.players.length}</p>
                  <p className="text-sm text-muted-foreground">Players</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                  <h3 className="mb-1 text-lg font-medium">Sold</h3>
                  <p className="text-3xl font-bold">{currentAuction.soldPlayerIds.length}</p>
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
            <div className="mb-6 grid gap-4 md:grid-cols-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search players..."
                  className="pl-9"
                  onChange={(e) => setSearchQuery(e.target.value)}
                  value={searchQuery}
                />
              </div>
              <Select value={positionFilter} onValueChange={setPositionFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by position" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Positions</SelectItem>
                  {Array.from(new Set(currentAuction.players.map(p => p.position))).map(position => (
                    <SelectItem key={position} value={position}>{position}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={teamFilter} onValueChange={setTeamFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by team" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Teams</SelectItem>
                  {currentAuction.teams.map(team => (
                    <SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {/* Current player (if any) */}
              {currentPlayer && filterPlayers([currentPlayer]).length > 0 && (
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
              {filteredSoldPlayers.map(sold => {
                const player = currentAuction.players.find(p => p.id === sold.playerId);
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
              {filteredRemainingPlayers.map(player => (
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
    type: 'bid' | 'unsold' | 'next_player';
    playerId?: string;
    teamId?: string;
    amount?: number;
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

  // Calculate max bid
  const maxBid = (() => {
    const playersNeeded = Math.max(0, team.minPlayers - teamPurchases.length);
    if (playersNeeded <= 1) {
      return team.remainingBudget;
    }

    // Reserve minimum budget for remaining required players
    const minBudgetNeeded = (playersNeeded - 1) * auction.minPlayerPrice;
    return team.remainingBudget - minBudgetNeeded;
  })();

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>{team.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground/80">Budget</span>
            <span className="font-medium text-foreground/90">{team.remainingBudget} / {team.budget}</span>
          </div>
          <div className="h-2 rounded-full bg-theme-dark/50 backdrop-blur-sm ring-1 ring-border/10">
            <div
              className="h-2 rounded-full bg-theme-accent transition-all"
              style={{ width: `${budgetPercentage}%` }}
            />
          </div>
        </div>
        <div className="mb-4 grid grid-cols-3 gap-2">
          <div className="rounded-md bg-theme-dark/50 backdrop-blur-sm p-3 text-center ring-1 ring-border/10">
            <p className="text-xs text-muted-foreground/80">Players</p>
            <p className="text-lg font-medium text-foreground/90">{teamPurchases.length}</p>
          </div>
          <div className="rounded-md bg-theme-dark/50 backdrop-blur-sm p-3 text-center ring-1 ring-border/10">
            <p className="text-xs text-muted-foreground/80">Needed</p>
            <p className="text-lg font-medium text-foreground/90">{neededPlayers}</p>
          </div>
          <div className="rounded-md bg-theme-dark/50 backdrop-blur-sm p-3 text-center ring-1 ring-border/10">
            <p className="text-xs text-muted-foreground/80">Max Bid</p>
            <p className="text-lg font-medium text-foreground/90">{maxBid}</p>
          </div>
        </div>

        <h4 className="mb-2 font-medium text-foreground/90">Acquired Players</h4>
        {team?.players.length > 0 ? (
          <div className="max-h-40 space-y-2 overflow-y-auto pr-1">
            {team?.players?.map(purchase => {
              const player = auction.players.find(p => p.id === purchase.playerId);
              if (!player) return null;

              return (
                <div key={player.id} className="flex items-center justify-between rounded-lg border border-border/5 bg-card/30 backdrop-blur-sm p-2 ring-1 ring-border/10">
                  <div className="flex items-center">
                    <div className="mr-2 h-8 w-8 rounded-full bg-theme-dark/50 backdrop-blur-sm text-center font-medium leading-8 ring-1 ring-border/10">
                      {player.name.substring(0, 1)}
                    </div>
                    <div>
                      <p className="font-medium text-foreground/90">{player.name}</p>
                      <p className="text-xs text-muted-foreground/80">{player.position}</p>
                    </div>
                  </div>
                  <span className="font-medium text-theme-accent">${purchase.purchaseAmount}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-center text-sm text-muted-foreground/80">No players acquired yet</p>
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
        return <span className="absolute right-2 top-2 rounded-full bg-theme-accent px-2 py-0.5 text-xs text-white animate-pulse">Current</span>;
      case 'sold':
        return <span className="absolute right-2 top-2 rounded-full bg-green-500/80 backdrop-blur-sm px-2 py-0.5 text-xs text-white">Sold</span>;
      case 'pending':
        return <span className="absolute right-2 top-2 rounded-full bg-muted/80 backdrop-blur-sm px-2 py-0.5 text-xs text-muted-foreground">Pending</span>;
    }
  };

  return (
    <Card className={`player-card ${status === 'current' ? 'border-theme-accent/20 bg-theme-accent/5 ring-theme-accent/20' : ''}`}>
      {getStatusBadge()}
      <CardContent className="p-4">
        <div className="mb-3 flex items-center">
          {player.image ? (
            <div className="mr-3 h-12 w-12">
              <img
                src={player.image}
                alt={player.name}
                className="h-full w-full rounded-full object-cover ring-2 ring-border/10"
              />
            </div>
          ) : (
            <div className="mr-3 flex h-12 w-12 items-center justify-center rounded-full bg-theme-dark/50 backdrop-blur-sm ring-2 ring-border/10">
              <UserRound className="h-6 w-6 text-muted-foreground" />
            </div>
          )}
          <div>
            <h4 className="font-bold text-foreground/90">{player.name}</h4>
            <p className="text-sm text-muted-foreground/80">{player.position}</p>
          </div>
        </div>

        {(bid && team) && (
          <div className="mb-2 rounded-lg border border-border/5 bg-card/30 backdrop-blur-sm p-2 ring-1 ring-border/10">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground/90">{team.name}</span>
              <span className="font-bold text-theme-accent">${bid.amount}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-3 gap-1">
          {player.stats && Object.entries(player.stats).map(([key, value]) => (
            <div key={key} className="rounded-md bg-theme-dark/50 backdrop-blur-sm p-2 text-center ring-1 ring-border/10">
              <p className="text-xs text-muted-foreground/80 capitalize">{key}</p>
              <p className="font-medium text-foreground/90">{value}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AuctionInterface;
