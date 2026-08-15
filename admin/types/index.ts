export type DeviceStatus = 'online' | 'warning' | 'critical' | 'offline' | 'maintenance';
export type DevicePlatform = 'linux' | 'windows' | 'macos' | 'android' | 'ios' | 'iot_embedded' | 'server';
export type EventSeverity = 'info' | 'warning' | 'critical' | 'fatal';
export type AlertStatus = 'active' | 'acknowledged' | 'resolved' | 'suppressed';
export type UserRole = 'user' | 'admin' | 'super_admin';

export interface Device {
  id: string;
  name: string;
  identifier: string;
  type: string;
  platform: DevicePlatform;
  ip_address: string;
  status: DeviceStatus;
  battery_level?: number;
  cpu_usage_pct: number;
  memory_usage_pct: number;
  disk_usage_pct: number;
  temperature_celsius: number;
  location_label: string;
  tags: string[];
  is_pinned: boolean;
  last_ping_at: string;
  metadata?: Record<string, any>;
}

export interface Alert {
  id: string;
  device_id: string;
  device_name?: string;
  severity: EventSeverity;
  status: AlertStatus;
  title: string;
  message: string;
  source_metric?: string;
  triggered_value?: number;
  threshold_value?: number;
  acknowledged_at?: string;
  acknowledged_by?: string;
  resolved_at?: string;
  resolved_by?: string;
  resolution_notes?: string;
  created_at: string;
}

export interface MonitoringEvent {
  id: string;
  device_id: string;
  device_name?: string;
  event_type: string;
  severity: EventSeverity;
  title: string;
  description?: string;
  metrics_snapshot?: Record<string, any>;
  created_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  role_name: UserRole;
  phone_number?: string;
  department?: string;
  is_active: boolean;
  last_login_at?: string;
  created_at: string;
}

export interface SystemKPIs {
  totalDevices: number;
  onlineDevices: number;
  warningDevices: number;
  criticalDevices: number;
  offlineDevices: number;
  activeAlerts: number;
  uptimePercentage: number;
  avgCpuUsagePct: number;
  avgMemoryUsagePct: number;
  totalEventsToday: number;
}
