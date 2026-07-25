import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, Lock, User, ArrowRight, Eye, EyeOff, Check } from "lucide-react";
import { useState } from "react";
import { AuthLayout } from "@/components/auth/auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";

const schema = z.object({
  name: z.string().min(2, "Enter your full name"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type FormData = z.infer<typeof schema>;

const passwordChecks = [
  { label: "8+ characters", test: (v: string) => v.length >= 8 },
  { label: "One number", test: (v: string) => /\d/.test(v) },
  { label: "One uppercase", test: (v: string) => /[A-Z]/.test(v) },
];

export default function RegisterPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", password: "" },
  });

  const password = watch("password", "");

  const onSubmit = (data: FormData) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success("Account created!", "Let's set up your workspace.");
      navigate("/onboarding");
    }, 1000);
  };

  return (
    <AuthLayout side="right">
      <div className="space-y-2">
        <h1 className="font-display text-2xl font-bold tracking-tight">Create your account</h1>
        <p className="text-sm text-muted-foreground">
          Start your free workspace. No credit card required.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
        <div className="space-y-2">
          <Label htmlFor="name">Full name</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="name"
              placeholder="Sarah Chen"
              className="pl-9"
              {...register("name")}
            />
          </div>
          {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Work email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="you@company.com"
              className="pl-9"
              {...register("email")}
            />
          </div>
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Create a strong password"
              className="pl-9 pr-9"
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password ? (
            <p className="text-xs text-destructive">{errors.password.message}</p>
          ) : (
            <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1">
              {passwordChecks.map((c) => (
                <span
                  key={c.label}
                  className={`flex items-center gap-1 text-xs ${
                    c.test(password) ? "text-success" : "text-muted-foreground"
                  }`}
                >
                  <Check className="h-3 w-3" /> {c.label}
                </span>
              ))}
            </div>
          )}
        </div>

        <p className="text-xs text-muted-foreground">
          By creating an account, you agree to our{" "}
          <a href="#" className="text-primary hover:underline">Terms</a> and{" "}
          <a href="#" className="text-primary hover:underline">Privacy Policy</a>.
        </p>

        <Button type="submit" className="w-full" size="lg" disabled={loading}>
          {loading ? "Creating account…" : (<>Create free account <ArrowRight className="h-4 w-4" /></>)}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link to="/login" className="font-semibold text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
