/* Mock data for the Customer Web Dashboard (portal). Content follows the Figma "Customer Web Dashboard" page. */

export type PortalStatus = "Online" | "Offline" | "Error";

export interface PortalScreen { id: string; name: string; location: string; status: PortalStatus; content: string; group?: string; groupId?: string; lastSync: string; orientation: "Landscape" | "Portrait"; seed: string; tags: string[]; device: string; resolution: string; firmware: string; ip: string }
export interface PortalGroup { id: string; name: string; description: string; screenIds: string[]; content: string; seed: string }
export type PortalMediaType = "JPG/PNG" | "MP4" | "PDF";
export interface PortalMedia { id: string; name: string; type: PortalMediaType; status: "Ready" | "Processing" | "Failed"; size: string; uploaded: string; usedIn: string[]; seed: string; dimensions?: string; pages?: number; duration?: string; uploadedBy: string; tags: string[] }
export interface PortalPlaylistItem { id: string; mediaId: string; name: string; type: "IMG" | "MP4" | "PDF"; duration: number; seed: string }
export interface PortalPlaylist { id: string; name: string; items: PortalPlaylistItem[]; status: "Published" | "Draft"; assignedTo: string[]; updated: string }
export type OfferCategory = "Hardware" | "Software" | "Services" | "Support";
export interface PortalOffer { id: string; title: string; category: OfferCategory; summary: string; endsOn?: string; seed: string; body: string[]; included: string[]; steps: string[]; contact: { name: string; role: string; email: string; phone: string } }
export interface PortalCampaign { id: string; title: string; description: string; endsOn: string; prizes: { name: string; value: string }[]; attemptsPerAccount: number; seed: string; footnote: string }
export interface PortalUser { id: string; name: string; email: string; role: "Admin" | "Editor" | "Viewer"; status: "Active" | "Invited" | "Suspended"; seed: string; you?: boolean }
export interface PortalActivity { id: string; text: string; when: string; kind: "publish" | "offline" | "media" | "schedule" | "pair" | "upload" }
export interface PortalTemplateField { key: string; label: string; required?: boolean; placeholder: string; defaultValue: string }
export interface PortalTemplate { id: string; name: string; category: "Retail" | "Corporate" | "Food & Beverage"; orientation: "Landscape" | "Portrait"; fields: PortalTemplateField[] }

export const portalUser = { name: "Sarah Mitchell", email: "sarah.mitchell@acmecorp.com", role: "Admin", title: "Marketing Director", phone: "+44 7700 900 147", seed: "sarahm" };
export const portalCompany = { name: "Acme Corp", website: "https://acmecorp.com", industry: "", phone: "+44 20 7946 0000", timezone: "", accountId: "ACC-2024-00142", plan: "Platform Pro", contractStart: "1 March 2024", status: "Active" };

const device = { device: "BrightSign XT1145", resolution: "1920×1080", firmware: "v8.5.42", ip: "192.168.1.101" };

