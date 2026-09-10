export type CompanyStatus = "Active" | "Inactive" | "Suspended";
export type LicenseStatus = "Active" | "Suspended" | "Disabled" | "Expired";
export type ScreenStatus = "Online" | "Offline" | "Syncing" | "Error";
export type SyncStatus = "Synced" | "Pending" | "Pending (Offline)" | "Syncing..." | "Sync Failed";
export type Orientation = "Landscape" | "Portrait";

export interface Company {
  id: string;
  code: string;
  name: string;
  status: CompanyStatus;
  license: LicenseStatus;
  screensUsed: number;
  screenLimit: number;
  online: number;
  offline: number;
  available: number;
  since: string;
  seed: string;
}

export const companies: Company[] = [
  { id: "acme-retail", code: "00001", name: "Acme Retail", status: "Active", license: "Active", screensUsed: 14, screenLimit: 20, online: 12, offline: 2, available: 6, since: "Mar 12, 2025", seed: "acme" },
  { id: "city-mall", code: "00002", name: "City Mall", status: "Active", license: "Active", screensUsed: 42, screenLimit: 50, online: 39, offline: 3, available: 8, since: "Jan 16, 2025", seed: "citymall" },
  { id: "fresh-bites", code: "00003", name: "Fresh Bites", status: "Active", license: "Active", screensUsed: 8, screenLimit: 10, online: 8, offline: 0, available: 2, since: "Apr 3, 2025", seed: "fresh" },
  { id: "green-eats", code: "00004", name: "Green Eats Co.", status: "Inactive", license: "Disabled", screensUsed: 2, screenLimit: 4, online: 0, offline: 2, available: 2, since: "Aug 30, 2025", seed: "green" },
  { id: "harbor-clinic", code: "00005", name: "Harbor Clinic", status: "Suspended", license: "Suspended", screensUsed: 6, screenLimit: 8, online: 0, offline: 6, available: 2, since: "Feb 22, 2025", seed: "harbor" },
  { id: "metro-fashion", code: "00006", name: "Metro Fashion", status: "Active", license: "Active", screensUsed: 11, screenLimit: 15, online: 11, offline: 0, available: 4, since: "May 7, 2025", seed: "metro" },
  { id: "skyline-gym", code: "00007", name: "Skyline Gym", status: "Active", license: "Expired", screensUsed: 10, screenLimit: 12, online: 7, offline: 3, available: 2, since: "Jun 14, 2025", seed: "skyline" },
  { id: "sunrise-hotels", code: "00008", name: "Sunrise Hotels", status: "Active", license: "Active", screensUsed: 0, screenLimit: 5, online: 0, offline: 0, available: 5, since: "Jul 2, 2025", seed: "sunrise" },
];

export interface Screen {
  id: string;
  name: string;
  company: string;
  companyId?: string;
  location: string;
  personal?: boolean;
  status: ScreenStatus;
  orientation: Orientation;
  content: string;
  lastSeen: string;
  sync: SyncStatus;
  seed: string;
  group?: string;
}

export const screens: Screen[] = [
  { id: "lobby-display-01", name: "Lobby Display 01", company: "Acme Retail", companyId: "acme-retail", location: "Main Lobby", status: "Online", orientation: "Landscape", content: "Weekend Promotion", lastSeen: "2 min ago", sync: "Synced", seed: "lobby1", group: "main-lobby" },
  { id: "entrance-display", name: "Entrance Display", company: "City Mall", companyId: "city-mall", location: "Front Entrance", status: "Offline", orientation: "Portrait", content: "Summer Campaign", lastSeen: "3 hr ago", sync: "Pending (Offline)", seed: "entrance" },
  { id: "menu-board-03", name: "Menu Board 03", company: "Fresh Bites", companyId: "fresh-bites", location: "Dining Area", status: "Syncing", orientation: "Landscape", content: "Breakfast Menu", lastSeen: "Just now", sync: "Syncing...", seed: "menu3" },
  { id: "office-display", name: "Office Display", company: "Super Admin", location: "Admin Office", personal: true, status: "Online", orientation: "Landscape", content: "Company Announcements", lastSeen: "5 min ago", sync: "Synced", seed: "office" },
  { id: "hotel-lobby-screen", name: "Hotel Lobby Screen", company: "Sunrise Hotels", companyId: "sunrise-hotels", location: "Hotel Lobby", status: "Online", orientation: "Landscape", content: "Luxury Getaway", lastSeen: "1 min ago", sync: "Synced", seed: "hotel" },
  { id: "gym-floor-display", name: "Gym Floor Display", company: "Skyline Gym", companyId: "skyline-gym", location: "Main Floor", status: "Online", orientation: "Landscape", content: "Get Fit Now", lastSeen: "45 sec ago", sync: "Synced", seed: "gym" },
  { id: "reception-welcome", name: "Reception Welcome", company: "Harbor Clinic", companyId: "harbor-clinic", location: "Reception Desk", status: "Online", orientation: "Portrait", content: "Patient Welcome", lastSeen: "5 min ago", sync: "Synced", seed: "reception" },
  { id: "atrium-main-screen", name: "Atrium Main Screen", company: "City Mall", companyId: "city-mall", location: "Central Atrium", status: "Error", orientation: "Landscape", content: "Acme Brand Campaign", lastSeen: "15 min ago", sync: "Sync Failed", seed: "atrium" },
  { id: "cafe-menu-board", name: "Café Menu Board", company: "Fresh Bites", companyId: "fresh-bites", location: "Counter Area", status: "Online", orientation: "Landscape", content: "Fresh Eats Special", lastSeen: "3 min ago", sync: "Synced", seed: "cafe" },
  { id: "vip-lounge-display", name: "VIP Lounge Display", company: "Sunrise Hotels", companyId: "sunrise-hotels", location: "VIP Lounge", status: "Online", orientation: "Landscape", content: "Premium Experience", lastSeen: "8 min ago", sync: "Pending", seed: "vip" },
  { id: "fashion-window-01", name: "Fashion Window 01", company: "Acme Retail", companyId: "acme-retail", location: "Shop Window", status: "Online", orientation: "Portrait", content: "Fashion Week", lastSeen: "2 min ago", sync: "Synced", seed: "fashion" },
  { id: "personal-desk-screen", name: "Personal Desk Screen", company: "Super Admin", location: "Desk Setup", personal: true, status: "Online", orientation: "Landscape", content: "Dashboard Feed", lastSeen: "Just now", sync: "Synced", seed: "desk" },
];

