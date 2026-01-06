import { useEffect, useState } from "react";
import { getWishlistApi, toggleWishlistApi } from "../../utils/wishlistApi";
import { Link } from "react-router-dom";
import { RiHeartFill, RiDeleteBinLine } from "@remixicon/react";
import toast from "react-hot-toast";
import Loader from "./Loader";

const MyWishlist = () => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [wishlistProductIds, setWishlistProductIds] = useState([]);
  const [wishlistLoadingId, setWishlistLoadingId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    setLoading(true);
    try {
      const res = await getWishlistApi();
      setWishlistItems(res.data.items || []);
      setWishlistProductIds(res.data.productIds || []);
    } catch (err) {
      console.error("Failed to fetch wishlist:", err);
      toast.error("Failed to load wishlist");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromWishlist = async (productId) => {
    if (wishlistLoadingId) return;

    try {
      setWishlistLoadingId(productId);
      const res = await toggleWishlistApi(productId);
      const updatedIds = res.data.items.map((i) => i.product.toString());

      setWishlistProductIds(updatedIds);

      // Remove item from list
      if (!updatedIds.includes(productId)) {
        setWishlistItems((prev) =>
          prev.filter((i) => i.product._id !== productId)
        );
      }

      toast.success("Removed from wishlist");
    } catch (err) {
      toast.error("Failed to remove from wishlist");
    } finally {
      setWishlistLoadingId(null);
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-primary5">
          My Wishlist ({wishlistItems.length})
        </h2>
        <Link
          to="/wishlist"
          className="py-2.5 px-8 rounded-xl font-semibold text-primary2 
             transition-all duration-300 btn-slide md:text-base text-sm"
        >
          View Full Page
        </Link>
      </div>

      {wishlistItems.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <RiHeartFill className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg">Your wishlist is empty.</p>
          <Link
            to="/shop"
            className="inline-block mt-4 px-6 py-2 bg-primary5 text-white rounded-lg hover:bg-primary4 transition"
          >
            Explore Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {wishlistItems.map((item) => (
            <div
              key={item.product._id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition relative"
            >
              <button
                onClick={() => handleRemoveFromWishlist(item.product._id)}
                disabled={wishlistLoadingId === item.product._id}
                className="absolute top-2 right-2 p-2 bg-white rounded-full shadow hover:bg-red-50 transition z-10"
              >
                {wishlistLoadingId === item.product._id ? (
                  <span className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin inline-block"></span>
                ) : (
                  <RiHeartFill className="w-5 h-5 text-red-500" />
                )}
              </button>

              <Link
                to={`/shop/${item.product._id}/${item.product.slug}`}
                className="block"
              >
                <img
                  src={item.product.featuredImage}
                  alt={item.product.title}
                  className="w-full  object-cover rounded-lg mb-3"
                />
                <h3 className="font-semibold text-primary5 hover:text-primary4 line-clamp-2">
                  {item.product.title}
                </h3>
                <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                  {item.product.description}
                </p>
                {item.product.salePrice && (
                  <p className="text-primary5 font-bold mt-2">
                    ₹{item.product.salePrice}
                    {item.product.regularPrice && (
                      <span className="text-gray-400 line-through ml-2 text-sm">
                        ₹{item.product.regularPrice}
                      </span>
                    )}
                  </p>
                )}
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyWishlist;
