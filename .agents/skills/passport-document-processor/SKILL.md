---
name: passport-document-processor
description: |
  Specialized skill for high-fidelity cropping, rotation, deskewing, and professional formatting of scanned official identity documents and passport booklets (especially Indian Passports).
  Activate when:
  - Cropping flatbed scanner glass borders or backgrounds from passport scans
  - Correcting inverted, sideways, or 90/270-degree rotated passport bio pages or address pages
  - Generating print-ready A4 or tight-cropped official PDF submissions
  - Extracting the standard 2-page Front & Back (Bio Page + Address Page) document for visa or embassy applications
  - Preserving 100% 300 DPI scan resolution without compression artifacts
---

# Passport & Official Document Processing Skill

Use this skill when processing raw flatbed scans of identity documents, booklet passports, or visa records to produce professional, audit-ready PDF documents without quality loss.

---

## 1. Resolution & Quality Invariants

- **Original Resolution**: Always extract embedded images at full scanner resolution (typically 300 DPI, 2480x3508 px for A4). Never downsample to 72 or 150 DPI.
- **Encoding Quality**: When re-encoding cropped sections into PDF, use JPEG quality 95–98 (or lossless PNG / Deflate) with `dpi=(300, 300)` and `optimize=True`. This guarantees microprinting, guilloche security patterns, signatures, photos, and Machine-Readable Zones (MRZ) remain razor-sharp.
- **Aspect Ratio**: Maintain exact pixel aspect ratios. Never stretch or distort official documents.

---

## 2. Indian Passport Layout & Orientation Geometry

A standard 36-page Indian passport is bound along the 125 mm edge. When scanned spread-by-spread:

| Spread / Page | Content | Physical Placement | Required Transformation |
|---|---|---|---|
| **Spread 1** (p. 1) | Inside Front Cover + Title & Emblem | Landscape spread, vertical spine | **0°** (Upright) |
| **Spread 2** (p. 2) | Page 2 (Bio Page) + Page 3 (Visa) | MRZ along 125 mm edge | **Rotate 270° CW** (90° CCW) so Bio page is upright at bottom with horizontal MRZ |
| **Spreads 3–17** (pp. 3–17) | Visa Pages 4 through 33 | Perforation at top, vertical spine | **0°** (Upright booklet spread) |
| **Spread 18** (p. 18) | Page 34 (Visa) + Page 35 (Address Page) | Address printed along 125 mm edge | **Rotate 90° CW** so Address page is upright at bottom |
| **Spread 19** (p. 19) | Page 36 (Observations) + Inside Back Cover | Landscape spread, vertical spine | **0°** (Upright) |

---

## 3. High-Precision Booklet Edge Detection Pattern

To remove the flatbed scanner glass bed and lid shadows without clipping rounded page corners:

```python
import cv2
import numpy as np

def detect_booklet_bbox(img_bgr):
    """Detects open booklet bounding box on flatbed scanner glass."""
    h_orig, w_orig = img_bgr.shape[:2]
    # Downscale for robust morphological operations
    small = cv2.resize(img_bgr, (620, 877))
    gray = cv2.cvtColor(small, cv2.COLOR_BGR2GRAY)
    
    # Morphological gradient to isolate physical paper borders
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (5, 5))
    grad = cv2.morphologyEx(gray, cv2.MORPH_GRADIENT, kernel)
    
    # Mask out scanner platen extreme margins
    grad[:12, :] = 0
    grad[:, :12] = 0
    grad[:, -12:] = 0
    grad[530:, :] = 0
    
    _, thresh = cv2.threshold(grad, 12, 255, cv2.THRESH_BINARY)
    closed = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_RECT, (11, 11)))
    
    cnts, _ = cv2.findContours(closed, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    valid_cnts = [c for c in cnts if cv2.contourArea(c) > 2000 and cv2.boundingRect(c)[1] < 500]
    
    if not valid_cnts:
        return 0, 0, w_orig, int(h_orig * 0.55)
        
    all_pts = np.vstack(valid_cnts)
    x, y, w, h = cv2.boundingRect(all_pts)
    
    # Safety margin: ~16px in full res to preserve rounded corners and binding
    x = max(0, x - 4)
    y = max(0, y - 4)
    w = min(620 - x, w + 8)
    h = min(530 - y, h + 8)
    
    scale_x = w_orig / 620.0
    scale_y = h_orig / 877.0
    return int(x * scale_x), int(y * scale_y), int(w * scale_x), int(h * scale_y)
```

---

## 4. Standard Professional Output Suite

When processing passport scans, always deliver the following three outputs:

1. **`Passport_Professional_Cropped.pdf`**:
   - Each page size matches the tight bounding box of the cropped booklet.
   - Screen-filling view, zero scanner bed waste.
2. **`Passport_Professional_A4.pdf`**:
   - Each cropped booklet spread is centered cleanly on standard A4 paper with uniform white borders (36 pt / ~12 mm margins).
   - Ready for official printing without printer clipping.
3. **`Passport_Front_and_Back.pdf`**:
   - A concise 2-page PDF containing exclusively the upright Bio spread (Page 2) and Address spread (Page 35).
   - File size maintained under 2 MB for universal visa/portal compatibility with `dpi=(300, 300)`.
