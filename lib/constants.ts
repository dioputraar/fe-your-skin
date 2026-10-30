/**
 * Global Constants & Enums for YourSkin Application
 * Note: File ini menyimpan enum dan konstanta runtime (value & label)
 * yang dapat di-import di berbagai komponen atau halaman.
 */

// ==========================================
// 1. Product Scope
// ==========================================
export enum ProductScope {
  FACE = "FACE",
  BODY = "BODY",
  HAIR = "HAIR",
  LIPS = "LIPS",
  EYES = "EYES",
}

export const PRODUCT_SCOPE = [
  { value: ProductScope.FACE, label: "Face" },
  { value: ProductScope.BODY, label: "Body" },
  { value: ProductScope.HAIR, label: "Hair" },
  { value: ProductScope.LIPS, label: "Lips" },
  { value: ProductScope.EYES, label: "Eyes" },
] as const;

// ==========================================
// 2. Application Format
// ==========================================
export enum ApplicationFormat {
  GEL = "GEL",
  CREAM = "CREAM",
  SERUM = "SERUM",
  LOTION = "LOTION",
  FOAM = "FOAM",
  LIQUID = "LIQUID",
  SPRAY = "SPRAY",
  STICK = "STICK",
  OIL = "OIL",
  BALM = "BALM",
}

export const APPLICATION_FORMAT = [
  { value: ApplicationFormat.GEL, label: "Gel" },
  { value: ApplicationFormat.CREAM, label: "Cream" },
  { value: ApplicationFormat.SERUM, label: "Serum" },
  { value: ApplicationFormat.LOTION, label: "Lotion" },
  { value: ApplicationFormat.FOAM, label: "Foam" },
  { value: ApplicationFormat.LIQUID, label: "Liquid" },
  { value: ApplicationFormat.SPRAY, label: "Spray" },
  { value: ApplicationFormat.STICK, label: "Stick" },
  { value: ApplicationFormat.OIL, label: "Oil" },
  { value: ApplicationFormat.BALM, label: "Balm" },
] as const;

// ==========================================
// 3. Product Image Type
// ==========================================
export enum ProductImageType {
  PACKAGING = "PACKAGING",
  TEXTURE = "TEXTURE",
  SWATCH = "SWATCH",
  RESULT = "RESULT",
}

export const PRODUCT_IMAGE_TYPE = [
  { value: ProductImageType.PACKAGING, label: "Packaging" },
  { value: ProductImageType.TEXTURE, label: "Texture" },
  { value: ProductImageType.SWATCH, label: "Swatch" },
  { value: ProductImageType.RESULT, label: "Result" },
] as const;

// ==========================================
// 4. Gender
// ==========================================
export enum Gender {
  MALE = "MALE",
  FEMALE = "FEMALE",
}

export const GENDER = [
  { value: Gender.MALE, label: "Male" },
  { value: Gender.FEMALE, label: "Female" },
] as const;

// Opsi Volume Unit
export const VOLUME_UNITS = [
  { value: "ml", label: "ml (Mililiter)" },
  { value: "mg", label: "mg (Miligram)" },
  { value: "g", label: "g (Gram)" },
] as const;

// Target Concerns Kulit
export const TARGET_CONCERNS = [
  "Acne / Jerawat",
  "Hyperpigmentation / Noda Hitam",
  "Anti-Aging / Garis Halus",
  "Dryness / Dehidrasi",
  "Oiliness / Pori-pori Besar",
  "Redness / Iritasi",
  "Barrier Repair / Kulit Sensitif",
] as const;

