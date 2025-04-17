import React, { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, UserRound } from 'lucide-react';
import { Player, Team } from '@/types';

interface PlayerSoldModalProps {
    player: Player;
    team: Team;
    onClose: () => void;
    purchaseAmount: number;
}

const PlayerSoldModal = ({ player, team, onClose, purchaseAmount }: PlayerSoldModalProps) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 5000);

        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md mx-4 relative animate-in fade-in zoom-in duration-300">
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-2"
                    onClick={onClose}
                >
                    <X className="h-4 w-4" />
                </Button>

                <CardContent className="p-6 space-y-4">
                    <div className="flex items-center space-x-4">
                        {player.image ? (
                            <div className="w-16 h-16">
                                <img
                                    src={player.image}
                                    alt={player.name}
                                    className="h-full w-full rounded-full object-cover"
                                />
                            </div>
                        ) : (
                            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                                <UserRound className="h-8 w-8 text-muted-foreground" />
                            </div>
                        )}
                        <div>
                            <h3 className="text-xl font-bold">{player.name}</h3>
                            <p className="text-muted-foreground">{player.position}</p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between py-2 border-b">
                            <span className="font-medium">Sold to:</span>
                            <div className="flex items-center gap-2">
                                <span>{team.name}</span>
                                <div
                                    className="w-4 h-4 rounded-full"
                                    style={{ backgroundColor: team.color }}
                                />
                            </div>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b">
                            <span className="font-medium">Purchase Amount:</span>
                            <span className="text-green-600 font-bold">${purchaseAmount}</span>
                        </div>
                    </div>

                    {player.stats && (
                        <div className="grid grid-cols-3 gap-2 pt-2">
                            {Object.entries(player.stats).map(([key, value]) => (
                                <div key={key} className="rounded bg-muted p-2 text-center">
                                    <p className="text-xs text-muted-foreground capitalize">{key}</p>
                                    <p className="font-medium">{String(value)}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default PlayerSoldModal; 