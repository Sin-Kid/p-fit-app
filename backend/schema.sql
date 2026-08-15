-- ====================================================================
-- Production Cross-Platform Monitoring System Database Schema
-- Compatible with PostgreSQL 15+ and Supabase
-- ====================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ROLES TABLE (RBAC)
CREATE TABLE IF NOT EXISTS public.roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert standard roles
INSERT INTO public.roles (name, description) VALUES
    ('user', 'Standard user with view access to assigned monitoring metrics and personal notifications'),
    ('admin', 'Administrator with full monitoring, device management, and alert triage capabilities'),
    ('super_admin', 'System Super Administrator with system-wide configuration and user administration')
ON CONFLICT (name) DO NOTHING;

-- 2. USER PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY, -- Matches auth.users.id
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(150),
    avatar_url TEXT,
    role_name VARCHAR(50) NOT NULL DEFAULT 'user' REFERENCES public.roles(name) ON UPDATE CASCADE,
    phone_number VARCHAR(30),
    department VARCHAR(100),
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. MONITORED DEVICES & FLEET
CREATE TYPE device_status_type AS ENUM ('online', 'warning', 'critical', 'offline', 'maintenance');
CREATE TYPE device_platform_type AS ENUM ('linux', 'windows', 'macos', 'android', 'ios', 'iot_embedded', 'server');

CREATE TABLE IF NOT EXISTS public.devices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(150) NOT NULL,
    identifier VARCHAR(100) UNIQUE NOT NULL, -- e.g., MAC, Serial, or Hostname
    type VARCHAR(50) NOT NULL DEFAULT 'server', -- 'gateway', 'server', 'sensor', 'workstation'
    platform device_platform_type NOT NULL DEFAULT 'linux',
    ip_address INET,
    status device_status_type NOT NULL DEFAULT 'online',
    battery_level INT CHECK (battery_level >= 0 AND battery_level <= 100),
    cpu_usage_pct FLOAT CHECK (cpu_usage_pct >= 0.0 AND cpu_usage_pct <= 100.0) DEFAULT 0.0,
    memory_usage_pct FLOAT CHECK (memory_usage_pct >= 0.0 AND memory_usage_pct <= 100.0) DEFAULT 0.0,
    disk_usage_pct FLOAT CHECK (disk_usage_pct >= 0.0 AND disk_usage_pct <= 100.0) DEFAULT 0.0,
    temperature_celsius FLOAT DEFAULT 42.0,
    location_label VARCHAR(100) DEFAULT 'Main Datacenter',
    tags TEXT[] DEFAULT '{}',
    is_pinned BOOLEAN NOT NULL DEFAULT false,
    last_ping_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_devices_status ON public.devices(status);
CREATE INDEX IF NOT EXISTS idx_devices_platform ON public.devices(platform);
CREATE INDEX IF NOT EXISTS idx_devices_last_ping ON public.devices(last_ping_at DESC);
CREATE INDEX IF NOT EXISTS idx_devices_is_pinned ON public.devices(is_pinned);

-- 4. DEVICE PUSH NOTIFICATION TOKENS
CREATE TABLE IF NOT EXISTS public.device_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    platform VARCHAR(20) NOT NULL, -- 'android', 'ios', 'web'
    app_version VARCHAR(30),
    last_active_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_device_tokens_user ON public.device_tokens(user_id);

-- 5. MONITORING TELEMETRY & EVENTS
CREATE TYPE event_severity_type AS ENUM ('info', 'warning', 'critical', 'fatal');

CREATE TABLE IF NOT EXISTS public.monitoring_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    device_id UUID REFERENCES public.devices(id) ON DELETE SET NULL,
    event_type VARCHAR(80) NOT NULL, -- 'heartbeat', 'high_cpu', 'network_drop', 'disk_full'
    severity event_severity_type NOT NULL DEFAULT 'info',
    title VARCHAR(200) NOT NULL,
    description TEXT,
    metrics_snapshot JSONB DEFAULT '{}'::jsonb, -- dynamic metrics snapshot
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_events_device_id ON public.monitoring_events(device_id);
CREATE INDEX IF NOT EXISTS idx_events_severity ON public.monitoring_events(severity);
CREATE INDEX IF NOT EXISTS idx_events_created_at ON public.monitoring_events(created_at DESC);

-- 6. SYSTEM ALERTS
CREATE TYPE alert_status_type AS ENUM ('active', 'acknowledged', 'resolved', 'suppressed');

CREATE TABLE IF NOT EXISTS public.alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    device_id UUID REFERENCES public.devices(id) ON DELETE CASCADE,
    severity event_severity_type NOT NULL DEFAULT 'warning',
    status alert_status_type NOT NULL DEFAULT 'active',
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    source_metric VARCHAR(80), -- e.g. 'cpu', 'memory', 'disk', 'connectivity'
    triggered_value FLOAT,
    threshold_value FLOAT,
    acknowledged_at TIMESTAMPTZ,
    acknowledged_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    resolved_at TIMESTAMPTZ,
    resolved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    resolution_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_alerts_status ON public.alerts(status);
CREATE INDEX IF NOT EXISTS idx_alerts_severity ON public.alerts(severity);
CREATE INDEX IF NOT EXISTS idx_alerts_device ON public.alerts(device_id);
CREATE INDEX IF NOT EXISTS idx_alerts_created ON public.alerts(created_at DESC);