export const portalScreens: PortalScreen[] = [
  { id: "reception-display", name: "Reception Display", location: "Main Lobby, Floor 1", status: "Online", content: "Summer Offers", group: "Lobby & Entrances", groupId: "lobby-entrances", lastSync: "2 min ago", orientation: "Landscape", seed: "lobby1", tags: ["lobby", "customer-facing"], ...device },
  { id: "lobby-display-a", name: "Lobby Display A", location: "East Entrance", status: "Online", content: "Brand Refresh", group: "Lobby & Entrances", groupId: "lobby-entrances", lastSync: "11 min ago", orientation: "Landscape", seed: "entrance", tags: ["lobby"], ...device },
  { id: "cafeteria-screen", name: "Cafeteria Screen", location: "Level 2, Break Room", status: "Online", content: "Daily Menu", group: "Cafeteria Screens", groupId: "cafeteria-screens", lastSync: "28 min ago", orientation: "Landscape", seed: "menu3", tags: ["cafeteria"], ...device },
  { id: "conference-room-b", name: "Conference Room B", location: "Level 3, Meeting Rooms", status: "Offline", content: "Corporate Comms", lastSync: "4 hrs ago", orientation: "Landscape", seed: "office", tags: ["meeting"], ...device },
  { id: "warehouse-display", name: "Warehouse Display", location: "Loading Bay, Ground", status: "Online", content: "Safety Notices", group: "Warehouse & Safety", groupId: "warehouse-safety", lastSync: "1 hr ago", orientation: "Landscape", seed: "atrium", tags: ["warehouse", "safety"], ...device },
  { id: "digital-menu-board", name: "Digital Menu Board", location: "Canteen Entrance", status: "Online", content: "Daily Menu", group: "Cafeteria Screens", groupId: "cafeteria-screens", lastSync: "35 min ago", orientation: "Landscape", seed: "cafe", tags: ["cafeteria"], ...device },
  { id: "showroom-screen", name: "Showroom Screen", location: "Customer Showroom", status: "Error", content: "Product Showcase", lastSync: "2 days ago", orientation: "Portrait", seed: "fashion", tags: ["showroom"], ...device },
  { id: "exit-signage", name: "Exit Signage", location: "North Exit", status: "Online", content: "Brand Refresh", group: "Lobby & Entrances", groupId: "lobby-entrances", lastSync: "5 min ago", orientation: "Landscape", seed: "gym", tags: ["exit"], ...device },
];

export const portalGroups: PortalGroup[] = [
  { id: "lobby-entrances", name: "Lobby & Entrances", description: "All public-facing entrance and lobby displays.", screenIds: ["reception-display", "lobby-display-a", "exit-signage"], content: "Daily Menu", seed: "lobby1" },
  { id: "cafeteria-screens", name: "Cafeteria Screens", description: "Food service and break room displays.", screenIds: ["cafeteria-screen", "digital-menu-board"], content: "Daily Menu", seed: "menu3" },
  { id: "warehouse-safety", name: "Warehouse & Safety", description: "Operational and safety notice screens.", screenIds: ["warehouse-display"], content: "Safety Notices", seed: "atrium" },
];

export const portalMedia: PortalMedia[] = [
  { id: "summer-promo-hero", name: "Summer_Promo_Hero.jpg", type: "JPG/PNG", status: "Ready", size: "2.4 MB", uploaded: "12 Aug 2026, 09:14", usedIn: ["Summer Offers", "Brand Refresh"], seed: "lobby1", dimensions: "1920 × 1080 px", uploadedBy: "Sarah Mitchell", tags: ["promotion", "summer"] },
  { id: "brand-refresh-banner", name: "Brand_Refresh_Banner.png", type: "JPG/PNG", status: "Ready", size: "1.8 MB", uploaded: "10 Aug 2026, 14:32", usedIn: ["Brand Refresh"], seed: "entrance", dimensions: "1920 × 1080 px", uploadedBy: "James Pearson", tags: ["brand"] },
  { id: "product-showcase-loop", name: "Product_Showcase_Loop.mp4", type: "MP4", status: "Ready", size: "46.2 MB", uploaded: "8 Aug 2026, 11:05", usedIn: ["Product Showcase"], seed: "gym", duration: "0:45", uploadedBy: "Sarah Mitchell", tags: ["product"] },
  { id: "daily-menu-board", name: "Daily_Menu_Board.jpg", type: "JPG/PNG", status: "Ready", size: "3.1 MB", uploaded: "5 Aug 2026, 08:47", usedIn: ["Daily Menu"], seed: "menu3", dimensions: "1920 × 1080 px", uploadedBy: "Lucy Chen", tags: ["menu"] },
  { id: "safety-procedures-guide", name: "Safety_Procedures_Guide.pdf", type: "PDF", status: "Ready", size: "5.6 MB", uploaded: "1 Aug 2026, 16:20", usedIn: ["Safety Notices"], seed: "pdf", pages: 8, uploadedBy: "James Pearson", tags: ["safety"] },
  { id: "acme-intro-video", name: "Acme_Intro_Video.mp4", type: "MP4", status: "Processing", size: "112.4 MB", uploaded: "Today, 07:30", usedIn: [], seed: "office", duration: "2:10", uploadedBy: "Sarah Mitchell", tags: [] },
  { id: "q3-corporate-report", name: "Q3_Corporate_Report.pdf", type: "PDF", status: "Failed", size: "8.2 MB", uploaded: "Today, 06:15", usedIn: [], seed: "pdf2", pages: 24, uploadedBy: "Marcus Webb", tags: [] },
  { id: "lobby-welcome-slide", name: "Lobby_Welcome_Slide.png", type: "JPG/PNG", status: "Ready", size: "0.9 MB", uploaded: "28 Jul 2026, 10:11", usedIn: ["Summer Offers", "Brand Refresh"], seed: "fashion", dimensions: "1920 × 1080 px", uploadedBy: "Sarah Mitchell", tags: ["lobby"] },
];

