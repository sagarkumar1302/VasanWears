import { useState, useEffect } from "react";
import {
  createRatingApi,
  checkRatingEligibilityApi,
  updateRatingApi,
} from "../../utils/ratingApi";
import { useAuthStore } from "../../store/useAuthStore";

const RatingForm = ({ productId, onSuccess, existingRating = null }) => {
  const { user } = useAuthStore();
  const [eligibility, setEligibility] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    rating: existingRating?.rating || 0,
    title: existingRating?.title || "",
    comment: existingRating?.comment || "",
  });

  useEffect(() => {
    if (user && productId && !existingRating) {
      checkEligibility();
    }
  }, [user, productId]);

  const checkEligibility = async () => {
    try {
      const res = await checkRatingEligibilityApi(productId);
      setEligibility(res.data);
    } catch (err) {
      console.error("Eligibility check failed:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.rating === 0) {
      alert("Please select a rating");
      return;
    }

    setLoading(true);
    try {
      const data = {
        product: productId,
        ...formData,
      };

      if (existingRating) {
        await updateRatingApi(existingRating._id, formData);
        alert("Rating updated successfully!");
      } else {
        await createRatingApi(data);
        alert("Rating submitted successfully!");
      }

      if (onSuccess) onSuccess();
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to submit rating";
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="p-4 bg-gray-100 rounded-lg text-center">
        <p className="text-gray-600">Please login to write a review</p>
      </div>
    );
  }

  if (!existingRating && eligibility && !eligibility.canRate) {
    return (
      <div className="p-4 bg-yellow-50 rounded-lg">
        {!eligibility.hasPurchased && (
          <p className="text-yellow-800">
            You must purchase this product before you can review it.
          </p>
        )}
        {eligibility.hasRated && (
          <p className="text-yellow-800">
            You have already reviewed this product.
          </p>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">
          Your Rating <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setFormData({ ...formData, rating: star })}
              className="text-3xl focus:outline-none transition-colors"
            >
              {star <= formData.rating ? (
                <span className="text-yellow-500">★</span>
              ) : (
                <span className="text-gray-300">★</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Review Title (Optional)
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Sum up your experience"
          maxLength={100}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Review (Optional)
        </label>
        <textarea
          value={formData.comment}
          onChange={(e) =>
            setFormData({ ...formData, comment: e.target.value })
          }
          placeholder="Share your thoughts about this product"
          rows={4}
          maxLength={1000}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="text-xs text-gray-500 mt-1">
          {formData.comment.length}/1000 characters
        </p>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {loading
          ? "Submitting..."
          : existingRating
          ? "Update Review"
          : "Submit Review"}
      </button>
    </form>
  );
};

export default RatingForm;
