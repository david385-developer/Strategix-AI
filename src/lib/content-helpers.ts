import {
  Instagram,
  Linkedin,
  Facebook,
  Twitter,
  Mail,
  FileText,
  Hash,
  MousePointerClick,
  Image as ImageIcon,
  type LucideIcon,
} from "lucide-react";
import type { CampaignStatus, ContentStatus, ContentType, MemberRole, TaskStatus } from "@/types";

export const platformIcons: Record<string, LucideIcon> = {
  instagram: Instagram,
  linkedin: Linkedin,
  facebook: Facebook,
  twitter: Twitter,
  email: Mail,
  blog: FileText,
  "image-prompt": ImageIcon,
};

export const contentTypeIcon: Record<ContentType, LucideIcon> = {
  instagram: Instagram,
  linkedin: Linkedin,
  facebook: Facebook,
  twitter: Twitter,
  email: Mail,
  blog: FileText,
  cta: MousePointerClick,
  hashtags: Hash,
  "image-prompt": ImageIcon,
};

export const contentTypeLabel: Record<ContentType, string> = {
  instagram: "Instagram",
  linkedin: "LinkedIn",
  facebook: "Facebook",
  twitter: "Twitter",
  email: "Email",
  blog: "Blog",
  cta: "Call to Action",
  hashtags: "Hashtags",
  "image-prompt": "Image Prompt",
};

export const campaignStatusConfig: Record<
  CampaignStatus,
  { label: string; variant: "default" | "success" | "warning" | "destructive" | "accent" | "muted"; dot: string }
> = {
  active: { label: "Active", variant: "success", dot: "bg-success" },
  draft: { label: "Draft", variant: "muted", dot: "bg-muted-foreground" },
  scheduled: { label: "Scheduled", variant: "warning", dot: "bg-warning" },
  completed: { label: "Completed", variant: "default", dot: "bg-primary" },
  paused: { label: "Paused", variant: "destructive", dot: "bg-destructive" },
};

export const contentStatusConfig: Record<
  ContentStatus,
  { label: string; className: string; dot: string }
> = {
  scheduled: { label: "Scheduled", className: "bg-warning/10 text-warning", dot: "bg-warning" },
  draft: { label: "Draft", className: "bg-muted text-muted-foreground", dot: "bg-muted-foreground" },
  published: { label: "Published", className: "bg-success/10 text-success", dot: "bg-success" },
  approval: { label: "Approval", className: "bg-primary/10 text-primary", dot: "bg-primary" },
};

export const roleConfig: Record<MemberRole, { label: string; className: string }> = {
  owner: { label: "Owner", className: "bg-primary/10 text-primary" },
  admin: { label: "Admin", className: "bg-accent/10 text-accent" },
  editor: { label: "Editor", className: "bg-chart-4/10 text-chart-4" },
  viewer: { label: "Viewer", className: "bg-muted text-muted-foreground" },
};

export const taskStatusConfig: Record<TaskStatus, { label: string; className: string }> = {
  todo: { label: "To Do", className: "bg-muted text-muted-foreground" },
  "in-progress": { label: "In Progress", className: "bg-primary/10 text-primary" },
  review: { label: "In Review", className: "bg-warning/10 text-warning" },
  done: { label: "Done", className: "bg-success/10 text-success" },
};

export const channelColors: Record<string, string> = {
  instagram: "hsl(326 75% 56%)",
  linkedin: "hsl(210 100% 50%)",
  facebook: "hsl(221 83% 53%)",
  twitter: "hsl(203 89% 53%)",
  email: "hsl(262 83% 58%)",
  blog: "hsl(243 75% 59%)",
};
