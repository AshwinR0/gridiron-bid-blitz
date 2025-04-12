
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuction } from '@/contexts/AuctionContext';
import { 
  Sidebar, 
  SidebarContent, 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton, 
  SidebarProvider, 
  SidebarTrigger
} from '@/components/ui/sidebar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Trophy, 
  Table as TableIcon, 
  Calendar, 
  Award, 
  Flag,
  Soccer, 
  Shield,
  AlertTriangle
} from 'lucide-react';
import TournamentTable from './TournamentTable';
import TournamentFixtures from './TournamentFixtures';
import TopScorers from './TopScorers';
import GoalkeepersStats from './GoalkeepersStats';

type TabType = 'table' | 'fixtures' | 'top-scorers' | 'goalkeepers';

const TournamentDashboard = () => {
  const { tournamentId } = useParams<{ tournamentId: string }>();
  const { getTournament, getAuction } = useAuction();
  const [activeTab, setActiveTab] = useState<TabType>('table');
  
  const tournament = tournamentId ? getTournament(tournamentId) : null;
  const auction = tournament?.auctionId ? getAuction(tournament.auctionId) : null;

  if (!tournament) {
    return (
      <div className="container mx-auto p-8">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Tournament Not Found</AlertTitle>
          <AlertDescription>
            The tournament you're looking for doesn't exist or has been removed.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'table':
        return <TournamentTable tournament={tournament} />;
      case 'fixtures':
        return <TournamentFixtures tournament={tournament} />;
      case 'top-scorers':
        return <TopScorers tournament={tournament} />;
      case 'goalkeepers':
        return <GoalkeepersStats tournament={tournament} />;
      default:
        return <TournamentTable tournament={tournament} />;
    }
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar>
          <SidebarContent>
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold">{tournament.name}</h2>
              <Badge 
                variant={tournament.status === 'active' ? 'default' : tournament.status === 'completed' ? 'secondary' : 'outline'}
                className="mt-1"
              >
                {tournament.status === 'active' ? 'Active' : tournament.status === 'completed' ? 'Completed' : 'Upcoming'}
              </Badge>
              <p className="text-sm text-muted-foreground mt-2">
                Format: {tournament.type.charAt(0).toUpperCase() + tournament.type.slice(1)}
              </p>
            </div>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={() => setActiveTab('table')}
                  isActive={activeTab === 'table'}
                  tooltip="Tournament Table"
                >
                  <TableIcon className="h-5 w-5" />
                  <span>Tournament Table</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={() => setActiveTab('fixtures')}
                  isActive={activeTab === 'fixtures'}
                  tooltip="Fixtures & Results"
                >
                  <Calendar className="h-5 w-5" />
                  <span>Fixtures & Results</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={() => setActiveTab('top-scorers')}
                  isActive={activeTab === 'top-scorers'}
                  tooltip="Top Goalscorers"
                >
                  <Soccer className="h-5 w-5" />
                  <span>Top Goalscorers</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={() => setActiveTab('goalkeepers')}
                  isActive={activeTab === 'goalkeepers'}
                  tooltip="Golden Glove"
                >
                  <Shield className="h-5 w-5" />
                  <span>Golden Glove</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
        
        <div className="flex-1 p-6">
          <div className="flex items-center mb-6">
            <SidebarTrigger className="mr-2" />
            <h1 className="text-2xl font-bold">{tournament.name} - {activeTab.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</h1>
          </div>
          
          {renderContent()}
        </div>
      </div>
    </SidebarProvider>
  );
};

export default TournamentDashboard;
