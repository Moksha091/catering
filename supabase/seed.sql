-- Demo Seed Data: Annapurna Caterers & Events
-- Note: Clearly marked as demo/seed data for testing and pilot preview.

-- Demo Business ID: a1111111-1111-1111-1111-111111111111
-- Demo Profile ID: b2222222-2222-2222-2222-222222222222
-- Demo Menu ID: c3333333-3333-3333-3333-333333333333
-- Demo Package ID: d4444444-4444-4444-4444-444444444444

INSERT INTO public.profiles (id, full_name, phone)
VALUES ('b2222222-2222-2222-2222-222222222222', 'Ramesh Sharma (Demo Owner)', '+919876543210')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.businesses (
  id,
  owner_id,
  name,
  slug,
  description,
  phone,
  whatsapp_phone,
  city,
  state,
  address_text,
  published,
  status
) VALUES (
  'a1111111-1111-1111-1111-111111111111',
  'b2222222-2222-2222-2222-222222222222',
  'Annapurna Caterers & Events (Demo)',
  'annapurna-caterers',
  'Authentic South & North Indian catering for weddings, receptions, housewarmings, and corporate gatherings. Fresh ingredients, traditional flavors, and flawless live counters.',
  '+919876543210',
  '+919876543210',
  'Hyderabad',
  'Telangana',
  'Plot 42, Jubilee Hills Road 36',
  TRUE,
  'active'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.business_members (
  business_id,
  user_id,
  role,
  status
) VALUES (
  'a1111111-1111-1111-1111-111111111111',
  'b2222222-2222-2222-2222-222222222222',
  'owner',
  'active'
) ON CONFLICT (business_id, user_id) DO NOTHING;

-- Service Areas
INSERT INTO public.service_areas (business_id, city, locality, travel_fee_paise)
VALUES
  ('a1111111-1111-1111-1111-111111111111', 'Hyderabad', 'Jubilee Hills / Banjara Hills', 0),
  ('a1111111-1111-1111-1111-111111111111', 'Hyderabad', 'Madhapur / Gachibowli / Hitech City', 50000),
  ('a1111111-1111-1111-1111-111111111111', 'Secunderabad', 'Sainikpuri / Trimulgherry', 75000)
ON CONFLICT DO NOTHING;

-- Menu
INSERT INTO public.menus (
  id,
  business_id,
  name,
  description,
  menu_type,
  status,
  display_order
) VALUES (
  'c3333333-3333-3333-3333-333333333333',
  'a1111111-1111-1111-1111-111111111111',
  'Grand Wedding Feast',
  'Traditional vegetarian and signature Mughlai banquet spread with live dessert counter.',
  'Wedding',
  'published',
  1
) ON CONFLICT (id) DO NOTHING;

-- Categories
INSERT INTO public.menu_categories (id, business_id, menu_id, name, description, display_order)
VALUES
  ('e5555555-5555-5555-5555-555555555551', 'a1111111-1111-1111-1111-111111111111', 'c3333333-3333-3333-3333-333333333333', 'Welcome Drinks & Starters', 'Served hot upon guest arrival', 1),
  ('e5555555-5555-5555-5555-555555555552', 'a1111111-1111-1111-1111-111111111111', 'c3333333-3333-3333-3333-333333333333', 'Main Course & Breads', 'Rich curries and fresh tandoor breads', 2),
  ('e5555555-5555-5555-5555-555555555553', 'a1111111-1111-1111-1111-111111111111', 'c3333333-3333-3333-3333-333333333333', 'Biryani & Rice Delights', 'Dum biryani with salan and raita', 3),
  ('e5555555-5555-5555-5555-555555555554', 'a1111111-1111-1111-1111-111111111111', 'c3333333-3333-3333-3333-333333333333', 'Traditional Desserts', 'Artisanal mithai and hot desserts', 4)
ON CONFLICT (id) DO NOTHING;

-- Dishes
INSERT INTO public.menu_items (business_id, category_id, name, description, dietary_type, price_type, price_paise, unit_label, is_available, display_order)
VALUES
  ('a1111111-1111-1111-1111-111111111111', 'e5555555-5555-5555-5555-555555555551', 'Paneer Tikka Angara', 'Charcoal smoked cottage cheese with mint dip', 'veg', 'fixed', 22000, 'plate', TRUE, 1),
  ('a1111111-1111-1111-1111-111111111111', 'e5555555-5555-5555-5555-555555555551', 'Crispy Corn Chilli Pepper', 'Sweet corn tossed with scallions and crushed pepper', 'veg', 'fixed', 18000, 'plate', TRUE, 2),
  ('a1111111-1111-1111-1111-111111111111', 'e5555555-5555-5555-5555-555555555552', 'Paneer Butter Masala', 'Fresh cottage cheese in creamy cashew-tomato makhani gravy', 'veg', 'fixed', 28000, 'serving', TRUE, 1),
  ('a1111111-1111-1111-1111-111111111111', 'e5555555-5555-5555-5555-555555555552', 'Dal Makhani Bukhara', 'Slow simmered black lentils finished with cream and butter', 'veg', 'fixed', 24000, 'serving', TRUE, 2),
  ('a1111111-1111-1111-1111-111111111111', 'e5555555-5555-5555-5555-555555555553', 'Hyderabadi Veg Dum Biryani', 'Long grain basmati layered with seasonal vegetables and saffron', 'veg', 'per_person', 25000, 'person', TRUE, 1),
  ('a1111111-1111-1111-1111-111111111111', 'e5555555-5555-5555-5555-555555555554', 'Gulab Jamun with Rabdi', 'Hot khoya dumplings served with chilled kesar rabdi', 'veg', 'fixed', 15000, 'portion', TRUE, 1)
ON CONFLICT DO NOTHING;

-- Package
INSERT INTO public.packages (
  id,
  business_id,
  name,
  description,
  pricing_type,
  price_paise,
  minimum_guests,
  maximum_guests,
  is_published,
  display_order
) VALUES (
  'd4444444-4444-4444-4444-444444444444',
  'a1111111-1111-1111-1111-111111111111',
  'Royal Wedding Buffet Package',
  'All-inclusive buffet for weddings and milestone celebrations. Includes 3 welcome drinks, 4 live starters, 6 main courses, biryani counter, 3 desserts, serving staff, chaffing vessels, and clean-up.',
  'per_person',
  65000,
  100,
  1500,
  TRUE,
  1
) ON CONFLICT (id) DO NOTHING;

-- Package Inclusions
INSERT INTO public.package_items (business_id, package_id, item_name_snapshot, quantity_or_description, display_order)
VALUES
  ('a1111111-1111-1111-1111-111111111111', 'd4444444-4444-4444-4444-444444444444', 'Welcome Drinks & Mocktails', '3 varieties (Fresh Lime, Kokum, Badam Milk)', 1),
  ('a1111111-1111-1111-1111-111111111111', 'd4444444-4444-4444-4444-444444444444', 'Live Starter Counters', '4 hot starters served directly to guests', 2),
  ('a1111111-1111-1111-1111-111111111111', 'd4444444-4444-4444-4444-444444444444', 'Full Buffet Main Course', '6 rich curries, rotis, and naans', 3),
  ('a1111111-1111-1111-1111-111111111111', 'd4444444-4444-4444-4444-444444444444', 'Hyderabadi Dum Biryani', 'With Mirchi ka Salan and cucumber raita', 4),
  ('a1111111-1111-1111-1111-111111111111', 'd4444444-4444-4444-4444-444444444444', 'Dessert & Live Ice Cream Counter', 'Gulab Jamun, Rabdi, and 2 Ice Cream flavours', 5),
  ('a1111111-1111-1111-1111-111111111111', 'd4444444-4444-4444-4444-444444444444', 'Serving Staff & Chaffing Vessels', 'Complete tableware, cloth napkins, and cleanup', 6)
ON CONFLICT DO NOTHING;
