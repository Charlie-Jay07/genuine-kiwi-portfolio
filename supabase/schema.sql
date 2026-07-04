-- GenuineKiwi portfolio Supabase content storage setup
-- Run this in Supabase SQL Editor.
-- Discord admin login is handled directly in the React app, not by Supabase Auth.
-- This schema allows the portfolio row to be read and updated with the anon key.
-- For a higher-security production setup, move writes behind a server/API that verifies the Discord token server-side.

create table if not exists public.portfolio_content (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.portfolio_content enable row level security;

drop policy if exists "portfolio_content_public_read" on public.portfolio_content;
drop policy if exists "portfolio_content_public_insert" on public.portfolio_content;
drop policy if exists "portfolio_content_public_update" on public.portfolio_content;
drop policy if exists "portfolio_content_public_delete" on public.portfolio_content;

drop policy if exists "portfolio_content_admin_insert" on public.portfolio_content;
drop policy if exists "portfolio_content_admin_update" on public.portfolio_content;
drop policy if exists "portfolio_content_admin_delete" on public.portfolio_content;

create policy "portfolio_content_public_read"
on public.portfolio_content
for select
using (id = 'genuine-kiwi');

create policy "portfolio_content_public_insert"
on public.portfolio_content
for insert
with check (id = 'genuine-kiwi');

create policy "portfolio_content_public_update"
on public.portfolio_content
for update
using (id = 'genuine-kiwi')
with check (id = 'genuine-kiwi');

create policy "portfolio_content_public_delete"
on public.portfolio_content
for delete
using (false);

insert into public.portfolio_content (id, data)
values (
  'genuine-kiwi',
  '{
    "profile": {
      "brand": "GenuineKiwi",
      "displayName": "Genuine_Kiwi",
      "role": "Roblox Builder",
      "headline": "Low-mid poly Roblox builds with clean shape language and fast turnaround.",
      "about": "Genuine_Kiwi is a Roblox builder focused on low-mid poly environments, props, and showcase-ready builds. With 3+ years of building experience, the portfolio highlights compact commissions, detailed briefs, and efficient delivery.",
      "discord": "@genuine_kiwi",
      "discordProfileUrl": "https://discord.com/users/816509777911742486",
      "robloxUsername": "Genuine_Kiwi",
      "robloxProfileUrl": "https://www.roblox.com/users/1939978392/profile",
      "location": "Roblox Studio",
      "availability": "Short-mid term commissions",
      "logoImage": "/assets/brand/genuine-kiwi-profile.png",
      "avatarImage": "/assets/brand/genuine-kiwi-profile.png",
      "heroImage": "/assets/brand/genuine-kiwi-profile.png"
    },
    "stats": [
      { "id": "stat-1", "value": "3+", "label": "Years building" },
      { "id": "stat-2", "value": "Low-mid", "label": "Poly style" },
      { "id": "stat-3", "value": "Solo", "label": "Commission workflow" }
    ],
    "services": [
      { "id": "service-1", "title": "Roblox Environments", "description": "Maps, standard buildings, exterior & interior scenes, lobbies, themed builds, and other designed areas." },
      { "id": "service-2", "title": "Build Assets", "description": "Structures, props, signage, exterior creations, and scene details." }
    ],
    "guidelines": [
      { "id": "guide-1", "text": "Short to mid-term commissions are preferred. Larger work can be discussed first." },
      { "id": "guide-2", "text": "Good references and a clear written brief are needed before building starts." },
      { "id": "guide-3", "text": "Quality work takes priority, so rushed deadlines may be declined." },
      { "id": "guide-4", "text": "Work is completed solo unless agreed otherwise." },
      { "id": "guide-5", "text": "A partial or full upfront payment may be required before work begins." }
    ],
    "pricing": [
      { "id": "price-1", "name": "Robux minimum", "amount": "1,000 Robux", "note": "Client covers Roblox tax where needed." },
      { "id": "price-2", "name": "PayPal minimum", "amount": "$10.00", "note": "Client covers PayPal fees where needed." }
    ],
    "projects": [
      { "id": "project-1", "title": "Aqua Shopfront", "category": "Commercial build", "image": "/assets/projects/project-1.png", "description": "Bright low-poly storefront with readable signage, simple access rails, and clean glass-front presentation." },
      { "id": "project-2", "title": "Stylised House", "category": "Residential build", "image": "/assets/projects/project-2.png", "description": "Compact house model using saturated roof colour, warm windows, and intentionally blocky stylisation." },
      { "id": "project-3", "title": "Modern Home", "category": "Architecture", "image": "/assets/projects/project-3.png", "description": "Contemporary exterior with garage frontage, wide windows, and a simple material mix." },
      { "id": "project-4", "title": "United Nations Scene", "category": "Environment", "image": "/assets/projects/project-4.png", "description": "Outdoor scene with flag display, forest backdrop, and large readable lettering." }
    ],
    "socials": [
      { "id": "social-1", "label": "Discord", "value": "@genuine_kiwi", "href": "https://discord.com/users/816509777911742486" },
      { "id": "social-2", "label": "Roblox", "value": "Genuine_Kiwi", "href": "https://www.roblox.com/users/1939978392/profile" }
    ]
  }'::jsonb
)
on conflict (id) do nothing;

