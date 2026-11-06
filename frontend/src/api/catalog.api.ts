import { apiClient } from '@/api/client';
import { PujaCatalogEntry } from '@/types/catalog.types';
import { logAppError, getUserFriendlyErrorMessage } from '@/lib/errorHandler';

export const catalogApi = {
  getCatalog: async (
    categoryOrParams?: string | { category?: string; query?: string; withPriestsOnly?: boolean; hasPriests?: boolean },
    query?: string
  ): Promise<PujaCatalogEntry[]> => {
    try {
      let params: Record<string, any> = {};
      if (typeof categoryOrParams === 'string') {
        params = { category: categoryOrParams, query };
      } else if (categoryOrParams && typeof categoryOrParams === 'object') {
        params = categoryOrParams;
      }
      const res = await apiClient.get('/catalog', { params });
      return (res as any).data || res;
    } catch (error) {
      logAppError('catalogApi.getCatalog', error, { categoryOrParams, query });
      return [];
    }
  },

  getCatalogEntryById: async (id: string): Promise<PujaCatalogEntry | null> => {
    try {
      const res = await apiClient.get(`/catalog/${id}`);
      return (res as any).data || res;
    } catch (error) {
      logAppError('catalogApi.getCatalogEntryById', error, { id });
      return null;
    }
  },

  createCatalogEntry: async (
    data: Omit<PujaCatalogEntry, 'id'>
  ): Promise<{ success: boolean; data?: PujaCatalogEntry; message: string }> => {
    try {
      const res = await apiClient.post('/catalog', data);
      return res as any;
    } catch (error) {
      logAppError('catalogApi.createCatalogEntry', error, { data });
      return {
        success: false,
        message: getUserFriendlyErrorMessage(error, 'Failed to create catalog entry.'),
      };
    }
  },

  updateCatalogEntry: async (
    id: string,
    data: Partial<PujaCatalogEntry>
  ): Promise<{ success: boolean; data?: PujaCatalogEntry; message: string }> => {
    try {
      const res = await apiClient.put(`/catalog/${id}`, data);
      return res as any;
    } catch (error) {
      logAppError('catalogApi.updateCatalogEntry', error, { id, data });
      return {
        success: false,
        message: getUserFriendlyErrorMessage(error, 'Failed to update catalog entry.'),
      };
    }
  },

  deleteCatalogEntry: async (id: string): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await apiClient.delete(`/catalog/${id}`);
      return res as any;
    } catch (error) {
      logAppError('catalogApi.deleteCatalogEntry', error, { id });
      return {
        success: false,
        message: getUserFriendlyErrorMessage(error, 'Failed to delete catalog entry.'),
      };
    }
  },
};
