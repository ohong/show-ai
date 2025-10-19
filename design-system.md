# Design System Overview: Technical Neo-brutalism Lite

## Visual Foundation
- Off-white canvas (`#EEEFE9`) with subtle grid overlay
- Blueprint-inspired aesthetic with engineering drawing references
- Color palette: see below

## Typography
- Large serif headings in red for hierarchy
- Clean sans-serif body text
- Small-cap subheadings with generous letter-spacing
- Abundant white space for readability

## Interactive Elements
- Primary buttons: filled red (`#F54E00`), rounded corners, subtle drop-shadows
- Secondary buttons: bordered with optional keyboard-style labels
- Slim top navigation bar with prominent CTA
- Consistent button treatment throughout

## Layout Patterns
- Modular sections separated by grid-derived horizontal rules
- Two-column layouts: text paired with interface screenshots
- Feature cards: line icons with dashed borders
- Extension cards: uniform backgrounds with metadata
- Testimonial mosaics: avatars with bordered quote cards

## Distinctive Details
- Animated corner character for personality
- Team letter on patterned stationery with stamp
- Bold red CTA section above organized dark footer

System balances engineering precision with human warmth through grid structure, restrained palette, and considered embellishments.

## Colour Schemes

We maintain two colour schemes (light and dark) that share a core set of hues. Light mode is the primary palette used publicly, while dark mode appears in-product or when the user toggles themes. Colours marked with an asterisk (*) remain identical between palettes so that accents and shared UI elements feel consistent.

| Name                          | Light mode | Dark mode |
|-------------------------------|------------|-----------|
| Text color (at 90% opacity)   | `#151515`  | `#EEEFE9` |
| Background color              | `#EEEFE9`  | `#151515` |
| Accent                        | `#E5E7E0`  | `#2C2C2C` |
| Dashed divider line           | `#D0D1C9`  | `#4B4B4B` |
| Red*                          | `#F54E00`  |           |
| Yellow                        | `#DC9300`  | `#F1A82C` |
| Blue*                         | `#1D4AFF`  |           |
| Gray*                         | `#BFBFBC`  |           |
| Links                         | Use Red    |           |

The palette deliberately avoids pure white and pure black. Slightly off-white and off-black backgrounds create a softer retro feel, while the primary accents add warmth. When additional shades are needed (for hover states or disabled elements), adjust the opacity of these base colours rather than introducing new hex values.

### Use `opacity` over more colours

Using opacity keeps the system manageable across both colour schemes and reinforces the OS metaphor.

| Paragraph text | `rgba($value, 90%)`                 |
|----------------|-------------------------------------|
| Links          | `rgba($value, 95%)` (and semibold)  |
| Links:hover    | `rgba($value, 100%)` (and semibold) |