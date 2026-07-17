"use client";

import Image from "next/image";
import { useState } from "react";

export function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(0);
  const hasMultiple = images.length > 1;

  function previous() {
    setActive((current) => (current === 0 ? images.length - 1 : current - 1));
  }

  function next() {
    setActive((current) => (current + 1) % images.length);
  }

  return <div className="gallery">
    <div className="detail-image">
      {images.map((image, index) => <Image
        key={image}
        className={`gallery-slide ${index === active ? "active" : ""} ${index === 0 ? "model-view" : "product-view"}`}
        src={image}
        alt={index === active ? `${name} — image ${index + 1} of ${images.length}` : ""}
        fill
        priority={index === 0}
        sizes="(max-width: 800px) 100vw, 55vw"
      />)}
      {hasMultiple && <><button className="gallery-arrow previous" type="button" onClick={previous} aria-label="Previous image">←</button><button className="gallery-arrow next" type="button" onClick={next} aria-label="Next image">→</button><span className="gallery-count">{String(active + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}</span></>}
    </div>
    {hasMultiple && <div className="gallery-thumbnails">{images.map((image, index) => <button key={`${image}-${index}`} className={active === index ? "active" : ""} type="button" onClick={() => setActive(index)} aria-label={`Show image ${index + 1}`}><Image src={image} alt="" fill sizes="90px" /></button>)}</div>}
  </div>;
}
