import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, ArrowRight, ArrowLeft, CircleCheck as CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { AuthLayout } from "@/components/auth/auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
});

type FormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  const onSubmit = (data: FormData) => {
    setEmail(data.email);
    setSubmitted(true);
  };

  return (
    <AuthLayout>
      {!submitted ? (
        <>
          <div className="space-y-2">
            <h1 className="font-display text-2xl font-bold tracking-tight">Reset your password</h1>
            <p className="text-sm text-muted-foreground">
              Enter your email and we'll send you a secure link to reset your password.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
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

            <Button type="submit" className="w-full" size="lg">
              Send reset link <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          <Link
            to="/login"
            className="mt-6 flex items-center justify-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Back to sign in
          </Link>
        </>
      ) : (
        <div className="space-y-6 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-success/10 text-success">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <div className="space-y-2">
            <h1 className="font-display text-2xl font-bold tracking-tight">Check your inbox</h1>
            <p className="text-sm text-muted-foreground">
              We've sent a password reset link to <span className="font-medium text-foreground">{email}</span>.
              The link will expire in 30 minutes.
            </p>
          </div>
          <Button asChild className="w-full" size="lg">
            <Link to="/login">Back to sign in</Link>
          </Button>
          <p className="text-xs text-muted-foreground">
            Didn't receive an email?{" "}
            <button
              onClick={() => setSubmitted(false)}
              className="font-medium text-primary hover:underline"
            >
              Try a different address
            </button>
          </p>
        </div>
      )}
    </AuthLayout>
  );
}
