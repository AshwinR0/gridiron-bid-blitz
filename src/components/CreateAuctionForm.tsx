
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuction } from "@/contexts/AuctionContext";
import { Auction, BidIncrementRule, Player, PlayerPosition, Team } from "@/types";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import TeamSetup from "./TeamSetup";
import PlayerList from "./PlayerList";
import { Plus, Trash } from "lucide-react";

const CreateAuctionForm = () => {
  const { createAuction } = useAuction();
  const navigate = useNavigate();

  const [formStep, setFormStep] = useState(0);
  const [auctionName, setAuctionName] = useState("");
  const [minPlayerPrice, setMinPlayerPrice] = useState(50);
  const [teams, setTeams] = useState<Team[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [bidIncrementRules, setBidIncrementRules] = useState<BidIncrementRule[]>([
    { fromAmount: 50, toAmount: 1000, incrementBy: 50 }
  ]);

  const handleAddTeam = (team: Team) => {
    setTeams(prev => [...prev, team]);
  };

  const handleRemoveTeam = (teamId: string) => {
    setTeams(prev => prev.filter(team => team.id !== teamId));
  };

  const handleAddPlayer = (player: Player) => {
    setPlayers(prev => [...prev, player]);
  };

  const handleRemovePlayer = (playerId: string) => {
    setPlayers(prev => prev.filter(player => player.id !== playerId));
  };

  const handleAddBidRule = () => {
    setBidIncrementRules(prev => [...prev, { fromAmount: 0, toAmount: 0, incrementBy: 0 }]);
  };

  const handleRemoveBidRule = (index: number) => {
    setBidIncrementRules(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpdateBidRule = (index: number, field: keyof BidIncrementRule, value: number) => {
    setBidIncrementRules(prev => prev.map((rule, i) => 
      i === index ? { ...rule, [field]: value } : rule
    ));
  };

  const handleCreateAuction = () => {
    if (!auctionName || teams.length === 0 || players.length === 0) {
      // Show error
      return;
    }

    const auctionData: Omit<Auction, 'id' | 'createdAt' | 'history' | 'status'> = {
      name: auctionName,
      minPlayerPrice,
      teams,
      playerPool: players,
      bidIncrementRules
    };

    createAuction(auctionData);
    navigate("/admin");
  };

  const steps = [
    {
      id: "step-1",
      name: "Step 1",
      fields: ["auctionName", "minPlayerPrice", "bidIncrementRules"],
    },
    {
      id: "step-2",
      name: "Step 2",
      fields: ["teams"],
    },
    {
      id: "step-3",
      name: "Step 3",
      fields: ["players"],
    },
    {
      id: "step-4",
      name: "Review",
    },
  ];

  return (
    <div className="container mx-auto p-4">
      <Card className="mx-auto max-w-4xl">
        <CardHeader>
          <CardTitle>Create New Auction</CardTitle>
          <CardDescription>
            Set up your auction, add teams and players, and get ready to start bidding.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex justify-between">
            {steps.map((step, i) => (
              <div
                key={step.id}
                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 text-center font-semibold
                  ${
                    formStep > i
                      ? "border-green-500 bg-green-50 text-green-500"
                      : formStep === i
                      ? "border-fieldGreen bg-fieldGreen/10 text-fieldGreen"
                      : "border-gray-300 text-gray-400"
                  }`}
              >
                {i + 1}
              </div>
            ))}
          </div>

          {formStep === 0 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="auctionName">Auction Name</Label>
                <Input
                  id="auctionName"
                  placeholder="Enter auction name"
                  value={auctionName}
                  onChange={(e) => setAuctionName(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="minPlayerPrice">Minimum Player Price</Label>
                <Input
                  id="minPlayerPrice"
                  type="number"
                  placeholder="Minimum bid amount for any player"
                  value={minPlayerPrice}
                  onChange={(e) => setMinPlayerPrice(Number(e.target.value))}
                />
              </div>
              
              <div className="mt-6">
                <div className="flex items-center justify-between mb-2">
                  <Label>Bidding Increment Rules</Label>
                  <Button 
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddBidRule}
                    className="flex items-center gap-1"
                  >
                    <Plus className="h-4 w-4" /> Add Rule
                  </Button>
                </div>
                <div className="space-y-3 mt-3">
                  {bidIncrementRules.map((rule, index) => (
                    <div key={index} className="grid grid-cols-10 gap-2 items-center">
                      <div className="col-span-3">
                        <Label htmlFor={`fromAmount-${index}`} className="text-xs">From Amount</Label>
                        <Input
                          id={`fromAmount-${index}`}
                          type="number"
                          value={rule.fromAmount}
                          onChange={(e) => handleUpdateBidRule(index, 'fromAmount', Number(e.target.value))}
                        />
                      </div>
                      <div className="col-span-3">
                        <Label htmlFor={`toAmount-${index}`} className="text-xs">To Amount</Label>
                        <Input
                          id={`toAmount-${index}`}
                          type="number"
                          value={rule.toAmount}
                          onChange={(e) => handleUpdateBidRule(index, 'toAmount', Number(e.target.value))}
                        />
                      </div>
                      <div className="col-span-3">
                        <Label htmlFor={`incrementBy-${index}`} className="text-xs">Increment By</Label>
                        <Input
                          id={`incrementBy-${index}`}
                          type="number"
                          value={rule.incrementBy}
                          onChange={(e) => handleUpdateBidRule(index, 'incrementBy', Number(e.target.value))}
                        />
                      </div>
                      <div className="col-span-1 flex items-end justify-center">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveBidRule(index)}
                          className="mt-5"
                          disabled={bidIncrementRules.length <= 1}
                        >
                          <Trash className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {formStep === 1 && (
            <TeamSetup
              teams={teams}
              onAddTeam={handleAddTeam}
              onRemoveTeam={handleRemoveTeam}
            />
          )}

          {formStep === 2 && (
            <PlayerList
              players={players}
              onAddPlayer={handleAddPlayer}
              onRemovePlayer={handleRemovePlayer}
            />
          )}

          {formStep === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="mb-2 text-lg font-medium">Auction Summary</h3>
                <div className="rounded-md bg-muted p-4">
                  <p><strong>Name:</strong> {auctionName}</p>
                  <p><strong>Minimum Player Price:</strong> {minPlayerPrice}</p>
                  <p><strong>Teams:</strong> {teams.length}</p>
                  <p><strong>Players:</strong> {players.length}</p>
                  <p><strong>Bidding Increment Rules:</strong> {bidIncrementRules.length}</p>
                </div>
              </div>

              <Tabs defaultValue="teams">
                <TabsList className="w-full">
                  <TabsTrigger value="teams" className="flex-1">Teams</TabsTrigger>
                  <TabsTrigger value="players" className="flex-1">Players</TabsTrigger>
                  <TabsTrigger value="bidRules" className="flex-1">Bid Rules</TabsTrigger>
                </TabsList>
                <TabsContent value="teams">
                  <div className="mt-4 space-y-4">
                    {teams.map(team => (
                      <Card key={team.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium">{team.name}</h4>
                              <p className="text-sm text-muted-foreground">
                                Budget: {team.budget} | Min Players: {team.minPlayers}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
                <TabsContent value="players">
                  <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                    {players.map(player => (
                      <Card key={player.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium">{player.name}</h4>
                              <p className="text-sm text-muted-foreground">
                                Position: {player.position}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
                <TabsContent value="bidRules">
                  <div className="mt-4 space-y-4">
                    {bidIncrementRules.map((rule, index) => (
                      <Card key={index}>
                        <CardContent className="p-4">
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <p className="text-sm text-muted-foreground">From Amount</p>
                              <p className="font-medium">{rule.fromAmount}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">To Amount</p>
                              <p className="font-medium">{rule.toAmount}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Increment By</p>
                              <p className="font-medium">{rule.incrementBy}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => setFormStep(Math.max(0, formStep - 1))}
            disabled={formStep === 0}
          >
            Back
          </Button>

          {formStep < steps.length - 1 ? (
            <Button onClick={() => setFormStep(formStep + 1)}>Next</Button>
          ) : (
            <Button onClick={handleCreateAuction}>Create Auction</Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default CreateAuctionForm;
