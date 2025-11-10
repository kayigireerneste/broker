"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { InputField } from "@/components/ui/InputField";
import toast from "react-hot-toast";
import type { CompanySummary } from "./CompanyCreateForm";

interface CompanyManageFormProps {
  company: CompanySummary;
  authToken: string | null;
  onUpdated?: (company: CompanySummary) => void;
}

interface FormState {
  sharePrice: string;
  totalShares: string;
  availableShares: string;
  description: string;
  sector: string;
  closingPrice: string;
  previousClosingPrice: string;
  priceChange: string;
  tradedVolume: string;
  tradedValue: string;
  snapshotDate: string;
  contract: string;
}

export function CompanyManageForm({ company, authToken, onUpdated }: CompanyManageFormProps) {
  const formatDateInput = (value: string | null) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.valueOf())) return "";
    return date.toISOString().slice(0, 10);
  };

  const toIsoDate = (value: string) => {
    if (!value) return undefined;
    const date = new Date(`${value}T00:00:00`);
    if (Number.isNaN(date.valueOf())) return undefined;
    return date.toISOString();
  };

  const [formState, setFormState] = useState<FormState>({
    sharePrice: company.sharePrice ?? "",
    totalShares: company.totalShares?.toString() ?? "",
    availableShares: company.availableShares?.toString() ?? "",
    description: company.description ?? "",
    sector: company.sector ?? "",
    closingPrice: company.closingPrice ?? "",
    previousClosingPrice: company.previousClosingPrice ?? "",
    priceChange: company.priceChange ?? "",
    tradedVolume: company.tradedVolume ?? "",
    tradedValue: company.tradedValue ?? "",
    snapshotDate: formatDateInput(company.snapshotDate),
    contract: company.contract ?? "",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (field: keyof FormState) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormState((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleInputChange = (field: keyof FormState) => (event: ChangeEvent<HTMLInputElement>) => {
    setFormState((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!authToken) {
      toast.error("Missing authentication token. Please sign in again.");
      return;
    }

    setSubmitting(true);

    const payload = {
      sharePrice: formState.sharePrice.trim() || undefined,
      totalShares: formState.totalShares ? Number(formState.totalShares) : undefined,
      availableShares: formState.availableShares ? Number(formState.availableShares) : undefined,
      description: formState.description.trim(),
      sector: formState.sector.trim(),
      closingPrice: formState.closingPrice.trim() || undefined,
      previousClosingPrice: formState.previousClosingPrice.trim() || undefined,
      priceChange: formState.priceChange.trim() || undefined,
      tradedVolume: formState.tradedVolume.trim() || undefined,
      tradedValue: formState.tradedValue.trim() || undefined,
      snapshotDate: toIsoDate(formState.snapshotDate) || undefined,
      contract: formState.contract.trim() || undefined,
    };

    try {
      const response = await fetch(`/api/company/${company.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.error ?? "Failed to update company");
      }

      toast.success("Company details updated");
      onUpdated?.(result.data as CompanySummary);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update company";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="p-6">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid md:grid-cols-2 gap-4">
          <InputField
            label="Share Price"
            name="sharePrice"
            value={formState.sharePrice}
            onChange={handleInputChange("sharePrice")}
            placeholder="e.g. 125.50"
            type="number"
          />
          <InputField
            label="Total Shares"
            name="totalShares"
            value={formState.totalShares}
            onChange={handleInputChange("totalShares")}
            type="number"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <InputField
            label="Available Shares"
            name="availableShares"
            value={formState.availableShares}
            onChange={handleInputChange("availableShares")}
            type="number"
          />
          <InputField
            label="Sector"
            name="sector"
            value={formState.sector}
            onChange={handleInputChange("sector")}
            type="text"
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
          <label className="block text-sm font-medium text-gray-600 mb-2" htmlFor="company-manage-description">
            Disclosure / Description
          </label>
          <textarea
            id="company-manage-description"
            name="description"
            className="w-full rounded-lg border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#004B5B]"
            rows={4}
            value={formState.description}
            onChange={handleChange("description")}
          />
        </div>

        <InputField
          label="Contract Reference"
          name="contract"
          value={formState.contract}
          onChange={handleInputChange("contract")}
          placeholder="e.g. https://example.com/contracts/acme.pdf"
          type="text"
        />

        <div className="flex items-center justify-end gap-3">
          <Button
            variant="outline"
            type="button"
            disabled={submitting}
            onClick={() =>
              setFormState({
                sharePrice: company.sharePrice ?? "",
                totalShares: company.totalShares?.toString() ?? "",
                availableShares: company.availableShares?.toString() ?? "",
                description: company.description ?? "",
                sector: company.sector ?? "",
                closingPrice: company.closingPrice ?? "",
                previousClosingPrice: company.previousClosingPrice ?? "",
                priceChange: company.priceChange ?? "",
                tradedVolume: company.tradedVolume ?? "",
                tradedValue: company.tradedValue ?? "",
                snapshotDate: formatDateInput(company.snapshotDate),
                contract: company.contract ?? "",
              })
            }
          >
            Reset
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Saving..." : "Save changes"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
