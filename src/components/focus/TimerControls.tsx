"use client";

import { useTimerStore } from "@/stores/useTimerStore";
import { Button } from "@/components/ui/button";
import { Play, Pause, RefreshCw, StopCircle } from "lucide-react";

export function TimerControls() {
    const { isRunning, start, pause, reset } = useTimerStore();

    return (
        <div className="flex items-center space-x-4">
            <Button
                variant="outline"
                size="lg"
                onClick={() => isRunning ? pause() : start()}
                className="w-32 h-14 rounded-full text-lg font-semibold border-2 hover:border-primary transition-all shadow-lg shadow-primary/10"
            >
                {isRunning ? (
                    <>
                        <Pause className="mr-2 h-5 w-5" /> Pause
                    </>
                ) : (
                    <>
                        <Play className="mr-2 h-5 w-5 fill-current" /> Start
                    </>
                )}
            </Button>
            <Button
                variant="ghost"
                size="icon"
                onClick={reset}
                className="h-12 w-12 rounded-full hover:bg-muted"
                title="Reset Timer"
            >
                <RefreshCw className="h-5 w-5" />
            </Button>
            {/* Optional: Stop/Complete early button */}
            {/* <Button variant="destructive" size="icon" className="h-12 w-12 rounded-full"><StopCircle className="h-5 w-5" /></Button> */}
        </div>
    );
}
