import React, { useMemo, useState } from "react";
import { Linking, Text, View, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Screen from "../components/Screen";
import ScreenHeader from "../components/ScreenHeader";
import AsyncView from "../components/AsyncView";
import Card from "../components/Card";
import Button from "../components/Button";
import Tag from "../components/Tag";
import useAsync from "../hooks/useAsync";
import useRefetchOnFocus from "../hooks/useRefetchOnFocus";
import { getRoommate, getUserRoommate } from "../api/roommates";
import { getBuildings } from "../api/buildings";
import { useSession } from "../context/SessionContext";
import { compatibility, contactLink, roommateSummary } from "../utils/roommates";
import { buildingLabel } from "../utils/format";
import ROUTES from "../navigation/routes";
import { colors, sizes, fontWeights, spacing, textStyles } from "../theme";

export default function RoommateDetailScreen({ navigation, route }) {
  const { id } = route.params ?? {};
  const { userId } = useSession();
  const bio = useAsync(() => getRoommate(id), [id]);
  const myBio = useAsync(() => (userId ? getUserRoommate(userId) : Promise.resolve(null)), [userId]);
  const buildings = useAsync(() => getBuildings(), []);
  useRefetchOnFocus(bio.refetch);
  const [showContact, setShowContact] = useState(false);

  const buildingNames = useMemo(() => {
    const byId = Object.fromEntries((buildings.data ?? []).map((b) => [b.id, buildingLabel(b)]));
    return (bio.data?.preferredBuildingIds ?? []).map((buildingId) => byId[buildingId]).filter(Boolean);
  }, [buildings.data, bio.data]);

  // Reveals the contact info, and opens it in the mail or phone app when it's an email, number, or link.
  const handleContact = () => {
    setShowContact(true);
    const link = contactLink(bio.data?.contactInfo);
    if (link) Linking.openURL(link).catch(() => {});
  };

  return (
    <Screen scroll>
      <ScreenHeader title="Roommate" />
      <AsyncView state={bio} loadingMessage="Loading profile…">
        {(b) => {
          const isMine = Boolean(userId) && b.userId === userId;
          const match = isMine ? null : compatibility(myBio.data, b);
          const shared = new Set((match?.sharedInterests ?? []).map((i) => i.toLowerCase()));
          const summary = roommateSummary(b);

          return (
            <>
              <Card variant="primary">
                <View style={styles.headerRow}>
                  <MaterialCommunityIcons name="account-circle" size={sizes.iconXl} color={colors.secondary} />
                  <View style={styles.headerInfo}>
                    <Text style={styles.name}>{b.name}</Text>
                    {summary ? <Text style={styles.headerMeta}>{summary}</Text> : null}
                    {b.gender ? <Text style={styles.headerMeta}>{b.gender}</Text> : null}
                  </View>
                </View>
              </Card>

              {match ? (
                <Card variant="secondary">
                  <Text style={styles.score}>{match.score}% match</Text>
                  {match.reasons.length ? (
                    match.reasons.map((reason) => (
                      <View key={reason} style={styles.reasonRow}>
                        <MaterialCommunityIcons name="check-circle-outline" size={sizes.iconSm} color={colors.primary} />
                        <Text style={styles.reason}>{reason}</Text>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.body}>You don't share any interests, year, major, or buildings yet.</Text>
                  )}
                </Card>
              ) : null}

              <Text style={styles.sectionTitle}>About</Text>
              <Text style={styles.body}>{b.bio || "No bio yet."}</Text>

              <Text style={styles.sectionTitle}>Interests</Text>
              {b.interests?.length ? (
                <View style={styles.tags}>
                  {b.interests.map((interest) => (
                    <Tag key={interest} label={interest} highlighted={shared.has(interest.toLowerCase())} />
                  ))}
                </View>
              ) : (
                <Text style={styles.muted}>None listed.</Text>
              )}

              <Text style={styles.sectionTitle}>Wants to live in</Text>
              {buildingNames.length ? (
                buildingNames.map((label) => (
                  <View key={label} style={styles.reasonRow}>
                    <MaterialCommunityIcons name="office-building-outline" size={sizes.iconSm} color={colors.primary} />
                    <Text style={styles.body}>{label}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.muted}>No preference.</Text>
              )}

              <View style={styles.actions}>
                {isMine ? (
                  <Button
                    title="Edit my bio"
                    icon="pencil-outline"
                    size="lg"
                    fullWidth
                    onPress={() => navigation.navigate(ROUTES.ROOMMATE_FORM)}
                  />
                ) : b.contactInfo ? (
                  <>
                    <Button title="Contact" icon="message-outline" size="lg" fullWidth onPress={handleContact} />
                    {showContact ? <Text style={styles.contact}>{b.contactInfo}</Text> : null}
                  </>
                ) : (
                  <Button title="No contact info" size="lg" fullWidth disabled />
                )}
              </View>
            </>
          );
        }}
      </AsyncView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  headerInfo: { flex: 1, gap: spacing.xxs },
  name: { ...textStyles.title, color: colors.textLight },
  headerMeta: { ...textStyles.body, color: colors.secondary },
  score: { ...textStyles.heading, color: colors.primary, marginBottom: spacing.sm },
  reasonRow: { flexDirection: "row", alignItems: "center", gap: spacing.xs, marginTop: spacing.xs },
  reason: { ...textStyles.body, color: colors.text, flexShrink: 1 },
  sectionTitle: { ...textStyles.subheading, color: colors.primary, marginTop: spacing.md, marginBottom: spacing.sm },
  body: { ...textStyles.body, color: colors.text },
  muted: { ...textStyles.body, color: colors.textMuted },
  tags: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs },
  actions: { marginTop: spacing.lg, gap: spacing.sm },
  contact: { ...textStyles.body, fontWeight: fontWeights.semibold, color: colors.primary, textAlign: "center" },
});
