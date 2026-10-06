import React from "react";
import { Text, View, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Card from "./Card";
import Tag from "./Tag";
import { roommateSummary } from "../utils/roommates";
import { colors, sizes, fontWeights, radii, spacing, textStyles } from "../theme";

const MAX_TAGS = 4;

// `match`: a compatibility() result, or null when the viewer has no bio to compare against.
export default function RoommateCard({ bio, match, onPress }) {
  const shared = new Set((match?.sharedInterests ?? []).map((i) => i.toLowerCase()));
  const interests = bio.interests ?? [];
  const summary = roommateSummary(bio);

  return (
    <Card onPress={onPress} accessibilityLabel={bio.name}>
      <View style={styles.row}>
        <MaterialCommunityIcons name="account-circle" size={sizes.iconXl} color={colors.primary} />
        <View style={styles.info}>
          <Text style={styles.name}>{bio.name}</Text>
          {summary ? <Text style={styles.meta}>{summary}</Text> : null}
          {bio.gender ? <Text style={styles.meta}>{bio.gender}</Text> : null}
        </View>
        {match ? (
          <View style={styles.match} accessibilityLabel={`${match.score}% match`}>
            <Text style={styles.matchScore}>{match.score}%</Text>
            <Text style={styles.matchLabel}>match</Text>
          </View>
        ) : null}
      </View>
      {bio.bio ? (
        <Text style={styles.bio} numberOfLines={2}>
          {bio.bio}
        </Text>
      ) : null}
      {interests.length ? (
        <View style={styles.tags}>
          {interests.slice(0, MAX_TAGS).map((interest) => (
            <Tag key={interest} label={interest} highlighted={shared.has(interest.toLowerCase())} />
          ))}
          {interests.length > MAX_TAGS ? <Tag label={`+${interests.length - MAX_TAGS}`} /> : null}
        </View>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  info: { flex: 1, gap: spacing.xxs },
  name: { ...textStyles.subheading, color: colors.primary },
  meta: { ...textStyles.caption, color: colors.textMuted },
  match: {
    alignItems: "center",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.sm,
    backgroundColor: colors.secondary,
  },
  matchScore: { ...textStyles.subheading, color: colors.primary },
  matchLabel: { ...textStyles.small, fontWeight: fontWeights.medium, color: colors.primaryDark },
  bio: { ...textStyles.body, color: colors.text, marginTop: spacing.sm },
  tags: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs, marginTop: spacing.sm },
});
