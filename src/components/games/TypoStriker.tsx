"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Zap, Target, Trophy, XCircle } from "lucide-react";
import { useUserStore } from "@/stores/useUserStore";
import toast from "react-hot-toast";

const WORDS = [
    "discipline", "consistency", "intelligence", "operative", "protocol",
    "engine", "multiplier", "prestige", "focus", "survival",
    "restriction", "adaptive", "behavioral", "performance", "hierarchy"
];

export function TypoStriker() {
    const { addXP } = useUserStore();
    const [word, setWord] = useState("");
    const [userInput, setUserInput] = useState("");
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(30);
    const [isActive, setIsActive] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        let interval: any;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => setTimeLeft(t => t - 1), 1000);
        } else if (timeLeft === 0 && isActive) {
            endGame();
        }
        return () => clearInterval(interval);
    }, [isActive, timeLeft]);

    const startGame = () => {
        setScore(0);
        setTimeLeft(30);
        setIsActive(true);
        nextWord();
    };

    const nextWord = () => {
        setWord(WORDS[Math.floor(Math.random() * WORDS.length)]);
        setUserInput("");
    };

    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setUserInput(val);
        if (val.toLowerCase() === word.toLowerCase()) {
            setScore(s => s + 1);
            nextWord();
        }
    };

    const endGame = () => {
        setIsActive(false);
        const xp = score * 5;
        if (xp > 0) {
            addXP(xp, `Typo Striker Reward (Score: ${score})`);
            toast.success(`Session Complete! Earned ${xp} XP.`);
        }
    };

    return (
        <Card className="border-primary/20 bg-background shadow-2xl">
            <CardHeader className="text-center">
                <CardTitle className="text-2xl font-black uppercase tracking-tighter flex items-center justify-center">
                    <Zap className="mr-2 h-6 w-6 text-yellow-500 fill-yellow-500" />
                    Typo Striker
                </CardTitle>
                <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Strike the errors. Gain the edge.</p>
            </CardHeader>
            <CardContent className="space-y-6">
                {!isActive ? (
                    <div className="text-center space-y-4">
                        <div className="h-32 flex flex-col items-center justify-center bg-muted/20 rounded-2xl border border-dashed">
                            <Trophy className="h-10 w-10 text-primary mb-2 opacity-50" />
                            <div className="text-sm font-bold text-muted-foreground italic">Last Score: {score}</div>
                        </div>
                        <Button className="w-full h-12 rounded-xl font-black uppercase tracking-widest" onClick={startGame}>
                            Initialize Session
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-6 animate-in fade-in duration-300">
                        <div className="flex justify-between items-center px-4 bg-muted/30 py-2 rounded-xl border">
                            <div className="flex items-center gap-2">
                                <Target className="h-4 w-4 text-primary" />
                                <span className="font-black text-lg">{score}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="font-black text-lg text-primary">{timeLeft}s</span>
                            </div>
                        </div>

                        <div className="text-center py-8">
                            <div className="text-4xl font-black uppercase tracking-widest text-primary animate-pulse">
                                {word}
                            </div>
                        </div>

                        <Input
                            ref={inputRef}
                            autoFocus
                            placeholder="Type the word..."
                            className="h-14 text-center text-xl font-bold uppercase tracking-widest bg-muted/20"
                            value={userInput}
                            onChange={handleInput}
                        />

                        <Button variant="ghost" className="w-full text-muted-foreground hover:text-destructive" onClick={() => setTimeLeft(0)}>
                            <XCircle className="mr-2 h-4 w-4" /> Abort Session
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
