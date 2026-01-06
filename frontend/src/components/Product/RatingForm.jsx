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
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
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

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      previewUrls.forEach((preview) => URL.revokeObjectURL(preview.url));
    };
  }, []);

  const checkEligibility = async () => {
    try {
      const res = await checkRatingEligibilityApi(productId);
      setEligibility(res.data);
    } catch (err) {
      console.error("Eligibility check failed:", err);
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Validate file count (max 5)
    if (files.length > 5) {
      alert("You can upload a maximum of 5 files");
      return;
    }

    // Validate file types and sizes
    const validFiles = files.filter((file) => {
      const isImage = file.type.startsWith("image/");
      const isVideo = file.type.startsWith("video/");
      const maxSize = isVideo ? 50 * 1024 * 1024 : 5 * 1024 * 1024; // 50MB for videos, 5MB for images

      if (!isImage && !isVideo) {
        alert(`${file.name} is not a valid image or video file`);
        return false;
      }

      if (file.size > maxSize) {
        alert(
          `${file.name} is too large. Max size: ${
            isVideo ? "50MB" : "5MB"
          }`
        );
        return false;
      }

      return true;
    });

    setSelectedFiles(validFiles);

    // Create preview URLs
    const previews = validFiles.map((file) => ({
      url: URL.createObjectURL(file),
      type: file.type.startsWith("video/") ? "video" : "image",
    }));
    setPreviewUrls(previews);
  };

  const removeFile = (index) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newPreviews = previewUrls.filter((_, i) => i !== index);
    
    // Revoke the URL to free memory
    URL.revokeObjectURL(previewUrls[index].url);
    
    setSelectedFiles(newFiles);
    setPreviewUrls(newPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.rating === 0) {
      alert("Please select a rating");
      return;
    }

    setLoading(true);
    try {
      const submitData = new FormData();
      submitData.append("product", productId);
      submitData.append("rating", formData.rating);
      submitData.append("title", formData.title);
      submitData.append("comment", formData.comment);

      // Append media files
      selectedFiles.forEach((file) => {
        submitData.append("media", file);
      });

      if (existingRating) {
        await updateRatingApi(existingRating._id, submitData);
        alert("Rating updated successfully!");
      } else {
        await createRatingApi(submitData);
        alert("Rating submitted successfully!");
      }

      // Clean up preview URLs
      previewUrls.forEach((preview) => URL.revokeObjectURL(preview.url));
      
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

      <div>
        <label className="block text-sm font-medium mb-2">
          Add Photos or Videos (Optional)
        </label>
        <input
          type="file"
          accept="image/*,video/*"
          multiple
          onChange={handleFileChange}
          className="hidden"
          id="media-upload"
        />
        <label
          htmlFor="media-upload"
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Upload Media
        </label>
        <p className="text-xs text-gray-500 mt-1">
          Max 5 files. Images: 5MB each. Videos: 50MB each.
        </p>

        {/* Preview uploaded files */}
        {previewUrls.length > 0 && (
          <div className="grid grid-cols-3 gap-2 mt-3">
            {previewUrls.map((preview, index) => (
              <div key={index} className="relative group">
                {preview.type === "video" ? (
                  <video
                    src={preview.url}
                    className="w-full h-24 object-cover rounded-lg"
                    controls
                  />
                ) : (
                  <img
                    src={preview.url}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg"
                  />
                )}
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
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
