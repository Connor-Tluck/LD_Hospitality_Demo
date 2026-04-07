/** Static copy aligned with Hospitality.pen */

import type { Org, SessionUserPublic } from "@hospitality/shared";

/** Reproducible placeholder photos (picsum seeds). */
export function placeholderPhoto(width: number, height: number, seed: string): string {
  const s = encodeURIComponent(seed.replace(/\s+/g, "-").slice(0, 40));
  return `https://picsum.photos/seed/${s}/${width}/${height}`;
}

/**
 * Unsplash CDN with explicit crop size. Photo ids identify real uploads (see each use site).
 * License: https://unsplash.com/license
 */
export function unsplashImage(photoId: string, width: number, height: number): string {
  const q = new URLSearchParams({
    auto: "format",
    fit: "crop",
    w: String(width),
    h: String(height),
    q: "85",
  });
  return `https://images.unsplash.com/${photoId}?${q}`;
}

/** Avatar-style portrait placeholders (faces vary by seed). */
export function profilePhotoUrl(seed: string, size = 256): string {
  return placeholderPhoto(size, size, `profile-${seed}`);
}

export type HotelCard = {
  id: string;
  name: string;
  location: string;
  priceLabel: string;
  heroColor: string;
  /** Remote placeholder image */
  imageUrl: string;
};

export const FEATURED_HOTELS: HotelCard[] = [
  {
    id: "caesars-palace",
    name: "Caesars Palace",
    location: "Las Vegas, NV",
    priceLabel: "From $289/night",
    heroColor: "#4A3F35",
    imageUrl: unsplashImage("photo-1557996235-98d190257904", 440, 280),
  },
  {
    id: "atlantis-paradise",
    name: "Atlantis Paradise",
    location: "Nassau, Bahamas",
    priceLabel: "From $459/night",
    heroColor: "#2C4A5C",
    imageUrl: unsplashImage("photo-1680639883617-0771b2da1e4f", 440, 280),
  },
];

export type HotelRoom = {
  name: string;
  price: number;
  imageUrl: string;
};

export type HotelDetail = {
  id: string;
  name: string;
  location: string;
  pricePerNight: number;
  rating: string;
  about: string;
  amenities: string[];
  rooms: HotelRoom[];
  heroImageUrl: string;
};

export const HOTEL_DETAILS: Record<string, HotelDetail> = {
  "caesars-palace": {
    id: "caesars-palace",
    name: "Caesars Palace",
    location: "Las Vegas, Nevada",
    pricePerNight: 289,
    rating: "4.8",
    about:
      "Experience the legendary Caesars Palace, where Roman-inspired grandeur meets modern luxury. Enjoy world-class dining, an award-winning spa, and entertainment that defines Las Vegas.",
    amenities: ["POOL", "SPA", "DINING", "GYM", "WIFI"],
    rooms: [
      {
        name: "Deluxe King Suite",
        price: 289,
        imageUrl: unsplashImage("photo-1759223198981-661cadbbff36", 280, 200),
      },
      {
        name: "Forum Tower Suite",
        price: 459,
        imageUrl: unsplashImage("photo-1559599242-651c4e085efb", 280, 200),
      },
    ],
    heroImageUrl: unsplashImage("photo-1557996235-98d190257904", 800, 480),
  },
  "atlantis-paradise": {
    id: "atlantis-paradise",
    name: "Atlantis Paradise",
    location: "Nassau, Bahamas",
    pricePerNight: 459,
    rating: "4.9",
    about:
      "Oceanfront luxury in the Bahamas: iconic towers, marine habitats, and beaches steps from your suite.",
    amenities: ["POOL", "SPA", "DINING", "GYM", "WIFI"],
    rooms: [
      {
        name: "Regal Suite Ocean View",
        price: 459,
        imageUrl: unsplashImage("photo-1641139404177-bd806ce296bc", 280, 200),
      },
      {
        name: "Royal Penthouse",
        price: 899,
        imageUrl: unsplashImage("photo-1758448755969-8791367cf5c5", 280, 200),
      },
    ],
    heroImageUrl: unsplashImage("photo-1680639883617-0771b2da1e4f", 800, 480),
  },
};

