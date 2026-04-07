import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { HOTEL_DETAILS } from "../../src/data/demoContent";
import { colors, fontFamily, radii } from "../../src/theme/tokens";

export default function HotelDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const hotel = HOTEL_DETAILS[id ?? ""] ?? HOTEL_DETAILS["caesars-palace"];

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar style="light" />
      <View style={styles.hero}>
        <Image source={{ uri: hotel.heroImageUrl }} style={styles.heroBlock} contentFit="cover" transition={300} />
        <View style={styles.heroNav}>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}
          >
            <Ionicons name="chevron-back" size={24} color={colors.foregroundInverse} />
          </Pressable>
          <Pressable style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}>
            <Ionicons name="heart-outline" size={22} color={colors.foregroundInverse} />
          </Pressable>
        </View>
      </View>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.titleRow}>
          <View style={styles.titleCol}>
            <Text style={styles.hotelName}>{hotel.name}</Text>
            <View style={styles.locRow}>
              <Ionicons name="location-outline" size={16} color={colors.foregroundSecondary} />
              <Text style={styles.locText}>{hotel.location}</Text>
            </View>
          </View>
          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={14} color={colors.accentLight} />
            <Text style={styles.ratingText}>{hotel.rating}</Text>
          </View>
        </View>
        <View style={styles.priceRow}>
          <Text style={styles.priceText}>${hotel.pricePerNight}</Text>
          <Text style={styles.perNight}> / night</Text>
        </View>
        <View style={styles.divider} />
        <Text style={styles.amenitiesLabel}>AMENITIES</Text>
        <View style={styles.amenities}>
          {hotel.amenities.map((a) => (
            <View key={a} style={styles.amenityChip}>
              <Text style={styles.amenityText}>{a}</Text>
            </View>
          ))}
        </View>
        <View style={styles.divider} />
        <Text style={styles.descLabel}>ABOUT</Text>
        <Text style={styles.descText}>{hotel.about}</Text>
        <Text style={styles.roomLabel}>SELECT ROOM</Text>
        {hotel.rooms.map((r) => (
          <View key={r.name} style={styles.roomRow}>
            <Image source={{ uri: r.imageUrl }} style={styles.roomThumb} contentFit="cover" />
            <View style={styles.roomInfo}>
              <Text style={styles.roomName}>{r.name}</Text>
              <Text style={styles.roomPrice}>${r.price} / night</Text>
            </View>
          </View>
        ))}
      </ScrollView>
      <View style={[styles.bookBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <View>
          <Text style={styles.bookLabel}>From</Text>
          <Text style={styles.bookPrice}>
            ${hotel.pricePerNight} / night
          </Text>
        </View>
        <Pressable style={({ pressed }) => [styles.bookBtn, pressed && styles.pressed]}>
          <Text style={styles.bookBtnText}>Book Now</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surfacePrimary },
  hero: { height: 220 },
  heroBlock: { ...StyleSheet.absoluteFillObject, backgroundColor: colors.borderSubtle },
  heroNav: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  scroll: { paddingHorizontal: 24, paddingBottom: 100 },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginTop: 16,
  },
  titleCol: { flex: 1, paddingRight: 12 },
  hotelName: {
    fontFamily: fontFamily.semibold,
    fontSize: 24,
    color: colors.foregroundPrimary,
  },
  locRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 6 },
  locText: {
    fontFamily: fontFamily.regular,
    fontSize: 14,
    color: colors.foregroundSecondary,
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radii.sm,
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  ratingText: {
    fontFamily: fontFamily.semibold,
    fontSize: 14,
    color: colors.foregroundPrimary,
  },
  priceRow: { flexDirection: "row", alignItems: "baseline", marginTop: 12 },
  priceText: {
    fontFamily: fontFamily.semibold,
    fontSize: 28,
    color: colors.accentPrimary,
  },
  perNight: {
    fontFamily: fontFamily.regular,
    fontSize: 16,
    color: colors.foregroundSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderSubtle,
    marginVertical: 16,
  },
  amenitiesLabel: {
    fontFamily: fontFamily.medium,
    fontSize: 11,
    letterSpacing: 1,
    color: colors.foregroundMuted,
    marginBottom: 10,
  },
  amenities: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  amenityChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    backgroundColor: colors.surfaceCard,
  },
  amenityText: {
    fontFamily: fontFamily.medium,
    fontSize: 11,
    letterSpacing: 0.5,
    color: colors.foregroundSecondary,
  },
  descLabel: {
    fontFamily: fontFamily.medium,
    fontSize: 11,
    letterSpacing: 1,
    color: colors.foregroundMuted,
    marginBottom: 8,
  },
  descText: {
    fontFamily: fontFamily.regular,
    fontSize: 15,
    lineHeight: 22,
    color: colors.foregroundSecondary,
  },
  roomLabel: {
    fontFamily: fontFamily.medium,
    fontSize: 11,
    letterSpacing: 1,
    color: colors.foregroundMuted,
    marginTop: 8,
    marginBottom: 12,
  },
  roomRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
    padding: 12,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    backgroundColor: colors.surfaceCard,
  },
  roomThumb: { width: 72, height: 56, borderRadius: radii.sm, backgroundColor: colors.borderSubtle },
  roomInfo: { flex: 1, justifyContent: "center" },
  roomName: {
    fontFamily: fontFamily.semibold,
    fontSize: 15,
    color: colors.foregroundPrimary,
  },
  roomPrice: {
    fontFamily: fontFamily.regular,
    fontSize: 14,
    color: colors.accentPrimary,
    marginTop: 4,
  },
  bookBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
    backgroundColor: colors.surfacePrimary,
  },
  bookLabel: {
    fontFamily: fontFamily.regular,
    fontSize: 12,
    color: colors.foregroundMuted,
  },
  bookPrice: {
    fontFamily: fontFamily.semibold,
    fontSize: 16,
    color: colors.foregroundPrimary,
  },
  bookBtn: {
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: radii.sm,
    backgroundColor: colors.accentPrimary,
  },
  bookBtnText: {
    fontFamily: fontFamily.semibold,
    fontSize: 15,
    color: colors.foregroundInverse,
  },
  pressed: { opacity: 0.9 },
});
