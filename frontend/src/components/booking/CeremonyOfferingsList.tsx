import React from 'react';
import { Check } from 'lucide-react';
import { PriestService } from '@/types/priest.types';
import { formatCurrency } from '@/lib/utils';

interface CeremonyOfferingsListProps {
  services: PriestService[];
  selectedService: PriestService | null;
  onSelectService: (service: PriestService) => void;
}

/**
 * ============================================================================
 * [COMPONENT: CEREMONY OFFERINGS LIST]
 * List of rituals offered by a purohit with custom Dakshina pricing and details.
 * ============================================================================
 */
export const CeremonyOfferingsList: React.FC<CeremonyOfferingsListProps> = ({
  services,
  selectedService,
  onSelectService,
}) => {
  return (
    <div className="space-y-3.5">
      <div className="flex flex-wrap items-center justify-between gap-1.5 pb-2 border-b border-amber-100">
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center h-6 w-6 rounded-full bg-[#780016] text-white font-bold text-xs shrink-0">
            1
          </span>
          <h2 className="text-sm sm:text-base font-bold font-serif text-stone-900">
            Select Sacred Ceremony & Dakshina Rate
          </h2>
        </div>
        <span className="text-[10px] sm:text-[11px] text-emerald-800 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded shrink-0">
          Direct Cash After Puja
        </span>
      </div>

      {!services || services.length === 0 ? (
        <div className="p-6 text-center text-xs text-stone-500 border border-dashed border-amber-300 bg-amber-50/40 rounded-lg">
          This priest has not configured specific ritual packages yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {services.map((srv) => {
            const isSelected = selectedService?.id === srv.id;
            return (
              <div
                key={srv.id}
                onClick={() => onSelectService(srv)}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between gap-3 text-left ${
                  isSelected
                    ? 'border-[#780016] ring-2 ring-red-700/20 bg-amber-50/40 shadow-xs'
                    : 'border-amber-200 hover:border-amber-400 bg-white'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-sm text-stone-900 font-serif leading-snug">
                      {srv.serviceName}
                    </h3>
                    {isSelected && (
                      <span className="h-5 w-5 rounded-full bg-[#780016] text-white flex items-center justify-center shrink-0">
                        <Check className="h-3 w-3 stroke-3" />
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-stone-600 line-clamp-2">
                    Traditional Shastric Vidhi with complete samagri guidance and auspicious mantras.
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-amber-100 text-xs">
                  <span className="text-stone-500 font-medium">Dakshina:</span>
                  <strong className="text-base font-serif font-bold text-[#780016]">
                    {formatCurrency(srv.price)}
                  </strong>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