const pi = (id: string, mediaId: string, duration: number): PortalPlaylistItem => {
  const m = portalMedia.find((x) => x.id === mediaId)!;
  return { id, mediaId, name: m.name.replace(/\.[a-z0-9]+$/i, ""), type: m.type === "MP4" ? "MP4" : m.type === "PDF" ? "PDF" : "IMG", duration, seed: m.seed };
};

export const portalPlaylists: PortalPlaylist[] = [
  { id: "summer-offers", name: "Summer Offers", status: "Published", assignedTo: ["Reception Display", "Lobby Display A"], updated: "Today, 14:38", items: [pi("so1", "summer-promo-hero", 15), pi("so2", "product-showcase-loop", 45), pi("so3", "lobby-welcome-slide", 10), pi("so4", "brand-refresh-banner", 12), pi("so5", "daily-menu-board", 10), pi("so6", "summer-promo-hero", 10)] },
  { id: "daily-menu", name: "Daily Menu", status: "Published", assignedTo: ["Cafeteria Screens"], updated: "Yesterday, 17:02", items: [pi("dm1", "daily-menu-board", 20), pi("dm2", "product-showcase-loop", 45), pi("dm3", "summer-promo-hero", 10)] },
  { id: "safety-operations", name: "Safety & Operations", status: "Draft", assignedTo: [], updated: "2 days ago", items: [pi("sp1", "safety-procedures-guide", 25), pi("sp2", "brand-refresh-banner", 15)] },
];

export const portalPublishPlaylists = [
  { id: "summer-offers", name: "Summer Offers", items: 8, duration: "3m 20s", seed: "lobby1" },
  { id: "brand-refresh", name: "Brand Refresh", items: 5, duration: "2m 00s", seed: "entrance" },
  { id: "daily-menu", name: "Daily Menu", items: 6, duration: "2m 30s", seed: "menu3" },
  { id: "corporate-comms", name: "Corporate Comms", items: 4, duration: "1m 45s", seed: "office" },
  { id: "safety-notices", name: "Safety Notices", items: 3, duration: "1m 10s", seed: "atrium" },
  { id: "product-showcase", name: "Product Showcase", items: 10, duration: "4m 00s", seed: "gym" },
];

const contact = { name: "James Whitfield", role: "Account Manager", email: "j.whitfield@signageplatform.com", phone: "+44 20 7946 0112" };

