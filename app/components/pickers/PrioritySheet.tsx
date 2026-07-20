"use client";

import SheetShell from "./SheetShell";
import { Card, Flag, OptionRow, PRIORITY_META, divider } from "./ui";
import type { Priority } from "@/lib/types";

interface PrioritySheetProps {
  value: Priority;
  onSelect: (p: Priority) => void;
  onClose: () => void;
}

const LEVELS: Priority[] = [1, 2, 3, 4];

export default function PrioritySheet({ value, onSelect, onClose }: PrioritySheetProps) {
  return (
    <SheetShell title="Priority" onClose={onClose} zIndex={9}>
      <Card>
        {LEVELS.map((level, i) => (
          <div key={level}>
            {i > 0 && <div style={divider} />}
            <OptionRow
              icon={<Flag color={PRIORITY_META[level].color} />}
              label={PRIORITY_META[level].label}
              selected={value === level}
              onClick={() => {
                onSelect(level);
                onClose();
              }}
            />
          </div>
        ))}
      </Card>
    </SheetShell>
  );
}
