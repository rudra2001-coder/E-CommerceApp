-- Migration: Admin Customization System
-- Adds tables for full storefront customization

-- 1. testimonials - Customer testimonials for homepage
CREATE TABLE IF NOT EXISTS testimonials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  role TEXT,
  text TEXT NOT NULL,
  rating INT CHECK (rating >= 1 AND rating <= 5) DEFAULT 5,
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public testimonials read" ON testimonials;
CREATE POLICY "Public testimonials read" ON testimonials FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Admin all testimonials" ON testimonials;
CREATE POLICY "Admin all testimonials" ON testimonials FOR ALL USING (is_admin());

-- 2. features - Trust bar / feature highlights for homepage
CREATE TABLE IF NOT EXISTS features (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  icon_name TEXT DEFAULT 'Truck',
  is_active BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE features ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public features read" ON features;
CREATE POLICY "Public features read" ON features FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Admin all features" ON features;
CREATE POLICY "Admin all features" ON features FOR ALL USING (is_admin());

-- 3. banners - Promotional banners for homepage
CREATE TABLE IF NOT EXISTS banners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  image_url TEXT,
  title TEXT,
  subtitle TEXT,
  cta_text TEXT,
  cta_link TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  valid_from TIMESTAMPTZ,
  valid_to TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE banners ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public banners read" ON banners;
CREATE POLICY "Public banners read" ON banners FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Admin all banners" ON banners;
CREATE POLICY "Admin all banners" ON banners FOR ALL USING (is_admin());

-- 4. faq_items - Dynamic FAQ items
CREATE TABLE IF NOT EXISTS faq_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category TEXT DEFAULT 'General',
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE faq_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public faq read" ON faq_items;
CREATE POLICY "Public faq read" ON faq_items FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Admin all faq" ON faq_items;
CREATE POLICY "Admin all faq" ON faq_items FOR ALL USING (is_admin());

-- 5. Enhance hero_slides with animation type and image upload support
ALTER TABLE hero_slides ADD COLUMN IF NOT EXISTS animation_type TEXT DEFAULT 'fade';
ALTER TABLE hero_slides ADD COLUMN IF NOT EXISTS text_color TEXT DEFAULT '#FFFFFF';
ALTER TABLE hero_slides ADD COLUMN IF NOT EXISTS overlay_opacity NUMERIC DEFAULT 0.4;

-- 6. Add payment_method to orders for COD/card distinction
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'cod';

-- 7. Add is_approved to reviews for admin moderation
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT false;

-- Update RLS for reviews to include admin update
DROP POLICY IF EXISTS "Admin all reviews" ON reviews;
CREATE POLICY "Admin all reviews" ON reviews FOR ALL USING (is_admin());

-- Seed default features
INSERT INTO features (title, description, icon_name, is_active, sort_order) VALUES
('Free Shipping', 'On orders over $50', 'Truck', true, 1),
('Secure Checkout', '256-bit SSL encrypted', 'Shield', true, 2),
('Easy Returns', '30-day return policy', 'RotateCcw', true, 3),
('24/7 Support', 'Dedicated customer care', 'Clock', true, 4)
ON CONFLICT DO NOTHING;

-- Seed default FAQ items
INSERT INTO faq_items (category, question, answer, sort_order) VALUES
('Orders', 'How do I place an order?', 'Simply browse our catalog, add items to your cart, and proceed to checkout. You can pay via credit card or cash on delivery.', 1),
('Orders', 'Can I modify my order?', 'Orders can be modified within 1 hour of placement. Contact our support team for assistance.', 2),
('Orders', 'How do I track my order?', 'Once your order ships, you will receive a tracking number via email. You can also check your order status in your account dashboard.', 3),
('Shipping', 'What shipping options are available?', 'We offer Standard, Express, and Overnight shipping. Delivery times vary based on your location.', 4),
('Shipping', 'Do you ship internationally?', 'Yes, we ship to most countries worldwide. International delivery typically takes 7-14 business days.', 5),
('Shipping', 'What are the shipping costs?', 'Shipping costs are calculated at checkout based on your location and selected shipping method. Free shipping on orders over $50.', 6),
('Returns', 'What is your return policy?', 'We offer a 30-day hassle-free return policy. Items must be unworn with tags attached.', 7),
('Returns', 'How do I start a return?', 'Log into your account, go to Orders, select the item you want to return, and follow the instructions.', 8),
('Returns', 'When will I get my refund?', 'Refunds are processed within 5-7 business days after we receive your return.', 9),
('Payment', 'What payment methods do you accept?', 'We accept Visa, Mastercard, American Express, PayPal, and Cash on Delivery.', 10),
('Payment', 'Is my payment information secure?', 'Yes! We use 256-bit SSL encryption and Razorpay''s secure payment gateway.', 11),
('Payment', 'Do you offer installment payments?', 'Yes, we offer installment options through select payment partners at checkout.', 12)
ON CONFLICT DO NOTHING;
