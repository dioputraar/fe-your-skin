"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import api from "@/lib/api";
import { Button, Card, FieldError, Input, Label, TextField } from "@heroui/react";
import { AlertCircle, CheckCircle2, Droplet, Heart, Info, UserPlus } from "lucide-react";

const schema = z
  .object({
    full_name: z.string().trim().min(3, "Name must be at least 3 characters"),
    email: z.string().trim().email("Invalid email address"),
    date_of_birth: z.string().min(1, "Date of birth is required"),
    gender: z.enum(["MALE", "FEMALE"], {
      errorMap: () => ({ message: "Please select gender" }),
    }),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

type RegisterValues = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      full_name: "",
      email: "",
      date_of_birth: "",
      gender: "MALE",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: RegisterValues) => {
    setServerError(null);
    setSuccessMessage(null);

    try {
      const payload = {
        email: values.email,
        password: values.password,
        full_name: values.full_name,
        date_of_birth: `${values.date_of_birth}T00:00:00Z`,
        gender: values.gender,
      };

      const response = await api.post("/auth/register", payload);

      if (response.status === 200 || response.status === 201) {
        setSuccessMessage("Account created successfully! Redirecting to login...");
        setTimeout(() => {
          router.push("/auth/login");
        }, 1500);
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to register. Please check your data and try again.";
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
              Welcome
            </span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-[5.5rem] font-extrabold tracking-tight leading-[1.1]">
            <span className="text-[#355365] block mb-2">Get to know,</span>
            <span className="text-[#d884a2] block">your beautiful skin.</span>
          </h1>

          <p className="text-[#7691a0] text-lg lg:text-xl max-w-md leading-relaxed mt-2">
            Create an account to start your personalized skincare journey — slowly, without pressure.
          </p>

          <div className="flex items-center space-x-3 pt-12 text-[#9bb2be]">
            <Heart className="w-5 h-5 stroke-[2.5]" />
            <span className="text-sm font-medium">Not a diagnosis. Just friendly cosmetic guidance.</span>
          </div>
        </div>

        {/* === Right Column: Register Form Card === */}
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
                    Create an account
                  </h2>
                  <p className="text-[#849ca9] text-base">
                    Fill in your details to get started.
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
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <TextField isInvalid={!!errors.full_name} className="flex flex-col gap-2">
                  <Label className="text-[#6c8c9f] font-bold text-sm">Full Name</Label>
                  <Controller
                    name="full_name"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        type="text"
                        placeholder="John Doe"
                        className="h-14 rounded-2xl border border-[#d9e4e9] bg-transparent text-base text-[#355365] shadow-none placeholder:text-[#a8bcc6]"
                      />
                    )}
                  />
                  <FieldError>{errors.full_name?.message}</FieldError>
                </TextField>

                <TextField isInvalid={!!errors.email} className="flex flex-col gap-2">
                  <Label className="text-[#6c8c9f] font-bold text-sm">Email</Label>
                  <Controller
                    name="email"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        type="email"
                        placeholder="test@example.com"
                        className="h-14 rounded-2xl border border-[#d9e4e9] bg-transparent text-base text-[#355365] shadow-none placeholder:text-[#a8bcc6]"
                      />
                    )}
                  />
                  <FieldError>{errors.email?.message}</FieldError>
                </TextField>

                {/* Date of Birth & Gender */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <TextField isInvalid={!!errors.date_of_birth} className="flex flex-col gap-2">
                    <Label className="text-[#6c8c9f] font-bold text-sm">Date of Birth</Label>
                    <Controller
                      name="date_of_birth"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          type="date"
                          className="h-14 rounded-2xl border border-[#d9e4e9] bg-transparent text-base text-[#355365] shadow-none"
                        />
                      )}
                    />
                    <FieldError>{errors.date_of_birth?.message}</FieldError>
                  </TextField>

                  <div className="flex flex-col gap-2">
                    <Label className="text-[#6c8c9f] font-bold text-sm">Gender</Label>
                    <Controller
                      name="gender"
                      control={control}
                      render={({ field }) => (
                        <div className="grid grid-cols-2 gap-2 h-14">
                          <button
                            type="button"
                            onClick={() => field.onChange("MALE")}
                            className={`rounded-2xl border text-sm font-semibold transition-all flex items-center justify-center ${
                              field.value === "MALE"
                                ? "border-[#5bb2d9] bg-[#eaf4f7] text-[#2c6e8b]"
                                : "border-[#d9e4e9] bg-transparent text-[#6c8c9f] hover:border-[#5bb2d9]/50"
                            }`}
                          >
                            Male
                          </button>
                          <button
                            type="button"
                            onClick={() => field.onChange("FEMALE")}
                            className={`rounded-2xl border text-sm font-semibold transition-all flex items-center justify-center ${
                              field.value === "FEMALE"
                                ? "border-[#5bb2d9] bg-[#eaf4f7] text-[#2c6e8b]"
                                : "border-[#d9e4e9] bg-transparent text-[#6c8c9f] hover:border-[#5bb2d9]/50"
                            }`}
                          >
                            Female
                          </button>
                        </div>
                      )}
                    />
                    {errors.gender && (
                      <p className="text-xs text-danger">{errors.gender.message}</p>
                    )}
                  </div>
                </div>

                <TextField isInvalid={!!errors.password} className="flex flex-col gap-2">
                  <Label className="text-[#6c8c9f] font-bold text-sm">Password</Label>
                  <Controller
                    name="password"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        type="password"
                        placeholder="At least 6 characters"
                        className="h-14 rounded-2xl border border-[#d9e4e9] bg-transparent text-base text-[#355365] shadow-none placeholder:text-[#a8bcc6]"
                      />
                    )}
                  />
                  <FieldError>{errors.password?.message}</FieldError>
                </TextField>

                <TextField isInvalid={!!errors.confirmPassword} className="flex flex-col gap-2">
                  <Label className="text-[#6c8c9f] font-bold text-sm">Confirm Password</Label>
                  <Controller
                    name="confirmPassword"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        type="password"
                        placeholder="Repeat password"
                        className="h-14 rounded-2xl border border-[#d9e4e9] bg-transparent text-base text-[#355365] shadow-none placeholder:text-[#a8bcc6]"
                      />
                    )}
                  />
                  <FieldError>{errors.confirmPassword?.message}</FieldError>
                </TextField>

                <Button
                  type="submit"
                  isDisabled={isSubmitting}
                  className="w-full bg-[#5bb2d9] hover:bg-[#4ea2c7] text-white rounded-2xl h-14 font-bold text-[1.1rem] flex items-center justify-center gap-2 shadow-sm transition-all mt-4"
                >
                  <UserPlus className="w-5 h-5 stroke-[2.5]" />
                  {isSubmitting ? "Signing up..." : "Sign Up"}
                </Button>
              </form>

              <div className="text-center my-8">
                <span className="text-[#849ca9] text-sm">Already have an account? </span>
                <Link
                  href="/auth/login"
                  className="text-[#d884a2] font-bold text-sm hover:underline transition-all"
                >
                  Sign in
                </Link>
              </div>

              <div className="bg-[#f0f8f5] rounded-2xl p-4 sm:p-5 flex items-start gap-3 border border-[#e1f0eb]">
                <Info className="w-5 h-5 text-[#86b0a1] shrink-0 mt-0.5" />
                <p className="text-[#86b0a1] text-xs sm:text-sm leading-relaxed font-medium">
                  UI demo only. Registration details are not sent or stored.
                </p>
              </div>
            </Card.Content>
          </Card>
        </div>
      </div>
    </div>
  );
}
