import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuction } from "@/contexts/AuctionContext";
import { Auction, BidIncrementRule, Player, PlayerPosition, Team } from "@/types";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import TeamSetup from "./TeamSetup";
import PlayerList from "./PlayerList";
import { Plus, Trash } from "lucide-react";
import { toast } from "sonner";

const CreateAuctionForm = () => {
  const { createAuction, updateAuction, auctions, validationError } = useAuction();
  const navigate = useNavigate();
  const { auctionId } = useParams();

  const [formStep, setFormStep] = useState(0);
  const [auctionName, setAuctionName] = useState("");
  const [minPlayerPrice, setMinPlayerPrice] = useState(50);
  const [teams, setTeams] = useState<Team[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [bidIncrementRules, setBidIncrementRules] = useState<BidIncrementRule[]>([
    { minAmount: 50, maxAmount: 1000, increment: 50 }
  ]);

  // Load existing auction data if in edit mode
  useEffect(() => {
    if (auctionId) {
      const existingAuction = auctions.find(a => a.id === auctionId);
      if (existingAuction) {
        setAuctionName(existingAuction.name);
        setMinPlayerPrice(existingAuction.minPlayerPrice);
        setTeams(existingAuction.teams);
        setPlayers(existingAuction.players);
        setBidIncrementRules(existingAuction.bidIncrementRules);
      }
    }
  }, [auctionId, auctions]);

  const handleAddTeam = (team: Omit<Team, 'id' | 'remainingBudget' | 'players'>) => {
    const newTeam: Team = {
      id: crypto.randomUUID(),
      remainingBudget: team.budget,
      players: [],
      ...team
    };
    setTeams(prev => [...prev, newTeam]);
  };

  const handleRemoveTeam = (index: number) => {
    setTeams(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddPlayer = (player: Player) => {
    setPlayers(prev => [...prev, player]);
  };

  const handleRemovePlayer = (playerId: string) => {
    setPlayers(prev => prev.filter(player => player.id !== playerId));
  };

  const handleAddBidRule = () => {
    setBidIncrementRules(prev => [...prev, { minAmount: 0, maxAmount: 0, increment: 0 }]);
  };

  const handleRemoveBidRule = (index: number) => {
    setBidIncrementRules(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpdateBidRule = (index: number, field: keyof BidIncrementRule, value: number) => {
    setBidIncrementRules(prev => prev.map((rule, i) =>
      i === index ? { ...rule, [field]: value } : rule
    ));
  };

  const validateStep = () => {
    if (formStep === 0) {
      if (!auctionName.trim()) {
        toast.error("Missing Information", {
          description: "Please enter an auction name"
        });
        return false;
      }
      if (minPlayerPrice <= 0) {
        toast.error("Invalid Price", {
          description: "Minimum player price must be greater than 0"
        });
        return false;
      }
    }

    if (formStep === 1) {
      if (teams.length < 2) {
        toast.error("Insufficient Teams", {
          description: "You need at least 2 teams to create an auction"
        });
        return false;
      }
    }

    if (formStep === 2) {
      const totalMinPlayersRequired = teams.reduce((total, team) => {
        return total + team.minPlayers;
      }, 0);

      if (players.length < totalMinPlayersRequired) {
        toast.error("Insufficient Players", {
          description: `You need at least ${totalMinPlayersRequired} players for ${teams.length} teams. Currently only ${players.length} players available.`
        });
        return false;
      }

      const teamsWithInvalidBudgets = teams.filter(team =>
        team.budget < minPlayerPrice * team.minPlayers
      );

      if (teamsWithInvalidBudgets.length > 0) {
        const teamNames = teamsWithInvalidBudgets.map(team => team.name).join(", ");
        toast.error("Invalid Team Budgets", {
          description: `The following teams don't have enough budget to meet their minimum player requirements: ${teamNames}`
        });
        return false;
      }
    }

    return true;
  };

  const handleSubmit = () => {
    if (!validateStep()) return;

    const auctionData: Omit<Auction, 'id' | 'createdAt' | 'history' | 'status'> = {
      name: auctionName,
      minPlayerPrice,
      teams,
      players,
      bidIncrementRules,
      currentBid: null,
      currentPlayerId: null,
      unsoldPlayerIds: [],
      soldPlayerIds: []
    };

    if (auctionId) {
      // Update existing auction
      const success = updateAuction(auctionId, auctionData);
      if (success) {
        toast.success("Auction Updated", {
          description: `${auctionName} has been updated successfully.`
        });
        navigate("/admin");
      }
    } else {
      // Create new auction
      const newAuctionId = createAuction(auctionData);
      if (newAuctionId) {
        navigate("/admin");
      }
    }
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
          <CardTitle>{auctionId ? 'Edit Auction' : 'Create New Auction'}</CardTitle>
          <CardDescription>
            {auctionId
              ? 'Update your auction settings, teams, and players.'
              : 'Set up your auction, add teams and players, and get ready to start bidding.'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {validationError && (
            <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-600">
              <div className="flex items-center">
                <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {validationError}
              </div>
            </div>
          )}

          <div className="mb-4 flex justify-between">
            {steps.map((step, i) => (
              <div
                key={step.id}
                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 text-center font-semibold
                  ${formStep > i
                    ? "border-green-500 bg-green-50 text-green-500"
                    : formStep === i
                      ? "border-[#111828] bg-white text-[#111828]"
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
                  className="bg-background"
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
                  className="bg-background"
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
                        <Label htmlFor={`minAmount-${index}`} className="text-xs">From Amount</Label>
                        <Input
                          id={`minAmount-${index}`}
                          type="number"
                          value={rule.minAmount}
                          onChange={(e) => handleUpdateBidRule(index, 'minAmount', Number(e.target.value))}
                        />
                      </div>
                      <div className="col-span-3">
                        <Label htmlFor={`maxAmount-${index}`} className="text-xs">To Amount</Label>
                        <Input
                          id={`maxAmount-${index}`}
                          type="number"
                          value={rule.maxAmount}
                          onChange={(e) => handleUpdateBidRule(index, 'maxAmount', Number(e.target.value))}
                        />
                      </div>
                      <div className="col-span-3">
                        <Label htmlFor={`increment-${index}`} className="text-xs">Increment By</Label>
                        <Input
                          id={`increment-${index}`}
                          type="number"
                          value={rule.increment}
                          onChange={(e) => handleUpdateBidRule(index, 'increment', Number(e.target.value))}
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
                              <p className="font-medium">{rule.minAmount}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">To Amount</p>
                              <p className="font-medium">{rule.maxAmount}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Increment By</p>
                              <p className="font-medium">{rule.increment}</p>
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
            <Button
              onClick={() => {
                if (validateStep()) {
                  setFormStep(formStep + 1);
                }
              }}
            >
              Next
            </Button>
          ) : (
            <Button onClick={handleSubmit}>
              {auctionId ? 'Update Auction' : 'Create Auction'}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default CreateAuctionForm;
