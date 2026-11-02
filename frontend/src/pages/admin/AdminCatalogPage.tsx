import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Filter,
  X,
  Layers,
  UploadCloud,
  AlertCircle,
  Loader2,
  Clock,
} from "lucide-react";
import { PujaCatalogEntry } from "@/types/catalog.types";
import { catalogApi } from "@/api/catalog.api";
import { apiClient } from "@/api/client";
import { modalTransition, buttonPress } from "@/motion/variants";
import { toast } from "sonner";

const getCategoryBadge = (category: string) => {
  const norm = (category || "").toLowerCase().replace(/[\s_-]+/g, "");
  switch (norm) {
    case "lifeevent":
      return {
        label: "Life Event",
        icon: "🌟",
        className: "bg-amber-100 text-amber-950 border-amber-300",
      };
    case "doshanivaran":
      return {
        label: "Dosha Nivaran",
        icon: "🛡️",
        className: "bg-purple-100 text-purple-950 border-purple-300",
      };
    case "festival":
      return {
        label: "Festival & Vrat",
        icon: "🪔",
        className: "bg-emerald-100 text-emerald-950 border-emerald-300",
      };
    case "business":
      return {
        label: "Business & Trade",
        icon: "💼",
        className: "bg-blue-100 text-blue-950 border-blue-300",
      };
    case "ancestral":
      return {
        label: "Ancestral & Pitru",
        icon: "🕊️",
        className: "bg-stone-200 text-stone-900 border-stone-300",
      };
    default:
      return {
        label: category,
        icon: "✨",
        className: "bg-amber-50 text-amber-900 border-amber-200",
      };
  }
};

