"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  Card,
  Checkbox,
  Chip,
  FieldError,
  Input,
  Label,
  Modal,
  TextField,
  Select,
  ListBox
} from "@heroui/react";
import axios from "axios";
import Cookies from "js-cookie";
import { Check, ShieldCheck, Sparkles, X, Zap, Package, UploadCloud, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { DragDropProvider, DragEndEvent } from "@dnd-kit/react";
import { useSortable } from "@dnd-kit/react/sortable";
import { VOLUME_UNITS } from "@/lib/constants"

const schema = z.object({
  product_name: z.string().trim().min(3, "Product name must be at least 3 characters"),
  brand_id: z.string().trim().min(1, "Brand ID is required"),
  category_id: z.string().trim().min(1, "Category ID is required"),
  scope: z.string().trim().min(1, "Scope is required"),
  format: z.string().trim().min(1, "Format is required"),
  ph_level: z.coerce.number({ invalid_type_error: "pH must be a number" }),
  volume_amount: z.coerce.number({ invalid_type_error: "Volume must be a number" }),
  volume_unit: z.string().trim().min(1, "Volume unit is required"),
  is_fragrance_free: z.boolean(),
  is_alcohol_free: z.boolean(),
  stock_status: z.boolean(),
  is_active: z.boolean(),
  ingredients: z.array(z.string()).optional()
  // product_images: z.array(Product)
});

type ProductFormValues = z.infer<typeof schema>;

const EMPTY_VALUES: ProductFormValues = {
  product_name: "",
  brand_id: "",
  category_id: "",
  scope: "",
  format: "",
  ph_level: 5.5,
  volume_amount: 30,
  volume_unit: "ml",
  is_fragrance_free: false,
  is_alcohol_free: false,
  stock_status: true,
  is_active: true,
  ingredients: [],

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

  const [brands, setBrands] = useState<IBrand[]>([]);
  const [categories, setcategories] = useState<ICategory[]>([]);
  const [ingredients, setIngredients] = useState<IIngredient[]>([]);

  const [productIngredients, setProductIngredients] = useState<IProductIngredient[]>([]);
  const [selectedIngredientId, setSelectedIngredientId] = useState<string>("");
  const [ingredientPercentage, setIngredientPercentage] = useState<string>("");
  const [ingredientError, setIngredientError] = useState<string>("");
  const [productImages, setProductImages] = useState<IProductImage[]>([]);
  // const [isLoadingBrands, setIsLoadingBrands] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const fetchBrands = async () => {
      try {
        const token = Cookies.get("token");
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/brand`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const items = res.data ? res.data.data : [];
        setBrands(items);
      } catch (error) {
        console.error("Failed to load brand:", error);
      }
    };

    const fetchCategories = async () => {
      try {
        const token = Cookies.get("token");
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/category`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const items = res.data ? res.data.data : [];
        setcategories(items);
      } catch (error) {
        console.error("Failed to load category:", error);
      }
    };

    const fetchIngredients = async () => {
      try {
        const token = Cookies.get("token");
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/ingredient`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const items = res.data ? res.data.data : [];
        setIngredients(items);
      } catch (error) {
        console.error("Failed to load ingredients:", error);
      }
    };

    fetchBrands();
    fetchCategories();
    fetchIngredients();
  }, [isOpen]);

  // handle add product ingredient
  const handleAddProductIngredient = () => {
    setIngredientError("");
    if (!selectedIngredientId) {
      setIngredientError("Silakan pilih ingredient terlebih dahulu");
      return;
    }

    const isDuplicate = productIngredients.some(
      (item) => String(item.ingredient_id) === String(selectedIngredientId)
    );
    if (isDuplicate) {
      setIngredientError("Ingredient ini sudah ditambahkan");
      return;
    }

    const percentageNum = ingredientPercentage === "" ? 0 : Number(ingredientPercentage);
    if (isNaN(percentageNum) || percentageNum < 0 || percentageNum > 100) {
      setIngredientError("Persentase harus di antara 0 dan 100");
      return;
    }

    const newProductIngredient: IProductIngredient = {
      ingredient_id: selectedIngredientId,
      concentration_percentage: percentageNum,
      is_key_active: false,
      order_in_formula: productIngredients.length + 1,
    };

    setProductIngredients((prev) => [...prev, newProductIngredient]);
    setSelectedIngredientId("");
    setIngredientPercentage("");
  };

  // handle hapus ingredient dari list
  const handleRemoveProductIngredient = (ingredientIdToRemove: string) => {
    setProductIngredients((prev) =>
      prev
        .filter((item) => String(item.ingredient_id) !== String(ingredientIdToRemove))
        .map((item, idx) => ({
          ...item,
          order_in_formula: idx + 1,
        }))
    );
  };

  // handle image change (multiple upload)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setProductImages((prev) => {
        const startIndex = prev.length;
        const newItems: IProductImage[] = Array.from(files).map((file, i) => ({
          id: `new_${Date.now()}_${startIndex + i}`,
          display_order: startIndex + i + 1,
          image_url: URL.createObjectURL(file),
          file,
        }));
        return [...prev, ...newItems];
      });
      e.target.value = "";
    }
  };

  // handle hapus gambar
  const handleRemoveImage = (targetId: string | number) => {
    setProductImages((prev) => {
      const filtered = prev.filter(
        (img) => (img.id ?? img.display_order) !== targetId
      );
      const reindexed = filtered.map((img, idx) => ({
        ...img,
        display_order: idx + 1,
      }));
      console.log(
        "🗑️ Image removed. New indices:",
        reindexed.map((img) => ({
          id: img.id,
          display_order: img.display_order,
        }))
      );
      return reindexed;
    });
  };

  // handle urutkan gambar (drag and drop)
  const handleFileSorting = (event: DragEndEvent) => {
    const { operation, canceled } = event;
    if (canceled) return;
    const { source, target } = operation;
    if (source && target && source.id !== target.id) {
      setProductImages((items) => {
        const oldIndex = items.findIndex(
          (item) => (item.id ?? item.display_order) === source.id
        );
        const newIndex = items.findIndex(
          (item) => (item.id ?? item.display_order) === target.id
        );
        if (oldIndex !== -1 && newIndex !== -1) {
          const updated = [...items];
          const [moved] = updated.splice(oldIndex, 1);
          updated.splice(newIndex, 0, moved);

          const reordered = updated.map((item, idx) => ({
            ...item,
            display_order: idx + 1,
          }));

          console.log(
            `✅ File sorting validated: moved item from index ${oldIndex} to ${newIndex}`,
            reordered.map((img, i) => ({
              index: i,
              id: img.id,
              display_order: img.display_order,
            }))
          );

          return reordered;
        }

        return items;
      });
    }
  };


  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(schema),
    defaultValues: EMPTY_VALUES,
  });

  // Isi field saat mode update (data dari baris yang dipilih)
  useEffect(() => {
    try {
      if (!data) return;
      setValue("product_name", data.product_name || data.name || "");
      setValue("brand_id", data.brand_id || "");
      setValue("category_id", data.category_id || "");
      setValue("scope", data.scope || "");
      setValue("format", data.format || "");
      setValue(
        "ph_level",
        data.ph_level !== undefined && data.ph_level !== null ? Number(data.ph_level) : 5.5
      );
      setValue(
        "volume_amount",
        data.volume_amount !== undefined && data.volume_amount !== null
          ? Number(data.volume_amount)
          : 0
      );
      setValue("volume_unit", data.volume_unit || "ml");
      setValue(
        "is_fragrance_free",
        data.is_fragnance_free ?? data.is_fragrance_free ?? false
      );
      setValue("is_alcohol_free", data.is_alcohol_free ?? false);
      setValue("stock_status", data.stock_status ?? true);
      setValue("is_active", data.is_active ?? true);

      if (data.ingredients && Array.isArray(data.ingredients)) {
        setProductIngredients(
          data.ingredients.map((item: any, idx: number) => ({
            ingredient_id: String(item.ingredient_id || item.id || item),
            concentration_percentage: Number(item.concentration_percentage ?? 0),
            is_key_active: Boolean(item.is_key_active ?? false),
            order_in_formula: item.order_in_formula ?? (idx + 1),
          }))
        );
      } else {
        setProductIngredients([]);
      }

      if (data.images && Array.isArray(data.images)) {
        setProductImages(
          data.images.map((img: any, idx: number) => ({
            id: img.id ? String(img.id) : `existing_${idx + 1}`,
            product_id: img.product_id,
            image_url:
              typeof img === "string"
                ? img.startsWith("http")
                  ? img
                  : `${process.env.NEXT_PUBLIC_CLOUDINARY_URL}/${img}`
                : img.image_url?.startsWith("http")
                  ? img.image_url
                  : `${process.env.NEXT_PUBLIC_CLOUDINARY_URL}/${img.image_url || ""}`,
            display_order: img.display_order ?? idx + 1,
            file: img.file,
          }))
        );
      } else {
        setProductImages([]);
      }
    } catch (error) {
      console.error(error);
    }
  }, [data, setValue]);

  useEffect(() => {
    console.log(productImages);
  }, [productImages])

  // Bersihkan form setiap modal ditutup
  useEffect(() => {
    if (!isOpen) {
      reset(EMPTY_VALUES);
      setProductIngredients([]);
      setProductImages([]);
      setSelectedIngredientId("");
      setIngredientPercentage("");
      setIngredientError("");
    }
  }, [isOpen, reset]);

  const handleClose = () => {
    onOpenChange(false);
    reset(EMPTY_VALUES);
    setProductIngredients([]);
    setProductImages([]);
    setSelectedIngredientId("");
    setIngredientPercentage("");
    setIngredientError("");
  };

  // Dipanggil handleSubmit hanya jika validasi zod lolos
  const onSubmit = async (values: ProductFormValues) => {
    setIsLoading(true);
    try {
      const token = Cookies.get("token");
      const headers = {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      const body = new FormData();
      body.append("product_name", values.product_name);
      body.append("brand_id", values.brand_id);
      body.append("category_id", values.category_id);
      body.append("scope", values.scope);
      body.append("format", values.format);
      body.append("ph_level", String(values.ph_level));
      body.append("volume_amount", String(values.volume_amount));
      body.append("volume_unit", values.volume_unit);
      body.append("is_fragrance_free", String(values.is_fragrance_free));
      body.append("is_alcohol_free", String(values.is_alcohol_free));
      body.append("stock_status", String(values.stock_status));
      body.append("is_active", String(values.is_active));

      // Append ingredients
      body.append("ingredients", JSON.stringify(productIngredients));

      // Append product images files
      productImages.forEach((img) => {
        if (img.file) {
          body.append("images", img.file);
        }
      });



      // Append metadata gambar & urutan
      const imagesMetadata = productImages.map((img) => ({
        id: img.id,
        display_order: img.display_order,
        image_url: img.image_url,
        is_new: !!img.file,
      }));
      body.append("images_metadata", JSON.stringify(imagesMetadata));

      if (mode === "insert") {
        await axios.post(url, body, { headers });
      } else {
        await axios.put(url, body, { headers });
      }

      handleClose();
      onSuccess?.();
    } catch (error) {
      console.error("Gagal menyimpan produk:", error);
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
              <Sparkles size={18} />
            </div>
            <div>
              <Modal.Heading>
                <span className="text-xs font-bold uppercase tracking-widest text-skin-blue">
                  {mode === "insert" ? "Add product" : "Edit product"}
                </span>
              </Modal.Heading>
            </div>
          </Modal.Header>

          <Modal.Body>
            <form id="product-form" className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
              {/* Product Name */}
              <TextField isInvalid={!!errors.product_name}>
                <Label>Product Name</Label>
                <Controller
                  name="product_name"
                  control={control}
                  render={({ field }) => (
                    <Input {...field} className="rounded-xl" placeholder="e.g. Daily Mineral Sunscreen" />
                  )}
                />
                <FieldError>{errors.product_name?.message as string | undefined}</FieldError>
              </TextField>

              {/* Brand ID & Category ID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label className="text-sm font-medium">Brand</Label>
                  <Controller
                    name="brand_id"
                    control={control}
                    render={({ field }) => (
                      <Select
                        aria-label="Brand"
                        className="w-full"
                        placeholder="Pilih Brand"
                        value={field.value || null}
                        onChange={(val) => field.onChange(val ? String(val) : "")}
                      // isDisabled={isLoadingBrands}
                      >
                        <Select.Trigger className="rounded-xl border border-[#d9e4e9] bg-white px-3 flex items-center">
                          <Select.Value />
                          <Select.Indicator />
                        </Select.Trigger>
                        <Select.Popover>
                          <ListBox aria-label="Daftar Brand">
                            {brands.map((brand) => (
                              <ListBox.Item
                                key={brand.id}
                                id={brand.id!}
                                textValue={brand.name}
                              >
                                {brand.name}
                                <ListBox.ItemIndicator />
                              </ListBox.Item>
                            ))}
                          </ListBox>
                        </Select.Popover>
                      </Select>
                    )}
                  />
                  {errors.brand_id && (
                    <FieldError>{errors.brand_id?.message as string | undefined}</FieldError>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <Label className="text-sm font-medium">Category</Label>
                  <Controller
                    name="category_id"
                    control={control}
                    render={({ field }) => (
                      <Select
                        aria-label="Category"
                        className="w-full"
                        placeholder="Choose Category"
                        value={field.value || null}
                        onChange={(val) => field.onChange(val ? String(val) : "")}
                      >
                        <Select.Trigger className="rounded-xl border border-[#d9e4e9] bg-white px-3 flex items-center">
                          <Select.Value className="flex items-center gap-2" />
                          <Select.Indicator />
                        </Select.Trigger>
                        <Select.Popover>
                          <ListBox aria-label="Daftar Kategori">
                            {categories.map((category) => (
                              <ListBox.Item
                                key={category.id}
                                id={category.id!}
                                textValue={category.name}
                              >
                                <span className="inline-flex items-center gap-2">
                                  {category.icon && (
                                    <img
                                      src={category.icon.startsWith("http") ? category.icon : `${process.env.NEXT_PUBLIC_CLOUDINARY_URL}/${category.icon}`}
                                      alt={category.name}
                                      className="w-4 h-4 object-contain inline-block shrink-0"
                                    />
                                  )}
                                  <span>{category.name}</span>
                                </span>
                                <ListBox.ItemIndicator />
                              </ListBox.Item>
                            ))}
                          </ListBox>
                        </Select.Popover>
                      </Select>
                    )}
                  />
                  {errors.category_id && (
                    <FieldError>{errors.category_id?.message as string | undefined}</FieldError>
                  )}
                </div>
              </div>

              {/* Scope & Format */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <TextField isInvalid={!!errors.scope}>
                  <Label>Scope</Label>
                  <Controller
                    name="scope"
                    control={control}
                    render={({ field }) => (
                      <Input {...field} className="rounded-xl" placeholder="e.g. FACE / BODY" />
                    )}
                  />
                  <FieldError>{errors.scope?.message as string | undefined}</FieldError>
                </TextField>

                <TextField isInvalid={!!errors.format}>
                  <Label>Format</Label>
                  <Controller
                    name="format"
                    control={control}
                    render={({ field }) => (
                      <Input {...field} className="rounded-xl" placeholder="e.g. GEL / CREAM / SERUM" />
                    )}
                  />
                  <FieldError>{errors.format?.message as string | undefined}</FieldError>
                </TextField>
              </div>

              {/* pH Level, Volume Amount, Volume Unit */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <TextField isInvalid={!!errors.ph_level}>
                  <Label>pH Level</Label>
                  <Controller
                    name="ph_level"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        type="number"
                        step="0.1"
                        className="rounded-xl"
                        placeholder="5.5"
                        onChange={(e) => field.onChange(e.target.valueAsNumber || e.target.value)}
                      />
                    )}
                  />
                  <FieldError>{errors.ph_level?.message as string | undefined}</FieldError>
                </TextField>

                <TextField isInvalid={!!errors.volume_amount}>
                  <Label>Volume</Label>
                  <Controller
                    name="volume_amount"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        type="number"
                        step="any"
                        className="rounded-xl"
                        placeholder="30"
                        onChange={(e) => field.onChange(e.target.valueAsNumber || e.target.value)}
                      />
                    )}
                  />
                  <FieldError>{errors.volume_amount?.message as string | undefined}</FieldError>
                </TextField>

                <div className="flex flex-col gap-2">
                  <Label className="text-sm font-medium">Unit</Label>
                  <Controller
                    name="volume_unit"
                    control={control}
                    render={({ field }) => (
                      <Select
                        aria-label="Unit"
                        className="w-full"
                        placeholder="Choose Unit"
                        value={field.value || null}
                        onChange={(val) => field.onChange(val ? String(val) : "")}
                      >
                        <Select.Trigger className="rounded-xl border border-[#d9e4e9] bg-white px-3 flex items-center">
                          <Select.Value className="flex items-center gap-2" />
                          <Select.Indicator />
                        </Select.Trigger>
                        <Select.Popover>
                          <ListBox aria-label="Daftar Satuan Unit">
                            {VOLUME_UNITS.map((unit) => (
                              <ListBox.Item
                                key={unit.value}
                                id={unit.value}
                                textValue={unit.value}
                              >
                                {unit.label}
                                <ListBox.ItemIndicator />
                              </ListBox.Item>
                            ))}
                          </ListBox>
                        </Select.Popover>
                      </Select>
                    )}
                  />
                  {errors.volume_unit && (
                    <FieldError>{errors.volume_unit?.message as string | undefined}</FieldError>
                  )}
                </div>

              </div>

              {/* Toggle Pills: Booleans */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <Controller
                  control={control}
                  name="is_fragrance_free"
                  render={({ field }) => (
                    <TogglePill
                      icon={<ShieldCheck size={16} />}
                      label="Fragrance Free"
                      isSelected={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
                <Controller
                  control={control}
                  name="is_alcohol_free"
                  render={({ field }) => (
                    <TogglePill
                      icon={<ShieldCheck size={16} />}
                      label="Alcohol Free"
                      isSelected={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
                <Controller
                  control={control}
                  name="stock_status"
                  render={({ field }) => (
                    <TogglePill
                      icon={<Package size={16} />}
                      label="In Stock"
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

              {/* Ingredients */}
              <div className="flex flex-col gap-2">
                <Label className="text-sm font-medium">Ingredients</Label>

                {/* Input Controls: Select, Percentage, Plus Button */}
                <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                  <div className="flex-1 w-full">
                    <Select
                      aria-label="Pilih Ingredient"
                      className="w-full"
                      placeholder="Pilih Ingredient"
                      value={selectedIngredientId || null}
                      onChange={(val) => {
                        setSelectedIngredientId(val ? String(val) : "");
                        if (ingredientError) setIngredientError("");
                      }}
                    >
                      <Select.Trigger className="rounded-xl border border-[#d9e4e9] bg-white px-3 flex items-center">
                        <Select.Value />
                        <Select.Indicator />
                      </Select.Trigger>
                      <Select.Popover>
                        <ListBox aria-label="Daftar Ingredients">
                          {ingredients.map((item) => (
                            <ListBox.Item
                              key={item.id}
                              id={item.id!}
                              textValue={item.name}
                            >
                              {item.name}
                              <ListBox.ItemIndicator />
                            </ListBox.Item>
                          ))}
                        </ListBox>
                      </Select.Popover>
                    </Select>
                  </div>

                  <TextField className="w-full sm:w-28 shrink-0" aria-label="Persentase Ingredient">
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      placeholder="0.0 %"
                      value={ingredientPercentage}
                      onChange={(e) => {
                        setIngredientPercentage(e.target.value);
                        if (ingredientError) setIngredientError("");
                      }}
                      className="rounded-xl"
                    />
                  </TextField>

                  <Button
                    type="button"
                    aria-label="Tambah Ingredient"
                    onPress={handleAddProductIngredient}
                    className="h-10 px-4 rounded-xl bg-skin-blue text-white flex items-center justify-center shrink-0 hover:bg-skin-blue/90 transition active:scale-[0.97]"
                  >
                    <Plus size={18} />
                  </Button>
                </div>

                {ingredientError && (
                  <span className="text-xs text-red-500 font-medium">{ingredientError}</span>
                )}

                {/* List of Added Product Ingredients */}
                {productIngredients.length > 0 && (
                  <div className="flex flex-col gap-2 mt-2">
                    {productIngredients.map((item, index) => {
                      const ingDetail = ingredients.find(
                        (ing) => String(ing.id) === String(item.ingredient_id)
                      );
                      const name = ingDetail?.name || `Ingredient #${item.ingredient_id}`;

                      return (
                        <div
                          key={item.ingredient_id || index}
                          className="flex items-center justify-between p-3 rounded-2xl border border-[#d9e6ec] bg-white shadow-xs hover:border-skin-blue/40 transition"
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-skin-sky text-skin-blue text-xs font-semibold">
                              {index + 1}
                            </span>
                            <span className="text-sm font-semibold text-[#17324A]">{name}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <Chip
                              size="sm"
                              variant="secondary"
                              className="bg-skin-sky text-skin-blue font-medium text-xs px-2.5"
                            >
                              {item.concentration_percentage > 0
                                ? `${item.concentration_percentage}%`
                                : "0%"}
                            </Chip>
                            <button
                              type="button"
                              onClick={() => handleRemoveProductIngredient(item.ingredient_id)}
                              className="flex h-7 w-7 items-center justify-center rounded-xl text-gray-400 hover:bg-red-50 hover:text-red-600 transition cursor-pointer"
                              title="Hapus ingredient"
                            >
                              <X size={15} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Product Images */}
              <div className="flex flex-col gap-2">
                <Label className="text-sm font-medium">Product Images</Label>
                <DragDropProvider onDragEnd={handleFileSorting}>
                  <div className="flex flex-wrap gap-2 items-center">
                    {productImages &&
                      productImages.map((image, index) => (
                        <SortableItem
                          key={image.id ?? image.display_order}
                          data={image}
                          index={index}
                          onRemove={() => handleRemoveImage(image.id ?? image.display_order)}
                        />
                      ))}
                    <label
                      className="h-32 w-32 shrink-0 flex flex-col cursor-pointer items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed border-[#d9e6ec] bg-skin-sky/20 p-2 text-center text-xs text-skin-muted transition hover:border-skin-blue hover:bg-skin-sky/40"
                    >
                      <UploadCloud size={24} className="text-skin-blue" />
                      <span className="font-semibold text-[#17324A] text-xs">Upload Images</span>
                      <span className="text-[10px] text-gray-400">PNG, JPG (Multi)</span>
                      <input
                        name="image"
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleFileChange}
                      />
                    </label>
                  </div>
                </DragDropProvider>
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
              form="product-form"
              isDisabled={isLoading}
              className="rounded-xl bg-skin-blue text-white transition active:scale-[0.97]"
            >
              <Check size={16} /> {isLoading ? "Saving..." : "Save product"}
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

function SortableItem({
  data,
  index,
  onRemove,
}: {
  data: IProductImage;
  index: number;
  onRemove: () => void;
}) {
  const id = data.id ?? data.display_order;
  const { ref, isDragging } = useSortable({ id, index });

  return (
    <div
      ref={ref}
      className={`group relative h-32 w-32 shrink-0 rounded-2xl border border-[#d9e6ec] bg-white p-2 shadow-xs transition-all cursor-grab active:cursor-grabbing select-none ${isDragging
        ? "opacity-40 scale-105 z-20 shadow-md ring-2 ring-skin-blue"
        : "hover:border-skin-blue/50"
        }`}
    >

      {/* Tombol Hapus X */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="absolute right-2 top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-gray-500 shadow-sm transition hover:bg-red-50 hover:text-red-600 cursor-pointer"
        title="Hapus gambar"
      >
        <X size={14} />
      </button>

      {/* Preview Gambar */}
      <img
        src={data.image_url}
        alt={`preview ${data.display_order}`}
        draggable={false}
        className="h-full w-full object-contain pointer-events-none"
      />
      <span className="absolute left-2 bottom-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-xs font-semibold text-gray-700 shadow-sm">
        {data.display_order}
      </span>
    </div>
  );
}

// function test() {
//   const items = [1, 2, 3, 4];

//   return (
//     <ul className="list">
//       {items.map((id, index) =>
//         <sortable key={id} id={id} index={index} />
//       )}
//     </ul>
//   );
// }
