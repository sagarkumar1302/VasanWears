import { RiArrowLeftLine } from "@remixicon/react";
import { useParams, Link } from "react-router-dom";
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
export const SingleBlogPage = () => {
  const { blogId } = useParams();

  const blog = blogs.find((b) => b.id === Number(blogId));

  if (!blog) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <p className="text-xl">Blog not found</p>
      </div>
    );
  }

  return (
    <div className="px-5 py-5 md:py-20 md:mt-35 mt-30">
      <div className="container mx-auto">
        {/* Breadcrumb */}
        <div className="mb-6 text-sm text-primary2">
          <Link to="/blogs" className="hover:underline">
            Blogs
          </Link>{" "}
          &gt; <span>{blog.title}</span>
        </div>

        {/* Blog Header */}
        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          {blog.title}
        </h1>

        <div className="flex gap-4 text-sm text-primary5 mb-6">
          <span>{blog.author}</span>
          <span>{blog.date}</span>
          <span className="px-2 py-0.5 bg-primary3 rounded">
            {blog.category}
          </span>
        </div>

        {/* Featured Image */}
        <img
          src={blog.image}
          alt={blog.title}
          className="w-full rounded-xl mb-8"
        />

        {/* Blog Content */}
        <div className="prose max-w-none text-primary5 mb-5">
          <p>
            Custom apparel has become one of the fastest‑growing industries in
            recent years. Brands are focusing on personalization, comfort, and
            unique identity.
          </p>

          <p>
            Designing high‑quality T‑shirts requires understanding fabric,
            printing techniques, and user expectations. Whether you're a
            designer or business owner, staying updated is crucial.
          </p>

          <h3>Key Takeaways</h3>
          <ul>
            <li>Choose the right fabric for printing</li>
            <li>Focus on minimal yet impactful design</li>
            <li>Test prints before mass production</li>
          </ul>

          <p>
            At <strong>DevsCove Solutions</strong>, we help brands build powerful
            custom apparel experiences using modern web technologies.
          </p>
        </div>

        {/* Back Button */}
        <Link
          to="/blogs"
          className="py-2.5 px-8 rounded-xl font-semibold text-primary2 
             transition-all duration-300 btn-slide md:text-base text-sm flex gap-4 w-fit"
        >
          <RiArrowLeftLine/><span>Back to Blogs</span>
        </Link>
      </div>
    </div>
  );
};