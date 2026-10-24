"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
// import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Mail, Lock, User, ArrowRight, Briefcase } from "lucide-react";
import { useTransition } from "react";
import {
  publicRegisterRoles,
  registerSchema,
  type RegisterInput,
} from "@/validations/auth";
import { registerAction } from "@/features/auth/actions/auth-actions";
import { ROLE_LABELS, UserRole } from "@/constants/roles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * Public registration — user picks their role at signup.
 */
export function RegisterForm() {
  const router = useRouter();
  // const [googleLoading, setGoogleLoading] = useState(false);
  const [pending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: UserRole.USER },
  });

  function onSubmit(data: RegisterInput) {
    startTransition(async () => {
      const result = await registerAction(data);
      if (!result.success) {
        if (result.fieldErrors) {
          for (const [field, messages] of Object.entries(result.fieldErrors)) {
            setError(field as keyof RegisterInput, { message: messages[0] });
          }
        }
        toast.error(result.error);
        return;
      }

      toast.success(result.message ?? "Account created!");
      router.push(result.redirectTo || "/dashboard");
      router.refresh();
    });
  }

  /* Google login disabled for now
  async function handleGoogle() {
    setGoogleLoading(true);
    await signIn("google", { callbackUrl: "/auth/continue" });
  }
  */

  return (
    <div className="animate-fade-in">
      <h1 className="font-display text-foreground text-3xl font-bold">
        Create your account
      </h1>
      <p className="text-muted-foreground mt-2">
        Join NexPlast and start earning Nature Coins
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full name</Label>
          <div className="relative">
            <User className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              id="name"
              placeholder="Aarav Patel"
              className="pl-10"
              autoComplete="name"
              {...register("name")}
            />
          </div>
          {errors.name ? (
            <p className="text-destructive text-sm">{errors.name.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email address</Label>
          <div className="relative">
            <Mail className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              id="email"
              type="email"
              placeholder="you@email.com"
              className="pl-10"
              autoComplete="email"
              {...register("email")}
            />
          </div>
          {errors.email ? (
            <p className="text-destructive text-sm">{errors.email.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="role">I want to join as</Label>
          <div className="relative">
            <Briefcase className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <select
              id="role"
              className="border-input focus-visible:border-ring focus-visible:ring-ring/50 flex h-10 w-full appearance-none rounded-md border bg-transparent py-2 pr-8 pl-10 text-sm shadow-xs outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50"
              {...register("role")}
            >
              {publicRegisterRoles.map((role) => (
                <option key={role} value={role}>
                  {ROLE_LABELS[role]}
                </option>
              ))}
            </select>
          </div>
          {errors.role ? (
            <p className="text-destructive text-sm">{errors.role.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Lock className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              className="pl-10"
              autoComplete="new-password"
              {...register("password")}
            />
          </div>
          {errors.password ? (
            <p className="text-destructive text-sm">
              {errors.password.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm password</Label>
          <div className="relative">
            <Lock className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              className="pl-10"
              autoComplete="new-password"
              {...register("confirmPassword")}
            />
          </div>
          {errors.confirmPassword ? (
            <p className="text-destructive text-sm">
              {errors.confirmPassword.message}
            </p>
          ) : null}
        </div>

        <Button type="submit" className="w-full" loading={pending} size="lg">
          {pending ? "Creating account..." : "Create account"}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </form>

      {/* Google login disabled for now
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="border-border w-full border-t" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-background text-muted-foreground px-4 text-xs">
            or continue with
          </span>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full"
        size="lg"
        loading={googleLoading}
        onClick={handleGoogle}
      >
        Continue with Google
      </Button>
      */}

      <p className="text-muted-foreground mt-8 text-center text-sm">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-primary font-medium hover:underline"
        >
          Log in
        </Link>
      </p>
    </div>
  );
}
