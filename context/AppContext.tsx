import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { generateSessions, type SimSession } from "@/simulation/engine";

export interface UrlMenuSettings {
  enabled: boolean;
  urls: { url: string; wait_time: number }[];
}

export interface AdvancedScrollingSettings {
  enabled: boolean;
  scroll_sequence: string[];
  sequence_repetitions: number;
  slow_probability: number;
  slow_min_speed: number;
  slow_max_speed: number;
  fast_probability: number;
  fast_min_speed: number;
  fast_max_speed: number;
  min_pause: number;
  max_pause: number;
  pause_probability: number;
}

export interface ArticleRandomizationSettings {
  enabled: boolean;
  articles: string[];
  highlight_probability: number;
  mode: "sentence" | "word";
}

export interface HyperlinkClickingSettings {
  enabled: boolean;
  click_probability: number;
}

export interface MultiUrlSettings {
  enabled: boolean;
  min_urls: number;
  max_urls: number;
  timeframe: number;
  probability: number;
}

export interface SmartMouseHoverSettings {
  enabled: boolean;
  hover_probability: number;
  min_duration: number;
  max_duration: number;
}

export interface ExecutionSequenceSettings {
  enabled: boolean;
  sequence: string[];
}

export interface AppState {
  urls: string;
  referral_url: string;
  element_to_click: string;
  wait_time_after_click: number;
  android_percent: string;
  desktop_percent: string;
  ios_percent: string;
  use_random_stay_time: boolean;
  stay_time_fixed: string;
  stay_time_min: number;
  stay_time_max: number;
  use_random_threads: boolean;
  threads_fixed: string;
  threads_min: number;
  threads_max: number;
  use_thread_timer: boolean;
  thread_timer_min: number;
  thread_timer_max: number;
  referral_source: string;
  enable_keyword_search: boolean;
  keyword_main_url: string;
  keyword_keywords: string;
  keyword_stay_time: string;
  browser_behavior: string;
  proxy_lines: string[];
  user_agents: string[];
  cookies_text: string;
  url_menu_settings: UrlMenuSettings;
  advanced_scrolling_settings: AdvancedScrollingSettings;
  article_randomization_settings: ArticleRandomizationSettings;
  hyperlink_clicking_settings: HyperlinkClickingSettings;
  multi_url_settings: MultiUrlSettings;
  hover_settings: SmartMouseHoverSettings;
  execution_sequence_settings: ExecutionSequenceSettings;
  logs: string[];
  is_running: boolean;
  active_sessions: number;
  left_sessions: number;
}

const defaultState: AppState = {
  urls: "",
  referral_url: "",
  element_to_click: "",
  wait_time_after_click: 5,
  android_percent: "40",
  desktop_percent: "40",
  ios_percent: "20",
  use_random_stay_time: false,
  stay_time_fixed: "5",
  stay_time_min: 3,
  stay_time_max: 10,
  use_random_threads: false,
  threads_fixed: "5",
  threads_min: 3,
  threads_max: 10,
  use_thread_timer: false,
  thread_timer_min: 5,
  thread_timer_max: 15,
  referral_source: "Google",
  enable_keyword_search: false,
  keyword_main_url: "",
  keyword_keywords: "",
  keyword_stay_time: "8000",
  browser_behavior: "Quit after process",
  proxy_lines: [],
  user_agents: [],
  cookies_text: "",
  url_menu_settings: { enabled: false, urls: [] },
  advanced_scrolling_settings: {
    enabled: false,
    scroll_sequence: ["random"],
    sequence_repetitions: 1,
    slow_probability: 50,
    slow_min_speed: 10,
    slow_max_speed: 50,
    fast_probability: 25,
    fast_min_speed: 100,
    fast_max_speed: 200,
    min_pause: 0.5,
    max_pause: 2.0,
    pause_probability: 50,
  },
  article_randomization_settings: {
    enabled: false,
    articles: [],
    highlight_probability: 30,
    mode: "sentence",
  },
  hyperlink_clicking_settings: { enabled: false, click_probability: 30 },
  multi_url_settings: {
    enabled: false,
    min_urls: 2,
    max_urls: 5,
    timeframe: 60,
    probability: 50,
  },
  hover_settings: {
    enabled: false,
    hover_probability: 50,
    min_duration: 0.5,
    max_duration: 2.0,
  },
  execution_sequence_settings: {
    enabled: false,
    sequence: ["referral_url", "main_navigation"],
  },
  logs: [],
  is_running: false,
  active_sessions: 0,
  left_sessions: 0,
};

interface AppContextType {
  state: AppState;
  updateState: (partial: Partial<AppState>) => void;
  addLog: (msg: string) => void;
  clearLogs: () => void;
  saveSettings: () => Promise<void>;
  startSimulation: () => void;
  stopSimulation: () => void;
  claimNextSession: () => SimSession | null;
  onSessionComplete: (sessionId: string) => void;
  onAllDone: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(defaultState);
  const logsRef = useRef<string[]>([]);
  const sessionQueueRef = useRef<SimSession[]>([]);
  const totalSessionsRef = useRef(0);
  const completedRef = useRef(0);

  useEffect(() => {
    AsyncStorage.getItem("humanex_settings").then((val) => {
      if (val) {
        try {
          const saved = JSON.parse(val) as Partial<AppState>;
          setState((prev) => ({
            ...prev,
            ...saved,
            logs: [],
            is_running: false,
            active_sessions: 0,
            left_sessions: 0,
          }));
        } catch {
          // ignore corrupt storage
        }
      }
    });
  }, []);

