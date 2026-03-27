export type EventProgramItem = {
  time: string;
  title: string;
  note?: string;
};

export type ParsedEventDescription = {
  summary: string;
  programName: string;
  programDate: string;
  itinerary: EventProgramItem[];
};

const EVENT_META_MARKER = "__PCN_EVENT_META__";

const emptyParsedDescription = (): ParsedEventDescription => ({
  summary: "",
  programName: "",
  programDate: "",
  itinerary: [],
});

type EventMetaShape = {
  summary?: unknown;
  programName?: unknown;
  programDate?: unknown;
  itinerary?: unknown;
};

export function parseEventDescription(description?: string | null): ParsedEventDescription {
  if (!description) {
    return emptyParsedDescription();
  }

  if (!description.startsWith(EVENT_META_MARKER)) {
    return {
      ...emptyParsedDescription(),
      summary: description,
    };
  }

  try {
    const payload = JSON.parse(description.slice(EVENT_META_MARKER.length)) as EventMetaShape;
    const itinerary = Array.isArray(payload.itinerary) ? payload.itinerary as Array<Record<string, unknown>> : [];

    return {
      summary: typeof payload.summary === "string" ? payload.summary : "",
      programName: typeof payload.programName === "string" ? payload.programName : "",
      programDate: typeof payload.programDate === "string" ? payload.programDate : "",
      itinerary: itinerary
        .map((item) => ({
          time: typeof item.time === "string" ? item.time : "",
          title: typeof item.title === "string" ? item.title : "",
          note: typeof item.note === "string" ? item.note : "",
        }))
        .filter((item) => item.time || item.title || item.note),
    };
  } catch {
    return {
      ...emptyParsedDescription(),
      summary: description,
    };
  }
}

export function serializeEventDescription(details: ParsedEventDescription): string {
  const summary = details.summary.trim();
  const programName = details.programName.trim();
  const programDate = details.programDate.trim();
  const itinerary = details.itinerary
    .map((item) => ({
      time: item.time.trim(),
      title: item.title.trim(),
      note: item.note?.trim() || "",
    }))
    .filter((item) => item.time || item.title || item.note);

  if (!programName && !programDate && itinerary.length === 0) {
    return summary;
  }

  return `${EVENT_META_MARKER}${JSON.stringify({
    summary,
    programName,
    programDate,
    itinerary,
  })}`;
}

export function parseItineraryText(value: string): EventProgramItem[] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [time = "", title = "", note = ""] = line.split("|").map((part) => part.trim());
      return { time, title, note };
    })
    .filter((item) => item.time || item.title || item.note);
}

export function formatItineraryText(items: EventProgramItem[]): string {
  return items
    .map((item) => [item.time, item.title, item.note || ""].join(" | ").trim())
    .join("\n");
}
