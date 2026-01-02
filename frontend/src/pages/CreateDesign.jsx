import { useState } from "react";
import { createDesignApi } from "../utils/designApi";
import { fileToBase64 } from "../utils/fileToBase64";

const CreateDesign = () => {
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [front, setFront] = useState(null);
  const [back, setBack] = useState(null);
  const [loading, setLoading] = useState(false);
  const [frontArea, setFrontArea] = useState(null);
  const [backArea, setBackArea] = useState(null);
  const submitHandler = async () => {
    if (!title || !price || !front) {
      alert("Title, price and front image are required");
      return;
    }

    setLoading(true);

    const payload = {
      title,
      sellPrice: Number(price),
      images: {
        front: await fileToBase64(front),
        back: back ? await fileToBase64(back) : null,
        frontDesignArea: frontArea ? await fileToBase64(frontArea) : null,
        backDesignArea: backArea ? await fileToBase64(backArea) : null,
      },
      isPublic: true,
    };

    await createDesignApi(payload);
    setLoading(false);
    alert("Design created successfully!");
  };

  return (
    <div className="relative z-500 px-5 py-20 mt-35 space-y-4 bg-white max-w-md mx-auto">
      <input
        className="border w-full p-2"
        placeholder="Design title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <input
        className="border w-full p-2"
        type="number"
        placeholder="Price"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
      />

      <input
        className="border w-full p-2"
        type="file"
        accept="image/*"
        onChange={(e) => setFront(e.target.files[0])}
      />

      <input
        className="border w-full p-2"
        type="file"
        accept="image/*"
        onChange={(e) => setBack(e.target.files[0])}
      />
      <input
        className="border w-full p-2"
        type="file"
        accept="image/*"
        onChange={(e) => setFrontArea(e.target.files[0])}
      />

      <input
        className="border w-full p-2"
        type="file"
        accept="image/*"
        onChange={(e) => setBackArea(e.target.files[0])}
      />

      <button
        onClick={submitHandler}
        disabled={loading}
        className="bg-black text-white px-4 py-2 w-full"
      >
        {loading ? "Uploading..." : "Create Design"}
      </button>
    </div>
  );
};

export default CreateDesign;
