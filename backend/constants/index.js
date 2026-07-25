export const ROLES = {
  OWNER: "owner",
  ADMIN: "admin",
  EDITOR: "editor",
  VIEWER: "viewer",
};

export const CAMPAIGN_STATUS = {
  ACTIVE: "active",
  DRAFT: "draft",
  SCHEDULED: "scheduled",
  COMPLETED: "completed",
  PAUSED: "paused",
};

export const NOTIFICATION_TYPES = {
  APPROVAL: "approval",
  MENTION: "mention",
  PUBLISHED: "published",
  AI: "ai",
  COMMENT: "comment",
  SYSTEM: "system",
};

export const SUPPORTED_PLATFORMS = {
  INSTAGRAM: "instagram",
  LINKEDIN: "linkedin",
  FACEBOOK: "facebook",
  TWITTER: "twitter",
  EMAIL: "email",
  BLOG: "blog",
};

export const AI_MODELS = {
  GROQ_DEFAULT: "llama-3.3-70b-versatile",
};

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
};