export type ExperienceTile = {
  tag: string;
  title: string;
  subtitle: string;
  color: string;
  imageUrl: string;
};

export const HOME_EXPERIENCE_TILES: ExperienceTile[] = [
  {
    tag: "Spa & Wellness",
    title: "Spa & Wellness",
    subtitle: "Treatments",
    color: "#5C4A3D",
    imageUrl: unsplashImage("photo-1731336479432-3eb5fdb3ab1c", 400, 400),
  },
  {
    tag: "Fine Dining",
    title: "Fine Dining",
    subtitle: "Reservations",
    color: "#3D4A5C",
    imageUrl: unsplashImage("photo-1758537697448-dbfc1cb83e49", 400, 400),
  },
  {
    tag: "Live Shows",
    title: "Live Shows",
    subtitle: "Tickets",
    color: "#4A3D5C",
    imageUrl: unsplashImage("photo-1759502418494-bee52af25972", 400, 400),
  },
];

/** Top filter chips on Explore: All | Spa | Dining | Shows */
export type ExploreCategoryFilter = "All" | "Spa" | "Dining" | "Shows";

export type ExploreGridItem = {
  tag: string;
  name: string;
  price: string;
  color: string;
  imageUrl: string;
  /** Which chip includes this card */
  filter: "dining" | "shows" | "spa" | "pool" | "gaming";
};

export const EXPLORE_GRID: ExploreGridItem[] = [
  {
    tag: "DINING",
    name: "Gordon Ramsay Hell's Kitchen",
    price: "From $120",
    color: "#5A4A40",
    imageUrl: unsplashImage("photo-1762329924239-e204f101fca4", 400, 320),
    filter: "dining",
  },
  {
    tag: "SHOWS",
    name: "Absinthe Live Show",
    price: "From $89",
    color: "#3D4558",
    imageUrl: unsplashImage("photo-1631392075104-b2ef28cb7f6b", 400, 320),
    filter: "shows",
  },
  {
    tag: "POOL",
    name: "Garden of the Gods Pool",
    price: "Complimentary",
    color: "#3A5C52",
    imageUrl: unsplashImage("photo-1549109783-6be1845ed596", 400, 320),
    filter: "pool",
  },
  {
    tag: "GAMING",
    name: "High Limit Salon",
    price: "By invitation",
    color: "#4A3A50",
    imageUrl: unsplashImage("photo-1650149044622-472659e87813", 400, 320),
    filter: "gaming",
  },
];

/** Featured strip on Explore — spa / wellness */
export const EXPLORE_FEATURED = {
  tag: "SPA & WELLNESS",
  title: "The Qua Baths & Spa",
  desc: "Rejuvenate with Roman-inspired treatments",
  imageUrl: unsplashImage("photo-1589806361261-01ee46a61fda", 800, 400),
  filter: "spa" as const,
};

export function exploreGridMatches(cat: ExploreCategoryFilter, item: ExploreGridItem): boolean {
  if (cat === "All") return true;
  if (cat === "Dining") return item.filter === "dining";
  if (cat === "Shows") return item.filter === "shows";
  if (cat === "Spa") return item.filter === "spa" || item.filter === "pool";
  return true;
}

export function showExploreFeatured(cat: ExploreCategoryFilter): boolean {
  return cat === "All" || cat === "Spa";
}

export type SwitchUserProfile = {
  id: string;
  name: string;
  subtitle: string;
  tier: string;
  /** Remote portrait placeholder */
  avatarUrl: string;
  /** ISO 8601 — seeded for demo / LaunchDarkly tenure targeting */
  accountCreatedAt: string;
  /** City, region (non-precise) */
  homeLocation: string;
  countryCode: string;
  totalLifetimeSpendUsd: number;
  rewardPoints: number;
  upcomingBookingsCount: number;
  hasUpcomingStays: boolean;
  isBetaUser: boolean;
};

