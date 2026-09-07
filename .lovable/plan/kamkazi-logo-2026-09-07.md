# Kamkazi logo

A simple, pastel brand mark that matches the app's calm sunrise-valley look, used in the sidebar, on mobile, and as the browser tab icon.

## The idea

A soft rounded square with a gentle gradient (mint to lilac to peach, same family as the home illustration) holding a simple white mark: a rising sun/arc over a hill line that also reads as a soft check. Calm, geometric, no gloss, no purple AI glow, legible at 16px.

Two pieces:
- **Mark** — square icon, works alone (sidebar collapsed, tab icon, mobile).
- **Lockup** — the mark next to the word "Kamkazi" in the app's display font, used in the expanded sidebar.

## Where it appears

1. Sidebar (expanded: mark + name; collapsed: mark only)
2. Browser tab icon, replacing the default one
3. Available for later use on a future sign-in screen or share preview

## What changes

- Generate the mark as a transparent PNG at high resolution into `src/assets`.
- Replace the current generic check-circle badge in `src/components/app-shell.tsx` with the new mark, keeping the same size and spacing so nothing else shifts.
- Add a downscaled square copy to `public/favicon.png` and point the tab icon at it in `src/routes/__root.tsx`, removing the old `favicon.ico`.
- No color-token changes; the mark uses the existing pastel palette so light and dark both work.

## Notes

I'll produce one mark first for you to look at. If the direction is off, I can generate two or three alternatives before wiring it in.
