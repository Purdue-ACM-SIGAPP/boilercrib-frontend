import React, { useCallback, useState } from "react";
import { Image, Text, View, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Screen from "../components/Screen";
import ScreenHeader from "../components/ScreenHeader";
import AsyncView from "../components/AsyncView";
import EmptyView from "../components/EmptyView";
import Card from "../components/Card";
import Button from "../components/Button";
import StarRating from "../components/StarRating";
import ReviewCard from "../components/ReviewCard";
import ReviewForm from "../components/ReviewForm";
import useAsync from "../hooks/useAsync";
import useSubmit from "../hooks/useSubmit";
import { getBuilding } from "../api/buildings";
import { createReview, deleteReview, flagReview, getAverageRating, getBuildingReviews } from "../api/reviews";
import { getUserDistance } from "../api/maps";
import { useSession } from "../context/SessionContext";
import { CAMPUS_CENTER } from "../constants/campus";
import { buildingLabel, formatRating, imageUri } from "../utils/format";
import ROUTES from "../navigation/routes";
import { colors, sizes, radii, spacing, textStyles } from "../theme";
import HouseDetails from "../components/HouseDetails.js"

const byNewest = (a, b) => new Date(b.createdAt ?? 0) - new Date(a.createdAt ?? 0);

function distanceText({ data, loading, error }) {
  if (loading) return "Calculating distance…";
  if (error || !data) return "Distance unavailable";
  return `${data.distance} · ${data.duration} walk from the Union`;
}

export default function BuildingDetailScreen({ navigation, route }) {
  const { id } = route.params ?? {};
  const { userId } = useSession();

  const building = useAsync(() => getBuilding(id), [id]);
  const average = useAsync(() => getAverageRating(id), [id]);
  const reviews = useAsync(async () => (await getBuildingReviews(id)).sort(byNewest), [id]);
  const distance = useAsync(() => getUserDistance({ buildingId: id, ...CAMPUS_CENTER }), [id]);

  const post = useSubmit(
    useCallback(
      (values) =>
        createReview({
          ...values,
          buildingId: id,
          userId: userId ?? undefined,
          createdAt: new Date().toISOString(),
          likeCount: 0,
          dislikeCount: 0,
          flagged: false,
        }),
      [id, userId]
    )
  );
  const flag = useSubmit(flagReview);
  const remove = useSubmit(deleteReview);
  const [pendingId, setPendingId] = useState(null);

  const refreshReviews = () => {
    reviews.refetch();
    average.refetch();
  };

  const handlePost = async (values) => {
    const ok = await post.submit(values);
    if (ok) refreshReviews();
    return ok;
  };

  const handleFlag = async (review) => {
    setPendingId(review.id);
    if (await flag.submit(review.id)) {
      reviews.setData((list) => list.map((r) => (r.id === review.id ? { ...r, flagged: true } : r)));
    }
    setPendingId(null);
  };

  const handleDelete = async (review) => {
    setPendingId(review.id);
    if (await remove.submit(review.id)) refreshReviews();
    setPendingId(null);
  };

  if (!id) {
    return (
      <Screen>
        <ScreenHeader title="Building" />
        <EmptyView message="No building selected." icon="office-building-outline" />
      </Screen>
    );
  }

  const actionError = flag.error || remove.error;

  return (
    <Screen scroll>
      <ScreenHeader title={building.data ? buildingLabel(building.data) : "Building"} subtitle={building.data?.address} />
      <AsyncView state={building} loadingMessage="Loading building…">
        {(b) => (
          <>
            {imageUri(b.image) ? <Image source={{ uri: imageUri(b.image) }} style={styles.hero} /> : null}

            <Card variant="secondary">
              <View style={styles.ratingRow}>
                <StarRating rating={average.data ?? 0} />
                <Text style={styles.ratingText}>{average.loading ? "Loading rating…" : formatRating(average.data)}</Text>
              </View>
              {reviews.data ? (
                <Text style={styles.meta}>
                  {reviews.data.length} review{reviews.data.length === 1 ? "" : "s"}
                </Text>
              ) : null}
              <View style={styles.distanceRow}>
                <MaterialCommunityIcons name="walk" size={sizes.iconSm} color={colors.primary} />
                <Text style={styles.meta}>{distanceText(distance)}</Text>
              </View>
              <Button
                title="Show on map"
                icon="directions"
                size="sm"
                style={styles.mapButton}
                disabled={b.latitude == null || b.longitude == null}
                onPress={() => navigation.navigate(ROUTES.MAP, { latitude: b.latitude, longitude: b.longitude })}
              />
              <Button
                title="Housing Details"
                icon="empty_star.jpg"
                onPress={() => navigation.navigate("HouseDetails", {id: item.id})}
              />
            </Card>

            <Text style={styles.sectionTitle}>Write a review</Text>
            <ReviewForm onSubmit={handlePost} submitting={post.submitting} error={post.error} />

            <Text style={styles.sectionTitle}>Reviews</Text>
            {actionError ? <Text style={styles.error}>{actionError}</Text> : null}
            <AsyncView state={reviews} emptyMessage="No reviews yet. Be the first!" emptyIcon="comment-outline">
              {(list) =>
                list.map((review) => (
                  <ReviewCard
                    key={review.id}
                    review={review}
                    onFlag={() => handleFlag(review)}
                    flagging={flag.submitting && pendingId === review.id}
                    onDelete={userId && review.userId === userId ? () => handleDelete(review) : undefined}
                    deleting={remove.submitting && pendingId === review.id}
                  />
                ))
              }
            </AsyncView>
          </>
        )}
      </AsyncView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    width: "100%",
    aspectRatio: 16 / 9,
    borderRadius: radii.md,
    marginBottom: spacing.md,
    backgroundColor: colors.secondary,
  },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  ratingText: { ...textStyles.subheading, color: colors.text },
  meta: { ...textStyles.caption, color: colors.textMuted },
  distanceRow: { flexDirection: "row", alignItems: "center", gap: spacing.xs, marginTop: spacing.xs },
  mapButton: { marginTop: spacing.md },
  sectionTitle: { ...textStyles.heading, color: colors.primary, marginTop: spacing.lg, marginBottom: spacing.sm },
  error: { ...textStyles.caption, color: colors.warning, marginBottom: spacing.sm },
});
