
import React from 'react';
import { Tournament } from '@/types';
import { useAuction } from '@/contexts/AuctionContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy } from 'lucide-react';

interface TournamentTableProps {
  tournament: Tournament;
}

const TournamentTable: React.FC<TournamentTableProps> = ({ tournament }) => {
  const { getAuction } = useAuction();
  const auction = tournament.auctionId ? getAuction(tournament.auctionId) : null;

  // Sort table by points, then goal difference, then goals for
  const sortedTable = [...tournament.table].sort((a, b) => {
    if (a.points !== b.points) return b.points - a.points;
    const aGoalDiff = a.goalsFor - a.goalsAgainst;
    const bGoalDiff = b.goalsFor - b.goalsAgainst;
    if (aGoalDiff !== bGoalDiff) return bGoalDiff - aGoalDiff;
    return b.goalsFor - a.goalsFor;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-accentGold" />
          League Table
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">Pos</TableHead>
              <TableHead>Team</TableHead>
              <TableHead className="text-center">P</TableHead>
              <TableHead className="text-center">W</TableHead>
              <TableHead className="text-center">D</TableHead>
              <TableHead className="text-center">L</TableHead>
              <TableHead className="text-center">GF</TableHead>
              <TableHead className="text-center">GA</TableHead>
              <TableHead className="text-center">GD</TableHead>
              <TableHead className="text-center">Pts</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedTable.map((team, index) => {
              const teamName = auction?.teams.find(t => t.id === team.teamId)?.name || 'Unknown Team';
              const goalDifference = team.goalsFor - team.goalsAgainst;
              
              return (
                <TableRow key={team.teamId} className={index < 3 ? "bg-muted/50" : ""}>
                  <TableCell className="font-medium">{index + 1}</TableCell>
                  <TableCell>{teamName}</TableCell>
                  <TableCell className="text-center">{team.played}</TableCell>
                  <TableCell className="text-center">{team.won}</TableCell>
                  <TableCell className="text-center">{team.drawn}</TableCell>
                  <TableCell className="text-center">{team.lost}</TableCell>
                  <TableCell className="text-center">{team.goalsFor}</TableCell>
                  <TableCell className="text-center">{team.goalsAgainst}</TableCell>
                  <TableCell className="text-center">{goalDifference > 0 ? `+${goalDifference}` : goalDifference}</TableCell>
                  <TableCell className="text-center font-bold">{team.points}</TableCell>
                </TableRow>
              );
            })}
            
            {sortedTable.length === 0 && (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-6 text-muted-foreground">
                  No table data available yet
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default TournamentTable;
