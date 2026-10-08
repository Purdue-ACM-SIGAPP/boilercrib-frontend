import React, { useMemo, useState } from "react";
import { FlatList, StyleSheet } from "react-native";
import Screen from "../components/Screen";
import ScreenHeader from "../components/ScreenHeader";
import AsyncView from "../components/AsyncView";
import BuildingCard from "../components/BuildingCard";
import SortDropdown from "../components/SortDropdown";
import useAsync from "../hooks/useAsync";
import useFavorites from "../hooks/useFavorites";
import { getBuildings } from "../api/buildings";
import { getAverageRating } from "../api/reviews";
import { CAMPUS_CENTER } from "../constants/campus";
import ROUTES from "../navigation/routes";
import { spacing } from "../theme";

// Several sorts can be active at once; options sharing a `group` are mutually exclusive.
const SORTS = [
  { key: "favorites", label: "⭐ Favorites" },
  { key: "name", label: "Name A-Z" },
  { key: "rating", label: "Top Rated" },
  { key: "priceAsc", label: "Price Low to High", group: "price" },
  { key: "priceDesc", label: "Price High to Low", group: "price" },
  { key: "proximity", label: "Proximity to Class" },
];

// Cheapest room cost, or null when the building has no room pricing.
function lowestPrice(building) {
  const costs = (building.rooms ?? []).map((r) => r.cost).filter((c) => c != null);
  return costs.length ? Math.min(...costs) : null;
}

// Straight-line distance from central campus (no class locations exist yet); null without coordinates.
function distanceFromCampus({ latitude, longitude }) {
  if (latitude == null || longitude == null) return null;
  return Math.hypot(latitude - CAMPUS_CENTER.latitude, (longitude - CAMPUS_CENTER.longitude) * Math.cos((latitude * Math.PI) / 180));
}

// Sorts by value (descending when desc), keeping buildings with no value at the end.
const byValue = (valueOf, desc = false) => (a, b) => {
  const va = valueOf(a);
  const vb = valueOf(b);
  if (va == null || vb == null) return (va == null) - (vb == null);
  return desc ? vb - va : va - vb;
};

const byName = (a, b) => (a.name ?? "").localeCompare(b.name ?? "");

export default function BuildingListScreen({ navigation }) {
  // Active sort keys in priority order (first picked wins; later ones break ties).
  const [sortBy, setSortBy] = useState(["name"]);
  const buildings = useAsync(() => getBuildings(), []);
  const { favorites, toggleFavorite } = useFavorites();

  // { [buildingId]: average (1–10) | null }; unrated or failed lookups are null.
  const ratings = useAsync(async () => {
    const entries = await Promise.all(
      (buildings.data ?? []).map((b) => getAverageRating(b.id).then((avg) => [b.id, avg], () => [b.id, null]))
    );
    return Object.fromEntries(entries);
  }, [buildings.data]);

  const sorted = useMemo(() => {
    const byRating = ratings.data ?? {};
    const comparators = {
      name: byName,
      rating: byValue((b) => byRating[b.id], true),
      priceAsc: byValue(lowestPrice),
      priceDesc: byValue(lowestPrice, true),
      proximity: byValue(distanceFromCampus),
      // Favorites first; non-favorites count as missing so they follow in name order.
      favorites: byValue((b) => (favorites.has(b.id) ? 0 : null)),
    };
    // Name order first so ties and buildings missing data stay alphabetical.
    const list = [...(buildings.data ?? [])].sort(byName);
    return list.sort((a, b) => {
      for (const key of sortBy) {
        const result = comparators[key](a, b);
        if (result) return result;
      }
      return 0;
    });
  }, [buildings.data, ratings.data, sortBy, favorites]);

  const renderItem = ({ item }) => (
    <BuildingCard
      building={item}
      rating={ratings.data ? ratings.data[item.id] ?? null : undefined}
      favorite={favorites.has(item.id)}
      onToggleFavorite={() => toggleFavorite(item.id)}
      onPress={() => navigation.navigate(ROUTES.BUILDING_DETAIL, { id: item.id })}
      onDirections={() => navigation.navigate(ROUTES.MAP, { latitude: item.latitude, longitude: item.longitude })}
    />
  );

  return (
    <Screen>
      <ScreenHeader title="Buildings" showBack={false} />
      <SortDropdown options={SORTS} values={sortBy} onChange={setSortBy} />
      <AsyncView state={buildings} loadingMessage="Loading buildings…" emptyMessage="No buildings yet." emptyIcon="office-building-outline">
        {() => (
          <FlatList
            data={sorted}
            extraData={favorites}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            refreshing={buildings.loading}
            onRefresh={buildings.refetch}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          />
        )}
      </AsyncView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { paddingBottom: spacing.lg },
});
