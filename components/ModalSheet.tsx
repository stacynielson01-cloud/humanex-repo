import { Feather } from "@expo/vector-icons";
import React from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

interface ModalSheetProps {
  visible: boolean;
  title: string;
  onClose: () => void;
  onSave?: () => void;
  children: React.ReactNode;
}

export function ModalSheet({ visible, title, onClose, onSave, children }: ModalSheetProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: colors.background }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={[styles.header, { borderBottomColor: colors.border, paddingTop: insets.top + 12 }]}>
          <TouchableOpacity onPress={onClose} style={styles.headerBtn}>
            <Feather name="x" size={20} color={colors.mutedForeground} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.foreground }]}>{title}</Text>
          {onSave ? (
            <TouchableOpacity onPress={onSave} style={[styles.saveBtn, { backgroundColor: colors.primary }]}>
              <Text style={[styles.saveBtnText, { color: colors.primaryForeground }]}>Save</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.headerBtn} />
          )}
        </View>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 20 }]}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  headerBtn: { width: 60 },
  title: { fontSize: 16, fontWeight: "700", flex: 1, textAlign: "center" },
  saveBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 8, width: 60, alignItems: "center" },
  saveBtnText: { fontSize: 14, fontWeight: "600" },
  content: { padding: 16 },
});
