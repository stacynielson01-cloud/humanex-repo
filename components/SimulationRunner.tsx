import React, { useCallback, useEffect, useRef, useState } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import WebView, { type WebViewMessageEvent } from "react-native-webview";
import { useApp } from "@/context/AppContext";
import { generateBehaviorScript, type SimSession } from "@/simulation/engine";

const MAX_CONCURRENT = 2;
const W = Dimensions.get("window").width;

interface ActiveWebView {
  session: SimSession;
  key: string;
  injectedJS: string;
}

export function SimulationRunner() {
  const { state, claimNextSession, onSessionComplete, addLog, onAllDone } = useApp();
  const [active, setActive] = useState<ActiveWebView[]>([]);
  const completedRef = useRef(0);
  const totalRef = useRef(0);
  const stoppedRef = useRef(false);

  const startNext = useCallback(() => {
    if (stoppedRef.current) return;
    const session = claimNextSession();
    if (!session) return;
    const label = session.config.keywordMode
      ? `Google → ${session.config.keywordMode.targetDomain}`
      : session.url;
    addLog(`[+] ${session.id} starting → ${label}`);
    setActive((prev) => [
      ...prev,
      { session, key: `${session.id}_${Date.now()}`, injectedJS: generateBehaviorScript(session) },
    ]);
  }, [claimNextSession, addLog]);

  const handleComplete = useCallback(
    (sessionId: string) => {
      completedRef.current++;
      onSessionComplete(sessionId);
      setActive((prev) => prev.filter((v) => v.session.id !== sessionId));
      startNext();
      if (completedRef.current >= totalRef.current) {
        onAllDone();
      }
    },
    [startNext, onSessionComplete, onAllDone],
  );

  const handleMessage = useCallback(
    (sessionId: string, event: WebViewMessageEvent) => {
      try {
        const data = JSON.parse(event.nativeEvent.data) as { type: string; msg?: string };
        if (data.type === "log" && data.msg) {
          addLog(`[${sessionId}] ${data.msg}`);
        } else if (data.type === "done") {
          addLog(`[✓] ${sessionId} completed`);
          handleComplete(sessionId);
        }
      } catch {
        // ignore
      }
    },
    [addLog, handleComplete],
  );

  const handleError = useCallback(
    (sessionId: string, desc: string) => {
      addLog(`[!] ${sessionId} error: ${desc}`);
      handleComplete(sessionId);
    },
    [addLog, handleComplete],
  );

  useEffect(() => {
    if (state.is_running) {
      completedRef.current = 0;
      totalRef.current = state.left_sessions + state.active_sessions;
      stoppedRef.current = false;
      setActive([]);
      for (let i = 0; i < MAX_CONCURRENT; i++) {
        startNext();
      }
    } else {
      stoppedRef.current = true;
      setActive([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.is_running]);

  if (!state.is_running || active.length === 0) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      {active.map(({ session, key, injectedJS }) => (
        <WebView
          key={key}
          source={{
            uri: session.url,
            headers: session.referrer ? { Referer: session.referrer } : {},
          }}
          userAgent={session.userAgent}
          injectedJavaScript={injectedJS}
          onMessage={(e) => handleMessage(session.id, e)}
          onError={(e) => handleError(session.id, e.nativeEvent.description)}
          onHttpError={(e) =>
            handleError(session.id, `HTTP ${e.nativeEvent.statusCode}`)
          }
          style={styles.webview}
          javaScriptEnabled
          domStorageEnabled
          incognito
          cacheEnabled={false}
          thirdPartyCookiesEnabled={false}
          mixedContentMode="always"
          allowsInlineMediaPlayback={false}
          mediaPlaybackRequiresUserAction
          setSupportMultipleWindows={false}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: -6000,
    left: 0,
    width: W,
    height: 5000,
    zIndex: -999,
  },
  webview: {
    width: W,
    height: 700,
    marginBottom: 20,
  },
});
