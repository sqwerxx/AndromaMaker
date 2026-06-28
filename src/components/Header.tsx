import React from 'react';
import { PlanType } from '../types';
import { Sparkles, Layers } from 'lucide-react';

interface HeaderProps {
  selectedPlan: PlanType;
}

export default function Header({ selectedPlan }: HeaderProps) {
  const getPlanBadgeStyles = () => {
    switch (selectedPlan) {
      case 'free':
        return 'bg-warm-sand border-warm-clay text-charcoal-light/70';
      case 'encode':
        return 'bg-amber-gold/5 border-amber-gold/20 text-amber-gold font-medium';
      case 'pro':
        return 'bg-amber-gold/10 border-amber-gold/30 text-amber-gold font-semibold shadow-sm';
    }
  };

  const getPlanName = () => {
    switch (selectedPlan) {
      case 'free': return 'Free';
      case 'encode': return 'Encode Developer';
      case 'pro': return 'Architect PRO';
    }
  };

  return (
    <header className="border-b border-warm-clay bg-white sticky top-0 z-50 py-5 px-8 shrink-0 flex items-center justify-between">
      {/* Brand logo & design indicators */}
      <div className="flex items-center gap-3">
        <div>
          <h1 className="font-serif italic text-2xl tracking-tight text-amber-gold font-medium">
            Architect
          </h1>
          <p className="text-[9px] uppercase tracking-widest text-muted-gray font-sans font-semibold mt-0.5">
            Premium Constructor
          </p>
        </div>
      </div>

      {/* Subscription level badge */}
      <div className="flex items-center gap-4">
        <div className={`px-4 py-1.5 rounded-full border text-xs flex items-center gap-1.5 transition-all select-none ${getPlanBadgeStyles()}`}>
          <Sparkles className="w-3.5 h-3.5" />
          <span className="font-medium tracking-wide">{getPlanName()}</span>
        </div>
      </div>
    </header>
  );
}
