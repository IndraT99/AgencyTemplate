import type { CSSProperties } from 'react';
import { computeCropLayout } from '../lib/crop';

interface CropBoxProps {
  crop: string;
  alt?: string;
  className?: string;
}

export function CropBox({ crop, alt = '', className = '' }: CropBoxProps) {
  const layout = computeCropLayout(crop);

  return (
    <div className={`crop ${className}`.trim()} data-crop={crop}>
      <div
        className="cell"
        style={{ '--ar': layout.aspectRatio } as CSSProperties}
      >
        <img
          src={layout.url}
          alt={alt}
          loading="lazy"
          decoding="async"
          style={{
            width: `${layout.widthPct}%`,
            height: `${layout.heightPct}%`,
            left: `${layout.leftPct}%`,
            top: `${layout.topPct}%`,
          }}
        />
      </div>
    </div>
  );
}
