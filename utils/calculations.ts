import { ProductItem } from "../types";

// Convert to Arabic-Indic digits
export const toArabicDigits = (num: number): string => {
  const arabicDigits = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  return num
    .toString()
    .replace(/[0-9]/g, (digit) => arabicDigits[parseInt(digit)]);
};

export const formatStockDisplay = (product: ProductItem): string => {
  const bundles = Math.abs(product.bundles || 0);
  const remainingBoards = Math.abs(product.remainingBoards || 0);

  if (bundles > 0 && remainingBoards > 0) {
    return `${toArabicDigits(bundles)} ${bundles === 1 ? "ربطة" : "ربط"} و ${toArabicDigits(remainingBoards)} لوح`;
  } else if (bundles > 0) {
    return `${toArabicDigits(bundles)} ${bundles === 1 ? "ربطة" : "ربط"}`;
  } else if (remainingBoards > 0) {
    return `${toArabicDigits(remainingBoards)} لوح`;
  } else {
    return "صفر";
  }
};

export const formatCurrency = (amount: number): string => {
  if (amount === 0) {
    return "0";
  }
  return new Intl.NumberFormat("ar-EG", {
    style: "currency",
    currency: "EGP",
  }).format(amount);
};

export const getTotalBoards = (product: ProductItem): number => {
  return Math.abs(
    product.bundles * product.boardsPerBundle + product.remainingBoards,
  );
};

export const calculateVolume = (product: ProductItem): number => {
  console.log("calculateVolume input:", product);

  // Check if required properties exist
  if (!product || typeof product !== "object") {
    console.log("Invalid product object");
    return 0;
  }

  const totalBoards = getTotalBoards(product);
  console.log("Total boards:", totalBoards);

  const thicknessM = (product.thickness || 0) / 1000;
  const widthM = (product.width || 0) / 100;
  const lengthM = (product.length || 0) / 100;

  console.log("Dimensions:", { thicknessM, widthM, lengthM });

  const volume = thicknessM * widthM * lengthM * totalBoards;
  console.log("Final volume:", volume);

  return volume;
};

export const hasEnoughStock = (
  product: ProductItem,
  qty: number,
  unit: "bundle" | "board",
): boolean => {
  const totalAvailableBoards = getTotalBoards(product);
  const neededBoards = unit === "bundle" ? qty * product.boardsPerBundle : qty;
  return totalAvailableBoards >= neededBoards;
};
