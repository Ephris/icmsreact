---
name: Theme Switcher and QR Code Implementation
overview: Implement theme switcher (light/dark/system) and QR code functionality across welcome.tsx, help pages, and login page. Add theme switcher to both header and footer areas, and add QR code to all footers that links to the home page.
todos: []
---

# Theme Switcher and QR Code Implementation

## Overview

Add theme switcher (light/dark/system) and QR code display to welcome.tsx, help pages, and login page. The theme switcher will appear in both header and footer, and QR codes will be added to all footers linking to the home page URL.

## Implementation Tasks

### 1. Install QR Code Library

**File**: `package.json`

- Install `qrcode.react` package: `npm install qrcode.react`
- This library provides a React component for generating QR codes

### 2. Create QR Code Component

**File**: `resources/js/components/qr-code-display.tsx` (new)

- Create a reusable QR code component that:
- Generates QR code for the home page URL using `qrcode.react`
- Accepts size, error correction level, and styling props
- Handles URL construction (use `route('welcome')` or window.location.origin)
- Includes a label "Scan to access ICMS"
- Works in both light and dark modes

### 3. Add Theme Switcher to Welcome Page

**File**: `resources/js/pages/welcome.tsx`

- Import `AppearanceToggleTab` from `@/components/appearance-tabs`
- Add theme switcher to header/navigation area:
- Position in top-right corner or within navigation bar
- Make it visible but not intrusive
- Add theme switcher to footer:
- Add in footer section (around line 2622-2650)
- Position it appropriately in the footer grid
- Ensure both switchers are properly styled and responsive

### 4. Add Theme Switcher to Help Pages

**Files**:

- `resources/js/pages/help/overview.tsx`
- `resources/js/pages/help/contact.tsx`
- `resources/js/pages/help/rules.tsx`
- Import `AppearanceToggleTab` component
- Add theme switcher to header area (if they have one) or create a fixed position switcher
- Add theme switcher to footer (if footers exist, otherwise create footer sections)
- Ensure consistent styling across all help pages

### 5. Add Theme Switcher to Login Page

**File**: `resources/js/pages/auth/login.tsx`

- Import `AppearanceToggleTab` component
- Add theme switcher to header area (top-right corner)
- Add theme switcher near bottom of login card or in a footer area
- Position it so it doesn't interfere with login form

### 6. Add QR Code to Welcome Page Footer

**File**: `resources/js/pages/welcome.tsx`

- Import the QR code component
- Add QR code section in footer (around line 2622)
- Position it in one of the footer grid columns
- Include text "Scan QR code to access ICMS" with proper styling
- Use home page URL: `route('welcome')` or `window.location.origin`

### 7. Add QR Code to Help Pages Footers

**Files**:

- `resources/js/pages/help/overview.tsx`
- `resources/js/pages/help/contact.tsx`
- `resources/js/pages/help/rules.tsx`
- Check if these pages have footers
- If not, create footer sections at the bottom of each page
- Add QR code component to footer with same styling as welcome page
- Ensure consistent footer structure across all help pages

### 8. Add QR Code to Login Page

**File**: `resources/js/pages/auth/login.tsx`

- Add QR code component below login form or in a footer area
- Position it so it's visible but doesn't interfere with login flow
- Include explanatory text
- Use smaller size if space is limited

### 9. Style Consistency

- Ensure theme switcher appears consistently across all pages
- Use similar positioning and styling
- Make QR codes responsive and properly sized for mobile/desktop
- Ensure QR codes work well in both light and dark themes
- Add hover effects and transitions where appropriate

### 10. Test and Verify

- Test theme switching works on all pages
- Verify QR codes are scannable and link to correct URL
- Test responsive behavior on mobile devices
- Verify dark mode styling for QR codes
- Ensure no layout issues or overlapping elements

## Technical Notes

- Use `route('welcome')` from ziggy-js to get the home page URL for QR codes
- Theme switcher uses existing `useAppearance` hook from `@/hooks/use-appearance`
- QR code component should handle SSR (server-side rendering) gracefully
- Consider adding loading states for QR code