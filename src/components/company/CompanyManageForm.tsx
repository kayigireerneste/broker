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
  withCard?: boolean;
}

interface FormState {
  sharePrice: string;
  totalShares: string;
  availableShares: string;
  description: string;
  sector: string;
  sectorOther: string;
}

const sanitizeIntegerInput = (value: string) =>
  value
    .replace(/[\s,]/g, "")
    .replace(/[^0-9]/g, "")
    .trim();

const toIntegerOrUndefined = (value: string) => {
  const normalized = sanitizeIntegerInput(value);
  if (!normalized) return undefined;
  const parsed = Number(normalized);
  return Number.isNaN(parsed) ? undefined : parsed;
};

export function CompanyManageForm({ company, authToken, onUpdated, withCard = true }: CompanyManageFormProps) {
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
    sectorOther: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (field: keyof FormState) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormState((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleInputChange = (field: keyof FormState) => (event: ChangeEvent<HTMLInputElement>) => {
    setFormState((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSelectChange = (field: keyof FormState) => (event: ChangeEvent<HTMLSelectElement>) => {
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
      totalShares: toIntegerOrUndefined(formState.totalShares),
      availableShares: toIntegerOrUndefined(formState.availableShares),
      description: formState.description.trim(),
      sector: formState.sector === "Other" && formState.sectorOther.trim()
        ? formState.sectorOther.trim()
        : formState.sector.trim(),
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
        const detailedError = Array.isArray(result?.errors)
          ? (result.errors as Array<{ path?: string; message?: string }>)
              .map((issue) => {
                const path = issue.path ? `${issue.path}: ` : "";
                return `${path}${issue.message ?? "Invalid value"}`;
              })
              .join("\n")
          : null;
        throw new Error(detailedError || result?.error || "Failed to update company");
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

  const formContent = (
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
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-600">Sector</label>
            <select
              name="sector"
              value={formState.sector}
              onChange={handleSelectChange("sector")}
              disabled={submitting}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#004B5B] disabled:opacity-50"
            >
              <option value="">Select sector</option>
              <option value="Technology">Technology</option>
              <option value="Finance">Finance</option>
              <option value="Healthcare">Healthcare</option>
              <option value="Energy">Energy</option>
              <option value="Manufacturing">Manufacturing</option>
              <option value="Telecommunications">Telecommunications</option>
              <option value="Real Estate">Real Estate</option>
              <option value="Consumer Goods">Consumer Goods</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        {formState.sector === "Other" && (
          <div className="grid md:grid-cols-2 gap-4">
            <InputField
              label="Specify Sector"
              name="sectorOther"
              value={formState.sectorOther}
              onChange={handleInputChange("sectorOther")}
              placeholder="Enter sector name"
              type="text"
            />
          </div>
        )}

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
                sectorOther: "",
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
  );

  if (withCard) {
    return <Card className="p-6">{formContent}</Card>;
  }

  return <div className="space-y-4">{formContent}</div>;
}
