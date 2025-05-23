import React, { useState, useEffect } from 'react';
import { useAuction } from '@/contexts/AuctionContext';
import { Player, Team } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { toast } from "sonner";
import {
  DollarSign, Gavel, Search, Users, XCircle, CheckCircle, Filter, Edit, Check, X, UserRound
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ConfettiButton } from "@/registry/magicui/confetti";
import PlayerSoldModal from '@/components/PlayerSoldModal';

interface AuctionManagerProps {
  auctionId: string;
}

interface PlayerCardProps {
  player: Player;
  status: 'current' | 'sold' | 'pending';
  bid?: {
    amount: number;
    teamId: string;
  };
  team?: Team;
}

const AuctionManager = ({ auctionId }: AuctionManagerProps) => {
  const { auctions, setCurrentAuctionById, currentAuction, placeBid, nextPlayer, markPlayerUnsold, updateBidAmount, completeAuction } = useAuction();
  const [selectedPlayerForBidding, setSelectedPlayerForBidding] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [positionFilter, setPositionFilter] = useState<string | null>(null);
  const [editingBid, setEditingBid] = useState(false);
  const [editedBidAmount, setEditedBidAmount] = useState('');
  const [soldModalData, setSoldModalData] = useState<{ player: Player; team: Team; purchaseAmount: number } | null>(null);

  // Set current auction if not already set
  useEffect(() => {
    if (!currentAuction || currentAuction.id !== auctionId) {
      setCurrentAuctionById(auctionId);
    }
  }, [auctionId, currentAuction, setCurrentAuctionById]);

  if (!currentAuction) {
    return <div className="flex justify-center p-8">Loading auction details...</div>;
  }

  const auction = auctions.find(a => a.id === auctionId);
  if (!auction) {
    return <div className="p-8 text-center">Auction not found</div>;
  }

  // Get current player being auctioned
  const currentPlayer = selectedPlayerForBidding
    ? auction.players.find(p => p.id === selectedPlayerForBidding)
    : null;

  // Get teams for this auction
  const { teams } = auction;

  // Add this helper function at the top of the component
  const getIncrementAmount = (currentAmount: number) => {
    if (!auction.bidIncrementRules || auction.bidIncrementRules.length === 0) {
      return 1; // Default increment
    }

    for (const rule of auction.bidIncrementRules) {
      if (currentAmount >= rule.minAmount && currentAmount <= rule.maxAmount) {
        return rule.increment;
      }
    }

    return 1; // Default increment if no rule matches
  };

  // Calculate maximum bid amount for each team
  const calculateMaxBid = (team: Team) => {
    const playersNeeded = Math.max(0, team.minPlayers - team.players.length);
    if (playersNeeded <= 1) {
      return team.remainingBudget;
    }

    // Reserve minimum budget for remaining required players
    const minBudgetNeeded = (playersNeeded - 1) * auction.minPlayerPrice;
    return team.remainingBudget - minBudgetNeeded;
  };

  // Handle bid submission for a specific team
  const handleTeamBid = (teamId: string) => {
    if (!currentAuction.currentPlayerId) {
      toast.error("No player selected for bidding");
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

  // Move to next player and process current player
  const handleNextPlayer = () => {
    if (!selectedPlayerForBidding) {
      toast.error("Please select a player first");
      return;
    }

    if (auction.currentBid) {
      const soldPlayer = auction.players.find(p => p.id === selectedPlayerForBidding);
      const soldToTeam = auction.teams.find(t => t.id === auction.currentBid?.teamId);

      if (soldPlayer && soldToTeam) {
        // Remove from unsold list if the player was previously unsold
        if (unsoldPlayerIds.has(soldPlayer.id)) {
          auction.unsoldPlayerIds = auction.unsoldPlayerIds.filter(id => id !== soldPlayer.id);
        }

        setSoldModalData({
          player: soldPlayer,
          team: soldToTeam,
          purchaseAmount: auction.currentBid.amount
        });
      }
    }

    nextPlayer();
    setSelectedPlayerForBidding(null);
  };

  // Select a player for bidding
  const handleSelectPlayerForBidding = (playerId: string) => {
    if (currentAuction) {
      if (currentAuction) {
        currentAuction.currentPlayerId = playerId;
      }
    }
    setSelectedPlayerForBidding(playerId);
  };

  // Handle saving edited bid amount
  const handleSaveEditedBid = () => {
    const amount = Number(editedBidAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Invalid bid amount. Minimum bid should be 0");
      return;
    }

    // Get the current bidding team
    const currentTeam = auction.teams.find(t => t.id === auction.currentBid?.teamId);
    if (!currentTeam) {
      toast.error("Current bidding team not found");
      return;
    }

    // Calculate max bid for the current team
    const maxBid = calculateMaxBid(currentTeam);

    if (amount > maxBid) {
      toast.error(`Maximum bid amount for ${currentTeam.name} is ${maxBid}`);
      return;
    }

    updateBidAmount(amount);
    setEditingBid(false);
  };

  // Create a set of sold player IDs for quick lookup
  const soldPlayerIds = new Set(auction.soldPlayerIds || []);


  // Get unsold players (marked as unsold)
  const unsoldPlayerIds = new Set(auction.unsoldPlayerIds || []);

  // Get remaining players (not sold yet, not currently selected, and not marked as unsold)
  const remainingPlayers = auction.players.filter(
    p => !soldPlayerIds.has(p.id) &&
      p.id !== selectedPlayerForBidding &&
      !unsoldPlayerIds.has(p.id)
  );

  // Get all sold players
  const soldPlayers = auction.players.filter(
    p => soldPlayerIds.has(p.id)
  );

  // Get all unsold players
  const unsoldPlayers = auction.players.filter(
    p => unsoldPlayerIds.has(p.id)
  );

  // Group players by position
  const playersByPosition = auction.players.reduce((acc, player) => {
    const position = player.position;
    if (!acc[position]) {
      acc[position] = [];
    }
    acc[position].push(player);
    return acc;
  }, {} as Record<string, Player[]>);

  // Filter players based on search query and position filter
  const filterPlayers = (players: Player[]) => {
    if (!players) return [];
    return players.filter(player => {
      const matchesSearch = player.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPosition = positionFilter === null || player.position === positionFilter;
      return matchesSearch && matchesPosition;
    });
  };

  // Check if all players are sold
  const allPlayersSold = auction.players.every(player =>
    auction.soldPlayerIds.includes(player.id)
  );

  const handleCompleteAuction = () => {
    completeAuction(auctionId);
    toast.success("Auction completed successfully!");
  };

  return (
    <div className="space-y-6">
      {soldModalData && (
        <PlayerSoldModal
          player={soldModalData.player}
          team={soldModalData.team}
          purchaseAmount={soldModalData.purchaseAmount}
          onClose={() => setSoldModalData(null)}
        />
      )}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Auction Manager: {auction.name}</h2>
        <div className="flex space-x-2">
          {auction.status === 'active' && (
            allPlayersSold ? (
              <Button
                variant="default"
                onClick={handleCompleteAuction}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Complete Auction
              </Button>
            ) : (auction.currentBid ? (
              <ConfettiButton
                onClick={handleNextPlayer}
                disabled={auction.status !== 'active' || !selectedPlayerForBidding}
              >
                {"Sell"}
              </ConfettiButton>) :
              <Button
                variant='outline'
                onClick={handleNextPlayer}
                disabled={auction.status !== 'active' || !selectedPlayerForBidding}
              >
                {"Unsold"}
              </Button>
            )
          )}
        </div>
      </div>

      {auction.status === 'completed' ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5" />
              Teams and Allocated Players
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {auction.teams.map(team => {
                // Get players allocated to this team
                const teamPlayers = team.players.map(p => {
                  const player = auction.players.find(player => player.id === p.playerId);
                  return {
                    ...player,
                    purchaseAmount: p.purchaseAmount
                  };
                });

                // Calculate max bid
                const maxBid = calculateMaxBid(team);

                return (
                  <div key={team.id} className="border rounded-md overflow-hidden">
                    <div className="bg-muted p-3 flex justify-between items-center">
                      <h3 className="font-bold">{team.name}</h3>
                      <div className="text-sm">
                        <span className="font-medium">Budget:</span> {team.remainingBudget}/{team.budget}
                        <span className="ml-2 font-medium">Players:</span> {teamPlayers.length}/{team.minPlayers}
                        <span className="ml-2 font-medium">Max Bid:</span> {maxBid}
                      </div>
                    </div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Player</TableHead>
                          <TableHead>Position</TableHead>
                          <TableHead>Stats</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {teamPlayers.length > 0 ? (
                          teamPlayers.map(player => (
                            <TableRow key={player.id}>
                              <TableCell className="font-medium">{player.name}</TableCell>
                              <TableCell>{player.position}</TableCell>
                              <TableCell>
                                <div className="flex flex-wrap gap-1">
                                  {player.stats && Object.entries(player.stats).map(([key, value]) => (
                                    <span key={key} className="text-xs">
                                      {key}: {String(value)}
                                    </span>
                                  )).slice(0, 2)}
                                  {player.stats && Object.keys(player.stats).length > 2 &&
                                    <span className="text-xs text-muted-foreground">...</span>}
                                </div>
                              </TableCell>
                              <TableCell className="text-right font-medium text-green-600">
                                ${player.purchaseAmount}
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center text-muted-foreground">
                              No players purchased yet
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {auction.status === 'upcoming' && (
            <Card className="bg-amber-50 border-amber-200">
              <CardContent className="pt-6">
                <p>This auction has not started yet. Start the auction to begin bidding.</p>
              </CardContent>
            </Card>
          )}

          {auction.status === 'active' && (
            <>
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Gavel className="mr-2 h-5 w-5" />
                      Current Bidding
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {currentPlayer ? (
                      <div className="space-y-4">
                        <div className="flex items-center p-4 bg-muted rounded-lg">
                          {currentPlayer.image ? (
                            <div className="w-12 h-12 mr-4">
                              <img
                                src={currentPlayer.image}
                                alt={currentPlayer.name}
                                className="h-full w-full rounded-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mr-4">
                              <UserRound className="h-6 w-6 text-muted-foreground" />
                            </div>
                          )}
                          <div>
                            <h3 className="font-bold text-lg">{currentPlayer.name}</h3>
                            <p className="text-muted-foreground">{currentPlayer.position}</p>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {currentPlayer.stats && Object.entries(currentPlayer.stats).map(([key, value]) => (
                                <span key={key} className="px-2 py-1 bg-background border rounded text-xs">
                                  {key}: {String(value)}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="border-t pt-4">
                          <p className="text-sm font-medium mb-2">Current Bid:</p>
                          {auction.currentBid ? (
                            <div className="flex items-center">
                              <DollarSign className="h-5 w-5 text-accentGold mr-1" />
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
                                  <span className="text-xl font-bold">{auction.currentBid.amount}</span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="ml-2"
                                    onClick={() => {
                                      setEditedBidAmount(auction.currentBid!.amount.toString());
                                      setEditingBid(true);
                                    }}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                              <span className="ml-2 text-muted-foreground">by</span>
                              <span className="ml-1 font-medium">
                                {auction.teams.find(t => t.id === auction.currentBid?.teamId)?.name}
                              </span>
                            </div>
                          ) : (
                            <p className="text-muted-foreground">No bids yet. Starting price: {auction.minPlayerPrice}</p>
                          )}
                        </div>

                        <div className="border-t pt-4">
                          <p className="text-sm font-medium mb-2">Place Bid For Team:</p>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              {teams.map(team => {
                                // Calculate max bid for this team
                                const maxBid = calculateMaxBid(team);
                                const currentBidAmount = auction.currentBid?.amount || 0;
                                const incrementAmount = getIncrementAmount(currentBidAmount);
                                const nextBidAmount = currentBidAmount > 0
                                  ? currentBidAmount + incrementAmount
                                  : auction.minPlayerPrice;

                                // Check if team can bid
                                const canBid = maxBid >= nextBidAmount &&
                                  team.id !== auction.currentBid?.teamId &&
                                  team.players.length < team.minPlayers;
                                const isCurrentBidder = auction.currentBid?.teamId === team.id;

                                return (
                                  <div
                                    key={team.id}
                                    className={`relative rounded-lg ${!isCurrentBidder ? 'border border-border' : ''} p-4 transition-all hover:shadow-md`}
                                    style={isCurrentBidder ? { border: `2px solid ${team.color}` } : undefined}
                                  >
                                    <div className="space-y-2">
                                      <div className="flex justify-between items-center">
                                        <h3 className="font-bold text-lg">{team.name}</h3>
                                        <div
                                          className="w-4 h-4 rounded-full"
                                          style={{ backgroundColor: team.color }}
                                        />
                                      </div>
                                      <div className="space-y-1">
                                        <p className="text-sm text-muted-foreground">
                                          Budget: {team.remainingBudget}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                          Max Bid: {maxBid}
                                        </p>
                                      </div>
                                      <Button
                                        onClick={() => handleTeamBid(team.id)}
                                        disabled={!canBid || isCurrentBidder}
                                        className="w-full ring-1 ring-white/20"
                                        style={{
                                          backgroundColor: isCurrentBidder ? team.color : 'transparent',
                                          color: isCurrentBidder ? 'white' : team.color,
                                          border: `2px solid ${team.color}`,
                                          opacity: (!canBid || isCurrentBidder) ? 0.5 : 1
                                        }}
                                      >
                                        {isCurrentBidder ? 'Current Highest' : 'Place Bid'}
                                      </Button>
                                      {team.players.length >= team.minPlayers && (
                                        <p className="text-xs text-red-500 text-center mt-1">
                                          Max players reached
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-center py-8 text-muted-foreground">Select a player for bidding</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Users className="mr-2 h-5 w-5" />
                        Player Selection
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex space-x-2">
                        <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                          Selected: {selectedPlayerForBidding ? '1' : '0'}
                        </Badge>
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                          Sold: {soldPlayers.length}
                        </Badge>
                        <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
                          Unsold: {unsoldPlayers.length}
                        </Badge>
                        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                          Remaining: {remainingPlayers.length}
                        </Badge>
                      </div>

                      <div className="flex gap-2 items-center">
                        <div className="relative flex-1">
                          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Search players..."
                            className="pl-8"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                          />
                        </div>
                        <div className="flex-initial">
                          <select
                            className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                            value={positionFilter || ""}
                            onChange={(e) => setPositionFilter(e.target.value || null)}
                          >
                            <option value="">All Positions</option>
                            <option value="Forward">Forward</option>
                            <option value="Defence">Defence</option>
                            <option value="Goalkeeper">Goalkeeper</option>
                          </select>
                        </div>
                      </div>

                      <div className="max-h-[400px] overflow-y-auto border rounded-md">
                        {Object.entries(playersByPosition).map(([position, players]) => {
                          // Filter players by position and get available ones
                          const availablePlayers = filterPlayers((players as Player[]).filter(
                            p => auction.status === 'completed'
                              ? true  // Show all players when auction is completed
                              : !soldPlayerIds.has(p.id) &&
                              (p.id === selectedPlayerForBidding ||
                                (!selectedPlayerForBidding && !unsoldPlayerIds.has(p.id)) ||
                                unsoldPlayerIds.has(p.id))
                          ));

                          if (availablePlayers.length === 0) return null;

                          return (
                            <div key={position} className="border-b last:border-b-0">
                              <div className="p-2 bg-muted font-medium">{position}s ({availablePlayers.length})</div>
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Stats</TableHead>
                                    <TableHead className="text-right">
                                      {auction.status !== 'completed' && "Action"}
                                    </TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {availablePlayers.map(player => {
                                    // Determine player status
                                    let status = "Available";
                                    let statusClass = "text-blue-600";
                                    let statusIcon = null;

                                    if (auction.status === 'completed') {
                                      if (soldPlayerIds.has(player.id)) {
                                        const team = auction.teams.find(t =>
                                          t.players.some(p => p.playerId === player.id)
                                        );
                                        const purchaseAmount = team?.players.find(p => p.playerId === player.id)?.purchaseAmount;
                                        status = `Sold to ${team?.name} for $${purchaseAmount}`;
                                        statusClass = "text-green-600 font-medium";
                                        statusIcon = <CheckCircle className="h-4 w-4 inline mr-1 text-green-600" />;
                                      } else if (unsoldPlayerIds.has(player.id)) {
                                        status = "Unsold";
                                        statusClass = "text-red-600";
                                        statusIcon = <XCircle className="h-4 w-4 inline mr-1 text-red-600" />;
                                      }
                                    } else {
                                      if (player.id === selectedPlayerForBidding) {
                                        status = "Selected";
                                        statusClass = "text-amber-600 font-medium";
                                        statusIcon = <CheckCircle className="h-4 w-4 inline mr-1 text-amber-600" />;
                                      } else if (unsoldPlayerIds.has(player.id)) {
                                        status = "Unsold";
                                        statusClass = "text-red-600";
                                        statusIcon = <XCircle className="h-4 w-4 inline mr-1 text-red-600" />;
                                      }
                                    }

                                    return (
                                      <TableRow key={player.id}>
                                        <TableCell className="font-medium">{player.name}</TableCell>
                                        <TableCell className={statusClass}>
                                          {statusIcon}{status}
                                        </TableCell>
                                        <TableCell>
                                          <div className="grid grid-cols-3 gap-1">
                                            {player.stats && Object.entries(player.stats).map(([key, value]) => (
                                              <div key={key} className="rounded bg-muted p-1 text-center">
                                                <p className="text-xs capitalize">{key}</p>
                                                <p className="font-medium">{String(value)}</p>
                                              </div>
                                            ))}
                                          </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                          {auction.status !== 'completed' && (
                                            player.id === selectedPlayerForBidding ? (
                                              <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setSelectedPlayerForBidding(null)}
                                              >
                                                Deselect
                                              </Button>
                                            ) : (
                                              <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleSelectPlayerForBidding(player.id)}
                                              >
                                                Select
                                              </Button>
                                            )
                                          )}
                                        </TableCell>
                                      </TableRow>
                                    );
                                  })}
                                </TableBody>
                              </Table>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="mr-2 h-5 w-5" />
                    Teams and Allocated Players
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {auction.teams.map(team => {
                      // Get players allocated to this team
                      const teamPlayers = team.players.map(p => {
                        const player = auction.players.find(player => player.id === p.playerId);
                        return {
                          ...player,
                          purchaseAmount: p.purchaseAmount
                        };
                      });

                      // Calculate max bid
                      const maxBid = calculateMaxBid(team);

                      return (
                        <div key={team.id} className="border rounded-md overflow-hidden">
                          <div className="bg-muted p-3 flex justify-between items-center">
                            <h3 className="font-bold">{team.name}</h3>
                            <div className="text-sm">
                              <span className="font-medium">Budget:</span> {team.remainingBudget}/{team.budget}
                              <span className="ml-2 font-medium">Players:</span> {teamPlayers.length}/{team.minPlayers}
                              <span className="ml-2 font-medium">Max Bid:</span> {maxBid}
                            </div>
                          </div>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Player</TableHead>
                                <TableHead>Position</TableHead>
                                <TableHead>Stats</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {teamPlayers.length > 0 ? (
                                teamPlayers.map(player => (
                                  <TableRow key={player.id}>
                                    <TableCell className="font-medium">{player.name}</TableCell>
                                    <TableCell>{player.position}</TableCell>
                                    <TableCell>
                                      <div className="flex flex-wrap gap-1">
                                        {player.stats && Object.entries(player.stats).map(([key, value]) => (
                                          <span key={key} className="text-xs">
                                            {key}: {String(value)}
                                          </span>
                                        )).slice(0, 2)}
                                        {player.stats && Object.keys(player.stats).length > 2 &&
                                          <span className="text-xs text-muted-foreground">...</span>}
                                      </div>
                                    </TableCell>
                                    <TableCell className="text-right font-medium text-green-600">
                                      ${player.purchaseAmount}
                                    </TableCell>
                                  </TableRow>
                                ))
                              ) : (
                                <TableRow>
                                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                                    No players purchased yet
                                  </TableCell>
                                </TableRow>
                              )}
                            </TableBody>
                          </Table>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </>
      )}
    </div>
  );
};

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
          {player.image ? (
            <div className="mr-3 h-12 w-12">
              <img
                src={player.image}
                alt={player.name}
                className="h-full w-full rounded-full object-cover"
              />
            </div>
          ) : (
            <div className="mr-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted text-xl font-bold">
              {player.name.substring(0, 1)}
            </div>
          )}
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
              <p className="font-medium">{String(value)}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AuctionManager;
