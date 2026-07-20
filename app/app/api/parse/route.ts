import Anthropic from "@anthropic-ai/sdk";
import { STRIP_LENGTH, TODAY_OFFSET } from "@/lib/dates";
import { TASK_SCHEMA, type ParseResponse } from "@/lib/parse";

const client = new Anthropic(); // reads ANTHROPIC_API_KEY from the environment

interface StripDay {
  index: number;
  weekday: string;
  iso?: string;
}

const SYSTEM_PROMPT = `You turn a spoken Ukrainian to-do dictation into structured tasks.

The user dictates in Ukrainian; the transcript may contain ONE or SEVERAL tasks.
Extract every distinct task. For each task, return:
- title: a short, clean action in the user's language. Strip filler like
  "нагадай мені", "мені треба", "не забути".
- day: an integer index into the "This week" array you are given below (its
  valid range is 0 to the last index in that array). Resolve relative words
  against that array and today's index: "сьогодні" = today's index; "завтра" =
  today's index + 1; a named weekday ("у п'ятницю") = the NEAREST index that is
  >= today's index and whose weekday matches (the array spans several weeks, so
  the same weekday appears more than once — always pick the closest upcoming
  one). If no day is mentioned, use today's index.
- slot: "morning" (until ~11:59), "afternoon" (12:00–16:59), "evening"
  (17:00+), or "anytime" if no time is mentioned.
- meta: a short human label for the time/day if one was mentioned
  (e.g. "6:00 PM", "Friday"), otherwise null.
- priority: true ONLY when the words signal urgency ("терміново", "asap",
  "негайно", "до п'ятниці", "перш за все"). Judge by the words alone.
- notes: any extra execution detail mentioned, otherwise null.
- time: if a clock time is mentioned ("о 10", "о пів на третю", "на 14:00"),
  return { "start": "HH:MM" 24h, "durationMin": <integer minutes or null> }.
  Set durationMin only when a length is stated ("на годину" = 60, "пів години"
  = 30, "на дві години" = 120). If no time is mentioned, return null.
- repeat: "daily" ("щодня"), "weekly" ("щотижня"), "monthly" ("щомісяця"),
  "yearly" ("щороку"); otherwise "none".
- deadline: ONLY when a hard due date is clearly stated as a deadline
  ("дедлайн", "до <дата>", "крайній термін"). Return
  { "iso": "YYYY-MM-DD", "time": "HH:MM" 24h or null }, resolving the date
  against the "This week" array's iso values. If no deadline is stated, null.
- icon: the ONE category glyph that best fits the task's meaning. Choose from:
  "brief" (work / job / professional), "mail" (email / message / letter),
  "users" (meeting or appointment with people), "card" (payment / bill / money /
  banking), "home" (household chores / errands / cleaning), "phone" (a phone
  call), "cart" (shopping / buying / groceries), "heart" (health / doctor /
  self-care), "activity" (exercise / sport / workout / run), "book" (reading /
  studying / learning), "plane" (travel / trip / flight), "food" (cooking /
  meals / eating out), "doc" (documents / paperwork / reports / forms), "pen"
  (writing / notes / creative work), "gift" (gifts / birthdays / celebrations),
  "calendar" (a scheduled event when none of the above fit). Use "dot" ONLY when
  nothing else reasonably matches. Pick by the task's meaning, not by time of day.

If the transcript contains nothing task-like, return an empty tasks array.
Return ONLY the structured object.`;

export async function POST(req: Request) {
  let transcript = "";
  let todayIndex = TODAY_OFFSET;
  let week: StripDay[] | null = null;
  try {
    const body = await req.json();
    transcript = typeof body?.transcript === "string" ? body.transcript.trim() : "";
    // The client sends its own strip so relative days resolve against exactly
    // what the user sees, regardless of the server's clock/timezone.
    if (
      typeof body?.todayIndex === "number" &&
      body.todayIndex >= 0 &&
      body.todayIndex < STRIP_LENGTH
    ) {
      todayIndex = body.todayIndex;
    }
    if (Array.isArray(body?.days)) {
      week = (body.days as StripDay[])
        .filter((d) => typeof d?.index === "number" && typeof d?.weekday === "string")
        .map((d) => ({ index: d.index, weekday: d.weekday, iso: d.iso }));
    }
  } catch {
    return Response.json({ error: "empty" }, { status: 400 });
  }
  if (!transcript) {
    return Response.json({ error: "empty" }, { status: 400 });
  }

  const todayWeekday = week?.find((d) => d.index === todayIndex)?.weekday ?? "today";
  const userContent = [
    `Today is index ${todayIndex} (${todayWeekday}).`,
    week ? `This week: ${JSON.stringify(week)}.` : "",
    `Transcript: "${transcript}"`,
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const msg = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userContent }],
      output_config: { format: { type: "json_schema", schema: TASK_SCHEMA } },
    });

    const textBlock = msg.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return Response.json({ error: "parse" }, { status: 502 });
    }
    const parsed = JSON.parse(textBlock.text) as ParseResponse;
    return Response.json(parsed satisfies ParseResponse);
  } catch (err) {
    console.error("parse route error", err);
    return Response.json({ error: "parse" }, { status: 502 });
  }
}