-- 7. USER NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    body TEXT NOT NULL,
    category VARCHAR(50) NOT NULL DEFAULT 'monitoring', -- 'alert', 'system', 'maintenance', 'account'
    severity event_severity_type NOT NULL DEFAULT 'info',
    is_read BOOLEAN NOT NULL DEFAULT false,
    deep_link TEXT, -- e.g. '/monitoring/device-uuid' or '/alerts/alert-uuid'
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON public.notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON public.notifications(created_at DESC);

-- 8. NOTIFICATION PREFERENCES
CREATE TABLE IF NOT EXISTS public.notification_preferences (
    user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    email_critical BOOLEAN NOT NULL DEFAULT true,
    email_warnings BOOLEAN NOT NULL DEFAULT false,
    push_critical BOOLEAN NOT NULL DEFAULT true,
    push_warnings BOOLEAN NOT NULL DEFAULT true,
    push_info BOOLEAN NOT NULL DEFAULT false,
    in_app_sound BOOLEAN NOT NULL DEFAULT true,
    in_app_vibration BOOLEAN NOT NULL DEFAULT true,
    quiet_hours_enabled BOOLEAN NOT NULL DEFAULT false,
    quiet_hours_start TIME DEFAULT '22:00:00',
    quiet_hours_end TIME DEFAULT '07:00:00',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. AUDIT & ACTIVITY LOGS
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL, -- 'DEVICE_REBOOT', 'ALERT_RESOLVED', 'CONFIG_CHANGED'
    resource_type VARCHAR(60) NOT NULL, -- 'device', 'alert', 'user', 'settings'
    resource_id VARCHAR(100),
    details JSONB DEFAULT '{}'::jsonb,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON public.activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON public.activity_logs(user_id);

-- 10. SYSTEM SETTINGS
CREATE TABLE IF NOT EXISTS public.system_settings (
    key VARCHAR(100) PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert default system settings
INSERT INTO public.system_settings (key, value, description) VALUES
    ('monitoring_interval_seconds', '15'::jsonb, 'Default telemetry reporting heartbeat in seconds'),
    ('cpu_warning_threshold_pct', '80.0'::jsonb, 'CPU threshold triggering warning alert'),
    ('cpu_critical_threshold_pct', '95.0'::jsonb, 'CPU threshold triggering critical alert'),
    ('memory_warning_threshold_pct', '85.0'::jsonb, 'Memory usage threshold triggering warning'),
    ('offline_timeout_minutes', '3'::jsonb, 'Minutes after which an un-pinged device is marked offline')
ON CONFLICT (key) DO NOTHING;

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.device_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monitoring_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Helper functions for RBAC
CREATE OR REPLACE FUNCTION public.get_auth_user_role()
RETURNS VARCHAR AS $$
    SELECT role_name FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_admin_or_super()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role_name IN ('admin', 'super_admin')
    );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Profiles Policies
CREATE POLICY "Users can view all active profiles"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

CREATE POLICY "Admins can update any profile"
    ON public.profiles FOR ALL
    TO authenticated
    USING (public.is_admin_or_super());

-- Devices Policies
CREATE POLICY "Authenticated users can view devices"
    ON public.devices FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Admins can insert or update devices"
    ON public.devices FOR ALL
    TO authenticated
    USING (public.is_admin_or_super());

-- Events Policies
CREATE POLICY "Authenticated users can view monitoring events"
    ON public.monitoring_events FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can insert monitoring events"
    ON public.monitoring_events FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Alerts Policies
CREATE POLICY "Authenticated users can view alerts"
    ON public.alerts FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Admins can manage alerts"
    ON public.alerts FOR ALL
    TO authenticated
    USING (public.is_admin_or_super());

-- Notifications Policies
CREATE POLICY "Users can manage own notifications"
    ON public.notifications FOR ALL
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Preferences Policies
CREATE POLICY "Users can manage own notification preferences"
    ON public.notification_preferences FOR ALL
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Activity Logs Policies
CREATE POLICY "Authenticated users can view activity logs"
    ON public.activity_logs FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can create activity logs"
    ON public.activity_logs FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid() OR public.is_admin_or_super());

-- System Settings Policies
CREATE POLICY "Authenticated users can view system settings"
    ON public.system_settings FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Super Admins can edit system settings"
    ON public.system_settings FOR ALL
    TO authenticated
    USING (public.get_auth_user_role() = 'super_admin');

-- ====================================================================
-- SUPABASE REALTIME REPLICATION CONFIGURATION
-- ====================================================================
-- Enable realtime publication on core tables
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        CREATE PUBLICATION supabase_realtime;
    END IF;
END $$;

ALTER PUBLICATION supabase_realtime ADD TABLE public.devices;
ALTER PUBLICATION supabase_realtime ADD TABLE public.alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.monitoring_events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Auto-update updated_at timestamp trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER set_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE OR REPLACE TRIGGER set_devices_updated_at
    BEFORE UPDATE ON public.devices
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE OR REPLACE TRIGGER set_alerts_updated_at
    BEFORE UPDATE ON public.alerts
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
