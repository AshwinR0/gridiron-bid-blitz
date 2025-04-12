
import React, { useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuction } from '@/contexts/AuctionContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarClock, Clock, DollarSign, Eye, Users } from 'lucide-react';
import AuctionInterface from '@/components/AuctionInterface';

const AuctionsPage: React.FC = () => {
  const { auctions, setCurrentAuction } = useAuction();
  const navigate = useNavigate();

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Auctions</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {auctions.map((auction) => (
          <Card key={auction.id} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-xl">{auction.name}</CardTitle>
                {getAuctionStatusBadge(auction.status)}
              </div>
              <CardDescription className="flex items-center text-sm">
                <CalendarClock className="mr-1 h-4 w-4" />
                Created {new Date(auction.createdAt).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="flex flex-col items-center justify-center p-2 bg-muted rounded">
                  <Users className="mb-1 h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{auction.teams.length}</span>
                  <span className="text-xs text-muted-foreground">Teams</span>
                </div>
                <div className="flex flex-col items-center justify-center p-2 bg-muted rounded">
                  <Users className="mb-1 h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{auction.playerPool.length}</span>
                  <span className="text-xs text-muted-foreground">Players</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Min. Player Price:</span>
                  <span className="font-medium">${auction.minPlayerPrice}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Total Sold:</span>
                  <span className="font-medium">
                    {(() => {
                      const soldPlayerIds = new Set(auction.soldPlayerIds || []);
                      return auction.playerPool.filter(p => soldPlayerIds.has(p.id)).length;
                    })()} players
                  </span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-2">
              <Button
                className="w-full"
                onClick={() => navigate(`/auctions/${auction.id}`)}
              >
                <Eye className="mr-2 h-4 w-4" />
                View Auction
              </Button>
            </CardFooter>
          </Card>
        ))}

        {auctions.length === 0 && (
          <div className="md:col-span-2 lg:col-span-3 p-8 text-center border rounded-lg bg-muted">
            <h2 className="text-xl font-medium mb-2">No Auctions Available</h2>
            <p className="text-muted-foreground mb-4">There are currently no auctions to display</p>
          </div>
        )}
      </div>
    </div>
  );
};

const AuctionPage: React.FC = () => {
  const { auctionId } = useParams<{ auctionId: string }>();
  const { auctions, setCurrentAuction } = useAuction();
  const navigate = useNavigate();

  useEffect(() => {
    if (auctionId) {
      setCurrentAuction(auctionId);
    }
  }, [auctionId, setCurrentAuction]);

  const auction = auctions.find(a => a.id === auctionId);

  if (!auction) {
    return (
      <div className="container mx-auto p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Auction Not Found</h1>
        <p className="mb-6">The auction you're looking for doesn't exist or has been removed.</p>
        <Button onClick={() => navigate('/auctions')}>Return to Auctions</Button>
      </div>
    );
  }

  return <AuctionInterface auctionId={auctionId || ''} />;
};

// Helper function to render auction status badge
const getAuctionStatusBadge = (status: string) => {
  switch (status) {
    case 'upcoming':
      return <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-50">Upcoming</Badge>;
    case 'active':
      return <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">Active</Badge>;
    case 'completed':
      return <Badge variant="outline" className="bg-gray-50 text-gray-700 hover:bg-gray-50">Completed</Badge>;
    default:
      return null;
  }
};

export { AuctionsPage, AuctionPage };
