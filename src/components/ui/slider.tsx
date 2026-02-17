"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface SliderProps extends React.InputHTMLAttributes<HTMLInputElement> {
    onValueChange?: (value: number[]) => void;
    value?: number[];
}

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
    ({ className, onValueChange, value, ...props }, ref) => {
        return (
            <input
                ref={ref}
                type="range"
                className={cn(
                    "w-full h-2 bg-secondary rounded-full appearance-none cursor-pointer accent-primary",
                    className
                )}
                value={value?.[0]}
                onChange={(e) => onValueChange?.([parseInt(e.target.value)])}
                {...props}
            />
        )
    }
)
Slider.displayName = "Slider"

export { Slider }
