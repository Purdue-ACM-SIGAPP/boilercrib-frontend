import React from "react";
import { Text, View, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Screen from "../components/Screen";
import ScreenHeader from "../components/ScreenHeader";
import Button from "../components/Button";
import ROUTES from "../navigation/routes";
import { colors, spacing, textStyles } from "../theme";

// Tokens your theme may not define: fall back to neutral values.
const surface = colors.surface ?? "#FFFFFF";
const border = colors.border ?? "#E5E7EB";
const soft = "#F1F2F4";

const NEXT_STEPS = [
  "Admins review the report, validate reproduction steps, and assign it to the correct team.",
  "You can track the status of this report from the status tracking screen.",
];

export default function BugReportSubmitted({ navigation, route }) {
  const { reference = "BR-0000", category = "—", severity = "—" } = route.params ?? {};

  const goDone = () => navigation.navigate(ROUTES.TABS, { screen: ROUTES.PROFILE });

  return (
    <Screen scroll>
      <ScreenHeader title="Report submitted" showBack={false} />
      <Text style={styles.subtitle}>
        Your report has been sent to the admin queue and is ready for review.
      </Text>

      <View style={[styles.card, styles.summary]}>
        <View style={styles.iconCircle}>
          <MaterialCommunityIcons name="check-circle-outline" size={24} color={colors.primary} />
        </View>
        <View style={styles.summaryText}>
          <Text style={styles.summaryTitle}>Report {reference} received</Text>
          <Text style={styles.caption}>
            Category: {category} · Severity: {severity}
          </Text>
        </View>
      </View>

      <Text style={styles.label}>What happens next</Text>
      {NEXT_STEPS.map((step) => (
        <View key={step} style={[styles.card, styles.step]}>
          <MaterialCommunityIcons name="check-circle-outline" size={18} color={colors.primary} />
          <Text style={styles.stepText}>{step}</Text>
        </View>
      ))}

      <View style={styles.footer}>
        <Text style={styles.reference}>Reference number {reference}</Text>
        <Button title="Done" onPress={goDone} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  subtitle: { ...textStyles.caption, color: colors.textMuted, marginBottom: spacing.md },
  card: {
    backgroundColor: surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: border,
    padding: spacing.md,
  },
  summary: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: soft,
    alignItems: "center",
    justifyContent: "center",
  },
  summaryText: { flex: 1 },
  summaryTitle: { ...textStyles.body, fontWeight: "700" },
  caption: { ...textStyles.caption, color: colors.textMuted, marginTop: 2 },
  label: { ...textStyles.body, fontWeight: "700", marginTop: spacing.lg, marginBottom: spacing.sm },
  step: { flexDirection: "row", alignItems: "flex-start", gap: spacing.sm, marginBottom: spacing.sm },
  stepText: { ...textStyles.body, flex: 1 },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
  },
  reference: { ...textStyles.caption, color: colors.textMuted, flex: 1 },
});
