import type { components } from "./schema";

export type Schemas = components["schemas"];
export type AuthUser = Schemas["AuthUser"];
export type AuthTokens = Schemas["AuthTokens"];
export type Company = Schemas["Company"];
export type License = Schemas["License"];
export type User = Schemas["User"];
export type Screen = Schemas["Screen"];
export type ScreenGroup = Schemas["ScreenGroup"];
export type Media = Schemas["Media"];
export type Playlist = Schemas["Playlist"];
export type PlaylistItem = Schemas["PlaylistItem"];
export type Schedule = Schemas["Schedule"];
export type ActiveAssignment = Schemas["ActiveAssignment"];
export type Layout = Schemas["Layout"];
export type LayoutZone = Schemas["LayoutZone"];
export type Template = Schemas["Template"];
export type TemplateInstance = Schemas["TemplateInstance"];
export type Offer = Schemas["Offer"];
export type Campaign = Schemas["Campaign"];
export type Prize = Schemas["Prize"];
export type Winner = Schemas["Winner"];
export type Eligibility = Schemas["Eligibility"];
export type AttemptResult = Schemas["AttemptResult"];
export type Notification = Schemas["Notification"];
export type ActivityEntry = Schemas["ActivityEntry"];
export type CanvasSet = Schemas["CanvasSet"];
export type PublishResult = Schemas["PublishResult"];

export interface PageMeta { page: number; pageSize: number; total: number; totalPages: number }
export type Page<T> = { data: T[]; meta?: PageMeta };
