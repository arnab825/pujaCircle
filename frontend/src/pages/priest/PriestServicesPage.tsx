import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/auth.store';
import {
  mockGetPriestServices,
  mockCreatePriestService,
  mockUpdatePriestService,
  mockTogglePriestService,
} from '@/mocks/mock-api';
import { PriestService } from '@/types/priest.types';
import { PriestServiceInput } from '@/schemas/priest.schema';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ServiceFormModal } from '@/components/priest/ServiceFormModal';
import { Plus, Edit2, Power, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export const PriestServicesPage: React.FC = () => {
  const { user } = useAuthStore();
  const priestId = user?.id === 'user-priest-1' ? 'priest-1' : user?.id || 'priest-1';

  const [services, setServices] = useState<PriestService[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<PriestService | null>(null);

  const fetchServices = async () => {
    try {
      const res = await mockGetPriestServices(priestId);
      if (res.success) {
        setServices(res.data);
      }
    } catch {
      toast.error('Failed to load services.');
    }
  };

  useEffect(() => {
    fetchServices();
  }, [priestId]);

  const handleOpenCreate = () => {
    setEditingService(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (service: PriestService) => {
    setEditingService(service);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (data: PriestServiceInput) => {
    if (editingService) {
      const res = await mockUpdatePriestService(editingService.id, priestId, data);
      if (res.success) {
        toast.success(res.message);
        fetchServices();
      } else {
        toast.error(res.message);
      }
    } else {
      const res = await mockCreatePriestService(priestId, data);
      if (res.success) {
        toast.success(res.message);
        fetchServices();
      } else {
        toast.error(res.message);
      }
    }
  };

  const handleToggleActive = async (service: PriestService) => {
    const res = await mockTogglePriestService(service.id, priestId);
    if (res.success) {
      toast.success(res.message);
      fetchServices();
    } else {
      toast.error(res.message);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-serif text-foreground flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <span>My Ceremony Services & Prices</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Configure the specific Vedic rituals you offer and your custom expected cash Dakshina.
          </p>
        </div>

        <Button onClick={handleOpenCreate} className="gap-2 text-xs h-9 w-full sm:w-auto">
          <Plus className="h-4 w-4" /> Add Custom Service
        </Button>
      </div>

      {/* Services List / Table */}
      <Card className="border-border/80 shadow-xs">
        <CardHeader className="pb-3 border-b">
          <CardTitle className="text-base font-serif">Offered Rituals ({services.length})</CardTitle>
          <CardDescription className="text-xs">
            Prices set here will be automatically applied when devotees book this ceremony with you.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-0">
          {services.length === 0 ? (
            <div className="p-8 text-center space-y-3">
              <p className="text-xs text-muted-foreground">You have not added any services yet.</p>
              <Button onClick={handleOpenCreate} size="sm" variant="outline" className="text-xs gap-1.5 w-full sm:w-auto">
                <Plus className="h-3.5 w-3.5" /> Add Your First Service
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-border/60">
              {services.map((service) => (
                <div
                  key={service.id}
                  className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/30 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-sm text-foreground">{service.serviceName}</h3>
                      <Badge
                        variant="outline"
                        className={
                          service.isActive
                            ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-[10px]'
                            : 'bg-muted text-muted-foreground border-border text-[10px]'
                        }
                      >
                        {service.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <span>Expected Dakshina:</span>
                      <strong className="text-foreground font-mono">₹{service.price.toLocaleString('en-IN')}</strong>
                      <span className="text-[11px]">(Direct Cash)</span>
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenEdit(service)}
                      className="h-9 sm:h-8 text-xs gap-1.5 w-full sm:w-auto"
                    >
                      <Edit2 className="h-3.5 w-3.5 text-muted-foreground" /> Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleActive(service)}
                      className={`h-9 sm:h-8 text-xs gap-1.5 w-full sm:w-auto ${
                        service.isActive ? 'text-muted-foreground hover:text-destructive' : 'text-emerald-600'
                      }`}
                    >
                      <Power className="h-3.5 w-3.5" />
                      {service.isActive ? 'Deactivate' : 'Activate'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <ServiceFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        serviceToEdit={editingService}
        onSubmit={handleFormSubmit}
      />
    </div>
  );
};

export default PriestServicesPage;
