export const getPaginationOptions = (query) => {
  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  let sort = {};
  const order = query.order === "asc" || query.order === "1" ? 1 : -1;

  if (query.sort === "newest") {
    sort = { createdAt: -1 };
  } else if (query.sort === "oldest") {
    sort = { createdAt: 1 };
  } else if (query.sort === "alphabetical") {
    sort = { name: 1, title: 1 };
  } else if (query.sort === "budget") {
    sort = { budget: order };
  } else if (query.sort === "engagement") {
    sort = { engagement: order };
  } else if (query.sort === "createdDate" || query.sort === "createdAt") {
    sort = { createdAt: order };
  } else if (query.sort === "updatedDate" || query.sort === "updatedAt") {
    sort = { updatedAt: order };
  } else {
    // Default fallback
    sort = { createdAt: -1 };
  }

  return { page, limit, skip, sort };
};

export const buildFilterQuery = (query, searchFields = []) => {
  const filter = {};

  // Status
  if (query.status && query.status !== "all") {
    filter.status = query.status;
  }

  // Workspace
  if (query.workspace) {
    filter.workspaceId = query.workspace;
  }

  // Owner
  if (query.owner) {
    filter.ownerId = query.owner;
  }

  // Priority
  if (query.priority) {
    filter.priority = query.priority;
  }

  // Platforms / Channels
  if (query.platform) {
    filter.platform = query.platform;
  }
  if (query.channel) {
    filter.channel = query.channel;
  }

  // Date Range (standard format expected is YYYY-MM-DD)
  if (query.startDate || query.endDate) {
    filter.createdAt = {};
    if (query.startDate) {
      filter.createdAt.$gte = new Date(query.startDate);
    }
    if (query.endDate) {
      filter.createdAt.$lte = new Date(query.endDate);
    }
  }

  // Search keyword across selected fields
  if (query.search && searchFields.length > 0) {
    filter.$or = searchFields.map((field) => ({
      [field]: { $regex: query.search, $options: "i" },
    }));
  }

  return filter;
};

export const getPaginationMetadata = (total, page, limit) => {
  const totalPages = Math.ceil(total / limit);
  return {
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
};
