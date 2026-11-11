// Storefront Fallback Catalog with Rich Liquid Glass Specifications
// Backwards compatible with existing imports from fallback-catalog.ts

export type { LiquidGlassSpecs, CatalogProduct } from "./products";
import { PRODUCTS, CatalogProduct } from "./products";

export const FALLBACK_PRODUCTS: CatalogProduct[] = PRODUCTS;