export const SWITCH_USER_PROFILES: SwitchUserProfile[] = [
  {
    id: "p1",
    name: "Alexandra Chen",
    subtitle: "Platinum Member · VIP Guest",
    tier: "PLATINUM",
    avatarUrl: profilePhotoUrl("alexandra-chen"),
    accountCreatedAt: "2019-06-01T12:00:00.000Z",
    homeLocation: "Las Vegas, NV",
    countryCode: "US",
    totalLifetimeSpendUsd: 84_500,
    rewardPoints: 12_450,
    upcomingBookingsCount: 3,
    hasUpcomingStays: true,
    isBetaUser: false,
  },
  {
    id: "p2",
    name: "James Morrison",
    subtitle: "Gold Member · Business Traveler",
    tier: "GOLD",
    avatarUrl: profilePhotoUrl("james-morrison"),
    accountCreatedAt: "2017-01-15T12:00:00.000Z",
    homeLocation: "New York, NY",
    countryCode: "US",
    totalLifetimeSpendUsd: 42_000,
    rewardPoints: 8200,
    upcomingBookingsCount: 2,
    hasUpcomingStays: true,
    isBetaUser: true,
  },
  {
    id: "p3",
    name: "Sofia Rodriguez",
    subtitle: "Silver Member · First-time Guest",
    tier: "SILVER",
    avatarUrl: profilePhotoUrl("sofia-rodriguez"),
    accountCreatedAt: "2025-11-20T12:00:00.000Z",
    homeLocation: "Miami, FL",
    countryCode: "US",
    totalLifetimeSpendUsd: 1200,
    rewardPoints: 450,
    upcomingBookingsCount: 0,
    hasUpcomingStays: false,
    isBetaUser: false,
  },
  {
    id: "guest",
    name: "Guest User",
    subtitle: "No Membership · Browse Only",
    tier: "GUEST",
    avatarUrl: profilePhotoUrl("guest-user"),
    accountCreatedAt: "2026-01-10T12:00:00.000Z",
    homeLocation: "Not enrolled",
    countryCode: "US",
    totalLifetimeSpendUsd: 0,
    rewardPoints: 0,
    upcomingBookingsCount: 0,
    hasUpcomingStays: false,
    isBetaUser: false,
  },
];

/** Email for local demo session — must match `switch-user` / `AuthContext` demo paths. */
export function demoEmailForSwitchProfile(p: { id: string; name: string }): string {
  return p.id === "guest"
    ? "guest@caesars.com"
    : `${p.name.toLowerCase().replace(/\s+/g, ".")}@demo.local`;
}

/** Profile used by the sign-in screen "Demo Sign In" shortcut (same list as Switch User). */
export const DEFAULT_DEMO_SIGN_IN_PROFILE = SWITCH_USER_PROFILES[0]!;

/** Maps a switch-user profile into client user fields (local demo + LaunchDarkly user context). */
export function profileTraitsForSwitchUser(p: SwitchUserProfile): Partial<SessionUserPublic> {
  return {
    membershipTier: p.tier,
    accountCreatedAt: p.accountCreatedAt,
    homeLocation: p.homeLocation,
    countryCode: p.countryCode,
    totalLifetimeSpendUsd: p.totalLifetimeSpendUsd,
    rewardPoints: p.rewardPoints,
    upcomingBookingsCount: p.upcomingBookingsCount,
    hasUpcomingStays: p.hasUpcomingStays,
    isBetaUser: p.isBetaUser,
  };
}

/** Resolve a predefined demo profile by email (local demo auth). */
export function resolveDemoProfileByEmail(email: string): SwitchUserProfile | undefined {
  const e = email.trim().toLowerCase();
  return SWITCH_USER_PROFILES.find((p) => demoEmailForSwitchProfile(p).toLowerCase() === e);
}

/** Default org overlay for local demo sessions (LaunchDarkly organization context). */
export const DEMO_ORG_FOR_LOCAL: Org = {
  id: "org-demo-1",
  name: "Demo Hospitality Group",
  plan: "enterprise",
  propertyCount: 52,
  primaryRegion: "North America",
};
