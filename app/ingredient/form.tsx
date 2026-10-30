"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  Checkbox,
  Chip,
  FieldError,
  Input,
  Label,
  ListBox,
  Modal,
  Select,
  TextField,
} from "@heroui/react";
import axios from "axios";
import Cookies from "js-cookie";
import {
  Baby,
  Check,
  FlaskConical,
  ShieldCheck,
  X,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { TARGET_CONCERNS } from "@/lib/constants";

const schema = z.object({
  name: z.string().trim().min(2, "Nama ingredient minimal 2 karakter"),
  primary_function: z.string().trim().min(2, "Primary function wajib diisi"),
  comedogenic_rating: z.coerce
    .number({ invalid_type_error: "Comedogenic rating harus angka" })
    .min(0, "Rating minimal 0")
    .max(5, "Rating maksimal 5"),
  is_safe_for_pregnancy: z.boolean(),
  is_safe_for_fungal_acne: z.boolean(),
  target_conditions: z
    .array(z.string())
    .min(1, "Pilih minimal 1 target condition"),
  is_active: z.boolean(),
});

type IngredientFormValues = z.infer<typeof schema>;

const EMPTY_VALUES: IngredientFormValues = {
  name: "",
  primary_function: "",
  comedogenic_rating: 0,
  is_safe_for_pregnancy: true,
  is_safe_for_fungal_acne: true,
  target_conditions: [],
  is_active: true,
};

interface FormModalProps {
  url: string;
  mode: "insert" | "update";
  data?: any;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSuccess?: () => void;
}

export default function FormModal({
  url,
  mode = "insert",
  data = null,
  isOpen,
  onOpenChange,
  onSuccess,
}: FormModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<IngredientFormValues>({
    resolver: zodResolver(schema),
    defaultValues: EMPTY_VALUES,
  });

  // Isi field saat mode update (data dari baris yang dipilih)
  useEffect(() => {
    try {
      if (!data) return;
      setValue("name", data.name || "");
      setValue("primary_function", data.primary_function || "");
      setValue("comedogenic_rating", Number(data.comedogenic_rating ?? 0));
      setValue(
        "is_safe_for_pregnancy",
        Boolean(data.is_safe_for_pregnancy ?? true)
      );
      setValue(
        "is_safe_for_fungal_acne",
        Boolean(data.is_safe_for_fungal_acne ?? true)
      );
      setValue(
        "target_conditions",
        Array.isArray(data.target_conditions)
          ? data.target_conditions
          : typeof data.target_conditions === "string"
          ? data.target_conditions.split(",").map((s: string) => s.trim())
          : []
      );
      setValue("is_active", data.is_active ?? true);
    } catch (error) {
      console.error(error);
    }
  }, [data, setValue]);

  // Bersihkan form setiap modal ditutup
  useEffect(() => {
    if (!isOpen) reset(EMPTY_VALUES);
  }, [isOpen, reset]);

  const handleClose = () => {
    onOpenChange(false);
    reset(EMPTY_VALUES);
  };

  const onSubmit = async (values: IngredientFormValues) => {
    setIsLoading(true);
    try {
      const token = Cookies.get("token");
      const headers = {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      const payload = {
        name: values.name,
        primary_function: values.primary_function,
        comedogenic_rating: Number(values.comedogenic_rating),
        is_safe_for_pregnancy: Boolean(values.is_safe_for_pregnancy),
        is_safe_for_fungal_acne: Boolean(values.is_safe_for_fungal_acne),
        target_conditions: values.target_conditions,
        is_active: Boolean(values.is_active),
      };

      if (mode === "insert") {
        await axios.post(url, payload, { headers });
      } else {
        await axios.put(url, payload, { headers });
      }

      handleClose();
      onSuccess?.();
    } catch (error) {
      console.error("Gagal menyimpan ingredient:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal.Backdrop
      isOpen={isOpen}
      onOpenChange={(open) => (open ? onOpenChange(true) : handleClose())}
    >
      <Modal.Container placement="center">
        <Modal.Dialog className="sm:max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl">
          <Modal.CloseTrigger />
          <Modal.Header className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-skin-sky text-skin-blue">
              <FlaskConical size={18} />
            </div>
            <div>
              <Modal.Heading>
                <span className="text-xs font-bold uppercase tracking-widest text-skin-blue">
                  {mode === "insert" ? "Add Ingredient" : "Edit Ingredient"}
                </span>
              </Modal.Heading>
            </div>
          </Modal.Header>

          <Modal.Body>
            <form
              id="ingredient-form"
              className="flex flex-col gap-4"
              onSubmit={handleSubmit(onSubmit)}
            >
              {/* Ingredient Name */}
              <TextField isInvalid={!!errors.name}>
                <Label>Ingredient Name</Label>
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      className="rounded-xl"
                      placeholder="e.g. Niacinamide, Salicylic Acid"
                    />
                  )}
                />
                <FieldError>{errors.name?.message as string | undefined}</FieldError>
              </TextField>

              {/* Primary Function & Comedogenic Rating */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <TextField isInvalid={!!errors.primary_function}>
                  <Label>Primary Function</Label>
                  <Controller
                    name="primary_function"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        className="rounded-xl"
                        placeholder="e.g. Exfoliant, Soothing"
                      />
                    )}
                  />
                  <FieldError>
                    {errors.primary_function?.message as string | undefined}
                  </FieldError>
                </TextField>

                <TextField isInvalid={!!errors.comedogenic_rating}>
                  <Label>Comedogenic Rating (0 - 5)</Label>
                  <Controller
                    name="comedogenic_rating"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        type="number"
                        min="0"
                        max="5"
                        step="1"
                        className="rounded-xl"
                        placeholder="0 - 5"
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === ""
                              ? ""
                              : Number(e.target.value)
                          )
                        }
                      />
                    )}
                  />
                  <FieldError>
                    {errors.comedogenic_rating?.message as string | undefined}
                  </FieldError>
                </TextField>
              </div>

              {/* Target Conditions (Multi-select) */}
              <div className="flex flex-col gap-2">
                <Label className="text-sm font-medium">Target Conditions</Label>
                <Controller
                  name="target_conditions"
                  control={control}
                  render={({ field }) => (
                    <Select<any, "multiple">
                      aria-label="Target Conditions"
                      className="w-full"
                      selectionMode="multiple"
                      placeholder="Pilih Target Conditions"
                      value={field.value || []}
                      onChange={(val) => {
                        field.onChange(
                          Array.isArray(val)
                            ? val.map(String)
                            : val
                            ? [String(val)]
                            : []
                        );
                      }}
                    >
                      <Select.Trigger className="rounded-xl border border-[#d9e4e9] bg-white px-3 min-h-10 flex items-center">
                        <Select.Value className="flex flex-wrap gap-1.5 py-1">
                          {({ isPlaceholder, state }) => {
                            if (isPlaceholder) {
                              return (
                                <span className="text-gray-400 text-sm">
                                  Pilih Target Conditions
                                </span>
                              );
                            }
                            return (
                              <div className="flex flex-wrap gap-1.5 py-0.5">
                                {state.selectedItems.map((item) => (
                                  <Chip
                                    key={item.key}
                                    size="sm"
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    {item.textValue || String(item.rendered)}
                                  </Chip>
                                ))}
                              </div>
                            );
                          }}
                        </Select.Value>
                        <Select.Indicator />
                      </Select.Trigger>
                      <Select.Popover>
                        <ListBox aria-label="Daftar Target Conditions">
                          {TARGET_CONCERNS.map((item) => (
                            <ListBox.Item
                              key={item}
                              id={item}
                              textValue={item}
                            >
                              {item}
                              <ListBox.ItemIndicator />
                            </ListBox.Item>
                          ))}
                        </ListBox>
                      </Select.Popover>
                    </Select>
                  )}
                />
                {errors.target_conditions && (
                  <FieldError>
                    {errors.target_conditions?.message as string | undefined}
                  </FieldError>
                )}
              </div>

              {/* Toggle Pills: Booleans */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <Controller
                  control={control}
                  name="is_safe_for_pregnancy"
                  render={({ field }) => (
                    <TogglePill
                      icon={<Baby size={16} />}
                      label="Safe for Pregnancy"
                      isSelected={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
                <Controller
                  control={control}
                  name="is_safe_for_fungal_acne"
                  render={({ field }) => (
                    <TogglePill
                      icon={<ShieldCheck size={16} />}
                      label="Safe for Fungal Acne"
                      isSelected={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
                <div className="sm:col-span-2">
                  <Controller
                    control={control}
                    name="is_active"
                    render={({ field }) => (
                      <TogglePill
                        icon={<Zap size={16} />}
                        label="Active Status"
                        isSelected={field.value}
                        onChange={field.onChange}
                      />
                    )}
                  />
                </div>
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
              form="ingredient-form"
              isDisabled={isLoading}
              className="rounded-xl bg-skin-blue text-white transition active:scale-[0.97]"
            >
              <Check size={16} /> {isLoading ? "Saving..." : "Save Ingredient"}
            </Button>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
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
        <span className={isSelected ? "text-skin-blue" : "text-skin-muted"}>
          {icon}
        </span>
        {label}
      </Checkbox.Content>
    </Checkbox>
  );
}
