import React, { useEffect, useRef, useState } from "react";
import * as fabric from "fabric";
import html2canvas from "html2canvas";
import JSZip from "jszip";
import { gsap } from "gsap";
import "./Designer.css"
const SIDE_CONFIG = {
  front: { key: "Front", label: "Front", bgImage: "/Black/Front.jpg" },
  back: { key: "Back", label: "Back", bgImage: "/Black/Back.jpg" },
  // left: { key: "left", label: "Left", bgImage: "/Black/left.png" },
  // right: { key: "right", label: "Right", bgImage: "/Black/right.png" },
};

const CLOTH_CONFIG = {
  men: {
    label: "Men T-Shirt",
    imageFolderForColor: (colorName) => String(colorName || "Black"),
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
    // You currently have /public/Girl/Front.jpg + Back.jpg
    imageFolderForColor: () => "Girl",
    printAreaInch: { width: 14, height: 18 },
    placementBySide: {
      Front: { x: 0.5, y: 0.55 },
      Back: { x: 0.5, y: 0.55 },
    },
    margin: 0.3,
  },
  hoodie: {
    label: "Hoodie",
    imageFolderForColor: (colorName) => String(colorName || "Black"),
    printAreaInch: { width: 14, height: 16 },
    placementBySide: {
      Front: { x: 0.5, y: 0.54 },
      Back: { x: 0.5, y: 0.54 },
    },
    margin: 0.3,
  },
  sweatshirt: {
    label: "Sweatshirt",
    imageFolderForColor: (colorName) => String(colorName || "Black"),
    printAreaInch: { width: 14, height: 18 },
    placementBySide: {
      Front: { x: 0.5, y: 0.53 },
      Back: { x: 0.5, y: 0.53 },
    },
    margin: 0.3,
  },
};

const getBgUrlFor = ({ clothKey, colorName, sideKey }) => {
  const cKey = String(clothKey || "men");
  const cfg = CLOTH_CONFIG[cKey] || CLOTH_CONFIG.men;
  const folder = (cfg.imageFolderForColor && cfg.imageFolderForColor(colorName)) || String(colorName || "Black");
  const sKey = String(sideKey || "Front");
  return `${folder}/${sKey}.jpg`;
};

const AVAILABLE_COLORS = [
  { name: "Black", value: "#000000" },
  { name: "White", value: "#ffffff" },
  { name: "Navy Blue", value: "#0a1f44" },
  { name: "Red", value: "#c1121f" },
  { name: "Royal Blue", value: "#0057b7" },
  { name: "Grey", value: "#9ca3af" },
  { name: "Olive Green", value: "#556b2f" },
];

