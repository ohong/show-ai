# "Watch and Learn" Design System

## Aesthetic Guidelines: Neo-Brutalism + Technical Wireframe

**Visual Language:**
- Monospaced fonts: JetBrains Mono for data, Space Mono for headings
- Blueprint grid overlay (subtle gray lines, 8px spacing)
- 3D extruded typography for section headers (CSS transform: translateZ)
- Architectural line drawings for agent workflow diagrams

**Layout Principles:**
- Information density over whitespace
- Functional brutalism: no shadows, no gradients, no rounded corners
- Grid-based alignment (everything snaps to 8px grid)
- Typography as structure (headers double as section dividers)

## Colour Palette

We maintain two colour schemes (light and dark) that share a core set of hues. Light mode is the primary palette used publicly, while dark mode appears in-product or when the user toggles themes. Colours marked with an asterisk (*) remain identical between palettes so that accents and shared UI elements feel consistent.

| Name                        | Light mode | Dark mode |
|-----------------------------|------------|-----------|
| Text colour (at 90% opacity) | <span style="color:#151515; font-size: 20px">■</span> `#151515`  | <span style="color:#EEEFE9; font-size: 20px">■</span> `#EEEFE9` |
| Background colour            | <span style="color:#EEEFE9; font-size: 20px">■</span> `#EEEFE9`  | <span style="color:#151515; font-size: 20px">■</span> `#151515` |
| Accent                       | <span style="color:#E5E7E0; font-size: 20px">■</span> `#E5E7E0`  | <span style="color:#2C2C2C; font-size: 20px">■</span> `#2C2C2C` |
| Dashed divider line          | <span style="color:#D0D1C9; font-size: 20px">■</span> `#D0D1C9`  | <span style="color:#4B4B4B; font-size: 20px">■</span> `#4B4B4B` |
| Red*                         | <span style="color:#F54E00; font-size: 20px">■</span> `#F54E00`  |           |
| Yellow                       | <span style="color:#DC9300; font-size: 20px">■</span> `#DC9300`  | <span style="color:#F1A82C; font-size: 20px">■</span> `#F1A82C` |
| Blue*                        | <span style="color:#1D4AFF; font-size: 20px">■</span> `#1D4AFF`  |           |
| Gray*                        | <span style="color:#BFBFBC; font-size: 20px">■</span> `#BFBFBC`  |           |
| Links                        | Use Red    |           |

The palette deliberately avoids pure white and pure black. Slightly off-white and off-black backgrounds create a softer retro feel, while the primary accents add warmth. When additional shades are needed (for hover states or disabled elements), adjust the opacity of these base colours rather than introducing new hex values.

### Use `opacity` over more colours

Using opacity keeps the system manageable across both colour schemes and reinforces the OS metaphor.

| Paragraph text | `rgba($value, 90%)`                 |
|----------------|-------------------------------------|
| Links          | `rgba($value, 95%)` (and semibold)  |
| Links:hover    | `rgba($value, 100%)` (and semibold) |