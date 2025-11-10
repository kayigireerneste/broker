"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import Button from "@/components/ui/Button";
import { InputField } from "@/components/ui/InputField";
import Card from "@/components/ui/Card";
import RichTextEditor from "@/components/ui/RichTextEditor";
import toast from "react-hot-toast";

export interface CompanySummary {
  id: string;
  name: string;
  ticker: string | null;
  description: string | null;
  sector: string | null;
  sharePrice: string | null;
  totalShares: number | null;
  availableShares: number | null;
  closingPrice: string | null;
  previousClosingPrice: string | null;
  priceChange: string | null;
  tradedVolume: string | null;
  tradedValue: string | null;
  snapshotDate: string | null;
  contract: string | null;
  createdAt: string;
  updatedAt: string;
}

interface CompanyCreateFormProps {
  authToken: string | null;
  onCreated?: (company: CompanySummary) => void;
}

interface FormState {
  name: string;
  ticker: string;
  description: string;
  sector: string;
  sharePrice: string;
  totalShares: string;
  availableShares: string;
  closingPrice: string;
  previousClosingPrice: string;
  priceChange: string;
  tradedVolume: string;
  tradedValue: string;
  snapshotDate: string;
  contract: string;
}

const INITIAL_STATE: FormState = {
  name: "",
  ticker: "",
  description: "",
  sector: "",
  sharePrice: "",
  totalShares: "",
  availableShares: "",
  closingPrice: "",
  previousClosingPrice: "",
  priceChange: "",
  tradedVolume: "",
  tradedValue: "",
  snapshotDate: "",
  contract: "",
};

export function CompanyCreateForm({ authToken, onCreated }: CompanyCreateFormProps) {
  const [formState, setFormState] = useState<FormState>(INITIAL_STATE);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (field: keyof FormState) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormState((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleInputChange = (field: keyof FormState) => (event: ChangeEvent<HTMLInputElement>) => {
    setFormState((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleContractChange = (value: string) => {
    setFormState((prev) => ({ ...prev, contract: value }));
  };

  const normalizeRichText = (value: string) => {
    if (!value) return undefined;
    const trimmed = value.trim();
    if (!trimmed) return undefined;

    const textContent = trimmed.replace(/<[^>]+>/g, "").replace(/&nbsp;/g, "").trim();
    if (!textContent) return undefined;

    return trimmed;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!authToken) {
      toast.error("Missing authentication token. Please sign in again.");
      return;
    }

    if (!formState.name.trim()) {
      toast.error("Company name is required");
      return;
    }

    if (!formState.ticker.trim()) {
      toast.error("Ticker is required");
      return;
    }

    setSubmitting(true);

    const toIsoDate = (value: string) => {
      if (!value) return undefined;
      const date = new Date(`${value}T00:00:00`);
      if (Number.isNaN(date.valueOf())) return undefined;
      return date.toISOString();
    };

    const payload = {
      name: formState.name.trim(),
      ticker: formState.ticker.trim().toUpperCase(),
      description: formState.description.trim() || null,
      sector: formState.sector.trim() || null,
      sharePrice: formState.sharePrice.trim() || undefined,
      totalShares: formState.totalShares ? Number(formState.totalShares) : undefined,
      availableShares: formState.availableShares ? Number(formState.availableShares) : undefined,
      closingPrice: formState.closingPrice.trim() || undefined,
      previousClosingPrice: formState.previousClosingPrice.trim() || undefined,
      priceChange: formState.priceChange.trim() || undefined,
      tradedVolume: formState.tradedVolume.trim() || undefined,
      tradedValue: formState.tradedValue.trim() || undefined,
      snapshotDate: toIsoDate(formState.snapshotDate) || undefined,
      contract: normalizeRichText(formState.contract),
    };

    try {
      const response = await fetch("/api/company", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.error ?? "Failed to create company");
      }

      toast.success("Company created successfully");
      setFormState(INITIAL_STATE);
      onCreated?.(result.data as CompanySummary);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create company";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="p-6 space-y-6">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid md:grid-cols-2 gap-4">
          <InputField
            label="Company Name"
            name="name"
            value={formState.name}
            onChange={handleInputChange("name")}
            required
            type="text"
          />
          <InputField
            label="Ticker"
            name="ticker"
            value={formState.ticker}
            onChange={handleInputChange("ticker")}
            required
            type="text"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <InputField
            label="Sector"
            name="sector"
            value={formState.sector}
            onChange={handleInputChange("sector")}
            placeholder="e.g. Technology"
            type="text"
          />
          <InputField
            label="Share Price"
            name="sharePrice"
            value={formState.sharePrice}
            onChange={handleInputChange("sharePrice")}
            placeholder="e.g. 125.50"
            type="number"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <InputField
            label="Total Shares"
            name="totalShares"
            value={formState.totalShares}
            onChange={handleInputChange("totalShares")}
            placeholder="e.g. 1000000"
            type="number"
          />
          <InputField
            label="Available Shares"
            name="availableShares"
            value={formState.availableShares}
            onChange={handleInputChange("availableShares")}
            placeholder="e.g. 250000"
            type="number"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <InputField
            label="Closing Price"
            name="closingPrice"
            value={formState.closingPrice}
            onChange={handleInputChange("closingPrice")}
            placeholder="e.g. 130.75"
            type="number"
          />
          <InputField
            label="Previous Close"
            name="previousClosingPrice"
            value={formState.previousClosingPrice}
            onChange={handleInputChange("previousClosingPrice")}
            placeholder="e.g. 129.90"
            type="number"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <InputField
            label="Price Change"
            name="priceChange"
            value={formState.priceChange}
            onChange={handleInputChange("priceChange")}
            placeholder="e.g. +0.65%"
            type="text"
          />
          <InputField
            label="Traded Volume"
            name="tradedVolume"
            value={formState.tradedVolume}
            onChange={handleInputChange("tradedVolume")}
            placeholder="e.g. 42000"
            type="number"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <InputField
            label="Traded Value"
            name="tradedValue"
            value={formState.tradedValue}
            onChange={handleInputChange("tradedValue")}
            placeholder="e.g. 25000000"
            type="number"
          />
          <InputField
            label="Snapshot Date"
            name="snapshotDate"
            value={formState.snapshotDate}
            onChange={handleInputChange("snapshotDate")}
            type="date"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2" htmlFor="company-description">
            Description
          </label>
          <textarea
            id="company-description"
            name="description"
            className="w-full rounded-lg border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#004B5B]"
            rows={4}
            value={formState.description}
            onChange={handleChange("description")}
            placeholder="Optional overview or disclosure."
          />
        </div>

        <RichTextEditor
          label="Contract"
          value={formState.contract}
          onChange={handleContractChange}
          placeholder="Provide contract details, clauses, or include links."
        />

        <div className="flex items-center justify-end gap-3">
          <Button variant="outline" type="button" onClick={() => setFormState(INITIAL_STATE)} disabled={submitting}>
            Reset
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Creating..." : "Create company"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
