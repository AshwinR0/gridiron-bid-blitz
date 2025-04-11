
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Team } from "@/types";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";

interface TeamSetupProps {
  teams: Team[];
  onAddTeam: (team: Team) => void;
  onRemoveTeam: (id: string) => void;
}

const TeamSetup = ({ teams, onAddTeam, onRemoveTeam }: TeamSetupProps) => {
  const [teamName, setTeamName] = useState("");
  const [budget, setBudget] = useState(1000);
  const [minPlayers, setMinPlayers] = useState(11);

  const handleAddTeam = () => {
    if (!teamName || budget <= 0 || minPlayers <= 0) {
      return;
    }

    const newTeam: Team = {
      id: Math.random().toString(36).substring(2, 10),
      name: teamName,
      budget,
      remainingBudget: budget,
      minPlayers,
      players: []
    };

    onAddTeam(newTeam);
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
          onClick={handleAddTeam}
          disabled={!teamName || budget <= 0 || minPlayers <= 0}
        >
          <Plus className="mr-2 h-4 w-4" /> Add Team
        </Button>
      </div>

      <div>
        <h3 className="mb-2 text-lg font-medium">Teams ({teams.length})</h3>
        <div className="space-y-2">
          {teams.length === 0 ? (
            <p className="text-center text-muted-foreground">No teams added yet</p>
          ) : (
            teams.map(team => (
              <Card key={team.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <h4 className="font-medium">{team.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      Budget: {team.budget} | Min Players: {team.minPlayers}
                    </p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-red-500 hover:bg-red-50 hover:text-red-600"
                    onClick={() => onRemoveTeam(team.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamSetup;
