"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  Checkbox,
  FieldError,
  Input,
  Label,
  Modal,
  TextField,
} from "@heroui/react";
import api from "@/lib/api";
import { Check, ShieldCheck, Sparkles, UploadCloud, X, Zap } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

const schema = z.object({
  name: z.string().trim().min(3, "Brand name must be filled"),
  image: z
    .custom<FileList | undefined>((val) => {
      if (!val) return true;
      return typeof FileList !== "undefined" && val instanceof FileList;
    })
    .optional(),
  parent_company: z.string().trim(),
  is_halal_certified: z.boolean(),
  is_active: z.boolean(),
});

// type BrandFormValues = z.infer<typeof brandSchema>;

// const EMPTY_VALUES: BrandFormValues = {
//   name: "",
//   image: undefined,
//   parent_company: "",
//   is_halal_certified: false,
//   is_active: true,
// };
const EMPTY_VALUES = {
  name: "",
  image: undefined,
  parent_company: "",
  is_halal_certified: false,
  is_active: true,
};

interface BrandFormModalProps {
  url: string;
  mode: "insert" | "update";
  data?: any;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSuccess?: () => void;
}

export default function BrandFormModal({
  url,
  mode = "insert",
  data = null,
  isOpen,
  onOpenChange,
  onSuccess,
}: BrandFormModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: EMPTY_VALUES,
  });

  // Isi field saat mode update (data dari baris yang dipilih)
  useEffect(() => {
    try {
      if (!data) return;
      setValue("name", data.name || "");
      setValue("parent_company", data.parent_company || "");
      setValue("is_halal_certified", data.is_halal_certified || false);
      setValue("is_active", data.is_active ?? true);
      // `image` dari API berupa string URL, sedangkan schema meminta FileList,
      // jadi tidak diisi; user cukup upload ulang jika ingin mengganti logo.
    } catch (error) {
      console.error(error);
    }
  }, [data, setValue]);

  // Bersihkan form setiap modal ditutup (sama seperti referensi Modal.tsx)
  useEffect(() => {
    if (!isOpen) reset(EMPTY_VALUES);
  }, [isOpen, reset]);

  const handleClose = () => {
    onOpenChange(false);
    reset(EMPTY_VALUES);
  };

  // Dipanggil handleSubmit hanya jika validasi zod lolos
  const onSubmit = async (values: z.infer<typeof schema>) => {
    setIsLoading(true);
    try {
      const body = new FormData();
      body.append("name", values.name);
      body.append("parent_company", values.parent_company);
      body.append("is_halal_certified", String(values.is_halal_certified));
      body.append("is_active", String(values.is_active));
      if (values.image?.[0]) body.append("image", values.image[0]);

      if (mode === "insert") {
        await api.post(url, body);
      } else {
        await api.put(url, body);
      }

      handleClose();
      onSuccess?.();
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal.Backdrop isOpen={isOpen} onOpenChange={(open) => (open ? onOpenChange(true) : handleClose())}>
      <Modal.Container placement="center">
        <Modal.Dialog className="sm:max-w-lg rounded-3xl">
          <Modal.CloseTrigger />
          <Modal.Header className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-skin-sky text-skin-blue">
              <Sparkles size={18} />
            </div>
            <div>
              <Modal.Heading>
                <span className="text-xs font-bold uppercase tracking-widest text-skin-blue">
                  {mode === "insert" ? "Add brand" : "Edit brand"}
                </span>
              </Modal.Heading>
            </div>
          </Modal.Header>

          <Modal.Body>
            <form id="brand-form" className="flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)}>

              <TextField isInvalid={!!errors.name}>
                <Label>Brand name</Label>
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <Input {...field} className="rounded-xl" placeholder="e.g. Wardah" />
                  )} />
                <FieldError>{errors.name?.message as string | undefined}</FieldError>
              </TextField>

              <TextField isInvalid={!!errors.parent_company}>
                <Label>Parent Company</Label>
                <Controller
                  name="parent_company"
                  control={control}
                  render={({ field }) => (
                    <Input {...field} className="rounded-xl" placeholder="e.g. PT Paragon" />
                  )} />
                <FieldError>{errors.parent_company?.message as string | undefined}</FieldError>
              </TextField>

              <div className="flex flex-col gap-1.5">
                <Label>Logo</Label>
                {data?.image && (
                  <div className="mb-2 flex items-center gap-3 p-2 border border-[#d9e6ec] rounded-xl bg-skin-sky/10">
                    <img
                      src={`${process.env.NEXT_PUBLIC_CLOUDINARY_URL}/${data.image}`}
                      alt="Current Logo"
                      className="h-14 w-14 object-contain rounded-lg border border-[#d9e6ec] bg-white p-1"
                    />
                    <div className="text-xs text-skin-muted">
                      <p className="font-medium text-skin-ink">Current Logo</p>
                      {/* <p>Pilih file baru di bawah jika ingin mengganti</p> */}
                    </div>
                  </div>
                )}
                <Controller
                  name="image"
                  control={control}
                  render={({ field }) => (
                    <FileDropLabel
                      fileName={(field.value as FileList | undefined)?.[0]?.name ?? null}
                      onChange={(files) => field.onChange(files ?? undefined)}
                      onBlur={field.onBlur}
                    />
                  )} />

                {errors.image && (
                  <FieldError>{errors.image?.message as string | undefined}</FieldError>
                )}
              </div>

              {/* Toggle pills instead of plain checkboxes — bigger target, shows state at a glance */}
              <div className="grid grid-cols-2 gap-3">
                <Controller
                  control={control}
                  name="is_halal_certified"
                  render={({ field }) => (
                    <TogglePill
                      icon={<ShieldCheck size={16} />}
                      label="Halal certified"
                      isSelected={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
                <Controller
                  control={control}
                  name="is_active"
                  render={({ field }) => (
                    <TogglePill
                      icon={<Zap size={16} />}
                      label="Active"
                      isSelected={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
              </div>
            </form>
          </Modal.Body>

          <Modal.Footer>
            <Button
              type="button"
              variant="secondary"
              onPress={handleClose}
              className="rounded-xl transition active:scale-[0.97]"
            >
              <X size={16} /> Cancel
            </Button>
            <Button
              type="submit"
              form="brand-form"
              isDisabled={isLoading}
              className="rounded-xl bg-skin-blue text-white transition active:scale-[0.97]"
            >
              <Check size={16} /> {isLoading ? "Saving..." : "Save brand"}
            </Button>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
}

/* --- Small presentational helpers, kept local since nothing else uses them --- */

function FileDropLabel({
  fileName,
  onChange,
  onBlur,
}: {
  fileName: string | null;
  onChange: (files: FileList | null) => void;
  onBlur?: () => void;
}) {
  const inputId = useRef(`brand-image-${Math.random().toString(36).slice(2)}`).current;
  return (
    <label
      htmlFor={inputId}
      className="flex cursor-pointer items-center gap-3 rounded-2xl border-2 border-dashed border-[#d9e6ec] bg-skin-sky/20 px-4 py-3.5 text-sm text-skin-muted transition hover:border-skin-blue hover:bg-skin-sky/40"
    >
      <UploadCloud size={18} className="text-skin-blue" />
      <span className="truncate">{fileName ?? "Click to upload a logo (PNG, JPG)"}</span>
      {/* File input tidak boleh punya prop `value` (read-only di browser), jadi kita
          tidak men-spread `field`; cukup teruskan FileList lewat onChange. */}
      <input
        id={inputId}
        name="image"
        type="file"
        accept="image/*"
        className="hidden"
        onBlur={onBlur}
        onChange={(e) => onChange(e.target.files)}
      />
    </label>
  );
}

function TogglePill({
  icon,
  label,
  isSelected,
  onChange,
}: {
  icon: React.ReactNode;
  label: string;
  isSelected: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <Checkbox isSelected={isSelected} onChange={onChange} className="w-full">
      <Checkbox.Content
        className={`flex w-full items-center gap-2 rounded-2xl border px-3.5 py-2.5 text-sm font-medium transition ${isSelected
          ? "border-skin-blue bg-skin-sky text-skin-ink"
          : "border-[#d9e6ec] bg-white text-skin-muted"
          }`}
      >
        <span className={isSelected ? "text-skin-blue" : "text-skin-muted"}>{icon}</span>
        {label}
      </Checkbox.Content>
    </Checkbox>
  );
}