const Designer = () => {
  const fabricCanvasRef = useRef(null);
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const stageRef = useRef(null);
  const CliprectRef = useRef(null);
  const initialClipRef = useRef(null);
  const clipStackRef = useRef([]);
  const sideSwitchTokenRef = useRef(0);
  const baseSizeRef = useRef({ width: 1800, height: 1200 });
  const textInputRef = useRef(null);
  const fileInputRef = useRef(null);
  const selectedObjectRef = useRef(null);
  const [showTextControls, setShowTextControls] = useState(false);
  const [fontColor, setFontColor] = useState("#000000");
  const [fontFamily, setFontFamily] = useState("Arial");
  const [mockMode, setMockMode] = useState(false);
  const mockImageRef = useRef(null);
  const [currentSide, setCurrentSide] = useState("Front");
  const [cloth, setCloth] = useState("men");
  const [designStore, setDesignStore] = useState({
    men: { front: null, back: null },
    women: { front: null, back: null },
    hoodie: { front: null, back: null },
    sweatshirt: { front: null, back: null },
  });

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState("");
  const [previewImages, setPreviewImages] = useState({ Front: null, Back: null });
  const previewTokenRef = useRef(0);

  const [hoveredColorName, setHoveredColorName] = useState(null);

  const [selectedColor, setSelectedColor] = useState("Black");
  const [imageUrl, setImageUrl] = useState(() =>
    getBgUrlFor({ clothKey: "men", colorName: "Black", sideKey: "Front" })
  );

  const handleClothChange = async (nextClothKey) => {
    if (mockMode) return;

    const newKey = String(nextClothKey || "");
    if (!newKey || !CLOTH_CONFIG[newKey]) return;
    if (newKey === cloth) return;

    // Persist current cloth+side before switching.
    saveCurrentSideDesign();

    // Update UI state.
    setCloth(newKey);

    // Rebuild canvas for the same side using the new cloth config.
    await handleSideChange(currentSide, { clothKey: newKey, skipSave: true });
  };

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

    // On mobile browsers, touch drags on the canvas can be interpreted as page/container
    // scrolling (rubber-band / pull-to-refresh). Prevent default touch scrolling on the
    // Fabric canvas elements so object drag/scale feels stable.
    const touchOptions = { passive: false };
    const preventTouchScroll = (e) => {
      if (e && e.cancelable) e.preventDefault();
    };
    const upperEl = canvas.upperCanvasEl;
    const lowerEl = canvas.lowerCanvasEl;
    try {
      if (upperEl) {
        upperEl.style.touchAction = "none";
        upperEl.style.webkitUserSelect = "none";
        upperEl.style.userSelect = "none";
        upperEl.style.webkitTouchCallout = "none";
        upperEl.addEventListener("touchstart", preventTouchScroll, touchOptions);
        upperEl.addEventListener("touchmove", preventTouchScroll, touchOptions);
      }
      if (lowerEl) {
        lowerEl.style.touchAction = "none";
        lowerEl.style.webkitUserSelect = "none";
        lowerEl.style.userSelect = "none";
        lowerEl.style.webkitTouchCallout = "none";
        lowerEl.addEventListener("touchstart", preventTouchScroll, touchOptions);
        lowerEl.addEventListener("touchmove", preventTouchScroll, touchOptions);
      }
    } catch (e) {}

    // Modern way to load image
    const imgElement = new Image();
    imgElement.src = imageUrl; // path to your image
    imgElement.onload = () => {
      const img = new fabric.Image(imgElement, {
        left: canvas.getWidth(),
        top: canvas.getHeight(),
        originX: "center",
        originY: "center",
        scaleX: 1,
        scaleY: 1,
        selectable: false,
        evented: false,
        absolutePositioned: true,
      });

      const { left, top, width, height } = getFittedPrintAreaRect(canvas, {
        clothKey: cloth,
        sideKey: currentSide,
      });

      const Cliprect = new fabric.Rect({
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
        selectable: false,
        evented: false,
      });

      clipBorder.isClipBorder = true;
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

      CliprectRef.current = Cliprect;
      initialClipRef.current = Cliprect;
      img.set({ clipPath: Cliprect });

      canvas.add(clipBorder);
      canvas.bringObjectToFront(clipBorder);
      canvas.add(img);

      const selectionHandler = (opt) => {
        const active = canvas.getActiveObject
          ? canvas.getActiveObject()
          : opt.target;
        const obj = active || opt.target;
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
      };

      canvas.on("selection:created", selectionHandler);
      canvas.on("selection:updated", selectionHandler);
      canvas.on("selection:cleared", clearHandler);
    };

    return () => {
      try {
        canvas.off("selection:created");
        canvas.off("selection:updated");
        canvas.off("selection:cleared");
      } catch (e) {}

      try {
        if (upperEl) {
          upperEl.removeEventListener("touchstart", preventTouchScroll, touchOptions);
          upperEl.removeEventListener("touchmove", preventTouchScroll, touchOptions);
        }
        if (lowerEl) {
          lowerEl.removeEventListener("touchstart", preventTouchScroll, touchOptions);
          lowerEl.removeEventListener("touchmove", preventTouchScroll, touchOptions);
        }
      } catch (e) {}
      canvas.dispose();
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
      const fitScale = containerWidth / baseW;
      const isMobile = (window.innerWidth || 0) <= 768;

      // On phones, keep a minimum scale so the canvas is readable even if it overflows
      // (user can scroll the container). On desktop, just fit to container.
      const minMobileScale = 0.5;
      const scale = Math.min(1, isMobile ? Math.max(fitScale, minMobileScale) : fitScale);

      const cssW = Math.round(baseW * scale);
      const cssH = Math.round(baseH * scale);

      // Keep full internal resolution; only scale the DOM size.
      try {
        canvas.setDimensions({ width: baseW, height: baseH }, { backstoreOnly: true });
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

  function saveCurrentSideDesign() {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    canvas.discardActiveObject?.();

    const json = canvas.toJSON(["isMaskImage", "absolutePositioned"]);

    const cKey = String(cloth || "men");
    const sKey = String(currentSide || "Front").toLowerCase();
    setDesignStore((prev) => {
      const prevCloth = prev && prev[cKey] ? prev[cKey] : { front: null, back: null };
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
    const placement = (cfg.placementBySide && cfg.placementBySide[sKey]) || { x: 0.5, y: 0.52 };

    const inchW = cfg.printAreaInch?.width ?? 16;
    const inchH = cfg.printAreaInch?.height ?? 20;
    const maxW = inchW * PRINT_DPI;
    const maxH = inchH * PRINT_DPI;

    const fitScale = Math.min(
      canvas.width / maxW,
      canvas.height / maxH,
      1
    );
    const margin = typeof cfg.margin === "number" ? cfg.margin : 0.92;
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
    hoverCursor: 'default'
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
  if (!canvas || !json) return Promise.resolve({ ok: false, reason: "missing" });

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

  // Save current side design (per-side persistence)
  if (!opts.skipSave) saveCurrentSideDesign();

  // Update UI state
  setCurrentSide(sideKey);

  const clothKey = String(opts.clothKey || cloth || "men");

  // Prepare next background path
  const nextBgUrl = getBgUrlFor({ clothKey, colorName: selectedColor, sideKey });
  setImageUrl(nextBgUrl);
  // ensure DOM background updates immediately (helps html2canvas captures)
  try {
    if (stageRef.current) {
      stageRef.current.style.backgroundImage = `url('${nextBgUrl}')`;
    }
  } catch (e) {}

  // Clear selection before switching
  try {
    canvas.discardActiveObject();
  } catch (e) {}

  // Load saved design for target side (if any)
  const saved = designStoreRef.current?.[clothKey]?.[String(sideKey).toLowerCase()];

  // Clear everything and rebuild deterministically
  canvas.clear();

  if (switchToken !== sideSwitchTokenRef.current) return;

  // 1) set background
  const bgImg = await setBackgroundImageAsync(canvas, nextBgUrl);

  if (switchToken !== sideSwitchTokenRef.current) return;

  // 2) load saved objects (if any)
  if (saved) {
    const res = await loadFromJSONAsync(canvas, saved);

    if (switchToken !== sideSwitchTokenRef.current) return;

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

  if (switchToken !== sideSwitchTokenRef.current) return;

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
}

function handleImageChange(colorObj) {
  if (mockMode) return;

  const canvas = fabricCanvasRef.current;
  if (!canvas) return;

  canvas.discardActiveObject(); // 🔥 important

  setSelectedColor(colorObj.name);
  const newImageUrl = getBgUrlFor({ clothKey: cloth, colorName: colorObj.name, sideKey: currentSide });
  setImageUrl(newImageUrl);

  setTimeout(() => {
    setCanvasBackground(newImageUrl);

    // 🔥 re-lock border AFTER background change
    lockClipBorder(canvas);

    canvas.requestRenderAll();
  }, 0);
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
      const members = clips
        .filter(Boolean)
        .map((c) => {
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
    setFontFamily(val);
    const obj = selectedObjectRef.current;
    const canvas = fabricCanvasRef.current;
    if (
      obj &&
      canvas &&
      (obj.type === "textbox" || obj.type === "i-text" || obj.type === "text")
    ) {
      const apply = () => {
        obj.set("fontFamily", val);
        canvas.requestRenderAll();
      };
      if (document.fonts && document.fonts.load) {
        document.fonts.load(`16px "${val}"`).then(apply).catch(apply);
      } else {
        apply();
      }
    }
  }

  function addCanvasText() {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    const clipRect = CliprectRef.current;
    const value =
      (textInputRef.current && textInputRef.current.value) || "New Text";
    const ff = fontFamily || "Arial";
    const color = fontColor || "#000000";

    const createText = () => {
      const text = new fabric.Textbox(value, {
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
    textInputRef.current.value = "";
  }

  function handleUpload(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
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
    const cw = canvas.width || (typeof canvas.getWidth === "function" ? canvas.getWidth() : 0);
    const ch = canvas.height || (typeof canvas.getHeight === "function" ? canvas.getHeight() : 0);
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
      bgUrl = extractCssUrl(computed.backgroundImage) || extractCssUrl(stage.style.backgroundImage);
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

  async function captureFullMockupDataUrl() {
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

      try {
        const exportCanvas = await html2canvas(container, {
          backgroundColor: null,
          useCORS: true,
          allowTaint: true,
          logging: false,
          scale: 3,
          width: container.offsetWidth,
          height: container.offsetHeight,
          scrollX: 0,
          scrollY: 0,
        });

        return exportCanvas.toDataURL("image/png");
      } catch (err) {
        // Some environments fail to html2canvas a DOM+canvas when objects are rotated.
        // Fall back to a deterministic composite export.
        console.warn("html2canvas failed; using fallback mockup capture", err);
        return await captureFullMockupFallbackDataUrl({ scale: 3 });
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

    // Persist current side before we start switching
    saveCurrentSideDesign();

    let cancelled = false;
    const results = { Front: null, Back: null };

    try {
      for (const sideKey of ["Front", "Back"]) {
        await handleSideChange(sideKey, { skipSave: true });
        await nextFrame();
        await sleep(60);

        if (token !== previewTokenRef.current) {
          cancelled = true;
          break;
        }

        results[sideKey] = await captureFullMockupDataUrl();
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
        setPreviewImages(results);
      }

      if (token === previewTokenRef.current) {
        setPreviewLoading(false);
      }
    }
  }

  function closePreview() {
    previewTokenRef.current++;
    setPreviewOpen(false);
    setPreviewLoading(false);
    setPreviewError("");
    setPreviewImages({ Front: null, Back: null });
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

  return (
    <div
      className="designerLayout mt-35"
      
    >
      {/* LEFT PANEL */}
      <div
        className="designerLeft"
        style={{
          width: 300,
          padding: 16,
          borderRight: "1px solid #e5e7eb",
          background: "#fff",
        }}
      >
        <div>
          <input
            id="textName"
            ref={textInputRef}
            type="text"
            placeholder="Enter text here"
            style={{ width: 200, height: 5, padding: 16, marginBottom: 10 }}
          />
        </div>
        <div
          style={{
            marginTop: 8,
            display: "flex",
            gap: 8,
            flexDirection: "column",
          }}
        >
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={addCanvasText}
              disabled={mockMode}
              style={{ padding: "8px 12px" }}
            >
              Add Text
            </button>
            <button
              onClick={() =>
                fileInputRef.current && fileInputRef.current.click()
              }
              disabled={mockMode}
              style={{ padding: "8px 12px" }}
            >
              Upload Image
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleUpload}
              style={{ display: "none" }}
            />
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={handleBringToFront}
              disabled={mockMode}
              style={{ padding: "8px 12px" }}
            >
              Bring to Front
            </button>
            <button
              onClick={handleDeleteObject}
              disabled={mockMode}
              style={{
                padding: "8px 12px",
                backgroundColor: "red",
                color: "white",
              }}
            >
              Delete Object
            </button>
            <button
              onClick={() => downloadClipArea()}
              disabled={mockMode}
              style={{ padding: "8px 12px" }}
            >
              Download Clip
            </button>
          </div>
          <div>
            <button
              onClick={() => downloadCanvasWithBackground()}
              disabled={mockMode}
              style={{ padding: "8px 12px" }}
            >
              Download Full Canvas
            </button>
            <button
              onClick={() => openPreviewBothSides()}
              disabled={mockMode}
              style={{ padding: "8px 12px", marginLeft: 8 }}
            >
              Preview Both Sides
            </button>
            <button
              onClick={() => downloadBothSidesZip()}
              disabled={mockMode}
              style={{ padding: "8px 12px", marginLeft: 8 }}
            >
              Download Both Sides ZIP
            </button>
            <button
              onClick={handleMockPrint}
              disabled={mockMode}
              style={{ padding: "8px 12px" }}
            >
              Mock Print
            </button>
          </div>
          <div style={{ marginTop: 20 }}>
            <p
              style={{
                fontSize: "12px",
                fontWeight: "700",
                textTransform: "uppercase",
                letterSpacing: "1px",
                marginBottom: "12px",
                color: "#6b7280",
              }}
            >
              Select Product:{" "}
              <span style={{ color: "#000" }}>{CLOTH_CONFIG[cloth]?.label || cloth}</span>
            </p>

            <select
              disabled={mockMode}
              value={cloth}
              onChange={(e) => handleClothChange(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 8,
                border: "1px solid #e5e7eb",
                background: mockMode ? "#f3f4f6" : "#fff",
                color: "#111827",
                marginBottom: 18,
              }}
            >
              {Object.keys(CLOTH_CONFIG).map((key) => (
                <option key={key} value={key}>
                  {CLOTH_CONFIG[key]?.label || key}
                </option>
              ))}
            </select>

            <p
              style={{
                fontSize: "12px",
                fontWeight: "700",
                textTransform: "uppercase",
                letterSpacing: "1px",
                marginBottom: "12px",
                color: "#6b7280",
              }}
            >
              Select Color:{" "}
              <span style={{ color: "#000" }}>{selectedColor}</span>
            </p>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "30px",
                padding: "10px 10px",
              }}
            >
              {AVAILABLE_COLORS.map((color) => {
                const isActive = selectedColor === color.name;

                return (
                  <button
                    key={color.value}
                    disabled={mockMode}
                    // Calling handleImageChange and any other logic here
                    onClick={() => handleImageChange(color)}
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
                    onMouseUp={(e) => {
                      if (mockMode) return;
                      tweenTo(e.currentTarget, { scale: 1.15 });
                    }}
                    style={{
                      position: "relative",
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      backgroundColor: color.value,
                      cursor: mockMode ? "not-allowed" : "pointer",
                      padding: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",

                      // 1. The main border of the color circle itself
                      // Using a white border when active creates a "gap" effect
                      border: isActive ? "3px solid #fff" : "1px solid #e5e7eb",

                      // 2. The black outline around the white border
                      outline: isActive ? "2px solid #000" : "none",

                      boxShadow: isActive
                        ? "0 4px 12px rgba(0,0,0,0.3)"
                        : "0 2px 4px rgba(0,0,0,0.05)",
                      transition:
                        "border-color 0.2s ease, outline-color 0.2s ease, box-shadow 0.2s ease",
                    }}
                  >
                    {/* Active ring */}
                    <div
                      style={{
                        position: "absolute",
                        inset: -5,
                        borderRadius: "50%",
                        border: "2px solid #000",
                        pointerEvents: "none",
                        opacity: isActive ? 1 : 0,
                        transition: "opacity 0.18s ease",
                      }}
                    />

                    {/* Tooltip */}
                    <span
                      style={{
                        position: "absolute",
                        backgroundColor: "#000",
                        color: "#fff",
                        fontSize: "10px",
                        padding: "2px 8px",
                        borderRadius: "4px",
                        whiteSpace: "nowrap",
                        pointerEvents: "none",
                        zIndex: 10,
                        opacity: hoveredColorName === color.name ? 1 : 0,
                        transform:
                          hoveredColorName === color.name
                            ? "translateY(35px)"
                            : "translateY(10px)",
                        transition: "opacity 0.18s ease, transform 0.18s ease",
                      }}
                    >
                      {color.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {mockMode && (
            <div
              style={{
                marginTop: 8,
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              <div style={{ display: "flex", gap: 8 }}>
                {/* Thumbnail images - replace src paths with your mockup images in public/ */}
                <img
                  src="/cloud.png"
                  alt="mock1"
                  onClick={() => selectMockup("/cloud.png")}
                  style={{
                    width: 80,
                    height: 80,
                    objectFit: "cover",
                    cursor: "pointer",
                    border: "1px solid #ddd",
                  }}
                />
                <img
                  src="/heart-shape.png"
                  alt="mock2"
                  onClick={() => selectMockup("/heart-shape.png")}
                  style={{
                    width: 80,
                    height: 80,
                    objectFit: "cover",
                    cursor: "pointer",
                    border: "1px solid #ddd",
                  }}
                />
                <img
                  src="/Black/Front.jpg"
                  alt="mock3"
                  onClick={() => selectMockup("/Black/Front.jpg")}
                  style={{
                    width: 80,
                    height: 80,
                    objectFit: "cover",
                    cursor: "pointer",
                    border: "1px solid #ddd",
                  }}
                />
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={cancelMockup}
                  style={{ padding: "8px 12px", background: "#ff0000ff" }}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmMockup}
                  style={{
                    padding: "8px 12px",
                    background: "#10b981",
                    color: "#fff",
                  }}
                >
                  Confirm Mockup
                </button>
              </div>
            </div>
          )}

          {showTextControls && (
            <div
              style={{
                width: 250,
                marginTop: 8,
                display: "flex",
                flexDirection: "column",
                gap: 5,
              }}
            >
              <label style={{ fontSize: 15, color: "red", paddingRight: 5 }}>
                Font Color
              </label>
              <input
                type="color"
                value={fontColor}
                style={{ height: 30, width: 250 }}
                onChange={handleColorChange}
              />

              <label style={{ fontSize: 15, color: "red", paddingRight: 5 }}>
                Font Family
              </label>
              <select
                value={fontFamily}
                style={{ height: 30, width: 250, fontSize: 15 }}
                onChange={handleFontFamilyChange}
              >
                <option>Arial</option>
                <option>Georgia</option>
                <option>Times New Roman</option>
                <option>Helvetica</option>
                <option>Comic Sans MS</option>
                <option>Dancing Script</option>
              </select>
            </div>
          )}
        </div>
      </div>

      <div
        ref={containerRef}
        className="designerCanvasArea"
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          overflow: "auto",
        }}
      >
        <div
          ref={stageRef}
          className="designerStage"
          style={{
            backgroundImage: `url('${imageUrl}')`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            backgroundSize: "contain",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <canvas ref={canvasRef} />
        </div>
      </div>

      {/* RIGHT SIDE THUMBNAIL SWITCHER */}
      <div
        className="designerSides"
        style={{
          display: "flex-row",
          gap: "12px",
          padding: "20px",
          justifyContent: "center", // Centers them horizontally
          alignItems: "flex-start", // Prevents vertical stretching
        }}
      >
        {Object.values(SIDE_CONFIG).map((side) => {
          const isActive = currentSide === side.key;
          const thumbsrc = getBgUrlFor({ clothKey: cloth, colorName: selectedColor, sideKey: side.key });

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
              style={{
                position: "relative",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                width: "100px", // Fixed width
                padding: "16px 8px",
                cursor: "pointer",
                border: "none",
                borderRadius: "16px",
                background: isActive ? "#fff" : "#f3f4f6",
                boxShadow: isActive
                  ? "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)"
                  : "inset 0 0 0 1px #e5e7eb",
                transition: "background 0.3s ease",
              }}
            >
              {/* The Selection Ring */}
              <div
                style={{
                  position: "absolute",
                  inset: -2,
                  border: "2px solid #000",
                  borderRadius: "18px",
                  pointerEvents: "none",
                  opacity: isActive ? 1 : 0,
                  transition: "opacity 0.18s ease",
                }}
              />

              <div
                style={{
                  width: 60,
                  height: 60,
                  marginBottom: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <img
                  src={thumbsrc}
                  alt={side.label}
                  style={{
                    maxWidth: "100%",
                    maxHeight: "100%",
                    objectFit: "contain",
                    filter: isActive ? "none" : "grayscale(1) opacity(0.6)",
                  }}
                />
              </div>

              <span
                style={{
                  fontSize: "15px",
                  fontWeight: isActive ? "800" : "600",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  color: isActive ? "#000" : "#9ca3af",
                }}
              >
                {side.label}
              </span>
            </button>
          );
        })}
      </div>

      {previewOpen && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "rgba(0,0,0,0.55)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
          onMouseDown={(e) => {
            // click outside closes
            if (e.target === e.currentTarget) closePreview();
          }}
        >
          <div
            style={{
              width: "min(1240px, 98vw)",
              maxHeight: "min(860px, 94vh)",
              background: "#fff",
              borderRadius: 20,
              overflow: "hidden",
              border: "1px solid rgba(229,231,235,0.9)",
              boxShadow:
                "0 30px 70px rgba(0,0,0,0.35), 0 10px 30px rgba(0,0,0,0.18)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                padding: "14px 16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderBottom: "1px solid #e5e7eb",
              }}
            >
              <div>
                <div style={{ fontSize: 16, fontWeight: 800, color: "#111" }}>
                  Preview
                </div>
                <div style={{ fontSize: 12, color: "#6b7280" }}>
                  {selectedColor} • Front + Back
                </div>
              </div>
              <button
                onClick={closePreview}
                style={{
                  borderRadius: 12,
                  border: "1px solid #e5e7eb",
                  background: "#ff0101ff",
                  cursor: "pointer",
                  fontSize: 18,
                  color: "#fff",
                  lineHeight: "34px",
                }}
                aria-label="Close preview"
              >
                ×
              </button>
            </div>

            <div
              style={{
                padding: 14,
                overflow: "auto",
                background: "#fafafa",
                flex: 1,
              }}
            >
              {previewLoading && (
                <div style={{ color: "#111", fontWeight: 600 }}>
                  Generating preview…
                </div>
              )}
              {!previewLoading && previewError && (
                <div style={{ color: "#b91c1c", fontWeight: 700 }}>
                  {previewError}
                </div>
              )}

              {!previewLoading && !previewError && (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
                    gap: 18,
                  }}
                >
                  {["Front", "Back"].map((sideKey) => (
                    <div
                      key={sideKey}
                      style={{
                        background: "#fff",
                        border: "1px solid #e5e7eb",
                        borderRadius: 16,
                        padding: 14,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          marginBottom: 10,
                        }}
                      >
                        <div style={{ fontWeight: 800, color: "#111" }}>
                          {sideKey}
                        </div>
                      </div>

                      <div
                        style={{
                          borderRadius: 12,
                          overflow: "hidden",
                          border: "1px solid #f3f4f6",
                          background: "#fff",
                          height: "min(58vh, 560px)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {previewImages && previewImages[sideKey] ? (
                          <img
                            src={previewImages[sideKey]}
                            alt={`${sideKey} preview`}
                            style={{
                              width: "100%",
                              height: "100%",
                              display: "block",
                              objectFit: "contain",
                              transform: "scale(2)",
                              transformOrigin: "center",
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              padding: 24,
                              color: "#6b7280",
                              fontWeight: 600,
                            }}
                          >
                            No preview
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div
              style={{
                padding: 14,
                borderTop: "1px solid #e5e7eb",
                display: "flex",
                justifyContent: "flex-end",
                background: "#fff",
              }}
            >
              <button
                onClick={closePreview}
                style={{
                  padding: "10px 14px",
                  borderRadius: 12,
                  border: "1px solid #e5e7eb",
                  background: "#2cac30ff",
                  cursor: "pointer",
                  fontWeight: 700,
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default Designer;
