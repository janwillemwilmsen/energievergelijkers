import cron from "node-cron";
import { loadSettings } from "./db.mjs";
import { dailyTimeToCron } from "./defaults.mjs";
import { executeCompare } from "./compare.mjs";

let task = null;
let currentExpr = null;
let currentTz = null;
let running = false;

export function cronFromSettings(settings) {
  if (settings.cronMode === "advanced" && settings.cronExpression) {
    return settings.cronExpression;
  }
  return dailyTimeToCron(settings.dailyTime || "07:00");
}

export function applySchedule(settings = loadSettings()) {
  const expr = cronFromSettings(settings);
  const tz = settings.timezone || "Europe/Amsterdam";
  if (!cron.validate(expr)) {
    console.warn(`[scheduler] ongeldige cron "${expr}", schema niet bijgewerkt`);
    return { ok: false, expression: expr, timezone: tz, error: "Ongeldige cron-expressie" };
  }
  if (task && currentExpr === expr && currentTz === tz) {
    return { ok: true, expression: expr, timezone: tz, unchanged: true };
  }
  if (task) {
    task.stop();
    task = null;
  }
  task = cron.schedule(expr, () => triggerScheduled(), { timezone: tz });
  currentExpr = expr;
  currentTz = tz;
  console.log(`[scheduler] actief: ${expr} (${tz})`);
  return { ok: true, expression: expr, timezone: tz };
}

async function triggerScheduled() {
  if (running) {
    console.warn("[scheduler] vorige run nog bezig, skip");
    return;
  }
  running = true;
  try {
    const settings = loadSettings();
    console.log(`[scheduler] start scheduled compare (${settings.scheduleProfile})`);
    const { promise } = await executeCompare({
      trigger: "schedule",
      profile: settings.scheduleProfile,
    });
    const result = await promise;
    console.log(`[scheduler] klaar run #${result.id} status=${result.status}`);
  } catch (err) {
    console.error("[scheduler] mislukt:", err.message);
  } finally {
    running = false;
  }
}

export function schedulerStatus() {
  const settings = loadSettings();
  return {
    expression: currentExpr || cronFromSettings(settings),
    timezone: currentTz || settings.timezone,
    running,
    nextHint:
      settings.cronMode === "daily"
        ? `Elke dag om ${settings.dailyTime} (${settings.timezone})`
        : `${currentExpr} (${settings.timezone})`,
  };
}
