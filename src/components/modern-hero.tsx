import { Star, ArrowRight } from "lucide-react";
import React from "react";
import Link from "next/link";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface Hero7Props {
  heading?: string;
  description?: string;
  button?: {
    text: string;
    url: string;
  };
  reviews?: {
    count: number;
    avatars: {
      src: string;
      alt: string;
    }[];
  };
}

const Hero7 = ({
  heading = "A Collection of Components Built With Shadcn & Tailwind",
  description = "Finely crafted components built with React, Tailwind and Shadcn UI. Developers can copy and paste these blocks directly into their project.",
  button = {
    text: "Discover all components",
    url: "https://www.shadcnblocks.com",
  },
  reviews = {
    count: 10000,
    avatars: [
      { src: "https://www.shadcnblocks.com/images/block/avatar-1.webp", alt: "Avatar 1" },
      { src: "https://www.shadcnblocks.com/images/block/avatar-2.webp", alt: "Avatar 2" },
      { src: "https://www.shadcnblocks.com/images/block/avatar-3.webp", alt: "Avatar 3" },
      { src: "https://www.shadcnblocks.com/images/block/avatar-4.webp", alt: "Avatar 4" },
      { src: "https://www.shadcnblocks.com/images/block/avatar-5.webp", alt: "Avatar 5" },
    ],
  },
}: Hero7Props) => {
  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
      <div className="container relative z-10 mx-auto px-6 text-center">
        <div className="mx-auto flex max-w-screen-xl flex-col items-center gap-8">

          <div className="inline-flex items-center rounded-full border border-indigo-500/20 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-indigo-400 bg-indigo-500/5 backdrop-blur-sm">
            <span className="flex h-2 w-2 rounded-full bg-indigo-500 mr-2 animate-pulse" />
            The Future of Study Discipline
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[0.9] text-white max-w-5xl">
            {heading.split('.').map((part, i) => (
              <React.Fragment key={i}>
                {i === 1 ? (
                  <span className="block bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400">
                    {part.trim()}
                  </span>
                ) : (
                  part
                )}
                {i === 0 && <br className="hidden md:block" />}
              </React.Fragment>
            ))}
          </h1>

          <p className="max-w-2xl text-lg md:text-xl text-white/50 leading-relaxed font-medium text-balance">
            {description}
          </p>

          <div className="flex flex-col sm:flex-row gap-5">
            <Button asChild size="lg" className="h-16 px-10 rounded-2xl text-lg font-black bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-2xl shadow-indigo-500/40 border-0 text-white">
              <Link href={button.url} className="flex items-center">
                {button.text} <ArrowRight className="ml-2 h-6 w-6" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="h-16 px-10 rounded-2xl text-lg font-black border-white/10 bg-white/5 hover:bg-white/10 text-white backdrop-blur-md">
              Watch the Engine in Action
            </Button>
          </div>

          <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row bg-white/5 p-4 rounded-3xl border border-white/5 backdrop-blur-md">
            <span className="flex items-center -space-x-4">
              {reviews.avatars.map((avatar, index) => (
                <Avatar key={index} className="size-12 border-2 border-[#020410] shadow-xl">
                  <AvatarImage src={avatar.src} alt={avatar.alt} />
                </Avatar>
              ))}
            </span>
            <div className="flex flex-col items-start px-2">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, index) => (
                  <Star
                    key={index}
                    className="size-4 fill-indigo-400 text-indigo-400"
                  />
                ))}
              </div>
              <p className="text-xs font-black uppercase tracking-wider text-white/40">
                Trusted by {reviews.count.toLocaleString()}+ high-performers
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100%] h-[100%] bg-indigo-500/5 rounded-full blur-[120px] -z-10" />
    </section>
  );
};

export { Hero7 };
