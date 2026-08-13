# Goa Frame & ID

You are an expert product engineer and frontend designer. Build a complete, production-ready web application for Hacker House Goa 2026: the "HH Goa 2026 Frame & Builder ID Generator."

The app must allow users to upload any photo (JPG, PNG, iPhone HEIC), automatically handle intelligent face-centered cropping, and instantly generate high-resolution, professionally branded social media assets without any login, signup, or manual cropping.

---

### 1. Brand Identity & Visual Language (Source: hhgoa.com)

The visual identity must strictly reflect the official Hacker House Goa 2026 brand:

- **Backgrounds:** Deep forest/emerald green as the dominant background.

- **Typography & Accents:** Bright yellow/gold and hot pink/magenta highlights.

- **Vibe:** Bold, editorial, high-energy builder culture, youthful, slightly irreverent, incorporating Indian/Goan-inspired ornamental motifs and decorative borders.

- **Central Elements:** Prominent "HH Goa 2026" and "Hacker House Goa" wordmarks and campaign framing.

---

### 2. Core Features & Architecture

#### A. Dual Format Selector

Provide an instant toggle between two distinct formats:

1. **Format A — PFP Frame / Overlay:** Square 1:1 composition where the photo is the hero, wrapped in a rich, ornamental HH Goa 2026 frame optimized for X/Twitter profile pictures.

2. **Format B — Builder ID Card:** A shareable event-style card layout displaying:

   - Uploaded Photo

   - User's Name

   - Stack / Role

   - Deterministically/Randomly Generated "Builder Title" (e.g., _THE TERMINAL WIZARD_, _AI-NATIVE BUILDER_, _PIXEL PUSHER_, _PROTOCOL ARCHITECT_, _SERIAL SHIPPER_).

   - HH Goa 2026 badges and ornaments.

#### B. Streamlined User Flow (Zero Friction)

- **Screen 1 (Landing):** High-impact hero section ("FRAME YOURSELF FOR GOA"), live visual preview of a generated card, and primary CTAs: `MAKE MY CARD` and `CREATE A PFP FRAME`. No lengthy marketing copy.

- **Screen 2 (Upload):** Large drag-and-drop zone and tap-to-upload supporting JPG, PNG, and HEIC files. Instantly transitions to preview.

- **Screen 3 (Customize - Format B only):** Minimal inputs for **Name** and **Stack/Role**, plus a button to shuffle/regenerate the dynamic Builder Title.

- **Screen 4 (Result & Export):** Live high-resolution rendering with two primary actions:

  - `DOWNLOAD IMAGE`: Generates and downloads a crisp, high-res PNG file.

  - `SHARE TO X`: Opens the X web intent with a pre-filled viral caption including `#FrameInGoa` (e.g., "Just framed myself for Hacker House Goa 2026 🌴⚡ See you where builders come to ship. #FrameInGoa").

  - Option to switch formats instantly without restarting.

#### C. Optional Feature: Team Frame Capability

- Include a lightweight "ADD TEAMMATE" toggle that allows merging up to 3 photos into a single combined multi-person HH Goa frame without cluttering the single-person flow.

---

### 3. Technical Requirements & Image Processing

- **Tech Stack:** React, TypeScript, Tailwind CSS, Lucide icons, and HTML5 Canvas (`Canvas API` / `OffscreenCanvas`) for pure client-side image composition.

- **Smart Image Handling:**

  - Automatically detect image dimensions (portrait, landscape, square, panoramic).

  - Implement intelligent center-crop / face-aware framing logic using canvas scaling so users never have to crop manually.

  - Handle EXIF orientation and support HEIC image decoding cleanly.

- **Performance:** Fast initial load, zero server-side storage required for user photos (client-side privacy-first generation), and instantaneous canvas rendering.

---

### 4. UI/UX Polish

- Mobile-first responsive layout (optimized for 375px–430px widths as well as tablets and desktops).

- Smooth transitions, subtle micro-interactions, clear empty/loading states ("Building your card..."), and crisp typography.

- Ensure output files look exceptional and professional when shared across social channels.

here's the hacke house goa website for ur context
https://hhgoa.com/

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/97b9f00e-4084-4df5-ab55-4830aa978c84).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