export const portalOffers: PortalOffer[] = [
  { id: "commercial-display-upgrade", title: "Commercial Display Upgrade Programme", category: "Hardware", summary: "Trade in your existing screens and upgrade to 4K commercial-grade displays at preferential pricing.", seed: "fashion", body: ["As a valued Acme Corp account holder, you're eligible for our exclusive trade-in upgrade programme. Exchange your current displays for our latest 4K UHD commercial-grade screens and receive a guaranteed trade-in credit applied directly to your new order.", "These displays are engineered for 24/7 operation, with 500 nit brightness, built-in remote management, and a 3-year on-site warranty included as standard."], included: ["4K UHD · 500 nit brightness", "24/7 continuous operation rating", "3-year on-site warranty", "Trade-in credit available"], steps: ["Contact your account manager to request a site assessment and trade-in valuation.", "Your account manager will send a formal quotation within 2 business days.", "Confirm your order and arrange a convenient installation date.", "Our certified engineers will install and configure your new displays."], contact },
  { id: "proplayer-4-bundle", title: "ProPlayer 4 Media Player Bundle", category: "Hardware", summary: "Get our latest 4K media player pre-configured for your account, with three months of priority support included.", seed: "atrium", body: ["The ProPlayer 4 is our most reliable signage player yet. Each unit ships pre-paired to your Acme Corp account so it plays your content within minutes of being plugged in.", "Bundles include a mounting kit, HDMI 2.1 cable, and three months of priority support."], included: ["4K60 HDR output", "Pre-paired to your account", "Mounting kit and cabling", "3 months priority support"], steps: ["Tell your account manager how many players you need.", "Receive a quotation within 2 business days.", "Confirm and choose delivery dates per site.", "Plug in, power on, and your content plays."], contact },
  { id: "platform-pro-upgrade", title: "Platform Pro — Upgrade Offer", category: "Software", summary: "Unlock advanced scheduling, analytics dashboards, and multi-site management at a preferential renewal rate.", endsOn: "15 October 2026", seed: "office", body: ["Upgrade to Platform Pro before 15 October and lock in a preferential renewal rate for 24 months.", "Pro adds advanced scheduling, analytics dashboards, additional user seats, and multi-site management."], included: ["Advanced scheduling", "Analytics dashboards", "10 additional user seats", "Multi-site management"], steps: ["Request an upgrade quotation from your account manager.", "Review the 24-month preferential terms.", "Confirm and we switch your account the same day."], contact },
  { id: "content-creation-service", title: "Professional Content Creation Service", category: "Services", summary: "Have our design studio produce a full set of on-brand signage templates and animated creatives for your locations.", seed: "hotel", body: ["Our in-house studio designs signage content that matches your brand guidelines and is optimised for your screen sizes and orientations.", "Packages include static templates, animated loops, and seasonal refreshes."], included: ["Brand-matched templates", "Animated loops", "Seasonal refresh", "Unlimited revisions in scope"], steps: ["Share your brand guidelines with your account manager.", "Receive a creative proposal and quotation.", "Approve concepts and receive production files.", "Templates appear in your Layouts / Templates library."], contact },
  { id: "extended-warranty", title: "Extended Warranty & Priority Support", category: "Support", summary: "Extend hardware warranty coverage and gain access to a priority support line with guaranteed 4-hour response times.", seed: "reception", body: ["Extend coverage on all paired players and displays to five years, with advance replacement and a dedicated priority support line.", "Response time is guaranteed within 4 business hours."], included: ["5-year hardware coverage", "Advance replacement", "Priority support line", "4-hour response SLA"], steps: ["Request a coverage quotation for your paired devices.", "Review the coverage schedule.", "Confirm and coverage starts immediately."], contact },
  { id: "network-assessment", title: "Multi-Site Network Assessment", category: "Services", summary: "A free professional audit of your screen network to identify performance gaps and optimisation opportunities.", endsOn: "30 September 2026", seed: "vip", body: ["Our engineers review your network topology, player placement, and content delivery to identify performance gaps.", "You receive a written report with prioritised recommendations. The assessment is free for Acme Corp until 30 September."], included: ["Network topology review", "Player health audit", "Content delivery analysis", "Written recommendations"], steps: ["Book an assessment slot through your account manager.", "Provide site access details.", "Receive your report within 5 business days."], contact },
];

export const portalCampaign: PortalCampaign = {
  id: "summer-rewards-draw", title: "Summer Rewards Draw", description: "Scratch and reveal your instant prize. One chance per eligible Acme Corp account — prizes allocated by our team.", endsOn: "30 September 2026",
  prizes: [{ name: "ProPlayer 4 Media Bundle", value: "£640" }, { name: "6-Month Platform Pro Upgrade", value: "£480" }, { name: "Professional Content Pack", value: "£320" }],
  attemptsPerAccount: 1, seed: "fashion", footnote: "SignagePlatform Partner Programme · Prizes allocated by account managers",
};