export interface ScreenGroup {
  id: string;
  name: string;
  company: string;
  companyId: string;
  screens: number;
  online: number;
  offline: number;
  content: string;
  sync: "Synced" | "Syncing...";
  seed: string;
  created: string;
}

export const screenGroups: ScreenGroup[] = [
  { id: "lobby", name: "Lobby", company: "Acme Retail", companyId: "acme-retail", screens: 1, online: 1, offline: 0, content: "Summer Promotion", sync: "Synced", seed: "lobby1", created: "Mar 12, 2025" },
  { id: "restaurant", name: "Restaurant", company: "Fresh Bites", companyId: "fresh-bites", screens: 2, online: 0, offline: 2, content: "Weekend Menu Special", sync: "Syncing...", seed: "menu3", created: "Apr 8, 2025" },
  { id: "reception", name: "Reception", company: "Sunrise Hotels", companyId: "sunrise-hotels", screens: 1, online: 1, offline: 0, content: "Luxury Getaway", sync: "Synced", seed: "hotel", created: "Jul 5, 2025" },
  { id: "fitness", name: "Fitness", company: "Skyline Gym", companyId: "skyline-gym", screens: 1, online: 1, offline: 0, content: "Get Fit Now", sync: "Synced", seed: "gym", created: "Jun 20, 2025" },
];

export const mainLobbyGroup = {
  id: "main-lobby",
  name: "Main Lobby Displays",
  company: "Acme Retail",
  companyId: "acme-retail",
  created: "Mar 12, 2025",
  content: "Weekend Promotion",
  contentItems: 8,
  contentDuration: "30 min",
  screens: [
    { name: "Lobby Display 01", location: "Main Entrance", status: "Online" as ScreenStatus, orientation: "Landscape" as Orientation, content: "Weekend Promotion", lastSync: "2 min ago", sync: "Synced" as SyncStatus },
    { name: "Lobby Display 02", location: "East Wing", status: "Online" as ScreenStatus, orientation: "Landscape" as Orientation, content: "Weekend Promotion", lastSync: "2 min ago", sync: "Synced" as SyncStatus },
    { name: "Lobby Display 03", location: "West Wing", status: "Online" as ScreenStatus, orientation: "Landscape" as Orientation, content: "Weekend Promotion", lastSync: "3 min ago", sync: "Synced" as SyncStatus },
    { name: "Lobby Display 04", location: "North Exit", status: "Online" as ScreenStatus, orientation: "Landscape" as Orientation, content: "Weekend Promotion", lastSync: "1 min ago", sync: "Synced" as SyncStatus },
    { name: "Lobby Display 05", location: "South Exit", status: "Online" as ScreenStatus, orientation: "Portrait" as Orientation, content: "Weekend Promotion", lastSync: "4 min ago", sync: "Synced" as SyncStatus },
    { name: "Lobby Display 06", location: "Parking Entrance", status: "Offline" as ScreenStatus, orientation: "Landscape" as Orientation, content: "Weekend Promotion", lastSync: "3 hours ago", sync: "Pending" as SyncStatus },
  ],
};

export interface Canvas {
  id: string;
  name: string;
  created: string;
  screens: number;
  layout: string;
  ready: number;
  status: "Active" | "Degraded";
  content?: string;
  lastSync: string;
  seed?: string;
  members: { name: string; location: string; status: ScreenStatus; syncedAgo: string }[];
}

export const canvases: Canvas[] = [
  { id: "lobby-wall", name: "Lobby Wall", created: "Aug 15, 2026", screens: 3, layout: "3 × Landscape", ready: 3, status: "Active", content: "Brand Campaign Q3", lastSync: "12 seconds ago", seed: "lobby1", members: [
    { name: "Lobby Left", location: "Main Lobby · Zone A", status: "Online", syncedAgo: "12 seconds ago" },
    { name: "Lobby Center", location: "Main Lobby · Zone A", status: "Online", syncedAgo: "12 seconds ago" },
    { name: "Lobby Right", location: "Main Lobby · Zone A", status: "Online", syncedAgo: "12 seconds ago" },
  ] },
  { id: "entrance-display", name: "Entrance Display", created: "Sep 1, 2026", screens: 2, layout: "2 × Landscape", ready: 1, status: "Degraded", content: "Summer Campaign", lastSync: "4 minutes ago", seed: "entrance", members: [
    { name: "Entrance Screen N", location: "North Entrance", status: "Online", syncedAgo: "4 minutes ago" },
    { name: "Entrance Screen S", location: "South Entrance", status: "Offline", syncedAgo: "3 hours ago" },
  ] },
  { id: "mall-enterance", name: "Mall Enterance", created: "Sep 7, 2026", screens: 0, layout: "0 × Landscape", ready: 0, status: "Active", lastSync: "Just now", members: [] },
];

export const recentActivity = [
  { title: 'Screen "Lobby Display 01" paired', by: "Acme Retail", when: "2 min ago", kind: "success" as const },
  { title: 'Playlist "Weekend Promotion" published', by: "Fresh Bites", when: "18 min ago", kind: "success" as const },
  { title: 'Screen "Entrance Display" went offline', by: "City Mall", when: "32 min ago", kind: "alert" as const },
  { title: "Media bundle uploaded (12 assets)", by: "Metro Fashion", when: "1 hr ago", kind: "success" as const },
  { title: "New company created", by: "Super Admin", when: "2 hr ago", kind: "success" as const },
  { title: 'Screen "Food Court Panel A" refreshed', by: "City Mall", when: "3 hr ago", kind: "neutral" as const },
];

