## Latest changes

- Replaced the harsh Work page fade divider with a clean, non-overlay "More Projects" scroll cue.
- Removed the project-card masking/fade so the lower cards display normally and do not look dark or broken.

# GenuineKiwi Portfolio

React/Vite portfolio for `Genuine_Kiwi`, split into pages, reusable components, data helpers, and an admin dashboard.

## Run locally

```bash
npm install --registry=https://registry.npmjs.org/
npm run dev
```

Open the Vite URL, usually:

```txt
http://localhost:5173
```

## Pages

The project uses hash routes so it works on localhost and static hosting without extra router config.

```txt
#home
#work
#services
#pricing
#contact
#admin
```

## What changed in this version

- Updated the full visual colour scheme to blue / black / white.
- Removed the old purple, green, and pink accent colours from the CSS.
- Work page heading now says **My Work** only.
- Removed the old selected-work carousel description text.
- Carousel images can now be clicked to open an animated image preview.
- Clicking outside the preview or pressing Escape closes it with a return animation.
- Admin login no longer uses Supabase Auth.
- Admin login now uses Discord OAuth directly with `response_type=token`.
- Admin access is locked to these Discord IDs:

```txt
816509777911742486
972599697229365278
```

- Supabase is still supported for portfolio content storage.
- Supabase Storage is now used for project image uploads in Admin > Projects.
- Services page cards are now more compact so the grid no longer looks overly tall or stretched.
- Projects now work as collections/sets, so one build can have multiple images with separate titles and descriptions.
- The admin dashboard still has normal form editors only. No raw JSON editor.
- `react-icons/fa` is used for UI icons.
- The Discord and Roblox icons beside the profile name now open the external profile pages.
- Default public profile links are:

```txt
Discord: https://discord.com/users/816509777911742486
Roblox: https://www.roblox.com/users/1939978392/profile
```

## Local images

The portfolio uses local image files:

```txt
public/assets/brand/genuine-kiwi-profile.png
public/assets/projects/project-1.png
public/assets/projects/project-2.png
public/assets/projects/project-3.png
public/assets/projects/project-4.png
```

The uploaded sunset silhouette image is used as the logo/profile image. The four project images from the Google Sites portfolio are stored locally in `public/assets/projects`, so the carousel and work cards do not hotlink Google.

## Discord OAuth setup

Copy `.env.example` to `.env.local`.

PowerShell:

```powershell
Copy-Item .env.example .env.local
```

Mac/Linux:

```bash
cp .env.example .env.local
```

Use this local setup:

```env
VITE_DISCORD_CLIENT_ID=1522861548023058643
VITE_DISCORD_ADMIN_IDS=816509777911742486,972599697229365278
VITE_DISCORD_AUTH_SCOPES=identify
VITE_DISCORD_RESPONSE_TYPE=token
VITE_DISCORD_API_BASE=https://discord.com/api
VITE_DISCORD_REDIRECT_URI=http://localhost:5173/

VITE_PUBLIC_DISCORD_PROFILE_URL=https://discord.com/users/816509777911742486
VITE_PUBLIC_ROBLOX_PROFILE_URL=https://www.roblox.com/users/1939978392/profile
```

Then restart Vite:

```bash
npm run dev
```

### Discord Developer Portal

Open your Discord app:

```txt
https://discord.com/developers/applications
```

Go to:

```txt
OAuth2 > Redirects
```

Add this exact local redirect URL:

```txt
http://localhost:5173/
```

For production, add your deployed domain too, for example:

```txt
https://your-domain.com/
```

Then update `.env.local` when deploying:

```env
VITE_DISCORD_REDIRECT_URI=https://your-domain.com/
```

## Important Discord OAuth note

This project uses Discord directly in the browser, so it uses:

```txt
response_type=token
```

Do **not** use `response_type=code` in a purely frontend-only React app unless you also add a backend/serverless function to exchange the code with the Discord client secret.

The admin login button generates a secure URL at click time with a `state` value, then Discord redirects back with an access token in the URL fragment. The app checks `/users/@me`, verifies the Discord ID, and then opens the admin dashboard.

## Supabase content storage setup

Supabase is optional. Without Supabase, edits still save locally in that browser.

To sync portfolio edits through Supabase:

1. Create a Supabase project.
2. Copy `.env.example` to `.env.local`.
3. Fill these values:

```env
VITE_SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
VITE_PORTFOLIO_ROW_ID=genuine-kiwi
VITE_SUPABASE_STORAGE_BUCKET=portfolio-images
```

4. Run this in Supabase SQL Editor:

```txt
supabase/schema.sql
```

5. Restart Vite.

If you already ran an older version of the SQL, run `supabase/schema.sql` again. The bottom patch updates the Discord and Roblox profile URLs without resetting the rest of the portfolio content.

The table used is:

```txt
portfolio_content
```

The Storage bucket used for project image uploads is:

```txt
portfolio-images
```

The public portfolio can read that row. The admin page can update it after the Discord ID check in React. Project image uploads go into Supabase Storage and the returned public URL is saved into the project collection.

## Admin editing

Go to:

```txt
/#admin
```

Click **Continue with Discord**. If the logged-in Discord account is not one of the approved IDs, access is blocked.

The dashboard has form editors for:

