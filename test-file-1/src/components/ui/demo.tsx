import React from 'react';
import { GlowCard } from "@/components/ui/spotlight-card";

export function Default() {
  return (
    <div className="w-screen h-screen flex flex-row items-center justify-center gap-10 custom-cursor bg-slate-950 p-8">
      <GlowCard glowColor="amber" size="md">
        <div className="p-4 text-white">
          <h3 className="font-bold text-lg mb-2">Books & Notes</h3>
          <p className="text-sm opacity-80">Amber glowing card for course textbooks & verified notes.</p>
        </div>
      </GlowCard>
      <GlowCard glowColor="cyan" size="md">
        <div className="p-4 text-white">
          <h3 className="font-bold text-lg mb-2">Electronics & Gadgets</h3>
          <p className="text-sm opacity-80">Cyan electric glow for calculators, tablets & cables.</p>
        </div>
      </GlowCard>
      <GlowCard glowColor="fuchsia" size="md">
        <div className="p-4 text-white">
          <h3 className="font-bold text-lg mb-2">Handmade & Art</h3>
          <p className="text-sm opacity-80">Magenta neon glow for canvases, crochet & craft goods.</p>
        </div>
      </GlowCard>
    </div>
  );
}

export default Default;
