
-- ============ ENUMS ============
CREATE TYPE public.app_role AS ENUM ('admin','manager','operator','accountant');
CREATE TYPE public.quotation_status AS ENUM ('draft','sent','accepted','rejected','expired');
CREATE TYPE public.invoice_type AS ENUM ('gst','tax','retail');
CREATE TYPE public.payment_method AS ENUM ('cash','upi','bank_transfer','cheque','card','other');
CREATE TYPE public.production_status AS ENUM ('pending','cutting','grinding','polishing','tempering','ready','delivered');
CREATE TYPE public.dim_unit AS ENUM ('ft','in','mm');

-- ============ UPDATED_AT HELPER ============
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

-- ============ PROFILES ============
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile read" ON public.profiles FOR SELECT TO authenticated USING (auth.uid()=id);
CREATE POLICY "own profile upsert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid()=id);
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid()=id);
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
  INSERT INTO public.profiles(id, full_name, email)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.email);
  -- First user becomes admin, others default to operator
  INSERT INTO public.user_roles(user_id, role)
  VALUES (NEW.id,
    CASE WHEN (SELECT count(*) FROM public.user_roles)=0 THEN 'admin'::app_role ELSE 'operator'::app_role END);
  RETURN NEW;
END $$;

-- ============ ROLES ============
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE(user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
  SELECT EXISTS(SELECT 1 FROM public.user_roles WHERE user_id=_user_id AND role=_role)
$$;

CREATE POLICY "view own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid()=user_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "admin manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- Trigger on auth.users
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============ Helper: owned-row policy maker ============
-- All business tables use owner_id = auth.uid()

-- ============ COMPANY SETTINGS ============
CREATE TABLE public.company_settings (
  owner_id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  company_name TEXT NOT NULL DEFAULT '',
  owner_name TEXT, business_type TEXT,
  address TEXT, city TEXT, state TEXT, pincode TEXT,
  phone TEXT, email TEXT, website TEXT,
  gst_no TEXT, pan_no TEXT,
  logo_path TEXT,
  bank_name TEXT, branch_name TEXT, account_holder_name TEXT,
  bank_ac_no TEXT, ifsc_code TEXT, account_type TEXT, upi_id TEXT,
  terms_and_conditions TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.company_settings TO authenticated;
GRANT ALL ON public.company_settings TO service_role;
ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own settings" ON public.company_settings FOR ALL TO authenticated USING (auth.uid()=owner_id OR public.has_role(auth.uid(),'admin')) WITH CHECK (auth.uid()=owner_id);
CREATE TRIGGER trg_settings_updated BEFORE UPDATE ON public.company_settings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ CUSTOMERS ============
CREATE TABLE public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT, email TEXT,
  address TEXT, city TEXT, state TEXT, pincode TEXT,
  gst_no TEXT, pan_no TEXT,
  opening_balance NUMERIC(14,2) NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.customers TO authenticated;
GRANT ALL ON public.customers TO service_role;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own customers" ON public.customers FOR ALL TO authenticated USING (auth.uid()=owner_id OR public.has_role(auth.uid(),'admin')) WITH CHECK (auth.uid()=owner_id);
CREATE TRIGGER trg_customers_updated BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ SUPPLIERS ============
CREATE TABLE public.suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT, email TEXT,
  address TEXT, city TEXT, state TEXT, pincode TEXT,
  gst_no TEXT, pan_no TEXT,
  opening_balance NUMERIC(14,2) NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.suppliers TO authenticated;
GRANT ALL ON public.suppliers TO service_role;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own suppliers" ON public.suppliers FOR ALL TO authenticated USING (auth.uid()=owner_id OR public.has_role(auth.uid(),'admin')) WITH CHECK (auth.uid()=owner_id);
CREATE TRIGGER trg_suppliers_updated BEFORE UPDATE ON public.suppliers FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ PRODUCTS ============
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT,             -- e.g. clear, tinted, reflective, toughened, laminated, mirror, acp, hardware, custom
  thickness_mm NUMERIC(6,2),
  hsn_code TEXT,
  unit TEXT NOT NULL DEFAULT 'sqft',
  rate NUMERIC(14,2) NOT NULL DEFAULT 0,
  cost_rate NUMERIC(14,2) NOT NULL DEFAULT 0,
  gst_percent NUMERIC(5,2) NOT NULL DEFAULT 18,
  stock NUMERIC(14,3) NOT NULL DEFAULT 0,
  low_stock_threshold NUMERIC(14,3) NOT NULL DEFAULT 10,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own products" ON public.products FOR ALL TO authenticated USING (auth.uid()=owner_id OR public.has_role(auth.uid(),'admin')) WITH CHECK (auth.uid()=owner_id);
CREATE TRIGGER trg_products_updated BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ PROJECTS ============
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users ON DELETE CASCADE,
  name TEXT NOT NULL,
  customer_id UUID REFERENCES public.customers ON DELETE SET NULL,
  site_address TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.projects TO authenticated;
GRANT ALL ON public.projects TO service_role;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own projects" ON public.projects FOR ALL TO authenticated USING (auth.uid()=owner_id OR public.has_role(auth.uid(),'admin')) WITH CHECK (auth.uid()=owner_id);
CREATE TRIGGER trg_projects_updated BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ QUOTATIONS ============
CREATE TABLE public.quotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users ON DELETE CASCADE,
  quote_no TEXT NOT NULL,
  quote_date DATE NOT NULL DEFAULT CURRENT_DATE,
  valid_until DATE,
  customer_id UUID REFERENCES public.customers ON DELETE SET NULL,
  customer_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
  project_id UUID REFERENCES public.projects ON DELETE SET NULL,
  gst_type TEXT NOT NULL DEFAULT 'CGST+SGST',
  sub_total NUMERIC(14,2) NOT NULL DEFAULT 0,
  cgst NUMERIC(14,2) NOT NULL DEFAULT 0,
  sgst NUMERIC(14,2) NOT NULL DEFAULT 0,
  igst NUMERIC(14,2) NOT NULL DEFAULT 0,
  discount NUMERIC(14,2) NOT NULL DEFAULT 0,
  net_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
  status quotation_status NOT NULL DEFAULT 'draft',
  terms TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(owner_id, quote_no)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.quotations TO authenticated;
GRANT ALL ON public.quotations TO service_role;
ALTER TABLE public.quotations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own quotations" ON public.quotations FOR ALL TO authenticated USING (auth.uid()=owner_id OR public.has_role(auth.uid(),'admin')) WITH CHECK (auth.uid()=owner_id);
CREATE TRIGGER trg_quotations_updated BEFORE UPDATE ON public.quotations FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.quotation_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_id UUID NOT NULL REFERENCES public.quotations ON DELETE CASCADE,
  owner_id UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users ON DELETE CASCADE,
  product_id UUID REFERENCES public.products ON DELETE SET NULL,
  description TEXT NOT NULL,
  width NUMERIC(10,3), height NUMERIC(10,3), unit dim_unit DEFAULT 'ft',
  qty NUMERIC(14,3) NOT NULL DEFAULT 1,
  area_sqft NUMERIC(14,3),
  rate NUMERIC(14,2) NOT NULL DEFAULT 0,
  gst_percent NUMERIC(5,2) NOT NULL DEFAULT 18,
  amount NUMERIC(14,2) NOT NULL DEFAULT 0,
  sort_order INT NOT NULL DEFAULT 0
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.quotation_items TO authenticated;
GRANT ALL ON public.quotation_items TO service_role;
ALTER TABLE public.quotation_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own quote items" ON public.quotation_items FOR ALL TO authenticated USING (auth.uid()=owner_id OR public.has_role(auth.uid(),'admin')) WITH CHECK (auth.uid()=owner_id);

-- ============ INVOICES ============
CREATE TABLE public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users ON DELETE CASCADE,
  invoice_no TEXT NOT NULL,
  invoice_type invoice_type NOT NULL DEFAULT 'gst',
  invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE,
  customer_id UUID REFERENCES public.customers ON DELETE SET NULL,
  customer_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
  project_id UUID REFERENCES public.projects ON DELETE SET NULL,
  quotation_id UUID REFERENCES public.quotations ON DELETE SET NULL,
  gst_type TEXT NOT NULL DEFAULT 'CGST+SGST',
  sub_total NUMERIC(14,2) NOT NULL DEFAULT 0,
  cgst NUMERIC(14,2) NOT NULL DEFAULT 0,
  sgst NUMERIC(14,2) NOT NULL DEFAULT 0,
  igst NUMERIC(14,2) NOT NULL DEFAULT 0,
  discount NUMERIC(14,2) NOT NULL DEFAULT 0,
  net_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
  paid_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
  notes TEXT,
  attender TEXT, biller TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(owner_id, invoice_no)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.invoices TO authenticated;
GRANT ALL ON public.invoices TO service_role;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own invoices" ON public.invoices FOR ALL TO authenticated USING (auth.uid()=owner_id OR public.has_role(auth.uid(),'admin')) WITH CHECK (auth.uid()=owner_id);
CREATE TRIGGER trg_invoices_updated BEFORE UPDATE ON public.invoices FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES public.invoices ON DELETE CASCADE,
  owner_id UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users ON DELETE CASCADE,
  product_id UUID REFERENCES public.products ON DELETE SET NULL,
  description TEXT NOT NULL,
  hsn_code TEXT,
  width NUMERIC(10,3), height NUMERIC(10,3), unit dim_unit DEFAULT 'ft',
  qty NUMERIC(14,3) NOT NULL DEFAULT 1,
  area_sqft NUMERIC(14,3),
  rate NUMERIC(14,2) NOT NULL DEFAULT 0,
  gst_percent NUMERIC(5,2) NOT NULL DEFAULT 18,
  amount NUMERIC(14,2) NOT NULL DEFAULT 0,
  sort_order INT NOT NULL DEFAULT 0
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.invoice_items TO authenticated;
GRANT ALL ON public.invoice_items TO service_role;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own invoice items" ON public.invoice_items FOR ALL TO authenticated USING (auth.uid()=owner_id OR public.has_role(auth.uid(),'admin')) WITH CHECK (auth.uid()=owner_id);

-- ============ PAYMENTS ============
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users ON DELETE CASCADE,
  invoice_id UUID REFERENCES public.invoices ON DELETE CASCADE,
  customer_id UUID REFERENCES public.customers ON DELETE SET NULL,
  paid_on DATE NOT NULL DEFAULT CURRENT_DATE,
  amount NUMERIC(14,2) NOT NULL,
  method payment_method NOT NULL DEFAULT 'cash',
  reference TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.payments TO authenticated;
GRANT ALL ON public.payments TO service_role;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own payments" ON public.payments FOR ALL TO authenticated USING (auth.uid()=owner_id OR public.has_role(auth.uid(),'admin')) WITH CHECK (auth.uid()=owner_id);

-- Update invoice paid_amount on payment changes
CREATE OR REPLACE FUNCTION public.recompute_invoice_paid()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE inv UUID;
BEGIN
  inv := COALESCE(NEW.invoice_id, OLD.invoice_id);
  IF inv IS NOT NULL THEN
    UPDATE public.invoices i
    SET paid_amount = COALESCE((SELECT SUM(amount) FROM public.payments WHERE invoice_id=inv),0)
    WHERE i.id=inv;
  END IF;
  RETURN COALESCE(NEW, OLD);
END $$;
CREATE TRIGGER trg_payments_recompute
AFTER INSERT OR UPDATE OR DELETE ON public.payments
FOR EACH ROW EXECUTE FUNCTION public.recompute_invoice_paid();

-- ============ WORK ORDERS ============
CREATE TABLE public.work_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users ON DELETE CASCADE,
  wo_no TEXT NOT NULL,
  invoice_id UUID REFERENCES public.invoices ON DELETE SET NULL,
  quotation_id UUID REFERENCES public.quotations ON DELETE SET NULL,
  project_id UUID REFERENCES public.projects ON DELETE SET NULL,
  customer_id UUID REFERENCES public.customers ON DELETE SET NULL,
  glass_type TEXT, thickness_mm NUMERIC(6,2),
  pieces JSONB NOT NULL DEFAULT '[]'::jsonb,
  instructions TEXT,
  status production_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(owner_id, wo_no)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.work_orders TO authenticated;
GRANT ALL ON public.work_orders TO service_role;
ALTER TABLE public.work_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own work orders" ON public.work_orders FOR ALL TO authenticated USING (auth.uid()=owner_id OR public.has_role(auth.uid(),'admin')) WITH CHECK (auth.uid()=owner_id);
CREATE TRIGGER trg_wo_updated BEFORE UPDATE ON public.work_orders FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ DELIVERIES ============
CREATE TABLE public.deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users ON DELETE CASCADE,
  challan_no TEXT NOT NULL,
  delivery_date DATE NOT NULL DEFAULT CURRENT_DATE,
  invoice_id UUID REFERENCES public.invoices ON DELETE SET NULL,
  work_order_id UUID REFERENCES public.work_orders ON DELETE SET NULL,
  customer_id UUID REFERENCES public.customers ON DELETE SET NULL,
  vehicle_no TEXT, driver_name TEXT,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  signature_path TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(owner_id, challan_no)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.deliveries TO authenticated;
GRANT ALL ON public.deliveries TO service_role;
ALTER TABLE public.deliveries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own deliveries" ON public.deliveries FOR ALL TO authenticated USING (auth.uid()=owner_id OR public.has_role(auth.uid(),'admin')) WITH CHECK (auth.uid()=owner_id);

-- ============ LEFTOVER SHEETS ============
CREATE TABLE public.leftover_sheets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users ON DELETE CASCADE,
  glass_type TEXT, thickness_mm NUMERIC(6,2),
  length_ft NUMERIC(10,3) NOT NULL,
  width_ft NUMERIC(10,3) NOT NULL,
  unit_value NUMERIC(14,2) NOT NULL DEFAULT 0,
  used BOOLEAN NOT NULL DEFAULT false,
  source_work_order UUID REFERENCES public.work_orders ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.leftover_sheets TO authenticated;
GRANT ALL ON public.leftover_sheets TO service_role;
ALTER TABLE public.leftover_sheets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own leftovers" ON public.leftover_sheets FOR ALL TO authenticated USING (auth.uid()=owner_id OR public.has_role(auth.uid(),'admin')) WITH CHECK (auth.uid()=owner_id);

-- ============ PURCHASES ============
CREATE TABLE public.purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users ON DELETE CASCADE,
  bill_no TEXT NOT NULL,
  bill_date DATE NOT NULL DEFAULT CURRENT_DATE,
  supplier_id UUID REFERENCES public.suppliers ON DELETE SET NULL,
  sub_total NUMERIC(14,2) NOT NULL DEFAULT 0,
  gst NUMERIC(14,2) NOT NULL DEFAULT 0,
  net_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
  paid_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.purchases TO authenticated;
GRANT ALL ON public.purchases TO service_role;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own purchases" ON public.purchases FOR ALL TO authenticated USING (auth.uid()=owner_id OR public.has_role(auth.uid(),'admin')) WITH CHECK (auth.uid()=owner_id);

CREATE TABLE public.purchase_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_id UUID NOT NULL REFERENCES public.purchases ON DELETE CASCADE,
  owner_id UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users ON DELETE CASCADE,
  product_id UUID REFERENCES public.products ON DELETE SET NULL,
  description TEXT NOT NULL,
  qty NUMERIC(14,3) NOT NULL DEFAULT 1,
  rate NUMERIC(14,2) NOT NULL DEFAULT 0,
  gst_percent NUMERIC(5,2) NOT NULL DEFAULT 18,
  amount NUMERIC(14,2) NOT NULL DEFAULT 0
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.purchase_items TO authenticated;
GRANT ALL ON public.purchase_items TO service_role;
ALTER TABLE public.purchase_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own purchase items" ON public.purchase_items FOR ALL TO authenticated USING (auth.uid()=owner_id OR public.has_role(auth.uid(),'admin')) WITH CHECK (auth.uid()=owner_id);

-- ============ EXPENSES ============
CREATE TABLE public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users ON DELETE CASCADE,
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  category TEXT NOT NULL,   -- salary, rent, electricity, fuel, maintenance, misc
  description TEXT,
  amount NUMERIC(14,2) NOT NULL,
  payment_method payment_method NOT NULL DEFAULT 'cash',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.expenses TO authenticated;
GRANT ALL ON public.expenses TO service_role;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own expenses" ON public.expenses FOR ALL TO authenticated USING (auth.uid()=owner_id OR public.has_role(auth.uid(),'admin')) WITH CHECK (auth.uid()=owner_id);

-- ============ AUDIT LOG ============
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES auth.users ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity TEXT,
  entity_id UUID,
  meta JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.audit_logs TO authenticated;
GRANT ALL ON public.audit_logs TO service_role;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "insert own audit" ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (auth.uid()=actor_id);
CREATE POLICY "read audit (admin or own)" ON public.audit_logs FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin') OR auth.uid()=actor_id);

-- ============ STORAGE POLICIES (per-user folder) ============
-- Path convention: <bucket>/<auth.uid()>/...
CREATE POLICY "own files read" ON storage.objects FOR SELECT TO authenticated
USING (bucket_id IN ('company-logos','project-files','site-photos') AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "own files write" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id IN ('company-logos','project-files','site-photos') AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "own files update" ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id IN ('company-logos','project-files','site-photos') AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "own files delete" ON storage.objects FOR DELETE TO authenticated
USING (bucket_id IN ('company-logos','project-files','site-photos') AND auth.uid()::text = (storage.foldername(name))[1]);