export const contentLibrary = [
  { id: "summer-promotion", name: "Summer Promotion", type: "Playlist", items: 8, seed: "lobby1" },
  { id: "fashion-week", name: "Fashion Week", type: "Playlist", items: 5, seed: "fashion" },
  { id: "breakfast-menu", name: "Breakfast Menu", type: "Playlist", items: 6, seed: "menu3" },
  { id: "luxury-getaway", name: "Luxury Getaway", type: "Media", items: 1, seed: "hotel" },
  { id: "get-fit-now", name: "Get Fit Now", type: "Media", items: 1, seed: "gym" },
  { id: "patient-welcome", name: "Patient Welcome", type: "Playlist", items: 4, seed: "reception" },
];

/* ---------- Media ---------- */
export type MediaType = "Image" | "Video" | "PDF";
export type MediaStatus = "Ready" | "Processing" | "Failed";
export interface MediaItem { id: string; name: string; type: MediaType; status: MediaStatus; meta: string; size: string; uploaded: string; company: string; seed: string; duration?: string; usedBy: { name: string; kind: "Layout" | "Playlist" }[] }
export const media: MediaItem[] = [
  { id: "summer-campaign", name: "Summer Campaign", type: "Image", status: "Ready", meta: "1920×1080", size: "2.4 MB", uploaded: "Aug 30, 2026", company: "Acme Retail", seed: "lobby1", usedBy: [{ name: "Weekend Promotion", kind: "Playlist" }] },
  { id: "weekend-promo", name: "Weekend Promo", type: "Video", status: "Ready", meta: "00:30", size: "18.6 MB", uploaded: "Aug 29, 2026", company: "Acme Retail", seed: "gym", duration: "00:30", usedBy: [{ name: "Weekend Promotion", kind: "Playlist" }] },
  { id: "new-campaign", name: "New Campaign", type: "Video", status: "Processing", meta: "—", size: "94.1 MB", uploaded: "Aug 30, 2026", company: "Acme Retail", seed: "atrium", usedBy: [] },
  { id: "lobby-ambient", name: "Lobby Ambient", type: "Video", status: "Ready", meta: "01:20", size: "45.2 MB", uploaded: "Aug 28, 2026", company: "Acme Retail", seed: "office", duration: "01:20", usedBy: [{ name: "Lobby Layout", kind: "Layout" }] },
  { id: "brand-guidelines", name: "Brand Guidelines", type: "PDF", status: "Ready", meta: "24 Pages", size: "12.3 MB", uploaded: "Aug 20, 2026", company: "Acme Retail", seed: "pdf", usedBy: [] },
  { id: "product-catalogue", name: "Product Catalogue", type: "PDF", status: "Failed", meta: "18 Pages", size: "6.9 MB", uploaded: "Aug 30, 2026", company: "Acme Retail", seed: "pdf2", usedBy: [] },
  { id: "spring-collection", name: "Spring Collection", type: "Image", status: "Ready", meta: "1920×1080", size: "2.9 MB", uploaded: "Aug 18, 2026", company: "Acme Retail", seed: "fashion", usedBy: [{ name: "Fashion Week", kind: "Playlist" }] },
];

/* ---------- Playlists ---------- */
export interface PlaylistItem { id: string; name: string; type: MediaType; duration: number; seed: string }
export interface Playlist { id: string; name: string; items: PlaylistItem[]; updated: string; assigned: number; seed: string; company: string }
export const playlists: Playlist[] = [
  { id: "weekend-promotion", name: "Weekend Promotion", updated: "18 min ago", assigned: 6, seed: "office", company: "Acme Retail", items: [
    { id: "summer-campaign", name: "Summer Campaign", type: "Image", duration: 15, seed: "lobby1" }, { id: "weekend-promo", name: "Weekend Promo", type: "Video", duration: 30, seed: "gym" }, { id: "spring-collection", name: "Spring Collection", type: "Image", duration: 10, seed: "fashion" }, { id: "lobby-ambient", name: "Lobby Ambient", type: "Video", duration: 80, seed: "office" }, { id: "s2", name: "Summer Campaign", type: "Image", duration: 15, seed: "lobby1" }, { id: "s3", name: "Spring Collection", type: "Image", duration: 10, seed: "fashion" }, { id: "s4", name: "Weekend Promo", type: "Video", duration: 30, seed: "gym" }, { id: "s5", name: "Summer Campaign", type: "Image", duration: 15, seed: "lobby1" },
  ] },
  { id: "summer-campaign", name: "Summer Campaign", updated: "2 hr ago", assigned: 3, seed: "fashion", company: "Acme Retail", items: [
    { id: "a1", name: "Summer Campaign", type: "Image", duration: 15, seed: "lobby1" }, { id: "a2", name: "Spring Collection", type: "Image", duration: 20, seed: "fashion" }, { id: "a3", name: "Weekend Promo", type: "Video", duration: 30, seed: "gym" }, { id: "a4", name: "Lobby Ambient", type: "Video", duration: 15, seed: "office" }, { id: "a5", name: "Summer Campaign", type: "Image", duration: 10, seed: "lobby1" },
  ] },
  { id: "company-announcements", name: "Company Announcements", updated: "Yesterday", assigned: 0, seed: "fashion", company: "Acme Retail", items: [
    { id: "c1", name: "Spring Collection", type: "Image", duration: 15, seed: "fashion" }, { id: "c2", name: "Summer Campaign", type: "Image", duration: 10, seed: "lobby1" }, { id: "c3", name: "Weekend Promo", type: "Video", duration: 20, seed: "gym" }, { id: "c4", name: "Spring Collection", type: "Image", duration: 10, seed: "fashion" },
  ] },
  { id: "my-draft-reel", name: "My Draft Reel", updated: "Just now", assigned: 0, seed: "office", company: "Personal", items: [
    { id: "d1", name: "My Promo Draft", type: "Image", duration: 15, seed: "office" }, { id: "d2", name: "Gym Motivation", type: "Video", duration: 30, seed: "gym" },
  ] },
];
export function fmtDuration(s: number) { const m = Math.floor(s / 60); const r = s % 60; return m ? `${m}m ${r}s` : `${r}s`; }

