import { useState, useEffect } from "react";
import { getMyRatingsApi, deleteRatingApi } from "../../utils/ratingApi";
import { formatDistanceToNow } from "date-fns";
import Loader from "./Loader";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

const MyReviews = () => {
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchMyRatings(currentPage);
  }, [currentPage]);

  const fetchMyRatings = async (page = 1) => {
    setLoading(true);
    try {
      const res = await getMyRatingsApi(page, 10);
      setRatings(res.data.ratings);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error("Failed to fetch ratings:", err);
      toast.error("Failed to load your reviews");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (ratingId) => {
    if (!window.confirm("Are you sure you want to delete this review?")) {
      return;
    }

    try {
      await deleteRatingApi(ratingId);
      toast.success("Review deleted successfully");
      fetchMyRatings(currentPage);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete review");
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

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-primary5">
        My Reviews & Ratings
      </h2>

      {ratings.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500 text-lg">You haven't reviewed any products yet.</p>
          <Link
            to="/shop"
            className="inline-block mt-4 px-6 py-2 bg-primary5 text-white rounded-lg hover:bg-primary4 transition"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {ratings.map((rating) => (
            <div
              key={rating._id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
            >
              <div className="flex flex-col md:flex-row gap-4">
                {/* Product Image */}
                {rating.product?.featuredImage && (
                  <Link
                    to={`/shop/${rating.product._id}/${rating.product.slug}`}
                    className="shrink-0"
                  >
                    <img
                      src={rating.product.featuredImage}
                      alt={rating.product.title}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                  </Link>
                )}

                {/* Review Content */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <Link
                        to={`/shop/${rating.product._id}/${rating.product.slug}`}
                        className="font-semibold text-lg text-primary5 hover:text-primary4"
                      >
                        {rating.product?.title}
                      </Link>
                      <div className="flex items-center gap-2 mt-1">
                        {renderStars(rating.rating)}
                        <span className="text-sm text-gray-600">
                          {rating.rating}/5
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {formatDistanceToNow(new Date(rating.createdAt), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <Link
                        to={`/shop/${rating.product._id}/${rating.product.slug}#review`}
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                      >
                        View
                      </Link>
                      <button
                        onClick={() => handleDelete(rating._id)}
                        className="text-sm text-red-600 hover:text-red-800 font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {rating.title && (
                    <h4 className="font-semibold mb-2">{rating.title}</h4>
                  )}

                  {rating.comment && (
                    <p className="text-gray-700 text-sm">{rating.comment}</p>
                  )}

                  {/* Media Preview */}
                  {rating.media && rating.media.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {rating.media.map((url, index) => {
                        const isVideo = url.match(/\.(mp4|webm|ogg|mov)$/i);
                        return isVideo ? (
                          <video
                            key={index}
                            src={url}
                            className="w-20 h-20 object-cover rounded border"
                          />
                        ) : (
                          <img
                            key={index}
                            src={url}
                            alt={`Review media ${index + 1}`}
                            className="w-20 h-20 object-cover rounded border"
                          />
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
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
            className="px-4 py-2 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default MyReviews;
