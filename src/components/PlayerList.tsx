import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Player, PlayerPosition, ForwardStats, DefenceStats, GoalkeeperStats } from "@/types";
import { Plus, Trash2, UserRound, Upload, X } from "lucide-react";
import { useState, useRef } from "react";
import { toast } from "sonner";
import { v4 as uuidv4 } from 'uuid';
import ReactCrop, { Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

interface PlayerListProps {
  players: Player[];
  onAddPlayer: (player: Player) => void;
  onRemovePlayer: (id: string) => void;
}

type PlayerStats = ForwardStats | DefenceStats | GoalkeeperStats;

const DEFAULT_STATS = {
  Forward: {
    finishing: 70,
    pace: 70,
    dribbling: 70
  },
  Defence: {
    defending: 70,
    physicality: 70,
    aerialSuperiority: 70
  },
  Goalkeeper: {
    diving: 70,
    reflexes: 70,
    positioning: 70
  }
};

const PlayerList = ({ players, onAddPlayer, onRemovePlayer }: PlayerListProps) => {
  const [playerName, setPlayerName] = useState("");
  const [position, setPosition] = useState<PlayerPosition>("Forward");
  const [image, setImage] = useState<string>("");
  const [stats, setStats] = useState<PlayerStats>(DEFAULT_STATS.Forward);
  const [crop, setCrop] = useState<Crop>();
  const [tempImage, setTempImage] = useState<string>("");
  const [showCropModal, setShowCropModal] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePositionChange = (newPosition: PlayerPosition) => {
    setPosition(newPosition);
    setStats(DEFAULT_STATS[newPosition]);
  };

  const handleStatChange = (statName: string, value: string) => {
    const numValue = Math.min(Math.max(parseInt(value) || 0, 0), 100);
    setStats(prev => ({
      ...prev,
      [statName]: numValue
    }));
  };

  const handleAddPlayer = () => {
    if (!playerName.trim()) return;

    const newPlayer: Player = {
      id: uuidv4(),
      name: playerName,
      position,
      image,
      stats,
      team: "",
      value: calculateValue(stats)
    };

    onAddPlayer(newPlayer);
    setPlayerName("");
    setImage("");
    setStats(DEFAULT_STATS[position]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const calculateValue = (stats: PlayerStats) => {
    const values = Object.values(stats);
    const average = values.reduce((a, b) => a + b, 0) / values.length;
    return Math.round(average * 1000); // Base value on average stats
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempImage(reader.result as string);
        setShowCropModal(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = () => {
    if (imageRef.current && crop?.width && crop?.height) {
      const canvas = document.createElement('canvas');
      const scaleX = imageRef.current.naturalWidth / imageRef.current.width;
      const scaleY = imageRef.current.naturalHeight / imageRef.current.height;
      const ctx = canvas.getContext('2d');

      canvas.width = 300;
      canvas.height = 300;

      if (ctx) {
        ctx.drawImage(
          imageRef.current,
          crop.x * scaleX,
          crop.y * scaleY,
          crop.width * scaleX,
          crop.height * scaleY,
          0,
          0,
          300,
          300
        );

        setImage(canvas.toDataURL('image/jpeg'));
        setShowCropModal(false);
        setTempImage("");
      }
    }
  };

  const renderStatInputs = () => {
    const statFields = Object.keys(stats);

    return (
      <div className="grid grid-cols-3 gap-4 mt-4">
        {statFields.map((stat) => (
          <div key={stat} className="space-y-2">
            <Label htmlFor={stat} className="capitalize">
              {stat}
            </Label>
            <Input
              id={stat}
              type="number"
              min="0"
              max="100"
              value={stats[stat as keyof PlayerStats]}
              onChange={(e) => handleStatChange(stat, e.target.value)}
              className="w-full"
            />
          </div>
        ))}
      </div>
    );
  };

  const groupPlayersByPosition = () => {
    return players.reduce((groups, player) => {
      const position = player.position;
      if (!groups[position]) {
        groups[position] = [];
      }
      groups[position].push(player);
      return groups;
    }, {} as Record<PlayerPosition, Player[]>);
  };

  const renderPlayerStats = (player: Player) => {
    const playerStats = player.stats as PlayerStats;
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

  const groupedPlayers = groupPlayersByPosition();

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-6">Add New Player</h3>
        <div className="grid grid-cols-3 gap-6">
          {/* Left Column - Player Details */}
          <div className="col-span-2 space-y-4 flex flex-col justify-center">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Enter player name"
              />
            </div>

            <div>
              <Label htmlFor="position">Position</Label>
              <Select value={position} onValueChange={handlePositionChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select position" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Forward">Forward</SelectItem>
                  <SelectItem value="Defence">Defence</SelectItem>
                  <SelectItem value="Goalkeeper">Goalkeeper</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {Object.entries(stats).map(([stat, value]) => (
                <div key={stat} className="space-y-2">
                  <Label htmlFor={stat} className="capitalize">
                    {stat}
                  </Label>
                  <Input
                    id={stat}
                    type="number"
                    min="0"
                    max="100"
                    value={value}
                    onChange={(e) => handleStatChange(stat, e.target.value)}
                    className="w-full"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - Image Upload */}
          <div>
            <Label>Player Image</Label>
            <div className="border-2 border-dashed border-gray-200 rounded-lg aspect-square">
              {image ? (
                <div className="relative w-full h-full">
                  <img
                    src={image}
                    alt="Preview"
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={() => {
                      setImage("");
                      if (fileInputRef.current) {
                        fileInputRef.current.value = "";
                      }
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div
                  className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">Click to upload</p>
                  <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
          </div>
        </div>

        <Button onClick={handleAddPlayer} className="w-full mt-6">
          Add Player
        </Button>
      </Card>

      {/* Image Crop Modal */}
      {showCropModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full">
            <h4 className="text-lg font-semibold mb-4">Crop Image</h4>
            <ReactCrop
              crop={crop}
              onChange={c => setCrop(c)}
              aspect={1}
              className="max-h-[60vh]"
            >
              <img
                ref={imageRef}
                src={tempImage}
                alt="Crop preview"
                className="max-w-full"
              />
            </ReactCrop>
            <div className="flex justify-end gap-2 mt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowCropModal(false);
                  setTempImage("");
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleCropComplete}>
                Apply
              </Button>
            </div>
          </div>
        </div>
      )}

      {Object.entries(groupedPlayers).map(([position, positionPlayers]) => (
        <div key={position} className="space-y-4">
          <h3 className="text-xl font-semibold">{position}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {positionPlayers.map((player) => (
              <Card key={player.id} className="p-4 relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8 text-gray-500 hover:text-red-600 hover:bg-red-50"
                  onClick={() => onRemovePlayer(player.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <div className="flex items-center space-x-4">
                  {player.image && (
                    <img
                      src={player.image}
                      alt={player.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  )}
                  <div>
                    <h4 className="font-semibold">{player.name}</h4>
                    <p className="text-sm text-gray-500">{player.position}</p>
                    {/* <p className="text-sm text-gray-500">Value: ${player.value}</p> */}
                  </div>
                </div>
                {renderPlayerStats(player)}
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default PlayerList;
