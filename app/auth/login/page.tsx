"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { Button, Card, FieldError, Input, Label, TextField } from "@heroui/react";
import { AlertCircle, CheckCircle2, Droplet, Heart, Info, Lock } from "lucide-react";

const schema = z.object({
  email: z.string().trim().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginValues = z.infer<typeof schema>;

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const redirectTarget = searchParams?.get("redirect") || "/brand";

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: LoginValues) => {
    setServerError(null);
    setSuccessMessage(null);

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
        {
          email: values.email,
          password: values.password,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200 || response.status === 201) {
        const token =
          response.data?.token ||
          response.data?.data?.token ||
          response.data?.data?.access_token ||
          response.data?.access_token;

        const userData = response.data?.user || response.data?.data?.user;

        if (token) {
          login(token, userData);
        }

        setSuccessMessage("Login successful! Redirecting...");
        setTimeout(() => {
          router.push(redirectTarget);
        }, 1000);
      }
    } catch (error: any) {
      console.error("Login error:", error);
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to sign in. Please check your credentials.";
      setServerError(Array.isArray(message) ? message.join(", ") : message);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#f8fbfd] via-[#f3f7fa] to-[#fbf5f7] p-6 md:p-12 font-sans">
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
        
        {/* === Left Column: Description === */}
        <div className="flex flex-col space-y-8 lg:pr-8">
          <div className="flex items-center space-x-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#de7f9f]"></span>
            <span className="text-[#6c8c9f] text-xs font-bold tracking-widest uppercase">
              Glad to see you again
            </span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-[5.5rem] font-extrabold tracking-tight leading-[1.1]">
            <span className="text-[#355365] block mb-2">Care for your skin,</span>
            <span className="text-[#d884a2] block">at your own pace.</span>
          </h1>

          <p className="text-[#7691a0] text-lg lg:text-xl max-w-md leading-relaxed mt-2">
            Sign in to continue your skincare journey — slowly, without pressure.
          </p>

          <div className="flex items-center space-x-3 pt-12 text-[#9bb2be]">
            <Heart className="w-5 h-5 stroke-[2.5]" />
            <span className="text-sm font-medium">Not a diagnosis. Just friendly cosmetic guidance.</span>
          </div>
        </div>

        {/* === Right Column: Login Form Card === */}
        <div className="relative w-full max-w-[520px] mx-auto lg:mx-0 lg:ml-auto">
          <div className="absolute -inset-4 bg-pink-100/40 rounded-[3rem] blur-3xl -z-10"></div>

          <Card className="rounded-[2.5rem] shadow-[0_20px_50px_-12px_rgba(40,80,100,0.08)] bg-white border-none w-full">
            <Card.Content className="p-8 sm:p-12">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <span className="text-[#5ea2bf] text-xs font-bold tracking-widest uppercase block mb-4">
                    Yourskin Account
                  </span>
                  <h2 className="text-[#355365] text-3xl sm:text-4xl font-bold mb-3">
                    Sign in to your space
                  </h2>
                  <p className="text-[#849ca9] text-base">
                    Enter your account details to continue.
                  </p>
                </div>
                <div className="bg-[#eaf4f7] p-3.5 rounded-2xl shrink-0">
                  <Droplet className="w-6 h-6 text-[#5ea2bf]" />
                </div>
              </div>

              {/* Status Alert */}
              {serverError && (
                <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700 text-sm">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-500" />
                  <div>{serverError}</div>
                </div>
              )}

              {successMessage && (
                <div className="mb-6 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-700 text-sm">
                  <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-emerald-500" />
                  <div>{successMessage}</div>
                </div>
              )}

              {/* Form Input */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <TextField isInvalid={!!errors.email} className="flex flex-col gap-2">
                  <Label className="text-[#6c8c9f] font-bold text-sm">Email</Label>
                  <Controller
                    name="email"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        type="email"
                        placeholder="name@email.com"
                        className="h-14 rounded-2xl border border-[#d9e4e9] bg-transparent text-base text-[#355365] shadow-none placeholder:text-[#a8bcc6]"
                      />
                    )}
                  />
                  <FieldError>{errors.email?.message}</FieldError>
                </TextField>

                <TextField isInvalid={!!errors.password} className="flex flex-col gap-2">
                  <Label className="text-[#6c8c9f] font-bold text-sm">Password</Label>
                  <Controller
                    name="password"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        type="password"
                        placeholder="Your password"
                        className="h-14 rounded-2xl border border-[#d9e4e9] bg-transparent text-base text-[#355365] shadow-none placeholder:text-[#a8bcc6]"
                      />
                    )}
                  />
                  <FieldError>{errors.password?.message}</FieldError>
                </TextField>

                <Button
                  type="submit"
                  isDisabled={isSubmitting}
                  className="w-full bg-[#5bb2d9] hover:bg-[#4ea2c7] text-white rounded-2xl h-14 font-bold text-[1.1rem] flex items-center justify-center gap-2 shadow-sm transition-all mt-4"
                >
                  <Lock className="w-5 h-5 stroke-[2.5]" />
                  {isSubmitting ? "Signing in..." : "Sign In"}
                </Button>
              </form>

              <div className="text-center my-8">
                <span className="text-[#849ca9] text-sm">Don&apos;t have an account? </span>
                <Link
                  href="/auth/register"
                  className="text-[#d884a2] font-bold text-sm hover:underline transition-all"
                >
                  Sign up now
                </Link>
              </div>

              <div className="bg-[#f0f8f5] rounded-2xl p-4 sm:p-5 flex items-start gap-3 border border-[#e1f0eb]">
                <Info className="w-5 h-5 text-[#86b0a1] shrink-0 mt-0.5" />
                <p className="text-[#86b0a1] text-xs sm:text-sm leading-relaxed font-medium">
                  UI demo only. Sign-in details are not sent or stored.
                </p>
              </div>
            </Card.Content>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#f8fbfd] via-[#f3f7fa] to-[#fbf5f7]" />
      }
    >
      <LoginForm />
    </React.Suspense>
  );
}
