import { useState, useEffect } from "react";
import { getProductRatingsApi } from "../../utils/ratingApi";
import { formatDistanceToNow } from "date-fns";

const RatingsList = ({ productId }) => {
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState(null);
  const [distribution, setDistribution] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

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

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
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
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {renderStars(rating.rating)}
                    <span className="text-sm text-gray-600">
                      {rating.rating}/5
                    </span>
                  </div>
                  <p className="font-medium">{rating.ratedBy?.name || "Anonymous"}</p>
                  <p className="text-sm text-gray-500">
                    {formatDistanceToNow(new Date(rating.createdAt), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              </div>

              {rating.title && (
                <h4 className="font-semibold mb-2">{rating.title}</h4>
              )}

              {rating.comment && (
                <p className="text-gray-700 mb-2">{rating.comment}</p>
              )}

              {rating.media && rating.media.length > 0 && (
                <div className="flex gap-2 mt-2">
                  {rating.media.map((url, index) => (
                    <img
                      key={index}
                      src={url}
                      alt={`Review image ${index + 1}`}
                      className="w-20 h-20 object-cover rounded"
                    />
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

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
