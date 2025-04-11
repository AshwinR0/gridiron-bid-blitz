
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuction } from "@/contexts/AuctionContext";
import { Auction } from "@/types";
import { ArrowRight, CalendarDays, Plus, Users } from "lucide-react";
import { Link } from "react-router-dom";

const AdminDashboard = () => {
  const { auctions, setCurrentAuction } = useAuction();

  const upcomingAuctions = auctions.filter(a => a.status === 'upcoming');
  const activeAuctions = auctions.filter(a => a.status === 'active');
  const completedAuctions = auctions.filter(a => a.status === 'completed');

  return (
    <div className="container mx-auto p-4">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Link to="/admin/create-auction">
          <Button className="bg-fieldGreen hover:bg-fieldGreen-dark">
            <Plus className="mr-2 h-4 w-4" /> Create New Auction
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <StatsCard 
          title="Total Auctions" 
          value={auctions.length} 
          icon={<Gavel className="h-8 w-8 text-accentGold" />} 
        />
        <StatsCard 
          title="Active Auctions" 
          value={activeAuctions.length} 
          icon={<Activity className="h-8 w-8 text-green-500" />} 
        />
        <StatsCard 
          title="Teams" 
          value={auctions.reduce((sum, auction) => sum + auction.teams.length, 0)} 
          icon={<Users className="h-8 w-8 text-blue-500" />} 
        />
      </div>

      <h2 className="mt-8 mb-4 text-2xl font-bold">Upcoming Auctions</h2>
      {upcomingAuctions.length === 0 ? (
        <p className="text-muted-foreground">No upcoming auctions.</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {upcomingAuctions.map(auction => (
            <AuctionCard key={auction.id} auction={auction} />
          ))}
        </div>
      )}

      <h2 className="mt-8 mb-4 text-2xl font-bold">Active Auctions</h2>
      {activeAuctions.length === 0 ? (
        <p className="text-muted-foreground">No active auctions.</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {activeAuctions.map(auction => (
            <AuctionCard key={auction.id} auction={auction} />
          ))}
        </div>
      )}

      <h2 className="mt-8 mb-4 text-2xl font-bold">Completed Auctions</h2>
      {completedAuctions.length === 0 ? (
        <p className="text-muted-foreground">No completed auctions.</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {completedAuctions.map(auction => (
            <AuctionCard key={auction.id} auction={auction} />
          ))}
        </div>
      )}
    </div>
  );
};

interface StatsCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
}

const StatsCard = ({ title, value, icon }: StatsCardProps) => {
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-6">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold">{value}</p>
        </div>
        <div className="rounded-full bg-muted p-3">{icon}</div>
      </CardContent>
    </Card>
  );
};

interface AuctionCardProps {
  auction: Auction;
}

const AuctionCard = ({ auction }: AuctionCardProps) => {
  const { setCurrentAuction } = useAuction();

  // Format date
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  const getStatusColor = (status: Auction['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'upcoming':
        return 'bg-blue-500';
      case 'completed':
        return 'bg-gray-500';
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle>{auction.name}</CardTitle>
          <div className={`h-2.5 w-2.5 rounded-full ${getStatusColor(auction.status)}`} />
        </div>
        <CardDescription className="flex items-center gap-1">
          <CalendarDays className="h-3.5 w-3.5" />
          {formatDate(auction.createdAt)}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded bg-muted p-2">
            <p className="text-xs text-muted-foreground">Teams</p>
            <p className="font-medium">{auction.teams.length}</p>
          </div>
          <div className="rounded bg-muted p-2">
            <p className="text-xs text-muted-foreground">Players</p>
            <p className="font-medium">{auction.playerPool.length}</p>
          </div>
          <div className="rounded bg-muted p-2">
            <p className="text-xs text-muted-foreground">Min Price</p>
            <p className="font-medium">{auction.minPlayerPrice}</p>
          </div>
          <div className="rounded bg-muted p-2">
            <p className="text-xs text-muted-foreground">Status</p>
            <p className="font-medium capitalize">{auction.status}</p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-2">
        <Button 
          className="w-full"
          variant={auction.status === 'active' ? 'default' : 'outline'}
          onClick={() => {
            setCurrentAuction(auction.id);
            window.location.href = `/auctions/${auction.id}`;
          }}
        >
          {auction.status === 'upcoming' && 'View Details'}
          {auction.status === 'active' && 'Continue Auction'}
          {auction.status === 'completed' && 'View Results'}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

// Import these components from lucide-react
const Gavel = ({ className }: { className?: string }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m14 14-7.8 7.8a1 1 0 0 1-1.4 0l-2.6-2.6a1 1 0 0 1 0-1.4L10 10" />
      <path d="m16 16 6-6" />
      <path d="m8 8 6-6" />
      <path d="m9 7 8 8" />
      <path d="m21 11-8-8" />
    </svg>
  );
};

const Activity = ({ className }: { className?: string }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  );
};

export default AdminDashboard;
