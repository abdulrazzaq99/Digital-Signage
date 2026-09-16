import {
  Activity, Bell, Building2, FileBadge, Image as ImageIcon, LayoutDashboard, LayoutTemplate, ListVideo, Monitor, Settings, Tag, Ticket, User,
} from "lucide-react";
import type { ReactNode } from "react";

export interface NavItem { label: string; href: string; icon: ReactNode; children?: { label: string; href: string }[] }
export interface ShellConfig {
  brand: { name: string; subtitle?: string };
  nav: NavItem[];
  user: { name: string; role: string; avatarSeed: string };
  basePath: "/" | "/portal";
  titles: { match: (p: string) => boolean; title: string; subtitle: string }[];
}

export const adminShell: ShellConfig = {
  brand: { name: "DSP Admin" },
  basePath: "/",
  user: { name: "Alex Rivera", role: "Super Admin", avatarSeed: "alexr" },
  nav: [
    { label: "Overview", href: "/", icon: <LayoutDashboard className="h-4 w-4" /> },
    { label: "Companies", href: "/companies", icon: <Building2 className="h-4 w-4" /> },
    { label: "Licenses", href: "/licenses", icon: <FileBadge className="h-4 w-4" /> },
    { label: "Screens", href: "/screens", icon: <Monitor className="h-4 w-4" />, children: [
      { label: "All Screens", href: "/screens" },
      { label: "Screen Groups", href: "/screens/groups" },
      { label: "Synchronized Canvas", href: "/screens/canvas" },
    ] },
    { label: "Media", href: "/media", icon: <ImageIcon className="h-4 w-4" /> },
    { label: "Playlists", href: "/playlists", icon: <ListVideo className="h-4 w-4" /> },
    { label: "Layouts / Templates", href: "/layouts", icon: <LayoutTemplate className="h-4 w-4" /> },
    { label: "Offers / Marketplace", href: "/offers", icon: <Tag className="h-4 w-4" /> },
    { label: "Scratch & Win", href: "/scratch-win", icon: <Ticket className="h-4 w-4" /> },
    { label: "Notifications", href: "/notifications", icon: <Bell className="h-4 w-4" /> },
    { label: "Activity", href: "/activity", icon: <Activity className="h-4 w-4" /> },
    { label: "Settings", href: "/settings", icon: <Settings className="h-4 w-4" /> },
  ],
  titles: [
    { match: (p) => p === "/", title: "Overview", subtitle: "Monitor your platform and manage connected screens." },
    { match: (p) => p.startsWith("/companies"), title: "Companies", subtitle: "Manage customer companies, licenses, and screen capacity." },
    { match: (p) => p.startsWith("/licenses"), title: "License Management", subtitle: "Manage company screen limits and license status." },
    { match: (p) => p.startsWith("/screens/groups"), title: "Screen Group", subtitle: "Organize screens and publish content to groups." },
    { match: (p) => p.startsWith("/screens/canvas"), title: "Synchronized Canvas", subtitle: "Synchronize multiple screens into a single canvas display." },
    { match: (p) => p.startsWith("/screens"), title: "Screens", subtitle: "Monitor, manage and publish content to connected displays." },
    { match: (p) => p.startsWith("/media"), title: "Media", subtitle: "Upload and organize media assets." },
    { match: (p) => p.startsWith("/playlists"), title: "Playlists", subtitle: "Sequence content for your displays." },
    { match: (p) => p.startsWith("/layouts"), title: "Layouts / Templates", subtitle: "Design reusable screen layouts." },
    { match: (p) => p.startsWith("/offers"), title: "Offers / Marketplace", subtitle: "Manage promotional offers." },
    { match: (p) => p.startsWith("/scratch-win"), title: "Scratch & Win", subtitle: "Run interactive campaigns." },
    { match: (p) => p.startsWith("/notifications"), title: "Notifications", subtitle: "Platform alerts and messages." },
    { match: (p) => p.startsWith("/activity"), title: "Activity", subtitle: "Audit log of platform events." },
    { match: (p) => p.startsWith("/settings"), title: "Settings", subtitle: "Configure your platform." },
  ],
};

export const portalShell: ShellConfig = {
  brand: { name: "SignageHub", subtitle: "Customer Portal" },
  basePath: "/portal",
  user: { name: "Sarah Mitchell", role: "Acme Corp", avatarSeed: "sarahm" },
  nav: [
    { label: "Overview", href: "/portal", icon: <LayoutDashboard className="h-4 w-4" /> },
    { label: "Screens", href: "/portal/screens", icon: <Monitor className="h-4 w-4" /> },
    { label: "Media", href: "/portal/media", icon: <ImageIcon className="h-4 w-4" /> },
    { label: "Playlists", href: "/portal/playlists", icon: <ListVideo className="h-4 w-4" /> },
    { label: "Layouts / Templates", href: "/portal/layouts", icon: <LayoutTemplate className="h-4 w-4" /> },
    { label: "Offers", href: "/portal/offers", icon: <Tag className="h-4 w-4" /> },
    { label: "Scratch & Win", href: "/portal/scratch-win", icon: <Ticket className="h-4 w-4" /> },
    { label: "Account", href: "/portal/account", icon: <User className="h-4 w-4" /> },
  ],
  titles: [
    { match: (p) => p === "/portal", title: "Overview", subtitle: "Your screen network at a glance." },
    { match: (p) => p.startsWith("/portal/screens"), title: "Screens", subtitle: "Manage your connected displays." },
    { match: (p) => p.startsWith("/portal/media"), title: "Media", subtitle: "Manage your uploaded content." },
    { match: (p) => p.startsWith("/portal/playlists"), title: "Playlists", subtitle: "Create and manage content sequences for your screens." },
    { match: (p) => p.startsWith("/portal/layouts"), title: "Layout / Template", subtitle: "Create content from approved templates." },
    { match: (p) => p.startsWith("/portal/offers"), title: "Offers", subtitle: "Browse and redeem available offers." },
    { match: (p) => p.startsWith("/portal/scratch-win"), title: "Scratch & Win", subtitle: "View your scratch & win campaigns." },
    { match: (p) => p.startsWith("/portal/account"), title: "Account", subtitle: "Manage your account details." },
  ],
};
