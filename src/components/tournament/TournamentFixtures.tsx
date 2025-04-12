
import React from 'react';
import { Tournament } from '@/types';
import { useAuction } from '@/contexts/AuctionContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Flag } from 'lucide-react';

interface TournamentFixturesProps {
  tournament: Tournament;
}

const TournamentFixtures: React.FC<TournamentFixturesProps> = ({ tournament }) => {
  const { getAuction } = useAuction();
  const auction = tournament.auctionId ? getAuction(tournament.auctionId) : null;

  // Group fixtures by round or date
  const groupedFixtures = tournament.fixtures.reduce((acc, fixture) => {
    const key = fixture.round ? `Round ${fixture.round}` : new Date(fixture.date).toLocaleDateString();
    if (!acc[key]) acc[key] = [];
    acc[key].push(fixture);
    return acc;
  }, {} as Record<string, typeof tournament.fixtures>);

  // Sort keys by round number or date
  const sortedKeys = Object.keys(groupedFixtures).sort((a, b) => {
    if (a.startsWith('Round') && b.startsWith('Round')) {
      return parseInt(a.split(' ')[1]) - parseInt(b.split(' ')[1]);
    }
    return new Date(a).getTime() - new Date(b).getTime();
  });

  const getTeamName = (teamId: string) => {
    return auction?.teams.find(team => team.id === teamId)?.name || 'Unknown Team';
  };

  const getFixtureStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="outline" className="bg-green-50 text-green-700">Completed</Badge>;
      case 'in_progress':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700">In Progress</Badge>;
      default:
        return <Badge variant="outline" className="bg-gray-50 text-gray-700">Scheduled</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {tournament.fixtures.length === 0 ? (
        <Card>
          <CardContent className="pt-6 flex flex-col items-center justify-center min-h-[200px]">
            <Flag className="h-10 w-10 text-muted-foreground mb-3" />
            <p className="text-muted-foreground text-center">No fixtures available yet</p>
            <p className="text-sm text-muted-foreground text-center mt-1">
              Fixtures will be generated when the tournament starts
            </p>
          </CardContent>
        </Card>
      ) : (
        sortedKeys.map(key => (
          <Card key={key}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                {key}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {groupedFixtures[key].map(fixture => (
                  <div 
                    key={fixture.id} 
                    className="flex items-center justify-between border rounded-md p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1 flex items-center justify-end">
                      <span className="font-medium text-right">{getTeamName(fixture.homeTeamId)}</span>
                      {fixture.status === 'completed' && (
                        <span className="mx-2 text-lg font-bold">{fixture.homeScore}</span>
                      )}
                    </div>
                    
                    <div className="px-4 flex flex-col items-center">
                      {getFixtureStatusBadge(fixture.status)}
                      <span className="text-xs text-muted-foreground mt-1">
                        {new Date(fixture.date).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <div className="flex-1 flex items-center">
                      {fixture.status === 'completed' && (
                        <span className="mx-2 text-lg font-bold">{fixture.awayScore}</span>
                      )}
                      <span className="font-medium">{getTeamName(fixture.awayTeamId)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};

export default TournamentFixtures;
