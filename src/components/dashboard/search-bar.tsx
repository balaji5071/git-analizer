import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function SearchBar({
  value,
  onChange,
  onSubmit,
  loading,
  inputReadOnly = false,
  submitLabel = "Run Analysis",
  label,
  hint,
}: {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  loading: boolean;
  inputReadOnly?: boolean;
  submitLabel?: string;
  label: string;
  hint: string;
}) {
  return (
    <form
      className="space-y-3"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <div className="space-y-1">
        <label className="text-sm font-medium text-[var(--foreground)]">{label}</label>
        <p className="text-sm text-[var(--muted)]">{hint}</p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Enter a GitHub username"
          className="sm:flex-1"
          readOnly={inputReadOnly}
          disabled={loading || inputReadOnly}
        />
        <Button
          type="submit"
          leftIcon={<Search className="h-4 w-4" />}
          disabled={loading}
        >
          {loading ? "Analyzing..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
