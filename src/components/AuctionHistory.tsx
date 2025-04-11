
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuction } from "@/contexts/AuctionContext";
import { Auction, Player, Team } from "@/types";
import { DollarSign, Trophy, User, Users } from "lucide-react";

interface AuctionHistoryProps {
  auctionId: string;
}

const AuctionHistory = ({ auctionId }: AuctionHistoryProps) => {
  const { auctions, setCurrentAuction } = useAuction();
  const auction = auctions.find(a => a.id === auctionId);

  // If auction not found in context, try to set it
  if (!auction && auctionId) {
    setCurrentAuction(auctionId);
    return <div className="p-8 text-center">Loading auction data...</div>;
  }

  if (!auction) {
    return <div className="p-8 text-center">Auction not found</div>;
  }

  // Group history by player and get the final bid
  const playerSales = auction.history.reduce((acc, bid) => {
    if (!acc[bid.playerId] || bid.timestamp > acc[bid.playerId].timestamp) {
      acc[bid.playerId] = bid;
    }
    return acc;
  }, {} as { [playerId: string]: typeof auction.history[0] });

  // Convert to array for easier rendering
  const salesArray = Object.values(playerSales);

  // Get total spent by each team
  const teamSpending = auction.teams.reduce((acc, team) => {
    const spent = salesArray
      .filter(sale => sale.teamId === team.id)
      .reduce((sum, sale) => sum + sale.amount, 0);
    
    acc[team.id] = {
      teamId: team.id,
      teamName: team.name,
      spent,
      playerCount: salesArray.filter(sale => sale.teamId === team.id).length
    };
    
    return acc;
  }, {} as { [teamId: string]: { teamId: string, teamName: string, spent: number, playerCount: number } });

  // Sort teams by spending for leaderboard
  const teamLeaderboard = Object.values(teamSpending).sort((a, b) => b.spent - a.spent);

  // Calculate total auction value
  const totalAuctionValue = salesArray.reduce((sum, sale) => sum + sale.amount, 0);

  // Find highest value player
  const highestValueSale = salesArray.length > 0 
    ? salesArray.reduce((max, sale) => sale.amount > max.amount ? sale : max, salesArray[0])
    : null;
  
  const highestValuePlayer = highestValueSale 
    ? auction.playerPool.find(p => p.id === highestValueSale.playerId) 
    : null;

  const highestValueTeam = highestValueSale 
    ? auction.teams.find(t => t.id === highestValueSale.teamId) 
    : null;

  // Format date helpers
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  const formatDateTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const getDuration = (start?: number, end?: number) => {
    if (!start || !end) return 'N/A';
    const durationMs = end - start;
    const minutes = Math.floor(durationMs / 60000);
    const seconds = Math.floor((durationMs % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  return (
    <div className="container mx-auto p-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{auction.name}</h1>
        <p className="text-muted-foreground">
          Completed on {auction.completedAt ? formatDate(auction.completedAt) : 'Unknown date'}
        </p>
      </div>

      <div className="mb-8 rounded-lg bg-accentGold/10 p-6 md:p-8">
        <div className="mb-6 flex flex-col items-center justify-center text-center md:flex-row md:justify-between md:text-left">
          <div>
            <h2 className="mb-1 text-2xl font-bold">Auction Summary</h2>
            <p className="text-muted-foreground">
              Total value: ${totalAuctionValue} • {salesArray.length} players sold
            </p>
          </div>
          <Trophy className="mt-4 h-16 w-16 text-accentGold md:mt-0" />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="rounded-full bg-fieldGreen/10 p-3 text-fieldGreen">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Teams</p>
                <p className="text-2xl font-bold">{auction.teams.length}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="rounded-full bg-blue-500/10 p-3 text-blue-500">
                <User className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Players</p>
                <p className="text-2xl font-bold">{auction.playerPool.length}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="rounded-full bg-accentGold/10 p-3 text-accentGold">
                <DollarSign className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Highest Bid</p>
                <p className="text-2xl font-bold">
                  {highestValueSale ? `$${highestValueSale.amount}` : 'N/A'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div className="space-y-2 rounded-md bg-white p-4 shadow-sm md:col-span-2">
            <h3 className="font-medium">Auction Details</h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <div>
                <p className="text-muted-foreground">Created</p>
                <p>{formatDateTime(auction.createdAt)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Started</p>
                <p>{auction.startedAt ? formatDateTime(auction.startedAt) : 'N/A'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Completed</p>
                <p>{auction.completedAt ? formatDateTime(auction.completedAt) : 'N/A'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Duration</p>
                <p>{getDuration(auction.startedAt, auction.completedAt)}</p>
              </div>
              <div className="col-span-2">
                <p className="text-muted-foreground">Minimum Player Price</p>
                <p>${auction.minPlayerPrice}</p>
              </div>
            </div>
          </div>
          
          {highestValuePlayer && highestValueTeam && highestValueSale && (
            <div className="space-y-2 rounded-md bg-white p-4 shadow-sm">
              <h3 className="font-medium">Highest Value Player</h3>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-fieldGreen text-lg font-bold text-white">
                  {highestValuePlayer.name.substring(0, 1)}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{highestValuePlayer.name}</p>
                  <p className="text-sm text-muted-foreground">{highestValuePlayer.position}</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-accentGold">${highestValueSale.amount}</p>
                  <p className="text-xs text-muted-foreground">{highestValueTeam.name}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Team Leaderboard</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {teamLeaderboard.map((team, index) => (
                <div key={team.teamId} className="flex items-center rounded-md border p-3">
                  <div className="mr-4 flex h-8 w-8 items-center justify-center rounded-full bg-muted font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{team.teamName}</p>
                    <p className="text-sm text-muted-foreground">
                      {team.playerCount} players acquired
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">${team.spent}</p>
                    <p className="text-xs text-muted-foreground">total spent</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Player Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {salesArray
                .sort((a, b) => b.amount - a.amount)
                .slice(0, 5)
                .map(sale => {
                  const player = auction.playerPool.find(p => p.id === sale.playerId);
                  const team = auction.teams.find(t => t.id === sale.teamId);
                  if (!player || !team) return null;
                  
                  return (
                    <div key={sale.playerId} className="flex items-center rounded-md border p-3">
                      <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-fieldGreen text-sm font-bold text-white">
                        {player.name.substring(0, 1)}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{player.name}</p>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <span className="mr-1 inline-block h-2 w-2 rounded-full bg-fieldGreen"></span>
                          {player.position}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">${sale.amount}</p>
                        <p className="text-xs text-muted-foreground">{team.name}</p>
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      </div>

      <h2 className="mb-4 mt-8 text-2xl font-bold">All Player Sales</h2>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b text-left">
              <th className="whitespace-nowrap px-4 py-2 font-medium">Player</th>
              <th className="whitespace-nowrap px-4 py-2 font-medium">Position</th>
              <th className="whitespace-nowrap px-4 py-2 font-medium">Team</th>
              <th className="whitespace-nowrap px-4 py-2 font-medium text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {salesArray
              .sort((a, b) => b.amount - a.amount)
              .map(sale => {
                const player = auction.playerPool.find(p => p.id === sale.playerId);
                const team = auction.teams.find(t => t.id === sale.teamId);
                if (!player || !team) return null;
                
                return (
                  <tr key={sale.playerId} className="border-b">
                    <td className="whitespace-nowrap px-4 py-2 font-medium">{player.name}</td>
                    <td className="whitespace-nowrap px-4 py-2">{player.position}</td>
                    <td className="whitespace-nowrap px-4 py-2">{team.name}</td>
                    <td className="whitespace-nowrap px-4 py-2 text-right font-medium">${sale.amount}</td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AuctionHistory;
