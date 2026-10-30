// Figma Code Connect Template for ProductCard
// Maps to Figma Component: "Components/Storefront/ProductCard"

import React from "react";
import { ProductCard } from "./ProductCard";

/**
 * Figma Code Connect definition for ProductCard.
 * In production with @figma/code-connect CLI, this enables 1-click inspection
 * and design-to-code synchronisation directly inside Figma Dev Mode.
 */
export default {
  component: ProductCard,
  figmaNodeUrl: "https://www.figma.com/design/ecommerce-platform?node-id=101:240",
  props: {
    skuCode: "IPHONE-16-PRO-256",
    name: "Apple iPhone 16 Pro 256GB Desert Titanium",
    price: 4899,
    description: "שבב A18 Pro עוצמתי בטכנולוגיית 3 ננומטר, מסך Super Retina XDR 120Hz, כפתור Camera Control וגימור טיטניום יוקרתי.",
    image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80",
    category: "סמארטפונים",
    stock: {
      availableQuantity: 50,
      reservedQuantity: 0,
    },
    onAddToCart: () => {},
  },
};
