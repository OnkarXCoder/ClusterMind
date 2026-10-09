import { useEffect, useRef, useState } from "react";
import { ImagePlus, Check, RotateCcw, Upload, ImageOff } from "lucide-react";
import Sidebar from "../../components/Sidebar/Sidebar";
import Navbar from "../../components/Navbar/Navbar";
import {
  getProducts,
  getUploadedImage,
  setProductImage,
  resetProductImage,
} from "../../services/products";
import "./ProductImages.css";

const readFileAsImage = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = reader.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const compressImage = (img, maxSize = 900) => {
  const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(img.width * scale);
  canvas.height = Math.round(img.height * scale);
  canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.85);
};

export default function ProductImages() {
  const [products, setProducts] = useState([]);
  const [pending, setPending] = useState({});
  const [message, setMessage] = useState("");
  const inputRefs = useRef({});

  const refresh = () => {
    getProducts().then(setProducts);
  };

  useEffect(() => {
    let active = true;

    getProducts().then((list) => {
      if (active) setProducts(list);
    });

    return () => {
      active = false;
    };
  }, []);

  const showMessage = (text) => {
    setMessage(text);
    window.clearTimeout(showMessage._t);
    showMessage._t = window.setTimeout(() => setMessage(""), 2500);
  };

  const handlePick = (id) => inputRefs.current[id]?.click();

  const handleFile = async (id, file) => {
    if (!file || !file.type.startsWith("image/")) {
      showMessage("Please choose an image file.");
      return;
    }
    try {
      const img = await readFileAsImage(file);
      const dataUrl = compressImage(img);
      setPending((prev) => ({ ...prev, [id]: dataUrl }));
    } catch {
      showMessage("Could not read that image.");
    }
  };

  const handleSave = (id) => {
    const dataUrl = pending[id];
    if (!dataUrl) return;
    setProductImage(id, dataUrl);
    setPending((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    refresh();
    showMessage("Image saved.");
  };

  const handleReset = (id) => {
    resetProductImage(id);
    setPending((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    refresh();
    showMessage("Default image restored.");
  };

  const handleCancel = (id) =>
    setPending((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });

  return (
    <>
      <Sidebar />

      <div style={{ marginLeft: "260px" }}>
        <Navbar />

        <div className="pi-page">
          <div className="pi-head">
            <h1>
              <ImagePlus size={26} color="#4F46E5" />
              Product Images
              <span className="pi-count">{products.length}</span>
            </h1>
            <p>Upload a custom image for any product. It applies instantly across the store.</p>
          </div>

          {message && <div className="pi-toast">{message}</div>}

          <div className="pi-grid">
            {products.map((p) => {
              const isCustom = !!getUploadedImage(p.id);
              const isPending = !!pending[p.id];
              const display = pending[p.id] || p.image;

              return (
                <div className={`pi-card ${isPending ? "pending" : ""}`} key={p.id}>
                  <div className="pi-preview">
                    {display ? (
                      <img src={display} alt={p.name} />
                    ) : (
                      <div className="pi-noimg">
                        <ImageOff size={28} color="#9CA3AF" />
                      </div>
                    )}
                    {isCustom && <span className="pi-badge">Custom</span>}
                  </div>

                  <div className="pi-info">
                    <h3>{p.name}</h3>
                    <p>
                      {p.brand} · {p.category}
                    </p>
                  </div>

                  <input
                    ref={(el) => (inputRefs.current[p.id] = el)}
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(e) => {
                      handleFile(p.id, e.target.files[0]);
                      e.target.value = "";
                    }}
                  />

                  {isPending ? (
                    <div className="pi-actions">
                      <button className="pi-save" onClick={() => handleSave(p.id)}>
                        <Check size={16} /> Save
                      </button>
                      <button className="pi-cancel" onClick={() => handleCancel(p.id)}>
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="pi-actions">
                      <button className="pi-upload" onClick={() => handlePick(p.id)}>
                        <Upload size={16} /> Upload Image
                      </button>
                      {isCustom && (
                        <button className="pi-reset" onClick={() => handleReset(p.id)}>
                          <RotateCcw size={15} />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