export const portalUsers: PortalUser[] = [
  { id: "sarah-mitchell", name: "Sarah Mitchell", email: "sarah.mitchell@acmecorp.com", role: "Admin", status: "Active", seed: "sarahm", you: true },
  { id: "james-pearson", name: "James Pearson", email: "james.pearson@acmecorp.com", role: "Editor", status: "Active", seed: "jamesp" },
  { id: "lucy-chen", name: "Lucy Chen", email: "lucy.chen@acmecorp.com", role: "Viewer", status: "Active", seed: "lucyc" },
  { id: "marcus-webb", name: "Marcus Webb", email: "marcus.webb@acmecorp.com", role: "Editor", status: "Invited", seed: "marcusw" },
  { id: "emma-rodriguez", name: "Emma Rodriguez", email: "emma.rodriguez@acmecorp.com", role: "Viewer", status: "Suspended", seed: "emmar" },
];

export const portalActivity: PortalActivity[] = [
  { id: "pa1", text: '"Summer Offers" published to Reception Display', when: "2 min ago", kind: "publish" },
  { id: "pa2", text: "Conference Room B went offline", when: "4 hrs ago", kind: "offline" },
  { id: "pa3", text: "3 images added to Media Library", when: "6 hrs ago", kind: "media" },
  { id: "pa4", text: "Daily Menu schedule updated for Cafeteria Screen", when: "Yesterday", kind: "schedule" },
  { id: "pa5", text: '"Brand Refresh" published to Lobby Display A', when: "Yesterday", kind: "publish" },
  { id: "pa6", text: "Exit Signage paired to your account", when: "Sep 8", kind: "pair" },
  { id: "pa7", text: 'Video uploaded: "Product Demo Q3.mp4"', when: "Sep 7", kind: "upload" },
];

export const portalTemplates: PortalTemplate[] = [
  { id: "flash-sale", name: "Flash Sale", category: "Retail", orientation: "Landscape", fields: [
    { key: "headline", label: "Headline", required: true, placeholder: "FLASH SALE", defaultValue: "FLASH SALE" },
    { key: "discount", label: "Discount", required: true, placeholder: "50% OFF", defaultValue: "50% OFF" },
    { key: "was", label: "Original Price", required: true, placeholder: "£99.00", defaultValue: "£99.00" },
    { key: "now", label: "Sale Price", required: true, placeholder: "£49.00", defaultValue: "£49.00" },
    { key: "image", label: "Product Image", placeholder: "Paste image URL or leave blank", defaultValue: "" },
  ] },
  { id: "event-announcement", name: "Event Announcement", category: "Corporate", orientation: "Landscape", fields: [
    { key: "kicker", label: "Kicker", placeholder: "YOU'RE INVITED", defaultValue: "YOU'RE INVITED" },
    { key: "title", label: "Event Title", required: true, placeholder: "Q3 All-Hands Meeting", defaultValue: "Q3 All-Hands Meeting" },
    { key: "date", label: "Date", required: true, placeholder: "Thursday, 18 September", defaultValue: "Thursday, 18 September" },
    { key: "time", label: "Time", required: true, placeholder: "2:00 PM – 4:00 PM", defaultValue: "2:00 PM – 4:00 PM" },
  ] },
  { id: "happy-hour", name: "Happy Hour", category: "Food & Beverage", orientation: "Landscape", fields: [
    { key: "title", label: "Title", required: true, placeholder: "HAPPY HOUR", defaultValue: "HAPPY HOUR" },
    { key: "start", label: "Start Time", required: true, placeholder: "5:00 PM", defaultValue: "5:00 PM" },
    { key: "end", label: "End Time", required: true, placeholder: "7:00 PM", defaultValue: "7:00 PM" },
  ] },
];

export function fmtClock(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export const portalStatusTone = (s: PortalStatus) => (s === "Online" ? "green" : s === "Offline" ? "red" : "amber");
