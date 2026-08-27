import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  registerPriestPersonalSchema,
  RegisterPriestPersonalInput,
} from "@/schemas/auth.schema";
import { addressApi } from "@/api/address.api";
import { PincodeLocation } from "@/types/address.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { AuthRoleTabs } from "@/components/auth/AuthRoleTabs";
import {
  Flame,
  Phone,
  Mail,
  Lock,
  User,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Clock,
  Award,
  MapPin,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "sonner";

/**
 * PriestRegisterPage
 * Multi-Step Purohit Onboarding Application
 * Built with React Hook Form, Zod validation, and automated PIN-code city extraction.
 */
const PriestRegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [showPassword, setShowPassword] = useState(false);

  // Step 1: Personal info form with React Hook Form + Zod
  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<RegisterPriestPersonalInput>({
    resolver: zodResolver(registerPriestPersonalSchema),
    defaultValues: {
      fullName: "",
      phoneNumber: "",
      email: "",
      password: "",
    },
  });

  // Step 2: Verification OTPs
  const [phoneOtp, setPhoneOtp] = useState("");
  const [emailOtp, setEmailOtp] = useState("");

  // Step 3: Vedic Background & Location extraction via PIN Code
  const [experienceYears, setExperienceYears] = useState("12");
  const [pincode, setPincode] = useState("400050");
  const [locations, setLocations] = useState<PincodeLocation[]>([]);
  const [selectedLocation, setSelectedLocation] =
    useState<PincodeLocation | null>(null);
  const [city, setCity] = useState("Mumbai");
  const [state, setState] = useState("Maharashtra");
  const [isSearchingPin, setIsSearchingPin] = useState(false);

  const [bio, setBio] = useState(
    "Trained in Shukla Yajurveda. Experienced in Griha Pravesh and Satyanarayan Katha.",
  );
  const [languages, setLanguages] = useState<string[]>(["Hindi", "Sanskrit"]);
  const [specializations, setSpecializations] = useState<string[]>([
    "Grah Pravesh",
    "Satyanarayan Katha",
  ]);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Step 1 Submit after Zod validation
  const onPersonalSubmit = () => {
    setErrorMessage(null);
    setStep(2);
    toast.info("Verification codes sent. Development Mock OTP is 123456");
  };

  // Step 2 Submit
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (phoneOtp.trim() !== "123456") {
      setErrorMessage("Invalid Phone OTP. Enter mock code: 123456");
      return;
    }
    if (emailOtp.trim() !== "123456") {
      setErrorMessage("Invalid Email OTP. Enter mock code: 123456");
      return;
    }

    setStep(3);
    handleLookupPin("400050");
  };

  // Step 3: PIN Code Lookup & City Extraction
  const handleLookupPin = async (pinToSearch: string) => {
    const cleanPin = pinToSearch.trim().replace(/\D/g, "");
    if (cleanPin.length !== 6) return;

    setIsSearchingPin(true);
    try {
      const res = await addressApi.lookupPincode(cleanPin);
      setLocations(res.locations);
      if (res.locations.length > 0) {
        const primary = res.locations[0];
        setSelectedLocation(primary);
        setCity(primary.city);
        setState(primary.state);
      }
    } catch {
      toast.error("Could not resolve PIN code");
    } finally {
      setIsSearchingPin(false);
    }
  };

  // Step 3 Submit Application
  const handleSubmitApplication = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!bio.trim() || !city.trim() || !pincode.trim()) {
      setErrorMessage("Please provide your service PIN code and Vedic bio.");
      return;
    }

    setStep(4);
    toast.success("Purohit application submitted for review!");
  };

  const handleFillDemo = () => {
    setValue("fullName", "Pandit Giridhar Bhattacharya", {
      shouldValidate: true,
    });
    setValue("phoneNumber", "+919876543288", { shouldValidate: true });
    setValue("email", "giridhar.b@example.demo", { shouldValidate: true });
    setValue("password", "Priest@123", { shouldValidate: true });
    setErrorMessage(null);
  };

  return (
    <div className="container max-w-lg py-8 sm:py-10 px-4">
      {/* Role Switcher Tabs */}
      <AuthRoleTabs
        activeRole="PRIEST"
        onChange={(role) => {
          if (role === 'USER') navigate('/user/register');
        }}
      />

      <Card className="shadow-md border-primary/20">
        <CardHeader className="text-center space-y-1 pb-4">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground mb-1 shadow-sm">
            <Flame className="h-5 w-5" />
          </div>
          <CardTitle className="text-2xl font-bold font-serif text-foreground">
            {step === 4 ? "Application Received" : "Apply as a Vedic Purohit"}
          </CardTitle>
          <CardDescription className="text-xs">
            {step === 4
              ? "Status: Pending Administrator Approval"
              : `Step ${step} of 3 • ${
                  step === 1
                    ? "Personal Details"
                    : step === 2
                      ? "Contact Verification"
                      : "Vedic Qualifications"
                }`}
          </CardDescription>

          {step < 4 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <div
                className={`h-1.5 w-12 rounded-full ${step >= 1 ? "bg-primary" : "bg-muted"}`}
              />
              <div
                className={`h-1.5 w-12 rounded-full ${step >= 2 ? "bg-primary" : "bg-muted"}`}
              />
              <div
                className={`h-1.5 w-12 rounded-full ${step >= 3 ? "bg-primary" : "bg-muted"}`}
              />
            </div>
          )}
        </CardHeader>

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
                <Label className="text-xs">Full Name & Title</Label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="e.g. Pandit Radhe Shyam Shastri"
                    {...register("fullName")}
                    className="pl-9 text-xs"
                  />
                </div>
                {errors.fullName && (
                  <p className="text-[11px] text-destructive">
                    {errors.fullName.message}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Mobile Number (+91)</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="tel"
                    placeholder="+91 98765 43211"
                    {...register("phoneNumber")}
                    className="pl-9 text-xs"
                  />
                </div>
                {errors.phoneNumber && (
                  <p className="text-[11px] text-destructive">
                    {errors.phoneNumber.message}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="purohit@example.demo"
                    {...register("email")}
                    className="pl-9 text-xs"
                  />
                </div>
                {errors.email && (
                  <p className="text-[11px] text-destructive">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Create your portal password"
                    {...register("password")}
                    className="pl-9 pr-9 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-[11px] text-destructive">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={handleFillDemo}
                className="text-[11px] text-primary hover:underline font-medium block text-right w-full"
              >
                Fill demo application
              </button>
            </CardContent>

            <CardFooter className="flex flex-col space-y-3 pt-2">
              <Button type="submit" className="w-full text-xs gap-1.5">
                Continue to Verification <ArrowRight className="h-3.5 w-3.5" />
              </Button>
              <div className="text-center text-xs text-muted-foreground">
                Already registered?{" "}
                <Link
                  to="/priest/login"
                  className="text-primary font-medium hover:underline"
                >
                  Sign In
                </Link>
              </div>
            </CardFooter>
          </form>
        )}

        {/* ================= STEP 2: Phone & Email OTP ================= */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp}>
            <CardContent className="space-y-4">
              <div className="p-3 bg-muted/40 rounded-lg border text-xs text-muted-foreground space-y-1">
                <p className="font-semibold text-foreground">
                  Development Mock OTP:
                </p>
                <p>
                  Use code:{" "}
                  <strong className="text-primary font-mono text-sm">
                    123456
                  </strong>
                </p>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Mobile Verification Code</Label>
                <Input
                  maxLength={6}
                  placeholder="123456"
                  value={phoneOtp}
                  onChange={(e) => setPhoneOtp(e.target.value)}
                  className="font-mono text-center tracking-widest text-sm"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Email Verification Code</Label>
                <Input
                  maxLength={6}
                  placeholder="123456"
                  value={emailOtp}
                  onChange={(e) => setEmailOtp(e.target.value)}
                  className="font-mono text-center tracking-widest text-sm"
                  required
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  setPhoneOtp("123456");
                  setEmailOtp("123456");
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

        {/* ================= STEP 3: Vedic Qualifications & PIN-Code City Extraction ================= */}
        {step === 3 && (
          <form onSubmit={handleSubmitApplication}>
            <CardContent className="space-y-3.5">
              <div className="space-y-1">
                <Label className="text-xs">Vedic Experience (Years)</Label>
                <Input
                  type="number"
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(e.target.value)}
                  className="text-xs"
                  required
                />
              </div>

              {/* Service Base PIN Code & City Auto-Extraction */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">
                    Service Base PIN Code (Extracts City)
                  </Label>
                  {isSearchingPin && (
                    <span className="text-[10px] text-primary animate-pulse">
                      Detecting city from Postal API...
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <Input
                    maxLength={6}
                    value={pincode}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      setPincode(val);
                      if (val.length === 6) {
                        handleLookupPin(val);
                      }
                    }}
                    placeholder="e.g. 400050, 560038, 700019"
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
                    {isSearchingPin ? "Detecting..." : "Find City"}
                  </Button>
                </div>
              </div>

              {/* Multiple Localities Dropdown */}
              {locations.length > 0 && (
                <div className="space-y-1.5 p-2.5 rounded-lg bg-muted/40 border">
                  <Label className="text-xs font-medium text-foreground">
                    Primary Service Locality ({locations.length} areas found)
                  </Label>
                  <select
                    className="w-full text-xs p-2 rounded-md border bg-background text-foreground"
                    value={selectedLocation?.postOffice}
                    onChange={(e) => {
                      const match = locations.find(
                        (l) => l.postOffice === e.target.value,
                      );
                      if (match) {
                        setSelectedLocation(match);
                        setCity(match.city);
                        setState(match.state);
                      }
                    }}
                  >
                    {locations.map((loc, idx) => (
                      <option key={idx} value={loc.postOffice}>
                        {loc.postOffice} • {loc.city}, {loc.state}
                      </option>
                    ))}
                  </select>

                  {/* Extracted City & State Display */}
                  <div className="pt-1 flex flex-wrap gap-2 text-xs">
                    <span className="bg-background px-2.5 py-1 rounded border flex items-center gap-1 font-medium">
                      <MapPin className="h-3 w-3 text-primary" /> City:{" "}
                      <strong className="text-primary">{city}</strong>
                    </span>
                    <span className="bg-background px-2.5 py-1 rounded border">
                      State:{" "}
                      <strong className="text-foreground">{state}</strong>
                    </span>
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <Label className="text-xs">Languages Spoken</Label>
                <div className="flex flex-wrap gap-2 pt-1 text-xs">
                  {[
                    "Sanskrit",
                    "Hindi",
                    "Marathi",
                    "Bengali",
                    "Kannada",
                    "Tamil",
                    "Telugu",
                    "Gujarati",
                  ].map((lang) => {
                    const checked = languages.includes(lang);
                    return (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => {
                          setLanguages(
                            checked
                              ? languages.filter((l) => l !== lang)
                              : [...languages, lang],
                          );
                        }}
                        className={`px-2.5 py-1 rounded-full border text-[11px] transition-colors ${
                          checked
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-background text-muted-foreground border-border"
                        }`}
                      >
                        {lang}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Vedic Specializations</Label>
                <div className="flex flex-wrap gap-2 pt-1 text-xs">
                  {[
                    "Grah Pravesh",
                    "Satyanarayan Katha",
                    "Rudrabhishek",
                    "Vivah Sanskar",
                    "Navagraha Havan",
                    "Vastu Shanti",
                  ].map((spec) => {
                    const checked = specializations.includes(spec);
                    return (
                      <button
                        key={spec}
                        type="button"
                        onClick={() => {
                          setSpecializations(
                            checked
                              ? specializations.filter((s) => s !== spec)
                              : [...specializations, spec],
                          );
                        }}
                        className={`px-2.5 py-1 rounded-full border text-[11px] transition-colors ${
                          checked
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-background text-muted-foreground border-border"
                        }`}
                      >
                        {spec}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Gurukul Lineage & Bio</Label>
                <Textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  className="text-xs"
                  placeholder="Describe your Vedic study and samhita lineage..."
                  required
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
              <Button type="submit" size="sm" className="text-xs gap-1">
                <Award className="h-3.5 w-3.5" /> Submit Application
              </Button>
            </CardFooter>
          </form>
        )}

        {/* ================= STEP 4: PENDING APPROVAL CONFIRMATION ================= */}
        {step === 4 && (
          <div>
            <CardContent className="text-center space-y-4 py-6">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20">
                <Clock className="h-8 w-8 animate-pulse" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-lg font-bold text-foreground">
                  Application Submitted
                </h3>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
                  Thank you, Pandit {getValues("fullName")}. Your Vedic
                  credentials in{" "}
                  <strong className="text-foreground">
                    {city}, {state}
                  </strong>{" "}
                  have been received with status{" "}
                  <strong className="dark:text-amber-300 font-semibold">
                    PENDING ADMIN APPROVAL
                  </strong>
                  . Once verified by the platform team, your Purohit Workspace
                  will be unlocked.
                </p>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-2 pt-2">
              <Link to="/auth/priest/login" className="w-full">
                <Button variant="default" size="sm" className="w-full text-xs">
                  Return to Priest Sign In
                </Button>
              </Link>
              <Link to="/" className="w-full">
                <Button variant="outline" size="sm" className="w-full text-xs">
                  Go to PujaCircle Home
                </Button>
              </Link>
            </CardFooter>
          </div>
        )}
      </Card>
    </div>
  );
};

export default PriestRegisterPage;
