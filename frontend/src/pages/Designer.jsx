import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { addToCartApi } from "../utils/cartApi";
import { useCartStore } from "../store/cartStore";
import { useAuthStore } from "../store/useAuthStore";
import * as fabric from "fabric";
import html2canvas from "html2canvas";
import JSZip from "jszip";
import { gsap } from "gsap";
import * as THREE from "three";
import { createDesignApi, getMyDesignsApi } from "../utils/designApi";
import { getAllSizesApi } from "../utils/productApi";
import { getAllCategoriesForWebsite } from "../utils/productApi";
import { getSubcategoryByIdApi } from "../utils/subCategoryApi";

const CUSTOM_FONTS_DB_NAME = "designer_custom_fonts_db_v1";
const CUSTOM_FONTS_DB_VERSION = 1;
const CUSTOM_FONTS_STORE = "fonts";

const SIDE_CONFIG = {
  front: {
    key: "Front",
    label: "Front",
    bgImage: "/Men/Tshirt/Black/Front.jpg",
  },
  back: { key: "Back", label: "Back", bgImage: "/Men/Tshirt/Black/Back.jpg" },
  // left: { key: "left", label: "Left", bgImage: "/Black/left.png" },
  // right: { key: "right", label: "Right", bgImage: "/Black/right.png" },
};

const CLOTH_CONFIG = {
  men: {
    label: "Men T-Shirt",
    imageFolderForColor: (colorName) =>
      `Men/Tshirt/${String(colorName || "Black")}`,
    printAreaInch: { width: 16, height: 20 },
    // placement is normalized to the Fabric canvas size
    placementBySide: {
      Front: { x: 0.5, y: 0.52 },
      Back: { x: 0.5, y: 0.52 },
    },
    margin: 0.4,
  },
  women: {
    label: "Women T-Shirt",
    imageFolderForColor: (colorName) =>
      `Women/Tshirt/${String(colorName || "Black")}`,
    printAreaInch: { width: 14, height: 18 },
    placementBySide: {
      Front: { x: 0.49, y: 0.55 },
      Back: { x: 0.49, y: 0.55 },
    },
    margin: 0.3,
  },
  hoodie: {
    label: "Hoodie",
    imageFolderForColor: (colorName) =>
      `Men/Hoodie/${String(colorName || "Black")}`,
    printAreaInch: { width: 15, height: 17 },
    placementBySide: {
      Front: { x: 0.49, y: 0.44 },
      Back: { x: 0.5, y: 0.54 },
    },
    // Allow different margins per side (Front/Back) if needed.
    // Keep Front at 0.23; tweak Back independently.
    margin: { Front: 0.23, Back: 0.3 },
  },
  womenCropHoodie: {
    label: "Women Crop Hoodie",
    imageFolderForColor: (colorName) =>
      `Women/Hoodie/${String(colorName || "Black")}`,
    // Print area / placement can be tuned later.
    // Allow different print areas per side.
    // Keep Front as 11x10; set Back independently.
    printAreaInch: {
      Front: { width: 11, height: 10 },
      Back: { width: 12, height: 9 },
    },
    placementBySide: {
      Front: { x: 0.49, y: 0.44 },
      Back: { x: 0.5, y: 0.45 },
    },
    margin: { Front: 0.2, Back: 0.2 },
  },
  sweatshirt: {
    label: "Sweatshirt",
    imageFolderForColor: (colorName) =>
      `Men/Sweatshirt/${String(colorName || "Black")}`,
    printAreaInch: { width: 14, height: 18 },
    placementBySide: {
      Front: { x: 0.505, y: 0.49 },
      Back: { x: 0.505, y: 0.48 },
    },
    margin: { Front: 0.4, Back: 0.4 },
  },
};

const COLOR_ALIASES_BY_CLOTH = {
  // Hoodie assets have different folder names than the shared color palette.
  hoodie: {
    "Sky Blue": "Baby Blue",
    "Royal Blue": "Navy Blue",
    "Flag Green": "Bottle Green",
    Yellow: "Mustard Yellow",
  },
  womenCropHoodie: {
    Red: "Maroon",
    Yellow: "Mustard Yellow",
  },
  sweatshirt: {
    Red: "Maroon",
    Yellow: "Mustard Yellow",
  },
};

const normalizeColorNameForCloth = (clothKey, colorName) => {
  const cKey = String(clothKey || "");
  const name = String(colorName || "Black");
  const aliases = COLOR_ALIASES_BY_CLOTH[cKey];
  return (aliases && aliases[name]) || name;
};

const getBgUrlFor = ({ clothKey, colorName, sideKey }) => {
  const cKey = String(clothKey || "men");
  const cfg = CLOTH_CONFIG[cKey] || CLOTH_CONFIG.men;

  // Some cloth variants reuse another cloth's background assets.
  const assetsKeyRaw = cfg && cfg.assetsFrom ? String(cfg.assetsFrom) : cKey;
  const assetsKey = CLOTH_CONFIG[assetsKeyRaw] ? assetsKeyRaw : cKey;
  const assetsCfg = CLOTH_CONFIG[assetsKey] || cfg;

  const normalizedColor = normalizeColorNameForCloth(assetsKey, colorName);
  const folder =
    (assetsCfg.imageFolderForColor &&
      assetsCfg.imageFolderForColor(normalizedColor)) ||
    String(normalizedColor || "Black");
  const sKey = String(sideKey || "Front");
  return `${folder}/${sKey}.jpg`;
};

const AVAILABLE_COLORS = [
  { name: "Black", value: "#000000" },
  { name: "White", value: "#ffffff" },
  { name: "Sky Blue", value: "#1aaec4" },
  { name: "Red", value: "#c1121f" },
  { name: "Royal Blue", value: "#232a4d" },
  { name: "Grey", value: "#9ca3af" },
  { name: "Flag Green", value: "#2a8634" },
  { name: "Yellow", value: "#dfc97e" },
  { name: "Baby Pink", value: "#dfc0cf" },
];

// Tailwind needs to see class strings at build time.
// Keep these as static strings (not constructed) so Tailwind includes them.
const COLOR_BG_CLASS_BY_VALUE = {
  "#000000": "bg-black",
  "#ffffff": "bg-white",
  "#1aaec4": "bg-[#1aaec4]",
  "#c1121f": "bg-[#c1121f]",
  "#232a4d": "bg-[#232a4d]",
  "#9ca3af": "bg-[#9ca3af]",
  "#2a8634": "bg-[#2a8634]",
  "#dfc97e": "bg-[#dfc97e]",
  "#dfc0cf": "bg-[#dfc0cf]",
  "#4e242a": "bg-[#4e242a]",
};

// Cloth-specific colors (not part of the global palette)
const EXTRA_COLORS_BY_CLOTH = {
  womenCropHoodie: [{ name: "Maroon", value: "#4e242a" }],
};

// If some products have fewer/different colors, define them here.
// Any cloth key not listed falls back to `AVAILABLE_COLORS`.
const pickColorsByName = (names) => {
  const wanted = Array.isArray(names) ? names.map(String) : [];
  return wanted
    .map((n) => AVAILABLE_COLORS.find((c) => c && c.name === n))
    .filter(Boolean);
};

const AVAILABLE_COLORS_BY_CLOTH = {
  // Example: Women Crop Hoodie only has 4 variants.
  // Edit this list to match the folders you actually have.
  womenCropHoodie: [
    ...pickColorsByName(["Black", "Yellow", "Baby Pink"]),
    ...(EXTRA_COLORS_BY_CLOTH.womenCropHoodie || []),
  ],
};

const getAvailableColorsForCloth = (clothKey) => {
  const key = String(clothKey || "");
  const list = AVAILABLE_COLORS_BY_CLOTH[key];
  return Array.isArray(list) && list.length ? list : AVAILABLE_COLORS;
};

const isColorAvailableForCloth = (clothKey, colorName) => {
  const name = String(colorName || "");
  return getAvailableColorsForCloth(clothKey).some((c) => c && c.name === name);
};

const getDefaultColorForCloth = (clothKey) => {
  const colors = getAvailableColorsForCloth(clothKey);
  const hasBlack = colors.find((c) => c && c.name === "Black");
  return (
    (hasBlack && hasBlack.name) || (colors[0] && colors[0].name) || "Black"
  );
};

// Integration helper: some apps provide product keys like "Men/Tshirt".
// Map those to this file's internal cloth keys so existing sizing/print-area logic works.
const normalizeIncomingProductKey = (key) =>
  String(key || "")
    .replace(/^\/+|\/+$/g, "")
    .trim();

const clothKeyFromExternalProductKey = (productKey) => {
  const k = normalizeIncomingProductKey(productKey);
  if (!k) return "";
  const parts = k.split("/").map((p) => String(p || "").toLowerCase());
  const gender = parts[0] || "";
  const product = parts[1] || "";

  if (gender === "men" && product === "tshirt") return "men";
  if (gender === "women" && product === "tshirt") return "women";
  if (gender === "men" && product === "hoodie") return "hoodie";
  // This project only has a women hoodie variant wired as womenCropHoodie.
  // It also uses the folder `Women/Hoodie/...` so it matches your external key.
  if (gender === "women" && product === "hoodie") return "womenCropHoodie";
  if (gender === "men" && product === "sweatshirt") return "sweatshirt";
  return "";
};