export const AdminCatalogPage: React.FC = () => {
  const [catalog, setCatalog] = useState<PujaCatalogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  // Modal states for Create / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<PujaCatalogEntry | null>(
    null,
  );

  // Form states - strictly no default picture automatically
  const [name, setName] = useState("");
  const [deity, setDeity] = useState("");
  const [category, setCategory] =
    useState<PujaCatalogEntry["category"]>("life-event");
  const [description, setDescription] = useState("");
  const [coverImage, setCoverImage] = useState<string>("");
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadFileName, setUploadFileName] = useState<string>("");
  const [intentTagsText, setIntentTagsText] = useState("");
  const [samagriText, setSamagriText] = useState("");
  const [stepsText, setStepsText] = useState("");
  const [timingNote, setTimingNote] = useState("");
  const [durationMinutes, setDurationMinutes] = useState<string>("120");

  const normalizeCat = (c: string) => (c || '').toLowerCase().replace(/[\s_-]+/g, '');

  const filteredCatalog = catalog.filter((entry) => {
    const matchesSearch =
      entry.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.deity.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.intentTags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase()),
      );

    const matchesCategory =
      selectedCategory === "ALL" ||
      normalizeCat(entry.category) === normalizeCat(selectedCategory);

    return matchesSearch && matchesCategory;
  });

  const handleOpenAddModal = () => {
    setEditingEntry(null);
    setName("");
    setDeity("");
    setCategory("life-event");
    setDescription("");
    setCoverImage(""); // Strictly empty: user must upload ceremony picture
    setUploadError(null);
    setUploadFileName("");
    setIsUploading(false);
    setIntentTagsText("");
    setSamagriText("");
    setStepsText("");
    setTimingNote("");
    setDurationMinutes("120");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (entry: PujaCatalogEntry) => {
    setEditingEntry(entry);
    setName(entry.name);
    setDeity(entry.deity);
    setCategory(entry.category);
    setDescription(entry.description);
    setCoverImage(entry.coverImage || "");
    setUploadError(null);
    setUploadFileName("");
    setIsUploading(false);
    setIntentTagsText(entry.intentTags.join(", "));
    setSamagriText(entry.samagriList.join("\n"));
    setStepsText(entry.steps.join("\n"));
    setTimingNote(entry.timingNote);
    setDurationMinutes(String(entry.durationMinutes || 120));
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    // If a new image was uploaded to Cloudinary in this modal session but cancelled, purge it from Cloudinary
    if (coverImage && coverImage.includes("cloudinary.com")) {
      const originalImage = editingEntry ? editingEntry.coverImage : "";
      if (coverImage !== originalImage) {
        apiClient
          .delete("/media", { data: { url: coverImage } })
          .catch(() => {});
      }
    }
    setIsModalOpen(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // Strict validation: strictly under 2MB
    const MAX_SIZE_BYTES = 2 * 1024 * 1024; // 2MB
    if (file.size > MAX_SIZE_BYTES) {
      setUploadError(
        `File size exceeds limit. Image must be strictly under 2MB (Selected size: ${(file.size / (1024 * 1024)).toFixed(2)} MB).`,
      );
      e.target.value = "";
      return;
    }

    if (!file.type.startsWith("image/")) {
      setUploadError("Strictly image files only (PNG, JPG, WebP, AVIF).");
      e.target.value = "";
      return;
    }

    setUploadFileName(file.name);
    setIsUploading(true);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64Data = event.target?.result as string;
      if (!base64Data) {
        setUploadError("Failed to read image file.");
        setIsUploading(false);
        return;
      }

      try {
        const res = await apiClient.post("/media/upload", {
          file: base64Data,
          folder: "pujacircle/catalog",
        });

        const uploadedUrl = (res as any)?.data?.url || (res as any)?.url;
        if (uploadedUrl) {
          // Immediately delete the previous picture from Cloudinary so only the current updated picture exists
          const prevUrl = coverImage;
          if (
            prevUrl &&
            prevUrl.includes("cloudinary.com") &&
            prevUrl !== uploadedUrl
          ) {
            apiClient
              .delete("/media", { data: { url: prevUrl } })
              .catch((err) => {
                console.warn(
                  "Failed to delete previous media from Cloudinary:",
                  err,
                );
              });
          }

          setCoverImage(uploadedUrl);
          toast.success("Picture updated successfully!");
        } else {
          throw new Error("No URL returned from upload.");
        }
      } catch (err: any) {
        const msg = err.message || "Failed to upload image.";
        setUploadError(msg);
        toast.error("Upload error: " + msg);
      } finally {
        setIsUploading(false);
      }
    };

    reader.onerror = () => {
      setUploadError("Failed to read file for upload.");
      setIsUploading(false);
    };

    reader.readAsDataURL(file);
  };

  const fetchCatalog = async () => {
    setIsLoading(true);
    try {
      const data = await catalogApi.getCatalog();
      setCatalog(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, []);

  const handleSaveEntry = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Ceremony name is strictly required.");
      return;
    }

    if (!deity.trim()) {
      toast.error("Presiding deity is strictly required.");
      return;
    }

    if (!category) {
      toast.error("Category is strictly required.");
      return;
    }

    if (!coverImage.trim()) {
      setUploadError(
        "A ceremony cover image is required (strictly under 2MB).",
      );
      toast.error("Please upload a ceremony picture (strictly under 2MB).");
      return;
    }

    if (!description.trim() || description.trim().length < 10) {
      toast.error(
        "Description is required and must be at least 10 characters.",
      );
      return;
    }

    const tags = intentTagsText
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

    if (tags.length === 0) {
      toast.error("At least one intent tag is strictly required.");
      return;
    }

    const samagri = samagriText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    if (samagri.length === 0) {
      toast.error("At least one samagri item is strictly required.");
      return;
    }

    const steps = stepsText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    if (steps.length === 0) {
      toast.error("At least one vidhi step is strictly required.");
      return;
    }

    if (!timingNote.trim()) {
      toast.error("Auspicious timing note is strictly required.");
      return;
    }

    const parsedDuration = Number(durationMinutes);
    if (!parsedDuration || parsedDuration <= 0) {
      toast.error(
        "Ceremony duration in minutes is strictly required and must be greater than zero.",
      );
      return;
    }

    let isSuccess = false;
    if (editingEntry) {
      const res = await catalogApi.updateCatalogEntry(editingEntry.id, {
        name: name.trim(),
        deity: deity.trim(),
        category,
        description: description.trim(),
        coverImage: coverImage.trim(),
        intentTags: tags,
        samagriList: samagri,
        steps,
        timingNote: timingNote.trim(),
        durationMinutes: parsedDuration,
      });
      if (res.success) {
        toast.success(res.message);
        isSuccess = true;
      } else {
        toast.error(res.message);
      }
    } else {
      const res = await catalogApi.createCatalogEntry({
        name: name.trim(),
        deity: deity.trim(),
        category,
        description: description.trim(),
        coverImage: coverImage.trim(),
        intentTags: tags,
        samagriList: samagri,
        steps,
        timingNote: timingNote.trim(),
        durationMinutes: parsedDuration,
      });
      if (res.success) {
        toast.success(res.message);
        isSuccess = true;
      } else {
        toast.error(res.message);
      }
    }

    if (isSuccess) {
      fetchCatalog();
      setIsModalOpen(false);
    }
  };

  const handleDeleteEntry = async (id: string) => {
    if (
      window.confirm("Are you sure you want to delete this puja catalog entry?")
    ) {
      const res = await catalogApi.deleteCatalogEntry(id);
      if (res.success) {
        toast.success(res.message);
        fetchCatalog();
      } else {
        toast.error(res.message);
      }
    }
  };

  const isFormValid = Boolean(
    name.trim() &&
    deity.trim() &&
    category &&
    coverImage.trim() &&
    description.trim() &&
    intentTagsText.trim() &&
    samagriText.trim() &&
    stepsText.trim() &&
    timingNote.trim() &&
    Number(durationMinutes) > 0 &&
    !isUploading,
  );

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-amber-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#780016]" />
            <h1 className="font-serif text-2xl font-bold text-[#780016]">
              Puja Catalog Management Console
            </h1>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Curate and moderate sacred rituals, deities, and samagri
            requirements across the platform
          </p>
        </div>

        <motion.button
          type="button"
          whileTap={buttonPress}
          onClick={handleOpenAddModal}
          className="inline-flex items-center gap-2 rounded-md bg-[#780016] hover:bg-[#600012] text-white border border-amber-400 px-4 py-2 text-xs font-bold transition-colors shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Catalog Entry</span>
        </motion.button>
      </div>

      {/* Search and Category Control Station */}
      <div className="bg-white rounded-2xl border-2 border-amber-300 p-4 sm:p-5 shadow-xs space-y-4">
        {/* Top: Full-Width Search Input with Live Results & Quick Reset */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-amber-700" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search ceremonies by puja name, presiding deity, or intent tags..."
              className="w-full rounded-xl border-2 border-amber-200 bg-amber-50/20 pl-10 pr-10 py-2 text-xs text-stone-900 placeholder:text-stone-500 focus:outline-none focus:border-[#780016] focus:bg-white transition-all shadow-2xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-700 text-xs font-bold bg-stone-100 hover:bg-stone-200 h-5 w-5 rounded-full flex items-center justify-center cursor-pointer transition-colors"
                title="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
            <span className="text-xs font-medium text-stone-600">
              Showing <strong className="text-[#780016] font-bold">{filteredCatalog.length}</strong> of {catalog.length} ceremonies
            </span>
            {(searchQuery || selectedCategory !== "ALL") && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("ALL");
                }}
                className="text-[11px] font-bold text-[#780016] hover:text-red-900 bg-amber-100 hover:bg-amber-200 px-2.5 py-1 rounded-md border border-amber-300 transition-colors cursor-pointer"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>

        {/* Bottom: Wrap Category Pills (Zero Horizontal Scrollbar) */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-amber-100">
          <div className="flex items-center gap-1.5 text-xs font-bold text-stone-700 mr-1 shrink-0">
            <Filter className="w-3.5 h-3.5 text-amber-700" />
            <span className="uppercase text-[10px] tracking-wider text-stone-500">Categories:</span>
          </div>

          {[
            { key: "ALL", label: "All Ceremonies", icon: "🕉️" },
            { key: "life-event", label: "Life Events", icon: "🌟" },
            { key: "dosha-nivaran", label: "Dosha Nivaran", icon: "🛡️" },
            { key: "festival", label: "Festivals & Vrats", icon: "🪔" },
            { key: "business", label: "Business & Trade", icon: "💼" },
            { key: "ancestral", label: "Ancestral & Pitru", icon: "🕊️" },
          ].map((catItem) => {
            const isSelected = selectedCategory === catItem.key;
            const count =
              catItem.key === "ALL"
                ? catalog.length
                : catalog.filter((c) => normalizeCat(c.category) === normalizeCat(catItem.key)).length;

            return (
              <button
                key={catItem.key}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setSelectedCategory(catItem.key);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs select-none active:scale-95 ${
                  isSelected
                    ? "bg-[#780016] text-white border-2 border-amber-400 shadow-xs"
                    : "bg-white hover:bg-amber-50 text-stone-700 border border-amber-200 hover:border-amber-400"
                }`}
              >
                <span>{catItem.icon}</span>
                <span>{catItem.label}</span>
                <span
                  className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full ${
                    isSelected
                      ? "bg-amber-400/30 text-amber-200"
                      : "bg-stone-100 text-stone-600"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Catalog Directory Table */}
      <div className="rounded-2xl border-2 border-amber-300/80 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-800 divide-y divide-amber-200">
            <thead className="bg-linear-to-r from-amber-100/90 via-amber-50 to-amber-100/90 text-stone-900 font-bold uppercase text-[11px] font-serif tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Puja Ceremony & Cover</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Intent Tags (Rules Engine)</th>
                <th className="py-3.5 px-4">Vidhi & Samagri</th>
                <th className="py-3.5 px-4 text-right pr-6">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-stone-500 font-serif">
                    Loading sacred catalog entries...
                  </td>
                </tr>
              ) : filteredCatalog.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-stone-500 space-y-2">
                    <p className="font-semibold text-stone-700 font-serif">No catalog ceremonies found for this category or search.</p>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCategory("ALL");
                        setSearchQuery("");
                      }}
                      className="text-xs text-[#780016] font-bold underline hover:text-red-800 cursor-pointer"
                    >
                      Reset filter to All Ceremonies
                    </button>
                  </td>
                </tr>
              ) : (
                filteredCatalog.map((entry) => (
                  <tr
                    key={entry.id}
                    className="hover:bg-amber-50/40 transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3.5">
                        <div className="relative w-16 h-12 rounded-lg overflow-hidden border-2 border-amber-300 shadow-2xs shrink-0 group">
                          <img
                            src={entry.coverImage || "/images/hero_vedic_puja.jpg"}
                            alt={entry.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300 bg-stone-100"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                "/images/hero_vedic_puja.jpg";
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
                              <span>{entry.durationMinutes || 120} mins ({((entry.durationMinutes || 120) / 60).toFixed(1)} hrs)</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {(() => {
                        const catBadge = getCategoryBadge(entry.category);
                        return (
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold border shadow-2xs ${catBadge.className}`}>
                            <span>{catBadge.icon}</span>
                            <span>{catBadge.label}</span>
                          </span>
                        );
                      })()}
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="flex flex-wrap gap-1.5">
                        {entry.intentTags.map((tag) => {
                          const cleanTag = tag.replace(/^["'\s]+|["',\s]+$/g, "").trim();
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
                        <span><strong>{entry.samagriList.length}</strong> Samagri items</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-stone-600 text-[11px]">
                        <span className="text-emerald-700">📜</span>
                        <span><strong>{entry.steps.length}</strong> Vidhi steps</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right pr-6 whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(entry)}
                          className="h-8 w-8 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 flex items-center justify-center transition-all cursor-pointer shadow-2xs hover:scale-105 active:scale-95"
                          title="Edit Ceremony"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteEntry(entry.id)}
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
            Showing <strong className="text-stone-900 font-bold">{filteredCatalog.length}</strong> of {catalog.length} catalog ceremonies
          </span>
          <span className="text-amber-900 font-semibold font-serif flex items-center gap-1.5">
            <span>🕉️</span> Verified Vedic Vidhi Catalog Directory
          </span>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
            <motion.div
              variants={modalTransition}
              initial="initial"
              animate="animate"
              exit="exit"
              className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-xl border-2 border-amber-300 bg-white p-6 shadow-2xl space-y-4 text-xs"
            >
              <div className="flex items-center justify-between border-b border-amber-200 pb-3">
                <h3 className="font-serif text-lg font-bold text-[#780016]">
                  {editingEntry
                    ? "Edit Catalog Entry"
                    : "Create New Puja Catalog Entry"}
                </h3>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="rounded-full p-1.5 text-stone-400 hover:text-stone-700 hover:bg-amber-100 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
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
                    onChange={(e) =>
                      setCategory(
                        e.target.value as PujaCatalogEntry["category"],
                      )
                    }
                    className="w-full rounded-md border border-amber-300 bg-white p-2 text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#780016]"
                  >
                    <option value="life-event">Life Event (Samskara)</option>
                    <option value="dosha-nivaran">
                      Dosha Nivaran (Remedial)
                    </option>
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
                    {/* Image Preview Box - Clean presentation without overlays */}
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

                    {/* Upload Dropzone / Button */}
                    <div className="sm:col-span-2 space-y-2">
                      <label
                        className={`flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-lg transition-all ${
                          isUploading
                            ? "border-stone-300 bg-stone-50 cursor-not-allowed opacity-60"
                            : "border-amber-400 hover:border-amber-500 bg-amber-50/60 hover:bg-amber-100/60 cursor-pointer"
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
                                  ? "Click to replace picture *"
                                  : "Click to select and upload picture *"}
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
                      <p className="text-[10px] text-stone-500 leading-tight">
                        File size must strictly not exceed 2MB.
                      </p>
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
                    Intent Tags (Comma-separated, powers matching engine) *
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
                    placeholder="Copper Kalash&#10;Mango leaves&#10;Havan Samagri..."
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
                    placeholder="Ganesha Sthapana and Kalash pujan&#10;Navagraha invocation&#10;Havan offering..."
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
                        : "Enter ceremony duration in minutes"}
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
                    <span className="text-[10px] text-stone-500 mt-0.5 block">
                      Auspicious tithi / muhurat preference
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-amber-200">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="border-2 border-amber-300 text-stone-800 hover:bg-amber-50 rounded-md px-4 py-2 text-xs font-semibold cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!isFormValid || isUploading}
                    className="bg-[#780016] hover:bg-[#600012] text-white border border-amber-400 rounded-md px-5 py-2 text-xs font-bold shadow-xs cursor-pointer transition-colors disabled:opacity-50 inline-flex items-center gap-2"
                  >
                    {isUploading && (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    )}
                    <span>
                      {isUploading
                        ? "Uploading..."
                        : editingEntry
                          ? "Update Entry"
                          : "Create Entry"}
                    </span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminCatalogPage;
