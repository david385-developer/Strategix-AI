export const PLANS = {
  free: {
    id: "free",
    name: "Free",
    monthlyPrice: 0,
    yearlyPrice: 0,
    aiCredits: 50,
    workspaceLimit: 1,
    teamMemberLimit: 1,
    campaignLimit: 1,
    storageLimit: 50 * 1024 * 1024, // 50MB
    mediaLimit: 10,
    aiRequestsLimit: 10,
  },
  starter: {
    id: "starter",
    name: "Starter",
    monthlyPrice: 29,
    yearlyPrice: 290,
    aiCredits: 500,
    workspaceLimit: 2,
    teamMemberLimit: 3,
    campaignLimit: 10,
    storageLimit: 2 * 1024 * 1024 * 1024, // 2GB
    mediaLimit: 100,
    aiRequestsLimit: 200,
  },
  professional: {
    id: "professional",
    name: "Professional",
    monthlyPrice: 79,
    yearlyPrice: 790,
    aiCredits: 2000,
    workspaceLimit: 5,
    teamMemberLimit: 10,
    campaignLimit: 30,
    storageLimit: 10 * 1024 * 1024 * 1024, // 10GB
    mediaLimit: 500,
    aiRequestsLimit: 1000,
  },
  enterprise: {
    id: "enterprise",
    name: "Enterprise",
    monthlyPrice: 249,
    yearlyPrice: 2490,
    aiCredits: 10000,
    workspaceLimit: 20,
    teamMemberLimit: 50,
    campaignLimit: 100,
    storageLimit: 100 * 1024 * 1024 * 1024, // 100GB
    mediaLimit: 2000,
    aiRequestsLimit: 5000,
  },
};

export const getPlanDetails = (planId) => {
  return PLANS[planId?.toLowerCase()] || PLANS.free;
};