/* ---------- Layouts & Templates ---------- */
export type TemplateCategory = "Event" | "Corporate" | "Restaurant" | "Hotel" | "Announcement" | "Retail" | "Travel" | "Promotional";
export interface Template { id: string; name: string; category: TemplateCategory; orientation: Orientation; ratio: string; usedIn: number; theme: string; kicker: string; title: string; sub?: string; superAdmin?: boolean; updated: string; created: string; fields: { name: string; type: "Text" | "Image" | "Color"; required?: boolean; max?: number }[]; fixed: string[] }
export const templates: Template[] = [
  { id: "festival-countdown", name: "Festival Countdown", category: "Event", orientation: "Landscape", ratio: "16:9", usedIn: 14, theme: "from-violet-900 via-purple-800 to-fuchsia-900", kicker: "LIVE EVENT", title: "Summer Music Festival", sub: "Saturday, 12 July · From £25", updated: "Sep 3, 2025", created: "Sep 3, 2025", fields: [{ name: "Event Name", type: "Text", required: true, max: 50 }, { name: "Date", type: "Text", required: true, max: 40 }, { name: "Venue", type: "Text", max: 60 }, { name: "Key Art", type: "Image", required: true }, { name: "Accent", type: "Color" }], fixed: ["Key art full-bleed fill", "Gradient overlay", "Event title scale", "Date/venue strip (bottom)"] },
  { id: "corporate-announcement", name: "Corporate Announcement", category: "Corporate", orientation: "Landscape", ratio: "16:9", usedIn: 39, theme: "from-slate-800 to-slate-950", kicker: "COMPANY ANNOUNCEMENT", title: "Q3 All-Hands Meeting", sub: "Thursday, 3:00 PM · Auditorium A", updated: "Aug 12, 2025", created: "Jul 2, 2025", fields: [{ name: "Headline", type: "Text", required: true, max: 60 }, { name: "Body", type: "Text", max: 140 }, { name: "Logo", type: "Image" }], fixed: ["Logo position", "Typography hierarchy"] },
  { id: "conference-room-display", name: "Conference Room Display", category: "Corporate", orientation: "Landscape", ratio: "16:9", usedIn: 27, theme: "from-slate-900 to-slate-800", kicker: "COMPANY ANNOUNCEMENT", title: "Q3 All-Hands Meeting", sub: "Room 4B · 3:00 PM", updated: "Aug 1, 2025", created: "Jun 15, 2025", fields: [{ name: "Room", type: "Text", required: true }, { name: "Meeting", type: "Text", required: true }], fixed: ["Grid layout", "Clock position"] },
  { id: "menu-board-cafe", name: "Menu Board – Café", category: "Restaurant", orientation: "Landscape", ratio: "16:9", usedIn: 43, theme: "from-amber-900 to-orange-950", kicker: "TONIGHT'S SPECIAL", title: "Truffle Pasta", sub: "$24.99", updated: "Jul 22, 2025", created: "May 9, 2025", fields: [{ name: "Dish", type: "Text", required: true }, { name: "Price", type: "Text", required: true }, { name: "Photo", type: "Image", required: true }], fixed: ["Photo crop frame", "Price badge"] },
  { id: "hotel-welcome-screen", name: "Hotel Welcome Screen", category: "Hotel", orientation: "Portrait", ratio: "9:16", usedIn: 47, theme: "from-slate-900 to-slate-800", kicker: "WELCOME", title: "The Grand Meridian", sub: "LUXURY COLLECTION", updated: "Jul 10, 2025", created: "Apr 3, 2025", fields: [{ name: "Hotel Name", type: "Text", required: true }, { name: "Tagline", type: "Text" }], fixed: ["Serif typography", "Centered layout"] },
  { id: "event-promotion", name: "Event Promotion", category: "Event", orientation: "Portrait", ratio: "9:16", usedIn: 22, theme: "from-violet-900 to-fuchsia-900", kicker: "LIVE EVENT", title: "Summer Music Festival", sub: "Saturday, 12 July · From £25", updated: "Jun 28, 2025", created: "Jun 1, 2025", fields: [{ name: "Event Name", type: "Text", required: true }, { name: "Date", type: "Text", required: true }, { name: "Key Art", type: "Image", required: true }], fixed: ["Gradient overlay", "Title scale"] },
  { id: "safety-emergency-notice", name: "Safety & Emergency Notice", category: "Announcement", orientation: "Landscape", ratio: "16:9", usedIn: 9, theme: "from-slate-950 to-slate-900", kicker: "FIRE DRILL — NOTICE", title: "Proceed calmly to the nearest exit.", superAdmin: true, updated: "Jun 15, 2025", created: "Jun 15, 2025", fields: [{ name: "Notice", type: "Text", required: true }], fixed: ["Red alert bar", "Icon"] },
  { id: "new-product-launch", name: "New Product Launch", category: "Retail", orientation: "Portrait", ratio: "9:16", usedIn: 31, theme: "from-rose-800 to-red-900", kicker: "SUMMER COLLECTION", title: "SALE", sub: "UP TO 40% OFF", updated: "Jun 3, 2025", created: "May 20, 2025", fields: [{ name: "Product Name", type: "Text", required: true }, { name: "Price", type: "Text", required: true }, { name: "Product Image", type: "Image", required: true }, { name: "CTA Text", type: "Text", required: true }], fixed: ["Logo position", "Grid layout structure"] },
  { id: "retail-summer-sale", name: "Retail Summer Sale", category: "Retail", orientation: "Landscape", ratio: "16:9", usedIn: 84, theme: "from-rose-700 to-red-900", kicker: "SUMMER COLLECTION", title: "SALE", sub: "UP TO 50% OFF", updated: "May 30, 2025", created: "May 1, 2025", fields: [{ name: "Headline", type: "Text", required: true }, { name: "Discount", type: "Text", required: true }], fixed: ["CTA button shape"] },
  { id: "travel-campaign", name: "Travel Campaign", category: "Travel", orientation: "Landscape", ratio: "16:9", usedIn: 18, theme: "from-sky-900 to-slate-900", kicker: "ESCAPE TO", title: "Santorini", sub: "Greece · From £399", updated: "May 18, 2025", created: "Apr 20, 2025", fields: [{ name: "Destination", type: "Text", required: true }, { name: "Price", type: "Text" }, { name: "Photo", type: "Image", required: true }], fixed: ["Blue CTA bar"] },
  { id: "restaurant-special-offer", name: "Restaurant Special Offer", category: "Restaurant", orientation: "Landscape", ratio: "16:9", usedIn: 61, theme: "from-slate-900 to-slate-800", kicker: "TONIGHT'S SPECIAL", title: "Truffle Pasta", sub: "$24.99", updated: "May 2, 2025", created: "Mar 8, 2025", fields: [{ name: "Dish", type: "Text", required: true }, { name: "Price", type: "Text", required: true }], fixed: ["Bottom strip"] },
  { id: "flash-sale-countdown", name: "Flash Sale Countdown", category: "Promotional", orientation: "Landscape", ratio: "16:9", usedIn: 55, theme: "from-orange-600 to-red-700", kicker: "LIMITED TIME", title: "70%", sub: "OFF TODAY ONLY", updated: "Apr 25, 2025", created: "Feb 14, 2025", fields: [{ name: "Discount", type: "Text", required: true }, { name: "Ends", type: "Text", required: true }], fixed: ["Countdown position"] },
];
export interface ZoneLayout { id: string; name: string; zones: number; description: string; orientation: Orientation; zoneNames: string[] }
export const zoneLayouts: ZoneLayout[] = [
  { id: "full-screen", name: "Full Screen", zones: 1, description: "Single zone spanning the entire display. Best for hero content, video loops, and announcements.", orientation: "Landscape", zoneNames: ["Full Screen"] },
  { id: "main-bottom-bar", name: "Main + Bottom Bar", zones: 2, description: "75% main content zone with a bottom bar for tickers, alerts, or brand elements.", orientation: "Landscape", zoneNames: ["Main Content", "Bottom Bar"] },
  { id: "split-screen", name: "Split Screen", zones: 2, description: "Equal 50/50 halves for side-by-side dual-content displays. Works landscape and portrait.", orientation: "Landscape", zoneNames: ["Left", "Right"] },
];