-- Patch existing rows created by older versions so the public profile icons become clickable
-- without resetting the rest of the portfolio content.
update public.portfolio_content
set data = jsonb_set(
  jsonb_set(
    jsonb_set(
      jsonb_set(
        jsonb_set(
          jsonb_set(data, '{profile,discordProfileUrl}', '"https://discord.com/users/816509777911742486"'::jsonb, true),
          '{profile,robloxUsername}', '"Genuine_Kiwi"'::jsonb, true
        ),
        '{profile,robloxProfileUrl}', '"https://www.roblox.com/users/1939978392/profile"'::jsonb, true
      ),
      '{socials,0,href}', '"https://discord.com/users/816509777911742486"'::jsonb, true
    ),
    '{socials,1,value}', '"Genuine_Kiwi"'::jsonb, true
  ),
  '{socials,1,href}', '"https://www.roblox.com/users/1939978392/profile"'::jsonb, true
)
where id = 'genuine-kiwi';


-- Patch Services copy and remove the old Commission support service without resetting other portfolio sections.
update public.portfolio_content
set data = jsonb_set(
  data,
  '{services}',
  '[
    { "id": "service-1", "title": "Roblox Environments", "description": "Maps, standard buildings, exterior & interior scenes, lobbies, themed builds, and other designed areas." },
    { "id": "service-2", "title": "Build Assets", "description": "Structures, props, signage, exterior creations, and scene details." }
  ]'::jsonb,
  true
)
where id = 'genuine-kiwi';

-- Portfolio image uploads
-- This creates a public Supabase Storage bucket used by Admin > Projects drag/drop uploads.
-- Because this is a frontend-only demo, insert/update/delete are public for this bucket.
-- For production, move uploads behind a server/API that verifies the Discord admin token first.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'portfolio-images',
  'portfolio-images',
  true,
  10485760,
  array['image/png', 'image/jpeg', 'image/webp', 'image/gif']::text[]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "portfolio_images_public_read" on storage.objects;
drop policy if exists "portfolio_images_public_insert" on storage.objects;
drop policy if exists "portfolio_images_public_update" on storage.objects;
drop policy if exists "portfolio_images_public_delete" on storage.objects;

create policy "portfolio_images_public_read"
on storage.objects
for select
using (bucket_id = 'portfolio-images');

create policy "portfolio_images_public_insert"
on storage.objects
for insert
with check (bucket_id = 'portfolio-images');

create policy "portfolio_images_public_update"
on storage.objects
for update
using (bucket_id = 'portfolio-images')
with check (bucket_id = 'portfolio-images');

create policy "portfolio_images_public_delete"
on storage.objects
for delete
using (bucket_id = 'portfolio-images');

-- Patch older portfolio rows so every project becomes a collection with an images array.
update public.portfolio_content
set data = jsonb_set(
  data,
  '{projects}',
  (
    select jsonb_agg(
      case
        when project ? 'images' then project
        when coalesce(project->>'image', '') <> '' then jsonb_set(
          project,
          '{images}',
          jsonb_build_array(
            jsonb_build_object(
              'id', coalesce(project->>'id', 'project') || '-image-1',
              'title', coalesce(project->>'title', 'Project image'),
              'image', project->>'image',
              'path', '',
              'description', coalesce(project->>'description', ''),
              'isCover', true
            )
          ),
          true
        )
        else jsonb_set(project, '{images}', '[]'::jsonb, true)
      end
    )
    from jsonb_array_elements(data->'projects') as project
  ),
  true
)
where id = 'genuine-kiwi'
  and jsonb_typeof(data->'projects') = 'array';
