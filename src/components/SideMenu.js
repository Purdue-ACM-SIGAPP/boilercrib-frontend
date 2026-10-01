import React from "react";
import { Modal, Pressable, ScrollView, View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Button from "./Button";
import { colors, spacing } from "../theme";

/**
 * Right-side sidebar of buttons.
 * items: [{ title, icon, onPress }]
 */
export default function SideMenu({ visible, onClose, items }) {
  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <View style={styles.container}>
        <Pressable style={styles.backdrop} accessibilityLabel="Close menu" onPress={onClose} />
        <SafeAreaView style={styles.panel} edges={["top", "bottom", "right"]}>
          <Button icon="close" variant="ghost" accessibilityLabel="Close menu" style={styles.close} onPress={onClose} />
          <ScrollView contentContainerStyle={styles.items}>
            {items.map((item) => (
              <Button
                key={item.title}
                title={item.title}
                icon={item.icon}
                variant="ghost"
                onPress={() => {
                  onClose();
                  item.onPress();
                }}
              />
            ))}
          </ScrollView>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, flexDirection: "row" },
  backdrop: { flex: 1, backgroundColor: colors.overlay },
  panel: { width: "75%", maxWidth: 320, backgroundColor: colors.surface },
  close: { alignSelf: "flex-end", margin: spacing.sm },
  items: { padding: spacing.sm, gap: spacing.xs },
});
