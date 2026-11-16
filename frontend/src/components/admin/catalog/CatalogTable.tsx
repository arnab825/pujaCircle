import React from 'react';
import { Clock, Edit2, Trash2 } from 'lucide-react';
import { PujaCatalogEntry } from '@/types/catalog.types';
import { CatalogCategoryBadge } from '@/components/admin/catalog/CatalogCategoryBadge';

interface CatalogTableProps {
  catalog: PujaCatalogEntry[];
  totalCount: number;
  onEdit: (entry: PujaCatalogEntry) => void;
  onDelete: (id: string) => void;
  onResetFilter: () => void;
}

/**
 * ============================================================================
 * [COMPONENT: CATALOG TABLE]
 * Searchable list and responsive table view of Vedic ceremonies in the catalog.
 * ============================================================================
 */
export const CatalogTable: React.FC<CatalogTableProps> = ({
  catalog,
  totalCount,
  onEdit,
  onDelete,
  onResetFilter,
}) => {
  return (
    <div className="rounded-xl border-2 border-amber-300 bg-white shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-amber-100/70 border-b border-amber-300 text-stone-900 font-bold uppercase tracking-wider text-[11px]">
            <tr>
              <th className="py-3.5 px-4 font-serif">Ceremony Details</th>
              <th className="py-3.5 px-4 font-serif">Category</th>
              <th className="py-3.5 px-4 font-serif">Intent Tags</th>
              <th className="py-3.5 px-4 font-serif">Samagri & Vidhi</th>
              <th className="py-3.5 px-4 text-right pr-6 font-serif">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-amber-100">
            {catalog.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-stone-500 space-y-2">
                  <p className="font-semibold text-stone-700 font-serif">
                    No catalog ceremonies found for this category or search.
                  </p>
                  <button
                    type="button"
                    onClick={onResetFilter}
                    className="text-xs text-[#780016] font-bold underline hover:text-red-800 cursor-pointer"
                  >
                    Reset filter to All Ceremonies
                  </button>
                </td>
              </tr>
            ) : (
              catalog.map((entry) => (
                <tr key={entry.id} className="hover:bg-amber-50/40 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3.5">
                      <div className="relative w-16 h-12 rounded-lg overflow-hidden border-2 border-amber-300 shadow-2xs shrink-0 group">
                        <img
                          src={entry.coverImage || '/images/hero_vedic_puja.webp'}
                          alt={entry.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300 bg-stone-100"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/images/hero_vedic_puja.webp';
                          }}
                        />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-serif font-extrabold text-stone-950 text-sm hover:text-[#780016] transition-colors leading-tight">
                          {entry.name}
                        </h4>
                        <div className="flex flex-wrap items-center gap-2 text-[11px]">
                          <span className="font-medium text-amber-950 flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            <span className="text-amber-600">🕉️</span> Deity: <strong>{entry.deity}</strong>
                          </span>
                          <span className="font-semibold text-stone-700 bg-stone-100 px-2 py-0.5 rounded border border-stone-200 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-amber-700" />
                            <span>
                              {entry.durationMinutes || 120} mins ({((entry.durationMinutes || 120) / 60).toFixed(1)} hrs)
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <CatalogCategoryBadge category={entry.category} />
                  </td>
                  <td className="py-3.5 px-4 max-w-xs">
                    <div className="flex flex-wrap gap-1.5">
                      {entry.intentTags.map((tag) => {
                        const cleanTag = tag.replace(/^["'\s]+|["',\s]+$/g, '').trim();
                        if (!cleanTag) return null;
                        return (
                          <span
                            key={cleanTag}
                            className="inline-flex items-center rounded-md bg-stone-100 hover:bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-stone-700 hover:text-amber-950 border border-stone-200 transition-colors"
                          >
                            #{cleanTag}
                          </span>
                        );
                      })}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-xs space-y-1 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 font-medium text-stone-800">
                      <span className="text-amber-700">📦</span>
                      <span>
                        <strong>{entry.samagriList.length}</strong> Samagri items
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-stone-600 text-[11px]">
                      <span className="text-emerald-700">📜</span>
                      <span>
                        <strong>{entry.steps.length}</strong> Vidhi steps
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-right pr-6 whitespace-nowrap">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => onEdit(entry)}
                        className="h-8 w-8 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 flex items-center justify-center transition-all cursor-pointer shadow-2xs hover:scale-105 active:scale-95"
                        title="Edit Ceremony"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(entry.id)}
                        className="h-8 w-8 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 flex items-center justify-center transition-all cursor-pointer shadow-2xs hover:scale-105 active:scale-95"
                        title="Delete Ceremony"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="p-3.5 bg-amber-50/60 border-t border-amber-200 text-xs text-stone-700 flex flex-col sm:flex-row justify-between items-center gap-2">
        <span>
          Showing <strong className="text-stone-900 font-bold">{catalog.length}</strong> of {totalCount} catalog ceremonies
        </span>
        <span className="text-amber-900 font-semibold font-serif flex items-center gap-1.5">
          <span>🕉️</span> Verified Vedic Vidhi Catalog Directory
        </span>
      </div>
    </div>
  );
};
