/*
 AI OFFICE 2.0 v0.17.0
 Existing CONTROL ↔ DISPLAY Realtime connector.
 Reuses v1.0.0 config.js/shared/core.js without changing Supabase schema.
*/
import {
  db,
  clean,
  createPresentationChannel,
  presenceHasRole,
  sendBroadcast
} from "./shared/core.js";

const STATUS_EVENT = "ai-office:realtime-status";
let channel = null;
let code = "";
let displayOnline = false;
let pending = new Map();

function notify(state, detail = "") {
  window.dispatchEvent(new CustomEvent(STATUS_EVENT, {
    detail: { state, detail, code, displayOnline }
  }));
}

function currentSessionCode() {
  const value = clean(localStorage.getItem("aiOfficeSessionCode") || "");
  return /^\d{6}$/.test(value) ? value : "";
}

function clearPending(commandId) {
  const timer = pending.get(commandId);
  if (timer) clearTimeout(timer);
  pending.delete(commandId);
}

function connect(sessionCode) {
  if (!/^\d{6}$/.test(sessionCode)) {
    notify("waiting", "기존 CONTROL에서 6자리 연결코드를 먼저 생성해 주세요.");
    return false;
  }
  if (channel) db.removeChannel(channel);
  code = sessionCode;
  channel = createPresentationChannel(code, "control", {
    presence: state => {
      displayOnline = presenceHasRole(state, "display");
      notify(displayOnline ? "connected" : "waiting",
        displayOnline ? "기존 DISPLAY Realtime 채널 연결됨" : "DISPLAY 연결 대기");
    },
    ack: payload => {
      if (!payload?.commandId) return;
      clearPending(payload.commandId);
      notify(payload.ok ? "ack" : "error",
        payload.ok ? "✓ DISPLAY 표시 완료" : `⚠ ${payload.message || "표시 실패"}`);
    },
    status: status => {
      if (status !== "SUBSCRIBED") notify("connecting", `Realtime ${status}`);
    }
  });
  notify("connecting", `SESSION ${code} 연결 중`);
  return true;
}

async function sendAIAction(detail) {
  if (!channel || code !== currentSessionCode()) {
    if (!connect(currentSessionCode())) return false;
  }
  if (!displayOnline) {
    notify("waiting", "DISPLAY 연결을 확인하세요.");
    return false;
  }
  const commandId = crypto.randomUUID();
  const payload = {
    id: commandId,
    type: "AI_OFFICE_ACTION",
    actionId: clean(detail?.actionId),
    source: clean(detail?.source || "menu"),
    payload: detail?.payload || {},
    sentAt: new Date().toISOString(),
    version: "0.17.0"
  };
  pending.set(commandId, setTimeout(() => {
    clearPending(commandId);
    notify("error", "⚠ DISPLAY ACK 시간초과");
  }, 5000));
  notify("sending", `${payload.actionId} 전송 중`);
  await sendBroadcast(channel, "command", payload);
  return true;
}

function boot() {
  const savedCode = currentSessionCode();
  if (savedCode) connect(savedCode);
  else notify("waiting", "기존 CONTROL의 6자리 SESSION 코드가 없습니다.");

  const register = () => {
    if (window.AIOfficeBridge?.registerTransport) {
      window.AIOfficeBridge.registerTransport(sendAIAction);
      notify(savedCode ? "connecting" : "waiting",
        savedCode ? `기존 SESSION ${savedCode} 재사용` : "CONTROL 연결코드 필요");
      return true;
    }
    return false;
  };
  if (!register()) {
    let tries = 0;
    const timer = setInterval(() => {
      tries += 1;
      if (register() || tries > 40) clearInterval(timer);
    }, 100);
  }

  window.addEventListener("storage", event => {
    if (event.key === "aiOfficeSessionCode") {
      const next = currentSessionCode();
      if (next && next !== code) connect(next);
    }
  });
}

boot();