/* ---------- Offers ---------- */
export type OfferStatus = "Active" | "Draft" | "Inactive" | "Expired";
export interface Offer { id: string; title: string; status: OfferStatus; category: string; views: string; unique: string; published: string; seed: string; description: string; contact: string[]; claim: string; start: string; end: string; created: string; updated: string }
export const offers: Offer[] = [
  { id: "summer-sale", title: "Exclusive Summer Sale — Up to 40% Off", status: "Active", category: "Retail & Shopping", views: "2.5k", unique: "1.8k", published: "Jun 3, 2026", seed: "fashion", description: "Celebrate summer with massive savings across our entire catalogue. From beachwear to outdoor furniture, find everything you need for the perfect summer. Limited-time discounts on over 2,000 products — in-store and online. Don't miss out on the biggest sale of the season.", contact: ["Customer Service: 1-800-555-0120", "Email: sales@retailco.com", "Store hours: Mon–Sat 9am–9pm, Sun 10am–6pm"], claim: "Present this offer at checkout or enter code SUMMER40 online. Valid on full-price items only. Cannot be combined with other offers. One use per customer per visit.", start: "2026-06-03", end: "2026-08-31", created: "Jun 1, 2026", updated: "Jun 3, 2026" },
  { id: "free-coffee", title: "Free Coffee with Any Breakfast Order", status: "Active", category: "Food & Beverage", views: "1.2k", unique: "903", published: "May 22, 2026", seed: "cafe", description: "Start your morning right. Enjoy a complimentary barista-crafted coffee — any size, any blend — when you order any breakfast item before 11am. Available daily at all participating locations. We source our beans from sustainable farms and roast them fresh each week.", contact: ["Café Hotline: 1-800-555-0177", "Reservations: cafe@beanscene.com"], claim: "Show this offer at the counter before placing your order. One free coffee per customer per visit. Valid Monday to Friday, 7am–11am only. Not valid on public holidays.", start: "2026-05-22", end: "2026-09-30", created: "May 20, 2026", updated: "May 22, 2026" },
  { id: "hotel-getaway", title: "Hotel Getaway — 3 Nights for the Price of 2", status: "Active", category: "Travel & Hospitality", views: "874", unique: "761", published: "May 12, 2026", seed: "hotel", description: "Escape the city and unwind at our award-winning resort. Book any 3-night stay and pay for only 2. Includes daily breakfast for two, complimentary spa access, and a late checkout.", contact: ["Reservations: 1-800-555-0199", "stay@sunrisehotels.com"], claim: "Book online with code STAY3PAY2 or call reservations. Subject to availability. Blackout dates apply.", start: "2026-05-12", end: "2026-11-30", created: "May 10, 2026", updated: "May 12, 2026" },
  { id: "luxury-watch", title: "Luxury Watch — Limited Edition Collection", status: "Draft", category: "Retail & Shopping", views: "0", unique: "0", published: "Draft", seed: "atrium", description: "Discover our limited edition collection of luxury timepieces.", contact: ["boutique@luxwatch.com"], claim: "Visit the boutique for a private viewing.", start: "", end: "", created: "Jun 18, 2026", updated: "Jun 18, 2026" },
  { id: "tech-conference", title: "Annual Tech Conference — Early Bird Tickets", status: "Inactive", category: "Technology", views: "3.2k", unique: "2.8k", published: "Jan 15, 2026", seed: "entrance", description: "Join 5,000 developers for three days of talks and workshops.", contact: ["tickets@techconf.io"], claim: "Use code EARLY20 before March 1.", start: "2026-01-15", end: "2026-03-01", created: "Jan 10, 2026", updated: "Mar 2, 2026" },
  { id: "gym-membership", title: "6-Month Gym Membership — 30% Off", status: "Expired", category: "Health & Wellness", views: "1.7k", unique: "1.4k", published: "Dec 5, 2025", seed: "gym", description: "Commit to your fitness goals with 30% off a 6-month membership.", contact: ["hello@skylinegym.com"], claim: "Sign up at the front desk and mention this offer.", start: "2025-12-05", end: "2026-01-31", created: "Dec 1, 2025", updated: "Feb 1, 2026" },
];

