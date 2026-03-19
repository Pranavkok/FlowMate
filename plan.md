# FlowMate — New Triggers & Actions Implementation Plan

## What We're Adding

### New Triggers (3)
| ID | Name | What it does |
|----|------|-------------|
| `schedule-trigger` | Schedule | Fires at a fixed interval (every N minutes/hours) |
| `github-trigger` | GitHub Push | Fires when a push is made to a GitHub repo via webhook |
| `form-trigger` | Form Submit | Fires when a custom HTML form is submitted |

### New Actions (4)
| ID | Name | What it does |
|----|------|-------------|
| `slack-action` | Send Slack Message | Posts a message to a Slack channel via webhook URL |
| `discord-action` | Send Discord Message | Posts a message to a Discord channel via webhook URL |
| `http-action` | HTTP Request | Makes an outbound GET/POST request to any URL |
| `log-action` | Log to Console | Logs the zap run metadata to console (dev/debug utility) |

---

## Architecture Overview (How It All Works)

```
Trigger fires
    ↓
hook app (port 3002) receives POST /hooks/catch/:userId/:zapId
    ↓
Creates ZapRun + ZapRunOutbox in DB (transaction)
    ↓
processor app polls ZapRunOutbox every 3s
    ↓
Pushes { zapRunId, stage: 0 } to Kafka topic "zap-events"
    ↓
worker app consumes from Kafka
    ↓
Looks up ZapRun → finds action at sortingOrder === stage
    ↓
Executes action handler (email / solana / slack / discord / http / log)
    ↓
If more actions remain → pushes { zapRunId, stage: stage+1 } back to Kafka
    ↓
Done
```

**Key insight**: Adding a new action only requires:
1. Seeding an `AvailableAction` row in the DB
2. Adding a handler block in `apps/worker/src/index.ts`
3. Optionally creating a dedicated handler file (e.g. `slack.ts`)

Adding a new trigger only requires:
1. Seeding an `AvailableAction` row in the DB
2. For scheduled triggers — adding a cron in the processor or a new app
3. For webhook-based triggers — they already work via the hook app (no code change)

---

## Step-by-Step Implementation

---

### PHASE 1 — Seed the new triggers and actions

**File: `packages/db/seed.ts`**

Add the following entries. Run seed after to populate the DB.

```ts
// New triggers
await prisma.availableTrigger.createMany({
  data: [
    { id: 'schedule-trigger', name: 'Schedule',     image: '...' },
    { id: 'github-trigger',   name: 'GitHub Push',  image: '...' },
    { id: 'form-trigger',     name: 'Form Submit',  image: '...' },
  ],
  skipDuplicates: true,
});

// New actions
await prisma.availableAction.createMany({
  data: [
    { id: 'slack-action',   name: 'Send Slack Message',   image: '...' },
    { id: 'discord-action', name: 'Send Discord Message', image: '...' },
    { id: 'http-action',    name: 'HTTP Request',         image: '...' },
    { id: 'log-action',     name: 'Log to Console',       image: '...' },
  ],
  skipDuplicates: true,
});
```

**Run seed:**
```bash
cd packages/db
npx prisma db seed
```

---

### PHASE 2 — Implement Action Handlers in Worker

Each action is handled inside the `eachMessage` callback in `apps/worker/src/index.ts`.
The pattern is identical each time: check `currentAction.type.id`, parse metadata with the `parse()` helper, call the handler.

---

#### Action 1: `log-action` — Log to Console

**Why start here:** Zero dependencies, no env vars, great for testing the pipeline end-to-end.

**File: `apps/worker/src/index.ts`** — add inside `eachMessage`:

```ts
if (currentAction.type.id === "log-action") {
    const label = parse(
        (currentAction.metadata as Record<string, unknown>)?.label as string ?? "ZapRun",
        zapRunMetadata
    );
    console.log(`[LOG ACTION] ${label}`, JSON.stringify(zapRunMetadata, null, 2));
}
```

**Metadata fields the user configures in frontend:**
- `label` — string label to prefix the log (e.g. `"Received: {body.event}"`)

