import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { verifyOtpSchema, VerifyOtpInput } from '@/schemas/auth.schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle2, AlertCircle, Sparkles, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export interface OtpVerificationCardProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  loginPath: string;
  onVerify: (otp: string) => Promise<{ success: boolean; message: string }>;
  successMessage: string;
}

/**
 * OtpVerificationCard
 * Ultra-Premium Split-Card Verification for Phone & Email Authentication.
 * 100% Flexbox, pure solid white canvas, radiant Haldi gold trims, zero grids, zero gradients.
 */
export const OtpVerificationCard: React.FC<OtpVerificationCardProps> = ({
  title,
  subtitle,
  icon,
  loginPath,
  onVerify,
  successMessage,
}) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VerifyOtpInput>({
    resolver: zodResolver(verifyOtpSchema),
    defaultValues: {
      otp: '',
    },
  });

  const onSubmit = async (data: VerifyOtpInput) => {
    setError(null);
    setIsLoading(true);
    try {
      const res = await onVerify(data.otp);
      if (res.success) {
        toast.success(successMessage);
        navigate(loginPath);
      } else {
        setError(res.message);
      }
    } catch {
      setError('Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <div className="w-full min-h-[calc(100vh-140px)] flex items-center justify-center py-6 sm:py-10 px-3 sm:px-4 text-stone-900 max-w-full overflow-x-hidden">
      <div className="w-full max-w-4xl rounded-xl border-2 border-amber-300 bg-white shadow-xl overflow-hidden flex flex-col lg:flex-row items-stretch">
        {/* Left Showcase Panel */}
        <div className="hidden lg:flex flex-col justify-between w-5/12 bg-[#780016] text-white p-8 sm:p-10 border-r-2 border-amber-400/40 relative">
          <div className="space-y-6">
            <div className="flex items-center gap-2.5">
              <div className="h-10 w-10 rounded-md bg-amber-400 text-stone-950 flex items-center justify-center shadow-md select-none font-serif font-black text-2xl">
                ॐ
              </div>
              <div>
                <div className="font-serif font-black text-lg tracking-wider text-amber-300">
                  PUJACIRCLE
                </div>
                <div className="text-[10px] text-amber-100 uppercase tracking-widest font-semibold">
                  Sacred Authentication
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm bg-amber-400/20 text-amber-300 border border-amber-400/40 text-xs font-semibold">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Sanctum Verification</span>
              </div>
              <h2 className="text-2xl font-bold font-serif text-white leading-snug">
                One-Time Authentication
              </h2>
              <p className="text-xs text-amber-100/90 leading-relaxed">
                Confirming your authentic identity to safeguard devotee communications, priest appointment schedules, and cash dakshina transparency.
              </p>
            </div>

            <div className="space-y-2.5 pt-2">
              <div className="flex items-center gap-2 text-xs text-amber-100">
                <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0" />
                <span>Zero Third-Party Advertising</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-amber-100">
                <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0" />
                <span>Encrypted Session Tokens</span>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-amber-400/30 space-y-1">
            <div className="text-xs font-serif text-amber-200 italic">
              “सत्यमेव जयते — Truth alone prevails.”
            </div>
            <div className="text-[10px] text-amber-400 font-medium">
              — Upanishadic Proverb
            </div>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="w-full lg:w-7/12 p-4 sm:p-8 md:p-10 bg-white flex flex-col justify-between relative">
          <div>
            {/* Top Row: Verification Badge */}
            <div className="flex items-center justify-between gap-4 mb-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-md bg-amber-100/70 border border-amber-300 text-xs font-bold text-[#780016]">
                {icon}
                <span>Identity Verification</span>
              </div>
            </div>

            <div className="space-y-1 mb-6">
              <h1 className="text-2xl font-bold font-serif text-stone-900">
                {title}
              </h1>
              <p className="text-xs text-stone-600 leading-relaxed">
                {subtitle}
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2.5 font-semibold">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-stone-800">6-Digit Sacred Verification Code</Label>
                <Input
                  maxLength={6}
                  placeholder="Enter 6-digit code"
                  {...register('otp')}
                  className="font-mono text-center tracking-widest text-base h-11 rounded-md border-amber-300 focus-visible:ring-red-700"
                />
                {errors.otp && (
                  <p className="text-[11px] text-red-700 font-semibold">{errors.otp.message}</p>
                )}
              </div>

              <div className="space-y-3 pt-2">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full text-xs font-bold bg-[#780016] hover:bg-[#600012] text-white h-11 rounded-md shadow-md cursor-pointer gap-2"
                >
                  {isLoading ? 'Verifying Credentials...' : 'Verify & Continue'}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </div>

          <div className="pt-6 text-center text-xs text-stone-600">
            <Link to={loginPath} className="text-[#780016] font-bold hover:underline">
              ← Return to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OtpVerificationCard;
