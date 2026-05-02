import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FeatureButton } from "@/components/FeatureButton";
import { AdvancedScrollingModal } from "@/components/modals/AdvancedScrollingModal";
import { ArticleRandomizationModal } from "@/components/modals/ArticleRandomizationModal";
import { CookiesModal } from "@/components/modals/CookiesModal";
import { ExecutionSequenceModal } from "@/components/modals/ExecutionSequenceModal";
import { HyperlinkClickingModal } from "@/components/modals/HyperlinkClickingModal";
import { InteractiveModeModal } from "@/components/modals/InteractiveModeModal";
import { MultiUrlVisitModal } from "@/components/modals/MultiUrlVisitModal";
import { ProxiesModal } from "@/components/modals/ProxiesModal";
import { RandomActionsModal } from "@/components/modals/RandomActionsModal";
import { RpaModal } from "@/components/modals/RpaModal";
import { SmartMouseHoverModal } from "@/components/modals/SmartMouseHoverModal";
import { UrlMenuModal } from "@/components/modals/UrlMenuModal";
import { UserAgentsModal } from "@/components/modals/UserAgentsModal";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

type ModalName =
  | "execution_sequence"
  | "url_menu"
  | "rpa"
  | "proxies"
  | "user_agents"
  | "cookies"
  | "random_actions"
  | "advanced_scrolling"
  | "article_randomization"
  | "hyperlink_clicking"
  | "multi_url_visit"
  | "smart_mouse_hover"
  | "interactive_mode"
  | null;

export default function FeaturesScreen() {
  const { state } = useApp();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [modal, setModal] = useState<ModalName>(null);

  const open = (name: ModalName) => setModal(name);
  const close = () => setModal(null);

  const s = state;
  const es = s.execution_sequence_settings;
  const us = s.url_menu_settings;
  const rs = s.rpa_settings;
  const as = s.advanced_scrolling_settings;
  const ars = s.article_randomization_settings;
  const hs = s.hyperlink_clicking_settings;
  const ms = s.multi_url_settings;
  const hov = s.hover_settings;
  const ras = s.random_actions_settings;
  const ims = s.interactive_mode_settings;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
    >
      <Text style={[styles.sectionTitle, { color: colors.accent }]}>SMART CONTROL</Text>

      <FeatureButton
        label="Execution Sequence"
        iconName="zap"
        statusText={es.enabled ? `Enabled — ${es.sequence.join(" → ")}` : "Disabled"}
        statusOk={es.enabled}
        onPress={() => open("execution_sequence")}
        accentColor={colors.warning}
      />

      <Text style={[styles.sectionTitle, { color: colors.accent }]}>NAVIGATION</Text>

      <FeatureButton
        label="URL Menu"
        iconName="list"
        statusText={us.enabled ? `${us.urls.length} URLs configured` : "Not configured"}
        statusOk={us.enabled && us.urls.length > 0}
        onPress={() => open("url_menu")}
      />
      <FeatureButton
        label="RPA Automation"
        iconName="cpu"
        statusText={rs.enabled ? `${rs.actions.length} actions configured` : "Not configured"}
        statusOk={rs.enabled && rs.actions.length > 0}
        onPress={() => open("rpa")}
      />
      <FeatureButton
        label="Interactive Mode"
        iconName="activity"
        statusText={ims.enabled ? `${ims.duration}s on ${ims.target_url || "no URL"}` : "Disabled"}
        statusOk={ims.enabled && !!ims.target_url}
        onPress={() => open("interactive_mode")}
      />

      <Text style={[styles.sectionTitle, { color: colors.accent }]}>IDENTITY</Text>

      <FeatureButton
        label="Proxies"
        iconName="shield"
        statusText={s.proxy_lines.length > 0 ? `${s.proxy_lines.length} proxies loaded` : "Not imported"}
        statusOk={s.proxy_lines.length > 0}
        onPress={() => open("proxies")}
      />
      <FeatureButton
        label="User-Agents"
        iconName="monitor"
        statusText={s.user_agents.length > 0 ? `${s.user_agents.length} agents loaded` : "Not imported"}
        statusOk={s.user_agents.length > 0}
        onPress={() => open("user_agents")}
      />
      <FeatureButton
        label="Cookies"
        iconName="lock"
        statusText={s.cookies_text.length > 0 ? "Cookie data loaded" : "Not imported"}
        statusOk={s.cookies_text.length > 0}
        onPress={() => open("cookies")}
      />

      <Text style={[styles.sectionTitle, { color: colors.accent }]}>BEHAVIOR</Text>

      <FeatureButton
        label="Random Actions"
        iconName="shuffle"
        statusText={
          ras.enabled
            ? `${Object.values(ras).filter((v) => typeof v === "object" && (v as { enabled: boolean }).enabled).length} actions enabled`
            : "Disabled"
        }
        statusOk={ras.enabled}
        onPress={() => open("random_actions")}
      />
      <FeatureButton
        label="Advanced Scrolling"
        iconName="chevrons-down"
        statusText={as.enabled ? "Configured" : "Disabled"}
        statusOk={as.enabled}
        onPress={() => open("advanced_scrolling")}
      />
      <FeatureButton
        label="Article Randomization"
        iconName="file-text"
        statusText={ars.enabled ? `${ars.articles.length} articles, ${ars.highlight_probability}% prob` : "Disabled"}
        statusOk={ars.enabled && ars.articles.length > 0}
        onPress={() => open("article_randomization")}
      />
      <FeatureButton
        label="Hyperlink Clicking"
        iconName="external-link"
        statusText={hs.enabled ? `${hs.click_probability}% probability` : "Disabled"}
        statusOk={hs.enabled}
        onPress={() => open("hyperlink_clicking")}
      />
      <FeatureButton
        label="Multi-URL Visit"
        iconName="globe"
        statusText={ms.enabled ? `${ms.min_urls}–${ms.max_urls} URLs, ${ms.probability}% prob` : "Disabled"}
        statusOk={ms.enabled}
        onPress={() => open("multi_url_visit")}
      />
      <FeatureButton
        label="Smart Mouse Hover"
        iconName="mouse-pointer"
        statusText={hov.enabled ? `${hov.hover_probability}% prob, ${hov.min_duration}–${hov.max_duration}s` : "Disabled"}
        statusOk={hov.enabled}
        onPress={() => open("smart_mouse_hover")}
      />

      {/* Modals */}
      <ExecutionSequenceModal visible={modal === "execution_sequence"} onClose={close} />
      <UrlMenuModal visible={modal === "url_menu"} onClose={close} />
      <RpaModal visible={modal === "rpa"} onClose={close} />
      <ProxiesModal visible={modal === "proxies"} onClose={close} />
      <UserAgentsModal visible={modal === "user_agents"} onClose={close} />
      <CookiesModal visible={modal === "cookies"} onClose={close} />
      <RandomActionsModal visible={modal === "random_actions"} onClose={close} />
      <AdvancedScrollingModal visible={modal === "advanced_scrolling"} onClose={close} />
      <ArticleRandomizationModal visible={modal === "article_randomization"} onClose={close} />
      <HyperlinkClickingModal visible={modal === "hyperlink_clicking"} onClose={close} />
      <MultiUrlVisitModal visible={modal === "multi_url_visit"} onClose={close} />
      <SmartMouseHoverModal visible={modal === "smart_mouse_hover"} onClose={close} />
      <InteractiveModeModal visible={modal === "interactive_mode"} onClose={close} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 14 },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 8,
    marginTop: 8,
  },
});
