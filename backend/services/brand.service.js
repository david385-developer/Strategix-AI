import BrandProfile from "../models/brandProfile.model.js";
import ApiError from "../utils/apiError.js";
import ActivityService from "./activity.service.js";

class BrandService {
  static async getBrandProfile(workspaceId) {
    let brand = await BrandProfile.findOne({ workspaceId });
    if (!brand) {
      // Create one if it does not exist yet (as a safety fallback)
      brand = new BrandProfile({
        workspaceId,
        businessName: "My Brand",
        industry: "SaaS",
        targetAudience: "Tech Enthusiasts",
        brandTone: "Professional",
      });
      await brand.save();
    }
    return brand;
  }

  static async updateBrandProfile(workspaceId, updateData, userObj = null) {
    const brand = await BrandProfile.findOneAndUpdate(
      { workspaceId },
      { $set: updateData },
      { new: true, runValidators: true }
    );
    if (!brand) {
      throw new ApiError("Brand profile not found", 404);
    }
    if (userObj) {
      await ActivityService.logAndNotify({
        user: userObj.name,
        initials: userObj.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2),
        action: "updated brand profile for",
        target: brand.businessName,
        type: "brand",
        workspaceId,
        notifyTitle: "Brand Profile Updated",
        notifyDesc: `${userObj.name} updated the brand profile details.`,
        notifyIcon: "system"
      });
    }
    return brand;
  }
}

export default BrandService;
