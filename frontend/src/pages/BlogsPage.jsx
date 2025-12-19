import { Link } from "react-router-dom";
import Banner from "../components/Common/Banner";

const blogs = [
  {
    id: 1,
    title: "How to Design Custom T‑Shirts Like a Pro",
    excerpt:
      "Learn the complete process of designing custom T‑shirts that sell — from idea to print.",
    image: "/images/htw2.jpg",
    date: "Aug 10, 2025",
    author: "DevsCove Team",
    category: "Design",
  },
  {
    id: 2,
    title: "Best Fabrics for Printing in 2025",
    excerpt:
      "Choosing the right fabric is critical. Here's a detailed guide for beginners.",
    image: "/images/htw2.jpg",
    date: "Aug 14, 2025",
    author: "Sagar Kumar",
    category: "Printing",
  },
  {
    id: 3,
    title: "Why Custom Apparel Is the Future",
    excerpt:
      "Custom apparel is growing rapidly. Let’s explore why brands are shifting.",
    image: "/images/htw2.jpg",
    date: "Aug 18, 2025",
    author: "DevsCove Team",
    category: "Business",
  },
];

export const BlogsPage = () => {
  return (
    <div className="mt-30 md:mt-35">
        <Banner pageTitle="Blogs"/>
      <div className="container mx-auto px-5 py-5 md:py-20 ">
        {/* Header */}
        

        {/* Blog Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogs.map((blog) => (
            <Link
              to={`/blogs/${blog.id}`}
              key={blog.id}
              className="group rounded-xl overflow-hidden border hover:shadow-xl transition"
            >
              <div className="overflow-hidden">
                <img
                  src={blog.image}
                  alt={blog.title}
                  className="h-56 w-full object-cover group-hover:scale-110 transition duration-500"
                />
              </div>

              <div className="p-5 bg-white">
                <span className="text-xs uppercase tracking-wide text-primary2">
                  {blog.category}
                </span>
                <h3 className="mt-2 text-xl font-semibold group-hover:text-primary5">
                  {blog.title}
                </h3>
                <p className="mt-2 text-sm text-primary5 line-clamp-3">
                  {blog.excerpt}
                </p>

                <div className="flex justify-between items-center mt-4 text-xs text-primary2">
                  <span>{blog.author}</span>
                  <span>{blog.date}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};