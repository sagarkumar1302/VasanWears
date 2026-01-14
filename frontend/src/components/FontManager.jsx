import React, { useEffect, useState, useRef } from "react";
import fontList from "../fonts/fontList";

const checkFont = async (family) => {
  if (!document.fonts) return false;
  try {
    // Try to load a regular weight glyph to ensure font is ready
    await document.fonts.load(`16px "${family}"`);
    return document.fonts.check(`16px "${family}"`);
  } catch (e) {
    return false;
  }
};

const FontManager = () => {
  const [status, setStatus] = useState(() =>
    fontList.reduce((acc, f) => ({ ...acc, [f.family]: "unknown" }), {})
  );
  const fileInputRef = useRef(null);
  const [uploadingFor, setUploadingFor] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      for (const f of fontList) {
        if (!mounted) return;
        setStatus((s) => ({ ...s, [f.family]: "checking" }));
        const ok = await checkFont(f.family);
        if (!mounted) return;
        setStatus((s) => ({ ...s, [f.family]: ok ? "loaded" : "missing" }));
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const triggerUpload = (family) => {
    setUploadingFor(family);
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const onFileChange = async (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f || !uploadingFor) return;
    const family = uploadingFor;
    const form = new FormData();
    form.append("font", f);
    form.append("family", family);
    try {
      // POST to backend - ensure your backend exposes /api/fonts/upload
      const res = await fetch("/api/fonts/upload", { method: "POST", body: form });
      if (!res.ok) throw new Error("Upload failed");
      alert(`${family} uploaded successfully`);
      // Try to re-check the font after upload (backend should serve it)
      setStatus((s) => ({ ...s, [family]: "checking" }));
      const ok = await checkFont(family);
      setStatus((s) => ({ ...s, [family]: ok ? "loaded" : "missing" }));
    } catch (err) {
      alert(`Upload failed: ${err.message}`);
      setStatus((s) => ({ ...s, [family]: "missing" }));
    } finally {
      setUploadingFor(null);
      e.target.value = "";
    }
  };

  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-3">Font Manager</h3>
      <p className="text-sm mb-4">Shows load status and lets you upload a local font file for a family.</p>
      <input ref={fileInputRef} type="file" accept=".woff,.woff2,.ttf,.otf" style={{ display: "none" }} onChange={onFileChange} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {fontList.map((f) => (
          <div key={f.family} className="border p-3 rounded">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">{f.family}</div>
                <div className="text-xs text-gray-500">Status: {status[f.family]}</div>
              </div>
              <div className="space-x-2">
                <button className="btn btn-sm" onClick={() => triggerUpload(f.family)}>Upload</button>
              </div>
            </div>
            <div className="mt-3 font-preview" style={{ fontFamily: f.family }}>
              The quick brown fox jumps over the lazy dog.
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FontManager;
