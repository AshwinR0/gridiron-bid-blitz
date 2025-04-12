import React from 'react';
import { Tournament } from '@/types';
import { useAuction } from '@/contexts/AuctionContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield } from 'lucide-react';

interface GoalkeepersStatsProps {
  tournament: Tournament;
}

const GoalkeepersStats: React.FC<GoalkeepersStatsProps> = ({ tournament }) => {
  const { getAuction } = useAuction();
  const auction = tournament.auctionId ? getAuction(tournament.auctionId) : null;
  
  // Filter players by position (goalkeepers) and sort by clean sheets
  const goalkeepers = [...tournament.playerStats]
    .filter(player => {
      const playerDetails = auction?.playerPool.find(p => p.id === player.playerId);
      return playerDetails?.position === 'GK';
    })
    .sort((a, b) => b.cleanSheets - a.cleanSheets)
    .slice(0, 10); // Show top 10 goalkeepers
  
  const getPlayerName = (playerId: string) => {
    return auction?.playerPool.find(player => player.id === playerId)?.name || 'Unknown Player';
  };
  
  const getTeamName = (teamId: string) => {
    return auction?.teams.find(team => team.id === teamId)?.name || 'Unknown Team';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-accentGold" />
          Golden Glove Standings
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">Rank</TableHead>
              <TableHead>Goalkeeper</TableHead>
              <TableHead>Team</TableHead>
              <TableHead className="text-center">Clean Sheets</TableHead>
              <TableHead className="text-center">Yellow Cards</TableHead>
              <TableHead className="text-center">Red Cards</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {goalkeepers.map((player, index) => (
              <TableRow key={player.playerId} className={index < 3 ? "bg-muted/50" : ""}>
                <TableCell className="font-medium">{index + 1}</TableCell>
                <TableCell>{getPlayerName(player.playerId)}</TableCell>
                <TableCell>{getTeamName(player.teamId)}</TableCell>
                <TableCell className="text-center font-bold">{player.cleanSheets}</TableCell>
                <TableCell className="text-center">{player.yellowCards}</TableCell>
                <TableCell className="text-center">{player.redCards}</TableCell>
              </TableRow>
            ))}
            
            {goalkeepers.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                  No goalkeeper stats available yet
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default GoalkeepersStats;
