import { useState, useEffect } from "react";
import { getProductRatingsApi, deleteRatingApi } from "../../utils/ratingApi";
import { formatDistanceToNow } from "date-fns";
import Loader from "../Common/Loader";
import RatingForm from "./RatingForm";
import { useAuthStore } from "../../store/useAuthStore";
import toast from "react-hot-toast";

const RatingsList = ({ productId }) => {
  const { user } = useAuthStore();
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState(null);
  const [distribution, setDistribution] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [editingRatingId, setEditingRatingId] = useState(null);

  useEffect(() => {
    fetchRatings(currentPage);
  }, [productId, currentPage]);

  const fetchRatings = async (page = 1) => {
    setLoading(true);
    try {
      const res = await getProductRatingsApi(productId, page, 10);
      setRatings(res.data.ratings);
      setPagination(res.data.pagination);
      setDistribution(res.data.distribution);
      console.log("Rating ", res.data.ratings);
    } catch (err) {
      console.error("Failed to fetch ratings:", err);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={star <= rating ? "text-yellow-500" : "text-gray-300"}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  const getRatingPercentage = (ratingValue) => {
    if (!pagination || pagination.totalRatings === 0) return 0;
    const ratingCount =
      distribution.find((d) => d._id === ratingValue)?.count || 0;
    return Math.round((ratingCount / pagination.totalRatings) * 100);
  };

  const handleDelete = async (ratingId) => {
    if (!window.confirm("Are you sure you want to delete this review?")) {
      return;
    }

    try {
      await deleteRatingApi(ratingId);
      toast.success("Review deleted successfully");
      fetchRatings(currentPage);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete review");
    }
  };

  const handleEditSuccess = () => {
    setEditingRatingId(null);
    fetchRatings(currentPage);
  };

  const isOwner = (rating) => {
    return user && rating.ratedBy?._id === user._id;
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="space-y-6">
      {/* Rating Distribution */}
      {pagination && pagination.totalRatings > 0 && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-3">Rating Distribution</h3>
          {[5, 4, 3, 2, 1].map((star) => (
            <div key={star} className="flex items-center gap-2 mb-2">
              <span className="text-sm w-8">{star}★</span>
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-yellow-500 h-2 rounded-full transition-all"
                  style={{ width: `${getRatingPercentage(star)}%` }}
                ></div>
              </div>
              <span className="text-sm text-gray-600 w-12 text-right">
                {getRatingPercentage(star)}%
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {ratings.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No reviews yet. Be the first to review this product!</p>
          </div>
        ) : (
          ratings.map((rating) => (
            <div
              key={rating._id}
              className="border border-gray-200 rounded-lg p-4"
            >
              {editingRatingId === rating._id ? (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-semibold">Edit Your Review</h4>
                    <button
                      onClick={() => setEditingRatingId(null)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      ✕
                    </button>
                  </div>
                  <RatingForm
                    productId={productId}
                    existingRating={rating}
                    onSuccess={handleEditSuccess}
                  />
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        {renderStars(rating.rating)}
                        <span className="text-sm text-gray-600">
                          {rating.rating}/5
                        </span>
                      </div>
                      <p className="font-medium">
                        {rating.ratedBy?.fullName || "Anonymous"}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatDistanceToNow(new Date(rating.createdAt), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>

                    {isOwner(rating) && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingRatingId(rating._id)}
                          className="text-sm text-primary5  font-medium cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(rating._id)}
                          className="cursor-pointer text-sm text-red-600  font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>

                  {rating.title && (
                    <h4 className="font-semibold mb-2">{rating.title}</h4>
                  )}

                  {rating.comment && (
                    <p className="text-gray-700 mb-2">{rating.comment}</p>
                  )}

                  {rating.media && rating.media.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {rating.media.map((url, index) => {
                        // Check if it's a video based on file extension or URL
                        const isVideo = url.match(/\.(mp4|webm|ogg|mov)$/i);

                        return isVideo ? (
                          <video
                            key={index}
                            src={url}
                            controls
                            className="w-32 h-32 object-cover rounded-lg border border-gray-200"
                          />
                        ) : (
                          <img
                            key={index}
                            src={url}
                            alt={`Review media ${index + 1}`}
                            className="w-32 h-32 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity border border-gray-200"
                            onClick={() =>
                              setSelectedMedia({ url, type: "image" })
                            }
                          />
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </div>
          ))
        )}
      </div>

      {/* Media Modal */}
      {selectedMedia && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedMedia(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setSelectedMedia(null)}
              className="absolute -top-10 right-0 text-white text-2xl hover:text-gray-300"
            >
              ✕
            </button>
            {selectedMedia.type === "image" ? (
              <img
                src={selectedMedia.url}
                alt="Full size"
                className="max-w-full max-h-[90vh] object-contain"
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <video
                src={selectedMedia.url}
                controls
                autoPlay
                className="max-w-full max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
              />
            )}
          </div>
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="px-4 py-2">
            Page {currentPage} of {pagination.totalPages}
          </span>
          <button
            onClick={() =>
              setCurrentPage((prev) =>
                Math.min(pagination.totalPages, prev + 1)
              )
            }
            disabled={currentPage === pagination.totalPages}
            className="px-4 py-2 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default RatingsList;
