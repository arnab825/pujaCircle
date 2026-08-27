import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { phoneLoginSchema, UserLoginInput } from "@/schemas/auth.schema";
import { useAuthStore } from "@/store/auth.store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { AuthRoleTabs } from "@/components/auth/AuthRoleTabs";
import { PujaCircleLogo } from "@/components/common/PujaCircleLogo";
import {
  Phone,
  Lock,
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  Shield,
} from "lucide-react";
import { toast } from "sonner";

export interface AuthLoginFormProps {
  defaultRole?: "USER" | "PRIEST";
}

export const AuthLoginForm: React.FC<AuthLoginFormProps> = ({
  defaultRole = "USER",
}) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, isLoading, error, clearError } = useAuthStore();

  // Role detection from prop or query parameter (?role=priest or ?role=user)
  const queryRole = searchParams.get("role")?.toUpperCase();
  const initialRole =
    queryRole === "PRIEST" || queryRole === "USER" ? queryRole : defaultRole;

  const [activeRole, setActiveRole] = useState<"USER" | "PRIEST">(initialRole);
  const [showPassword, setShowPassword] = useState(false);

  // Dynamic configurations based on active role
  const isPriest = activeRole === "PRIEST";

  const roleConfig = {
    USER: {
      title: "User Sign In",
      subtitle:
        "Sign in with your mobile number to browse priests and book pujas.",
      badge: "User Portal",
      demoPhone: "+919876543210",
      demoPass: "User@123",
      redirect: "/user/home",
      forgot: "/user/forgot-password",
      register: "/user/register",
      registerPrompt: "Don't have an account?",
      registerCta: "Sign up",
    },
    PRIEST: {
      title: "Priest Sign In",
      subtitle:
        "Welcome! Access your puja bookings and schedule.",
      badge: "Priest Portal",
      demoPhone: "+919876543211",
      demoPass: "Priest@123",
      redirect: "/priest/dashboard",
      forgot: "/priest/forgot-password",
      register: "/priest/register",
      registerPrompt: "Are you a priest?",
      registerCta: "Apply to join",
    },
  }[activeRole];

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<UserLoginInput>({
    resolver: zodResolver(phoneLoginSchema),
    defaultValues: {
      phoneNumber: "",
      password: "",
    },
  });

  // Reset fields to clean empty state when switching roles
  const handleRoleChange = (newRole: string) => {
    const role = newRole as "USER" | "PRIEST";
    setActiveRole(role);
    clearError();
    reset({
      phoneNumber: "",
      password: "",
    });
  };

  const onSubmit = async (data: UserLoginInput) => {
    clearError();
    const cleanPhone = data.phoneNumber.trim();
    const identifier = cleanPhone.startsWith("+91")
      ? cleanPhone
      : `+91${cleanPhone.replace(/\D/g, "")}`;

    const success = await login({
      identifier,
      password: data.password,
    });

    if (success) {
      toast.success(
        `Welcome back to PujaCircle! Signed in as ${isPriest ? "Priest" : "User"}.`,
      );
      navigate(roleConfig.redirect);
    }
  };

  const handleFillDemo = () => {
    setValue("phoneNumber", roleConfig.demoPhone, { shouldValidate: true });
    setValue("password", roleConfig.demoPass, { shouldValidate: true });
    clearError();
  };

  return (
    <div className="container max-w-md py-8 sm:py-12 px-4">
      {/* 1. Top Segmented Control (Devotee vs Purohit Tabs) */}
      <AuthRoleTabs activeRole={activeRole} onChange={handleRoleChange} />

      {/* 2. Unified Auth Card */}
      <Card className="relative shadow-md border border-border/90 rounded-lg overflow-hidden">
        {/* Hidden Admin Access Corner Trigger */}
        <Link
          to="/admin/login"
          tabIndex={-1}
          aria-label="Staff access"
          title="Staff access"
          className="absolute top-3.5 right-3.5 text-muted-foreground/20 hover:text-muted-foreground/70 transition-colors p-1 rounded-md"
        >
          <Shield className="h-3.5 w-3.5" />
        </Link>

        <CardHeader className="text-center space-y-2.5 pb-4 pt-6">
          <div className="mx-auto flex items-center justify-center mb-0.5">
            <PujaCircleLogo size={46} className="shadow-xs" />
          </div>

          <div className="space-y-1">
            <CardTitle className="text-2xl font-bold font-serif text-foreground">
              {roleConfig.title}
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">
              {roleConfig.subtitle}
            </CardDescription>
          </div>
        </CardHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4 pt-1">
            {error && (
              <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Mobile Number Input */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Mobile Number (+91)</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="tel"
                  placeholder={roleConfig.demoPhone}
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

            {/* Password Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium">Password</Label>
                <Link
                  to={roleConfig.forgot}
                  className="text-[11px] text-primary hover:underline font-medium"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  {...register("password")}
                  className="pl-9 pr-9 text-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
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

            {/* Quick Demo Fill Button */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleFillDemo}
              className="w-full text-xs text-muted-foreground hover:text-foreground border-dashed h-8 gap-1.5"
            >
              <Sparkles className="h-3 w-3 text-primary" />
              Fill Demo Credentials ({roleConfig.demoPhone})
            </Button>
          </CardContent>

          <CardFooter className="flex flex-col gap-3.5 pb-6 pt-1">
            <Button
              type="submit"
              className="w-full gap-2 text-xs font-semibold h-10 shadow-xs"
              disabled={isLoading}
            >
              {isLoading
                ? "Signing In..."
                : `Sign In as ${isPriest ? "Priest" : "User"}`}
              <ArrowRight className="h-4 w-4" />
            </Button>

            <p className="text-center text-xs text-muted-foreground">
              {roleConfig.registerPrompt}{" "}
              <Link
                to={roleConfig.register}
                className="text-primary font-semibold hover:underline"
              >
                {roleConfig.registerCta}
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default AuthLoginForm;
