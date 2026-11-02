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
import { Check, Sparkles, UploadCloud, X, Zap } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

const schema = z.object({
  name: z.string().trim().min(2, "Nama kategori minimal 2 karakter").max(100, "Maksimal 100 karakter"),
  icon: z
    .custom<FileList | undefined>((val) => {
      if (!val) return true;
      return typeof FileList !== "undefined" && val instanceof FileList;
    })
    .optional(),
  is_active: z.boolean(),
});

type CategoryFormValues = z.infer<typeof schema>;

const EMPTY_VALUES = {
  name: "",
  icon: undefined,
  is_active: true,
};

interface CategoryFormModalProps {
  url: string;
  mode: "insert" | "update";
  data?: ICategory | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSuccess?: () => void;
}

export default function CategoryFormModal({
  url,
  mode = "insert",
  data = null,
  isOpen,
  onOpenChange,
  onSuccess,
}: CategoryFormModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(schema),
    defaultValues: EMPTY_VALUES,
  });

  // Isi data saat mode update
  useEffect(() => {
    try {
      if (!data) return;
      setValue("name", data.name || "");
      setValue("is_active", data.is_active ?? true);
      // icon dari backend bertipe string URL, sedangkan form menerima FileList.
      // Jadi tidak di-set di form state; ditampilkan via preview jika ada.
    } catch (error) {
      console.error(error);
    }
  }, [data, setValue]);

  // Reset form saat modal ditutup
  useEffect(() => {
    if (!isOpen) reset(EMPTY_VALUES);
  }, [isOpen, reset]);

  const handleClose = () => {
    onOpenChange(false);
    reset(EMPTY_VALUES);
  };

  const onSubmit = async (values: CategoryFormValues) => {
    setIsLoading(true);
    try {
      const body = new FormData();
      body.append("name", values.name);
      body.append("is_active", String(values.is_active));
      if (values.icon?.[0]) {
        body.append("icon", values.icon[0]);
      }

      if (mode === "insert") {
        await api.post(url, body);
      } else {
        await api.put(url, body);
      }

      handleClose();
      onSuccess?.();
    } catch (error) {
      console.error("Gagal menyimpan kategori:", error);
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
                  {mode === "insert" ? "Tambah Kategori" : "Edit Kategori"}
                </span>
              </Modal.Heading>
            </div>
          </Modal.Header>

          <Modal.Body>
            <form id="category-form" className="flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)}>
              {/* Nama Kategori */}
              <TextField isInvalid={!!errors.name}>
                <Label>Nama Kategori</Label>
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <Input {...field} className="rounded-xl" placeholder="Contoh: Serum, Cleanser, Toner" />
                  )}
                />
                <FieldError>{errors.name?.message as string | undefined}</FieldError>
              </TextField>

              {/* Upload Icon */}
              <div className="flex flex-col gap-1.5">
                <Label>Icon / Gambar</Label>
                {data?.icon && (
                  <div className="mb-2 flex items-center gap-3 p-2 border border-[#d9e6ec] rounded-xl bg-skin-sky/10">
                    <img
                      src={data.icon.startsWith("http") ? data.icon : `${process.env.NEXT_PUBLIC_CLOUDINARY_URL}/${data.icon}`}
                      alt="Icon saat ini"
                      className="h-14 w-14 object-contain rounded-lg border border-[#d9e6ec] bg-white p-1"
                    />
                    <div className="text-xs text-skin-muted">
                      <p className="font-medium text-skin-ink">Icon saat ini</p>
                      <p>Pilih file baru di bawah jika ingin mengganti</p>
                    </div>
                  </div>
                )}
                <Controller
                  name="icon"
                  control={control}
                  render={({ field }) => (
                    <FileDropLabel
                      fileName={(field.value as FileList | undefined)?.[0]?.name ?? null}
                      onChange={(files) => field.onChange(files ?? undefined)}
                      onBlur={field.onBlur}
                    />
                  )}
                />
                {errors.icon && (
                  <FieldError>{errors.icon?.message as string | undefined}</FieldError>
                )}
              </div>

              {/* Status Aktif */}
              <div className="grid grid-cols-1">
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
              <X size={16} /> Batal
            </Button>
            <Button
              type="submit"
              form="category-form"
              isDisabled={isLoading}
              className="rounded-xl bg-skin-blue text-white transition active:scale-[0.97]"
            >
              <Check size={16} /> {isLoading ? "Menyimpan..." : "Simpan Kategori"}
            </Button>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
}

function FileDropLabel({
  fileName,
  onChange,
  onBlur,
}: {
  fileName: string | null;
  onChange: (files: FileList | null) => void;
  onBlur?: () => void;
}) {
  const inputId = useRef(`category-icon-${Math.random().toString(36).slice(2)}`).current;
  return (
    <label
      htmlFor={inputId}
      className="flex cursor-pointer items-center gap-3 rounded-2xl border-2 border-dashed border-[#d9e6ec] bg-skin-sky/20 px-4 py-3.5 text-sm text-skin-muted transition hover:border-skin-blue hover:bg-skin-sky/40"
    >
      <UploadCloud size={18} className="text-skin-blue" />
      <span className="truncate">{fileName ?? "Klik untuk mengunggah icon (SVG, PNG, JPG)"}</span>
      <input
        id={inputId}
        name="icon"
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
        className={`flex w-full items-center gap-2 rounded-2xl border px-3.5 py-2.5 text-sm font-medium transition ${
          isSelected
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

