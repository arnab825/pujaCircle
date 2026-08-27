import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerUserPersonalSchema, RegisterUserPersonalInput } from '@/schemas/auth.schema';
import { useAuthStore } from '@/store/auth.store';
import { addressApi } from '@/api/address.api';
import { PincodeLocation } from '@/types/address.types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Phone, Mail, Lock, User, MapPin, CheckCircle2, ArrowRight, ArrowLeft, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { PujaCircleLogo } from '@/components/common/PujaCircleLogo';
import { toast } from 'sonner';

/**
 * UserRegisterPage
 * Multi-Step Devotee Registration Form
 * Uses React Hook Form + Zod for personal credentials, followed by OTP and PIN-code address detection.
 */
const UserRegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { setUser } = useAuthStore();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [showPassword, setShowPassword] = useState(false);

  // Step 1: Personal info form with React Hook Form + Zod
  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<RegisterUserPersonalInput>({
    resolver: zodResolver(registerUserPersonalSchema),
    defaultValues: {
      fullName: '',
      phoneNumber: '',
      email: '',
      password: '',
    },
  });

  // Step 2: OTP verification state
  const [phoneOtp, setPhoneOtp] = useState('');
  const [emailOtp, setEmailOtp] = useState('');

  // Step 3: Address setup state
  const [pincode, setPincode] = useState('700019');
  const [locations, setLocations] = useState<PincodeLocation[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<PincodeLocation | null>(null);
  const [houseBuilding, setHouseBuilding] = useState('Flat 402, Ganga Heights');
  const [street, setStreet] = useState('Rashbehari Avenue');
  const [landmark, setLandmark] = useState('Near Lake Mall');
  const [isSearchingPin, setIsSearchingPin] = useState(false);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step 1: Proceed to OTPs after Zod validation
  const onPersonalSubmit = () => {
    setErrorMessage(null);
    setStep(2);
    toast.info('Verification codes sent. Development Mock OTP is 123456');
  };

  // Step 2: Validate OTPs
  const handleVerifyOtpStep = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (phoneOtp.trim() !== '123456') {
      setErrorMessage('Invalid Phone OTP. Please enter mock OTP: 123456');
      return;
    }
    if (emailOtp.trim() !== '123456') {
      setErrorMessage('Invalid Email OTP. Please enter mock OTP: 123456');
      return;
    }

    setStep(3);
    handleLookupPin('700019');
  };

  // Step 3: PIN Code Lookup
  const handleLookupPin = async (pinToSearch: string) => {
    const cleanPin = pinToSearch.trim().replace(/\D/g, '');
    if (cleanPin.length !== 6) return;

    setIsSearchingPin(true);
    try {
      const res = await addressApi.lookupPincode(cleanPin);
      setLocations(res.locations);
      if (res.locations.length > 0) {
        setSelectedLocation(res.locations[0]);
      }
    } catch {
      toast.error('Could not resolve PIN code');
    } finally {
      setIsSearchingPin(false);
    }
  };

  // Step 3: Complete Registration
  const handleCompleteRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!houseBuilding.trim() || !street.trim() || !selectedLocation) {
      setErrorMessage('Please complete your home address details.');
      return;
    }

    setIsSubmitting(true);
    const formVals = getValues();

    const newUser = {
      id: `user-devotee-${Date.now()}`,
      name: formVals.fullName,
      phoneNumber: formVals.phoneNumber.startsWith('+91')
        ? formVals.phoneNumber
        : `+91${formVals.phoneNumber.replace(/\D/g, '')}`,
      email: formVals.email,
      role: 'USER' as const,
      hasAddress: true,
    };

    setTimeout(() => {
      setUser(newUser);
      setIsSubmitting(false);
      toast.success('Registration successful! Welcome to PujaCircle.');
      navigate('/rituals');
    }, 400);
  };

  const handleFillDemo = () => {
    setValue('fullName', 'Suresh Kumar Mukherjee', { shouldValidate: true });
    setValue('phoneNumber', '+919876543299', { shouldValidate: true });
    setValue('email', 'suresh.m@example.demo', { shouldValidate: true });
    setValue('password', 'User@123', { shouldValidate: true });
    setErrorMessage(null);
  };

  return (
    <div className="container max-w-lg py-10 px-4">
      <Card className="shadow-md border-border/80">
        <CardHeader className="text-center space-y-1 pb-4">
          <PujaCircleLogo size={44} className="mx-auto shadow-sm mb-2" />
          <CardTitle className="text-2xl font-bold font-serif text-foreground">
            Create Devotee Account
          </CardTitle>
          <CardDescription className="text-xs">
            Step {step} of 3 • {step === 1 ? 'Personal Details' : step === 2 ? 'Contact Verification' : 'Ceremony Address'}
          </CardDescription>

          {/* Stepper Indicator */}
          <div className="flex items-center justify-center gap-2 pt-2">
            <div className={`h-1.5 w-12 rounded-full ${step >= 1 ? 'bg-primary' : 'bg-muted'}`} />
            <div className={`h-1.5 w-12 rounded-full ${step >= 2 ? 'bg-primary' : 'bg-muted'}`} />
            <div className={`h-1.5 w-12 rounded-full ${step >= 3 ? 'bg-primary' : 'bg-muted'}`} />
          </div>
        </CardHeader>

        {/* Error Notification */}
        {errorMessage && (
          <div className="mx-6 mb-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* ================= STEP 1: Personal Info (React Hook Form + Zod) ================= */}
        {step === 1 && (
          <form onSubmit={handleSubmit(onPersonalSubmit)}>
            <CardContent className="space-y-3.5">
              <div className="space-y-1">
                <Label className="text-xs">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="e.g. Ramesh Chandra Sharma"
                    {...register('fullName')}
                    className="pl-9 text-xs"
                  />
                </div>
                {errors.fullName && (
                  <p className="text-[11px] text-destructive">{errors.fullName.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Mobile Number (+91)</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="tel"
                    placeholder="+91 98765 43210"
                    {...register('phoneNumber')}
                    className="pl-9 text-xs"
                  />
                </div>
                {errors.phoneNumber && (
                  <p className="text-[11px] text-destructive">{errors.phoneNumber.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    {...register('email')}
                    className="pl-9 text-xs"
                  />
                </div>
                {errors.email && (
                  <p className="text-[11px] text-destructive">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a secure password"
                    {...register('password')}
                    className="pl-9 pr-9 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-[11px] text-destructive">{errors.password.message}</p>
                )}
              </div>

              {/* Demo Pre-fill Button */}
              <button
                type="button"
                onClick={handleFillDemo}
                className="text-[11px] text-primary hover:underline font-medium block text-right w-full"
              >
                Auto-fill registration demo
              </button>
            </CardContent>

            <CardFooter className="flex flex-col space-y-3 pt-2">
              <Button type="submit" className="w-full text-xs gap-1.5">
                Continue to Verification <ArrowRight className="h-3.5 w-3.5" />
              </Button>
              <div className="text-center text-xs text-muted-foreground">
                Already have an account?{' '}
                <Link to="/auth/user/login" className="text-primary font-medium hover:underline">
                  Sign In
                </Link>
              </div>
            </CardFooter>
          </form>
        )}

        {/* ================= STEP 2: Phone & Email OTP ================= */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtpStep}>
            <CardContent className="space-y-4">
              <div className="p-3 bg-muted/40 rounded-lg border text-xs text-muted-foreground space-y-1">
                <p className="font-semibold text-foreground">Development Testing OTP:</p>
                <p>Use mock verification code: <strong className="text-primary font-mono text-sm">123456</strong></p>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <Label className="text-xs">Mobile Verification Code</Label>
                  <span className="text-[10px] text-muted-foreground">Sent to {getValues('phoneNumber')}</span>
                </div>
                <Input
                  maxLength={6}
                  placeholder="Enter 6-digit phone OTP (123456)"
                  value={phoneOtp}
                  onChange={(e) => setPhoneOtp(e.target.value)}
                  className="font-mono text-center tracking-widest text-sm"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <Label className="text-xs">Email Verification Code</Label>
                  <span className="text-[10px] text-muted-foreground">Sent to {getValues('email')}</span>
                </div>
                <Input
                  maxLength={6}
                  placeholder="Enter 6-digit email OTP (123456)"
                  value={emailOtp}
                  onChange={(e) => setEmailOtp(e.target.value)}
                  className="font-mono text-center tracking-widest text-sm"
                  required
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  setPhoneOtp('123456');
                  setEmailOtp('123456');
                  setErrorMessage(null);
                }}
                className="text-[11px] text-primary hover:underline font-medium block text-right w-full"
              >
                Auto-fill mock OTP (123456)
              </button>
            </CardContent>

            <CardFooter className="flex items-center justify-between gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-xs gap-1"
                onClick={() => setStep(1)}
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Back
              </Button>
              <Button type="submit" size="sm" className="text-xs gap-1">
                Verify & Continue <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </CardFooter>
          </form>
        )}

        {/* ================= STEP 3: Mandatory Home Address ================= */}
        {step === 3 && (
          <form onSubmit={handleCompleteRegistration}>
            <CardContent className="space-y-3.5">
              <div className="p-2.5 bg-primary/10 rounded-lg text-xs text-primary flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>Contacts verified! Set your address for ceremony muhurats.</span>
              </div>

              {/* PIN Code Lookup with Auto Detection */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">PIN Code (Auto-detected)</Label>
                  {isSearchingPin && (
                    <span className="text-[10px] text-primary animate-pulse">
                      Detecting area from Postal API...
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <Input
                    maxLength={6}
                    value={pincode}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      setPincode(val);
                      if (val.length === 6) {
                        handleLookupPin(val);
                      }
                    }}
                    placeholder="Enter 6-digit Indian PIN Code"
                    className="text-xs font-mono"
                    required
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-xs shrink-0"
                    onClick={() => handleLookupPin(pincode)}
                    disabled={isSearchingPin || pincode.length < 6}
                  >
                    {isSearchingPin ? 'Searching...' : 'Find Area'}
                  </Button>
                </div>
              </div>

              {/* Location Select (if multiple locations returned) */}
              {locations.length > 0 && (
                <div className="space-y-1.5 p-2.5 rounded-lg bg-muted/40 border">
                  <Label className="text-xs font-medium text-foreground">
                    Select Locality / Post Office ({locations.length} areas found)
                  </Label>
                  <select
                    className="w-full text-xs p-2 rounded-md border bg-background text-foreground"
                    value={selectedLocation?.postOffice}
                    onChange={(e) => {
                      const match = locations.find((l) => l.postOffice === e.target.value);
                      if (match) setSelectedLocation(match);
                    }}
                  >
                    {locations.map((loc, idx) => (
                      <option key={idx} value={loc.postOffice}>
                        {loc.postOffice} • {loc.city}, {loc.state}
                      </option>
                    ))}
                  </select>

                  {selectedLocation && (
                    <div className="pt-1 flex flex-wrap gap-1.5 text-[11px] text-muted-foreground">
                      <span className="bg-background px-2 py-0.5 rounded border flex items-center gap-1 font-medium">
                        <MapPin className="h-3 w-3 text-primary" /> City: <strong className="text-foreground">{selectedLocation.city}</strong>
                      </span>
                      <span className="bg-background px-2 py-0.5 rounded border">
                        District: <strong className="text-foreground">{selectedLocation.district}</strong>
                      </span>
                      <span className="bg-background px-2 py-0.5 rounded border">
                        State: <strong className="text-foreground">{selectedLocation.state}</strong>
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* House / Flat / Building */}
              <div className="space-y-1">
                <Label className="text-xs">House / Flat / Building</Label>
                <Input
                  placeholder="e.g. Flat 402, Ganga Heights"
                  value={houseBuilding}
                  onChange={(e) => setHouseBuilding(e.target.value)}
                  className="text-xs"
                  required
                />
              </div>

              {/* Street / Road */}
              <div className="space-y-1">
                <Label className="text-xs">Street / Road / Colony</Label>
                <Input
                  placeholder="e.g. Rashbehari Avenue"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  className="text-xs"
                  required
                />
              </div>

              {/* Landmark */}
              <div className="space-y-1">
                <Label className="text-xs">Landmark (Optional)</Label>
                <Input
                  placeholder="e.g. Near Lake Mall"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  className="text-xs"
                />
              </div>
            </CardContent>

            <CardFooter className="flex items-center justify-between gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-xs gap-1"
                onClick={() => setStep(2)}
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Back
              </Button>
              <Button
                type="submit"
                size="sm"
                className="text-xs gap-1"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating Account...' : 'Complete & Sign In'}
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </CardFooter>
          </form>
        )}
      </Card>
    </div>
  );
};

export default UserRegisterPage;
