import React from 'react';
import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { calculatePasswordStrength, getPasswordRequirements } from '@/lib/formValidation';

export const PasswordStrengthMeter = ({ password }) => {
  const strengthInfo = calculatePasswordStrength(password);
  const requirements = getPasswordRequirements(password);

  return (
    <div className="space-y-3 mt-2">
      {/* Strength Bar Header */}
      <div className="flex justify-between items-center text-xs">
        <span className="text-slate-400 font-medium">Strength</span>
        <span className={cn("font-bold transition-colors duration-300", {
            'text-[#ef4444]': strengthInfo.label === 'Weak',
            'text-[#f97316]': strengthInfo.label === 'Fair',
            'text-[#eab308]': strengthInfo.label === 'Good',
            'text-[#22c55e]': strengthInfo.label === 'Strong' || strengthInfo.label === 'Perfect'
        })}>
          {strengthInfo.label}
        </span>
      </div>
      
      {/* Progress Bar */}
      <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
        <div 
            className={cn("h-full transition-all duration-500 ease-out", strengthInfo.color)} 
            style={{ width: strengthInfo.width }} 
        />
      </div>

      {/* Requirements Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 pt-2">
        {requirements.map((req) => (
          <div key={req.id} className="flex items-center space-x-2 text-xs">
            <div className={cn("h-4 w-4 rounded-full flex items-center justify-center shrink-0 transition-colors duration-300", 
                req.met ? "bg-green-500/20 text-green-500" : "bg-red-500/10 text-red-500"
            )}>
                {req.met ? <Check className="h-2.5 w-2.5" /> : <X className="h-2.5 w-2.5" />}
            </div>
            <span className={cn("transition-colors duration-300", req.met ? "text-slate-300" : "text-slate-500")}>
              {req.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PasswordStrengthMeter;