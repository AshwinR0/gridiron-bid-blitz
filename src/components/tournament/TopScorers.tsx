
import React from 'react';
import { Tournament } from '@/types';
import { useAuction } from '@/contexts/AuctionContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Award, Soccer } from 'lucide-react';

interface TopScorersProps {
  tournament: Tournament;
}

const TopScorers: React.FC<TopScorersProps> = ({ tournament }) => {
  const { getAuction } = useAuction();
  const auction = tournament.auctionId ? getAuction(tournament.auctionId) : null;
  
  // Sort player stats by goals
  const topScorers = [...tournament.playerStats]
    .sort((a, b) => b.goals - a.goals)
    .slice(0, 20); // Show top 20 scorers
  
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
          <Soccer className="h-5 w-5 text-accentGold" />
          Top Goalscorers
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">Rank</TableHead>
              <TableHead>Player</TableHead>
              <TableHead>Team</TableHead>
              <TableHead className="text-center">Goals</TableHead>
              <TableHead className="text-center">Assists</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {topScorers.map((player, index) => (
              <TableRow key={player.playerId} className={index < 3 ? "bg-muted/50" : ""}>
                <TableCell className="font-medium">{index + 1}</TableCell>
                <TableCell>{getPlayerName(player.playerId)}</TableCell>
                <TableCell>{getTeamName(player.teamId)}</TableCell>
                <TableCell className="text-center font-bold">{player.goals}</TableCell>
                <TableCell className="text-center">{player.assists}</TableCell>
              </TableRow>
            ))}
            
            {topScorers.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                  No player stats available yet
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default TopScorers;
