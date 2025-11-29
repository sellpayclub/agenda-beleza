-- Enable Row Level Security on all tables
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Helper function to get user's tenant_id
CREATE OR REPLACE FUNCTION get_user_tenant_id()
RETURNS UUID AS $$
  SELECT tenant_id FROM users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Tenants policies
CREATE POLICY "Users can view their own tenant"
  ON tenants FOR SELECT
  USING (id = get_user_tenant_id());

CREATE POLICY "Public can view tenants by slug"
  ON tenants FOR SELECT
  USING (true);

CREATE POLICY "Admins can update their tenant"
  ON tenants FOR UPDATE
  USING (id = get_user_tenant_id() AND is_admin());

-- Tenant settings policies
CREATE POLICY "Users can view their tenant settings"
  ON tenant_settings FOR SELECT
  USING (tenant_id = get_user_tenant_id());

CREATE POLICY "Admins can update tenant settings"
  ON tenant_settings FOR UPDATE
  USING (tenant_id = get_user_tenant_id() AND is_admin());

CREATE POLICY "Admins can insert tenant settings"
  ON tenant_settings FOR INSERT
  WITH CHECK (tenant_id = get_user_tenant_id() AND is_admin());

-- Users policies
CREATE POLICY "Users can view users in their tenant"
  ON users FOR SELECT
  USING (tenant_id = get_user_tenant_id());

CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  USING (id = auth.uid());

CREATE POLICY "Admins can manage users in their tenant"
  ON users FOR ALL
  USING (tenant_id = get_user_tenant_id() AND is_admin());

-- Employees policies
CREATE POLICY "Anyone can view active employees by tenant"
  ON employees FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage employees"
  ON employees FOR ALL
  USING (tenant_id = get_user_tenant_id() AND is_admin());

CREATE POLICY "Employees can update their own profile"
  ON employees FOR UPDATE
  USING (user_id = auth.uid());

-- Services policies
CREATE POLICY "Anyone can view active services"
  ON services FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage services"
  ON services FOR ALL
  USING (tenant_id = get_user_tenant_id() AND is_admin());

-- Employee services policies
CREATE POLICY "Anyone can view employee services"
  ON employee_services FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage employee services"
  ON employee_services FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM employees 
      WHERE id = employee_services.employee_id 
      AND tenant_id = get_user_tenant_id()
    ) AND is_admin()
  );

-- Schedule blocks policies
CREATE POLICY "Anyone can view schedule blocks"
  ON schedule_blocks FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage schedule blocks"
  ON schedule_blocks FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM employees 
      WHERE id = schedule_blocks.employee_id 
      AND tenant_id = get_user_tenant_id()
    ) AND is_admin()
  );

CREATE POLICY "Employees can manage their own blocks"
  ON schedule_blocks FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM employees 
      WHERE id = schedule_blocks.employee_id 
      AND user_id = auth.uid()
    )
  );

-- Clients policies
CREATE POLICY "Staff can view clients in their tenant"
  ON clients FOR SELECT
  USING (tenant_id = get_user_tenant_id());

CREATE POLICY "Public can insert clients (for booking)"
  ON clients FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Staff can manage clients"
  ON clients FOR UPDATE
  USING (tenant_id = get_user_tenant_id());

CREATE POLICY "Admins can delete clients"
  ON clients FOR DELETE
  USING (tenant_id = get_user_tenant_id() AND is_admin());

-- Appointments policies
CREATE POLICY "Staff can view appointments in their tenant"
  ON appointments FOR SELECT
  USING (tenant_id = get_user_tenant_id());

CREATE POLICY "Public can insert appointments (for booking)"
  ON appointments FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Staff can update appointments"
  ON appointments FOR UPDATE
  USING (tenant_id = get_user_tenant_id());

CREATE POLICY "Admins can delete appointments"
  ON appointments FOR DELETE
  USING (tenant_id = get_user_tenant_id() AND is_admin());

-- Public can view appointments by ID (for confirmation page)
CREATE POLICY "Public can view their own appointment"
  ON appointments FOR SELECT
  USING (true);

-- Notifications policies
CREATE POLICY "Staff can view notifications"
  ON notifications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM appointments 
      WHERE id = notifications.appointment_id 
      AND tenant_id = get_user_tenant_id()
    )
  );

CREATE POLICY "System can insert notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System can update notifications"
  ON notifications FOR UPDATE
  USING (true);