/* ---------- Scratch & Win ---------- */
export type CampaignStatus = "Active" | "Scheduled" | "Ended" | "Draft" | "Inactive";
export interface Prize { name: string; qty: number; awarded: number }
export interface Campaign { id: string; title: string; status: CampaignStatus; start: string; end: string; attempts: string; winners: number; prizes: Prize[]; description: string; maxAttempts: number; requireOffers: boolean; created: string; updated: string; seed: string }
export const campaigns: Campaign[] = [
  { id: "summer-lucky-draw-2026", title: "Summer Lucky Draw 2026", status: "Active", start: "2026-06-01", end: "2026-08-31", attempts: "2.8k", winners: 311, prizes: [{ name: "iPhone 15", qty: 5, awarded: 2 }, { name: "AirPods Pro", qty: 20, awarded: 7 }, { name: "Gift Card $50", qty: 200, awarded: 84 }, { name: "Coffee Voucher", qty: 500, awarded: 218 }], description: "Customers earn a scratch card for every $50 spent in-store during summer. Prizes range from gift vouchers to a weekend hotel getaway. Instant results, no coupon required.", maxAttempts: 3, requireOffers: true, created: "May 20, 2026", updated: "Jun 1, 2026", seed: "gold" },
  { id: "holiday-season-prizes", title: "Holiday Season Prizes", status: "Scheduled", start: "2026-12-01", end: "2027-01-10", attempts: "0", winners: 0, prizes: [{ name: "Festive Hamper", qty: 50, awarded: 0 }, { name: "Gift Card $25", qty: 300, awarded: 0 }, { name: "Hot Chocolate", qty: 1000, awarded: 0 }], description: "Festive scratch cards for every holiday purchase.", maxAttempts: 2, requireOffers: false, created: "Sep 1, 2026", updated: "Sep 5, 2026", seed: "holiday" },
  { id: "new-year-big-win", title: "New Year Big Win", status: "Ended", start: "2026-01-01", end: "2026-02-28", attempts: "5.0k", winners: 326, prizes: [{ name: "Weekend Getaway", qty: 3, awarded: 3 }, { name: "Gift Card $100", qty: 50, awarded: 50 }, { name: "Gift Card $20", qty: 400, awarded: 273 }], description: "Kick off the new year with big prizes.", maxAttempts: 3, requireOffers: true, created: "Dec 10, 2025", updated: "Mar 1, 2026", seed: "newyear" },
  { id: "vip-customer-rewards", title: "VIP Customer Rewards", status: "Draft", start: "", end: "", attempts: "0", winners: 0, prizes: [{ name: "VIP Lounge Pass", qty: 10, awarded: 0 }, { name: "Gift Card $50", qty: 100, awarded: 0 }], description: "Exclusive rewards for loyalty members.", maxAttempts: 1, requireOffers: true, created: "Aug 15, 2026", updated: "Aug 15, 2026", seed: "vip" },
  { id: "black-friday-bonanza", title: "Black Friday Bonanza", status: "Inactive", start: "2025-11-28", end: "2025-12-05", attempts: "3.3k", winners: 284, prizes: [{ name: "Smart TV", qty: 2, awarded: 2 }, { name: "Gift Card $50", qty: 100, awarded: 82 }, { name: "Coffee Voucher", qty: 300, awarded: 200 }], description: "Black Friday scratch and win.", maxAttempts: 3, requireOffers: false, created: "Nov 1, 2025", updated: "Dec 6, 2025", seed: "blackfriday" },
];
export interface Winner { id: string; name: string; email: string; company: string; campaign: string; prize: string; wonAt: string; redemption: "Pending" | "Redeemed" }
export const winners: Winner[] = [
  { id: "w1", name: "Alex Chen", email: "alex.chen@acme.com", company: "Acme Corp", campaign: "Summer Lucky Draw 2026", prize: "iPhone 15", wonAt: "Jul 14, 2026 · 10:22 AM", redemption: "Pending" },
  { id: "w2", name: "Maria Santos", email: "m.santos@retailco.io", company: "RetailCo", campaign: "Summer Lucky Draw 2026", prize: "AirPods Pro", wonAt: "Jul 11, 2026 · 3:45 PM", redemption: "Redeemed" },
  { id: "w3", name: "James Wilson", email: "j.wilson@techsol.com", company: "Tech Solutions", campaign: "Summer Lucky Draw 2026", prize: "Gift Card $50", wonAt: "Jul 8, 2026 · 2:10 PM", redemption: "Pending" },
  { id: "w4", name: "Sarah Kim", email: "s.kim@globalbrands.net", company: "Global Brands", campaign: "Summer Lucky Draw 2026", prize: "Coffee Voucher", wonAt: "Jul 3, 2026 · 11:55 AM", redemption: "Redeemed" },
  { id: "w5", name: "David Park", email: "d.park@innovate.io", company: "Innovate Inc", campaign: "Summer Lucky Draw 2026", prize: "iPhone 15", wonAt: "Jun 28, 2026 · 4:30 PM", redemption: "Pending" },
  { id: "w6", name: "Rachel Lee", email: "r.lee@acme.com", company: "Acme Corp", campaign: "Summer Lucky Draw 2026", prize: "AirPods Pro", wonAt: "Jun 19, 2026 · 1:22 PM", redemption: "Redeemed" },
];
export const artworks = ["Gold Confetti", "Gift Boxes", "Scratch Card", "Wrapped Gift", "Holiday Prizes", "Festive Gifts", "Confetti Party", "New Year", "VIP Black Card", "Gold & Dice", "Black Friday", "Celebration"];

