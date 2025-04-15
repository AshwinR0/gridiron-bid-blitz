import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuction } from "@/contexts/AuctionContext";
import { DollarSign, Gavel, ListFilter, PlusCircle, Trophy, Users } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  const { auctions = [], isAdmin } = useAuction();

  // Filter auctions by status
  const activeAuctions = auctions?.filter(a => a.status === 'active') || [];
  const upcomingAuctions = auctions?.filter(a => a.status === 'upcoming') || [];
  const completedAuctions = auctions?.filter(a => a.status === 'completed') || [];

  return (
    <div className="container mx-auto p-4">
      <section className="mb-12 rounded-xl bg-fieldGreen py-12 px-6 text-white md:px-12">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="mb-4 text-4xl font-bold md:text-5xl">
            Gridiron Bid Blitz
          </h1>
          <p className="mb-8 text-lg md:text-xl">
            The ultimate football player auction platform for your organization.
            Manage teams, players, and bidding in real-time with our comprehensive auction system.
          </p>
          {isAdmin ? (
            <Link to="/admin/create-auction">
              <Button size="lg" className="bg-accentGold text-scoreboardBlack hover:bg-accentGold-light">
                <PlusCircle className="mr-2 h-5 w-5" /> Create New Auction
              </Button>
            </Link>
          ) : (
            <Link to={activeAuctions.length > 0 ? `/auctions/${activeAuctions[0].id}` : "/"}>
              <Button size="lg" className="bg-accentGold text-scoreboardBlack hover:bg-accentGold-light" disabled={activeAuctions.length === 0}>
                <Gavel className="mr-2 h-5 w-5" /> {activeAuctions.length > 0 ? "Join Active Auction" : "No Active Auctions"}
              </Button>
            </Link>
          )}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="mb-6 text-center text-3xl font-bold">How It Works</h2>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <FeatureCard
            icon={<Users className="h-10 w-10 text-fieldGreen" />}
            title="Organize Teams"
            description="Set up teams with customized budgets and player requirements for each auction event."
          />
          <FeatureCard
            icon={<ListFilter className="h-10 w-10 text-fieldGreen" />}
            title="Categorize Players"
            description="Organize players by position: Forwards, Defence, and Goalkeepers with detailed stats."
          />
          <FeatureCard
            icon={<DollarSign className="h-10 w-10 text-fieldGreen" />}
            title="Smart Bidding"
            description="Our system automatically enforces budget constraints and player requirements during bidding."
          />
        </div>
      </section>

      {activeAuctions.length > 0 && (
        <section className="mb-12">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold">Active Auctions</h2>
            <Link to={activeAuctions.length > 0 ? `/auctions/${activeAuctions[0].id}` : "/"}>
              <Button variant="outline" size="sm">View All</Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {activeAuctions.slice(0, 3).map(auction => (
              <AuctionCard
                key={auction.id}
                id={auction.id}
                title={auction.name}
                teams={auction.teams.length}
                players={auction.players.length}
                status="active"
              />
            ))}
          </div>
        </section>
      )}

      {(upcomingAuctions.length > 0 || completedAuctions.length > 0) && (
        <section className="grid gap-8 md:grid-cols-2">
          {upcomingAuctions.length > 0 && (
            <div>
              <h2 className="mb-4 text-xl font-bold">Upcoming Auctions</h2>
              <div className="space-y-4">
                {upcomingAuctions.slice(0, 3).map(auction => (
                  <AuctionCard
                    key={auction.id}
                    id={auction.id}
                    title={auction.name}
                    teams={auction.teams.length}
                    players={auction.players.length}
                    status="upcoming"
                    compact
                  />
                ))}
              </div>
            </div>
          )}

          {completedAuctions.length > 0 && (
            <div>
              <h2 className="mb-4 text-xl font-bold">Recent Results</h2>
              <div className="space-y-4">
                {completedAuctions.slice(0, 3).map(auction => (
                  <AuctionCard
                    key={auction.id}
                    id={auction.id}
                    title={auction.name}
                    teams={auction.teams.length}
                    players={auction.players.length}
                    status="completed"
                    compact
                  />
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {auctions.length === 0 && (
        <div className="my-12 rounded-lg border-2 border-dashed border-muted-foreground/20 p-12 text-center">
          <Gavel className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="mb-2 text-xl font-medium">No Auctions Yet</h3>
          <p className="mb-6 text-muted-foreground">
            There are no auctions set up in the system yet.
          </p>
          {isAdmin && (
            <Link to="/admin/create-auction">
              <Button>Create Your First Auction</Button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard = ({ icon, title, description }: FeatureCardProps) => {
  return (
    <Card>
      <CardContent className="flex flex-col items-center p-6 text-center">
        <div className="mb-4 rounded-full bg-muted p-3">{icon}</div>
        <h3 className="mb-2 text-xl font-medium">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
};

interface AuctionCardProps {
  id: string;
  title: string;
  teams: number;
  players: number;
  status: 'upcoming' | 'active' | 'completed';
  compact?: boolean;
}

const AuctionCard = ({ id, title, teams, players, status, compact = false }: AuctionCardProps) => {
  const getStatusIcon = () => {
    switch (status) {
      case 'active':
        return <Gavel className="h-5 w-5 text-theme-accent" />;
      case 'upcoming':
        return <Clock className="h-5 w-5 text-blue-400" />;
      case 'completed':
        return <Trophy className="h-5 w-5 text-yellow-400" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'active':
        return 'In Progress';
      case 'upcoming':
        return 'Upcoming';
      case 'completed':
        return 'Completed';
    }
  };

  if (compact) {
    return (
      <Card>
        <CardContent className="flex items-center justify-between p-4">
          <div>
            <h3 className="font-medium text-foreground/90">{title}</h3>
            <div className="flex items-center gap-4 text-sm text-muted-foreground/80">
              <span className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" /> {teams}
              </span>
              <span className="flex items-center gap-1">
                <User className="h-3.5 w-3.5" /> {players}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 rounded-full bg-theme-dark/50 backdrop-blur-sm px-2 py-1 text-xs ring-1 ring-border/10">
              {getStatusIcon()} {getStatusText()}
            </span>
            <Link to={`/auctions/${id}`}>
              <Button variant="ghost" size="icon" className="text-foreground/80 hover:text-foreground">
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className={`h-2 w-full ${status === 'active' ? 'bg-theme-accent' :
        status === 'upcoming' ? 'bg-blue-400' : 'bg-gray-400'
        }`} />
      <CardContent className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-medium text-foreground/90">{title}</h3>
          <span className="flex items-center gap-1 rounded-full bg-theme-dark/50 backdrop-blur-sm px-2.5 py-1 text-xs ring-1 ring-border/10">
            {getStatusIcon()} {getStatusText()}
          </span>
        </div>
        <div className="mb-4 grid grid-cols-2 gap-4">
          <div className="rounded-md bg-theme-dark/50 backdrop-blur-sm p-3 text-center ring-1 ring-border/10">
            <p className="text-sm text-muted-foreground/80">Teams</p>
            <p className="text-2xl font-medium text-foreground/90">{teams}</p>
          </div>
          <div className="rounded-md bg-theme-dark/50 backdrop-blur-sm p-3 text-center ring-1 ring-border/10">
            <p className="text-sm text-muted-foreground/80">Players</p>
            <p className="text-2xl font-medium text-foreground/90">{players}</p>
          </div>
        </div>
        <Link to={`/auctions/${id}`} className="block w-full">
          <Button className="w-full bg-theme-accent hover:bg-theme-accent-dark text-white">
            {status === 'active' ? 'Join Auction' :
              status === 'upcoming' ? 'View Details' : 'View Results'}
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
};

// Mock components for icons that aren't imported
const User = ({ className }: { className?: string }) => (
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
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const ArrowRight = ({ className }: { className?: string }) => (
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
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

const Clock = ({ className }: { className?: string }) => (
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
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

export default Index;
