
import React, { useState } from 'react';
import { useAuction } from '@/contexts/AuctionContext';
import { Player, Team } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import { DollarSign, Gavel, Users } from 'lucide-react';

interface AuctionManagerProps {
  auctionId: string;
}

const AuctionManager = ({ auctionId }: AuctionManagerProps) => {
  const { auctions, setCurrentAuction, currentAuction, placeBid, nextPlayer } = useAuction();
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');
  const [bidAmount, setBidAmount] = useState<string>('');

  // Set current auction if not already set
  React.useEffect(() => {
    if (!currentAuction || currentAuction.id !== auctionId) {
      setCurrentAuction(auctionId);
    }
  }, [auctionId, currentAuction, setCurrentAuction]);

  if (!currentAuction) {
    return <div className="flex justify-center p-8">Loading auction details...</div>;
  }

  const auction = auctions.find(a => a.id === auctionId);
  if (!auction) {
    return <div className="p-8 text-center">Auction not found</div>;
  }

  // Get current player being auctioned
  const currentPlayer = auction.currentPlayerId 
    ? auction.playerPool.find(p => p.id === auction.currentPlayerId) 
    : null;

  // Get teams for this auction
  const { teams } = auction;

  // Handle bid submission
  const handleBidSubmit = () => {
    if (!selectedTeamId) {
      toast({
        title: "Error",
        description: "Please select a team first",
        variant: "destructive"
      });
      return;
    }

    const amount = Number(bidAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid bid amount",
        variant: "destructive"
      });
      return;
    }

    placeBid(selectedTeamId, amount);
    setBidAmount('');
  };

  // Move to next player
  const handleNextPlayer = () => {
    nextPlayer();
  };

  // Get players that have been sold
  const soldPlayers = auction.history.filter(h => {
    // Get the last bid for each player
    const playerBids = auction.history.filter(bid => bid.playerId === h.playerId);
    const lastBid = playerBids[playerBids.length - 1];
    return lastBid.teamId === h.teamId && lastBid.amount === h.amount;
  });

  // Create a set of sold player IDs for quick lookup
  const soldPlayerIds = new Set(soldPlayers.map(p => p.playerId));

  // Get remaining players (not sold yet)
  const remainingPlayers = auction.playerPool.filter(
    p => !soldPlayerIds.has(p.id) && p.id !== auction.currentPlayerId
  );

  // Group players by position
  const playersByPosition = auction.playerPool.reduce((acc, player) => {
    const position = player.position;
    if (!acc[position]) {
      acc[position] = [];
    }
    acc[position].push(player);
    return acc;
  }, {} as Record<string, Player[]>);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Auction Manager: {auction.name}</h2>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={handleNextPlayer}
            disabled={auction.status !== 'active'}
          >
            Next Player
          </Button>
        </div>
      </div>

      {auction.status === 'upcoming' && (
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="pt-6">
            <p>This auction has not started yet. Start the auction to begin bidding.</p>
          </CardContent>
        </Card>
      )}

      {auction.status === 'completed' && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <p>This auction has been completed. View the results below.</p>
          </CardContent>
        </Card>
      )}

      {auction.status === 'active' && (
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
                    <div className="w-12 h-12 rounded-full bg-fieldGreen text-white flex items-center justify-center text-xl font-bold mr-4">
                      {currentPlayer.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{currentPlayer.name}</h3>
                      <p className="text-muted-foreground">{currentPlayer.position}</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {currentPlayer.stats && Object.entries(currentPlayer.stats).map(([key, value]) => (
                          <span key={key} className="px-2 py-1 bg-background border rounded text-xs">
                            {key}: {value}
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
                        <span className="text-xl font-bold">{auction.currentBid.amount}</span>
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
                    <p className="text-sm font-medium mb-2">Place New Bid:</p>
                    <div className="grid grid-cols-4 gap-4">
                      <div className="col-span-2">
                        <Select onValueChange={setSelectedTeamId} value={selectedTeamId}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Team" />
                          </SelectTrigger>
                          <SelectContent>
                            {teams.map(team => {
                              const minRequired = auction.minPlayerPrice * Math.max(0, team.minPlayers - team.players.length);
                              const maxBid = team.remainingBudget - minRequired;
                              return (
                                <SelectItem key={team.id} value={team.id} disabled={maxBid < auction.minPlayerPrice}>
                                  {team.name} (Budget: {team.remainingBudget})
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Input
                          type="number"
                          placeholder="Bid amount"
                          value={bidAmount}
                          onChange={(e) => setBidAmount(e.target.value)}
                          min={auction.currentBid ? auction.currentBid.amount + 1 : auction.minPlayerPrice}
                        />
                      </div>
                      <div>
                        <Button 
                          className="w-full"
                          onClick={handleBidSubmit}
                          disabled={!selectedTeamId || !bidAmount}
                        >
                          Place Bid
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-center py-8 text-muted-foreground">No player currently selected for bidding</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="mr-2 h-5 w-5" />
                Player Pool
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex space-x-2">
                  <div className="px-2 py-1 rounded-full bg-amber-100 text-amber-800 text-xs">
                    Current: {currentPlayer ? 1 : 0}
                  </div>
                  <div className="px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs">
                    Sold: {soldPlayers.length}
                  </div>
                  <div className="px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-xs">
                    Remaining: {remainingPlayers.length}
                  </div>
                </div>

                <div className="max-h-[400px] overflow-y-auto border rounded-md">
                  {Object.entries(playersByPosition).map(([position, players]) => (
                    <div key={position} className="border-b last:border-b-0">
                      <div className="p-2 bg-muted font-medium">{position}s ({players.length})</div>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Stats</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {players.map(player => {
                            // Determine player status
                            let status = "Available";
                            let statusClass = "text-blue-600";
                            
                            if (player.id === currentPlayer?.id) {
                              status = "Current";
                              statusClass = "text-amber-600 font-medium";
                            } else if (soldPlayerIds.has(player.id)) {
                              status = "Sold";
                              statusClass = "text-green-600";
                            }

                            return (
                              <TableRow key={player.id}>
                                <TableCell className="font-medium">{player.name}</TableCell>
                                <TableCell className={statusClass}>{status}</TableCell>
                                <TableCell>
                                  <div className="flex flex-wrap gap-1">
                                    {player.stats && Object.entries(player.stats).map(([key, value]) => (
                                      <span key={key} className="text-xs">
                                        {key}: {value}
                                      </span>
                                    )).slice(0, 2)}
                                    {player.stats && Object.keys(player.stats).length > 2 && 
                                      <span className="text-xs text-muted-foreground">...</span>}
                                  </div>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

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
                const player = auction.playerPool.find(player => player.id === p.playerId);
                return { 
                  ...player, 
                  purchaseAmount: p.purchaseAmount 
                };
              });

              return (
                <div key={team.id} className="border rounded-md overflow-hidden">
                  <div className="bg-muted p-3 flex justify-between items-center">
                    <h3 className="font-bold">{team.name}</h3>
                    <div className="text-sm">
                      <span className="font-medium">Budget:</span> {team.remainingBudget}/{team.budget} 
                      <span className="ml-2 font-medium">Players:</span> {teamPlayers.length}/{team.minPlayers}
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
                                    {key}: {value}
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
    </div>
  );
};

export default AuctionManager;
