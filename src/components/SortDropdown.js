import React, { useState } from "react";
import { Modal, Pressable, Text, View, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Button from "./Button";
import { colors, fontWeights, radii, shadows, sizes, spacing, textStyles } from "../theme";

// Multi-select: `options` is [{ key, label, group? }] and `values` the selected keys in priority order.
// Picking an option removes any other selected option in the same `group`.
export default function SortDropdown({ options, values, onChange, label = "Sort by" }) {
  const [open, setOpen] = useState(false);
  const labelFor = (key) => options.find((o) => o.key === key)?.label;
  const summary = values.length
    ? `${labelFor(values[0])}${values.length > 1 ? ` +${values.length - 1}` : ""}`
    : "None";

  const toggle = (key) => {
    if (values.includes(key)) {
      onChange(values.filter((k) => k !== key));
      return;
    }
    const { group } = options.find((o) => o.key === key);
    const rivals = group ? options.filter((o) => o.group === group).map((o) => o.key) : [];
    onChange([...values.filter((k) => !rivals.includes(k)), key]);
  };

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${values.map(labelFor).join(", ") || "None"}`}
        onPress={() => setOpen(true)}
        style={({ pressed }) => [styles.trigger, pressed && styles.pressed]}
      >
        <Text style={styles.triggerLabel}>{label}:</Text>
        <Text style={styles.triggerValue}>{summary}</Text>
        <MaterialCommunityIcons name="chevron-down" size={sizes.iconSm} color={colors.primary} />
      </Pressable>

      <Modal transparent animationType="fade" visible={open} onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.overlay} onPress={() => setOpen(false)}>
          {/* Claims touches so taps on the menu's empty space don't reach the overlay and close it. */}
          <View style={styles.menu} accessibilityRole="menu" onStartShouldSetResponder={() => true}>
            <Text style={styles.menuTitle}>{label}</Text>
            <Text style={styles.menuHint}>Pick one or more — the first one picked counts most.</Text>
            {options.map(({ key, label: optionLabel }) => {
              const isSelected = values.includes(key);
              return (
                <Pressable
                  key={key}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: isSelected }}
                  onPress={() => toggle(key)}
                  style={({ pressed }) => [styles.option, isSelected && styles.optionSelected, pressed && styles.pressed]}
                >
                  <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>{optionLabel}</Text>
                  {isSelected ? <MaterialCommunityIcons name="check" size={sizes.iconSm} color={colors.primary} /> : null}
                </Pressable>
              );
            })}
            <Button title="Done" size="sm" onPress={() => setOpen(false)} style={styles.done} />
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    minHeight: 36,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.surface,
  },
  pressed: { opacity: 0.8 },
  triggerLabel: { ...textStyles.caption, color: colors.textMuted },
  triggerValue: { ...textStyles.caption, fontWeight: fontWeights.medium, color: colors.primary },
  overlay: { flex: 1, backgroundColor: colors.overlay, alignItems: "center", justifyContent: "center", padding: spacing.lg },
  menu: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    paddingVertical: spacing.md,
    ...shadows.md,
  },
  menuTitle: { ...textStyles.subheading, color: colors.text, paddingHorizontal: spacing.lg },
  menuHint: { ...textStyles.caption, color: colors.textMuted, paddingHorizontal: spacing.lg, marginBottom: spacing.sm },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 44,
    paddingHorizontal: spacing.lg,
  },
  optionSelected: { backgroundColor: colors.secondary },
  optionText: { ...textStyles.body, color: colors.text },
  optionTextSelected: { fontWeight: fontWeights.medium, color: colors.primary },
  done: { alignSelf: "flex-end", marginTop: spacing.sm, marginHorizontal: spacing.lg },
});
