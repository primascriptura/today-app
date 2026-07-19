"use client";

import ComposeSheet from "./ComposeSheet";
import ConfirmationToast from "./ConfirmationToast";
import ErrorView from "./ErrorView";
import ListeningView from "./ListeningView";
import ProcessingView from "./ProcessingView";
import TodayView from "./TodayView";
import { usePlanner } from "@/lib/usePlanner";

// Accent themes from the source design. Indigo is the default; the others are
// kept here so a settings screen can switch them later.
const ACCENTS = {
  Indigo: {
    "--app-accent": "#3b4b8c",
    "--app-accent-strong": "#2c3866",
    "--app-grad":
      "radial-gradient(125% 92% at 50% 60%, #b7bfe4 0%, #dbdff1 44%, #f4f5fb 100%)",
  },
} as const;

export default function Planner() {
  const { state, actions } = usePlanner();
  const { screen } = state;

  const showTasksView = screen === "tasks" || screen === "confirmation";
  const showVoiceBg =
    screen === "listening" || screen === "processing" || screen === "error";

  return (
    <div style={{ minHeight: "100dvh", display: "grid", placeItems: "center" }}>
      <main
        aria-label="Today"
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 460,
          height: "100dvh",
          maxHeight: 940,
          overflow: "hidden",
          background: "#f9f4ed",
          fontFamily: "var(--font-body), system-ui, sans-serif",
          color: "var(--color-text)",
          ...(ACCENTS.Indigo as React.CSSProperties),
        }}
      >
        {showTasksView && (
          <TodayView
            screen={screen}
            tasks={state.tasks}
            sel={state.sel}
            collapsed={state.collapsed}
            swipe={state.swipe}
            leaving={state.leaving}
            composing={state.composing}
            actions={actions}
          />
        )}

        {screen === "tasks" && state.composing && (
          <ComposeSheet
            draft={state.draft}
            chipDate={state.chipDate}
            chipPriority={state.chipPriority}
            sel={state.sel}
            actions={actions}
          />
        )}

        {showVoiceBg && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "var(--app-grad)",
              animation: "layerIn .5s ease",
            }}
          />
        )}

        {screen === "listening" && (
          <ListeningView paused={state.paused} actions={actions} />
        )}
        {screen === "processing" && <ProcessingView />}
        {screen === "error" && <ErrorView actions={actions} />}
        {screen === "confirmation" && (
          <ConfirmationToast
            actions={actions}
            count={state.lastAdded}
            task={state.tasks[0] ?? null}
          />
        )}
      </main>
    </div>
  );
}
