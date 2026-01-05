const RatingSummary = ({ product }) => {
  const { averageRating = 0, ratingCount = 0 } = product;

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const stars = [];

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(
          <span key={i} className="text-yellow-500 text-xl">
            ★
          </span>
        );
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(
          <span key={i} className="text-yellow-500 text-xl">
            ★
          </span>
        );
      } else {
        stars.push(
          <span key={i} className="text-gray-300 text-xl">
            ★
          </span>
        );
      }
    }

    return <div className="flex">{stars}</div>;
  };

  return (
    <div className="flex items-center gap-3">
      {renderStars(averageRating)}
      <div className="flex items-baseline gap-1">
        <span className="text-lg font-semibold">
          {averageRating > 0 ? averageRating.toFixed(1) : "0.0"}
        </span>
        <span className="text-sm text-gray-500">
          ({ratingCount} {ratingCount === 1 ? "review" : "reviews"})
        </span>
      </div>
    </div>
  );
};

export default RatingSummary;
