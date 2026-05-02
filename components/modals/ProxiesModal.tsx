import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { ModalSheet } from "@/components/ModalSheet";
import { SectionCard } from "@/components/SectionCard";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function ProxiesModal({ visible, onClose }: Props) {
  const { state, updateState } = useApp();
  const colors = useColors();
  const [text, setText] = useState(state.proxy_lines.join("\n"));

  const handleSave = () => {
    const lines = text
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0);
    updateState({ proxy_lines: lines });
    onClose();
  };

  const clearAll = () => setText("");

  const count = text.split("\n").filter((l) => l.trim().length > 0).length;

  return (
    <ModalSheet visible={visible} title="Proxies" onClose={onClose} onSave={handleSave}>
      <SectionCard title={`${count} Proxies Loaded`}>
        <Text style={{ color: colors.mutedForeground, fontSize: 12, marginBottom: 10 }}>
          Enter one proxy per line. Formats supported:{"\n"}
          • host:port{"\n"}
          • host:port:user:password
        </Text>
        <TextInput
          style={[
            styles.textarea,
            { backgroundColor: colors.input, color: colors.foreground, borderColor: colors.border },
          ]}
          placeholder={"192.168.1.1:8080\n192.168.1.2:8080:user:pass"}
          placeholderTextColor={colors.mutedForeground}
          value={text}
          onChangeText={setText}
          multiline
          numberOfLines={12}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TouchableOpacity
          onPress={clearAll}
          style={[styles.clearBtn, { borderColor: colors.destructive }]}
        >
          <Feather name="trash-2" size={14} color={colors.destructive} />
          <Text style={{ color: colors.destructive, fontSize: 13 }}>Clear All</Text>
        </TouchableOpacity>
      </SectionCard>
    </ModalSheet>
  );
}

const styles = StyleSheet.create({
  textarea: {
    borderWidth: 1,
    borderRadius: 6,
    padding: 10,
    fontSize: 12,
    minHeight: 200,
    textAlignVertical: "top",
    fontFamily: "monospace",
  },
  clearBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    padding: 8,
    marginTop: 8,
    borderWidth: 1,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
});
