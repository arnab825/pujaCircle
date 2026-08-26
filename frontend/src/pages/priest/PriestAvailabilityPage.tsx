import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { priestApi } from '@/api/priest.api';
import {
  WeeklyAvailabilityRule,
  AvailabilityException,
  PriestSlot,
} from '@/types/priest.types';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { AddWeeklyRuleModal } from '@/components/priest/AddWeeklyRuleModal';
import { AddExceptionModal } from '@/components/priest/AddExceptionModal';
import { DAYS_OF_WEEK } from '@/lib/constants';
import { formatTime, formatFullDate } from '@/lib/utils';
import {
  Clock,
  Plus,
  Trash2,
  Edit2,
  CalendarOff,
  Calendar as CalendarIcon,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';

export const PriestAvailabilityPage: React.FC = () => {
  const { user } = useAuthStore();
  const priestId = user?.id === 'user-priest-1' ? 'priest-1' : user?.id || 'priest-1';

  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  const [weeklyRules, setWeeklyRules] = useState<WeeklyAvailabilityRule[]>([]);
  const [exceptions, setExceptions] = useState<AvailabilityException[]>([]);
  const [previewSlots, setPreviewSlots] = useState<PriestSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  // Modals
  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<WeeklyAvailabilityRule | null>(null);
  const [ruleModalDay, setRuleModalDay] = useState<number>(1);
  const [isExceptionModalOpen, setIsExceptionModalOpen] = useState(false);

  const fetchScheduleData = async () => {
    try {
      const [rules, excs] = await Promise.all([
        priestApi.getWeeklyAvailability(priestId),
        priestApi.getAvailabilityExceptions(priestId),
      ]);
      setWeeklyRules(rules);
      setExceptions(excs);
    } catch {
      toast.error('Failed to load availability schedule.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPreviewSlots = async (date: string) => {
    setIsPreviewLoading(true);
    try {
      const slots = await priestApi.getAvailableSlotsForDate(priestId, date);
      setPreviewSlots(slots);
    } catch {
      toast.error('Failed to calculate preview slots.');
    } finally {
      setIsPreviewLoading(false);
    }
  };

  useEffect(() => {
    fetchScheduleData();
  }, [priestId]);

  useEffect(() => {
    fetchPreviewSlots(selectedDate);
  }, [selectedDate, priestId, weeklyRules, exceptions]);

  // Weekly Rule Actions
  const handleOpenAddRule = (dayOfWeek: number) => {
    setEditingRule(null);
    setRuleModalDay(dayOfWeek);
    setIsRuleModalOpen(true);
  };

  const handleOpenEditRule = (rule: WeeklyAvailabilityRule) => {
    setEditingRule(rule);
    setRuleModalDay(rule.dayOfWeek);
    setIsRuleModalOpen(true);
  };

  const handleSaveWeeklyRule = async (
    data: Omit<WeeklyAvailabilityRule, 'id' | 'priestId' | 'createdAt'>
  ): Promise<boolean> => {
    try {
      if (editingRule) {
        const res = await priestApi.updateWeeklyAvailabilityRule(editingRule.id, priestId, data);
        if (res.success) {
          toast.success(res.message);
          fetchScheduleData();
          return true;
        } else {
          toast.error(res.message);
          return false;
        }
      } else {
        const res = await priestApi.createWeeklyAvailabilityRule(priestId, data);
        if (res.success) {
          toast.success(res.message);
          fetchScheduleData();
          return true;
        } else {
          toast.error(res.message);
          return false;
        }
      }
    } catch {
      toast.error('An unexpected error occurred while saving schedule.');
      return false;
    }
  };

  const handleDeleteWeeklyRule = async (ruleId: string) => {
    try {
      const res = await priestApi.deleteWeeklyAvailabilityRule(ruleId, priestId);
      if (res.success) {
        toast.success(res.message);
        fetchScheduleData();
      } else {
        toast.error(res.message);
      }
    } catch {
      toast.error('Failed to remove schedule rule.');
    }
  };

  // Exception Actions
  const handleSaveException = async (
    data: Omit<AvailabilityException, 'id' | 'priestId' | 'createdAt'>
  ): Promise<boolean> => {
    try {
      const res = await priestApi.createAvailabilityException(priestId, data);
      if (res.success) {
        toast.success(res.message);
        fetchScheduleData();
        return true;
      } else {
        toast.error(res.message);
        return false;
      }
    } catch {
      toast.error('Failed to save date exception.');
      return false;
    }
  };

  const handleDeleteException = async (exceptionId: string) => {
    try {
      const res = await priestApi.deleteAvailabilityException(exceptionId, priestId);
      if (res.success) {
        toast.success(res.message);
        fetchScheduleData();
      } else {
        toast.error(res.message);
      }
    } catch {
      toast.error('Failed to remove date exception.');
    }
  };

  // Days order: Monday (1) through Sunday (0)
  const orderedDays = [1, 2, 3, 4, 5, 6, 0];

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-serif text-foreground flex items-center gap-2">
            <Clock className="h-6 w-6 text-primary" />
            <span>Availability Schedule</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Define your recurring weekly hours once. Devotee booking slots are generated automatically.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            variant="outline"
            onClick={() => setIsExceptionModalOpen(true)}
            className="gap-1.5 text-xs h-9"
          >
            <CalendarOff className="h-4 w-4" /> Add Date Exception
          </Button>
          <Button
            onClick={() => handleOpenAddRule(1)}
            className="gap-1.5 text-xs h-9"
          >
            <Plus className="h-4 w-4" /> Add Working Hours
          </Button>
        </div>
      </div>

      {/* Info Notice Banner */}
      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3 text-xs">
        <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-semibold text-foreground">Recurring Schedule Active: </span>
          <span className="text-muted-foreground">
            You do not need to generate dates one by one. Your weekly schedule applies continuously. Use
            exceptions for holidays, travel, or custom puja muhurats.
          </span>
        </div>
      </div>

      {/* SECTION 1: WEEKLY RECURRING SCHEDULE */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold font-serif text-foreground">Weekly Recurring Schedule</h2>
            <p className="text-xs text-muted-foreground">
              Configure regular appointment hours for each day of the week.
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-xs text-muted-foreground">Loading schedule rules...</div>
        ) : (
          <div className="space-y-3">
            {orderedDays.map((dayIdx) => {
              const dayName = DAYS_OF_WEEK[dayIdx];
              const rulesForDay = weeklyRules.filter((r) => r.dayOfWeek === dayIdx && r.isActive);
              const isAvailable = rulesForDay.length > 0;

              return (
                <Card key={dayIdx} className="border-border/80 shadow-2xs overflow-hidden">
                  <div className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {/* Day Name & Status */}
                    <div className="flex items-center gap-3 w-40 shrink-0">
                      <div
                        className={`h-2.5 w-2.5 rounded-full ${
                          isAvailable ? 'bg-emerald-500' : 'bg-muted-foreground/30'
                        }`}
                      />
                      <div>
                        <h3 className="font-semibold text-sm text-foreground font-serif">{dayName}</h3>
                        <p className="text-[11px] text-muted-foreground">
                          {isAvailable ? `${rulesForDay.length} time range(s)` : 'Not available'}
                        </p>
                      </div>
                    </div>

                    {/* Time Ranges List */}
                    <div className="flex-1 space-y-2">
                      {isAvailable ? (
                        <div className="flex flex-wrap gap-2">
                          {rulesForDay.map((rule) => (
                            <div
                              key={rule.id}
                              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/40 border border-border text-xs"
                            >
                              <span className="font-mono font-semibold text-foreground">
                                {formatTime(rule.startTime)} – {formatTime(rule.endTime)}
                              </span>
                              <span className="text-[10px] text-muted-foreground">
                                ({rule.slotDurationMinutes}m slots
                                {rule.bufferMinutes > 0 ? ` + ${rule.bufferMinutes}m rest` : ''})
                              </span>
                              <div className="flex items-center gap-0.5 ml-1 border-l pl-1.5 border-border">
                                <button
                                  type="button"
                                  onClick={() => handleOpenEditRule(rule)}
                                  className="p-1 text-muted-foreground hover:text-primary transition-colors"
                                  title="Edit range"
                                >
                                  <Edit2 className="h-3 w-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteWeeklyRule(rule.id)}
                                  className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                                  title="Remove range"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground/70 italic">
                          No working hours configured for {dayName}.
                        </span>
                      )}
                    </div>

                    {/* Action */}
                    <div className="self-end sm:self-auto shrink-0">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleOpenAddRule(dayIdx)}
                        className="h-8 text-xs gap-1 hover:text-primary"
                      >
                        <Plus className="h-3.5 w-3.5" /> Add Range
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* SECTION 2: DAYS OFF & DATE EXCEPTIONS */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold font-serif text-foreground">Days Off & Special Dates</h2>
            <p className="text-xs text-muted-foreground">
              Exceptions override your weekly schedule for specific dates (festivals, travel, or custom muhurats).
            </p>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsExceptionModalOpen(true)}
            className="h-8 text-xs gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" /> Block Date / Exception
          </Button>
        </div>

        {exceptions.length === 0 ? (
          <Card className="border-dashed border-border/80 p-6 text-center">
            <p className="text-xs text-muted-foreground">
              No date exceptions active. Your weekly schedule applies on all upcoming calendar dates.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {exceptions.map((exc) => (
              <Card key={exc.id} className="border-border/80 shadow-2xs">
                <CardContent className="p-4 flex items-center justify-between gap-3">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-foreground">
                        {formatFullDate(exc.date)}
                      </span>
                      <Badge
                        variant="outline"
                        className={`text-[10px] ${
                          exc.type === 'BLOCKED'
                            ? 'bg-destructive/10 text-destructive border-destructive/30'
                            : 'bg-primary/10 text-primary border-primary/30'
                        }`}
                      >
                        {exc.type === 'BLOCKED' ? 'Blocked (Day Off)' : 'Custom Hours'}
                      </Badge>
                    </div>
                    {exc.reason && (
                      <p className="text-[11px] text-muted-foreground truncate">{exc.reason}</p>
                    )}
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteException(exc.id)}
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive shrink-0"
                    title="Remove exception"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 3: LIVE AVAILABILITY PREVIEW */}
      <Card className="border-border/80 shadow-xs">
        <CardHeader className="pb-3 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base font-serif flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-primary" />
              <span>Live Availability Preview</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Select any date to see the exact bookable slots devotees will see on your profile.
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground">Inspect Date:</span>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="text-xs h-8 bg-card border-border w-38"
            />
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h4 className="text-xs font-semibold text-foreground">
              Slots for {formatFullDate(selectedDate)}
            </h4>
            <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-emerald-500" /> Available
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-primary" /> Booked
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-destructive" /> Blocked
              </span>
            </div>
          </div>

          {isPreviewLoading ? (
            <div className="py-8 text-center text-xs text-muted-foreground">Calculating slots...</div>
          ) : previewSlots.length === 0 ? (
            <div className="py-8 text-center space-y-2">
              <AlertCircle className="h-6 w-6 mx-auto text-muted-foreground/40" />
              <p className="text-xs text-muted-foreground">
                No slots available on this date according to your weekly schedule.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {previewSlots.map((slot) => {
                const isAvail = slot.status === 'AVAILABLE';
                const isBooked = slot.status === 'BOOKED';

                return (
                  <div
                    key={slot.id}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      isAvail
                        ? 'bg-emerald-500/5 border-emerald-500/30'
                        : isBooked
                        ? 'bg-primary/5 border-primary/30'
                        : 'bg-muted/40 border-border text-muted-foreground'
                    }`}
                  >
                    <div className="font-mono font-bold text-xs text-foreground">
                      {formatTime(slot.startTime)} – {formatTime(slot.endTime)}
                    </div>
                    <Badge
                      variant="outline"
                      className={`text-[9px] mt-1.5 py-0 ${
                        isAvail
                          ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                          : isBooked
                          ? 'bg-primary/10 text-primary border-primary/20'
                          : 'bg-muted text-muted-foreground border-border'
                      }`}
                    >
                      {slot.status}
                    </Badge>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <AddWeeklyRuleModal
        isOpen={isRuleModalOpen}
        onClose={() => setIsRuleModalOpen(false)}
        onSave={handleSaveWeeklyRule}
        editingRule={editingRule}
        initialDay={ruleModalDay}
      />

      <AddExceptionModal
        isOpen={isExceptionModalOpen}
        onClose={() => setIsExceptionModalOpen(false)}
        onSave={handleSaveException}
        initialDate={selectedDate}
      />
    </div>
  );
};

export default PriestAvailabilityPage;