const Designer = ({ productKey } = {}) => {
  const NO_SCROLLBAR =
    "[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:w-0 [&::-webkit-scrollbar]:h-0";

  const fabricCanvasRef = useRef(null);
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const stageRef = useRef(null);
  const CliprectRef = useRef(null);
  const initialClipRef = useRef(null);
  const clipStackRef = useRef([]);
  const sideSwitchTokenRef = useRef(0);
  const isRestoringRef = useRef(false);
  const restoringTokenRef = useRef(0);

  const historyRef = useRef({});
  const commitTimerRef = useRef(0);

  const clothRef = useRef("men");
  const sideRef = useRef("Front");
  const selectedColorRef = useRef("Black");
  const initialCanvasBuiltRef = useRef(false);

  const baseSizeRef = useRef({ width: 1800, height: 1200 });
  const textInputRef = useRef(null);
  const fileInputRef = useRef(null);
  const fontFileInputRef = useRef(null);
  const selectedObjectRef = useRef(null);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [showTextControls, setShowTextControls] = useState(false);
  const [fontColor, setFontColor] = useState("#000000");
  const [fontFamily, setFontFamily] = useState("Arial");
  const [customFonts, setCustomFonts] = useState([]);
  const customFontsRef = useRef([]);
  const customFontBlobUrlsRef = useRef([]);
  const customFontStyleElRef = useRef(null);
  const [fontsHydrated, setFontsHydrated] = useState(false);
  const [mockMode, setMockMode] = useState(false);
  const mockImageRef = useRef(null);
  const [currentSide, setCurrentSide] = useState("Front");
  const [cloth, setCloth] = useState("men");
  const [designStore, setDesignStore] = useState({
    men: { front: null, back: null },
    women: { front: null, back: null },
    hoodie: { front: null, back: null },
    womenCropHoodie: { front: null, back: null },
    sweatshirt: { front: null, back: null },
  });

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState("");
  const [previewImages, setPreviewImages] = useState({
    Front: null,
    Back: null,
  });
  const [previewStaticImages, setPreviewStaticImages] = useState({
    Front: null,
    Back: null,
  });
  const previewTokenRef = useRef(0);

  const [mobileToolsOpen, setMobileToolsOpen] = useState(false);
  const [mobileSideOpen, setMobileSideOpen] = useState(false);
  const [mobileTextOpen, setMobileTextOpen] = useState(false);
  const [mobileArrangeOpen, setMobileArrangeOpen] = useState(false);

  const [uploadAcked, setUploadAcked] = useState(false);
  const [copyrightModalOpen, setCopyrightModalOpen] = useState(false);
  const pendingUploadRef = useRef(false);
  const [abuseModalOpen, setAbuseModalOpen] = useState(false);
  const pendingAddTextRef = useRef(false);

  const [hasSelection, setHasSelection] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [savingDesign, setSavingDesign] = useState(false);
  const [savedDesign, setSavedDesign] = useState(null);
  const [addedToCart, setAddedToCart] = useState(false);
  const [previewAddedToCart, setPreviewAddedToCart] = useState(false);
  const [designChanged, setDesignChanged] = useState(false);

  const preview3dMountRef = useRef(null);

  // Product picker state (used when Designer opened without product context)
  const [productPickerOpen, setProductPickerOpen] = useState(false);
  const [productPickerValues, setProductPickerValues] = useState({
    productId: "",
    colorName: "",
    sizeName: "",
  });
  const [sizesList, setSizesList] = useState([]);

  useEffect(() => {
    if (!productPickerOpen) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await getAllSizesApi();
        // API returns ApiResponse-like object; try to extract array
        const sizes = Array.isArray(res?.data)
          ? res.data
          : res?.data?.data || res?.data || [];
        if (!cancelled) setSizesList(sizes);
      } catch (err) {
        console.error("Failed to fetch sizes for product picker", err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [productPickerOpen]);

  // Also fetch sizes on mount so the main UI size selector is available
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await getAllSizesApi();
        const sizes = Array.isArray(res?.data)
          ? res.data
          : res?.data?.data || res?.data || [];
        if (!cancelled) setSizesList(sizes);
      } catch (err) {
        console.error("Failed to fetch sizes on mount", err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Set a sensible default size when sizes arrive
  const [selectedSize, setSelectedSize] = useState("");
  const selectedSizeRef = useRef("");
  useEffect(() => {
    if (sizesList && sizesList.length > 0 && !selectedSize) {
      setSelectedSize(sizesList[0].name);
      selectedSizeRef.current = sizesList[0].name;
    }
  }, [sizesList, selectedSize]);

  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const fetchCart = useCartStore((s) => s.fetchCart);
  const user = useAuthStore((s) => s.user);

  // Map category/subcategory names to internal cloth keys
  const mapToClothKey = (catName = "", subName = "") => {
    const cat = String(catName || "").toLowerCase();
    const sub = String(subName || "").toLowerCase();
    // Prefer subcategory hints first — they are more specific.
    if (sub.includes("crop") && sub.includes("hoodie"))
      return "womenCropHoodie";
    if (sub.includes("hoodie")) {
      // Prefer a women-specific hoodie variant when the category indicates women.
      if (cat.includes("women")) return "womenCropHoodie";
      return "hoodie";
    }
    if (sub.includes("sweatshirt")) return "sweatshirt";
    if (
      sub.includes("tshirt") ||
      sub.includes("t-shirt") ||
      sub.includes("tee")
    ) {
      if (cat.includes("women")) return "women";
      if (cat.includes("men")) return "men";
      return "men";
    }

    // Fall back to broad category name if subcategory gives no hint.
    if (cat.includes("women")) return "women";
    if (cat.includes("men")) return "men";

    return "men";
  };

  // Read query params (category, subcategory) and map to cloth key
  useEffect(() => {
    const catId = searchParams.get("category");
    const subId = searchParams.get("subcategory");
    if (!catId && !subId) return;

    (async () => {
      try {
        let catName = "";
        let subName = "";

        if (catId) {
          const catRes = await getAllCategoriesForWebsite();
          const cats = (catRes && catRes.data) || catRes || [];
          const found = Array.isArray(cats)
            ? cats.find((c) => String(c._id) === String(catId))
            : null;
          catName = found?.name || "";
        }

        if (subId) {
          const subRes = await getSubcategoryByIdApi(subId);
          const subObj = (subRes && subRes.data) || subRes || {};
          subName = subObj?.name || "";
        }

        const key = mapToClothKey(catName, subName);
        // If the Fabric canvas is already initialized, trigger a proper
        // cloth change so the canvas background rebuilds immediately.
        if (canvasReady) {
          try {
            await handleClothChange(key);
          } catch (e) {
            // fallback to setting state
            setCloth(key);
          }
        } else {
          setCloth(key);
        }

        setSelectedColor(getDefaultColorForCloth(key));
      } catch (e) {
        // ignore errors and keep defaults
      }
    })();
  }, [searchParams]);

  // On mobile, prevent page/container scrolling while interacting with Fabric.
  const isTouchInteractingRef = useRef(false);
  const hasActiveObjectRef = useRef(false);
  const isTextEditingRef = useRef(false);

  const isMobileViewport = () =>
    (window.matchMedia && window.matchMedia("(max-width: 768px)").matches) ||
    (window.innerWidth || 0) <= 768;

  const closeMobileToolsSheet = ({ defer = false } = {}) => {
    if (!isMobileViewport()) return;
    if (!mobileToolsOpen) return;
    // Defer is important for actions that trigger native pickers (file input).
    if (defer) {
      setTimeout(() => setMobileToolsOpen(false), 0);
    } else {
      setMobileToolsOpen(false);
    }
  };

  useEffect(() => {
    // Read upload acknowledgement from localStorage so the copyright
    // modal is shown only once per user (browser).
    try {
      const seen = window.localStorage.getItem("designer_upload_ack_seen");
      setUploadAcked(!!seen);
    } catch (e) {
      setUploadAcked(false);
    }
  }, []);

  const openFilePicker = () => {
    try {
      if (fileInputRef.current) fileInputRef.current.click();
    } catch (e) {}
  };

  const openFontPicker = () => {
    try {
      if (fontFileInputRef.current) fontFileInputRef.current.click();
    } catch (e) {}
  };

  useEffect(() => {
    customFontsRef.current = Array.isArray(customFonts) ? customFonts : [];
  }, [customFonts]);

  const getFontMimeType = (fileName) => {
    const name = String(fileName || "").toLowerCase();
    if (name.endsWith(".woff2")) return "font/woff2";
    if (name.endsWith(".woff")) return "font/woff";
    if (name.endsWith(".otf")) return "font/otf";
    if (name.endsWith(".ttf")) return "font/ttf";
    return "application/octet-stream";
  };

  const mergeFontsByFamily = (a, b) => {
    const listA = Array.isArray(a) ? a : [];
    const listB = Array.isArray(b) ? b : [];
    const seen = new Set();
    const out = [];
    [...listA, ...listB].forEach((item) => {
      const family = item && item.family ? String(item.family) : "";
      if (!family) return;
      const key = family.toLowerCase();
      if (seen.has(key)) return;
      seen.add(key);
      out.push({
        id: item && item.id ? String(item.id) : undefined,
        family,
        sourceName: item && item.sourceName ? String(item.sourceName) : "",
        mime: item && item.mime ? String(item.mime) : "",
        size: typeof item?.size === "number" ? item.size : undefined,
      });
    });
    return out;
  };

  const isIndexedDbAvailable = () => {
    try {
      return typeof window !== "undefined" && !!window.indexedDB;
    } catch (e) {
      return false;
    }
  };

  const openFontsDb = () => {
    return new Promise((resolve, reject) => {
      if (!isIndexedDbAvailable()) {
        reject(new Error("IndexedDB not available"));
        return;
      }
      let req;
      try {
        req = window.indexedDB.open(
          CUSTOM_FONTS_DB_NAME,
          CUSTOM_FONTS_DB_VERSION
        );
      } catch (e) {
        reject(e);
        return;
      }

      req.onupgradeneeded = () => {
        try {
          const db = req.result;
          if (!db.objectStoreNames.contains(CUSTOM_FONTS_STORE)) {
            const store = db.createObjectStore(CUSTOM_FONTS_STORE, {
              keyPath: "id",
            });
            try {
              store.createIndex("ts", "ts", { unique: false });
            } catch (e) {}
          }
        } catch (e) {}
      };

      req.onsuccess = () => resolve(req.result);
      req.onerror = () =>
        reject(req.error || new Error("Failed to open IndexedDB"));
    });
  };

  const idbGetAllFonts = async () => {
    const db = await openFontsDb();
    return new Promise((resolve) => {
      try {
        const tx = db.transaction(CUSTOM_FONTS_STORE, "readonly");
        const store = tx.objectStore(CUSTOM_FONTS_STORE);
        const items = [];

        // Prefer getAll when available.
        if (typeof store.getAll === "function") {
          const req = store.getAll();
          req.onsuccess = () =>
            resolve(Array.isArray(req.result) ? req.result : []);
          req.onerror = () => resolve([]);
        } else {
          const cursorReq = store.openCursor();
          cursorReq.onsuccess = () => {
            const cursor = cursorReq.result;
            if (cursor) {
              items.push(cursor.value);
              cursor.continue();
            } else {
              resolve(items);
            }
          };
          cursorReq.onerror = () => resolve([]);
        }
      } catch (e) {
        resolve([]);
      }
    }).finally(() => {
      try {
        db.close();
      } catch (e) {}
    });
  };

  const idbPutFont = async (record) => {
    const db = await openFontsDb();
    return new Promise((resolve, reject) => {
      try {
        const tx = db.transaction(CUSTOM_FONTS_STORE, "readwrite");
        const store = tx.objectStore(CUSTOM_FONTS_STORE);
        store.put(record);
        tx.oncomplete = () => resolve(true);
        tx.onerror = () =>
          reject(tx.error || new Error("Failed to store font"));
        tx.onabort = () =>
          reject(tx.error || new Error("Failed to store font"));
      } catch (e) {
        reject(e);
      }
    }).finally(() => {
      try {
        db.close();
      } catch (e) {}
    });
  };

  const idbDeleteFont = async (id) => {
    const db = await openFontsDb();
    return new Promise((resolve) => {
      try {
        const tx = db.transaction(CUSTOM_FONTS_STORE, "readwrite");
        const store = tx.objectStore(CUSTOM_FONTS_STORE);
        store.delete(String(id));
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => resolve(false);
        tx.onabort = () => resolve(false);
      } catch (e) {
        resolve(false);
      }
    }).finally(() => {
      try {
        db.close();
      } catch (e) {}
    });
  };

  const pruneStoredFontsIfNeeded = async () => {
    // Keep this conservative to avoid bloating the browser storage.
    const MAX_FONTS = 12;
    const MAX_TOTAL_BYTES = 40 * 1024 * 1024; // 40MB

    let all = [];
    try {
      all = await idbGetAllFonts();
    } catch (e) {
      return;
    }
    if (!Array.isArray(all) || !all.length) return;

    const sorted = [...all].sort((a, b) => (a?.ts || 0) - (b?.ts || 0));
    let total = sorted.reduce((sum, r) => sum + (Number(r?.size) || 0), 0);

    const shouldPrune = () =>
      sorted.length > MAX_FONTS ||
      (total > MAX_TOTAL_BYTES && sorted.length > 1);

    while (shouldPrune()) {
      const oldest = sorted.shift();
      if (!oldest || !oldest.id) break;
      try {
        await idbDeleteFont(oldest.id);
      } catch (e) {}
      total = sorted.reduce((sum, r) => sum + (Number(r?.size) || 0), 0);
    }
  };

  const registerCustomFont = async ({ family, blobUrl }) => {
    const fam = String(family || "");
    const url = String(blobUrl || "");
    if (!fam || !url) return false;

    const registerByFontFaceApi = async () => {
      if (!window.FontFace) return false;
      if (!document.fonts || !document.fonts.add) return false;
      const face = new FontFace(fam, `url(${url})`);
      const loaded = await face.load();
      document.fonts.add(loaded);
      return true;
    };

    const registerByStyleTag = () => {
      let styleEl = customFontStyleElRef.current;
      if (!styleEl) {
        styleEl = document.createElement("style");
        styleEl.setAttribute("data-designer-custom-fonts", "1");
        document.head.appendChild(styleEl);
        customFontStyleElRef.current = styleEl;
      }
      const familyCss = escapeCssString(fam);
      const urlCss = escapeCssString(url);
      styleEl.textContent = `${
        styleEl.textContent || ""
      }\n@font-face {\n  font-family: \"${familyCss}\";\n  src: url(\"${urlCss}\");\n  font-display: swap;\n}`;
      return true;
    };

    try {
      let registered = false;
      try {
        registered = await registerByFontFaceApi();
      } catch (e) {
        registered = false;
      }
      if (!registered) registerByStyleTag();

      try {
        if (document.fonts && document.fonts.load) {
          await document.fonts.load(`16px "${fam}"`);
        }
      } catch (e) {}

      return true;
    } catch (e) {
      return false;
    }
  };

  const hydrateFontsFromStorage = async () => {
    if (!isIndexedDbAvailable()) {
      setFontsHydrated(true);
      return;
    }

    try {
      const all = await idbGetAllFonts();
      if (!Array.isArray(all) || !all.length) {
        setFontsHydrated(true);
        return;
      }

      const metas = [];
      for (const rec of all) {
        const family = rec && rec.family ? String(rec.family) : "";
        const bytes = rec && rec.bytes;
        if (!family || !bytes) continue;
        const mime = String(rec?.mime || "application/octet-stream");
        const blob = new Blob([bytes], { type: mime });
        const blobUrl = URL.createObjectURL(blob);
        customFontBlobUrlsRef.current = Array.isArray(
          customFontBlobUrlsRef.current
        )
          ? [...customFontBlobUrlsRef.current, blobUrl]
          : [blobUrl];

        await registerCustomFont({ family, blobUrl });
        metas.push({
          id: rec && rec.id ? String(rec.id) : undefined,
          family,
          sourceName: rec && rec.sourceName ? String(rec.sourceName) : "",
          mime: rec && rec.mime ? String(rec.mime) : "",
          size: typeof rec?.size === "number" ? rec.size : undefined,
        });
      }

      if (metas.length) {
        setCustomFonts((prev) => mergeFontsByFamily(prev, metas));
      }

      // Re-render Fabric in case previously loaded text used these font families.
      try {
        const c = fabricCanvasRef.current;
        if (c && typeof c.requestRenderAll === "function") c.requestRenderAll();
      } catch (e) {}
    } catch (e) {
      // ignore
    } finally {
      setFontsHydrated(true);
    }
  };

  const escapeCssString = (value) => {
    const s = String(value ?? "");
    return s.replace(/\\/g, "\\\\").replace(/\"/g, '\\"');
  };

  const makeSafeFontFamilyFromFileName = (fileName) => {
    const raw = String(fileName || "")
      .replace(/\.[^/.]+$/g, "")
      .trim();
    const safe = raw
      .replace(/[_-]+/g, " ")
      .replace(/[^a-zA-Z0-9\s]/g, "")
      .replace(/\s+/g, " ")
      .trim();
    return safe || `Custom Font ${Date.now()}`;
  };

  useEffect(() => {
    return () => {
      try {
        (customFontBlobUrlsRef.current || []).forEach((u) => {
          try {
            URL.revokeObjectURL(u);
          } catch (e) {}
        });
      } catch (e) {}
      customFontBlobUrlsRef.current = [];

      try {
        if (customFontStyleElRef.current) {
          customFontStyleElRef.current.remove();
        }
      } catch (e) {}
      customFontStyleElRef.current = null;
    };
  }, []);

  useEffect(() => {
    hydrateFontsFromStorage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const requestUploadImage = () => {
    if (mockMode) return;
    const acked = uploadAcked;

    if (acked) {
      openFilePicker();
      return;
    }

    pendingUploadRef.current = true;
    setCopyrightModalOpen(true);
  };

  // If the user deselects text, close the Text sheet automatically.
  useEffect(() => {
    if (!showTextControls) setMobileTextOpen(false);
  }, [showTextControls]);

  const recalcFabricOffsets = () => {
    try {
      const c = fabricCanvasRef.current;
      if (c && typeof c.calcOffset === "function") c.calcOffset();
    } catch (e) {}
  };

  const toFabricPointerEvent = (e) => {
    // Fabric hit-testing expects clientX/clientY; TouchEvent doesn't have them.
    // Normalize to the first touch point for reliable hit tests.
    try {
      const t =
        (e && e.touches && e.touches[0]) ||
        (e && e.changedTouches && e.changedTouches[0]);
      if (!t) return e;
      return {
        clientX: t.clientX,
        clientY: t.clientY,
        target: e.target,
      };
    } catch (err) {
      return e;
    }
  };

  const scrollLockRef = useRef({
    locked: false,
    containerPrevOverscrollY: null,
  });

  const setCanvasTouchAction = (value) => {
    try {
      const c = fabricCanvasRef.current;
      const upper = c && c.upperCanvasEl;
      const lower = c && c.lowerCanvasEl;
      if (upper && upper.style) upper.style.touchAction = value;
      if (lower && lower.style) lower.style.touchAction = value;
    } catch (e) {}
  };

  const lockScrollForCanvasInteraction = () => {
    if (scrollLockRef.current.locked) return;

    // Strictly lock the scrollable canvas container (mobile).
    // We intentionally avoid `body { position: fixed }` because it can cause
    // viewport jumps when Fabric focuses its hidden textarea.
    const container = containerRef.current;
    if (container && container.style) {
      scrollLockRef.current.containerPrevOverscrollY =
        container.style.overscrollBehaviorY;
      // Prevent rubber-band while locked, without changing overflow/layout.
      container.style.overscrollBehaviorY = "none";
    }

    // While interacting, disable touch scrolling on the canvas itself.
    setCanvasTouchAction("none");

    scrollLockRef.current.locked = true;

    recalcFabricOffsets();
  };

  const unlockScrollForCanvasInteraction = () => {
    if (!scrollLockRef.current.locked) return;

    const container = containerRef.current;
    if (container && container.style) {
      container.style.overscrollBehaviorY =
        scrollLockRef.current.containerPrevOverscrollY ?? "";
    }

    scrollLockRef.current.locked = false;
    scrollLockRef.current.containerPrevOverscrollY = null;

    // When not interacting, allow vertical scrolling gestures.
    setCanvasTouchAction("pan-y");

    recalcFabricOffsets();
  };

  // Mobile browsers change layout/viewport height when the address bar or
  // keyboard shows/hides. That can invalidate Fabric's cached offsets and cause
  // "jump"/drift when selecting objects. Keep offsets fresh.
  useEffect(() => {
    const vv = window && window.visualViewport;
    if (!vv) return;

    let raf = 0;
    const schedule = () => {
      try {
        if (raf) cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => recalcFabricOffsets());
      } catch (e) {}
    };

    try {
      vv.addEventListener("resize", schedule, { passive: true });
      vv.addEventListener("scroll", schedule, { passive: true });
    } catch (e) {}

    return () => {
      try {
        if (raf) cancelAnimationFrame(raf);
      } catch (e) {}
      try {
        vv.removeEventListener("resize", schedule);
        vv.removeEventListener("scroll", schedule);
      } catch (e) {}
    };
  }, []);

  const syncScrollLockForCanvas = () => {
    // Only apply strict scroll locking on mobile.
    if (!isMobileViewport()) {
      unlockScrollForCanvasInteraction();
      return;
    }
    // Only lock while actively manipulating an object OR while text editing is active.
    // Keeping it locked just because something is selected makes the canvas unusable.
    const shouldLock =
      !!isTouchInteractingRef.current || !!isTextEditingRef.current;
    if (shouldLock) lockScrollForCanvasInteraction();
    else unlockScrollForCanvasInteraction();
  };

  useEffect(() => {
    if (!previewOpen) return;
    if (!previewImages?.Front || !previewImages?.Back) return;

    const mount = preview3dMountRef.current;
    if (!mount) return;

    let disposed = false;
    let rafId = 0;
    let resizeObserver = null;

    let renderer = null;
    let scene = null;
    let camera = null;
    let group = null;

    let planeW = 1;
    let planeH = 1;

    let maxAniso = 4;

    const texturesToDispose = [];
    const materialsToDispose = [];
    const geometriesToDispose = [];

    const loadHtmlImage = (src) => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error("Failed to load preview image"));
        img.src = src;
      });
    };

    const buildTextureFromImage = (img) => {
      // The preview captures often have transparent pixels outside the shirt.
      // If we use those directly as an RGB texture, transparent pixels can show up as black.
      // Composite onto white and gently boost brightness/contrast so the preview looks cleaner.
      const w = img.naturalWidth || img.width || 1024;
      const h = img.naturalHeight || img.height || 1024;
      const c = document.createElement("canvas");
      c.width = w;
      c.height = h;
      const ctx = c.getContext("2d", { alpha: false });
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, w, h);
      try {
        // Slight boost to match the brighter look in the reference.
        ctx.filter = "brightness(1.18) contrast(1.06) saturate(1.03)";
      } catch (e) {}
      ctx.drawImage(img, 0, 0, w, h);
      try {
        ctx.filter = "none";
      } catch (e) {}

      const t = new THREE.CanvasTexture(c);
      t.needsUpdate = true;
      t.colorSpace = THREE.SRGBColorSpace;
      // CanvasTexture is usually NPOT, so mipmaps are typically disabled.
      // Use anisotropy + linear filtering for better perceived sharpness.
      t.anisotropy = maxAniso;
      t.minFilter = THREE.LinearFilter;
      t.magFilter = THREE.LinearFilter;
      t.generateMipmaps = false;
      texturesToDispose.push(t);
      return t;
    };

    const makeCurvedPlaneGeometry = (w, h) => {
      const geo = new THREE.PlaneGeometry(w, h, 40, 40);
      const pos = geo.attributes.position;
      const halfW = w / 2;
      const curveDepth = Math.min(0.18, w * 0.18);
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const t = x / halfW; // -1..1
        const z = Math.sin(t * (Math.PI / 2)) * curveDepth;
        pos.setZ(i, z);
      }
      pos.needsUpdate = true;
      geo.computeVertexNormals();
      geometriesToDispose.push(geo);
      return geo;
    };

    const safeDispose = () => {
      if (disposed) return;
      disposed = true;

      try {
        if (rafId) cancelAnimationFrame(rafId);
      } catch (e) {}

      try {
        if (resizeObserver) resizeObserver.disconnect();
      } catch (e) {}

      try {
        materialsToDispose.forEach((m) => m && m.dispose && m.dispose());
        texturesToDispose.forEach((t) => t && t.dispose && t.dispose());
        geometriesToDispose.forEach((g) => g && g.dispose && g.dispose());
      } catch (e) {}

      try {
        if (renderer) {
          renderer.dispose();
          renderer.forceContextLoss && renderer.forceContextLoss();
        }
      } catch (e) {}

      try {
        if (mount) mount.innerHTML = "";
      } catch (e) {}
    };

    const start = async () => {
      try {
        mount.innerHTML = "";

        const dpr = window.devicePixelRatio || 1;
        const isMobileViewport =
          (window.matchMedia &&
            window.matchMedia("(max-width: 768px)").matches) ||
          (window.innerWidth || 0) <= 768;

        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.22;
        // Higher pixel ratio makes the 3D preview noticeably sharper.
        // On mobile, cap the pixel ratio lower to avoid GPU/memory issues.
        renderer.setPixelRatio(
          isMobileViewport ? Math.min(2, dpr) : Math.min(3, dpr)
        );
        renderer.setClearColor(0xffffff, 1);

        try {
          maxAniso = Math.max(
            1,
            Math.min(
              16,
              (renderer.capabilities &&
                typeof renderer.capabilities.getMaxAnisotropy === "function" &&
                renderer.capabilities.getMaxAnisotropy()) ||
                4
            )
          );
        } catch (e) {
          maxAniso = 4;
        }

        renderer.domElement.style.width = "100%";
        renderer.domElement.style.height = "100%";
        renderer.domElement.style.display = "block";
        mount.appendChild(renderer.domElement);

        scene = new THREE.Scene();
        scene.background = new THREE.Color(0xffffff);

        camera = new THREE.PerspectiveCamera(35, 1, 0.01, 50);

        const fitCameraToPlane = () => {
          if (!camera) return;
          const vfov = (camera.fov * Math.PI) / 180;
          const aspect = Math.max(0.01, camera.aspect || 1);
          const hfov = 2 * Math.atan(Math.tan(vfov / 2) * aspect);

          const distH = planeH / 2 / Math.tan(vfov / 2);
          const distW = planeW / 2 / Math.tan(hfov / 2);
          // Slight padding to avoid clipping at extreme window sizes.
          const dist = Math.max(distH, distW) * 1.06;

          camera.position.set(0, 0.05, dist);
          camera.lookAt(0, 0.05, 0);
        };

        const ambient = new THREE.AmbientLight(0xffffff, 1.15);
        scene.add(ambient);
        const dir = new THREE.DirectionalLight(0xffffff, 1.05);
        dir.position.set(2.5, 3.0, 3.5);
        scene.add(dir);

        group = new THREE.Group();
        group.rotation.x = 0.06;
        scene.add(group);

        const [frontImg, backImg] = await Promise.all([
          loadHtmlImage(previewImages.Front),
          loadHtmlImage(previewImages.Back),
        ]);

        if (disposed) return;

        const frontTex = buildTextureFromImage(frontImg);
        const backTex = buildTextureFromImage(backImg);

        const aspect =
          (frontImg.naturalWidth || frontImg.width || 1) /
          (frontImg.naturalHeight || frontImg.height || 1);
        planeH = 2.95;
        planeW = planeH * aspect;

        const geometry = makeCurvedPlaneGeometry(planeW, planeH);

        const matFront = new THREE.MeshStandardMaterial({
          map: frontTex,
          roughness: 0.95,
          metalness: 0.0,
        });
        const matBack = new THREE.MeshStandardMaterial({
          map: backTex,
          roughness: 0.95,
          metalness: 0.0,
        });
        materialsToDispose.push(matFront, matBack);

        const frontMesh = new THREE.Mesh(geometry, matFront);
        frontMesh.position.z = 0.01;
        group.add(frontMesh);

        const backMesh = new THREE.Mesh(geometry, matBack);
        backMesh.rotation.y = Math.PI;
        backMesh.position.z = -0.01;
        group.add(backMesh);

        const resize = () => {
          if (!mount || !renderer || !camera) return;
          const w = Math.max(1, mount.clientWidth || 1);
          const h = Math.max(1, mount.clientHeight || 1);
          renderer.setSize(w, h, false);
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          fitCameraToPlane();
        };

        resize();
        resizeObserver = new ResizeObserver(() => resize());
        resizeObserver.observe(mount);

        let last = performance.now();
        const animate = (now) => {
          if (disposed) return;
          const dt = Math.min(0.05, (now - last) / 1000);
          last = now;

          // Auto-rotate like the reference video.
          group.rotation.y += dt * 0.9;
          renderer.render(scene, camera);
          rafId = requestAnimationFrame(animate);
        };
        rafId = requestAnimationFrame(animate);
      } catch (e) {
        console.warn("3D preview init failed:", e);
        safeDispose();
      }
    };

    start();
    return () => safeDispose();
  }, [previewOpen, previewImages?.Front, previewImages?.Back]);

  const [hoveredColorName, setHoveredColorName] = useState(null);

  const [selectedColor, setSelectedColor] = useState("Black");

  const [imageUrl, setImageUrl] = useState(() =>
    getBgUrlFor({ clothKey: "men", colorName: "Black", sideKey: "Front" })
  );

  const [canvasReady, setCanvasReady] = useState(false);

  useEffect(() => {
    clothRef.current = cloth;
  }, [cloth]);

  // When the `cloth` state changes (for example via the dropdown or URL mapping),
  // ensure the Fabric canvas is rebuilt for the new cloth if the canvas is ready.
  useEffect(() => {
    if (!canvasReady) return;

    (async () => {
      try {
        await handleSideChange(currentSide || "Front", {
          clothKey: String(cloth || "men"),
          colorName: String(selectedColor || getDefaultColorForCloth(cloth)),
          skipSave: true,
        });
      } catch (e) {}
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cloth, canvasReady]);

  useEffect(() => {
    sideRef.current = currentSide;
  }, [currentSide]);

  useEffect(() => {
    selectedColorRef.current = selectedColor;
  }, [selectedColor]);

  const getHistoryBucket = (cKey, sKeyLower) => {
    const clothKey = String(cKey || "men");
    const sideKey = String(sKeyLower || "front");
    const root = historyRef.current || (historyRef.current = {});
    const clothNode = root[clothKey] || (root[clothKey] = {});
    const node =
      clothNode[sideKey] ||
      (clothNode[sideKey] = { undo: [], redo: [], present: null });
    return node;
  };

  const syncUndoRedoFlagsForCurrent = () => {
    const cKey = String(clothRef.current || cloth || "men");
    const sKey = String(
      sideRef.current || currentSide || "Front"
    ).toLowerCase();
    const bucket = getHistoryBucket(cKey, sKey);
    setCanUndo(!!(bucket && bucket.undo && bucket.undo.length));
    setCanRedo(!!(bucket && bucket.redo && bucket.redo.length));
  };

  useEffect(() => {
    syncUndoRedoFlagsForCurrent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cloth, currentSide]);

  const setDesignStoreFor = (clothKey, sideKeyLower, json) => {
    const cKey = String(clothKey || "men");
    const sKey = String(sideKeyLower || "front");
    setDesignStore((prev) => {
      const prevCloth =
        prev && prev[cKey] ? prev[cKey] : { front: null, back: null };
      const updated = {
        ...prev,
        [cKey]: {
          ...prevCloth,
          [sKey]: json,
        },
      };
      designStoreRef.current = updated;
      return updated;
    });
  };

  const commitCanvasNow = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    if (isRestoringRef.current) return;

    const cKey = String(clothRef.current || "men");
    const sKey = String(sideRef.current || "Front").toLowerCase();

    let json = null;
    try {
      json = canvas.toJSON(["isMaskImage", "absolutePositioned"]);
    } catch (e) {
      return;
    }

    let jsonStr = "";
    try {
      jsonStr = JSON.stringify(json);
    } catch (e) {
      return;
    }

    const bucket = getHistoryBucket(cKey, sKey);
    const prevPresent = bucket.present;
    if (prevPresent == null) {
      bucket.present = jsonStr;
      bucket.undo = [];
      bucket.redo = [];
    } else if (jsonStr !== prevPresent) {
      bucket.undo = Array.isArray(bucket.undo) ? bucket.undo : [];
      bucket.redo = [];
      bucket.undo.push(prevPresent);
      if (bucket.undo.length > 50) bucket.undo.shift();
      bucket.present = jsonStr;
    } else {
      // No change; don't thrash React state.
      return;
    }

    setDesignStoreFor(cKey, sKey, json);
    syncUndoRedoFlagsForCurrent();

    // autosave persistence removed (no localStorage writes)
  };

  const scheduleCanvasCommit = () => {
    if (isRestoringRef.current) return;
    try {
      if (commitTimerRef.current) clearTimeout(commitTimerRef.current);
    } catch (e) {}
    commitTimerRef.current = setTimeout(() => {
      commitTimerRef.current = 0;
      commitCanvasNow();
      // Mark design as changed when user modifies it
      if (savedDesign) {
        setDesignChanged(true);
      }
    }, 260);
  };

  const beginCanvasRestore = (token) => {
    isRestoringRef.current = true;
    restoringTokenRef.current = token;
    try {
      if (commitTimerRef.current) {
        clearTimeout(commitTimerRef.current);
        commitTimerRef.current = 0;
      }
    } catch (e) {}
  };

  const endCanvasRestore = (token) => {
    if (restoringTokenRef.current !== token) return;
    isRestoringRef.current = false;
  };

  // No persisted restore (localStorage disabled).

  // After autosave restore + Fabric mount, build the initial canvas once using the
  // deterministic handleSideChange() pipeline.
  useEffect(() => {
    if (!canvasReady) return;
    if (initialCanvasBuiltRef.current) return;
    initialCanvasBuiltRef.current = true;

    (async () => {
      try {
        const mapped = clothKeyFromExternalProductKey(productKey);
        const effectiveCloth =
          mapped && CLOTH_CONFIG[mapped] ? mapped : cloth || "men";

        const sideKey = currentSide || "Front";
        const sideLower = String(sideKey).toLowerCase();

        // Ensure color is valid for cloth; fall back if needed.
        let effectiveColor = selectedColor || "Black";
        try {
          effectiveColor = normalizeColorNameForCloth(
            effectiveCloth,
            effectiveColor
          );
          if (!isColorAvailableForCloth(effectiveCloth, effectiveColor)) {
            effectiveColor = getDefaultColorForCloth(effectiveCloth);
            setSelectedColor(effectiveColor);
          }
        } catch (e) {}

        // Load saved JSON from in-memory design store if present.
        const overrideJson =
          designStoreRef.current?.[effectiveCloth]?.[sideLower];

        await handleSideChange(currentSide || "Front", {
          clothKey: effectiveCloth,
          colorName: effectiveColor,
          overrideJson,
          skipSave: true,
        });
      } catch (e) {
        // ignore
      } finally {
        // Autosave persistence disabled.

        // Seed undo history for the current side.
        try {
          commitCanvasNow();
        } catch (e) {}
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasReady]);

  const persistAutosaveNow = () => {
    try {
      // Ensure the latest Fabric state is reflected in designStore.
      commitCanvasNow();
    } catch (e) {}
  };

  // No unload/visibility flush required (autosave disabled).

  // Keyboard shortcuts: Ctrl/Cmd+Z undo, Ctrl/Cmd+Shift+Z or Ctrl/Cmd+Y redo.
  useEffect(() => {
    const onKeyDown = (e) => {
      if (mockMode) return;
      if (!e) return;

      const target = e.target;
      const tag =
        target && target.tagName ? String(target.tagName).toLowerCase() : "";
      if (
        tag === "input" ||
        tag === "textarea" ||
        (target && target.isContentEditable)
      ) {
        return;
      }

      if (isTextEditingRef.current) return;

      const mod = !!(e.ctrlKey || e.metaKey);
      const key = String(e.key || "").toLowerCase();

      // Escape clears selection reliably.
      if (key === "escape") {
        try {
          const canvas = fabricCanvasRef.current;
          canvas && canvas.discardActiveObject && canvas.discardActiveObject();
          canvas && canvas.requestRenderAll && canvas.requestRenderAll();
        } catch (err) {}
        try {
          selectedObjectRef.current = null;
          setShowTextControls(false);
        } catch (err) {}
        return;
      }

      if (!mod) return;

      if (key === "z") {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      } else if (key === "y") {
        e.preventDefault();
        handleRedo();
      }
    };

    try {
      window.addEventListener("keydown", onKeyDown);
    } catch (e) {}
    return () => {
      try {
        window.removeEventListener("keydown", onKeyDown);
      } catch (e) {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mockMode]);

  const handleClothChange = async (nextClothKey) => {
    if (mockMode) return;

    const newKey = String(nextClothKey || "");
    if (!newKey || !CLOTH_CONFIG[newKey]) return;
    if (newKey === cloth) return;

    // Persist current cloth+side before switching.
    saveCurrentSideDesign();

    // Ensure we land on a valid color for the next cloth.
    // (Some products have fewer color variants.)
    let nextColor = normalizeColorNameForCloth(newKey, selectedColor);
    if (!isColorAvailableForCloth(newKey, nextColor)) {
      nextColor = getDefaultColorForCloth(newKey);
    }
    if (nextColor !== selectedColor) setSelectedColor(nextColor);

    // Update UI state.
    setCloth(newKey);

    // Rebuild canvas for the same side using the new cloth config.
    await handleSideChange(currentSide, {
      clothKey: newKey,
      colorName: nextColor,
      skipSave: true,
    });
  };

  const resetCurrentClothDesign = () => {
    const cKey = String(clothRef.current || cloth || "men");

    // Exit mock mode if active so we clear any temporary mask.
    try {
      if (mockMode) cancelMockup();
    } catch (e) {}

    // Clear Fabric objects, but keep the print-area border.
    try {
      const canvas = fabricCanvasRef.current;
      if (canvas) {
        try {
          canvas.discardActiveObject && canvas.discardActiveObject();
        } catch (e) {}

        const objects = (canvas.getObjects && canvas.getObjects()) || [];
        objects.slice().forEach((obj) => {
          if (!obj) return;
          if (obj.isClipBorder) return;
          try {
            canvas.remove(obj);
          } catch (e) {}
        });

        try {
          canvas.requestRenderAll && canvas.requestRenderAll();
        } catch (e) {}
      }
    } catch (e) {}

    // Clear selection UI state.
    try {
      selectedObjectRef.current = null;
      setShowTextControls(false);
      setHasSelection(false);
      hasActiveObjectRef.current = false;
    } catch (e) {}

    // Clear stored JSON for both sides for this cloth.
    setDesignStore((prev) => {
      const prevCloth =
        prev && prev[cKey] ? prev[cKey] : { front: null, back: null };
      const updated = {
        ...prev,
        [cKey]: {
          ...prevCloth,
          front: null,
          back: null,
        },
      };
      designStoreRef.current = updated;
      return updated;
    });

    // Clear undo/redo history for both sides.
    try {
      const root = historyRef.current || (historyRef.current = {});
      root[cKey] = {
        front: { undo: [], redo: [], present: null },
        back: { undo: [], redo: [], present: null },
      };
      setCanUndo(false);
      setCanRedo(false);
    } catch (e) {}

    // Persist immediately so refresh keeps the reset state.
    try {
      persistAutosaveNow();
    } catch (e) {}
  };
  const computeDesignPrice = () => {
    const frontHas = hasDesignForSide("Front");
    const backHas = hasDesignForSide("Back");
    const sides = (frontHas ? 1 : 0) + (backHas ? 1 : 0);

    if (sides === 0) {
      return {
        supported: true,
        hasAny: false,
        price: null,
        total: 0,
        subtotal: 0,
        delivery: 0,
        mode: "",
        label: "Add a design to see price",
      };
    }

    // Price table (internal cloth keys)
    const priceTable = {
      men: { one: 599, both: 749 },
      women: { one: 499, both: 699 },
      hoodie: { one: 859, both: 1100 },
      womenCropHoodie: { one: 649, both: 799 },
      sweatshirt: { one: 700, both: 850 },
    };

    const key = String(cloth || "men");
    const entry = priceTable[key] || priceTable.men;
    const subtotal = sides === 2 ? entry.both : entry.one;
    const delivery = 0; // Free delivery
    const total = subtotal + delivery;
    const mode = sides === 2 ? "Both Sides" : "One Side";

    return {
      supported: true,
      hasAny: true,
      price: subtotal,
      total,
      subtotal,
      delivery,
      mode,
      label: `₹${subtotal}`,
    };
  };
  const handleSaveDesign = async () => {
    if (savingDesign) return;

    try {
      setSavingDesign(true);
      console.log("Starting design save...");

      // Save current side design before capturing
      saveCurrentSideDesign();

      const cKey = String(clothRef.current || cloth || "men");
      const currentStore = designStoreRef.current || {};
      const clothStore = currentStore[cKey] || {};

      // Get design JSON for both sides
      const frontDesignJson = clothStore.front;
      const backDesignJson = clothStore.back;

      console.log("Design JSON:", { frontDesignJson, backDesignJson });

      // Check if there's any design content
      const hasDesignContent = (jsonData) => {
        if (!jsonData || !jsonData.objects) return false;
        return jsonData.objects.some(
          (obj) =>
            obj &&
            !obj.isMaskImage &&
            obj.type !== "rect" &&
            !obj.absolutePositioned
        );
      };

      const hasFront = hasDesignContent(frontDesignJson);
      const hasBack = hasDesignContent(backDesignJson);

      if (!hasFront && !hasBack) {
        toast.error("Please add some design elements before saving");
        setSavingDesign(false);
        return;
      }

      console.log("Has content - Front:", hasFront, "Back:", hasBack);
      console.log("Capturing images...");

      const canvas = fabricCanvasRef.current;
      if (!canvas) {
        toast.error("Canvas not ready. Please try again.");
        setSavingDesign(false);
        return;
      }

      // Save original side to restore later
      const originalSide = currentSide;

      const images = {};

      // Capture Front side if it has design
      if (hasFront) {
        console.log("Capturing front side...");

        // Switch to front side
        await handleSideChange("Front", {
          clothKey: cKey,
          colorName: selectedColor,
          skipSave: true,
        });
        await new Promise((resolve) => setTimeout(resolve, 200));

        // Capture full mockup with cloth (red border removed automatically by captureFullMockupDataUrl)
        const frontFullMockup = await captureFullMockupDataUrl({ scale: 3 });
        images.front = frontFullMockup;

        // Capture design only (transparent background)
        try {
          const frontDesignOnly = await captureDesignOnlyDataUrl({ scale: 4 });
          if (frontDesignOnly) {
            images.frontDesignArea = frontDesignOnly;
          }
        } catch (err) {
          console.warn("Front design-only capture failed:", err);
        }
      }

      // Capture Back side if it has design
      if (hasBack) {
        console.log("Capturing back side...");

        // Switch to back side
        await handleSideChange("Back", {
          clothKey: cKey,
          colorName: selectedColor,
          skipSave: true,
        });
        await new Promise((resolve) => setTimeout(resolve, 200));

        // Capture full mockup with cloth
        const backFullMockup = await captureFullMockupDataUrl({ scale: 3 });
        images.back = backFullMockup;

        // Capture design only (transparent background)
        try {
          const backDesignOnly = await captureDesignOnlyDataUrl({ scale: 4 });
          if (backDesignOnly) {
            images.backDesignArea = backDesignOnly;
          }
        } catch (err) {
          console.warn("Back design-only capture failed:", err);
        }
      } else if (hasFront) {
        // If no back design, capture back cloth without design for preview
        console.log("Capturing back cloth (no design)...");

        await handleSideChange("Back", {
          clothKey: cKey,
          colorName: selectedColor,
          skipSave: true,
        });
        await new Promise((resolve) => setTimeout(resolve, 200));

        const backFullMockup = await captureFullMockupDataUrl({ scale: 3 });
        images.back = backFullMockup;
      }

      // Restore original side
      if (currentSide !== originalSide) {
        await handleSideChange(originalSide, {
          clothKey: cKey,
          colorName: selectedColor,
          skipSave: true,
        });
      }

      console.log("Images prepared:", Object.keys(images));

      // Create design title with user name and timestamp
      const userName = user?.name || user?.email || "Guest";
      const timestamp = new Date().toLocaleString();
      const designTitle = `${userName} - ${
        CLOTH_CONFIG[cKey]?.label || "Product"
      } - ${timestamp}`;

      // Get the pricing and extract just the price number for sellPrice
      const pricingInfo = computeDesignPrice();

      const designPayload = {
        title: designTitle,
        images: images,
        sellPrice: pricingInfo.price || 0,
        isPublic: false,
      };

      console.log("Sending design to API...");

      const designResponse = await createDesignApi(designPayload);
      console.log("Design API response:", designResponse);

      const createdDesign = designResponse?.data;

      if (!createdDesign || !createdDesign._id) {
        throw new Error("Failed to create design record");
      }

      setSavedDesign(createdDesign);
      setDesignChanged(false); // Reset design changed flag
      toast.success("Design saved successfully!");
      try {
        // Show preview of the saved design so the user can confirm visuals
        await openPreviewBothSides();
      } catch (e) {
        // If preview fails, don't block the save flow.
        console.warn("Opening preview after save failed:", e);
      }
      console.log("Design saved:", createdDesign);
      return createdDesign;
    } catch (error) {
      console.error("Failed to save design:", error);
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to save design. Please try again."
      );
    } finally {
      setSavingDesign(false);
    }
  };

  // Mobile add flow: save if needed, open preview, add to cart, then checkout
  const handleMobileAddFlow = async () => {
    if (mockMode || addingToCart) return;

    if (!selectedSize) {
      toast.error("Please select a size before adding to cart");
      return;
    }

    // If design changed or not yet saved, save it first (handleSaveDesign opens preview)
    if (designChanged || !savedDesign || !savedDesign._id) {
      try {
        const created = await handleSaveDesign();
        if (!created || !created._id) return;
      } catch (e) {
        return;
      }
    } else {
      // Ensure preview is visible so user sees confirmation visuals
      try {
        await openPreviewBothSides();
      } catch (e) {}
    }

    // Now perform add-to-cart and go to checkout
    try {
      const ok = await handleAddToCart();
      if (ok) handleGoToCheckout();
    } catch (e) {
      // ignore — handleAddToCart already shows errors
    }
  };

  const handleAddToCart = async () => {
    // Must have a saved design first
    if (!savedDesign || !savedDesign._id) {
      toast.error("Please save your design first");
      return;
    }

    // Check if design has changed since last save
    if (designChanged) {
      toast.error(
        "Design has been modified. Please save your design again before adding to cart."
      );
      return;
    }

    // Validate size selection
    if (!selectedSize) {
      toast.error("Please select a size before adding to cart");
      return;
    }

    try {
      setAddingToCart(true);

      // Find size ID from sizesList
      const sizeObj = sizesList.find((s) => s.name === selectedSize);
      const sizeId = sizeObj?._id;

      // Find color object
      const colorObj = AVAILABLE_COLORS.find((c) => c.name === selectedColor);

      // Prepare cart data using saved design
      const cartData = {
        itemType: "custom",
        quantity: 1,
        price: savedDesign.sellPrice || 499,
        design: {
          designId: savedDesign._id,
          title: savedDesign.title,
          images: {
            front: savedDesign.images.front,
            back: savedDesign.images.back,
            frontDesignArea: savedDesign.images.frontDesignArea,
            backDesignArea: savedDesign.images.backDesignArea,
          },
          size: {
            id: sizeId,
            name: selectedSize,
          },
          color: {
            id: null,
            name: selectedColor,
            hexCode: colorObj?.value || "#000000",
          },
        },
      };

      // Add to cart
      await addToCartApi(cartData);

      // Refresh cart in the store
      await fetchCart();

      setAddedToCart(true);
      toast.success("Custom design added to cart successfully!");
      return true;
    } catch (error) {
      console.error("Failed to add to cart:", error);
      toast.error(
        error?.response?.data?.message ||
          "Failed to add to cart. Please try again."
      );
      return false;
    } finally {
      setAddingToCart(false);
    }
  };

  const handleGoToCheckout = () => {
    navigate("/checkout");
  };

  // If the parent app provides a productKey like "Men/Tshirt", keep this component in sync.
  useEffect(() => {
    // If URL query params are present, they should take precedence over
    // a parent-supplied `productKey` (e.g., navigating from the shop).
    try {
      const catId = searchParams.get("category");
      const subId = searchParams.get("subcategory");
      if (catId || subId) return;
    } catch (e) {}

    const mapped = clothKeyFromExternalProductKey(productKey);
    if (!mapped) return;
    if (mapped === cloth) return;
    // Fire-and-forget; handleClothChange persists/rehydrates designs.
    handleClothChange(mapped);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productKey]);

  const designStoreRef = useRef(null);

  const PRINT_DPI = 96;

  useEffect(() => {
    designStoreRef.current = designStore;
  }, [designStore]);

  const tweenTo = (el, vars) => {
    if (!el) return;
    try {
      gsap.killTweensOf(el);
      gsap.to(el, { duration: 0.18, ease: "power2.out", ...vars });
    } catch (e) {}
  };

  useEffect(() => {
    const canvas = new fabric.Canvas(canvasRef.current, {
      width: baseSizeRef.current.width,
      height: baseSizeRef.current.height,
      backgroundColor: null,
      preserveObjectStacking: true,
    });

    fabricCanvasRef.current = canvas;
    setCanvasReady(true);

    // On mobile browsers, touch drags on the canvas can be interpreted as page/container
    // scrolling (rubber-band / pull-to-refresh). Prevent default touch scrolling on the
    // Fabric canvas elements so object drag/scale feels stable.
    const touchOptions = { passive: false };
    const preventTouchScroll = (e) => {
      // Only block scrolling while we're actively manipulating a Fabric object.
      if (!scrollLockRef.current.locked) return;
      if (e && e.cancelable) e.preventDefault();
    };
    const markTouchStart = (e) => {
      if (!isMobileViewport()) return;

      // Ensure offsets are up-to-date right before hit-testing/selecting.
      recalcFabricOffsets();

      // If the touch starts on a Fabric object/handle, lock scrolling.
      // If it starts on empty space, allow scrolling (user may need to pan the view).
      let hitTarget = false;
      try {
        const evt = toFabricPointerEvent(e);
        const t =
          canvas && typeof canvas.findTarget === "function"
            ? canvas.findTarget(evt)
            : null;
        hitTarget = !!t;
      } catch (err) {
        // safest fallback: assume it's empty space (avoid accidental drags)
        hitTarget = false;
      }

      isTouchInteractingRef.current = hitTarget;
      syncScrollLockForCanvas();
    };
    const markTouchEnd = () => {
      isTouchInteractingRef.current = false;
      syncScrollLockForCanvas();
    };
    const upperEl = canvas.upperCanvasEl;
    const lowerEl = canvas.lowerCanvasEl;
    try {
      if (upperEl) {
        // Allow scrolling/panning when not interacting; lockScroll will flip to "none".
        upperEl.style.touchAction = "pan-y";
        upperEl.style.webkitUserSelect = "none";
        upperEl.style.userSelect = "none";
        upperEl.style.webkitTouchCallout = "none";
        upperEl.addEventListener(
          "touchstart",
          preventTouchScroll,
          touchOptions
        );
        upperEl.addEventListener("touchmove", preventTouchScroll, touchOptions);
        upperEl.addEventListener("touchstart", markTouchStart, touchOptions);
        upperEl.addEventListener("touchend", markTouchEnd, touchOptions);
        upperEl.addEventListener("touchcancel", markTouchEnd, touchOptions);
      }
      if (lowerEl) {
        lowerEl.style.touchAction = "pan-y";
        lowerEl.style.webkitUserSelect = "none";
        lowerEl.style.userSelect = "none";
        lowerEl.style.webkitTouchCallout = "none";
        lowerEl.addEventListener(
          "touchstart",
          preventTouchScroll,
          touchOptions
        );
        lowerEl.addEventListener("touchmove", preventTouchScroll, touchOptions);
        lowerEl.addEventListener("touchstart", markTouchStart, touchOptions);
        lowerEl.addEventListener("touchend", markTouchEnd, touchOptions);
        lowerEl.addEventListener("touchcancel", markTouchEnd, touchOptions);
      }
    } catch (e) {}

    const selectionHandler = (opt) => {
      const active = canvas.getActiveObject
        ? canvas.getActiveObject()
        : opt.target;
      const obj = active || opt.target;

      // Mobile: whenever any object is active, strictly restrict scrolling.
      try {
        const activeObjects =
          (typeof canvas.getActiveObjects === "function" &&
            canvas.getActiveObjects()) ||
          (canvas.getActiveObject() ? [canvas.getActiveObject()] : []);
        hasActiveObjectRef.current =
          Array.isArray(activeObjects) && activeObjects.length > 0;
        setHasSelection(
          Array.isArray(activeObjects) && activeObjects.length > 0
        );
      } catch (e) {
        hasActiveObjectRef.current = !!obj;
        setHasSelection(!!obj);
      }

      try {
        recalcFabricOffsets();
      } catch (e) {}

      const isText =
        obj &&
        (obj.type === "textbox" ||
          obj.type === "i-text" ||
          obj.type === "text");
      if (isText) {
        selectedObjectRef.current = obj;
        setShowTextControls(true);
        setFontColor(obj.fill || "#000000");
        setFontFamily(obj.fontFamily || "Arial");
      } else {
        selectedObjectRef.current = null;
        setShowTextControls(false);
      }
    };

    const clearHandler = () => {
      selectedObjectRef.current = null;
      setShowTextControls(false);

      setHasSelection(false);

      hasActiveObjectRef.current = false;
      // If we were editing text, treat clearing selection as ending edit.
      isTextEditingRef.current = false;

      try {
        syncScrollLockForCanvas();
      } catch (e) {}

      try {
        recalcFabricOffsets();
      } catch (e) {}

      // Some browsers can leave the transform/selection border painted until a re-render.
      try {
        canvas.requestRenderAll && canvas.requestRenderAll();
      } catch (e) {}
    };

    const onTextEditingEntered = () => {
      isTextEditingRef.current = true;
      try {
        syncScrollLockForCanvas();
      } catch (e) {}
    };
    const onTextEditingExited = () => {
      isTextEditingRef.current = false;
      try {
        syncScrollLockForCanvas();
      } catch (e) {}
    };

    const clearSelectionHard = () => {
      try {
        canvas.discardActiveObject?.();
      } catch (e) {}
      try {
        canvas.requestRenderAll && canvas.requestRenderAll();
      } catch (e) {}
      try {
        clearHandler();
      } catch (e) {}
    };

    const onMouseDown = (opt) => {
      if (isRestoringRef.current) return;
      // If user taps/clicks on empty space, Fabric sometimes doesn't emit
      // selection:cleared (especially on mobile/fast taps). Force clear.
      // BUT: during transforms (dragging scale/rotate controls), Fabric may not
      // provide `opt.target` even though a transform is active. Don't clear then.
      const hasTarget = !!(
        opt &&
        (opt.target ||
          (opt.subTargets && opt.subTargets.length) ||
          (opt.transform && opt.transform.target))
      );
      const isTransforming =
        !!(opt && opt.transform) || !!(canvas && canvas._currentTransform);
      if (hasTarget || isTransforming) return;
      clearSelectionHard();
    };

    canvas.on("selection:created", selectionHandler);
    canvas.on("selection:updated", selectionHandler);
    canvas.on("selection:cleared", clearHandler);
    canvas.on("mouse:down", onMouseDown);
    try {
      canvas.on("text:editing:entered", onTextEditingEntered);
      canvas.on("text:editing:exited", onTextEditingExited);
    } catch (e) {}

    // Track edits and keep designStore + undo history in sync.
    const onCanvasChanged = () => {
      if (mockMode) return;
      scheduleCanvasCommit();
    };
    try {
      canvas.on("object:added", onCanvasChanged);
      canvas.on("object:modified", onCanvasChanged);
      canvas.on("object:removed", onCanvasChanged);
      canvas.on("text:changed", onCanvasChanged);
    } catch (e) {}

    return () => {
      try {
        canvas.off("selection:created");
        canvas.off("selection:updated");
        canvas.off("selection:cleared");
        canvas.off("mouse:down");
        canvas.off("text:editing:entered");
        canvas.off("text:editing:exited");
        canvas.off("object:added");
        canvas.off("object:modified");
        canvas.off("object:removed");
        canvas.off("text:changed");
      } catch (e) {}

      try {
        if (upperEl) {
          upperEl.removeEventListener(
            "touchstart",
            preventTouchScroll,
            touchOptions
          );
          upperEl.removeEventListener(
            "touchmove",
            preventTouchScroll,
            touchOptions
          );
          upperEl.removeEventListener(
            "touchstart",
            markTouchStart,
            touchOptions
          );
          upperEl.removeEventListener("touchend", markTouchEnd, touchOptions);
          upperEl.removeEventListener(
            "touchcancel",
            markTouchEnd,
            touchOptions
          );
        }
        if (lowerEl) {
          lowerEl.removeEventListener(
            "touchstart",
            preventTouchScroll,
            touchOptions
          );
          lowerEl.removeEventListener(
            "touchmove",
            preventTouchScroll,
            touchOptions
          );
          lowerEl.removeEventListener(
            "touchstart",
            markTouchStart,
            touchOptions
          );
          lowerEl.removeEventListener("touchend", markTouchEnd, touchOptions);
          lowerEl.removeEventListener(
            "touchcancel",
            markTouchEnd,
            touchOptions
          );
        }
      } catch (e) {}

      // Ensure scroll is unlocked if component unmounts mid-touch.
      try {
        unlockScrollForCanvasInteraction();
      } catch (e) {}

      try {
        if (commitTimerRef.current) {
          clearTimeout(commitTimerRef.current);
          commitTimerRef.current = 0;
        }
      } catch (e) {}
      canvas.dispose();
    };
  }, []);

  // Extra guard: prevent scroll gestures while finger is down on the stage.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const opts = { passive: false };
    const onTouchMoveCapture = (e) => {
      // Only block scroll while we're actively manipulating an object / text.
      if (!scrollLockRef.current.locked) return;
      // Only block scroll when the event is coming from inside the stage.
      try {
        if (stage && e && e.target && !stage.contains(e.target)) return;
      } catch (err) {}
      if (e && e.cancelable) e.preventDefault();
    };

    try {
      // Allow scroll gestures when not locked.
      stage.style.touchAction = "pan-y";
    } catch (e) {}

    try {
      // Capture listener helps beat browser scroll handlers.
      document.addEventListener("touchmove", onTouchMoveCapture, {
        passive: false,
        capture: true,
      });
    } catch (e) {}

    return () => {
      try {
        document.removeEventListener("touchmove", onTouchMoveCapture, true);
      } catch (e) {}
      try {
        unlockScrollForCanvasInteraction();
      } catch (e) {}
    };
  }, []);

  // Responsive canvas for mobile: scale canvas by container width
  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const container = containerRef.current;
      if (!container) return;

      const baseW = baseSizeRef.current.width;
      const baseH = baseSizeRef.current.height;

      const containerWidth = container.clientWidth || baseW;
      const containerHeight = container.clientHeight || baseH;

      const fitScaleW = containerWidth / baseW;
      const fitScaleH = containerHeight / baseH;
      const isMobile = (window.innerWidth || 0) <= 768;

      // On phones, make the mockup larger while staying mostly fully visible:
      // - Bias towards fitting the height (bigger on portrait screens)
      // - But cap width overflow to a small amount so it doesn't become awkward.
      // On desktop, keep existing behavior (fit by width).
      const maxMobileScale = 1.25;
      const maxWidthOverflowRatio = 2; // allow up to 18% wider than viewport
      const desktopScale = fitScaleW;

      const scale = isMobile
        ? Math.min(
            maxMobileScale,
            Math.min(fitScaleH, fitScaleW * maxWidthOverflowRatio)
          )
        : Math.min(1, desktopScale);

      // Use floor to avoid 1px overflow that can cause scrollbars.
      const cssW = Math.max(1, Math.floor(baseW * scale));
      const cssH = Math.max(1, Math.floor(baseH * scale));

      // Keep full internal resolution; only scale the DOM size.
      try {
        canvas.setDimensions(
          { width: baseW, height: baseH },
          { backstoreOnly: true }
        );
        canvas.setDimensions({ width: cssW, height: cssH }, { cssOnly: true });
        if (typeof canvas.calcOffset === "function") canvas.calcOffset();
      } catch (e) {}

      // Keep the shirt background aligned with the canvas by sizing the stage
      // to the same CSS pixels as the canvas element.
      try {
        if (stageRef.current) {
          stageRef.current.style.width = `${cssW}px`;
          stageRef.current.style.height = `${cssH}px`;
        }
      } catch (e) {}

      canvas.requestRenderAll && canvas.requestRenderAll();
    };

    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  function setCanvasBackground(imageUrl) {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    fabric.Image.fromURL(
      imageUrl,
      (img) => {
        img.set({
          originX: "center",
          originY: "center",
          left: canvas.width / 2,
          top: canvas.height / 2,
          selectable: false,
          evented: false,
        });

        canvas.setBackgroundImage(img, canvas.requestRenderAll.bind(canvas));
      },
      { crossOrigin: "anonymous" }
    );
  }

  const renderControlsPanel = (opts = {}) => (
    <>
      <div className="space-y-4">
        <div>
          <div className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-gray-500 mb-2">
            Add
          </div>
          <input
            id="textName"
            ref={textInputRef}
            type="text"
            placeholder="Enter text here"
            className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm outline-none focus:border-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          <div className="mt-2 grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                try {
                  const inputVal =
                    (textInputRef.current &&
                      String(textInputRef.current.value)) ||
                    "";
                  if (!inputVal.trim()) {
                    alert("Please enter text before adding.");
                    return;
                  }

                  const seen = window.localStorage.getItem(
                    "designer_abuse_warning_seen"
                  );
                  if (!seen) {
                    pendingAddTextRef.current = true;
                    setAbuseModalOpen(true);
                  } else {
                    addCanvasText();
                    closeMobileToolsSheet();
                  }
                } catch (e) {
                  pendingAddTextRef.current = true;
                  setAbuseModalOpen(true);
                }
              }}
              disabled={mockMode}
              className="h-10 px-3 rounded-xl border border-gray-900 bg-gray-900 text-white text-[13px] font-extrabold inline-flex items-center justify-center transition-shadow hover:shadow-lg active:translate-y-px disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Add Text
            </button>
            <button
              onClick={() => {
                requestUploadImage();
                closeMobileToolsSheet({ defer: true });
              }}
              disabled={mockMode}
              className="h-10 px-3 rounded-xl border border-gray-200 bg-white text-gray-900 text-[13px] font-extrabold inline-flex items-center justify-center transition-shadow hover:shadow-md active:translate-y-px disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Upload Image
            </button>
          </div>
        </div>
        <div>
          <div className="mt-4">
            <div className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-gray-500 mb-2">
              Reset
            </div>
            <button
              type="button"
              onClick={() => {
                resetCurrentClothDesign();
                closeMobileToolsSheet();
              }}
              className="w-full h-10 px-3 rounded-xl border border-red-700 bg-white text-red-700 text-[13px] font-extrabold inline-flex items-center justify-center transition-shadow hover:shadow-md active:translate-y-px"
            >
              Reset
            </button>
          </div>
        </div>

        {!opts.hideArrange && (
          <div>
            <div className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-gray-500 mb-2">
              Arrange
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  handleUndo();
                  closeMobileToolsSheet();
                }}
                disabled={mockMode || !canUndo}
                className="h-10 px-3 rounded-xl border border-gray-200 bg-white text-gray-900 text-[13px] font-extrabold inline-flex items-center justify-center transition-shadow hover:shadow-md active:translate-y-px disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Undo
              </button>
              <button
                onClick={() => {
                  handleRedo();
                  closeMobileToolsSheet();
                }}
                disabled={mockMode || !canRedo}
                className="h-10 px-3 rounded-xl border border-gray-200 bg-white text-gray-900 text-[13px] font-extrabold inline-flex items-center justify-center transition-shadow hover:shadow-md active:translate-y-px disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Redo
              </button>
              <button
                onClick={() => {
                  handleBringToFront();
                  closeMobileToolsSheet();
                }}
                disabled={mockMode}
                className="h-10 px-3 rounded-xl border border-gray-200 bg-white text-gray-900 text-[13px] font-extrabold inline-flex items-center justify-center transition-shadow hover:shadow-md active:translate-y-px disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Bring Front
              </button>
              <button
                onClick={() => {
                  handleDeleteObject();
                  closeMobileToolsSheet();
                }}
                disabled={mockMode}
                className="h-10 px-3 rounded-xl border border-red-700 bg-red-700 text-white text-[13px] font-extrabold inline-flex items-center justify-center transition-shadow hover:shadow-md active:translate-y-px disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Delete
              </button>
            </div>
          </div>
        )}

        <div className="hidden">
          <div className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-gray-500 mb-2">
            Export
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                downloadClipArea();
                closeMobileToolsSheet();
              }}
              disabled={mockMode}
              className="h-10 px-3 rounded-xl border border-gray-200 bg-white text-gray-900 text-[13px] font-extrabold inline-flex items-center justify-center transition-shadow hover:shadow-md active:translate-y-px disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Download Clip
            </button>
            <button
              onClick={() => {
                downloadCanvasWithBackground();
                closeMobileToolsSheet();
              }}
              disabled={mockMode}
              className="h-10 px-3 rounded-xl border border-gray-200 bg-white text-gray-900 text-[13px] font-extrabold inline-flex items-center justify-center transition-shadow hover:shadow-md active:translate-y-px disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Full Mockup
            </button>
            <button
              onClick={() => {
                downloadBothSidesZip();
                closeMobileToolsSheet();
              }}
              disabled={mockMode}
              className="h-10 px-3 rounded-xl border border-gray-200 bg-white text-gray-900 text-[13px] font-extrabold inline-flex items-center justify-center transition-shadow hover:shadow-md active:translate-y-px disabled:opacity-60 disabled:cursor-not-allowed"
            >
              ZIP (2 Sides)
            </button>
            <button
              onClick={handleMockPrint}
              disabled={mockMode}
              className="h-10 px-3 rounded-xl border border-gray-200 bg-white text-gray-900 text-[13px] font-extrabold inline-flex items-center justify-center transition-shadow hover:shadow-md active:translate-y-px disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Mock Print
            </button>
          </div>

          <button
            onClick={() => {
              openPreviewBothSides();
              closeMobileToolsSheet();
            }}
            disabled={mockMode}
            className="mt-2 w-full h-10 px-3 rounded-xl border border-gray-900 bg-gray-900 text-white text-[13px] font-extrabold inline-flex items-center justify-center transition-shadow hover:shadow-lg active:translate-y-px disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Preview Front + Back
          </button>
        </div>

        <div className="mt-5">
          <p className="text-xs hidden font-extrabold uppercase tracking-[0.16em] text-gray-500 mb-3">
            Select Product:{" "}
            <span className="text-black">
              {CLOTH_CONFIG[cloth]?.label || cloth}
            </span>
          </p>

          <select
            disabled={mockMode}
            value={cloth}
            onChange={(e) => handleClothChange(e.target.value)}
            className="w-full hidden h-10 px-3 rounded-lg border border-gray-200 bg-white text-gray-900 text-sm outline-none focus:border-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed mb-[18px]"
          >
            {Object.keys(CLOTH_CONFIG).map((key) => (
              <option key={key} value={key}>
                {CLOTH_CONFIG[key]?.label || key}
              </option>
            ))}
          </select>

          <div className="relative">
            <p className="relative z-20 text-xs font-extrabold uppercase tracking-[0.16em] text-gray-500 mb-4">
              Select Color: <span className="text-black">{selectedColor}</span>
            </p>

            <div className="relative z-10 grid grid-cols-6 gap-3 p-2">
              {getAvailableColorsForCloth(cloth).map((color) => {
                const isActive = selectedColor === color.name;

                return (
                  <button
                    key={color.value}
                    disabled={mockMode}
                    onClick={(e) => {
                      handleImageChange(color);
                      try {
                        if (e && e.currentTarget)
                          tweenTo(e.currentTarget, { scale: 1 });
                      } catch (err) {}
                    }}
                    onMouseEnter={(e) => {
                      if (mockMode) return;
                      setHoveredColorName(color.name);
                      tweenTo(e.currentTarget, { scale: 1.15 });
                    }}
                    onMouseLeave={(e) => {
                      setHoveredColorName((prev) =>
                        prev === color.name ? null : prev
                      );
                      tweenTo(e.currentTarget, { scale: 1 });
                    }}
                    onMouseDown={(e) => {
                      if (mockMode) return;
                      tweenTo(e.currentTarget, { scale: 0.9, duration: 0.08 });
                    }}
                    className={`relative w-10 h-10 rounded-full inline-flex items-center justify-center transition-shadow ${
                      mockMode
                        ? "opacity-60 cursor-not-allowed"
                        : "cursor-pointer"
                    } ${
                      isActive
                        ? "border-2 border-white ring-2 ring-black ring-offset-2 shadow-lg"
                        : "border border-gray-200"
                    } ${
                      COLOR_BG_CLASS_BY_VALUE[
                        String(color.value || "").toLowerCase()
                      ] || "bg-gray-200"
                    }`}
                  >
                    <span
                      className={`mb-5 pointer-events-none absolute left-1/2 -translate-x-1/2 -bottom-7 z-10 rounded bg-black px-2 py-0.5 text-[10px] text-white whitespace-nowrap transition-all duration-150 ${
                        hoveredColorName === color.name
                          ? "opacity-100 translate-y-0"
                          : "opacity-0 translate-y-2"
                      }`}
                    >
                      {color.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Size Selector */}
          <div className="relative mt-4">
            <p className="relative z-20 text-xs font-extrabold uppercase tracking-[0.16em] text-gray-500 mb-4">
              Select Size:{" "}
              <span className="text-black">{selectedSize || "None"}</span>
            </p>

            <div className="relative z-10 grid grid-cols-4 gap-2 p-2">
              {sizesList && sizesList.length > 0 ? (
                sizesList.map((size) => {
                  const isActive = selectedSize === size.name;

                  return (
                    <button
                      key={size._id || size.name}
                      disabled={mockMode}
                      onClick={() => {
                        setSelectedSize(size.name);
                        selectedSizeRef.current = size.name;
                      }}
                      className={`relative h-10 rounded-lg inline-flex items-center justify-center transition-all text-sm font-bold ${
                        mockMode
                          ? "opacity-60 cursor-not-allowed"
                          : "cursor-pointer hover:scale-105"
                      } ${
                        isActive
                          ? "border-2 border-black bg-black text-white shadow-lg"
                          : "border border-gray-300 bg-white text-gray-700 hover:border-gray-900"
                      }`}
                    >
                      {size.name}
                    </button>
                  );
                })
              ) : (
                <div className="col-span-4 text-xs text-gray-500 text-center py-2">
                  No sizes available
                </div>
              )}
            </div>
          </div>

          {/* Save Design, Add to Cart, and Checkout Workflow */}
          {/* <div className="mt-6 space-y-3">
            {!savedDesign ? (
              <button
                onClick={handleSaveDesign}
                disabled={mockMode || savingDesign}
                className={`w-full h-12 px-4 rounded-xl text-sm font-extrabold inline-flex items-center justify-center transition-all ${
                  mockMode || savingDesign
                    ? "border border-gray-300 bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "border-2 border-blue-600 bg-blue-600 text-white hover:bg-blue-700 hover:border-blue-700 hover:shadow-lg active:translate-y-px"
                }`}
              >
                {savingDesign ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Saving Design...
                  </span>
                ) : (
                  "Save Design"
                )}
              </button>
            ) : (
              <>
                {designChanged && (
                  <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-3 mb-3">
                    <p className="text-xs font-semibold text-yellow-800 flex items-center gap-2">
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Design Modified - Save Again Required
                    </p>
                    <p className="text-xs text-yellow-700 mt-1">
                      You've made changes to your design. Please save again
                      before adding to cart.
                    </p>
                  </div>
                )}

                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-xs font-semibold text-green-700 flex items-center gap-2">
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Design Saved Successfully!
                  </p>
                  <p className="text-xs text-gray-600 mt-1 truncate">
                    {savedDesign.title}
                  </p>
                </div>

                {designChanged && (
                  <button
                    onClick={handleSaveDesign}
                    disabled={mockMode || savingDesign}
                    className={`w-full h-12 px-6 rounded-full text-[15px] font-extrabold inline-flex items-center justify-center active:translate-y-px shadow-lg ${
                      mockMode || savingDesign
                        ? "border border-gray-300 bg-gray-200 text-gray-500 cursor-not-allowed"
                        : "bg-yellow-600 text-white hover:bg-yellow-700 hover:border-yellow-700 hover:shadow-lg"
                    }`}
                  >
                    {savingDesign ? (
                      <span className="flex items-center gap-2">
                        <svg
                          className="animate-spin h-4 w-4"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Saving Changes...
                      </span>
                    ) : (
                      "Save Changes"
                    )}
                  </button>
                )}

                {!addedToCart ? (
                  <button
                    onClick={handleAddToCart}
                    disabled={
                      mockMode || addingToCart || !selectedSize || designChanged
                    }
                    className={`w-full h-12 px-6 rounded-full text-[15px] font-extrabold inline-flex items-center justify-center active:translate-y-px shadow-lg ${
                      mockMode || addingToCart || !selectedSize || designChanged
                        ? "border border-gray-300 bg-gray-200 text-gray-500 cursor-not-allowed"
                        : "bg-green-600 text-white hover:bg-green-700 hover:border-green-700 hover:shadow-lg"
                    }`}
                  >
                    {addingToCart ? (
                      <span className="flex items-center gap-2">
                        <svg
                          className="animate-spin h-4 w-4"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Adding to Cart...
                      </span>
                    ) : (
                      `Add to Cart ${
                        !selectedSize
                          ? "(Select Size)"
                          : designChanged
                          ? "(Save First)"
                          : ""
                      }`
                    )}
                  </button>
                ) : (
                  <button
                    onClick={handleGoToCheckout}
                    className={`w-full h-12 px-6 rounded-full text-[15px] font-extrabold inline-flex items-center justify-center active:translate-y-px shadow-lg ${
                      "bg-purple-600 text-white hover:bg-purple-700 hover:border-purple-700 hover:shadow-lg"
                    }`}
                  >
                    Go to Checkout →
                  </button>
                )}

                {!selectedSize && !addedToCart && (
                  <p className="text-xs text-red-500 mt-2 text-center">
                    Please select a size before adding to cart
                  </p>
                )}
              </>
            )}
          </div> */}
        </div>

        {mockMode && (
          <div className="mt-4 rounded-2xl border border-gray-200 bg-gray-50 p-3">
            <div className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-gray-500">
              Mock Print
            </div>
            <div className="mt-2 grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => selectMockup("/cloud.png")}
                className="rounded-xl overflow-hidden border border-gray-200 bg-white"
              >
                <img
                  src="/cloud.png"
                  alt="mock1"
                  className="w-full aspect-square object-cover"
                />
              </button>
              <button
                type="button"
                onClick={() => selectMockup("/heart-shape.png")}
                className="rounded-xl overflow-hidden border border-gray-200 bg-white"
              >
                <img
                  src="/heart-shape.png"
                  alt="mock2"
                  className="w-full aspect-square object-cover"
                />
              </button>
              <button
                type="button"
                onClick={() => selectMockup("/Men/Tshirt/Black/Front.jpg")}
                className="rounded-xl overflow-hidden border border-gray-200 bg-white"
              >
                <img
                  src="/Men/Tshirt/Black/Front.jpg"
                  alt="mock3"
                  className="w-full aspect-square object-cover"
                />
              </button>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <button
                onClick={cancelMockup}
                className="h-10 px-3 rounded-xl border border-red-700 bg-red-700 text-white text-[13px] font-extrabold inline-flex items-center justify-center transition-shadow hover:shadow-md active:translate-y-px"
              >
                Cancel
              </button>
              <button
                onClick={confirmMockup}
                className="h-10 px-3 rounded-xl border border-gray-900 bg-gray-900 text-white text-[13px] font-extrabold inline-flex items-center justify-center transition-shadow hover:shadow-lg active:translate-y-px"
              >
                Confirm
              </button>
            </div>
          </div>
        )}

        {showTextControls && !opts.hideTextControls && (
          <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-3">
            <div className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-gray-500 mb-2">
              Text
            </div>
            <label className="text-xs font-semibold text-gray-700">
              Font Color
            </label>
            <input
              type="color"
              value={fontColor}
              className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm outline-none focus:border-gray-900"
              onChange={handleColorChange}
            />

            <label className="mt-2 text-xs font-semibold text-gray-700">
              Font Family
            </label>
            <select
              value={fontFamily}
              className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm outline-none focus:border-gray-900"
              onChange={handleFontFamilyChange}
            >
              <option value="Arial">Arial</option>
              <option value="Georgia">Georgia</option>
              <option value="Times New Roman">Times New Roman</option>
              <option value="Helvetica">Helvetica</option>
              <option value="Comic Sans MS">Comic Sans MS</option>
              <option value="Dancing Script">Dancing Script</option>
              {Array.isArray(customFonts) &&
                customFonts.length > 0 &&
                customFonts.map((f) => {
                  const family = f && f.family ? String(f.family) : "";
                  if (!family) return null;
                  return (
                    <option key={`custom-font-${family}`} value={family}>
                      {family}
                    </option>
                  );
                })}
            </select>

            <button
              type="button"
              onClick={openFontPicker}
              className="mt-2 w-full h-10 px-3 rounded-xl border border-gray-200 bg-white text-gray-900 text-[13px] font-extrabold inline-flex items-center justify-center transition-shadow hover:shadow-md active:translate-y-px"
            >
              Upload Custom Font
            </button>
          </div>
        )}
      </div>
    </>
  );
  const hasDesignForSide = (sideKey) => {
    try {
      const cKey = String(cloth || "men");
      const sKey = String(sideKey || "Front").toLowerCase();
      const storeJson = designStoreRef.current?.[cKey]?.[sKey];
      const hasInStore = !!(
        storeJson &&
        Array.isArray(storeJson.objects) &&
        storeJson.objects.length > 0
      );

      // If this is the active side, also check the live canvas for unsaved objects
      if (String(currentSide || "Front").toLowerCase() === sKey) {
        const canvas = fabricCanvasRef.current;
        if (canvas && typeof canvas.getObjects === "function") {
          const objs = canvas.getObjects().filter((o) => {
            if (!o) return false;
            if (o.isClipBorder) return false;
            if (o.isMaskImage) return false;
            return true;
          });
          if (Array.isArray(objs) && objs.length > 0) return true;
        }
      }

      return hasInStore;
    } catch (e) {
      return false;
    }
  };
  // Calculate pricing based on current design state

  const pricing = React.useMemo(() => {
    return computeDesignPrice();
  }, [cloth, designStore, currentSide]);

  const renderPricingBar = ({ variant } = {}) => {
    const isMobile = variant === "mobile";
    if (!pricing.supported) return null;

    return (
      <div
        className={
          isMobile
            ? "md:hidden w-full px-3 pb-3"
            : "hidden md:block w-full px-5 py-4 border-t border-gray-200 bg-white"
        }
      >
        <div className="rounded-2xl border border-gray-200 bg-white p-3 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-gray-500">
              Total
            </div>
            {pricing.hasAny ? (
              <div className="text-lg font-extrabold text-gray-900">
                ₹{pricing.total}
                <span className="ml-2 text-[11px] font-extrabold uppercase tracking-[0.16em] text-gray-500">
                  {pricing.mode}
                </span>
              </div>
            ) : (
              <div className="text-sm font-extrabold text-gray-900">
                Add a design to see price
              </div>
            )}
            {pricing.hasAny && (
              <div className="text-[11px] text-gray-500">
                ₹{pricing.subtotal} + ₹{pricing.delivery} delivery
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              if (!pricing.hasAny) return;
              openPreviewBothSides();
            }}
            disabled={mockMode || !pricing.hasAny}
            className="shrink-0 h-11 px-4 rounded-xl border border-gray-900 bg-gray-900 text-white text-[13px] font-extrabold inline-flex items-center justify-center transition-shadow hover:shadow-lg active:translate-y-px disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Add to Cart
          </button>
        </div>
      </div>
    );
  };

  function saveCurrentSideDesign() {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const json = canvas.toJSON(["isMaskImage", "absolutePositioned"]);

    const cKey = String(cloth || "men");
    const sKey = String(currentSide || "Front").toLowerCase();
    setDesignStore((prev) => {
      const prevCloth =
        prev && prev[cKey] ? prev[cKey] : { front: null, back: null };
      const updated = {
        ...prev,
        [cKey]: {
          ...prevCloth,
          [sKey]: json,
        },
      };
      designStoreRef.current = updated;
      return updated;
    });
  }

  // --- Pricing helpers ---

  // --- Create a new base clip and border and add border to canvas ---
  // returns the clipRect
  function createBaseClip(canvas, opts = {}) {
    if (!canvas) return null;

    const clothKeyForClip = String(opts.clothKey || cloth || "men");
    const sideKeyForClip = String(opts.sideKey || currentSide || "Front");

    const { left, top, width, height } = getFittedPrintAreaRect(canvas, {
      clothKey: clothKeyForClip,
      sideKey: sideKeyForClip,
    });

    // 🔹 Invisible clipPath
    const clipRect = new fabric.Rect({
      left,
      top,
      width,
      height,
      originX: "center",
      originY: "center",
      absolutePositioned: true,
      selectable: false,
      evented: false,
    });

    // 🔹 Visible dashed border
    const clipBorder = new fabric.Rect({
      left,
      top,
      width,
      height,
      originX: "center",
      originY: "center",
      fill: "transparent",
      stroke: "red",
      strokeWidth: 2,
      strokeDashArray: [5, 5],
      visible: true,
      selectable: false,
      evented: false,
    });

    clipBorder.isClipBorder = true;

    // 🔹 Add border to canvas

    // 🔥 FORCE LOCK
    clipBorder.set({
      selectable: false,
      evented: false,
      hasControls: false,
      hasBorders: false,
      lockMovementX: true,
      lockMovementY: true,
      lockScalingX: true,
      lockScalingY: true,
      lockRotation: true,
      excludeFromExport: true,
    });
    clipBorder.setCoords();
    canvas.add(clipBorder);
    try {
      canvas.bringObjectToFront(clipBorder);
    } catch (e) {}
    canvas.requestRenderAll();

    // 🔹 Store refs
    CliprectRef.current = clipRect;
    initialClipRef.current = clipRect;

    canvas.requestRenderAll();

    return clipRect;
  }

  // --- Apply the current clip (CliprectRef.current) to all non-mask objects ---
  function applyClipToObjects() {
    const canvas = fabricCanvasRef.current;
    if (!canvas || !CliprectRef.current) return;

    // Fabric v6 may make `clone()` async on some objects; the previous sync-clone
    // approach could fail silently and leave objects unclipped after side switches.
    // Reusing a single absolute-positioned clip rect is stable for this use-case.
    const clipRect = CliprectRef.current;
    try {
      clipRect.set({
        selectable: false,
        evented: false,
        absolutePositioned: true,
      });
    } catch (e) {}

    canvas.getObjects().forEach((obj) => {
      if (!obj) return;
      // do not change mask images or clip-border objects
      if (obj.isMaskImage) return;
      if (obj.isClipBorder) return;

      try {
        obj.set("clipPath", clipRect);
        if (typeof obj.setCoords === "function") obj.setCoords();
      } catch (e) {
        // ignore
      }
    });

    canvas.requestRenderAll && canvas.requestRenderAll();
  }

  function getFittedPrintAreaRect(canvas, { clothKey, sideKey }) {
    const cKey = String(clothKey || "men");
    const cfg = CLOTH_CONFIG[cKey] || CLOTH_CONFIG.men;
    const sKey = String(sideKey || "Front");
    const placement = (cfg.placementBySide && cfg.placementBySide[sKey]) || {
      x: 0.5,
      y: 0.52,
    };

    // `printAreaInch` can be:
    // - { width, height } (same for both sides)
    // - { Front: { width, height }, Back: { width, height } }
    // - { default: { width, height }, Front: {...}, Back: {...} }
    let inchW = 16;
    let inchH = 20;
    const pa = cfg.printAreaInch;
    if (pa && typeof pa === "object") {
      // per-side form
      const sideObj = pa[sKey];
      const defObj = pa.default;
      if (sideObj && typeof sideObj === "object") {
        if (typeof sideObj.width === "number") inchW = sideObj.width;
        if (typeof sideObj.height === "number") inchH = sideObj.height;
      } else if (defObj && typeof defObj === "object") {
        if (typeof defObj.width === "number") inchW = defObj.width;
        if (typeof defObj.height === "number") inchH = defObj.height;
      } else {
        // single-size form
        if (typeof pa.width === "number") inchW = pa.width;
        if (typeof pa.height === "number") inchH = pa.height;
      }
    }
    const maxW = inchW * PRINT_DPI;
    const maxH = inchH * PRINT_DPI;

    const fitScale = Math.min(canvas.width / maxW, canvas.height / maxH, 1);
    // `margin` can be:
    // - number (same for both sides)
    // - object mapping side keys -> number (e.g. { Front: 0.23, Back: 0.26 })
    // - object with `default`
    let margin = 0.92;
    if (typeof cfg.margin === "number") {
      margin = cfg.margin;
    } else if (cfg.margin && typeof cfg.margin === "object") {
      const bySide = cfg.margin;
      const sideMargin = bySide[sKey];
      if (typeof sideMargin === "number") margin = sideMargin;
      else if (typeof bySide.default === "number") margin = bySide.default;
    }
    const scale = fitScale * margin;

    const width = maxW * scale;
    const height = maxH * scale;
    const left = canvas.width * placement.x;
    const top = canvas.height * placement.y;

    return { left, top, width, height };
  }

  // When the canvas container scrolls (common on mobile), Fabric's pointer math
  // needs an offset recalculation or selection/rotation can feel "broken".
  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    let raf = 0;
    const onScroll = () => {
      try {
        if (raf) cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          try {
            if (typeof canvas.calcOffset === "function") canvas.calcOffset();
          } catch (e) {}
        });
      } catch (e) {}
    };

    container.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      try {
        if (raf) cancelAnimationFrame(raf);
      } catch (e) {}
      try {
        container.removeEventListener("scroll", onScroll);
      } catch (e) {}
    };
  }, []);
  function lockClipBorder(canvas) {
    if (!CliprectRef.current) return;

    CliprectRef.current.set({
      selectable: false,
      evented: false,
      hasBorders: false,
      hasControls: false,
      hoverCursor: "default",
    });
    CliprectRef.current.excludeFromExport = true; // so it isn't serialized at all
    CliprectRef.current.dirty = true;
  }

  function removeAnyClipBorders(canvas) {
    if (!canvas) return;
    try {
      const borders = canvas
        .getObjects()
        .filter(
          (o) =>
            o &&
            (o.isClipBorder ||
              (Array.isArray(o.strokeDashArray) &&
                o.strokeDashArray.length &&
                o.stroke === "red" &&
                o.fill === "transparent"))
        );
      borders.forEach((b) => {
        try {
          canvas.remove(b);
        } catch (e) {}
      });
    } catch (e) {}
  }

  function setBackgroundImageAsync(canvas, url) {
    return new Promise((resolve) => {
      if (!canvas) return resolve(null);

      const imgEl = new Image();
      imgEl.crossOrigin = "anonymous";
      imgEl.onload = () => {
        try {
          const img = new fabric.Image(imgEl, {
            originX: "center",
            originY: "center",
            left: canvas.width / 2,
            top: canvas.height / 2,
            selectable: false,
            evented: false,
          });
          canvas.setBackgroundImage(img, () => resolve(img));
        } catch (e) {
          resolve(null);
        }
      };
      imgEl.onerror = () => resolve(null);
      imgEl.src = url;
    });
  }

  function loadFromJSONAsync(canvas, json) {
    if (!canvas || !json)
      return Promise.resolve({ ok: false, reason: "missing" });

    // Fabric v6: loadFromJSON returns a Promise. Passing a callback like older versions
    // will be treated as a reviver and can resolve early, creating race conditions.
    return Promise.resolve()
      .then(() => canvas.loadFromJSON(json))
      .then(() => {
        try {
          canvas.requestRenderAll && canvas.requestRenderAll();
        } catch (e) {}
        return { ok: true };
      })
      .catch((err) => {
        console.error("loadFromJSONAsync failed:", err);
        return { ok: false, error: err };
      });
  }

  async function handleSideChange(sideKey, opts = {}) {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    // Token guards against rapid side switching causing older async loads to overwrite newer ones.
    const switchToken = ++sideSwitchTokenRef.current;
    beginCanvasRestore(switchToken);

    try {
      const bailIfStale = () => {
        if (switchToken !== sideSwitchTokenRef.current) {
          endCanvasRestore(switchToken);
          return true;
        }
        return false;
      };

      // Save current side design (per-side persistence)
      if (!opts.skipSave) saveCurrentSideDesign();

      // Update UI state
      setCurrentSide(sideKey);

      const clothKey = String(opts.clothKey || cloth || "men");
      const colorNameForSide =
        typeof opts.colorName === "string" && opts.colorName
          ? opts.colorName
          : selectedColor;

      // Prepare next background path
      const nextBgUrl = getBgUrlFor({
        clothKey,
        colorName: colorNameForSide,
        sideKey,
      });
      setImageUrl(nextBgUrl);
      // ensure DOM background updates immediately (helps html2canvas captures)
      try {
        if (stageRef.current) {
          stageRef.current.style.backgroundImage = `url('${nextBgUrl}')`;
          stageRef.current.style.backgroundRepeat = "no-repeat";
          stageRef.current.style.backgroundPosition = "center";
          stageRef.current.style.backgroundSize = "contain";
        }
      } catch (e) {}

      // Clear selection before switching
      try {
        canvas.discardActiveObject();
      } catch (e) {}

      // Load saved design for target side (if any)
      const saved =
        opts && opts.overrideJson
          ? opts.overrideJson
          : designStoreRef.current?.[clothKey]?.[String(sideKey).toLowerCase()];

      // Clear everything and rebuild deterministically
      canvas.clear();

      if (bailIfStale()) return;

      // 1) set background
      const bgImg = await setBackgroundImageAsync(canvas, nextBgUrl);

      if (bailIfStale()) return;

      // 2) load saved objects (if any)
      if (saved) {
        const res = await loadFromJSONAsync(canvas, saved);

        if (bailIfStale()) return;

        if (res && res.ok === false) {
          // If JSON load fails, don't continue with a half-loaded canvas.
          // We still keep the background + recreated border.
          console.warn("Side design JSON failed to load for", sideKey);
        }

        // loadFromJSON can wipe background; restore
        if (bgImg) {
          try {
            canvas.setBackgroundImage(bgImg, () => {});
          } catch (e) {}
        } else {
          await setBackgroundImageAsync(canvas, nextBgUrl);
        }
      }

      // 3) Always remove any borders that might have been serialized accidentally
      removeAnyClipBorders(canvas);

      if (bailIfStale()) return;

      // 4) Recreate fresh base clip + border (border is non-selectable + non-evented)
      const baseClip = createBaseClip(canvas, { clothKey, sideKey });
      CliprectRef.current = baseClip;

      // 5) Apply clip to design objects
      applyClipToObjects();

      // 6) Make sure clip is not interactive
      lockClipBorder(canvas);

      // 7) Keep border visible on top
      try {
        const border = canvas.getObjects().find((o) => o && o.isClipBorder);
        if (border) canvas.bringObjectToFront(border);
      } catch (e) {}

      try {
        if (typeof canvas.calcOffset === "function") canvas.calcOffset();
      } catch (e) {}
      canvas.requestRenderAll();

      // Seed history present state for this side if needed.
      try {
        const cKey = String(clothKey || "men");
        const sKey = String(sideKey || "Front").toLowerCase();
        const bucket = getHistoryBucket(cKey, sKey);
        if (bucket && bucket.present == null) {
          const json = canvas.toJSON(["isMaskImage", "absolutePositioned"]);
          bucket.present = JSON.stringify(json);
          bucket.undo = [];
          bucket.redo = [];
          syncUndoRedoFlagsForCurrent();
        }
      } catch (e) {}
    } finally {
      endCanvasRestore(switchToken);
    }
  }

  function handleImageChange(colorObj) {
    if (mockMode) return;

    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    canvas.discardActiveObject(); // 🔥 important

    const normalizedColor = normalizeColorNameForCloth(cloth, colorObj.name);
    setSelectedColor(normalizedColor);
    const newImageUrl = getBgUrlFor({
      clothKey: cloth,
      colorName: normalizedColor,
      sideKey: currentSide,
    });
    setImageUrl(newImageUrl);

    setTimeout(() => {
      setCanvasBackground(newImageUrl);

      // 🔥 re-lock border AFTER background change
      lockClipBorder(canvas);

      canvas.requestRenderAll();
    }, 0);
  }

  async function handleUndo() {
    if (mockMode) return;

    // Ensure the latest edits are committed into history before undo.
    try {
      commitCanvasNow();
    } catch (e) {}

    const cKey = String(clothRef.current || cloth || "men");
    const sKey = String(
      sideRef.current || currentSide || "Front"
    ).toLowerCase();
    const bucket = getHistoryBucket(cKey, sKey);
    if (!bucket || !Array.isArray(bucket.undo) || bucket.undo.length === 0)
      return;

    const prev = bucket.undo.pop();
    if (bucket.present != null) {
      bucket.redo = Array.isArray(bucket.redo) ? bucket.redo : [];
      bucket.redo.push(bucket.present);
      if (bucket.redo.length > 50) bucket.redo.shift();
    }
    bucket.present = prev;
    syncUndoRedoFlagsForCurrent();

    let json = null;
    try {
      json = JSON.parse(prev);
    } catch (e) {
      return;
    }

    try {
      const sideKey = String(sideRef.current || currentSide || "Front");
      await handleSideChange(sideKey, {
        clothKey: String(clothRef.current || cloth || "men"),
        colorName: String(selectedColorRef.current || selectedColor || "Black"),
        skipSave: true,
        overrideJson: json,
      });
      setDesignStoreFor(cKey, sKey, json);
      try {
        persistAutosaveNow();
      } catch (e) {}
    } catch (e) {}
  }

  async function handleRedo() {
    if (mockMode) return;

    // Ensure the latest edits are committed into history before redo.
    try {
      commitCanvasNow();
    } catch (e) {}

    const cKey = String(clothRef.current || cloth || "men");
    const sKey = String(
      sideRef.current || currentSide || "Front"
    ).toLowerCase();
    const bucket = getHistoryBucket(cKey, sKey);
    if (!bucket || !Array.isArray(bucket.redo) || bucket.redo.length === 0)
      return;

    const next = bucket.redo.pop();
    if (bucket.present != null) {
      bucket.undo = Array.isArray(bucket.undo) ? bucket.undo : [];
      bucket.undo.push(bucket.present);
      if (bucket.undo.length > 50) bucket.undo.shift();
    }
    bucket.present = next;
    syncUndoRedoFlagsForCurrent();

    let json = null;
    try {
      json = JSON.parse(next);
    } catch (e) {
      return;
    }

    try {
      const sideKey = String(sideRef.current || currentSide || "Front");
      await handleSideChange(sideKey, {
        clothKey: String(clothRef.current || cloth || "men"),
        colorName: String(selectedColorRef.current || selectedColor || "Black"),
        skipSave: true,
        overrideJson: json,
      });
      setDesignStoreFor(cKey, sKey, json);
      try {
        persistAutosaveNow();
      } catch (e) {}
    } catch (e) {}
  }

  function composeClip() {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const clips = clipStackRef.current || [];

    let composed = null;
    if (clips.length === 0) {
      composed = initialClipRef.current || CliprectRef.current;
    } else if (clips.length === 1) {
      composed = clips[0];
    } else {
      // These clip objects are dedicated for clipping; no need to clone them.
      const members = clips.filter(Boolean).map((c) => {
        try {
          c.set({
            selectable: false,
            evented: false,
            absolutePositioned: true,
          });
        } catch (e) {}
        return c;
      });

      composed = new fabric.Group(members, {
        absolutePositioned: true,
        selectable: false,
        evented: false,
      });
    }

    if (!composed) return;
    CliprectRef.current = composed;
    applyClipToObjects();
    canvas.requestRenderAll && canvas.requestRenderAll();
  }

  function handleColorChange(e) {
    const val = e.target.value;
    setFontColor(val);
    const obj = selectedObjectRef.current;
    const canvas = fabricCanvasRef.current;
    if (
      obj &&
      canvas &&
      (obj.type === "textbox" || obj.type === "i-text" || obj.type === "text")
    ) {
      obj.set("fill", val);
      canvas.requestRenderAll();
      scheduleCanvasCommit();
    }
  }

  function handleBringToFront() {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const active = canvas.getActiveObject();
    if (!active) return;

    try {
      const topIndex = canvas.getObjects().length - 1;
      canvas.moveTo(active, topIndex);
      if (typeof active.setCoords === "function") active.setCoords();
      canvas.requestRenderAll();
    } catch (err) {
      try {
        canvas.remove(active);
        canvas.add(active);
        if (typeof active.setCoords === "function") active.setCoords();
        canvas.requestRenderAll();
      } catch (e) {
        console.error("Could not bring object to front", e);
      }
    }
  }

  function handleDeleteObject() {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const activeObjects =
      (typeof canvas.getActiveObjects === "function" &&
        canvas.getActiveObjects()) ||
      (canvas.getActiveObject() ? [canvas.getActiveObject()] : []);

    if (!activeObjects || activeObjects.length === 0) return;

    activeObjects.forEach((obj) => {
      if (!obj) return;
      const t = obj.type;
      if (
        t === "image" ||
        t === "textbox" ||
        t === "text" ||
        t === "i-text" ||
        t === "group" ||
        t === "path"
      ) {
        try {
          canvas.remove(obj);
        } catch (e) {}
      }
    });

    try {
      // clear selection state
      canvas.discardActiveObject && canvas.discardActiveObject();
    } catch (e) {}
    selectedObjectRef.current = null;
    setShowTextControls(false);
    canvas.requestRenderAll && canvas.requestRenderAll();
  }

  function handleFontFamilyChange(e) {
    const val = e.target.value;
    applyFontFamilyToSelection(val);
  }

  function applyFontFamilyToSelection(val) {
    const family = String(val || "Arial");
    setFontFamily(family);
    const obj = selectedObjectRef.current;
    const canvas = fabricCanvasRef.current;
    if (
      obj &&
      canvas &&
      (obj.type === "textbox" || obj.type === "i-text" || obj.type === "text")
    ) {
      const apply = () => {
        obj.set("fontFamily", family);
        canvas.requestRenderAll();
        scheduleCanvasCommit();
      };
      if (document.fonts && document.fonts.load) {
        document.fonts.load(`16px "${family}"`).then(apply).catch(apply);
      } else {
        apply();
      }
    }
  }

  async function handleFontUpload(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    // Reset immediately so selecting the same file again triggers onChange.
    try {
      e.target.value = "";
    } catch (err) {}

    const MAX_BYTES = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_BYTES) {
      alert("Max font upload size is 10MB.");
      return;
    }

    const name = String(file.name || "").toLowerCase();
    const extOk =
      name.endsWith(".ttf") ||
      name.endsWith(".otf") ||
      name.endsWith(".woff") ||
      name.endsWith(".woff2");
    if (!extOk) {
      alert("Supported font files: .ttf, .otf, .woff, .woff2");
      return;
    }

    const baseFonts = new Set([
      "Arial",
      "Georgia",
      "Times New Roman",
      "Helvetica",
      "Comic Sans MS",
      "Dancing Script",
    ]);

    const blobUrl = URL.createObjectURL(file);
    customFontBlobUrlsRef.current = Array.isArray(customFontBlobUrlsRef.current)
      ? [...customFontBlobUrlsRef.current, blobUrl]
      : [blobUrl];

    const existingFamilies = new Set([
      ...Array.from(baseFonts),
      ...(Array.isArray(customFonts)
        ? customFonts.map((f) => f && f.family)
        : []
      )
        .filter(Boolean)
        .map(String),
    ]);

    const baseFamily = makeSafeFontFamilyFromFileName(file.name);
    let family = baseFamily;
    let suffix = 2;
    while (existingFamilies.has(family)) {
      family = `${baseFamily} (${suffix})`;
      suffix += 1;
    }

    const id = `${Date.now()}_${Math.random().toString(16).slice(2)}`;
    const mime = getFontMimeType(file.name);

    try {
      // Persist bytes so refresh restores the custom font.
      try {
        const bytes = await file.arrayBuffer();
        await idbPutFont({
          id,
          ts: Date.now(),
          family,
          sourceName: String(file.name || ""),
          mime,
          size: Number(file.size) || 0,
          bytes,
        });
        await pruneStoredFontsIfNeeded();
      } catch (err) {
        // If storage fails (quota/unsupported), we still keep it in-memory for this session.
      }

      await registerCustomFont({ family, blobUrl });

      setCustomFonts((prev) => {
        const list = Array.isArray(prev) ? prev : [];
        return mergeFontsByFamily(list, [
          {
            id,
            family,
            sourceName: String(file.name || ""),
            mime,
            size: file.size,
          },
        ]);
      });

      // Convenient default: apply the newly uploaded font.
      applyFontFamilyToSelection(family);
    } catch (err) {
      try {
        URL.revokeObjectURL(blobUrl);
      } catch (e) {}
      customFontBlobUrlsRef.current = (
        customFontBlobUrlsRef.current || []
      ).filter((u) => u !== blobUrl);
      console.warn("Font upload failed:", err);
      alert("Failed to load this font file.");
    }
  }

  function addCanvasText() {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    const clipRect = CliprectRef.current;
    const value =
      (textInputRef.current && String(textInputRef.current.value)) || "";
    const trimmed = value.trim();
    if (!trimmed) {
      alert("Please enter text before adding.");
      return;
    }
    const ff = fontFamily || "Arial";
    const color = fontColor || "#000000";

    const createText = () => {
      const text = new fabric.Textbox(trimmed, {
        left: clipRect.left + 50,
        top: clipRect.top + 50,
        fontSize: 30,
        fill: color,
        fontFamily: ff,
        clipPath: clipRect,
        absolutePositioned: true,
      });

      canvas.add(text);
      setTimeout(() => {
        if (canvas.contains(text)) {
          canvas.setActiveObject(text);
          if (typeof text.enterEditing === "function") {
            text.enterEditing();
            if (typeof text.selectAll === "function") text.selectAll();
          }
          const ta =
            canvas._textInput ||
            canvas.hiddenTextarea ||
            document.querySelector("textarea.fabric-textarea");
          if (ta && typeof ta.focus === "function") ta.focus();
          canvas.requestRenderAll();
        }
      }, 0);
    };

    if (document.fonts && document.fonts.load) {
      document.fonts.load(`16px "${ff}"`).then(createText).catch(createText);
    } else {
      createText();
    }
    try {
      if (textInputRef.current) textInputRef.current.value = "";
    } catch (e) {}
  }

  function handleUpload(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const MAX_BYTES = 25 * 1024 * 1024; // 25MB
    const allowedMime = new Set(["image/jpeg", "image/png"]);
    const name = String(file.name || "").toLowerCase();
    const extOk =
      name.endsWith(".jpg") || name.endsWith(".jpeg") || name.endsWith(".png");
    const mimeOk = allowedMime.has(String(file.type || "").toLowerCase());

    if (file.size > MAX_BYTES) {
      alert("Max upload size is 25MB.");
      e.target.value = "";
      return;
    }

    if (!mimeOk && !extOk) {
      alert("Only JPG/JPEG and PNG images are supported.");
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const imgEl = new Image();
      imgEl.src = reader.result;
      imgEl.onload = () => {
        const canvas = fabricCanvasRef.current;
        canvas.discardActiveObject();
        if (!canvas) return;
        const clipRect = CliprectRef.current;
        const fImg = new fabric.Image(imgEl, {
          originX: "center",
          originY: "center",
          isMaskImage: false,
        });

        if (clipRect) {
          const cx = clipRect.left + 50;
          const cy = clipRect.top + 50;
          fImg.set({ left: cx, top: cy });
          const scale = Math.min(
            clipRect.width / fImg.width,
            clipRect.height / fImg.height
          );
          if (scale > 0) fImg.scale(scale);
          fImg.set({ clipPath: clipRect });
        } else {
          fImg.set({
            left: canvas.getWidth() / 2,
            top: canvas.getHeight() / 2,
          });
        }

        canvas.add(fImg);
      };
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  function downloadClipArea() {
    const canvas = fabricCanvasRef.current;
    const clipArea = CliprectRef.current;
    if (!canvas || !clipArea) {
      alert("Please import a canvas and ensure clip area exists.");
      return;
    }

    const originalBg = canvas.backgroundImage;
    const originalBgColor = canvas.backgroundColor;
    const wasClipVisible = clipArea.visible;

    // Hide clip border overlays so they don't appear in the exported PNG
    const objects = canvas.getObjects ? canvas.getObjects() : [];
    const borderObjs = (objects || []).filter(
      (o) =>
        o &&
        (o.isClipBorder ||
          (Array.isArray(o.strokeDashArray) && o.strokeDashArray.length))
    );
    const prevBorderVis = borderObjs.map((o) => (o ? o.visible : true));

    const scale = 5;
    const bounds = clipArea.getBoundingRect(true);

    // Clamp bounds to the actual canvas backstore to avoid invalid crop sizes
    // (can happen with small margins / rotated clip groups).
    const cw =
      canvas.width ||
      (typeof canvas.getWidth === "function" ? canvas.getWidth() : 0);
    const ch =
      canvas.height ||
      (typeof canvas.getHeight === "function" ? canvas.getHeight() : 0);
    const left = Math.max(0, Math.floor(bounds.left));
    const top = Math.max(0, Math.floor(bounds.top));
    const width = Math.max(1, Math.min(Math.ceil(bounds.width), cw - left));
    const height = Math.max(1, Math.min(Math.ceil(bounds.height), ch - top));

    let dataURL = "";

    // Temporarily make export transparent (no shirt/background).
    try {
      // hide clip area for capture
      try {
        clipArea.visible = false;
      } catch (e) {}

      try {
        borderObjs.forEach((o) => {
          if (o) o.visible = false;
        });
      } catch (e) {}

      if (typeof canvas.setBackgroundImage === "function") {
        canvas.setBackgroundImage(null, () => {});
      } else {
        canvas.backgroundImage = null;
      }

      // ensure background color is transparent
      if (typeof canvas.setBackgroundColor === "function") {
        canvas.setBackgroundColor(null, () => {});
      } else {
        canvas.backgroundColor = null;
      }

      canvas.requestRenderAll && canvas.requestRenderAll();

      dataURL = canvas.toDataURL({
        format: "png",
        left,
        top,
        width,
        height,
        multiplier: scale,
        withoutTransform: false,
        backgroundColor: null,
      });
    } catch (e) {
      console.error("downloadClipArea export failed:", e);
      return;
    } finally {
      // restore
      try {
        borderObjs.forEach((o, i) => {
          if (o) o.visible = prevBorderVis[i];
        });
      } catch (e) {}

      if (typeof canvas.setBackgroundImage === "function") {
        canvas.setBackgroundImage(originalBg, () => {});
      } else {
        canvas.backgroundImage = originalBg;
      }

      if (typeof canvas.setBackgroundColor === "function") {
        canvas.setBackgroundColor(originalBgColor ?? null, () => {});
      } else {
        canvas.backgroundColor = originalBgColor ?? null;
      }

      try {
        clipArea.visible = wasClipVisible;
      } catch (e) {}

      canvas.requestRenderAll && canvas.requestRenderAll();
    }

    const image = new Image();
    image.onload = () => {
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = Math.round(bounds.width * scale);
      tempCanvas.height = Math.round(bounds.height * scale);
      const ctx = tempCanvas.getContext("2d");
      ctx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
      ctx.drawImage(image, 0, 0);

      const fmt = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });
      const parts = Object.fromEntries(
        fmt.formatToParts(new Date()).map((p) => [p.type, p.value])
      );
      const indiaIsoSafe = `${parts.year}-${parts.month}-${parts.day}T${parts.hour}-${parts.minute}-${parts.second}`;
      const link = document.createElement("a");
      link.href = tempCanvas.toDataURL("image/png");
      link.download = `Design_${indiaIsoSafe}_clip.png`;
      // append to DOM for broader browser compatibility, trigger download, then remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };
    image.src = dataURL;
  }

  async function downloadCanvasWithBackground() {
    const canvas = fabricCanvasRef.current;
    const container = stageRef.current || containerRef.current;

    if (!canvas || !container) {
      alert("Canvas or container not found.");
      return;
    }

    canvas.discardActiveObject();
    canvas.requestRenderAll();

    try {
      const indiaIsoSafe = getIndiaIsoSafe();
      const dataUrl = await captureFullMockupDataUrl();
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `Design_${indiaIsoSafe}_full-mockup.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("html2canvas failed:", err);

      const fallbackDataUrl = canvas.toDataURL({
        format: "png",
        multiplier: 2,
      });

      const link = document.createElement("a");
      link.href = fallbackDataUrl;
      link.download = `Design_canvas-only.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  function getIndiaIsoSafe() {
    const fmt = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
    const parts = Object.fromEntries(
      fmt.formatToParts(new Date()).map((p) => [p.type, p.value])
    );
    return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}-${parts.minute}-${parts.second}`;
  }

  const extractCssUrl = (cssBg) => {
    const v = String(cssBg || "").trim();
    const m = v.match(/^url\((['"]?)(.*?)\1\)$/i);
    return m ? m[2] : "";
  };

  const loadImageEl = (src, { crossOrigin = "anonymous" } = {}) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      try {
        img.crossOrigin = crossOrigin;
      } catch (e) {}
      img.onload = () => resolve(img);
      img.onerror = (e) => reject(e);
      img.src = src;
    });
  };

  const captureFullMockupFallbackDataUrl = async ({ scale = 3 } = {}) => {
    const canvas = fabricCanvasRef.current;
    const stage = stageRef.current || containerRef.current;
    if (!canvas || !stage) throw new Error("Canvas or container not found");

    const cssW = stage.offsetWidth || 0;
    const cssH = stage.offsetHeight || 0;
    if (!cssW || !cssH) throw new Error("Stage has zero size");

    // Figure out the shirt background URL (prefer stage's computed style).
    let bgUrl = "";
    try {
      const computed = window.getComputedStyle(stage);
      bgUrl =
        extractCssUrl(computed.backgroundImage) ||
        extractCssUrl(stage.style.backgroundImage);
    } catch (e) {}
    bgUrl = bgUrl || imageUrl;

    const out = document.createElement("canvas");
    out.width = Math.round(cssW * scale);
    out.height = Math.round(cssH * scale);
    const ctx = out.getContext("2d");
    if (!ctx) throw new Error("2D context not available");
    ctx.clearRect(0, 0, out.width, out.height);

    // Draw shirt background as 'contain'
    if (bgUrl) {
      try {
        const bg = await loadImageEl(bgUrl, { crossOrigin: "anonymous" });
        const iw = bg.naturalWidth || bg.width || 1;
        const ih = bg.naturalHeight || bg.height || 1;
        const s = Math.min(out.width / iw, out.height / ih);
        const dw = iw * s;
        const dh = ih * s;
        const dx = (out.width - dw) / 2;
        const dy = (out.height - dh) / 2;
        ctx.drawImage(bg, dx, dy, dw, dh);
      } catch (e) {
        // if bg fails, still export design layer
      }
    }

    // Draw Fabric design layer (without Fabric background, to avoid double-shirt).
    const originalBg = canvas.backgroundImage;
    const originalBgColor = canvas.backgroundColor;
    try {
      try {
        if (typeof canvas.setBackgroundImage === "function") {
          canvas.setBackgroundImage(null, () => {});
        } else {
          canvas.backgroundImage = null;
        }
      } catch (e) {}
      try {
        if (typeof canvas.setBackgroundColor === "function") {
          canvas.setBackgroundColor(null, () => {});
        } else {
          canvas.backgroundColor = null;
        }
      } catch (e) {}

      canvas.requestRenderAll && canvas.requestRenderAll();
      await nextFrame();

      const designUrl = canvas.toDataURL({
        format: "png",
        multiplier: scale,
        withoutTransform: false,
        backgroundColor: null,
      });

      const designImg = await loadImageEl(designUrl, { crossOrigin: null });
      ctx.drawImage(designImg, 0, 0, out.width, out.height);
    } finally {
      try {
        if (typeof canvas.setBackgroundImage === "function") {
          canvas.setBackgroundImage(originalBg || null, () => {});
        } else {
          canvas.backgroundImage = originalBg || null;
        }
      } catch (e) {}
      try {
        if (typeof canvas.setBackgroundColor === "function") {
          canvas.setBackgroundColor(originalBgColor ?? null, () => {});
        } else {
          canvas.backgroundColor = originalBgColor ?? null;
        }
      } catch (e) {}
      canvas.requestRenderAll && canvas.requestRenderAll();
    }

    return out.toDataURL("image/png");
  };

  async function captureFullMockupDataUrl({ scale = 3 } = {}) {
    const canvas = fabricCanvasRef.current;
    const container = stageRef.current || containerRef.current;
    if (!canvas || !container) throw new Error("Canvas or container not found");

    // Hide the dashed clip border during capture
    const objects = canvas.getObjects ? canvas.getObjects() : [];
    const borderObjs = (objects || []).filter(
      (o) =>
        o &&
        (o.isClipBorder ||
          (Array.isArray(o.strokeDashArray) && o.strokeDashArray.length))
    );
    const prevVis = borderObjs.map((o) => (o ? o.visible : true));

    try {
      // Ensure transforms like rotation are fully applied before capture.
      try {
        canvas.discardActiveObject && canvas.discardActiveObject();
      } catch (e) {}

      borderObjs.forEach((o) => {
        if (o) o.visible = false;
      });
      canvas.requestRenderAll && canvas.requestRenderAll();
      await nextFrame();

      // Prefer deterministic composite export.
      // html2canvas can render <img object-fit: contain> incorrectly in some setups,
      // which produces a stretched-looking downloaded PNG even though the on-screen
      // mockup looks correct.
      try {
        return await captureFullMockupFallbackDataUrl({ scale });
      } catch (err) {
        // If the deterministic path fails (rare), fall back to html2canvas.
        console.warn("fallback mockup capture failed; trying html2canvas", err);
        const exportCanvas = await html2canvas(container, {
          backgroundColor: null,
          useCORS: true,
          allowTaint: true,
          logging: false,
          scale,
          width: container.offsetWidth,
          height: container.offsetHeight,
          scrollX: 0,
          scrollY: 0,
        });
        return exportCanvas.toDataURL("image/png");
      }
    } finally {
      try {
        borderObjs.forEach((o, i) => {
          if (o) o.visible = prevVis[i];
        });
      } catch (e) {}
      canvas.requestRenderAll && canvas.requestRenderAll();
    }
  }

  // Capture the design layer only (transparent background), scaled.
  const captureDesignOnlyDataUrl = async ({ scale = 4 } = {}) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) throw new Error("Canvas not found");

    // Hide clip/border overlays so they don't appear in the exported PNG
    const objects = canvas.getObjects ? canvas.getObjects() : [];
    const borderObjs = (objects || []).filter(
      (o) =>
        o &&
        (o.isClipBorder ||
          (Array.isArray(o.strokeDashArray) && o.strokeDashArray.length))
    );
    const prevBorderVis = borderObjs.map((o) => (o ? o.visible : true));

    // Temporarily remove background image/color
    const originalBg = canvas.backgroundImage;
    const originalBgColor = canvas.backgroundColor;
    try {
      try {
        borderObjs.forEach((o) => {
          if (o) o.visible = false;
        });
      } catch (e) {}

      try {
        if (typeof canvas.setBackgroundImage === "function") {
          canvas.setBackgroundImage(null, () => {});
        } else {
          canvas.backgroundImage = null;
        }
      } catch (e) {}
      try {
        if (typeof canvas.setBackgroundColor === "function") {
          canvas.setBackgroundColor(null, () => {});
        } else {
          canvas.backgroundColor = null;
        }
      } catch (e) {}

      canvas.requestRenderAll && canvas.requestRenderAll();
      await nextFrame();

      const dataUrl = canvas.toDataURL({
        format: "png",
        multiplier: scale,
        withoutTransform: false,
        backgroundColor: null,
      });
      return dataUrl;
    } finally {
      try {
        borderObjs.forEach((o, i) => {
          if (o) o.visible = prevBorderVis[i];
        });
      } catch (e) {}

      try {
        if (typeof canvas.setBackgroundImage === "function") {
          canvas.setBackgroundImage(originalBg || null, () => {});
        } else {
          canvas.backgroundImage = originalBg || null;
        }
      } catch (e) {}
      try {
        if (typeof canvas.setBackgroundColor === "function") {
          canvas.setBackgroundColor(originalBgColor ?? null, () => {});
        } else {
          canvas.backgroundColor = originalBgColor ?? null;
        }
      } catch (e) {}
      canvas.requestRenderAll && canvas.requestRenderAll();
    }
  };

  async function downloadBothSidesZip() {
    const canvas = fabricCanvasRef.current;
    if (!canvas) {
      alert("Canvas not found.");
      return;
    }

    const originalSide = currentSide;
    const indiaIsoSafe = getIndiaIsoSafe();
    const zip = new JSZip();

    // Persist current side before we start switching
    saveCurrentSideDesign();

    try {
      for (const sideKey of ["Front", "Back"]) {
        await handleSideChange(sideKey, { skipSave: true });
        // allow layout/background to settle for html2canvas
        await nextFrame();
        await new Promise((r) => setTimeout(r, 50));

        const dataUrl = await captureFullMockupDataUrl();
        const base64 = String(dataUrl).split(",")[1] || "";
        if (!base64) throw new Error("Failed to encode PNG");
        zip.file(`Design_${indiaIsoSafe}_${sideKey}_full-mockup.png`, base64, {
          base64: true,
        });
        // Also include design-only (transparent background) for this side
        try {
          const designOnlyUrl = await captureDesignOnlyDataUrl({ scale: 4 });
          const designOnlyBase64 = String(designOnlyUrl).split(",")[1] || "";
          if (designOnlyBase64) {
            zip.file(
              `Design_${indiaIsoSafe}_${sideKey}_design.png`,
              designOnlyBase64,
              {
                base64: true,
              }
            );
          }
        } catch (err) {
          // If design-only capture fails, continue without blocking zip creation
          console.warn(`Design-only capture failed for ${sideKey}:`, err);
        }
      }

      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Design_${indiaIsoSafe}_Front_Back_full-mockups.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("ZIP export failed:", e);
      alert("ZIP export failed. Check console for details.");
    } finally {
      // Restore the user's original side
      try {
        await handleSideChange(originalSide, { skipSave: true });
      } catch (e) {}
    }
  }

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  const loadHtmlImageForCrop = (src) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Failed to load image for crop"));
      img.src = src;
    });
  };

  const autoCropMockupDataUrlForDisplay = async (dataUrl) => {
    if (!dataUrl) return dataUrl;

    const img = await loadHtmlImageForCrop(dataUrl);
    const srcW = img.naturalWidth || img.width || 0;
    const srcH = img.naturalHeight || img.height || 0;
    if (!srcW || !srcH) return dataUrl;

    // Detect crop bounds on a downscaled canvas for performance.
    const maxDetect = 650;
    const detectScale = Math.min(1, maxDetect / Math.max(srcW, srcH));
    const detW = Math.max(1, Math.round(srcW * detectScale));
    const detH = Math.max(1, Math.round(srcH * detectScale));

    const det = document.createElement("canvas");
    det.width = detW;
    det.height = detH;
    // Important: many captures have transparent corners (backgroundColor: null).
    // If we sample those, RGB often reads as 0,0,0 (black), which breaks
    // background detection for dark shirts and causes the crop to fail.
    // Composite onto white first so corner samples are meaningful.
    const dctx = det.getContext("2d", {
      willReadFrequently: true,
      alpha: false,
    });
    if (!dctx) return dataUrl;
    dctx.fillStyle = "#ffffff";
    dctx.fillRect(0, 0, detW, detH);
    dctx.drawImage(img, 0, 0, detW, detH);

    const sample = (x, y) => {
      const p = dctx.getImageData(x, y, 1, 1).data;
      return [p[0], p[1], p[2], p[3]];
    };

    // Use average of the 4 corners as "background" reference.
    const c1 = sample(0, 0);
    const c2 = sample(detW - 1, 0);
    const c3 = sample(0, detH - 1);
    const c4 = sample(detW - 1, detH - 1);
    const bgR = Math.round((c1[0] + c2[0] + c3[0] + c4[0]) / 4);
    const bgG = Math.round((c1[1] + c2[1] + c3[1] + c4[1]) / 4);
    const bgB = Math.round((c1[2] + c2[2] + c3[2] + c4[2]) / 4);

    const dist = (r, g, b) => {
      const dr = r - bgR;
      const dg = g - bgG;
      const db = b - bgB;
      return Math.sqrt(dr * dr + dg * dg + db * db);
    };

    const imgData = dctx.getImageData(0, 0, detW, detH).data;
    const step = 2;
    const threshold = 18;

    let minX = detW;
    let minY = detH;
    let maxX = -1;
    let maxY = -1;

    for (let y = 0; y < detH; y += step) {
      for (let x = 0; x < detW; x += step) {
        const idx = (y * detW + x) * 4;
        const a = imgData[idx + 3];
        if (a < 8) continue;
        const r = imgData[idx];
        const g = imgData[idx + 1];
        const b = imgData[idx + 2];
        if (dist(r, g, b) <= threshold) continue;
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }

    // If we didn't find anything, keep original.
    if (maxX < 0 || maxY < 0) return dataUrl;

    // Scale crop box back to source pixels.
    const sx = srcW / detW;
    const sy = srcH / detH;
    let cropX = Math.floor(minX * sx);
    let cropY = Math.floor(minY * sy);
    let cropW = Math.ceil((maxX - minX + 1) * sx);
    let cropH = Math.ceil((maxY - minY + 1) * sy);

    // Add a small padding so the shirt isn't too tight.
    // Keep this fairly small so the shirt appears larger (less empty space).
    const padX = Math.round(cropW * 0.045);
    const padY = Math.round(cropH * 0.03);
    cropX = Math.max(0, cropX - padX);
    cropY = Math.max(0, cropY - padY);
    cropW = Math.min(srcW - cropX, cropW + padX * 2);
    cropH = Math.min(srcH - cropY, cropH + padY * 2);

    if (cropW < 10 || cropH < 10) return dataUrl;

    // If the detected crop is too wide/short, it makes the shirt look
    // "compressed" in both the static preview (object-contain) and the 3D plane.
    // To fix that without distorting pixels, pad the output vertically to a
    // more reasonable aspect ratio.
    const maxWOverH = 0.9; // enforce width/height <= 0.90 by adding vertical padding
    const wOverH = cropW / Math.max(1, cropH);
    const outW = cropW;
    const outH = wOverH > maxWOverH ? Math.ceil(outW / maxWOverH) : cropH;
    const offsetX = 0;
    const offsetY = Math.floor((outH - cropH) / 2);

    const out = document.createElement("canvas");
    out.width = outW;
    out.height = outH;
    const octx = out.getContext("2d", { alpha: false });
    if (!octx) return dataUrl;

    // Fill padding with the detected background tone so the image looks natural.
    octx.fillStyle = `rgb(${bgR},${bgG},${bgB})`;
    octx.fillRect(0, 0, outW, outH);
    octx.drawImage(
      img,
      cropX,
      cropY,
      cropW,
      cropH,
      offsetX,
      offsetY,
      cropW,
      cropH
    );
    return out.toDataURL("image/png");
  };

  async function openPreviewBothSides() {
    const canvas = fabricCanvasRef.current;
    if (!canvas) {
      alert("Canvas not found.");
      return;
    }

    const token = ++previewTokenRef.current;
    const originalSide = currentSide;

    setPreviewOpen(true);
    setPreviewLoading(true);
    setPreviewError("");
    setPreviewImages({ Front: null, Back: null });
    setPreviewStaticImages({ Front: null, Back: null });

    // Persist current side before we start switching
    saveCurrentSideDesign();

    let cancelled = false;
    const results = { Front: null, Back: null };

    // Use a higher capture scale for 3D preview textures.
    // On mobile, keep it lower to avoid slowdowns / memory issues.
    const isMobileViewport =
      (window.matchMedia && window.matchMedia("(max-width: 768px)").matches) ||
      (window.innerWidth || 0) <= 768;
    const PREVIEW_CAPTURE_SCALE = isMobileViewport ? 3 : 4;

    try {
      for (const sideKey of ["Front", "Back"]) {
        await handleSideChange(sideKey, { skipSave: true });
        await nextFrame();
        await sleep(60);

        if (token !== previewTokenRef.current) {
          cancelled = true;
          break;
        }

        results[sideKey] = await captureFullMockupDataUrl({
          scale: PREVIEW_CAPTURE_SCALE,
        });
      }
    } catch (e) {
      if (token === previewTokenRef.current) {
        console.error("Preview capture failed:", e);
        setPreviewError("Preview failed. Please try again.");
      }
    } finally {
      // Always restore the user's original side, even if the preview was cancelled.
      try {
        await handleSideChange(originalSide, { skipSave: true });
      } catch (e) {}

      if (!cancelled && token === previewTokenRef.current) {
        try {
          const [frontCropped, backCropped] = await Promise.all([
            autoCropMockupDataUrlForDisplay(results.Front),
            autoCropMockupDataUrlForDisplay(results.Back),
          ]);
          if (token === previewTokenRef.current) {
            const cropped = { Front: frontCropped, Back: backCropped };
            // Use cropped for BOTH the 3D textures and the static previews.
            setPreviewImages(cropped);
            setPreviewStaticImages(cropped);
          }
        } catch (e) {
          // If cropping fails, fall back to originals.
          if (token === previewTokenRef.current) {
            setPreviewImages(results);
            setPreviewStaticImages(results);
          }
        }
      }

      if (token === previewTokenRef.current) setPreviewLoading(false);
    }
  }

  function closePreview() {
    previewTokenRef.current++;
    setPreviewOpen(false);
    setPreviewLoading(false);
    setPreviewError("");
    setPreviewImages({ Front: null, Back: null });
    setPreviewStaticImages({ Front: null, Back: null });
  }


  const nextFrame = () => {
    return new Promise((resolve) => {
      requestAnimationFrame(() => resolve());
    });
  };

  function handleMockPrint() {
    // enter mock selection mode: show thumbnails and allow selecting a mockup
    setMockMode(true);
  }

  async function selectMockup(src) {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    // remove previous temporary mock if any
    try {
      if (mockImageRef.current) {
        canvas.remove(mockImageRef.current);
        mockImageRef.current = null;
      }
    } catch (e) {}

    const imgEl = new Image();
    imgEl.crossOrigin = "anonymous";
    imgEl.src = src;
    imgEl.onload = () => {
      // visible mock image
      const img = new fabric.Image(imgEl, {
        left: CliprectRef.current.left + CliprectRef.current.width / 2,
        top: CliprectRef.current.top + CliprectRef.current.height / 2,
        originX: "center",
        originY: "center",
        opacity: 1,
        selectable: true,
        evented: true,
        hasControls: true,
        absolutePositioned: true,
      });

      mockImageRef.current = img; // visible

      canvas.add(img);
      try {
        canvas.setActiveObject(img);
        //canvas.bringToFront(img);
        canvas.bringObjectToFront(img);
      } catch (e) {}
      canvas.requestRenderAll();
    };
  }

  function cancelMockup() {
    const canvas = fabricCanvasRef.current;
    try {
      if (mockImageRef.current) canvas.remove(mockImageRef.current);
    } catch (e) {}
    mockImageRef.current = null;
    setMockMode(false);
    // restore clip to any existing CliprectRef if needed (no-op)
    canvas && canvas.requestRenderAll && canvas.requestRenderAll();
  }

  function confirmMockup() {
    const canvas = fabricCanvasRef.current;
    if (!mockImageRef.current) return;

    try {
      mockImageRef.current.clone((cloned) => {
        cloned.set({
          selectable: false,
          evented: false,
          absolutePositioned: true,
          isMaskImage: true,
        });

        // push into clip stack
        clipStackRef.current.push(cloned);

        // recompute composed clip and apply
        composeClip();

        // make the visible mock non-interactive template (keep on canvas)
        try {
          mockImageRef.current.set({
            selectable: false,
            evented: false,
            isMaskImage: true, // âœ… preserve mask flag
          });
        } catch (e) {}

        // exit mock mode and re-enable buttons
        setMockMode(false);
        canvas && canvas.requestRenderAll && canvas.requestRenderAll();
      });
    } catch (e) {
      // fallback: if cloning fails
      try {
        const src =
          mockImageRef.current._element && mockImageRef.current._element.src;
        if (src) {
          const imgEl = new Image();
          imgEl.crossOrigin = "anonymous";
          imgEl.src = src;
          imgEl.onload = () => {
            const clipImg = new fabric.Image(imgEl, {
              left: mockImageRef.current.left,
              top: mockImageRef.current.top,
              originX: mockImageRef.current.originX || "center",
              originY: mockImageRef.current.originY || "center",
              scaleX: mockImageRef.current.scaleX,
              scaleY: mockImageRef.current.scaleY,
              angle: mockImageRef.current.angle || 0,
              selectable: false,
              evented: false,
              absolutePositioned: true,
              isMaskImage: true, // âœ… mark as mask
            });
            CliprectRef.current = clipImg;

            canvas.getObjects().forEach((obj) => {
              if (!obj || obj === mockImageRef.current) return;
              try {
                obj.set("clipPath", CliprectRef.current);
                if (typeof obj.setCoords === "function") obj.setCoords();
              } catch (e) {}
            });

            try {
              mockImageRef.current.set({
                selectable: false,
                evented: false,
                isMaskImage: true, // âœ… preserve mask flag
              });
            } catch (e) {}

            setMockMode(false);
            canvas && canvas.requestRenderAll && canvas.requestRenderAll();
          };
        }
      } catch (err) {}
    }
  }

  useEffect(() => {
    // Prevent body scrolling while Designer is open
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  return (
    <div className="h-screen w-screen overflow-hidden bg-gray-50 text-gray-900 flex flex-col md:flex-row">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,.jpg,.jpeg,.png"
        onChange={handleUpload}
        className="hidden"
      />
      <input
        ref={fontFileInputRef}
        type="file"
        accept=".ttf,.otf,.woff,.woff2,font/ttf,font/otf,font/woff,font/woff2"
        onChange={handleFontUpload}
        className="hidden"
      />
      {/* LEFT PANEL */}
      <div className="hidden md:flex md:w-[340px] shrink-0 flex-col bg-white border-b md:border-b-0 md:border-r border-gray-200">
        <div className="p-5 border-b border-gray-100">
          <div className="text-base font-extrabold text-gray-900">Designer</div>
          <div className="text-xs text-gray-500 mt-0.5">
            {CLOTH_CONFIG[cloth]?.label || cloth} • {selectedColor} •{" "}
            {currentSide}
          </div>
        </div>
        <div className={`p-5 overflow-auto ${NO_SCROLLBAR}`}>
          {renderControlsPanel()}
        </div>
      </div>

      <div
        ref={containerRef}
        className={`relative flex-1 flex items-center justify-center overflow-hidden overscroll-contain [WebkitOverflowScrolling:touch] h-full md:h-full min-h-0 ${NO_SCROLLBAR}`}
      >
        {/* Mobile canvas-first quick access */}
        {!(
          mobileToolsOpen ||
          mobileSideOpen ||
          mobileTextOpen ||
          mobileArrangeOpen ||
          previewOpen
        ) && (
          <div className="md:hidden fixed left-3 top-3 z-[50]">
            <div className="p-1 rounded-2xl border border-gray-200 bg-white/90 backdrop-blur shadow-sm flex gap-1">
              <button
                type="button"
                onClick={() => {
                  setMobileSideOpen(false);
                  setMobileArrangeOpen(false);
                  setMobileTextOpen(false);
                  setMobileToolsOpen(true);
                }}
                className="h-10 px-3 rounded-xl border border-gray-200 bg-white text-gray-900 text-[13px] font-extrabold"
              >
                Tools
              </button>
              <button
                type="button"
                onClick={() => {
                  setMobileToolsOpen(false);
                  setMobileArrangeOpen(false);
                  setMobileTextOpen(false);
                  setMobileSideOpen(true);
                }}
                className="h-10 px-3 rounded-xl border border-gray-200 bg-white text-gray-900 text-[13px] font-extrabold inline-flex items-center gap-2"
              >
                Side
                <span className="text-[11px] font-extrabold px-2 py-1 rounded-lg border border-gray-200 bg-white text-gray-700">
                  {currentSide}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMobileToolsOpen(false);
                  setMobileSideOpen(false);
                  setMobileTextOpen(false);
                  setMobileArrangeOpen(true);
                }}
                className="h-10 px-3 rounded-xl border border-gray-200 bg-white text-gray-900 text-[13px] font-extrabold"
              >
                Operations
              </button>

              {showTextControls && (
                <button
                  type="button"
                  onClick={() => {
                    setMobileToolsOpen(false);
                    setMobileSideOpen(false);
                    setMobileArrangeOpen(false);
                    setMobileTextOpen(true);
                  }}
                  className="h-10 px-3 rounded-xl border border-gray-200 bg-white text-gray-900 text-[13px] font-extrabold"
                >
                  Text
                </button>
              )}
            </div>
          </div>
        )}

        <div className="w-full flex items-center justify-center p-3 md:p-8">
          <div className="bg-white border border-gray-200 rounded-3xl shadow-sm p-3 md:p-6">
            <div
              ref={stageRef}
              className="relative flex items-center justify-center bg-center bg-no-repeat bg-contain rounded-2xl overflow-hidden"
            >
              <img
                src={imageUrl}
                alt=""
                draggable={false}
                className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none"
              />
              <canvas ref={canvasRef} className="relative" />
            </div>
          </div>
        </div>
      </div>

      {/* Floating Add to Cart for desktop (right side) */}
      <div className="hidden md:flex fixed right-6 bottom-6 z-50 flex-col items-stretch gap-3 w-[240px] max-w-[280px]">
        {/* Price pill */}
        {(() => {
          const p = computeDesignPrice();
          return (
            <div className="bg-white rounded-full px-4 py-2 flex items-center gap-4 border border-gray-100 shadow-md">
              <div className="flex flex-col items-start">
                <div className="text-[10px] uppercase text-gray-400 font-semibold">
                  Price
                </div>
                <div className="text-sm font-extrabold text-gray-900">
                  {p.hasAny ? `₹${p.price}` : "Add a design"}
                </div>
              </div>
            </div>
          );
        })()}

        {/* Primary Add to Cart button */}
        {/* <button
          type="button"
          onClick={handleSaveDesign}
          disabled={mockMode || savingDesign}
          className={`w-full h-12 px-4 rounded-xl text-sm font-extrabold inline-flex items-center justify-center transition-all ${
            mockMode || savingDesign
              ? "border border-gray-300 bg-gray-200 text-gray-500 cursor-not-allowed"
              : "border-2 border-blue-600 bg-blue-600 text-white hover:bg-blue-700 hover:border-blue-700 hover:shadow-lg active:translate-y-px"
          }`}
        >
          {savingDesign ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Saving Design...
            </span>
          ) : (
            "Save Design"
          )}
          
        </button> */}
        <div className="mt-6 space-y-3">
            {!savedDesign ? (
              <button
                onClick={handleSaveDesign}
                disabled={mockMode || savingDesign}
                aria-label="Add to cart"
                className={`w-full h-14 px-6 rounded-full text-[15px] font-extrabold inline-flex items-center justify-center active:translate-y-px shadow-lg ${
                  mockMode || savingDesign
                    ? "border border-gray-300 bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-gray-900 text-white hover:bg-gray-800"
                }`}
              >
                {savingDesign ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Saving Design...
                  </span>
                ) : (
                  "Save Design"
                )}
              </button>
            ) : (
              <>
                {designChanged && (
                  <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-3 mb-3">
                    <p className="text-xs font-semibold text-yellow-800 flex items-center gap-2">
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Design Modified - Save Again Required
                    </p>
                    <p className="text-xs text-yellow-700 mt-1">
                      You've made changes to your design. Please save again
                      before adding to cart.
                    </p>
                  </div>
                )}

                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-xs font-semibold text-green-700 flex items-center gap-2">
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Design Saved Successfully!
                  </p>
                  <p className="text-xs text-gray-600 mt-1 truncate">
                    {savedDesign.title}
                  </p>
                </div>

                {designChanged && (
                  <button
                      onClick={handleSaveDesign}
                      disabled={mockMode || savingDesign}
                      className={`w-full h-14 px-6 rounded-full text-[15px] font-extrabold inline-flex items-center justify-center ${
                        mockMode || savingDesign
                          ? "border border-gray-300 bg-gray-200 text-gray-500 cursor-not-allowed"
                          : "bg-yellow-600 text-white hover:bg-yellow-700 hover:border-yellow-700 hover:shadow-lg"
                      }`}
                    >
                    {savingDesign ? (
                      <span className="flex items-center gap-2">
                        <svg
                          className="animate-spin h-4 w-4"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Saving Changes...
                      </span>
                    ) : (
                      "Save Changes"
                    )}
                  </button>
                )}

                {!addedToCart ? (
                  <button
                    onClick={openPreviewBothSides}
                    disabled={
                      mockMode || addingToCart || !selectedSize || designChanged
                    }
                    className={`w-full h-14 px-6 rounded-full text-[15px] font-extrabold inline-flex items-center justify-center ${
                      mockMode || addingToCart || !selectedSize || designChanged
                        ? "border border-gray-300 bg-gray-200 text-gray-500 cursor-not-allowed"
                        : "bg-green-600 text-white hover:bg-green-700 hover:border-green-700 hover:shadow-lg"
                    }`}
                  >
                    {addingToCart ? (
                      <span className="flex items-center gap-2">
                        <svg
                          className="animate-spin h-4 w-4"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Adding to Cart...
                      </span>
                    ) : (
                      `Add to Cart ${
                        !selectedSize
                          ? "(Select Size)"
                          : designChanged
                          ? "(Save First)"
                          : ""
                      }`
                    )}
                  </button>
                ) : (
                  <button
                    onClick={handleGoToCheckout}
                    className="w-full h-12 px-4 rounded-xl text-sm font-extrabold inline-flex items-center justify-center transition-all border-2 border-purple-600 bg-purple-600 text-white hover:bg-purple-700 hover:border-purple-700 hover:shadow-lg active:translate-y-px"
                  >
                    Go to Checkout →
                  </button>
                )}

                {!selectedSize && !addedToCart && (
                  <p className="text-xs text-red-500 mt-2 text-center">
                    Please select a size before adding to cart
                  </p>
                )}
              </>
            )}
          </div>
      </div>

      {/* Mobile bottom bar: back button (left), price (center), add to cart (right) */}
      <div className="md:hidden fixed inset-x-0 bottom-0 z-50 bg-black/95 py-3 px-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="h-10 px-3 rounded-lg bg-white text-black font-bold"
        >
          Back
        </button>

        <div className="text-white font-extrabold text-lg">
          {(() => {
            const p = computeDesignPrice();
            return p.hasAny ? `₹${p.price}` : "Add a design";
          })()}
        </div>

        <button
          type="button"
          onClick={async () => {
            if (!savedDesign || !savedDesign._id) {
              // If not saved, call the same save handler used in desktop
              await handleSaveDesign();
              return;
            }
            // If already saved, proceed with the mobile add flow (preview -> add -> checkout)
            await handleMobileAddFlow();
          }}
          disabled={
            (!savedDesign || !savedDesign._id)
              ? mockMode || savingDesign
              : mockMode || addingToCart || !selectedSize || designChanged
          }
          className={`h-10 px-4 rounded-lg font-extrabold inline-flex items-center justify-center transition-all ${
            (!savedDesign || !savedDesign._id)
              ? (mockMode || savingDesign
                  ? "border border-gray-300 bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-gray-900 text-white")
              : (mockMode || addingToCart || !selectedSize || designChanged
                  ? "border border-gray-300 bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-green-600 text-white hover:bg-green-700 hover:border-green-700 hover:shadow-lg")
          }`}
        >
          {(!savedDesign || !savedDesign._id) ? (
            <>{savingDesign ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Saving Design...
              </span>
            ) : (
              "Save Design"
            )}</>
          ) : (
            (addingToCart ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Adding to Cart...
              </span>
            ) : (
              `Add to Cart ${
                !selectedSize ? "(Select Size)" : designChanged ? "(Save First)" : ""
              }`
            ))
          )}
        </button>
      </div>

      {/* RIGHT SIDE THUMBNAIL SWITCHER */}
      <div className="hidden md:flex md:w-[280px] shrink-0 flex-col bg-white border-l border-gray-200 h-full">
        <div className="p-5 border-b border-gray-100">
          <div className="text-[11px] text-center font-extrabold uppercase tracking-[0.16em] text-gray-500">
            Side
          </div>
          <div className="text-sm text-center font-extrabold text-gray-900 mt-1">
            {currentSide}
          </div>
        </div>
        <div className={`p-5 flex-1 overflow-auto ${NO_SCROLLBAR}`}>
          <div className="h-full flex flex-col items-center justify-center gap-3 sm:gap-4">
            {Object.values(SIDE_CONFIG).map((side) => {
              const isActive = currentSide === side.key;
              const thumbsrc = getBgUrlFor({
                clothKey: cloth,
                colorName: selectedColor,
                sideKey: side.key,
              });

              return (
                <button
                  key={side.key}
                  onClick={() => handleSideChange(side.key)}
                  onMouseEnter={(e) => {
                    tweenTo(e.currentTarget, { y: -4, scale: 1.02 });
                  }}
                  onMouseLeave={(e) => {
                    tweenTo(e.currentTarget, { y: 0, scale: 1 });
                  }}
                  onMouseDown={(e) => {
                    tweenTo(e.currentTarget, { scale: 0.95, duration: 0.08 });
                  }}
                  onMouseUp={(e) => {
                    tweenTo(e.currentTarget, { y: -4, scale: 1.02 });
                  }}
                  className={`relative flex flex-col items-center w-[88px] sm:w-[100px] px-2 py-4 rounded-2xl border transition ${
                    isActive
                      ? "border-transparent bg-white shadow-lg"
                      : "border-transparent bg-white hover:border-transparent"
                  }`}
                >
                  {/* The Selection Ring */}
                  <div
                    className={`pointer-events-none absolute -inset-0.5 rounded-[18px] border-2 border-white transition-opacity ${
                      isActive ? "opacity-100" : "opacity-0"
                    }`}
                  />

                  <div className="w-[56px] h-[56px] sm:w-[60px] sm:h-[60px] mb-3 flex items-center justify-center">
                    <img
                      src={thumbsrc}
                      alt={side.label}
                      className={`max-w-full max-h-full object-contain ${
                        isActive ? "" : "grayscale opacity-60"
                      }`}
                    />
                  </div>

                  <span
                    className={`text-[12px] sm:text-[13px] font-extrabold uppercase tracking-[0.14em] ${
                      isActive ? "text-black" : "text-gray-400"
                    }`}
                  >
                    {side.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mobile Tools Overlay (canvas-first) */}
      {mobileToolsOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="md:hidden fixed inset-0 z-[10000] bg-black/55"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setMobileToolsOpen(false);
          }}
        >
          <div
            className={`absolute inset-x-0 bottom-0 max-h-[85svh] bg-white rounded-t-3xl border-t border-gray-200 shadow-2xl overflow-auto ${NO_SCROLLBAR}`}
          >
            <div className="sticky top-0 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
              <div>
                <div className="text-sm font-extrabold text-gray-900">
                  Tools
                </div>
                <div className="text-[11px] text-gray-500">
                  {CLOTH_CONFIG[cloth]?.label || cloth} • {selectedColor} •{" "}
                  {currentSide}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMobileToolsOpen(false)}
                className="w-10 h-10 rounded-xl border border-gray-200 bg-white text-gray-900 text-lg leading-none"
                aria-label="Close tools"
              >
                ×
              </button>
            </div>

            <div className="p-4">
              {renderControlsPanel({
                hideArrange: true,
                hideTextControls: true,
              })}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Side Overlay (canvas-first) */}
      {mobileSideOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="md:hidden fixed inset-0 z-[10001] bg-black/55"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setMobileSideOpen(false);
          }}
        >
          <div
            className={`absolute inset-x-0 bottom-0 max-h-[55svh] bg-white rounded-t-3xl border-t border-gray-200 shadow-2xl overflow-auto ${NO_SCROLLBAR}`}
          >
            <div className="sticky top-0 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
              <div>
                <div className="text-sm font-extrabold text-gray-900">Side</div>
                <div className="text-[11px] text-gray-500">
                  Choose Front or Back
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMobileSideOpen(false)}
                className="w-10 h-10 rounded-xl border border-gray-200 bg-white text-gray-900 text-lg leading-none"
                aria-label="Close side selector"
              >
                ×
              </button>
            </div>

            <div className="p-4 flex justify-center">
              <div className="grid grid-cols-2 gap-3 w-full max-w-[360px]">
                {Object.values(SIDE_CONFIG).map((side) => {
                  const isActive = currentSide === side.key;
                  const thumbsrc = getBgUrlFor({
                    clothKey: cloth,
                    colorName: selectedColor,
                    sideKey: side.key,
                  });

                  return (
                    <button
                      key={side.key}
                      type="button"
                      onClick={() => {
                        handleSideChange(side.key);
                        setMobileSideOpen(false);
                      }}
                      className={`rounded-2xl border overflow-hidden text-left transition ${
                        isActive ? "border-gray-900" : "border-gray-200"
                      }`}
                    >
                      <div className="bg-white aspect-[1/1] flex items-center justify-center">
                        <img
                          src={thumbsrc}
                          alt={side.label}
                          className="w-full h-full object-contain bg-white"
                        />
                      </div>
                      <div
                        className={`px-3 py-2 text-[13px] font-extrabold ${
                          isActive ? "text-gray-900" : "text-gray-700"
                        }`}
                      >
                        {side.label}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Text Overlay (quick access when a text object is selected) */}
      {mobileTextOpen && showTextControls && (
        <div
          role="dialog"
          aria-modal="true"
          className="md:hidden fixed inset-0 z-[10002] bg-black/55"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setMobileTextOpen(false);
          }}
        >
          <div
            className={`absolute inset-x-0 bottom-0 max-h-[60svh] bg-white rounded-t-3xl border-t border-gray-200 shadow-2xl overflow-auto ${NO_SCROLLBAR}`}
          >
            <div className="sticky top-0 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
              <div>
                <div className="text-sm font-extrabold text-gray-900">Text</div>
                <div className="text-[11px] text-gray-500">Color and font</div>
              </div>
              <button
                type="button"
                onClick={() => setMobileTextOpen(false)}
                className="w-10 h-10 rounded-xl border border-gray-200 bg-white text-gray-900 text-lg leading-none"
                aria-label="Close text controls"
              >
                ×
              </button>
            </div>

            <div className="p-4 space-y-3">
              <div className="rounded-2xl border border-gray-200 bg-white p-3">
                <div className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-gray-500 mb-2">
                  Font Color
                </div>
                <input
                  type="color"
                  value={fontColor}
                  className="w-full h-11 px-3 rounded-xl border border-gray-200 bg-white text-gray-900"
                  onChange={handleColorChange}
                />
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-3">
                <div className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-gray-500 mb-2">
                  Font Family
                </div>
                <select
                  value={fontFamily}
                  className="w-full h-11 px-3 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm outline-none focus:border-gray-900"
                  onChange={handleFontFamilyChange}
                >
                  <option value="Arial">Arial</option>
                  <option value="Georgia">Georgia</option>
                  <option value="Times New Roman">Times New Roman</option>
                  <option value="Helvetica">Helvetica</option>
                  <option value="Comic Sans MS">Comic Sans MS</option>
                  <option value="Dancing Script">Dancing Script</option>
                  {Array.isArray(customFonts) &&
                    customFonts.length > 0 &&
                    customFonts.map((f) => {
                      const family = f && f.family ? String(f.family) : "";
                      if (!family) return null;
                      return (
                        <option
                          key={`custom-font-mobile-${family}`}
                          value={family}
                        >
                          {family}
                        </option>
                      );
                    })}
                </select>

                <button
                  type="button"
                  onClick={openFontPicker}
                  className="mt-2 w-full h-11 px-3 rounded-xl border border-gray-200 bg-white text-gray-900 text-[13px] font-extrabold inline-flex items-center justify-center transition-shadow hover:shadow-md active:translate-y-px"
                >
                  Upload Custom Font
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Arrange Overlay (quick access for undo/redo and object actions) */}
      {mobileArrangeOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="md:hidden fixed inset-0 z-[10003] bg-black/55"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setMobileArrangeOpen(false);
          }}
        >
          <div
            className={`absolute inset-x-0 bottom-0 max-h-[45svh] bg-white rounded-t-3xl border-t border-gray-200 shadow-2xl overflow-auto ${NO_SCROLLBAR}`}
          >
            <div className="sticky top-0 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
              <div>
                <div className="text-sm font-extrabold text-gray-900">
                  Arrange
                </div>
                <div className="text-[11px] text-gray-500">
                  Undo, redo, layer, delete
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMobileArrangeOpen(false)}
                className="w-10 h-10 rounded-xl border border-gray-200 bg-white text-gray-900 text-lg leading-none"
                aria-label="Close arrange"
              >
                ×
              </button>
            </div>

            <div className="p-4">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    handleUndo();
                    setMobileArrangeOpen(false);
                  }}
                  disabled={mockMode || !canUndo}
                  className="h-10 px-3 rounded-xl border border-gray-200 bg-white text-gray-900 text-[13px] font-extrabold inline-flex items-center justify-center transition-shadow hover:shadow-md active:translate-y-px disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  Undo
                </button>
                <button
                  onClick={() => {
                    handleRedo();
                    setMobileArrangeOpen(false);
                  }}
                  disabled={mockMode || !canRedo}
                  className="h-10 px-3 rounded-xl border border-gray-200 bg-white text-gray-900 text-[13px] font-extrabold inline-flex items-center justify-center transition-shadow hover:shadow-md active:translate-y-px disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  Redo
                </button>
                <button
                  onClick={() => {
                    handleBringToFront();
                    setMobileArrangeOpen(false);
                  }}
                  disabled={mockMode || !hasSelection}
                  className="h-10 px-3 rounded-xl border border-gray-200 bg-white text-gray-900 text-[13px] font-extrabold inline-flex items-center justify-center transition-shadow hover:shadow-md active:translate-y-px disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  Bring Front
                </button>
                <button
                  onClick={() => {
                    handleDeleteObject();
                    setMobileArrangeOpen(false);
                  }}
                  disabled={mockMode || !hasSelection}
                  className="h-10 px-3 rounded-xl border border-red-700 bg-red-700 text-white text-[13px] font-extrabold inline-flex items-center justify-center transition-shadow hover:shadow-md active:translate-y-px disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* One-time copyright notice before first upload */}
      {copyrightModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[10020] bg-black/55 backdrop-blur-[2px] flex items-center justify-center p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setCopyrightModalOpen(false);
          }}
        >
          <div className="w-[min(520px,92vw)] bg-white rounded-2xl border border-gray-200 shadow-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <div>
                <div className="text-sm font-extrabold text-gray-900">
                  Copyright notice
                </div>
                <div className="text-[11px] text-gray-500">
                  Please confirm before uploading
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCopyrightModalOpen(false)}
                className="w-10 h-10 rounded-xl border border-gray-200 bg-white text-gray-900 text-lg leading-none"
                aria-label="Close copyright notice"
              >
                ×
              </button>
            </div>

            <div className="p-4 text-sm text-gray-800">
              By uploading any image, logo, or design, you confirm that you own
              the rights to the content or have permission from the rightful
              owner to use it for printing. Uploading copyrighted, trademarked,
              or restricted content without authorization is strictly
              prohibited.
            </div>

            <div className="px-4 pb-4 flex gap-2">
              {/* <button
                type="button"
                onClick={() => {
                  pendingUploadRef.current = false;
                  setCopyrightModalOpen(false);
                }}
                className="flex-1 h-10 px-3 rounded-xl border border-gray-200 bg-white text-gray-900 text-[13px] font-extrabold"
              >
                Cancel
              </button> */}
              <button
                type="button"
                onClick={() => {
                  try {
                    window.localStorage.setItem(
                      "designer_upload_ack_seen",
                      "1"
                    );
                  } catch (e) {}
                  setUploadAcked(true);
                  setCopyrightModalOpen(false);

                  if (pendingUploadRef.current) {
                    pendingUploadRef.current = false;
                    setTimeout(() => {
                      openFilePicker();
                    }, 0);
                  }
                }}
                className="flex-1 h-10 px-3 rounded-xl border border-gray-900 bg-gray-900 text-white text-[13px] font-extrabold"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Abuse warning shown when user attempts to add text (first time) */}
      {abuseModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[10030] bg-black/55 backdrop-blur-[2px] flex items-center justify-center p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setAbuseModalOpen(false);
          }}
        >
          <div className="w-[min(520px,92vw)] bg-white rounded-2xl border border-gray-200 shadow-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <div>
                <div className="text-sm font-extrabold text-gray-900">
                  Notice
                </div>
                <div className="text-[11px] text-gray-500">Please read</div>
              </div>
              <button
                type="button"
                onClick={() => setAbuseModalOpen(false)}
                className="w-10 h-10 rounded-xl border border-gray-200 bg-white text-gray-900 text-lg leading-none"
                aria-label="Close notice"
              >
                ×
              </button>
            </div>

            <div className="p-4 text-sm text-gray-800">
              Please do not add any abusive, hateful, or offensive text in your
              designs. Content that violates community guidelines is strictly
              prohibited.
            </div>

            <div className="px-4 pb-4 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  try {
                    window.localStorage.setItem(
                      "designer_abuse_warning_seen",
                      "1"
                    );
                  } catch (e) {}
                  setAbuseModalOpen(false);
                  if (pendingAddTextRef.current) {
                    pendingAddTextRef.current = false;
                    try {
                      addCanvasText();
                      closeMobileToolsSheet();
                    } catch (e) {}
                  }
                }}
                className="flex-1 h-10 px-3 rounded-xl border border-gray-900 bg-gray-900 text-white text-[13px] font-extrabold"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {previewOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[9999] bg-black/55 backdrop-blur-[10px] flex items-center justify-center p-4"
          onMouseDown={(e) => {
            // click outside closes
            if (e.target === e.currentTarget) closePreview();
          }}
        >
          <div className="w-[min(1240px,98vw)] max-h-[min(1200px,94vh)] bg-white rounded-[20px] overflow-hidden border border-gray-200 shadow-[0_30px_70px_rgba(0,0,0,0.35),0_10px_30px_rgba(0,0,0,0.18)] flex flex-col">
            <div className="py-3.5 px-4 flex items-center justify-between border-b border-gray-200">
              <div>
                <div className="text-base font-extrabold text-gray-900">
                  Preview
                </div>
                <div className="text-xs text-gray-500">
                  {selectedColor} • Front + Back
                </div>
              </div>
              <button
                onClick={closePreview}
                className="w-10 h-10 rounded-xl border border-red-700 bg-red-700 text-white inline-flex items-center justify-center text-lg leading-none"
                aria-label="Close preview"
              >
                ×
              </button>
            </div>

            <div
              className={`p-3.5 overflow-auto bg-gray-50 flex-1 ${NO_SCROLLBAR}`}
            >
              {previewLoading && (
                <div className="text-gray-900 font-semibold">
                  Generating preview…
                </div>
              )}
              {!previewLoading && previewError && (
                <div className="text-red-700 font-bold">{previewError}</div>
              )}

              {!previewLoading && !previewError && (
                <div className="bg-white border border-gray-200 rounded-2xl p-3.5">
                  <div className="font-extrabold text-gray-900 mb-2.5">
                    3D Rotating Preview
                  </div>
                  <div className="rounded-xl overflow-hidden border border-gray-100 bg-white h-[min(74vh,720px)]">
                    {previewImages?.Front && previewImages?.Back ? (
                      <div ref={preview3dMountRef} className="w-full h-full" />
                    ) : (
                      <div className="h-full flex items-center justify-center p-6 text-gray-500 font-semibold">
                        Preparing textures…
                      </div>
                    )}
                  </div>

                  <div className="mt-3.5 grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(520px,1fr))]">
                    {["Front", "Back"].map((sideKey) => (
                      <div
                        key={sideKey}
                        className="border border-gray-200 rounded-xl overflow-hidden bg-white"
                      >
                        <div className="px-3 py-2.5 border-b border-gray-100 font-extrabold text-gray-900">
                          {sideKey}
                        </div>
                        <div>
                          <div className="w-full max-w-full aspect-[3/4] flex items-center justify-center bg-white">
                            {previewStaticImages?.[sideKey] ||
                            previewImages?.[sideKey] ? (
                              <img
                                src={
                                  previewStaticImages?.[sideKey] ||
                                  previewImages?.[sideKey]
                                }
                                alt={`${sideKey} static preview`}
                                className="w-full h-full block object-contain bg-white"
                              />
                            ) : (
                              <div className="p-4.5 text-gray-500 font-semibold">
                                No {sideKey} preview
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-3.5 border-t border-gray-200 flex justify-end bg-white">
              <button
                onClick={async () => {
                  // If productId is in URL, open picker as before.
                  // const productId = searchParams.get("productId");
                  // if (!productId) {
                  //   setProductPickerOpen(true);
                  //   setProductPickerValues((v) => ({
                  //     ...v,
                  //     colorName: selectedColor,
                  //     sizeName: v.sizeName || "",
                  //   }));
                  //   return;
                  // }

                  try {
                    await handleAddToCart();
                    // After successfully adding, go to checkout
                    handleGoToCheckout();
                  } catch (err) {
                    console.error("Preview add-to-cart then checkout failed:", err);
                    toast.error(err?.response?.data?.message || err?.message || "Add to cart failed");
                  }
                }}
                className="w-full h-12 px-4 rounded-xl border-2 border-green-600 bg-green-600 text-white font-extrabold hover:bg-green-700 hover:border-green-700 hover:shadow-lg active:translate-y-px"
              >
                Go to Checkout →
              </button>
            </div>
          </div>
        </div>
      )}

      
    </div>
  );
};
export default Designer;
