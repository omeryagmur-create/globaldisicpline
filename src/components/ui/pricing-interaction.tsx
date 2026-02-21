import NumberFlow from '@number-flow/react'
import React from "react";
import { cn } from "@/lib/utils";

export function PricingInteraction({
  starterMonth,
  starterAnnual,
  proMonth,
  proAnnual,
}: {
  starterMonth: number;
  starterAnnual: number;
  proMonth: number;
  proAnnual: number;
}) {
  const [active, setActive] = React.useState(1); // Default to Starter
  const [period, setPeriod] = React.useState(0);

  const [starter, setStarter] = React.useState(starterMonth);
  const [pro, setPro] = React.useState(proMonth);

  const handleChangePlan = (index: number) => {
    setActive(index);
  };

  const handleChangePeriod = (index: number) => {
    setPeriod(index);
    if (index === 0) {
      setStarter(starterMonth);
      setPro(proMonth);
    } else {
      setStarter(starterAnnual);
      setPro(proAnnual);
    }
  };

  return (
    <div className="border border-white/10 rounded-[40px] p-4 shadow-2xl max-w-md w-full flex flex-col items-center gap-4 bg-white/5 backdrop-blur-xl">
      <div className="rounded-full relative w-full bg-white/5 p-1.5 flex items-center border border-white/10">
        <button
          className={cn(
            "font-bold rounded-full w-full p-2.5 z-20 transition-colors",
            period === 0 ? "text-black" : "text-white/50"
          )}
          onClick={() => handleChangePeriod(0)}
        >
          Monthly
        </button>
        <button
          className={cn(
            "font-bold rounded-full w-full p-2.5 z-20 transition-colors",
            period === 1 ? "text-black" : "text-white/50"
          )}
          onClick={() => handleChangePeriod(1)}
        >
          Yearly
        </button>
        <div
          className="p-1.5 flex items-center justify-center absolute inset-0 w-1/2 z-10"
          style={{
            transform: `translateX(${period * 100}%)`,
            transition: "transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          <div className="bg-white rounded-full w-full h-full shadow-lg"></div>
        </div>
      </div>

      <div className="w-full relative flex flex-col gap-4">
        {/* Plan 1: Free */}
        <div
          className={cn(
            "w-full flex justify-between cursor-pointer border-2 p-6 rounded-[2rem] transition-all duration-300",
            active === 0 ? "border-indigo-500 bg-indigo-500/10 shadow-[0_0_20px_rgba(99,102,241,0.2)]" : "border-white/5 bg-white/5 hover:border-white/20"
          )}
          onClick={() => handleChangePlan(0)}
        >
          <div className="flex flex-col items-start">
            <p className="font-extrabold text-xl text-white">Free</p>
            <p className="text-white/40 text-sm">
              <span className="text-white font-bold">$0.00</span>/month
            </p>
          </div>
          <div
            className={cn(
              "size-7 rounded-full border-2 flex items-center justify-center transition-all",
              active === 0 ? "border-indigo-500" : "border-white/20"
            )}
          >
            <div
              className={cn(
                "size-3.5 bg-indigo-500 rounded-full transition-all",
                active === 0 ? "opacity-100 scale-100" : "opacity-0 scale-50"
              )}
            ></div>
          </div>
        </div>

        {/* Plan 2: Starter */}
        <div
          className={cn(
            "w-full flex justify-between cursor-pointer border-2 p-6 rounded-[2rem] transition-all duration-300 relative overflow-hidden",
            active === 1 ? "border-purple-500 bg-purple-500/10 shadow-[0_0_20px_rgba(168,85,247,0.2)]" : "border-white/5 bg-white/5 hover:border-white/20"
          )}
          onClick={() => handleChangePlan(1)}
        >
          <div className="flex flex-col items-start gap-1">
            <div className="flex items-center gap-2">
              <p className="font-extrabold text-xl text-white">Starter</p>
              <span className="py-1 px-3 rounded-full bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 text-indigo-400 text-xs font-black uppercase tracking-wider">
                Popular
              </span>
            </div>
            <p className="text-white/40 text-sm flex items-center">
              <span className="text-white font-bold flex items-center">
                ${" "}<NumberFlow value={starter} />
              </span>
              /month
            </p>
          </div>
          <div
            className={cn(
              "size-7 rounded-full border-2 flex items-center justify-center transition-all",
              active === 1 ? "border-purple-500" : "border-white/20"
            )}
          >
            <div
              className={cn(
                "size-3.5 bg-purple-500 rounded-full transition-all",
                active === 1 ? "opacity-100 scale-100" : "opacity-0 scale-50"
              )}
            ></div>
          </div>
        </div>

        {/* Plan 3: Pro */}
        <div
          className={cn(
            "w-full flex justify-between cursor-pointer border-2 p-6 rounded-[2rem] transition-all duration-300",
            active === 2 ? "border-pink-500 bg-pink-500/10 shadow-[0_0_20px_rgba(236,72,153,0.2)]" : "border-white/5 bg-white/5 hover:border-white/20"
          )}
          onClick={() => handleChangePlan(2)}
        >
          <div className="flex flex-col items-start">
            <p className="font-extrabold text-xl text-white">Pro</p>
            <p className="text-white/40 text-sm flex items-center">
              <span className="text-white font-bold flex items-center">
                ${" "}<NumberFlow value={pro} />
              </span>
              /month
            </p>
          </div>
          <div
            className={cn(
              "size-7 rounded-full border-2 flex items-center justify-center transition-all",
              active === 2 ? "border-pink-500" : "border-white/20"
            )}
          >
            <div
              className={cn(
                "size-3.5 bg-pink-500 rounded-full transition-all",
                active === 2 ? "opacity-100 scale-100" : "opacity-0 scale-50"
              )}
            ></div>
          </div>
        </div>
      </div>

      <button className="mt-4 rounded-3xl bg-white text-lg font-black text-black w-full p-5 active:scale-95 transition-all duration-300 shadow-xl shadow-white/5 hover:bg-white/90">
        Unlock the Engine
      </button>
    </div>
  );
};

