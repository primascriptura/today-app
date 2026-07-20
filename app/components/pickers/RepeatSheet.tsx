"use client";

import SheetShell from "./SheetShell";
import { Card, OptionRow, divider } from "./ui";
import type { RepeatRule } from "@/lib/types";

interface RepeatSheetProps {
  value: RepeatRule;
  onSelect: (r: RepeatRule) => void;
  /** Return to the Date sheet this was opened from. */
  onBack: () => void;
}

const OPTIONS: { rule: RepeatRule; label: string }[] = [
  { rule: "none", label: "None" },
  { rule: "daily", label: "Daily" },
  { rule: "weekly", label: "Weekly" },
  { rule: "monthly", label: "Monthly" },
  { rule: "yearly", label: "Yearly" },
];

export default function RepeatSheet({ value, onSelect, onBack }: RepeatSheetProps) {
  return (
    <SheetShell title="Repeat" onClose={onBack} onBack={onBack} zIndex={10}>
      <Card>
        {OPTIONS.map((opt, i) => (
          <div key={opt.rule}>
            {i > 0 && <div style={divider} />}
            <OptionRow
              label={opt.label}
              selected={value === opt.rule}
              onClick={() => {
                onSelect(opt.rule);
                onBack();
              }}
            />
          </div>
        ))}
      </Card>
    </SheetShell>
  );
}
