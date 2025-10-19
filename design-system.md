# Retro-OS-Style Website Design System (Oct 2025)

This website stands out because it deliberately looks and behaves like a desktop operating system rather than a conventional site. Below is a summary of the design system that supports this aesthetic, based on publicly available brand assets and engineering documentation as of Oct 2025.

## Colour Palette

The system uses two colour schemes (light and dark) built from the same base colours. Light mode is the primary palette used on the public site, and dark mode appears in the product or when the user toggles the theme. Colours marked with an asterisk (*) remain the same across both palettes. Documentation recommends modifying opacity rather than introducing additional colours so the palette remains simple.

The palette deliberately avoids pure white and pure black. Instead, slightly off-white and off-black backgrounds give a softer, retro feel. When additional shades are needed (e.g., hover states or disabled buttons), adjust the opacity of these base colours rather than creating entirely new hex values.

## Typography

The site uses Matter SQ, a geometric sans-serif typeface from Displaay. The "SQ" stands for square dots, giving the typeface a distinctive pixel-like flavour that complements the OS theme. Designers use the variable font version on the web so they can specify custom weights. For example, paragraph text uses a custom weight of 475, lighter than Matter Medium (570) but heavier than Matter Regular (430).

For headings and interface labels, the design uses Matter Bold or SemiBold. Desktop design mocks employ four cuts of Matter SQ:

### Secondary Typefaces

**Squeak** – a playful display font used in hedgehog illustrations and informal settings. Use the bold variant for headlines and always uppercase; letter spacing –2% and line height ~100%.

**Loud Noises** – used only for quotes in hedgehog artwork and always uppercase.

## Layout & Structure

**Desktop OS metaphor:** The site runs inside a desktop-style environment where each page opens in a draggable, resizable window. It uses Gatsby and a custom windowing system built with React. A central App Provider manages global state; each page is rendered inside an AppWindow component on a virtual desktop.

**Window mechanics:** Individual windows use Framer Motion for drag/resizing animations. Users can drag windows around, resize them, snap them to edges, minimize to a taskbar and bring them to the front. Window controls (close, minimize, maximize) resemble vintage OS chrome but use the brand colours.

**Experience modes:** The site supports two modes – full OS (full desktop OS experience) and boring (traditional website navigation used on mobile or when toggled).

**Navigation:** A top bar (similar to a system menu) provides access to Product OS, Pricing, Docs, Community, Company and a "More" drop-down. Iconic shortcuts appear along the left and right edges; these icons link to subpages (e.g., Home, Customers, Docs, Pricing). They look like retro folder or application icons with pastel backgrounds.

**Wallpaper:** The desktop background is a speckled beige pattern (#EEEFE9), often featuring whimsical hedgehog illustrations that animate or react to user interactions. Users can cycle wallpapers with a keyboard shortcut (| key).

**Taskbar & windows:** Each window has a drop shadow and a thin 1px border. Corner radii are subtle (≈8px) to evoke mid-90s OS windows. Resizable windows have handles in each corner. The taskbar at the bottom shows minimized windows as small icons with names; clicking brings them back to the front.

## Interaction & Animation

**Framer Motion:** Animations rely on Framer Motion; windows have entrance and exit animations (e.g., fading in and scaling slightly) and animated drag/resizing.

**Hover states:** Buttons use clear hover styles. The default OSButton variant has a transparent background and a subtle border; on hover the border becomes more prominent or the background fills with a light tint. Primary buttons use the brand red (#F54E00) background with black text and slightly darker red on hover. Secondary buttons have a white background with red text.

**Focus & snapping:** Click actions bring windows to the front (raising z-index). Dragging near the screen edges triggers snapping; windows snap neatly to the edges.

**Keyboard shortcuts:** Many interactions are accessible via keyboard: `/` or `Cmd + K` opens global search; `?` opens chat; `,` toggles display options; toggles dark/light mode; `|` cycles wallpapers; `Shift + W` closes the focused window; `Shift + Arrow keys` snap windows. These features reinforce the OS metaphor.

## Iconography & Illustrations

**Hedgehog illustrations:** Hedgehog characters appear as playful drawings in many states: reading, typing, debugging, etc. A library of approved hedgehog artwork exists in Figma. Use these illustrations to add personality to pages, but avoid generic AI art.

**OS icons:** Desktop icons use simple shapes and pastel backgrounds to evoke classic computer apps (folders, trash, docs). Icons are consistent in size (≈64px square). Each icon can open a window or link when clicked.

## Components & Patterns

**Buttons:** The `<OSButton>` component supports multiple variants (default, primary, secondary, underline) and sizes (XS – XL). Hover and active states show either a stronger border or a coloured background. Icon-only buttons include variants for primary, secondary and default backgrounds. Chips and badges can be appended to buttons to show statuses (e.g., "Beta" or "Hot"). Buttons can include optional icons on the left or right.

**Cards & panels:** Content often sits within cards that use the accent colour (#E5E7E0 light mode) with a thin dashed border (#D0D1C9). Cards have generous padding and subtle drop shadows.

**Divider lines:** Light grey dashed lines separate sections and lists.

**Modals & prompts:** Modals appear as smaller windows with a darker overlay behind them. They include large header icons (often hedgehogs) and primary/secondary buttons.

**Typography mix:** Headings are bold and utilitarian while paragraphs are comfortable to read thanks to generous line height. Use semibold for links within paragraphs to differentiate them from body text.

## Design Principles

**Different by design:** The design team believes design can be a differentiator. They intentionally break conventions to stand out, creating a playful yet functional experience. Don't be afraid to take risks and avoid generic templates.

**Retro OS aesthetic:** The website feels like a vintage operating system. This includes draggable windows, a speckled wallpaper, pixel-style icons, and a top bar reminiscent of Mac OS or Windows 95. Use this metaphor consistently.

**Clarity through simplicity:** Despite the playful visuals, information is clear. Use high contrast between text and background (90% opacity), generous spacing and simple layouts. Avoid unnecessary colours; adjust opacity instead.

**Interactivity as delight:** Hover effects, dragging, snapping and keyboard shortcuts make exploration fun. Animations are smooth but purposeful; they help users understand what is happening rather than distract them. Tools like Framer Motion facilitate these interactions.

**Consistency:** The same typeface, colour palette and icon style appear across the site and product, ensuring a coherent brand experience. Even hedgehog illustrations follow guidelines about fonts and contexts.

**Responsiveness & accessibility:** On mobile screens, the site can switch to a traditional "boring" mode for ease of navigation. Buttons have high contrast states, and keyboard shortcuts provide alternative navigation options.

## Summary

This retro OS-themed site combines a distinctive nostalgia with a carefully curated modern design system. Warm neutral backgrounds, a limited palette with bright red, yellow and blue accents, the Matter SQ typeface and playful hedgehog illustrations all contribute to its unique personality. The interface is built on a windowing system that encourages exploration through dragging and snapping windows, hover animations and keyboard shortcuts. By following the colour, typography and interaction guidelines above, you can approximate this aesthetic in your own projects while still leaving room for creative twists.
