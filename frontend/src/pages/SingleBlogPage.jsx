import { RiArrowLeftLine } from "@remixicon/react";
import { useParams, Link } from "react-router-dom";
const blogs = [
  {
    id: 1,
    title: "How to Design Custom T‑Shirts Like a Pro",
    excerpt:
      "Learn the complete process of designing custom T‑shirts that sell — from idea to print.",
    image: "/images/men_blog1.jpg",
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
        <h1 className="text-3xl md:text-4xl font-bold mb-4">{blog.title}</h1>

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
<article className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
  {/* Introduction */}
  <p className="text-lg md:text-xl text-gray-600 leading-relaxed mb-6 font-medium">
    Designing custom T-shirts is more than just adding text or
    images—it’s about creating something people actually want to wear.
    Whether you’re a beginner or an aspiring designer, this guide will
    help you understand the complete process of designing custom
    T-shirts like a pro.
  </p>

  <div className="bg-primary4 border-l-4 border-primary2 p-4 mb-8 italic">
    To make it even easier, we’ve also shared a step-by-step YouTube
    tutorial link that visually explains the entire design process from
    start to finish.
  </div>

  <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">
    Why Custom T-Shirt Design Matters
  </h2>
  <p className="mb-4">
    Custom apparel is a powerful medium for communication. In a world of
    fast fashion, a well-designed custom piece stands out because it
    offers:
  </p>
  <ul className="list-disc pl-6 mb-8 space-y-2">
    <li>
      <strong>Personal Expression:</strong> Wear your values, humor, or
      art literally on your sleeve.
    </li>
    <li>
      <strong>Brand Equity:</strong> High-quality shirts turn customers
      into walking billboards for your business.
    </li>
    <li>
      <strong>Monetization:</strong> The Print-on-Demand (POD) industry
      allows you to turn digital art into a passive income stream.
    </li>
  </ul>

  {/* Steps Section */}
  <div className="space-y-12 mt-10">
    {/* Step 1 */}
    <section>
      <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
        <span className="bg-primary2 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">
          1
        </span>
        Define Your Concept and Audience
      </h3>
      <p className="mb-4">
        Every great T-shirt starts with a "hook." Before opening any
        design software, you must define the <strong>vibe</strong>. Is
        it 1990s vintage, modern minimalism, or high-energy streetwear?
      </p>
      <ul className="list-bullet pl-6 space-y-1 text-gray-600">
        <li>
          <strong>Niche:</strong> Who is this for? (e.g., "Minimalist
          gamers" vs. "Dog lovers").
        </li>
        <li>
          <strong>Message:</strong> Is it a bold statement or a subtle
          graphic?
        </li>
        <li>
          <strong>Placement:</strong> Will it be a full chest print, a
          back graphic, or a subtle pocket logo?
        </li>
      </ul>
    </section>

    {/* Step 2 */}
    <section>
      <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
        <span className="bg-primary2 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">
          2
        </span>
        Master Color and Contrast
      </h3>
      <p className="mb-4">
        Pro designers use the <strong>60-30-10 rule</strong>: 60%
        primary color, 30% secondary, and 10% accent. Most importantly,
        consider the shirt color itself.
      </p>
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-sm">
        <strong>Pro Tip:</strong> Use "Negative Space." If you're
        designing for a black shirt, let the black fabric serve as the
        shadows in your design to reduce ink weight and cost.
      </div>
    </section>

    {/* Step 3 - Updated for PNG/JPG/JPEG */}
    <section>
      <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
        <span className="bg-primary2 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">
          3
        </span>
        Technical Accuracy: High-Res Image Mastery
      </h3>
      <p className="mb-4">
        Since we are working with raster images like PNG and JPEG, <strong>Resolution is king.</strong> To avoid a blurry, "pixelated" print, your files must be created at the actual print size with high pixel density.
      </p>
      <table className="min-w-full text-sm mb-6">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 text-left">Format</th>
            <th className="p-2 text-left">Best Use Case</th>
            <th className="p-2 text-left">Key Requirement</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="p-2 border-t">
              <strong>PNG</strong>
            </td>
            <td className="p-2 border-t">
              Designs with no background (Transparent)
            </td>
            <td className="p-2 border-t">300 DPI / Transparent BG</td>
          </tr>
          <tr>
            <td className="p-2 border-t">
              <strong>JPG / JPEG</strong>
            </td>
            <td className="p-2 border-t">
              Full-frame photos or box-style graphics
            </td>
            <td className="p-2 border-t">High Quality / No Compression</td>
          </tr>
        </tbody>
      </table>
      <p className="text-sm text-gray-600 bg-yellow-50 p-3 border-l-4 border-yellow-400">
        <strong>Important:</strong> Never "upscale" a small JPEG to make it larger. This leads to blurry edges. Always start with a canvas size of at least 3000px to ensure sharpness.
      </p>
    </section>

    {/* CTA / YouTube Section */}
    <section className="bg-primary5 text-white p-6 rounded-2xl my-10">
      <h3 className="text-xl font-bold mb-3 italic">
        Step 4: Watch the Step-by-Step YouTube Guide
      </h3>
      <p className="text-primary3 mb-4 text-sm">
        Visualizing the process helps you avoid technical pitfalls like
        incorrect margin settings or low-resolution exports.
      </p>
      <Link
        to="https://youtu.be/s2oO6po8ugw?si=8FTV65nAmz4J0xgk"
        target="_blank"
  rel="noopener noreferrer"
        className="text-primary1 font-bold hover:text-white transition-colors"
      >
        👉 Watch the YouTube tutorial here
      </Link>
    </section>

    {/* Step 5 */}
    <section>
      <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
        <span className="bg-primary2 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">
          5
        </span>
        The "Hand" and Wearability
      </h3>
      <p>
        The "hand" refers to how the design feels on the fabric. A
        giant, solid block of ink creates a "sweat patch" and feels
        heavy. Pro designers break up large shapes with textures or{" "}
        <strong>halftones</strong> to keep the shirt soft and
        breathable.
      </p>
    </section>
  </div>

  {/* Conclusion */}
  <div className="mt-12 p-6 border-t border-gray-100">
    <h2 className="text-2xl font-bold text-gray-900 mb-4">
      Conclusion
    </h2>
    <p className="text-gray-600">
      Designing like a pro is a balance of art and science. By focusing
      on high-resolution PNG/JPG assets, smart color choices, and wearable
      compositions, you'll create shirts that people don't just buy, but
      love to wear. Start your first draft today!
    </p>
  </div>
</article>

        {/* Back Button */}
        <Link
          to="/blogs"
          className="py-2.5 px-8 rounded-xl font-semibold text-primary2 
             transition-all duration-300 btn-slide md:text-base text-sm flex gap-4 w-fit"
        >
          <RiArrowLeftLine />
          <span>Back to Blogs</span>
        </Link>
      </div>
    </div>
  );
};