**No new files needed.**

---

#### Action 2: `slack-action` — Send Slack Message

Slack supports Incoming Webhooks — user creates a webhook URL in their Slack workspace and pastes it in the zap config. **No OAuth needed.**

**New file: `apps/worker/src/slack.ts`**

```ts
export async function sendSlackMessage(webhookUrl: string, message: string) {
    const res = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: message }),
    });
    if (!res.ok) {
        throw new Error(`Slack webhook failed: ${res.status}`);
    }
    console.log("Slack message sent");
}
```

**In `apps/worker/src/index.ts`:**

```ts
import { sendSlackMessage } from "./slack";

// inside eachMessage:
if (currentAction.type.id === "slack-action") {
    const webhookUrl = parse(
        (currentAction.metadata as Record<string, unknown>)?.webhookUrl as string,
        zapRunMetadata
    );
    const message = parse(
        (currentAction.metadata as Record<string, unknown>)?.message as string,
        zapRunMetadata
    );
    console.log(`Sending Slack message to webhook`);
    await sendSlackMessage(webhookUrl, message);
}
```

**Metadata fields:**
- `webhookUrl` — the Slack Incoming Webhook URL (e.g. `https://hooks.slack.com/services/XXX/YYY/ZZZ`)
- `message` — message text, supports template variables (e.g. `"New event: {body.type}"`)

**No env vars required** — webhook URL lives in the zap metadata.

---

#### Action 3: `discord-action` — Send Discord Message

Discord webhook API is nearly identical to Slack. User creates a webhook in Discord channel settings.

**New file: `apps/worker/src/discord.ts`**

```ts
export async function sendDiscordMessage(webhookUrl: string, content: string) {
    const res = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
    });
    if (!res.ok) {
        throw new Error(`Discord webhook failed: ${res.status}`);
    }
    console.log("Discord message sent");
}
```

**In `apps/worker/src/index.ts`:**

```ts
import { sendDiscordMessage } from "./discord";

// inside eachMessage:
if (currentAction.type.id === "discord-action") {
    const webhookUrl = parse(
        (currentAction.metadata as Record<string, unknown>)?.webhookUrl as string,
        zapRunMetadata
    );
    const message = parse(
        (currentAction.metadata as Record<string, unknown>)?.message as string,
        zapRunMetadata
    );
    console.log(`Sending Discord message`);
    await sendDiscordMessage(webhookUrl, message);
}
```

**Metadata fields:**
- `webhookUrl` — Discord channel webhook URL
- `message` — message content, supports template variables

---

#### Action 4: `http-action` — Outbound HTTP Request

Makes a configurable HTTP request to any URL. Useful for calling other APIs or services.

**New file: `apps/worker/src/httpRequest.ts`**

```ts
export async function makeHttpRequest(
    url: string,
    method: string,
    body?: string
) {
    const options: RequestInit = {
        method: method.toUpperCase(),
        headers: { "Content-Type": "application/json" },
    };
    if (body && method.toUpperCase() !== "GET") {
        options.body = body;
    }
    const res = await fetch(url, options);
    const text = await res.text();
    console.log(`HTTP ${method} ${url} → ${res.status}: ${text.slice(0, 200)}`);
}
```

**In `apps/worker/src/index.ts`:**

```ts
import { makeHttpRequest } from "./httpRequest";

// inside eachMessage:
if (currentAction.type.id === "http-action") {
    const url    = parse((currentAction.metadata as Record<string, unknown>)?.url as string, zapRunMetadata);
    const method = parse((currentAction.metadata as Record<string, unknown>)?.method as string ?? "GET", zapRunMetadata);
    const body   = parse((currentAction.metadata as Record<string, unknown>)?.body as string ?? "", zapRunMetadata);
    console.log(`Making HTTP ${method} to ${url}`);
    await makeHttpRequest(url, method, body);
}
```

**Metadata fields:**
- `url` — target URL, supports template variables
- `method` — `GET` or `POST`
- `body` — JSON body string for POST (optional), supports template variables

