import BrandProfile from "../models/brandProfile.model.js";
import ApiError from "../utils/apiError.js";

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

  static async updateBrandProfile(workspaceId, updateData) {
    const brand = await BrandProfile.findOneAndUpdate(
      { workspaceId },
      { $set: updateData },
      { new: true, runValidators: true }
    );
    if (!brand) {
      throw new ApiError("Brand profile not found", 404);
    }
    return brand;
  }
}

export default BrandService;
