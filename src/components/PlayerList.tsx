import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Player, PlayerPosition } from "@/types";
import { Plus, Trash2, UserRound } from "lucide-react";
import { useState, useEffect } from "react";
// Assuming supabase client is initialized and can be imported
import { supabase } from "@/lib/supabaseClient"; 

interface PlayerListProps {
  players: Player[];
  onAddPlayer: (player: Player) => void;
  onRemovePlayer: (id: string) => void;
}

const PlayerList = ({ players, onAddPlayer, onRemovePlayer }: PlayerListProps) => {
  const [availablePlayers, setAvailablePlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlayers = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('players')
        .select('id, name, position, image'); // Select necessary columns, including stats

      if (error) {
        console.error("Error fetching players:", error);
        setError("Failed to load players.");
        setAvailablePlayers([]);
      } else {
        // Assuming the data structure from Supabase matches the Player type
        setAvailablePlayers(data || []);
      }
      setLoading(false);
    };

    fetchPlayers();
  }, []); // Empty dependency array means this effect runs once on mount

  const handleAddPlayerToAuction = (player: Player) => {
    onAddPlayer(player);
    // Keep player in available list, the button will be disabled
  };

  const handleRemovePlayerFromAuction = (playerId: string) => {
    const removedPlayer = players.find(p => p.id === playerId);
    if (removedPlayer) {
      onRemovePlayer(playerId);
      // Optionally add the player back to the available list if they are removed from the auction
      // setAvailablePlayers(prev => [...prev, removedPlayer]);
    }
  };

  const groupPlayersByPosition = (playerList: Player[]) => {
    return playerList.reduce((groups, player) => {
      const position = player.position;
      if (!groups[position]) {
        groups[position] = [];
      }
      groups[position].push(player);
      return groups;
    }, {} as Record<PlayerPosition, Player[]>);
  };

  const renderPlayerStats = (player: Player) => {
    // Check if stats exist before trying to render them
    if (!player.stats) return null;
    const playerStats = player.stats;
    return (
      <div className="grid grid-cols-1 gap-1 mt-3 text-sm border-t pt-3">
        {Object.entries(playerStats).map(([stat, value]) => (
          <div key={stat} className="flex items-center justify-between px-2 py-1 bg-transparent rounded">
            <span className="capitalize text-white">{stat}:</span>
            <span className="font-medium text-white">{value}</span>
          </div>
        ))}
      </div>
    );
  };

  const groupedAvailablePlayers = groupPlayersByPosition(availablePlayers);
  const groupedAuctionPlayers = groupPlayersByPosition(players);

  return (
    <div className="space-y-6">
      {/* Available Players Section */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Available Players</h3>
        {loading && <p>Loading players...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {!loading && !error && Object.entries(groupedAvailablePlayers).map(([position, positionPlayers]) => (
          <div key={position} className="space-y-4 mb-6">
            <h4 className="text-lg font-semibold">{position}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {positionPlayers.map((player) => (
                <Card key={player.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {player.image && (
                      <img
                        src={player.image}
                        alt={player.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    )}
                    {!player.image && (
                       <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                         <UserRound className="h-6 w-6 text-muted-foreground" />
                       </div>
                    )}
                    <div>
                      <h5 className="font-semibold">{player.name}</h5>
                      <p className="text-sm text-gray-500">{player.position}</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleAddPlayerToAuction(player)}
                    disabled={players.some(p => p.id === player.id)} // Disable if player is already in the auction list
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add
                  </Button>
                </Card>
              ))}
            </div>
          </div>
        ))}
         {!loading && !error && availablePlayers.length === 0 && (
          <p className="text-muted-foreground">No players available to add.</p>
        )}
      </div>

      {/* Players in Auction Section */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Players in Auction ({players.length})</h3>
         {players.length === 0 && (
          <p className="text-muted-foreground">No players added to the auction yet.</p>
        )}
        {Object.entries(groupedAuctionPlayers).map(([position, positionPlayers]) => (
          <div key={position} className="space-y-4 mb-6">
             <h4 className="text-lg font-semibold">{position}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {positionPlayers.map((player) => (
                <Card key={player.id} className="p-4 relative flex items-center justify-between">
                   <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8 text-gray-500 hover:text-red-600 hover:bg-red-50"
                    onClick={() => handleRemovePlayerFromAuction(player.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <div className="flex items-center space-x-4">
                     {player.image && (
                      <img
                        src={player.image}
                        alt={player.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    )}
                    {!player.image && (
                       <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                         <UserRound className="h-6 w-6 text-muted-foreground" />
                       </div>
                    )}
                    <div>
                      <h5 className="font-semibold">{player.name}</h5>
                      <p className="text-sm text-gray-500">{player.position}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlayerList;
