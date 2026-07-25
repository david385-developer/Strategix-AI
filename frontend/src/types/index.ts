export type CampaignStatus = "active" | "draft" | "scheduled" | "completed" | "paused";
export type CampaignChannel = "instagram" | "linkedin" | "facebook" | "twitter" | "email" | "blog";
export type ContentStatus = "scheduled" | "draft" | "published" | "approval";
export type ContentType = "instagram" | "linkedin" | "facebook" | "twitter" | "email" | "blog" | "cta" | "hashtags" | "image-prompt";
export type MemberRole = "owner" | "admin" | "editor" | "viewer";
export type TaskStatus = "todo" | "in-progress" | "review" | "done";

export interface Campaign {
  id: string;
  name: string;
  status: CampaignStatus;
  channel: CampaignChannel[];
  budget: number;
  spent: number;
  startDate: string;
  endDate: string;
  progress: number;
  goal: string;
  reach: number;
  engagement: number;
  conversions: number;
  color: string;
  owner: { name: string; initials: string };
}

export interface ContentItem {
  id: string;
  type: ContentType;
  platform: string;
  title: string;
  body: string;
  caption?: string;
  hashtags?: string[];
  cta?: string;
  status: ContentStatus;
  scheduledFor?: string;
  campaign?: string;
  favorite?: boolean;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  platform: CampaignChannel;
  status: ContentStatus;
  time?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: MemberRole;
  initials: string;
  color: string;
  tasksAssigned: number;
  tasksCompleted: number;
  lastActive: string;
}

export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  assignee: string;
  dueDate: string;
  campaign?: string;
}

export interface Activity {
  id: string;
  user: string;
  initials: string;
  action: string;
  target: string;
  time: string;
  type: "created" | "updated" | "approved" | "commented" | "published";
}

export interface Notification {
  id: string;
  icon: "approval" | "mention" | "published" | "ai" | "comment" | "system";
  title: string;
  description: string;
  time: string;
  read: boolean;
  group: "today" | "yesterday" | "this-week";
}

export interface AIConversation {
  id: string;
  title: string;
  preview: string;
  time: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  time: string;
}
