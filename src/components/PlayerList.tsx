
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Player, PlayerPosition } from "@/types";
import { Plus, Trash2, UserRound } from "lucide-react";
import { useState } from "react";

interface PlayerListProps {
  players: Player[];
  onAddPlayer: (player: Player) => void;
  onRemovePlayer: (id: string) => void;
}

const PlayerList = ({ players, onAddPlayer, onRemovePlayer }: PlayerListProps) => {
  const [playerName, setPlayerName] = useState("");
  const [position, setPosition] = useState<PlayerPosition>("Forward");

  const handleAddPlayer = () => {
    if (!playerName) {
      return;
    }

    const newPlayer: Player = {
      id: Math.random().toString(36).substring(2, 10),
      name: playerName,
      position,
      stats: getRandomStatsForPosition(position),
    };

    onAddPlayer(newPlayer);
    setPlayerName("");
  };

  // Helper function to generate random stats based on position
  const getRandomStatsForPosition = (position: PlayerPosition) => {
    if (position === 'Forward') {
      return {
        goals: Math.floor(Math.random() * 20),
        assists: Math.floor(Math.random() * 15),
        pace: 50 + Math.floor(Math.random() * 50),
      };
    } else if (position === 'Defence') {
      return {
        tackles: Math.floor(Math.random() * 100),
        interceptions: Math.floor(Math.random() * 80),
        strength: 60 + Math.floor(Math.random() * 40),
      };
    } else {
      return {
        saves: Math.floor(Math.random() * 120),
        cleanSheets: Math.floor(Math.random() * 10),
        reflexes: 65 + Math.floor(Math.random() * 35),
      };
    }
  };

  // Group players by position
  const playersByPosition = players.reduce((acc, player) => {
    if (!acc[player.position]) {
      acc[player.position] = [];
    }
    acc[player.position].push(player);
    return acc;
  }, {} as Record<PlayerPosition, Player[]>);

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="playerName">Player Name</Label>
          <Input 
            id="playerName" 
            placeholder="Enter player name"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="position">Position</Label>
          <Select 
            value={position} 
            onValueChange={(value) => setPosition(value as PlayerPosition)}
          >
            <SelectTrigger id="position">
              <SelectValue placeholder="Select position" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Forward">Forward</SelectItem>
              <SelectItem value="Defence">Defence</SelectItem>
              <SelectItem value="Goalkeeper">Goalkeeper</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button 
          className="w-full" 
          onClick={handleAddPlayer}
          disabled={!playerName}
        >
          <Plus className="mr-2 h-4 w-4" /> Add Player
        </Button>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-medium">Players by Position</h3>
        
        {/* For each position, show players */}
        {(['Forward', 'Defence', 'Goalkeeper'] as PlayerPosition[]).map(pos => (
          <div key={pos} className="mb-6">
            <h4 className="mb-2 flex items-center font-medium">
              <div className="mr-2 flex h-6 w-6 items-center justify-center rounded-full bg-fieldGreen text-white">
                {pos === 'Forward' ? 'F' : pos === 'Defence' ? 'D' : 'G'}
              </div>
              {pos} ({playersByPosition[pos]?.length || 0})
            </h4>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {playersByPosition[pos]?.map(player => (
                <Card key={player.id}>
                  <CardContent className="flex items-center justify-between p-3">
                    <div className="flex items-center">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                        <UserRound className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div className="ml-3">
                        <h5 className="text-sm font-medium">{player.name}</h5>
                        <p className="text-xs text-muted-foreground">{player.position}</p>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-600"
                      onClick={() => onRemovePlayer(player.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
              {(!playersByPosition[pos] || playersByPosition[pos].length === 0) && (
                <p className="col-span-full text-center text-sm text-muted-foreground">
                  No {pos.toLowerCase()} players added yet
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlayerList;