/* ---------- Notifications ---------- */
export type NotifKind = "sync-success" | "screen-offline" | "sync-failed" | "license-limit" | "screen-online" | "campaign" | "license-expiring" | "company" | "campaign-updated" | "platform";
export interface Notification { id: string; kind: NotifKind; title: string; body: string; company: string; when: string; unread?: boolean; group: "Today" | "Earlier"; detail: string; priority: "Low" | "Medium" | "High"; related: string; action: string }
export const notifications: Notification[] = [
  { id: "n1", kind: "sync-success", title: "Content sync successful", body: '"Holiday Promo" synced to 12 screens at Innovate Inc.', company: "Innovate Inc", when: "Yesterday · 11:22 PM", group: "Today", detail: 'The playlist "Holiday Promo" was successfully published and synced to all 12 active screens at Innovate Inc. Average sync time was 4.2 seconds per screen. All screens are now displaying updated content.', priority: "Low", related: "Holiday Promo playlist", action: "View Screen" },
  { id: "n2", kind: "screen-offline", title: "Screen went offline", body: "Lobby Display A stopped responding.", company: "Acme Corp", when: "Today · 9:14 AM", unread: true, group: "Today", detail: "Lobby Display A at Acme Corp has not sent a heartbeat for 5 minutes. The last known IP was 192.168.1.101. Check the device power and network connection.", priority: "High", related: "Lobby Display A", action: "View Screen" },
  { id: "n3", kind: "sync-failed", title: "Content sync failed", body: '"Summer Sale" playlist failed to sync to 3 screens.', company: "RetailCo", when: "Today · 8:47 AM", unread: true, group: "Today", detail: 'The playlist "Summer Sale" could not be delivered to 3 of 8 screens at RetailCo due to network timeouts. The system will retry automatically every 10 minutes.', priority: "High", related: "Summer Sale playlist", action: "View Playlist" },
  { id: "n4", kind: "license-limit", title: "License limit reached", body: "Tech Solutions has used all 10 screen licenses.", company: "Tech Solutions", when: "Today · 7:30 AM", unread: true, group: "Today", detail: "Tech Solutions has paired 10 of 10 licensed screens. New devices cannot be paired until the screen limit is increased or an existing screen is unpaired.", priority: "Medium", related: "Tech Solutions license", action: "View License" },
  { id: "n5", kind: "screen-online", title: "Screen back online", body: "Entrance Kiosk at Global Brands is online.", company: "Global Brands", when: "Today · 6:55 AM", unread: true, group: "Today", detail: "Entrance Kiosk at Global Brands reconnected after 42 minutes offline and resumed playback of its assigned content.", priority: "Low", related: "Entrance Kiosk", action: "View Screen" },
  { id: "n6", kind: "campaign", title: "Campaign is now live", body: '"Summer Lucky Draw 2026" activated and serving users.', company: "Platform", when: "Today · 6:00 AM", group: "Today", detail: 'The scratch card campaign "Summer Lucky Draw 2026" reached its scheduled start time and is now accepting attempts.', priority: "Low", related: "Summer Lucky Draw 2026", action: "View Campaign" },
  { id: "n7", kind: "license-expiring", title: "License expiring soon", body: "Acme Corp license expires in 7 days.", company: "Acme Corp", when: "Yesterday · 3:45 PM", group: "Today", detail: "The license for Acme Corp will expire on Sep 15, 2026. Renew to avoid service interruption for 14 screens.", priority: "Medium", related: "Acme Corp license", action: "View License" },
  { id: "n8", kind: "screen-offline", title: "Screen went offline", body: "Warehouse Display 2 at RetailCo is offline.", company: "RetailCo", when: "Yesterday · 2:10 PM", group: "Today", detail: "Warehouse Display 2 at RetailCo stopped sending heartbeats.", priority: "High", related: "Warehouse Display 2", action: "View Screen" },
  { id: "n9", kind: "company", title: "New company onboarded", body: '"FreshMart Co." was added with 5 screen licenses.', company: "FreshMart Co.", when: "Yesterday · 10:15 AM", group: "Today", detail: "FreshMart Co. was created by Super Admin with an initial allocation of 5 screen licenses.", priority: "Low", related: "FreshMart Co.", action: "View Company" },
  { id: "n10", kind: "campaign-updated", title: "Campaign updated", body: '"Holiday Season Prizes" prize inventory was modified.', company: "Platform", when: "Yesterday · 9:00 AM", group: "Today", detail: 'Prize inventory for "Holiday Season Prizes" was changed: Gift Card $25 quantity increased from 200 to 300.', priority: "Low", related: "Holiday Season Prizes", action: "View Campaign" },
  { id: "n11", kind: "platform", title: "Platform update deployed", body: "DSP Admin v2.4.1 — Scratch & Win module launched.", company: "Platform", when: "Sep 7 · 1:00 AM", group: "Earlier", detail: "Version 2.4.1 introduces the Scratch & Win module, winner tracking, and performance improvements.", priority: "Low", related: "Release notes", action: "View Release Notes" },
  { id: "n12", kind: "sync-failed", title: "Content sync failed", body: "Playlist sync timed out for Global Brands — 2 screens.", company: "Global Brands", when: "Sep 6 · 4:38 PM", group: "Earlier", detail: "Two screens at Global Brands timed out during sync.", priority: "Medium", related: "Global Brands", action: "View Screens" },
  { id: "n13", kind: "license-expiring", title: "License expiring soon", body: "Innovate Inc license expires in 14 days.", company: "Innovate Inc", when: "Sep 5 · 8:06 AM", group: "Earlier", detail: "The license for Innovate Inc will expire on Sep 19, 2026.", priority: "Medium", related: "Innovate Inc license", action: "View License" },
  { id: "n14", kind: "screen-online", title: "Screen back online", body: "Warehouse Display 2 at RetailCo recovered.", company: "RetailCo", when: "Sep 4 · 8:12 AM", group: "Earlier", detail: "Warehouse Display 2 reconnected and resumed playback.", priority: "Low", related: "Warehouse Display 2", action: "View Screen" },
];