  const updateState = useCallback((partial: Partial<AppState>) => {
    setState((prev) => ({ ...prev, ...partial }));
  }, []);

  const addLog = useCallback((msg: string) => {
    const ts = new Date().toLocaleTimeString();
    const line = `[${ts}] ${msg}`;
    logsRef.current = [...logsRef.current.slice(-999), line];
    setState((prev) => ({ ...prev, logs: [...logsRef.current] }));
  }, []);

  const clearLogs = useCallback(() => {
    logsRef.current = [];
    setState((prev) => ({ ...prev, logs: [] }));
  }, []);

  const saveSettings = useCallback(async () => {
    const { logs, is_running, active_sessions, left_sessions, ...toSave } = state;
    await AsyncStorage.setItem("humanex_settings", JSON.stringify(toSave));
  }, [state]);

  const startSimulation = useCallback(() => {
    const urls = state.urls
      .split("\n")
      .map((u) => u.trim())
      .filter((u) => u.startsWith("http"));

    if (!state.enable_keyword_search && urls.length === 0) {
      addLog("[!] Enter at least one valid URL (starting with http)");
      return;
    }

    const threads = state.use_random_threads
      ? Math.floor(Math.random() * (state.threads_max - state.threads_min + 1)) +
        state.threads_min
      : parseInt(state.threads_fixed, 10) || 1;

    const keywords = state.keyword_keywords
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean);

    const sessions = generateSessions({
      urls,
      threads,
      useRandomStayTime: state.use_random_stay_time,
      stayTimeFixed: parseFloat(state.stay_time_fixed) || 5,
      stayTimeMin: state.stay_time_min,
      stayTimeMax: state.stay_time_max,
      androidPercent: parseInt(state.android_percent, 10) || 40,
      desktopPercent: parseInt(state.desktop_percent, 10) || 40,
      iosPercent: parseInt(state.ios_percent, 10) || 20,
      referralSource: state.referral_source,
      referralUrl: state.referral_url,
      enableKeywordSearch: state.enable_keyword_search,
      keywordMainUrl: state.keyword_main_url,
      keywords,
      keywordStayTime: parseInt(state.keyword_stay_time, 10) || 8000,
      hyperlinkClicking: state.hyperlink_clicking_settings,
      advancedScrolling: state.advanced_scrolling_settings,
    });

    if (sessions.length === 0) {
      addLog("[!] Could not generate any sessions — check your config");
      return;
    }

    sessionQueueRef.current = [...sessions];
    logsRef.current = [];
    totalSessionsRef.current = sessions.length;
    completedRef.current = 0;

    const androidPct = parseInt(state.android_percent, 10) || 0;
    const desktopPct = parseInt(state.desktop_percent, 10) || 0;
    const iosPct = parseInt(state.ios_percent, 10) || 0;

    setState((prev) => ({
      ...prev,
      is_running: true,
      logs: [
        `[${new Date().toLocaleTimeString()}] ⚡ Humanex v4.0 — ${sessions.length} sessions`,
        `[${new Date().toLocaleTimeString()}] [+] URLs: ${urls.length > 0 ? urls.length + " targets" : "keyword search mode"}`,
        `[${new Date().toLocaleTimeString()}] [+] Device split: Android ${androidPct}% / Desktop ${desktopPct}% / iOS ${iosPct}%`,
        `[${new Date().toLocaleTimeString()}] [+] Running directly on device — no server needed`,
      ],
      active_sessions: 0,
      left_sessions: sessions.length,
    }));
    logsRef.current = [
      `[${new Date().toLocaleTimeString()}] ⚡ Humanex v4.0 — ${sessions.length} sessions`,
      `[${new Date().toLocaleTimeString()}] [+] URLs: ${urls.length > 0 ? urls.length + " targets" : "keyword search mode"}`,
      `[${new Date().toLocaleTimeString()}] [+] Device split: Android ${androidPct}% / Desktop ${desktopPct}% / iOS ${iosPct}%`,
      `[${new Date().toLocaleTimeString()}] [+] Running directly on device — no server needed`,
    ];
  }, [state, addLog]);

  const stopSimulation = useCallback(() => {
    sessionQueueRef.current = [];
    addLog("[■] Simulation stopped");
    setState((prev) => ({ ...prev, is_running: false, active_sessions: 0, left_sessions: 0 }));
  }, [addLog]);

  const claimNextSession = useCallback((): SimSession | null => {
    if (sessionQueueRef.current.length === 0) return null;
    const [session, ...rest] = sessionQueueRef.current;
    sessionQueueRef.current = rest;
    setState((prev) => ({
      ...prev,
      active_sessions: prev.active_sessions + 1,
      left_sessions: rest.length,
    }));
    return session ?? null;
  }, []);

  const onSessionComplete = useCallback((sessionId: string) => {
    completedRef.current++;
    setState((prev) => ({
      ...prev,
      active_sessions: Math.max(0, prev.active_sessions - 1),
    }));
  }, []);

  const onAllDone = useCallback(() => {
    addLog(`[✓] All sessions complete (${totalSessionsRef.current} total)`);
    setState((prev) => ({ ...prev, is_running: false, active_sessions: 0, left_sessions: 0 }));
  }, [addLog]);

  return (
    <AppContext.Provider
      value={{
        state,
        updateState,
        addLog,
        clearLogs,
        saveSettings,
        startSimulation,
        stopSimulation,
        claimNextSession,
        onSessionComplete,
        onAllDone,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
