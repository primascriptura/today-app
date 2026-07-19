import Anthropic from "@anthropic-ai/sdk";
import { DAYS, DEFAULT_DAY } from "@/lib/data";
import { TASK_SCHEMA, type ParseResponse } from "@/lib/parse";

const client = new Anthropic(); // reads ANTHROPIC_API_KEY from the environment

// The fixed demo week as context for relative-day resolution.
const WEEK = DAYS.map((d, i) => ({ index: i, weekday: d.full }));

const SYSTEM_PROMPT = `You turn a spoken Ukrainian to-do dictation into structured tasks.

The user dictates in Ukrainian; the transcript may contain ONE or SEVERAL tasks.
Extract every distinct task. For each task, return:
- title: a short, clean action in the user's language. Strip filler like
  "нагадай мені", "мені треба", "не забути".
- day: an integer 0–6 indexing this week. Resolve relative words against the
  week you are given and "today". "сьогодні" = today's index; "завтра" = the
  next index; a named weekday ("у п'ятницю") = that weekday's index. If no day
  is mentioned, use today's index.
- slot: "morning" (until ~11:59), "afternoon" (12:00–16:59), "evening"
  (17:00+), or "anytime" if no time is mentioned.
- meta: a short human label for the time/day if one was mentioned
  (e.g. "6:00 PM", "Friday"), otherwise null.
- priority: true ONLY when the words signal urgency ("терміново", "asap",
  "негайно", "до п'ятниці", "перш за все"). Judge by the words alone.
- notes: any extra execution detail mentioned, otherwise null.

If the transcript contains nothing task-like, return an empty tasks array.
Return ONLY the structured object.`;

export async function POST(req: Request) {
  let transcript = "";
  try {
    const body = await req.json();
    transcript = typeof body?.transcript === "string" ? body.transcript.trim() : "";
  } catch {
    return Response.json({ error: "empty" }, { status: 400 });
  }
  if (!transcript) {
    return Response.json({ error: "empty" }, { status: 400 });
  }

  const userContent = [
    `Today is index ${DEFAULT_DAY} (${DAYS[DEFAULT_DAY].full}).`,
    `This week: ${JSON.stringify(WEEK)}.`,
    `Transcript: "${transcript}"`,
  ].join("\n");

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
