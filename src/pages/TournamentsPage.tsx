
import React from 'react';
import { useParams } from 'react-router-dom';
import { useAuction } from '@/contexts/AuctionContext';
import TournamentDashboard from '@/components/tournament/TournamentDashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trophy, CalendarClock, Users, Flag } from 'lucide-react';

export const TournamentsList = () => {
  const { tournaments, getAuction } = useAuction();
  
  const getTournamentStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">Active</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 hover:bg-gray-50">Completed</Badge>;
      default:
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-50">Upcoming</Badge>;
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Tournaments</h1>
      </div>

      {tournaments.length === 0 ? (
        <div className="md:col-span-2 lg:col-span-3 p-8 text-center border rounded-lg bg-muted">
          <Trophy className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-medium mb-2">No Tournaments Available</h2>
          <p className="text-muted-foreground mb-4">Tournaments will be created when you create an auction with a tournament format</p>
          <Button asChild>
            <Link to="/admin/create-auction">
              Create New Auction & Tournament
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tournaments.map((tournament) => {
            const auction = getAuction(tournament.auctionId);
            return (
              <Card key={tournament.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">{tournament.name}</CardTitle>
                    {getTournamentStatusBadge(tournament.status)}
                  </div>
                  <CardDescription className="flex items-center text-sm">
                    <CalendarClock className="mr-1 h-4 w-4" />
                    Started {new Date(tournament.startDate).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="flex flex-col items-center justify-center p-2 bg-muted rounded">
                      <Users className="mb-1 h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{auction?.teams.length || 0}</span>
                      <span className="text-xs text-muted-foreground">Teams</span>
                    </div>
                    <div className="flex flex-col items-center justify-center p-2 bg-muted rounded">
                      <Flag className="mb-1 h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{tournament.fixtures.length}</span>
                      <span className="text-xs text-muted-foreground">Fixtures</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Format:</span>
                      <span className="font-medium capitalize">{tournament.type}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Auction:</span>
                      <span className="font-medium">{auction?.name || 'Unknown'}</span>
                    </div>
                  </div>
                </CardContent>
                <div className="p-4 pt-0">
                  <Button asChild className="w-full">
                    <Link to={`/tournaments/${tournament.id}`}>
                      <Trophy className="mr-2 h-4 w-4" />
                      View Tournament
                    </Link>
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export const TournamentPage = () => {
  return <TournamentDashboard />;
};
