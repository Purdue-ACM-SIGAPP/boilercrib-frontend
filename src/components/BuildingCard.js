import React from "react";
import { Image, Pressable, Text, View, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Card from "./Card";
import Button from "./Button";
import StarRating from "./StarRating";
import { buildingLabel, formatRating, imageUri } from "../utils/format";
import { colors, sizes, fontWeights, radii, spacing, textStyles } from "../theme";

// `rating`: 1–10 average, null when unrated, undefined while loading.
// The heart only shows when `onToggleFavorite` is passed.
export default function BuildingCard({ building, rating, onPress, onDirections, favorite = false, onToggleFavorite }) {
  const uri = imageUri(building.image);
  const hasLocation = building.latitude != null && building.longitude != null;

  return (
    <Card onPress={onPress} accessibilityLabel={buildingLabel(building)}>
      <View style={styles.row}>
        {uri ? (
          <Image source={{ uri }} style={styles.image} accessibilityIgnoresInvertColors />
        ) : (
          <View style={[styles.image, styles.placeholder]}>
            <MaterialCommunityIcons name="office-building-outline" size={sizes.iconLg} color={colors.primary} />
          </View>
        )}
        <View style={styles.info}>
          <Text style={styles.name}>{buildingLabel(building)}</Text>
          {building.address ? <Text style={styles.address}>{building.address}</Text> : null}
          <View style={styles.ratingRow}>
            {rating != null ? <StarRating rating={rating} size={sizes.iconSm} /> : null}
            <Text style={styles.ratingText}>{rating === undefined ? "Loading rating…" : formatRating(rating)}</Text>
          </View>
        </View>
        {onToggleFavorite ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={favorite ? "Remove from favorites" : "Add to favorites"}
            accessibilityState={{ selected: favorite }}
            hitSlop={spacing.sm}
            onPress={onToggleFavorite}
          >
            <MaterialCommunityIcons name={favorite ? "heart" : "heart-outline"} size={sizes.iconMd} color={colors.primary} />
          </Pressable>
        ) : null}
      </View>
      {onDirections ? (
        <Button
          title="Directions"
          icon="directions"
          variant="outline"
          size="sm"
          disabled={!hasLocation}
          onPress={onDirections}
          style={styles.directions}
        />
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: spacing.md },
  image: { width: sizes.thumbnail, height: sizes.thumbnail, borderRadius: radii.sm, backgroundColor: colors.secondary },
  placeholder: { alignItems: "center", justifyContent: "center" },
  info: { flex: 1, gap: spacing.xs },
  name: { ...textStyles.subheading, color: colors.primary },
  address: { ...textStyles.caption, color: colors.textMuted },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: spacing.xs, flexWrap: "wrap" },
  ratingText: { ...textStyles.small, fontWeight: fontWeights.medium, color: colors.text },
  directions: { alignSelf: "flex-end", marginTop: spacing.sm },
});
