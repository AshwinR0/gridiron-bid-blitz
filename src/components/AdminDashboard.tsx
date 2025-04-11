
import React, { useState } from 'react';
import { useAuction } from '@/contexts/AuctionContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarClock, Clock, DollarSign, FileEdit, Gavel, LucidePlus, PlayCircle, User, UserPlus, Users } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import AuctionManager from './AuctionManager';

const AdminDashboard = () => {
  const { auctions, isAdmin, startAuction, completeAuction } = useAuction();
  const [selectedAuctionId, setSelectedAuctionId] = useState<string | null>(null);
  const navigate = useNavigate();

  if (!isAdmin) {
    return (
      <div className="container mx-auto p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p className="mb-6">You don't have administrator access to view this page.</p>
        <Button onClick={() => navigate('/')}>Return to Home</Button>
      </div>
    );
  }

  const handleManageAuction = (auctionId: string) => {
    setSelectedAuctionId(auctionId);
  };

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

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Button asChild>
          <Link to="/admin/create-auction">
            <LucidePlus className="mr-2 h-4 w-4" />
            Create New Auction
          </Link>
        </Button>
      </div>

      {selectedAuctionId ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => setSelectedAuctionId(null)}>
              ← Back to Auctions
            </Button>
          </div>
          <AuctionManager auctionId={selectedAuctionId} />
        </div>
      ) : (
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
                    <User className="mb-1 h-4 w-4 text-muted-foreground" />
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
                      {auction.history.filter(h => {
                        const playerBids = auction.history.filter(bid => bid.playerId === h.playerId);
                        const lastBid = playerBids[playerBids.length - 1];
                        return lastBid.teamId === h.teamId && lastBid.amount === h.amount;
                      }).length} players
                    </span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="grid grid-cols-2 gap-2 pt-2">
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={() => handleManageAuction(auction.id)}
                >
                  <Gavel className="mr-2 h-4 w-4" />
                  Manage
                </Button>
                {auction.status === 'upcoming' ? (
                  <Button 
                    className="w-full" 
                    onClick={() => startAuction(auction.id)}
                  >
                    <PlayCircle className="mr-2 h-4 w-4" />
                    Start
                  </Button>
                ) : auction.status === 'active' ? (
                  <Button 
                    className="w-full" 
                    variant="secondary"
                    onClick={() => completeAuction(auction.id)}
                  >
                    <Clock className="mr-2 h-4 w-4" />
                    Complete
                  </Button>
                ) : (
                  <Button 
                    className="w-full" 
                    variant="secondary"
                    asChild
                  >
                    <Link to={`/auctions/${auction.id}`}>
                      <FileEdit className="mr-2 h-4 w-4" />
                      View
                    </Link>
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
          
          {auctions.length === 0 && (
            <div className="md:col-span-2 lg:col-span-3 p-8 text-center border rounded-lg bg-muted">
              <Gavel className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h2 className="text-xl font-medium mb-2">No Auctions Available</h2>
              <p className="text-muted-foreground mb-4">Create your first auction to get started</p>
              <Button asChild>
                <Link to="/admin/create-auction">
                  <LucidePlus className="mr-2 h-4 w-4" />
                  Create New Auction
                </Link>
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
