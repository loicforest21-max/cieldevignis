// ═══════════════════════════════════════════════════
// ITEM IMG — Game item image with emoji fallback
// ═══════════════════════════════════════════════════
import { useState } from "react";

function ItemImg({ id, size = 28, fallback = "📦", style = {} }) {
  const [err, setErr] = useState(false);
  if (err || !id)
    return (
      <span
        style={{
          fontSize: size * 0.65,
          width: size,
          height: size,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          ...style,
        }}
      >
        {fallback}
      </span>
    );
  return (
    <img
      src={`/images/items/${id}.png`}
      alt=""
      loading="lazy"
      onError={() => setErr(true)}
      style={{
        width: size,
        height: size,
        objectFit: "contain",
        imageRendering: "pixelated",
        flexShrink: 0,
        borderRadius: 3,
        ...style,
      }}
    />
  );
}

export { ItemImg };
