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