```txt
Profile
Projects
Pricing
Guidelines
Services
Socials
```

In **Projects**, click **Add project** to create a collection/set. Drag image files into the upload box or click **Upload images**. Each uploaded image gets saved to Supabase Storage, then attached to that project collection. You can edit each image title, URL, Supabase path, and description, and choose which image is the cover.

There is also an **Export backup** button if you need a copy of the current portfolio data as JSON.

## Project structure

```txt
src/
  App.jsx
  components/
    layout/
    ui/
  data/
  hooks/
  lib/
    discordAuth.js
    portfolioApi.js
    socialLinks.js
    storage.js
    supabaseClient.js
  pages/
    HomePage.jsx
    WorkPage.jsx
    ServicesPage.jsx
    PricingPage.jsx
    ContactPage.jsx
    admin/
public/
  assets/
    brand/
      genuine-kiwi-profile.png
    projects/
supabase/
  schema.sql
```

## npm registry fix

If npm tries to use an internal OpenAI registry, run:

```powershell
npm config set registry https://registry.npmjs.org/
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item -Force package-lock.json -ErrorAction SilentlyContinue
npm install --registry=https://registry.npmjs.org/
```

## Brand assets

The Roblox profile buttons use a local SVG asset at:

```txt
the external Roblox logo URL requested by the client
```

This keeps the icon available on localhost/deployments without hotlinking Wikimedia.

## Latest tweak

- Added subtle letter spacing to body copy text across the portfolio so paragraph text matches the more polished spaced-out brand feel.

## Latest UI fixes

- Removed the duplicated Discord/Roblox row on the Contact page.
- Removed the small commission availability pill above the hero name.
- Removed the magnetic wrapper from the two hero CTA buttons so adjacent hover states no longer jump or flicker.


## Latest change

- Discord and Roblox buttons now appear only on the Contact page.
- Home hero/name/profile card and the top navbar no longer show social buttons.
- The Roblox icon uses this exact image URL: `https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Roblox_Logo.svg/960px-Roblox_Logo.svg.png?_=20220929193725`.

## Roblox logo source

The Roblox contact icon explicitly uses this requested URL:

```txt
https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Roblox_Logo.svg/960px-Roblox_Logo.svg.png?_=20220929193725
```

The component also includes a CSS fallback shape so the icon still appears if the image is blocked or slow to load.

## Latest admin panel polish

- Restyled the admin dashboard into a cleaner professional layout.
- Added icon tabs, a modern admin header card, cleaner sync/status chips, and better action button alignment.
- Improved project collection editors, upload dropzones, image rows, form spacing, and responsive scaling.
- Adjusted admin mobile/tablet layouts so controls stack cleanly instead of overlapping or stretching awkwardly.


## Latest services update

- Services feature card now uses a darker blue style.
- Feature text changed to `Stylized builds for Roblox experiences.`
- Removed the feature subtext.
- Service 01 now reads `Roblox Environments` with the updated map/build description.

## Latest services content update

- Service 02 now reads `Build Assets`.
- Service 02 description is now `Structures, props, signage, exterior creations, and scene details.`
- Removed the old `Commission support` service card from default data, local data migration, and the Supabase seed/patch SQL.
- Existing browser/Supabase data is normalised on load so the old Commission support card is filtered out.

## Latest services layout update

- Removed the services stats panel that displayed `3+ Years building`, `Low-mid`, and `Solo`.
- Repositioned the Services page into a cleaner two-column layout: feature card on the left, service cards stacked on the right.
- Adjusted responsive scaling so the Services page stacks cleanly on tablets and mobile.
## Latest update

- Removed the Services page heading subtext from `src/pages/ServicesPage.jsx`.

### Latest services layout tweak

- The large dark-blue services feature box now stretches to the same height as the two service cards on the right.
- Tablet and mobile breakpoints keep the services section compact rather than overly tall.

## Recent changes
- Contact page Discord and Roblox links now render without leading icons.
## Latest UI fixes

- Admin login card now starts near the top of the page instead of sitting low on the screen.
- Work carousel chevrons are centred inside the carousel track.
- Carousel autoplay pauses on hover and includes a manual Pause/Resume button.


## Latest project notes

- Work cards now tilt/move on hover, matching the animated card feel.
- Services feature card now includes the Roblox Studio logo asset at `public/assets/brand/roblox-studio-logo.png`.

## Latest fix

- Added safe overflow and padding to the homepage gradient name so the first letter no longer gets clipped.

## Latest update

- Increased the hero name letter spacing slightly.
- Fixed the `Genuine_Kiwi` underscore so it remains visible without needing text selection/highlighting.

## Latest update

- Hero heading sizing was reduced, the name spacing/underscore rendering was fixed, and page CTA labels now use title case.

### Latest UI tweak

- Added a subtle gradient scroll cue above the Work page project cards so the lower project components peek in and encourage scrolling from the first view.

## Latest visual adjustment

- Replaced the heavy Work page scroll gradient with a softer top fade and a small pulsing blue cue so the lower cards are hinted without a harsh divider line.


## Latest fix

- Normalised the homepage display name before rendering, so an accidental leading underscore from Supabase/localStorage will not show as a second underline.
- Reworked the gradient text renderer so only real underscores in the cleaned name are rendered.
