# Iterative System — Old / New
*Phase 5: Implement · slide layout: **Old Design | New Design | Change Made***

Each entry below is written as the **"Change Made"** column copy (same voice as the landing-page
row), with the Nielsen heuristic noted underneath for reference.

---

### 1. Landing page
**Change Made:** The first design of the high-fidelity prototype does not contain a landing page.
Users are greeted with the login page straight away, so new users have no context for what the
system is about. The new version adds a dedicated landing page that introduces the platform, its
three user types, and a live demo before any sign-in is required.
*Heuristic: #2 Match between system & real world · #10 Help & documentation.*

### 2. Light & dark mode
**Change Made:** The original prototype only supported a single light theme — dark colours existed
in the code but there was no way to switch to them, and the values were unrefined. The new version
introduces a fully designed dark mode alongside light, with a toggle in the sidebar and on the login
screen; the choice is remembered and applied instantly with no flash on reload.
*Heuristic: #3 User control & freedom · #7 Flexibility & efficiency of use.*

### 3. Brand colour
**Change Made:** The first design used a muted, desaturated blue as its primary colour, which felt
generic and gave the product a weak identity. The new version adopts Trust Indigo (#4F46E5) as the
primary, supported by slate and clear success / warning / error colours, so every colour now carries
a consistent meaning.
*Heuristic: #8 Aesthetic & minimalist design.*

### 4. Reusable component system
**Change Made:** In the original prototype each screen styled its own buttons, inputs and cards, so
the same element could look and behave differently from page to page. The new version is built on a
single component library and a dedicated design-system page, making every button, input, badge and
card consistent and their states documented in one place.
*Heuristic: #4 Consistency & standards · #5 Error prevention.*

### 5. Motion & micro-interactions
**Change Made:** The first design rendered each screen instantly with no transitions, so the
interface felt static and gave little feedback. The new version adds purposeful motion — content
eases in, key numbers count up, progress bars grow, and cards lift on hover — while respecting users
who prefer reduced motion.
*Heuristic: #1 Visibility of system status.*

### 6. Data-visualisation colours
**Change Made:** In the original design the charts used fixed, hard-coded colours and white tooltips,
which looked broken on anything but a plain white background. The new version drives all chart
colours from the design tokens, so the radar, bars and tooltips stay correct and readable in both
light and dark mode.
*Heuristic: #4 Consistency & standards · #8 Aesthetic & minimalist design.*

### 7. Typography
**Change Made:** The first prototype relied on the browser's default font with no defined type
scale, so headings and body text lacked a clear hierarchy. The new version uses Inter for the
interface and JetBrains Mono for scores and data on a defined scale (30 / 24 / 18 / 14 / 12), making
hierarchy obvious and numbers easy to scan.
*Heuristic: #4 Consistency & standards · #8 Aesthetic & minimalist design.*

### 8. Navigation active state
**Change Made:** In the original sidebar the current page was shown only by a faint background tint,
making it hard to tell where you were. The new version marks the active item with an indigo accent
bar, a tinted highlight and a coloured icon, so the user's location is clear at a glance.
*Heuristic: #1 Visibility of system status.*

### 9. Authentication screens
**Change Made:** The original login and sign-up screens were plain cards on a flat background, and a
tester needed real credentials to get in. The new version gives the auth screens a branded backdrop
and adds one-click demo accounts for Student and Recruiter, so anyone can enter the system instantly.
*Heuristic: #6 Recognition rather than recall · #5 Error prevention.*

### 10. Input icon / text overlap
**Change Made:** In the original forms the icon inside certain fields — the GitHub-link field and the
password fields — overlapped the text, because a shared style overrode the space reserved for the
icon. The new version reserves room for each field's icon, so the icon and text no longer collide.
*Heuristic: #5 Error prevention · #8 Aesthetic & minimalist design.*

### 11. Consistent page headers
**Change Made:** Each screen in the first design titled itself differently, with varying sizes,
weights and spacing. The new version applies one standard page-header pattern — an eyebrow label,
icon, title and description — to every screen for a predictable layout.
*Heuristic: #4 Consistency & standards.*

### 12. Theme-adaptive avatars & status colours
**Change Made:** The original avatars and status chips used fixed light-mode tints that washed out
and became hard to read on darker surfaces. The new version derives these colours from the design
tokens, so initials and status badges stay legible in both light and dark mode.
*Heuristic: #4 Consistency & standards · accessibility.*

---

### One-line summary
> We took a flat, single-theme prototype and iterated it into a themeable design system — **adding** a
> landing page, dark mode, a component library, motion and theme-aware charts, and **adjusting** the
> brand colour, typography, navigation, auth and input behaviour — each change traceable to a
> usability heuristic.
