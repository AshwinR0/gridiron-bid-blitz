import { Button } from "@/components/ui/button";
import confetti from "canvas-confetti";
import { ReactNode } from "react";

interface ConfettiButtonProps {
    children: ReactNode;
    className?: string;
    onClick?: () => void;
    disabled?: boolean;
}

export function ConfettiButton({ children, className, onClick, disabled }: ConfettiButtonProps) {
    return (
        <Button
            className={className}
            onClick={() => {
                if (disabled) return;
                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 }
                });
                onClick?.();
            }}
            disabled={disabled}
        >
            {children}
        </Button>
    );
} 