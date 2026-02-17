import { Film, Camera, Image, Video } from "lucide-react";

type ArrayFormat = { type: string; quantity: number; description?: string }[];
type ObjectFormat = { reel?: number; stories?: number; photos?: number };

interface DeliverablesDisplayProps {
  deliverables: ArrayFormat | ObjectFormat | unknown;
  size?: "sm" | "md";
}

const TYPE_CONFIG: Record<string, { icon: typeof Film; label: string }> = {
  IG_REEL: { icon: Film, label: "Reel" },
  IG_STORY: { icon: Camera, label: "Stories" },
  TIKTOK: { icon: Video, label: "TikTok" },
  OTHER: { icon: Image, label: "Inne" },
};

export function DeliverableDisplay({ deliverables, size = "sm" }: DeliverablesDisplayProps) {
  const iconSize = size === "sm" ? 14 : 18;
  const textClass = size === "sm" ? "text-xs" : "text-sm";

  // Normalize to a common format
  let items: { icon: typeof Film; label: string; count: number }[] = [];

  if (Array.isArray(deliverables)) {
    // Array format: [{type: "IG_REEL", quantity: 1}, ...]
    items = (deliverables as ArrayFormat).map((d) => {
      const config = TYPE_CONFIG[d.type] || TYPE_CONFIG.OTHER;
      return { icon: config.icon, label: config.label, count: d.quantity };
    });
  } else if (deliverables && typeof deliverables === "object") {
    // Object format: {reel: 1, stories: 3, photos: 2}
    const obj = deliverables as ObjectFormat;
    if (obj.reel && obj.reel > 0) items.push({ icon: Film, label: "Reel", count: obj.reel });
    if (obj.stories && obj.stories > 0) items.push({ icon: Camera, label: "Stories", count: obj.stories });
    if (obj.photos && obj.photos > 0) items.push({ icon: Image, label: "Photos", count: obj.photos });
  }

  if (items.length === 0) return null;

  return (
    <div className="flex items-center gap-3 flex-wrap">
      {items.map((item, i) => (
        <span key={i} className={`flex items-center gap-1 text-gray-600 ${textClass}`}>
          <item.icon size={iconSize} className="text-orange-500" /> {item.count} {item.label}
        </span>
      ))}
    </div>
  );
}
