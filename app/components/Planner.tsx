"use client";

import BottomNav from "./BottomNav";
import ComposeSheet from "./ComposeSheet";
import ConfirmationToast from "./ConfirmationToast";
import ErrorView from "./ErrorView";
import FirstTaskCelebration from "./FirstTaskCelebration";
import InboxView from "./InboxView";
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
  const { state, hydrated, actions, days, today, todayIndex, todayWeekday, mic } = usePlanner();
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
        {/* Gate on `hydrated`: state.tasks starts as the in-memory seed and
            gets swapped for real localStorage data in an effect that fires
            after the first paint. Rendering before that swap would flash the
            seed (e.g. today's tasks looking fresh) right before it's replaced
            by the real, possibly-already-completed data. */}
        {showTasksView && state.view === "today" && hydrated && (
          <TodayView
            tasks={state.tasks}
            sel={state.sel}
            days={days}
            todayIndex={todayIndex}
            collapsed={state.collapsed}
            swipe={state.swipe}
            leaving={state.leaving}
            actions={actions}
          />
        )}

        {showTasksView && state.view === "inbox" && hydrated && (
          <InboxView
            tasks={state.tasks}
            days={days}
            collapsed={state.collapsed}
            swipe={state.swipe}
            leaving={state.leaving}
            actions={actions}
          />
        )}

        {/* Bottom nav: task destinations + the primary add action. Hidden
            during the voice/processing/error screens. */}
        {showTasksView && !state.composing && (
          <BottomNav view={state.view} onSelect={actions.setView} onAdd={actions.openCompose} />
        )}

        {/* Compose sheet: manual add (over the task list) or edit-in-place —
            including editing a live card mid-dictation (over the Listening
            view), which is why it also renders on the "listening" screen. */}
        {state.composing && (screen === "tasks" || screen === "listening") && (
          <ComposeSheet
            draft={state.draft}
            draftSegments={state.draftSegments}
            draftNotes={state.draftNotes}
            draftDate={state.draftDate}
            draftTime={state.draftTime}
            draftRepeat={state.draftRepeat}
            draftDeadline={state.draftDeadline}
            draftPriority={state.draftPriority}
            draftReminders={state.draftReminders}
            activePicker={state.activePicker}
            editing={state.editingTaskId != null}
            days={days}
            today={today}
            todayIndex={todayIndex}
            todayWeekday={todayWeekday}
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
          <ListeningView
            paused={state.paused}
            liveTasks={state.tasks.filter((t) => state.liveIds.includes(t.id))}
            days={days}
            levelRef={mic.levelRef}
            bandsRef={mic.bandsRef}
            actions={actions}
          />
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

        {state.celebrate && <FirstTaskCelebration actions={actions} />}
      </main>
    </div>
  );
}
