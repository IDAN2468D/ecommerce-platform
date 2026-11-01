"use client";

import React, { createContext, useContext, useEffect, useState, useMemo } from "react";

export type Currency = "ILS" | "USD";

interface CurrencyContextType {
  currency: Currency;
  rate: number; // 1 USD = rate ILS (e.g. 3.14456)
  toggleCurrency: () => void;
  setCurrency: (c: Currency) => void;
  formatPrice: (amountInILS: number | undefined | null) => string;
  convertPrice: (amountInILS: number | undefined | null) => number;
  symbol: string;
}

const CurrencyContext = createContext<CurrencyContextType | null>(null);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrencyState] = useState<Currency>("ILS");
  const [rate, setRate] = useState<number>(3.14456);

  // Sync initial currency from localStorage & fetch live rate
  useEffect(() => {
    try {
      const stored = localStorage.getItem("user_currency") as Currency;
      if (stored === "USD" || stored === "ILS") {
        setCurrencyState(stored);
      }
    } catch {}

    // Fetch live rate from /api/currency/rates (RapidAPI Currency MCP)
    const fetchRate = async () => {
      try {
        const res = await fetch("/api/currency/rates");
        if (res.ok) {
          const data = await res.json();
          if (data.rateUSDToILS && typeof data.rateUSDToILS === "number") {
            setRate(data.rateUSDToILS);
          }
        }
      } catch (err) {
        console.warn("Failed to fetch live FX rate, using fallback 3.14456", err);
      }
    };
    fetchRate();

    const handleCurrencyChanged = (e: any) => {
      const newCurr = e.detail || (localStorage.getItem("user_currency") as Currency);
      if (newCurr === "USD" || newCurr === "ILS") {
        setCurrencyState(newCurr);
      }
    };

    window.addEventListener("currency-changed", handleCurrencyChanged);
    window.addEventListener("storage", handleCurrencyChanged);

    return () => {
      window.removeEventListener("currency-changed", handleCurrencyChanged);
      window.removeEventListener("storage", handleCurrencyChanged);
    };
  }, []);

  const setCurrency = (c: Currency) => {
    setCurrencyState(c);
    try {
      localStorage.setItem("user_currency", c);
    } catch {}
    window.dispatchEvent(new CustomEvent("currency-changed", { detail: c }));
  };

  const toggleCurrency = () => {
    const next: Currency = currency === "ILS" ? "USD" : "ILS";
    setCurrency(next);
  };

  const formatPrice = (amountInILS: number | undefined | null): string => {
    if (amountInILS === undefined || amountInILS === null || isNaN(Number(amountInILS))) {
      return currency === "ILS" ? "₪0" : "$0.00";
    }
    const val = Number(amountInILS);
    if (currency === "ILS") {
      return `₪${val.toLocaleString("he-IL", { maximumFractionDigits: 2 })}`;
    } else {
      const usd = val / rate;
      return `$${usd.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
  };

  const convertPrice = (amountInILS: number | undefined | null): number => {
    if (amountInILS === undefined || amountInILS === null || isNaN(Number(amountInILS))) {
      return 0;
    }
    const val = Number(amountInILS);
    if (currency === "ILS") {
      return val;
    }
    return Number((val / rate).toFixed(2));
  };

  const symbol = currency === "ILS" ? "₪" : "$";

  const value = useMemo(
    () => ({
      currency,
      rate,
      toggleCurrency,
      setCurrency,
      formatPrice,
      convertPrice,
      symbol,
    }),
    [currency, rate]
  );

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
};

export const useCurrency = (): CurrencyContextType => {
  const context = useContext(CurrencyContext);
  if (!context) {
    return {
      currency: "ILS",
      rate: 3.14456,
      toggleCurrency: () => {},
      setCurrency: () => {},
      formatPrice: (amount) => `₪${Number(amount || 0).toLocaleString("he-IL")}`,
      convertPrice: (amount) => Number(amount || 0),
      symbol: "₪",
    };
  }
  return context;
};
