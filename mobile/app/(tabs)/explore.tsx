import { Image } from "expo-image";
import { StatusBar } from "expo-status-bar";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  EXPLORE_FEATURED,
  EXPLORE_GRID,
  type ExploreCategoryFilter,
  exploreGridMatches,
  showExploreFeatured,
} from "../../src/data/demoContent";
import { colors, fontFamily, radii } from "../../src/theme/tokens";

const TAB_BAR_SPACE = 120;
const CATS: ExploreCategoryFilter[] = ["All", "Spa", "Dining", "Shows"];

export default function ExploreScreen() {
  const insets = useSafeAreaInsets();
  const [category, setCategory] = useState<ExploreCategoryFilter>("All");

  const filteredGrid = useMemo(
    () => EXPLORE_GRID.filter((item) => exploreGridMatches(category, item)),
    [category]
  );

  const showFeatured = showExploreFeatured(category);

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Text style={styles.hTitle}>Experiences</Text>
        <Pressable
          style={({ pressed }) => [styles.filterBtn, pressed && styles.pressed]}
          onPress={() => setCategory("All")}
        >
          <Text style={styles.filterText}>Filter</Text>
        </Pressable>
      </View>

      <View style={styles.catStrip}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.catRow}
          bounces={false}
        >
          {CATS.map((c) => {
            const on = c === category;
            return (
              <Pressable
                key={c}
                onPress={() => setCategory(c)}
                style={({ pressed }) => [
                  styles.catChip,
                  on && styles.catChipOn,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={[styles.catLabel, on && styles.catLabelOn]}>{c}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: TAB_BAR_SPACE + insets.bottom }]}
        showsVerticalScrollIndicator={false}
      >
        {showFeatured ? (
          <>
            <Text style={styles.featLabel}>FEATURED</Text>
            <View style={styles.featuredCard}>
              <Image
                source={{ uri: EXPLORE_FEATURED.imageUrl }}
                style={styles.featHero}
                contentFit="cover"
                transition={200}
              />
              <View style={styles.featInfo}>
                <Text style={styles.featTag}>{EXPLORE_FEATURED.tag}</Text>
                <Text style={styles.featTitle}>{EXPLORE_FEATURED.title}</Text>
                <Text style={styles.featDesc}>{EXPLORE_FEATURED.desc}</Text>
              </View>
            </View>
          </>
        ) : null}

        <Text style={styles.gridLabel}>
          {category === "All" ? "ALL EXPERIENCES" : `${category.toUpperCase()} EXPERIENCES`}
        </Text>
        {filteredGrid.length === 0 ? (
          <Text style={styles.empty}>No experiences in this category. Try All or another filter.</Text>
        ) : (
          <View style={styles.grid}>
            {filteredGrid.map((item) => (
              <View key={item.name} style={styles.gridCard}>
                <Image
                  source={{ uri: item.imageUrl }}
                  style={styles.gridImg}
                  contentFit="cover"
                  transition={200}
                />
                <View style={styles.gridInfo}>
                  <Text style={styles.gridTag}>{item.tag}</Text>
                  <Text style={styles.gridName}>{item.name}</Text>
                  <Text style={styles.gridPrice}>{item.price}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surfacePrimary },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingBottom: 8,
  },
  hTitle: {
    fontFamily: fontFamily.semibold,
    fontSize: 26,
    color: colors.foregroundPrimary,
  },
  filterBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    backgroundColor: colors.surfaceCard,
  },
  filterText: {
    fontFamily: fontFamily.medium,
    fontSize: 14,
    color: colors.accentPrimary,
  },
  pressed: { opacity: 0.85 },
  /** Fixed-height strip so horizontal chips are never clipped */
  catStrip: {
    minHeight: 52,
    maxHeight: 52,
    marginBottom: 12,
    justifyContent: "center",
  },
  catRow: {
    paddingHorizontal: 24,
    paddingVertical: 6,
    alignItems: "center",
    gap: 10,
    flexDirection: "row",
  },
  catChip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    backgroundColor: colors.surfaceCard,
  },
  catChipOn: {
    backgroundColor: colors.accentPrimary,
    borderColor: colors.accentPrimary,
  },
  catLabel: {
    fontFamily: fontFamily.medium,
    fontSize: 13,
    color: colors.foregroundSecondary,
  },
  catLabelOn: { color: colors.foregroundInverse },
  scroll: { paddingHorizontal: 24 },
  featLabel: {
    fontFamily: fontFamily.medium,
    fontSize: 11,
    letterSpacing: 1.2,
    color: colors.foregroundMuted,
    marginBottom: 10,
  },
  featuredCard: {
    borderRadius: radii.lg,
    overflow: "hidden",
    marginBottom: 28,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  featHero: { height: 160, width: "100%", backgroundColor: colors.borderSubtle },
  featInfo: { padding: 16, backgroundColor: colors.surfaceCard },
  featTag: {
    fontFamily: fontFamily.medium,
    fontSize: 10,
    letterSpacing: 1,
    color: colors.accentPrimary,
    marginBottom: 4,
  },
  featTitle: {
    fontFamily: fontFamily.semibold,
    fontSize: 18,
    color: colors.foregroundPrimary,
  },
  featDesc: {
    fontFamily: fontFamily.regular,
    fontSize: 14,
    color: colors.foregroundSecondary,
    marginTop: 6,
    lineHeight: 20,
  },
  gridLabel: {
    fontFamily: fontFamily.medium,
    fontSize: 11,
    letterSpacing: 1.2,
    color: colors.foregroundMuted,
    marginBottom: 12,
  },
  empty: {
    fontFamily: fontFamily.regular,
    fontSize: 14,
    color: colors.foregroundMuted,
    lineHeight: 20,
    marginBottom: 16,
  },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  gridCard: {
    width: "47%",
    flexGrow: 1,
    maxWidth: "48%",
    borderRadius: radii.md,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  gridImg: { height: 96, width: "100%", backgroundColor: colors.borderSubtle },
  gridInfo: { padding: 10, backgroundColor: colors.surfaceCard },
  gridTag: {
    fontFamily: fontFamily.medium,
    fontSize: 9,
    letterSpacing: 0.8,
    color: colors.accentPrimary,
    marginBottom: 4,
  },
  gridName: {
    fontFamily: fontFamily.semibold,
    fontSize: 13,
    color: colors.foregroundPrimary,
    lineHeight: 18,
  },
  gridPrice: {
    fontFamily: fontFamily.regular,
    fontSize: 12,
    color: colors.foregroundSecondary,
    marginTop: 4,
  },
});