---

### PHASE 3 — Implement Triggers

Triggers determine WHEN a zap fires. Two of our three new triggers are **webhook-style** (GitHub, Form) and work through the existing hook app with zero extra code. Only Schedule needs new logic.

---

#### Trigger 1: `github-trigger` — GitHub Push

**How it works:** GitHub supports repository webhooks. The user goes to their repo → Settings → Webhooks → adds the FlowMate hook URL. GitHub POSTs to that URL on every push.

**No new code needed.** The existing hook app at `POST /hooks/catch/:userId/:zapId` already handles this — it stores whatever JSON body GitHub sends into `ZapRun.metadata`. GitHub's push payload includes `pusher.name`, `commits[0].message`, `repository.full_name`, etc., all accessible via template variables in actions.

**What the user needs to do:**
1. Create a zap with `github-trigger`
2. The dashboard shows them their hook URL: `http://your-server:3002/hooks/catch/{userId}/{zapId}`
3. They paste that URL into GitHub → Settings → Webhooks

**Frontend change needed:** Show the hook URL on the dashboard after zap creation so the user can copy it.

---

#### Trigger 2: `form-trigger` — Form Submit

**How it works:** User embeds a plain HTML form that POSTs to the hook URL.

```html
<form action="http://localhost:3002/hooks/catch/1/your-zap-id" method="POST">
  <input name="email" type="email" />
  <button type="submit">Submit</button>
</form>
```

**No new code needed.** Same as github-trigger — the hook app already handles it. The form body is stored in metadata and accessible via template vars like `{email}`.

**One small fix needed in hook app:** The hook currently reads `req.body` which requires JSON. For HTML forms, body is `application/x-www-form-urlencoded`. Add `express.urlencoded()` middleware to the hook app.

**File: `apps/hook/src/index.ts`** — add one line:

```ts
app.use(express.json());
app.use(express.urlencoded({ extended: true }));  // ADD THIS
```

---

#### Trigger 3: `schedule-trigger` — Schedule (runs every N minutes)

This is the most work. A scheduled trigger needs something to **fire** it on a timer — not just wait for an incoming HTTP request.

