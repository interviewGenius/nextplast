"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
// import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Mail, Lock, ArrowRight } from "lucide-react";
import { Suspense, useTransition } from "react";
import { loginSchema, type LoginInput } from "@/validations/auth";
import { loginAction } from "@/features/auth/actions/auth-actions";
import { safeCallbackUrl } from "@/utils/safe-callback-url";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function LoginFormInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Only Google login used this; restore with it.
  // const callbackUrl = safeCallbackUrl(
  //   searchParams.get("callbackUrl"),
  //   "/auth/continue",
  // );
  // const [googleLoading, setGoogleLoading] = useState(false);
  const [pending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  function onSubmit(data: LoginInput) {
    startTransition(async () => {
      const result = await loginAction(data);
      if (!result.success) {
        if (result.fieldErrors) {
          for (const [field, messages] of Object.entries(result.fieldErrors)) {
            setError(field as keyof LoginInput, { message: messages[0] });
          }
        }
        toast.error(result.error);
        return;
      }

      toast.success(result.message ?? "Welcome back!");
      const destination = safeCallbackUrl(
        searchParams.get("callbackUrl"),
        result.redirectTo || "/auth/continue",
      );
      router.push(destination);
      router.refresh();
    });
  }

  /* Google login disabled for now
  async function handleGoogle() {
    setGoogleLoading(true);
    await signIn("google", {
      callbackUrl,
    });
  }
  */

  return (
    <div className="animate-fade-in">
      <h1 className="font-display text-foreground text-3xl font-bold">
        Welcome back
      </h1>
      <p className="text-muted-foreground mt-2">
        Log in to your NexPlast account
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
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
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link
              href="/forgot-password"
              className="text-primary text-sm font-medium hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              className="pl-10"
              autoComplete="current-password"
              {...register("password")}
            />
          </div>
          {errors.password ? (
            <p className="text-destructive text-sm">
              {errors.password.message}
            </p>
          ) : null}
        </div>

        <Button type="submit" className="w-full" loading={pending} size="lg">
          {pending ? "Signing in..." : "Log in"}
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
        <GoogleIcon />
        Continue with Google
      </Button>
      */}

      <p className="text-muted-foreground mt-8 text-center text-sm">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="text-primary font-medium hover:underline"
        >
          Create one
        </Link>
      </p>
    </div>
  );
}

/* Google login disabled for now
function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}*/

/**
 * Login form — email/password + Google OAuth.
 */
export function LoginForm() {
  return (
    <Suspense
      fallback={<div className="text-muted-foreground text-sm">Loading...</div>}
    >
      <LoginFormInner />
    </Suspense>
  );
}
