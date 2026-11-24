import React, { useState, useEffect } from "react";
import { Plus, Search, Filter, Trash2, Loader2, AlertTriangle } from "lucide-react";
import { PujaCatalogEntry } from "@/types/catalog.types";
import { catalogApi } from "@/api/catalog.api";
import { apiClient } from "@/api/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

// Modular Subcomponents
import { CatalogTable } from "@/components/admin/catalog/CatalogTable";
import { CatalogItemModal } from "@/components/admin/catalog/CatalogItemModal";

/**
 * ============================================================================
 * [PAGE: ADMIN CATALOG]
 * Central administrative catalog for verified Vedic ceremonies, samagri requirements,
 * and standard duration guidelines.
 * 100% Flexbox, zero CSS grids, pure solid white canvas, Haldi gold trims.
 * ============================================================================
 */
export const AdminCatalogPage: React.FC = () => {
  const [catalog, setCatalog] = useState<PujaCatalogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  // Modal states for Create / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<PujaCatalogEntry | null>(null);

  // Custom Delete Modal State
  const [entryToDelete, setEntryToDelete] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const normalizeCat = (c: string) => (c || "").toLowerCase().replace(/[\s_-]+/g, "");

  const filteredCatalog = catalog.filter((entry) => {
    const matchesSearch =
      entry.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.deity.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.intentTags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesCategory =
      selectedCategory === "ALL" ||
      normalizeCat(entry.category) === normalizeCat(selectedCategory);

    return matchesSearch && matchesCategory;
  });

  const loadCatalog = async () => {
    try {
      setIsLoading(true);
      const data = await catalogApi.getCatalog();
      setCatalog(data);
    } catch {
      toast.error("Failed to load catalog entries.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCatalog();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingEntry(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (entry: PujaCatalogEntry) => {
    setEditingEntry(entry);
    setIsModalOpen(true);
  };

  const handleDeleteEntry = (id: string) => {
    const item = catalog.find((c) => c.id === id);
    setEntryToDelete({ id, name: item?.name || "this puja ceremony" });
  };

  const handleConfirmDeleteEntry = async () => {
    if (!entryToDelete) return;
    setIsDeleting(true);
    try {
      await apiClient.delete(`/catalog/${entryToDelete.id}`);
      toast.success(`"${entryToDelete.name}" removed from catalog.`);
      setEntryToDelete(null);
      loadCatalog();
    } catch {
      toast.error("Failed to delete catalog entry.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 pb-16 w-full max-w-7xl text-stone-900">
      {/* 1. Page Header (100% Flexbox) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-7 rounded-xl border-2 border-amber-300 bg-white shadow-sm">
        <div className="flex items-start gap-3 sm:gap-4 min-w-0">
          <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-md bg-amber-400 text-stone-950 flex items-center justify-center font-serif font-black text-xl sm:text-2xl shadow-md shrink-0 select-none">
            ॐ
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-3xl font-extrabold font-serif text-stone-950 wrap-break-word">
              Vedic Puja Catalog
            </h1>
            <p className="text-xs text-stone-600 mt-1 leading-relaxed">
              Standardized ritual definitions, authentic samagri lists, and vidhi steps for Purohit offerings.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleOpenCreateModal}
          className="bg-[#780016] hover:bg-[#600012] text-white border border-amber-400 rounded-lg px-4 py-2.5 text-xs font-bold shadow-xs cursor-pointer transition-all flex items-center justify-center gap-2 shrink-0 hover:scale-102 active:scale-98"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Ceremony</span>
        </button>
      </div>

      {/* 2. Search & Category Filters (Pure Flexbox) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-3.5 sm:p-4 rounded-xl border-2 border-amber-300 bg-white shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by ceremony name, presiding deity, or intent tag..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 shrink-0">
          <Filter className="w-3.5 h-3.5 text-amber-700 shrink-0 hidden sm:block" />
          {[
            { id: "ALL", label: "All Ceremonies" },
            { id: "life-event", label: "Life Events" },
            { id: "dosha-nivaran", label: "Dosha Nivaran" },
            { id: "festival", label: "Festivals" },
            { id: "business", label: "Business" },
            { id: "ancestral", label: "Ancestral" },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? "bg-[#780016] text-white border border-amber-400 shadow-2xs font-bold"
                  : "bg-amber-50/70 hover:bg-amber-100 text-stone-800 border border-amber-200"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Catalog Table */}
      {isLoading ? (
        <div className="p-12 text-center text-stone-500 rounded-xl border-2 border-amber-300 bg-white flex flex-col items-center justify-center gap-3">
          <div className="h-10 w-10 rounded-md bg-amber-400 text-stone-950 flex items-center justify-center font-serif font-black text-xl shadow-xs animate-pulse">
            ॐ
          </div>
          <span className="text-xs font-semibold text-stone-700">
            Loading Vedic rituals from central repository...
          </span>
        </div>
      ) : (
        <CatalogTable
          catalog={filteredCatalog}
          totalCount={catalog.length}
          onEdit={handleOpenEditModal}
          onDelete={handleDeleteEntry}
          onResetFilter={() => {
            setSelectedCategory("ALL");
            setSearchQuery("");
          }}
        />
      )}

      {/* 4. Create / Edit Ceremony Modal */}
      <CatalogItemModal
        isOpen={isModalOpen}
        editingEntry={editingEntry}
        onClose={() => setIsModalOpen(false)}
        onSaved={loadCatalog}
      />

      {/* 5. Custom Delete Ceremony Confirmation Modal */}
      <Dialog
        open={Boolean(entryToDelete)}
        onOpenChange={(open) => !open && !isDeleting && setEntryToDelete(null)}
      >
        <DialogContent className="sm:max-w-md border-2 border-amber-300 bg-white">
          <DialogHeader className="text-left space-y-2">
            <div className="flex items-center gap-2 text-red-700">
              <div className="p-2 rounded-full bg-red-100 text-red-700 shrink-0">
                <Trash2 className="h-5 w-5" />
              </div>
              <DialogTitle className="font-serif text-lg font-bold text-stone-950">
                Remove Catalog Ceremony?
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-stone-600 leading-relaxed pt-1">
              Are you sure you want to remove{' '}
              <strong className="text-stone-900 font-semibold">"{entryToDelete?.name}"</strong> from the central catalog?
              Priests will no longer be able to select and offer this ceremony.
            </DialogDescription>
          </DialogHeader>

          <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-900 flex items-start gap-2 my-2">
            <AlertTriangle className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
            <span>
              Existing priest offerings and completed bookings associated with this ceremony will remain preserved in historical records.
            </span>
          </div>

          <DialogFooter className="mt-4 flex flex-row items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setEntryToDelete(null)}
              disabled={isDeleting}
              className="text-xs border-stone-300 hover:border-stone-400 font-medium cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirmDeleteEntry}
              disabled={isDeleting}
              className="text-xs gap-1.5 bg-[#780016] hover:bg-[#600012] text-white font-bold cursor-pointer"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Removing...</span>
                </>
              ) : (
                <>
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Remove Ceremony</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCatalogPage;