/* ---------- Activity ---------- */
export type ActivityStatus = "Successful" | "Pending" | "Failed";
export interface ActivityEntry { id: string; action: string; summary: string; by: string; role: string; company: string; resource: string; resourceSub: string; resourceType: string; status: ActivityStatus; when: string; detail: string }
export const activityLog: ActivityEntry[] = [
  { id: "a1", action: "Screen Paired", summary: "SCR-0092 paired to Acme Corp", by: "John Martinez", role: "Super Admin", company: "Acme Corp", resource: "Reception Display B", resourceSub: "SCR-0092", resourceType: "Screen", status: "Successful", when: "Today · 10:22 AM", detail: "Screen SCR-0092 (BrightSign XT1145, firmware v8.5.42) was paired using code 7F3K-9QZM. Placed in the default group and ready for content assignment." },
  { id: "a2", action: "Playlist Published", summary: '"Summer Offers" published to Lobby Display A', by: "Sarah Kim", role: "Super Admin", company: "Acme Corp", resource: "Lobby Display A", resourceSub: "Summer Offers · 12 items", resourceType: "Playlist", status: "Successful", when: "Today · 9:47 AM", detail: 'Playlist "Summer Offers" (12 items, 4m 20s) was published to Lobby Display A. The screen acknowledged the update within 6 seconds.' },
  { id: "a3", action: "License Limit Changed", summary: "Screen limit increased 10 → 15 for Tech Solutions", by: "John Martinez", role: "Super Admin", company: "Tech Solutions", resource: "Tech Solutions License", resourceSub: "10 → 15 screens", resourceType: "License", status: "Successful", when: "Today · 9:10 AM", detail: "The screen limit for Tech Solutions was increased from 10 to 15. Five additional screens can now be paired." },
  { id: "a4", action: "Remote Screen Refresh", summary: "Refresh requested on Food Court TV — awaiting acknowledgement", by: "System", role: "System", company: "RetailCo", resource: "Food Court TV", resourceSub: "SCR-0055", resourceType: "Screen", status: "Pending", when: "Today · 8:50 AM", detail: "A remote refresh was requested for Food Court TV. The device has not yet acknowledged the command." },
  { id: "a5", action: "Group Content Published", summary: '"Mall Screens" group push failed — 2 of 8 screens offline', by: "Sarah Kim", role: "Super Admin", company: "Global Brands", resource: "Mall Screens", resourceSub: "6/8 synced", resourceType: "Screen Group", status: "Failed", when: "Today · 8:30 AM", detail: "Content push to the Mall Screens group completed on 6 of 8 screens. Two screens were offline and will receive the content when they reconnect." },
  { id: "a6", action: "Company Created", summary: '"FreshMart Co." onboarded with 5 screen licenses', by: "John Martinez", role: "Super Admin", company: "FreshMart Co.", resource: "FreshMart Co.", resourceSub: "5 licenses · Standard", resourceType: "Company", status: "Successful", when: "Yesterday · 4:15 PM", detail: "FreshMart Co. was created with a Standard plan and 5 screen licenses." },
  { id: "a7", action: "Player Restart", summary: "Warehouse Display 2 rebooted and reconnected", by: "Sarah Kim", role: "Super Admin", company: "RetailCo", resource: "Warehouse Display 2", resourceSub: "SCR-0055 · 42s reboot", resourceType: "Screen", status: "Successful", when: "Yesterday · 3:30 PM", detail: "Warehouse Display 2 was restarted remotely. The player reconnected after 42 seconds." },
  { id: "a8", action: "License Suspended", summary: "Innovate Inc license suspended for non-payment", by: "John Martinez", role: "Super Admin", company: "Innovate Inc", resource: "Innovate Inc License", resourceSub: "8 screens suspended", resourceType: "License", status: "Successful", when: "Yesterday · 11:00 AM", detail: "The Innovate Inc license was suspended. All 8 paired screens stopped playback." },
  { id: "a9", action: "Screen Unpaired", summary: "Entrance Kiosk removed from Global Brands", by: "Sarah Kim", role: "Super Admin", company: "Global Brands", resource: "Entrance Kiosk", resourceSub: "SCR-0034", resourceType: "Screen", status: "Successful", when: "Yesterday · 10:05 AM", detail: "Entrance Kiosk was unpaired and its license slot released." },
  { id: "a10", action: "Playlist Published", summary: '"Brand Refresh" failed — Reception A is offline', by: "Sarah Kim", role: "Super Admin", company: "Global Brands", resource: "Reception A", resourceSub: "Queued for retry", resourceType: "Playlist", status: "Failed", when: "Sep 8 · 1:15 PM", detail: 'Playlist "Brand Refresh" could not be delivered because Reception A is offline. The publish is queued for retry.' },
  { id: "a11", action: "Company Updated", summary: "Acme Corp billing contact and address updated", by: "John Martinez", role: "Super Admin", company: "Acme Corp", resource: "Acme Corp", resourceSub: "Billing info", resourceType: "Company", status: "Successful", when: "Sep 8 · 2:40 PM", detail: "Billing contact and postal address for Acme Corp were updated." },
  { id: "a12", action: "License Reactivated", summary: "RetailCo license restored after payment confirmation", by: "System", role: "System", company: "RetailCo", resource: "RetailCo License", resourceSub: "10 screens · +12 months", resourceType: "License", status: "Successful", when: "Sep 7 · 9:00 AM", detail: "The RetailCo license was reactivated after payment was confirmed. Term extended by 12 months." },
  { id: "a13", action: "Group Content Published", summary: '"Holiday Promo" distributed to Store Screens — 12 screens', by: "John Martinez", role: "Super Admin", company: "Innovate Inc", resource: "Store Screens", resourceSub: "12/12 synced", resourceType: "Screen Group", status: "Successful", when: "Sep 6 · 3:20 PM", detail: 'Playlist "Holiday Promo" was distributed to all 12 screens in the Store Screens group.' },
  { id: "a14", action: "Screen Paired", summary: "First screen paired for FreshMart Co.", by: "John Martinez", role: "Super Admin", company: "FreshMart Co.", resource: "Digital Menu Board", resourceSub: "SCR-0101 · First screen", resourceType: "Screen", status: "Successful", when: "Sep 5 · 11:30 AM", detail: "Digital Menu Board became the first screen paired to FreshMart Co." },
  { id: "a15", action: "License Limit Changed", summary: "Global Brands license reduced 20 → 15 screens", by: "Sarah Kim", role: "Super Admin", company: "Global Brands", resource: "Global Brands License", resourceSub: "20 → 15 screens", resourceType: "License", status: "Successful", when: "Sep 4 · 10:00 AM", detail: "The Global Brands screen limit was reduced from 20 to 15 at the customer's request." },
];
