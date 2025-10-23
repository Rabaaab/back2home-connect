import React from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  maxStars?: number;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
}

export function StarRating({ 
  rating, 
  maxStars = 5, 
  size = "md",
  showValue = false,
  interactive = false,
  onRatingChange
}: StarRatingProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6"
  };

  const handleClick = (value: number) => {
    if (interactive && onRatingChange) {
      onRatingChange(value);
    }
  };

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: maxStars }, (_, i) => {
        const starValue = i + 1;
        const filled = starValue <= Math.round(rating);
        
        return (
          <Star
            key={i}
            className={cn(
              sizeClasses[size],
              filled ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground",
              interactive && "cursor-pointer hover:scale-110 transition-transform"
            )}
            onClick={() => handleClick(starValue)}
          />
        );
      })}
      {showValue && (
        <span className="text-sm text-muted-foreground ml-1">
          ({rating.toFixed(1)})
        </span>
      )}
    </div>
  );
}