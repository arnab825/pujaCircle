import React, { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { priestApi } from '@/api/priest.api';
import { catalogApi } from '@/api/catalog.api';
import { PriestService } from '@/types/priest.types';
import { PujaCatalogEntry } from '@/types/catalog.types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit2, Power, Trash2, X, Loader2, Sparkles, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

/**
 * PriestServicesPage
 * Priest ceremony offerings catalogue and cash dakshina rates editor.
 * Fully responsive on mobile, tablet, and desktop: Zero modals, zero horizontal overflows.
 */
export const PriestServicesPage: React.FC = () => {
  const { user } = useAuthStore();
  const priestId = user?.id || '';

  const [services, setServices] = useState<PriestService[]>([]);
  const [catalog, setCatalog] = useState<PujaCatalogEntry[]>([]);
  const [isCatalogLoading, setIsCatalogLoading] = useState(false);

  // Inline Form State (replaces popup modal completely)
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingService, setEditingService] = useState<PriestService | null>(null);
  const [selectedCatalogId, setSelectedCatalogId] = useState<string>('');
  const [dakshinaPrice, setDakshinaPrice] = useState<number>(2500);
  const [isSaving, setIsSaving] = useState(false);

  const formRef = useRef<HTMLDivElement>(null);

  const fetchServices = async () => {
    try {
      const data = await priestApi.getPriestServices(priestId);
      setServices(data || []);
    } catch {
      toast.error('Failed to load services.');
    }
  };

  const fetchCatalog = async () => {
    try {
      setIsCatalogLoading(true);
      const items = await catalogApi.getCatalog();
      setCatalog(items || []);
    } catch {
      // silently handle
    } finally {
      setIsCatalogLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
    fetchCatalog();
  }, [priestId]);

  const handleOpenCreate = () => {
    setEditingService(null);
    setSelectedCatalogId('');
    setDakshinaPrice(2500);
    setIsFormOpen(true);
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
  };

  const handleOpenEdit = (service: PriestService) => {
    setEditingService(service);
    setSelectedCatalogId(service.pujaCatalogId || '');
    setDakshinaPrice(service.price);
    setIsFormOpen(true);
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingService(null);
    setSelectedCatalogId('');
    setDakshinaPrice(2500);
  };

  const handleCatalogSelect = (catalogId: string) => {
    setSelectedCatalogId(catalogId);
    if (!dakshinaPrice || dakshinaPrice <= 0) {
      setDakshinaPrice(2500);
    }
  };

  const handleSave = async () => {
    if (dakshinaPrice <= 0) {
      toast.error('Please enter a valid dakshina amount (greater than ₹0).');
      return;
    }

    try {
      setIsSaving(true);
      if (editingService) {
        // Update existing service price
        const res = await priestApi.updatePriestService(editingService.id, priestId, {
          serviceName: editingService.serviceName,
          price: dakshinaPrice,
        });

        if (res.success) {
          toast.success(`Dakshina rate updated for ${editingService.serviceName}.`);
          await fetchServices();
          handleCloseForm();
        } else {
          toast.error(res.message || 'Failed to update ceremony rate.');
        }
      } else {
        // Add new service from catalog
        const item = catalog.find((c) => c.id === selectedCatalogId);
        if (!item) {
          toast.error('Please select an accredited ceremony from the catalog.');
          return;
        }

        const res = await priestApi.createPriestService(priestId, {
          serviceName: item.name,
          price: dakshinaPrice,
          pujaCatalogId: item.id,
        });

        if (res.success) {
          toast.success(`"${item.name}" added to your ceremony offerings.`);
          await fetchServices();
          handleCloseForm();
        } else {
          toast.error(res.message || 'Failed to add ceremony offering.');
        }
      }
    } catch {
      toast.error('Failed to save ceremony offering.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggle = async (serviceId: string) => {
    try {
      const res = await priestApi.togglePriestService(serviceId, priestId);
      if (res.success) {
        toast.success(res.message);
        fetchServices();
      } else {
        toast.error(res.message);
      }
    } catch {
      toast.error('Failed to update service status.');
    }
  };

  const handleDelete = async (serviceId: string, serviceName: string) => {
    if (!window.confirm(`Are you sure you want to remove "${serviceName}" from your offerings?`)) {
      return;
    }
    try {
      const res = await priestApi.deletePriestService(serviceId, priestId);
      if (res.success) {
        toast.success(`"${serviceName}" removed.`);
        if (editingService?.id === serviceId) {
          handleCloseForm();
        }
        fetchServices();
      } else {
        toast.error(res.message || 'Failed to remove service.');
      }
    } catch {
      toast.error('Failed to remove service.');
    }
  };

  const offeredCatalogIds = new Set(services.map((s) => s.pujaCatalogId).filter(Boolean));
  const offeredNames = new Set(services.map((s) => s.serviceName.toLowerCase().trim()));
  const selectedCatalogItem = catalog.find((c) => c.id === selectedCatalogId);

  return (
    <div className="space-y-5 sm:space-y-6 w-full max-w-full overflow-hidden text-stone-900 pb-12">
      {/* 1. Page Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-7 rounded-xl border-2 border-amber-300 bg-white shadow-xs">
        <div className="flex items-start gap-3 sm:gap-4 min-w-0">
          <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-md bg-amber-400 text-stone-950 flex items-center justify-center font-serif font-black text-xl sm:text-2xl shadow-sm shrink-0 select-none">
            ॐ
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-3xl font-extrabold font-serif text-stone-950 leading-tight">
              Ceremony Offerings & Dakshina Rates
            </h1>
            <p className="text-xs text-stone-600 mt-1 leading-relaxed">
              Configure the specific Vedic rituals you offer and your recommended cash dakshina amounts.
            </p>
          </div>
        </div>

        <Button
          onClick={isFormOpen && !editingService ? handleCloseForm : handleOpenCreate}
          className="gap-2 text-xs h-10 sm:h-11 px-4 sm:px-5 bg-[#780016] hover:bg-red-800 text-white font-bold border border-amber-400 rounded-md shadow-xs cursor-pointer shrink-0 w-full sm:w-auto puja-btn-tap"
        >
          {isFormOpen && !editingService ? (
            <>
              <X className="h-4 w-4" /> Cancel Offering Form
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" /> Add Ceremony Offering
            </>
          )}
        </Button>
      </div>

      {/* 2. Responsive Inline Creator / Editor Card (Zero floating modal overlays) */}
      {isFormOpen && (
        <div
          ref={formRef}
          className="rounded-xl border-2 border-amber-400 bg-amber-50/50 p-4 sm:p-6 md:p-7 shadow-sm space-y-5 transition-all w-full max-w-full box-border"
        >
          {/* Card Header */}
          <div className="flex items-start justify-between gap-3 pb-3 border-b border-amber-300">
            <div className="flex items-start gap-2.5 min-w-0 flex-1">
              <div className="h-8 w-8 rounded-md bg-[#780016] text-amber-200 flex items-center justify-center font-serif font-black text-sm shrink-0 mt-0.5">
                ॐ
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="font-serif font-bold text-base sm:text-lg text-stone-950 leading-snug">
                  {editingService ? `Update Dakshina Rate: ${editingService.serviceName}` : 'Add Ceremony Offering'}
                </h2>
                <p className="text-[11px] sm:text-xs text-stone-600 mt-0.5 leading-relaxed">
                  {editingService
                    ? 'Adjust your recommended cash dakshina for this ritual.'
                    : 'Choose an authentic Vedic ceremony from the catalog and set your transparent dakshina.'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleCloseForm}
              className="h-8 w-8 rounded-full flex items-center justify-center text-stone-500 hover:text-stone-900 hover:bg-amber-200/50 shrink-0 cursor-pointer"
              title="Close form"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Form Fields: 1-Column on Mobile, 2-Column on Desktop */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 items-start w-full">
            {/* Field 1: Ceremony Selector / Display */}
            <div className="space-y-2 w-full min-w-0">
              <label className="text-xs font-bold text-stone-800 flex items-center gap-1">
                <span>Sacred Ceremony</span>
                {!editingService && <span className="text-red-700">*</span>}
              </label>

              {editingService ? (
                <div className="p-3.5 bg-white border-2 border-amber-300 rounded-lg flex items-center justify-between gap-2 shadow-2xs">
                  <div className="min-w-0 flex-1">
                    <span className="font-serif font-bold text-stone-950 text-sm truncate block">
                      {editingService.serviceName}
                    </span>
                    <p className="text-[11px] text-stone-500 mt-0.5">Accredited Ceremony in your repertoire</p>
                  </div>
                  <Badge className="bg-amber-100 text-amber-900 border-amber-300 text-[10px] font-bold capitalize shrink-0">
                    {editingService.category ? editingService.category.replace('-', ' ') : 'Vedic Vidhi'}
                  </Badge>
                </div>
              ) : isCatalogLoading ? (
                <div className="flex items-center gap-2 h-11 px-3.5 rounded-lg border-2 border-amber-300 text-xs text-stone-500 bg-white">
                  <Loader2 className="h-4 w-4 animate-spin text-amber-600" />
                  <span>Loading sacred ceremonies from catalog...</span>
                </div>
              ) : (
                <div className="space-y-3 w-full min-w-0">
                  <select
                    value={selectedCatalogId}
                    onChange={(e) => handleCatalogSelect(e.target.value)}
                    className="w-full max-w-full h-11 px-3 py-2 text-xs rounded-lg border-2 border-amber-300 bg-white shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 text-stone-900 cursor-pointer font-medium truncate"
                  >
                    <option value="">-- Select Ceremony from Puja Catalog --</option>
                    {catalog.map((item) => {
                      const isAlreadyOffered = offeredCatalogIds.has(item.id) || offeredNames.has(item.name.toLowerCase().trim());
                      return (
                        <option key={item.id} value={item.id} disabled={isAlreadyOffered}>
                          {item.name} {item.durationMinutes ? `(${item.durationMinutes}m)` : ''} {isAlreadyOffered ? '• [Offered]' : ''}
                        </option>
                      );
                    })}
                  </select>

                  {/* Selected Ceremony Preview Details Card */}
                  {selectedCatalogItem && (
                    <div className="p-3.5 sm:p-4 rounded-lg bg-white border-2 border-amber-300 space-y-2 shadow-2xs">
                      <div className="flex flex-wrap items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span className="font-serif font-bold text-stone-950 text-sm">{selectedCatalogItem.name}</span>
                        <Badge className="bg-amber-100 text-amber-900 border-amber-300 text-[10px] font-bold uppercase">
                          {selectedCatalogItem.category}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-stone-600">
                        {selectedCatalogItem.durationMinutes ? (
                          <span className="font-medium">⏱ Duration: {selectedCatalogItem.durationMinutes} mins</span>
                        ) : null}
                        {selectedCatalogItem.deity ? (
                          <span className="font-medium">🪔 Deity: {selectedCatalogItem.deity}</span>
                        ) : null}
                      </div>

                      {selectedCatalogItem.description && (
                        <p className="text-[11px] text-stone-600 leading-relaxed border-t border-amber-100 pt-2">
                          {selectedCatalogItem.description}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Field 2: Recommended Cash Dakshina & Action Buttons */}
            <div className="space-y-4 w-full min-w-0">
              <div className="space-y-2 w-full">
                <label className="text-xs font-bold text-stone-800 flex items-center gap-1">
                  <span>Recommended Cash Dakshina (₹ INR)</span>
                  <span className="text-red-700">*</span>
                </label>
                <div className="relative w-full">
                  <span className="absolute left-3.5 top-3 text-stone-700 font-bold text-sm select-none">₹</span>
                  <Input
                    type="number"
                    min={100}
                    step={50}
                    placeholder="2500"
                    value={dakshinaPrice || ''}
                    onChange={(e) => setDakshinaPrice(Number(e.target.value) || 0)}
                    className="w-full pl-8 h-11 text-xs font-bold text-stone-950 border-2 border-amber-300 bg-white"
                  />
                </div>
                <p className="text-[11px] text-stone-600 font-medium leading-relaxed">
                  Direct cash dakshina devotees will hand over upon ceremony completion (Zero online fee).
                </p>
              </div>

              {/* Action Buttons: Responsive Column-Reverse on Mobile, Row on Desktop */}
              <div className="pt-2 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-start gap-2.5 w-full">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseForm}
                  className="h-10 sm:h-11 px-5 text-xs font-bold border-2 border-stone-300 text-stone-700 hover:bg-white rounded-md cursor-pointer w-full sm:w-auto"
                >
                  Cancel
                </Button>

                <Button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving || (editingService ? dakshinaPrice <= 0 : (!selectedCatalogItem || dakshinaPrice <= 0))}
                  className="h-10 sm:h-11 px-6 text-xs font-bold bg-[#780016] hover:bg-red-800 text-white rounded-md shadow-xs border border-amber-400 cursor-pointer disabled:opacity-50 gap-2 w-full sm:w-auto"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving Offering...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{editingService ? 'Update Dakshina Rate' : 'Save Offering'}</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Services List Card */}
      <div className="rounded-xl border-2 border-amber-300 bg-white shadow-xs overflow-hidden w-full max-w-full">
        <div className="p-4 sm:p-6 border-b-2 border-amber-300 bg-white">
          <h2 className="text-base sm:text-lg font-serif font-bold text-stone-950">Offered Ceremonies ({services.length})</h2>
          <p className="text-xs text-stone-600 mt-0.5 leading-relaxed">
            Prices set here are presented to devotees when browsing your profile and booking ceremonies with you.
          </p>
        </div>

        <div className="p-0">
          {services.length === 0 ? (
            <div className="p-8 sm:p-12 text-center space-y-3">
              <p className="text-xs text-stone-500 font-medium">You have not added any ritual offerings yet.</p>
              <Button
                onClick={handleOpenCreate}
                size="sm"
                className="text-xs gap-1.5 h-10 px-5 bg-[#780016] hover:bg-red-800 text-white font-bold rounded-md border border-amber-400 shadow-xs cursor-pointer puja-btn-tap w-full sm:w-auto"
              >
                <Plus className="h-4 w-4" /> Add Your First Offering
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-amber-200">
              {services.map((service) => {
                const isCurrentlyEditing = editingService?.id === service.id;
                return (
                  <div
                    key={service.id}
                    className={`p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                      isCurrentlyEditing ? 'bg-amber-100/40 border-l-4 border-l-[#780016]' : 'hover:bg-amber-50/20'
                    }`}
                  >
                    <div className="space-y-1.5 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-bold text-base text-stone-950 font-serif leading-snug">{service.serviceName}</h3>
                        <Badge
                          variant="outline"
                          className={
                            service.isActive
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-300 text-[10px] font-bold'
                              : 'bg-stone-100 text-stone-600 border-stone-300 text-[10px] font-bold'
                          }
                        >
                          {service.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        {isCurrentlyEditing && (
                          <Badge className="bg-[#780016] text-amber-200 text-[10px] font-bold">
                            Editing Rate
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-stone-600 flex flex-wrap items-center gap-1.5">
                        <span>Recommended Dakshina:</span>
                        <strong className="text-red-800 font-serif font-bold text-sm">
                          ₹{service.price.toLocaleString('en-IN')}
                        </strong>
                        <span className="text-[11px] text-stone-500">(Cash on completion)</span>
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-200">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenEdit(service)}
                        className={`h-10 px-4 text-xs gap-1.5 w-full sm:w-auto rounded-md font-bold cursor-pointer ${
                          isCurrentlyEditing ? 'border-[#780016] bg-amber-50 text-[#780016]' : 'border-stone-300 hover:border-amber-400'
                        }`}
                      >
                        <Edit2 className="h-3.5 w-3.5 text-stone-600" /> Edit Rate
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggle(service.id)}
                        className={`h-10 px-4 text-xs gap-1.5 w-full sm:w-auto rounded-md font-bold cursor-pointer ${
                          service.isActive ? 'text-stone-500 hover:text-red-700 hover:bg-red-50' : 'text-emerald-700 hover:bg-emerald-50'
                        }`}
                      >
                        <Power className="h-3.5 w-3.5" />
                        {service.isActive ? 'Deactivate' : 'Activate'}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(service.id, service.serviceName)}
                        className="h-10 px-3 text-xs gap-1.5 w-full sm:w-auto rounded-md font-bold text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PriestServicesPage;