**Architecture Decision:** Add a new cron runner inside the processor app (it already polls the DB every 3s, so it's the right place).

**How it works:**
1. When a user creates a zap with `schedule-trigger`, they configure `intervalMinutes` (e.g. `5`)
2. The processor, on each poll cycle, also checks for scheduled zaps that are due to run
3. "Due" means: last run was more than `intervalMinutes` ago (or never ran)
4. Processor creates a `ZapRun` + `ZapRunOutbox` entry, triggering the normal pipeline

**DB change needed:** Add `lastRunAt` to the `Trigger` model (optional field, null = never ran).

**Schema change in `packages/db/prisma/schema.prisma`:**
```prisma
model Trigger {
  id        String    @id @default(uuid())
  zapId     String    @unique
  triggerId String
  metadata  Json      @default("{}")
  lastRunAt DateTime?    // ADD THIS
  zap       Zap       @relation(fields: [zapId], references: [id])
  type      AvailableTrigger @relation(fields: [triggerId], references: [id])
}
```

**Run migration:**
```bash
cd packages/db
npx prisma migrate dev --name add_trigger_lastRunAt
```

**New function in `apps/processor/src/index.ts`:**

```ts
async function runScheduledZaps() {
    const scheduledZaps = await prisma.zap.findMany({
        where: {
            trigger: { triggerId: "schedule-trigger" }
        },
        include: { trigger: true }
    });

    for (const zap of scheduledZaps) {
        const metadata = zap.trigger.metadata as Record<string, unknown>;
        const intervalMinutes = parseInt(metadata?.intervalMinutes as string ?? "60");
        const lastRun = zap.trigger.lastRunAt;
        const now = new Date();
        const minutesSinceLastRun = lastRun
            ? (now.getTime() - lastRun.getTime()) / 1000 / 60
            : Infinity;

        if (minutesSinceLastRun >= intervalMinutes) {
            await prisma.$transaction(async tx => {
                const run = await tx.zapRun.create({
                    data: { zapId: zap.id, metadata: { scheduledAt: now.toISOString() } }
                });
                await tx.zapRunOutbox.create({ data: { zapRunId: run.id } });
                await tx.trigger.update({
                    where: { id: zap.trigger.id },
                    data: { lastRunAt: now }
                });
            });
            console.log(`Fired scheduled zap ${zap.id}`);
        }
    }
}
```

**Call it inside the main loop alongside the outbox polling.**

---

### PHASE 4 — Frontend: Add metadata fields for new triggers/actions

**File: `apps/web/app/zap/create/page.tsx`**

The `getMetadataFields()` function controls which input fields appear when an action is selected. Add cases for new actions:

```ts
if (name.includes("slack") || name.includes("discord")) {
    return [
        { key: "webhookUrl", label: "Webhook URL", placeholder: "https://hooks.slack.com/..." },
        { key: "message",    label: "Message",     placeholder: "New event: {body.type}" },
    ];
}
if (name.includes("http") || name.includes("request")) {
    return [
        { key: "url",    label: "URL",    placeholder: "https://api.example.com/notify" },
        { key: "method", label: "Method", placeholder: "POST" },
        { key: "body",   label: "Body",   placeholder: '{"key": "{body.value}"}' },
    ];
}
if (name.includes("log")) {
    return [
        { key: "label", label: "Log Label", placeholder: "Event received: {body.type}" },
    ];
}
```

For the schedule trigger, add trigger metadata fields. Currently triggers don't show config fields — add similar logic for selected trigger:

```ts
// New state
const [triggerMetadata, setTriggerMetadata] = useState<Record<string, string>>({});

// When trigger is "Schedule", show intervalMinutes field
const getTriggerFields = (triggerName: string) => {
    if (triggerName.toLowerCase().includes("schedule")) {
        return [{ key: "intervalMinutes", label: "Run every (minutes)", placeholder: "60" }];
    }
    return [];
};
```

**Also add:** After a zap is created, show the hook URL so users can configure GitHub webhooks / form actions:

```
Your hook URL: http://localhost:3002/hooks/catch/{userId}/{zapId}
```

---

### PHASE 5 — Show hook URL on Dashboard

**File: `apps/web/app/dashboard/page.tsx`**

After zap creation, or on the dashboard for each zap that uses a webhook-style trigger, display the hook URL so the user can copy it and paste it into GitHub/Discord/form action.

---

## Summary of Files to Change

| File | Change |
|------|--------|
| `packages/db/seed.ts` | Add 3 triggers + 4 actions |
| `packages/db/prisma/schema.prisma` | Add `lastRunAt` to `Trigger` model |
| `apps/worker/src/index.ts` | Add handler blocks for slack, discord, http, log |
| `apps/worker/src/slack.ts` | New file — Slack webhook sender |
| `apps/worker/src/discord.ts` | New file — Discord webhook sender |
| `apps/worker/src/httpRequest.ts` | New file — outbound HTTP request |
| `apps/hook/src/index.ts` | Add `express.urlencoded()` middleware |
| `apps/processor/src/index.ts` | Add `runScheduledZaps()` function |
| `apps/web/app/zap/create/page.tsx` | Add metadata fields for new actions + schedule trigger |
| `apps/web/app/dashboard/page.tsx` | Show hook URL per zap |

## Implementation Order

1. **Seed** — add DB entries (5 min)
2. **log-action** — simplest action, validates the pipeline works (10 min)
3. **slack-action** — test with a real Slack webhook (15 min)
4. **discord-action** — same pattern as Slack (10 min)
5. **http-action** — outbound fetch (15 min)
6. **form-trigger + github-trigger** — just add `urlencoded` middleware + frontend hook URL display (20 min)
7. **schedule-trigger** — DB migration + processor cron logic (30 min)
8. **Frontend metadata fields** — update `getMetadataFields` (20 min)
