import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Team } from "@/types";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";

interface TeamSetupProps {
  onAddTeam: (team: Omit<Team, 'id' | 'remainingBudget' | 'players'>) => void;
  onRemoveTeam: (index: number) => void;
  teams: Team[];
}

const TeamSetup: React.FC<TeamSetupProps> = ({ onAddTeam, onRemoveTeam, teams }) => {
  const [teamName, setTeamName] = useState("");
  const [budget, setBudget] = useState<number>(1000);
  const [minPlayers, setMinPlayers] = useState<number>(5);

  const handleSubmit = () => {
    if (!teamName || budget <= 0 || minPlayers <= 0) return;

    onAddTeam({
      name: teamName,
      budget,
      minPlayers,
      maxPlayers: minPlayers
    });

    // Reset form
    setTeamName("");
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="teamName">Team Name</Label>
          <Input
            id="teamName"
            placeholder="Enter team name"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="budget">Budget</Label>
            <Input
              id="budget"
              type="number"
              placeholder="Team's total budget"
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
            />
          </div>
          <div>
            <Label htmlFor="minPlayers">Minimum Players</Label>
            <Input
              id="minPlayers"
              type="number"
              placeholder="Minimum players to acquire"
              value={minPlayers}
              onChange={(e) => setMinPlayers(Number(e.target.value))}
            />
          </div>
        </div>
        <Button
          className="w-full"
          onClick={handleSubmit}
          disabled={!teamName || budget <= 0 || minPlayers <= 0}
        >
          <Plus className="mr-2 h-4 w-4" /> Add Team
        </Button>
      </div>

      {teams.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-medium">Added Teams</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {teams.map((team, index) => (
              <Card key={team.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-medium">{team.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Budget: ${team.budget} • Min Players: {team.minPlayers}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onRemoveTeam(index)}
                    className="text-destructive hover:text-destructive/90"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamSetup;
