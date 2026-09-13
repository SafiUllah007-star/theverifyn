import React from 'react';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'subtle' | 'interactive';
  id?: string;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  variant = 'default',
  id,
  ...props
}) => {
  const variantClasses = {
    default:
      'glass-card rounded-2xl p-6 border border-white/80 bg-white/75 backdrop-blur-xl shadow-[0_10px_30px_-10px_rgba(15,23,42,0.06),0_4px_12px_-2px_rgba(15,23,42,0.03)] transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-xl hover:border-slate-300/90 hover:bg-white/85',
    subtle:
      'glass-card-subtle rounded-xl p-5 border border-white/70 bg-white/65 backdrop-blur-lg shadow-sm transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-md hover:border-slate-300/80 hover:bg-white/80',
    interactive:
      'glass-card glass-card-interactive rounded-2xl p-6 border border-white/80 bg-white/75 backdrop-blur-xl cursor-pointer transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-xl hover:border-slate-300 hover:bg-white/90',
  }[variant];

  return (
    <div id={id} className={`${variantClasses} ${className}`} {...props}>
      {children}
    </div>
  );
};
