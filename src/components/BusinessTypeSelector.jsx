import React, { useState } from 'react';
import { Check, Store, Briefcase, Users, Laptop, Building2, GraduationCap } from 'lucide-react';
import { cn } from '@/lib/utils';

const FALLBACK_TYPES = [
  { id: 'retail', name: 'Retail Store', description: 'Physical or online store selling products.' },
  { id: 'service', name: 'Service Provider', description: 'Business offering professional services.' },
  { id: 'agency', name: 'Agency', description: 'Manage multiple clients and projects.' },
  { id: 'freelancer', name: 'Freelancer', description: 'Solo professional managing clients.' },
  { id: 'education', name: 'Education', description: 'Schools or training institutes.' },
  { id: 'other', name: 'Other Business', description: 'Generic setup.' }
];

const BusinessTypeSelector = ({ value, onChange, onCustomCategoryChange, disabled }) => {
  // Using static types for now as DB is mock
  const types = FALLBACK_TYPES;

  const handleSelect = (typeId) => {
    if (disabled) return;
    onChange(typeId);
    if (onCustomCategoryChange) onCustomCategoryChange('');
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {types.map((type) => {
        const isSelected = value === type.id;
        return (
          <div
            key={type.id}
            onClick={() => handleSelect(type.id)}
            className={cn(
              "p-6 rounded-2xl border-2 cursor-pointer transition-all",
              isSelected ? "border-primary bg-primary/10" : "border-gray-800 bg-gray-900/50"
            )}
          >
            <h3 className="font-bold text-lg mb-1">{type.name}</h3>
            <p className="text-sm text-gray-400">{type.description}</p>
          </div>
        );
      })}
    </div>
  );
};

export default BusinessTypeSelector;