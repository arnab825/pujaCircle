import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UploadCloud, Loader2, AlertCircle } from 'lucide-react';
import { PujaCatalogEntry } from '@/types/catalog.types';
import { modalTransition } from '@/motion/variants';
import { apiClient } from '@/api/client';
import { toast } from 'sonner';

interface CatalogItemModalProps {
  isOpen: boolean;
  editingEntry: PujaCatalogEntry | null;
  onClose: () => void;
  onSaved: () => void;
}

/**
 * ============================================================================
 * [COMPONENT: CATALOG ITEM MODAL]
 * Administrative modal for creating and updating Puja catalog entries.
 * Includes direct image upload with size verification (< 2MB) and previews.
 * ============================================================================
 */
export const CatalogItemModal: React.FC<CatalogItemModalProps> = ({
  isOpen,
  editingEntry,
  onClose,
  onSaved,
}) => {
  const [name, setName] = useState('');
  const [deity, setDeity] = useState('');
  const [category, setCategory] = useState<PujaCatalogEntry['category']>('life-event');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadFileName, setUploadFileName] = useState<string>('');
  const [intentTagsText, setIntentTagsText] = useState('');
  const [samagriText, setSamagriText] = useState('');
  const [stepsText, setStepsText] = useState('');
  const [timingNote, setTimingNote] = useState('');
  const [durationMinutes, setDurationMinutes] = useState<string>('120');

  useEffect(() => {
    if (editingEntry) {
      setName(editingEntry.name);
      setDeity(editingEntry.deity);
      setCategory(editingEntry.category);
      setDescription(editingEntry.description);
      setCoverImage(editingEntry.coverImage || '');
      setUploadFileName('');
      setUploadError(null);
      setIntentTagsText(editingEntry.intentTags.join(', '));
      setSamagriText(editingEntry.samagriList.join('\n'));
      setStepsText(editingEntry.steps.join('\n'));
      setTimingNote(editingEntry.timingNote);
      setDurationMinutes(String(editingEntry.durationMinutes || 120));
    } else {
      setName('');
      setDeity('');
      setCategory('life-event');
      setDescription('');
      setCoverImage('');
      setUploadFileName('');
      setUploadError(null);
      setIntentTagsText('');
      setSamagriText('');
      setStepsText('');
      setTimingNote('');
      setDurationMinutes('120');
    }
  }, [editingEntry, isOpen]);

  const isFormValid =
    name.trim().length > 0 &&
    deity.trim().length > 0 &&
    description.trim().length >= 10 &&
    intentTagsText.trim().length > 0 &&
    samagriText.trim().length > 0 &&
    stepsText.trim().length > 0 &&
    timingNote.trim().length > 0 &&
    durationMinutes.trim().length > 0 &&
    Number(durationMinutes) > 0 &&
    Boolean(coverImage && coverImage.trim().length > 0);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);

    // Enforce 2MB maximum file limit
    const MAX_SIZE_BYTES = 2 * 1024 * 1024;
    if (file.size > MAX_SIZE_BYTES) {
      const actualSizeMB = (file.size / (1024 * 1024)).toFixed(2);
      const errMsg = `Picture size is ${actualSizeMB} MB. Maximum allowed size is 2.0 MB.`;
      setUploadError(errMsg);
      toast.error(errMsg);
      e.target.value = '';
      return;
    }

    setUploadFileName(file.name);
    setIsUploading(true);

    try {
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
      });

      const base64Data = await base64Promise;

      const response: any = await apiClient.post('/media/upload', {
        file: base64Data,
        image: base64Data,
        folder: 'pujacircle/catalog',
      });

      const uploadedUrl =
        response?.data?.secure_url ||
        response?.data?.url ||
        response?.secure_url ||
        response?.url;

      if (!uploadedUrl) {
        throw new Error('Upload server did not return a valid asset URL.');
      }

      setCoverImage(uploadedUrl);
      toast.success('Ceremony picture uploaded to Cloudinary successfully!');
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to upload picture. Please try again.';
      setUploadError(message);
      toast.error(message);
      setCoverImage('');
      setUploadFileName('');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleSaveEntry = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!coverImage || coverImage.trim().length === 0) {
      setUploadError('Please select and upload a ceremony cover picture before creating.');
      toast.error('Ceremony cover picture is strictly mandatory.');
      return;
    }

    const payload = {
      name: name.trim(),
      deity: deity.trim(),
      category,
      description: description.trim(),
      coverImage: coverImage.trim(),
      intentTags: intentTagsText
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      samagriList: samagriText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
      steps: stepsText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
      timingNote: timingNote.trim(),
      durationMinutes: Number(durationMinutes) || 120,
    };

    try {
      if (editingEntry) {
        await apiClient.put(`/catalog/${editingEntry.id}`, payload);
        toast.success(`"${name}" updated successfully.`);
      } else {
        await apiClient.post('/catalog', payload);
        toast.success(`"${name}" added to catalog.`);
      }
      onSaved();
      onClose();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to save catalog entry.');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <motion.div
            variants={modalTransition}
            initial="initial"
            animate="animate"
            exit="exit"
            className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-xl border-2 border-amber-300 bg-white p-4 sm:p-6 shadow-2xl space-y-4 text-xs"
          >
            <div className="flex items-center justify-between border-b border-amber-200 pb-3 pr-1">
              <h3 className="font-serif text-base sm:text-lg font-bold text-[#780016] pr-2 truncate">
                {editingEntry ? 'Edit Catalog Entry' : 'Create New Puja Catalog Entry'}
              </h3>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full p-1.5 text-stone-400 hover:text-stone-700 hover:bg-amber-100 transition-colors cursor-pointer shrink-0"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEntry} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-800 mb-1">
                    Puja Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Maha Ganapati Homam"
                    className="w-full rounded-md border border-amber-300 bg-white p-2 text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#780016]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-800 mb-1">
                    Presiding Deity *
                  </label>
                  <input
                    type="text"
                    required
                    value={deity}
                    onChange={(e) => setDeity(e.target.value)}
                    placeholder="e.g. Lord Ganesha"
                    className="w-full rounded-md border border-amber-300 bg-white p-2 text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#780016]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-800 mb-1">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as PujaCatalogEntry['category'])}
                  className="w-full rounded-md border border-amber-300 bg-white p-2 text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#780016]"
                >
                  <option value="life-event">Life Event (Samskara)</option>
                  <option value="dosha-nivaran">Dosha Nivaran (Remedial)</option>
                  <option value="festival">Festival / Seasonal Vrat</option>
                  <option value="business">Business / Commercial</option>
                  <option value="ancestral">Ancestral / Shraddha</option>
                </select>
              </div>

              {/* Cover Image Upload (Strictly Under 2MB) */}
              <div className="space-y-2 rounded-lg border border-amber-200 bg-amber-50/30 p-3.5">
                <div className="flex items-center justify-between">
                  <label className="block font-semibold text-stone-800 text-xs">
                    Ceremony Cover Picture *
                  </label>
                  <span className="text-[10px] font-semibold text-amber-800 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded">
                    Strictly &lt; 2MB
                  </span>
                </div>

                {uploadError && (
                  <div className="flex items-center gap-2 p-2 rounded-md bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                    <span>{uploadError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                  <div className="relative aspect-video sm:aspect-4/3 rounded-lg overflow-hidden border border-amber-300 bg-stone-100 flex items-center justify-center shadow-xs">
                    {isUploading ? (
                      <div className="flex flex-col items-center justify-center p-3 text-center gap-1.5">
                        <Loader2 className="w-6 h-6 text-[#780016] animate-spin" />
                        <span className="text-[11px] font-semibold text-stone-700">
                          Uploading picture...
                        </span>
                      </div>
                    ) : coverImage ? (
                      <img
                        src={coverImage}
                        alt="Cover preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center p-3 text-center">
                        <UploadCloud className="w-6 h-6 text-amber-600 mb-1" />
                        <span className="text-[11px] font-semibold text-stone-700">
                          No Picture Uploaded
                        </span>
                        <span className="text-[9px] text-stone-500">
                          Strictly required &lt; 2MB
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="sm:col-span-2 space-y-2">
                    <label
                      className={`flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-lg transition-all ${
                        isUploading
                          ? 'border-stone-300 bg-stone-50 cursor-not-allowed opacity-60'
                          : 'border-amber-400 hover:border-amber-500 bg-amber-50/60 hover:bg-amber-100/60 cursor-pointer'
                      }`}
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="w-6 h-6 text-[#780016] animate-spin mb-1" />
                          <span className="text-xs font-semibold text-stone-700">
                            Uploading picture...
                          </span>
                        </>
                      ) : (
                        <>
                          <UploadCloud className="w-6 h-6 text-amber-700 mb-1" />
                          <span className="text-xs font-semibold text-stone-900 text-center">
                            {uploadFileName
                              ? `Uploaded: ${uploadFileName}`
                              : coverImage
                              ? 'Click to replace picture *'
                              : 'Click to select and upload picture *'}
                          </span>
                          <span className="text-[11px] text-stone-500 mt-0.5">
                            PNG, JPG, WebP, AVIF (Strictly max 2.0 MB)
                          </span>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        disabled={isUploading}
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-800 mb-1">
                  Description *
                </label>
                <textarea
                  required
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of the ritual's significance (minimum 10 characters)..."
                  className="w-full rounded-md border border-amber-300 bg-white p-2 text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#780016]"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-800 mb-1">
                  Intent Tags (Comma-separated) *
                </label>
                <input
                  type="text"
                  required
                  value={intentTagsText}
                  onChange={(e) => setIntentTagsText(e.target.value)}
                  placeholder="new-home, vastu, flat, apartment, relocation..."
                  className="w-full rounded-md border border-amber-300 bg-white p-2 text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#780016]"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-800 mb-1">
                  Samagri List (One item per line) *
                </label>
                <textarea
                  required
                  rows={3}
                  value={samagriText}
                  onChange={(e) => setSamagriText(e.target.value)}
                  placeholder={'Copper Kalash\nMango leaves\nHavan Samagri...'}
                  className="w-full rounded-md border border-amber-300 bg-white p-2 text-xs font-mono text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#780016]"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-800 mb-1">
                  Vedic Vidhi Steps (One step per line) *
                </label>
                <textarea
                  required
                  rows={3}
                  value={stepsText}
                  onChange={(e) => setStepsText(e.target.value)}
                  placeholder={'Ganesha Sthapana and Kalash pujan\nNavagraha invocation\nHavan offering...'}
                  className="w-full rounded-md border border-amber-300 bg-white p-2 text-xs font-mono text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#780016]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-800 mb-1">
                    Ceremony Duration (in minutes) *
                  </label>
                  <input
                    type="number"
                    required
                    min={15}
                    step={15}
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(e.target.value)}
                    placeholder="e.g. 120 (for 2 hours)"
                    className="w-full rounded-md border border-amber-300 bg-white p-2 text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#780016]"
                  />
                  <span className="text-[10px] text-stone-500 mt-0.5 block">
                    {durationMinutes && Number(durationMinutes) > 0
                      ? `Equivalent to ${(Number(durationMinutes) / 60).toFixed(1)} hours`
                      : 'Enter ceremony duration in minutes'}
                  </span>
                </div>

                <div>
                  <label className="block font-semibold text-stone-800 mb-1">
                    Auspicious Timing Note *
                  </label>
                  <input
                    type="text"
                    required
                    value={timingNote}
                    onChange={(e) => setTimingNote(e.target.value)}
                    placeholder="e.g. Shukla Paksha morning hours."
                    className="w-full rounded-md border border-amber-300 bg-white p-2 text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#780016]"
                  />
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2 sm:gap-3 pt-4 border-t border-amber-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto border-2 border-amber-300 text-stone-800 hover:bg-amber-50 rounded-md px-4 py-2 text-xs font-semibold cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!isFormValid || isUploading}
                  className="w-full sm:w-auto justify-center bg-[#780016] hover:bg-[#600012] text-white border border-amber-400 rounded-md px-5 py-2 text-xs font-bold shadow-xs cursor-pointer transition-colors disabled:opacity-50 inline-flex items-center gap-2"
                >
                  {isUploading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isUploading ? 'Uploading...' : editingEntry ? 'Update Entry' : 'Create Entry'}</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
