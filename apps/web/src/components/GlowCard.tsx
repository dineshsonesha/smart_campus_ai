import React from 'react';
import { cn } from '@/lib/utils';

interface GlowCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  glowColor?: 'green' | 'blue' | 'red' | 'amber';
  title?: string;
  headerAction?: React.ReactNode;
}

export const GlowCard: React.FC<GlowCardProps> = ({
  children,
  className,
  glowColor = 'green',
  title,
  headerAction,
  ...props
}) => {
  const glowClass = {
    green: 'glow-border-green',
    blue: 'glow-border-blue',
    red: 'glow-border-red',
    amber: 'border-neon-amber/30 shadow-[0_0_15px_-5px_rgba(255,170,0,0.3)]',
  }[glowColor];

  return (
    <div
      className={cn(
        'glow-card flex flex-col',
        glowClass,
        className
      )}
      {...props}
    >
      {(title || headerAction) && (
        <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-white/[0.02]">
          {title && (
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
              {title}
            </h3>
          )}
          {headerAction}
        </div>
      )}
      <div className="flex-1 overflow-hidden">{children}</div>
    </div>
  );
};
