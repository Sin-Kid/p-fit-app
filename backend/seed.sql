-- ====================================================================
-- Production Cross-Platform Monitoring System Seed Data
-- ====================================================================

-- 1. Insert Initial Profiles
INSERT INTO public.profiles (id, email, full_name, role_name, department, phone_number) VALUES
    ('a0000000-0000-0000-0000-000000000001', 'superadmin@monitor.io', 'Alex Vance (Super Admin)', 'super_admin', 'Infrastructure Operations', '+1 (555) 019-2834'),
    ('a0000000-0000-0000-0000-000000000002', 'admin@monitor.io', 'Sarah Connor (DevOps Lead)', 'admin', 'Site Reliability Engineering', '+1 (555) 019-8871'),
    ('a0000000-0000-0000-0000-000000000003', 'user@monitor.io', 'Marcus Wright (Field Engineer)', 'user', 'Edge IoT Systems', '+1 (555) 019-3329')
ON CONFLICT (id) DO NOTHING;

-- 2. Insert Monitored Fleet Devices
INSERT INTO public.devices (id, name, identifier, type, platform, ip_address, status, battery_level, cpu_usage_pct, memory_usage_pct, disk_usage_pct, temperature_celsius, location_label, is_pinned) VALUES
    ('d0000000-0000-0000-0000-000000000001', 'Core-Gateway-US-East', 'GW-USE-01', 'gateway', 'linux', '10.0.1.1', 'online', 100, 24.5, 48.2, 34.0, 38.5, 'US-East Primary DC', true),
    ('d0000000-0000-0000-0000-000000000002', 'Database-Cluster-Master', 'DB-PG-NODE1', 'server', 'linux', '10.0.2.14', 'online', 100, 42.1, 72.8, 68.4, 46.2, 'US-East Primary DC', true),
    ('d0000000-0000-0000-0000-000000000003', 'Edge-Node-San-Francisco', 'EDGE-SFO-08', 'iot_embedded', 'iot_embedded', '192.168.10.45', 'warning', 82, 86.4, 88.9, 79.1, 58.7, 'West Coast Facility', true),
    ('d0000000-0000-0000-0000-000000000004', 'Kubernetes-Worker-04', 'K8S-WRK-04', 'server', 'linux', '10.0.3.104', 'critical', 100, 97.2, 94.1, 88.5, 68.0, 'EU-Central DC', true),
    ('d0000000-0000-0000-0000-000000000005', 'Field-Telemetry-Drone-12', 'DRN-FLT-012', 'sensor', 'android', '172.16.8.90', 'online', 64, 18.0, 32.5, 12.0, 31.2, 'Sector 7 Field Hub', false),
    ('d0000000-0000-0000-0000-000000000006', 'Mobile-Field-Unit-A3', 'MOB-IPAD-03', 'workstation', 'ios', '172.16.8.91', 'online', 91, 12.4, 28.0, 45.0, 27.5, 'Field Ops Vehicle', false),
    ('d0000000-0000-0000-0000-000000000007', 'Backup-Vault-Storage', 'STOR-VAULT-01', 'server', 'linux', '10.0.4.5', 'offline', 100, 0.0, 0.0, 92.0, 22.0, 'Disaster Recovery Site', false),
    ('d0000000-0000-0000-0000-000000000008', 'API-Gateway-EU-West', 'GW-EUW-02', 'gateway', 'linux', '10.0.1.20', 'online', 100, 31.8, 54.0, 29.5, 40.1, 'EU-West Frankfurt', true)
ON CONFLICT (identifier) DO NOTHING;

-- 3. Insert Initial Active & History Alerts
INSERT INTO public.alerts (id, device_id, severity, status, title, message, source_metric, triggered_value, threshold_value) VALUES
    ('e0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000004', 'critical', 'active', 'High CPU Utilization Threshold Exceeded', 'Kubernetes Worker 04 CPU sustained at 97.2% for > 5 minutes.', 'cpu', 97.2, 95.0),
    ('e0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000003', 'warning', 'acknowledged', 'High Thermal Sensor Alert', 'Edge-Node-SFO thermal sensor recorded 58.7°C (warning limit 55°C).', 'temperature', 58.7, 55.0),
    ('e0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000007', 'critical', 'active', 'Heartbeat Loss & Device Offline', 'Backup-Vault-Storage failed 3 consecutive health probes.', 'connectivity', 0.0, 1.0)
ON CONFLICT (id) DO NOTHING;

-- 4. Insert Monitoring Telemetry Events
INSERT INTO public.monitoring_events (id, device_id, event_type, severity, title, description, metrics_snapshot) VALUES
    ('f0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'heartbeat', 'info', 'Heartbeat OK', 'Normal periodic telemetry response.', '{"latency_ms": 14, "load_avg": 0.42}'::jsonb),
    ('f0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000004', 'high_cpu', 'critical', 'Pod Autoscaler Limit Hit', 'Kubernetes node pods exceeded target limit.', '{"cpu_pct": 97.2, "active_pods": 84}'::jsonb),
    ('f0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000003', 'thermal_spike', 'warning', 'Thermal Throttling Activated', 'Device fan spun up to 100%.', '{"temp_c": 58.7, "fan_rpm": 4800}'::jsonb),
    ('f0000000-0000-0000-0000-000000000004', 'd0000000-0000-0000-0000-000000000007', 'network_drop', 'critical', 'Connection Timeout', 'Ping packet loss 100%.', '{"packet_loss_pct": 100, "dns_ok": false}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- 5. Insert Notifications
INSERT INTO public.notifications (id, user_id, title, body, category, severity, is_read, deep_link) VALUES
    ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Critical: Kubernetes Worker CPU Spike', 'Node K8S-WRK-04 reached 97.2% CPU utilization.', 'alert', 'critical', false, '/monitoring/d0000000-0000-0000-0000-000000000004'),
    ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Device Offline: Backup Vault Storage', 'No telemetry received for 15 minutes.', 'alert', 'critical', false, '/monitoring/d0000000-0000-0000-0000-000000000007'),
    ('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'System Maintenance Notice', 'Scheduled database indexing tonight at 02:00 UTC.', 'system', 'info', true, '/notifications')
ON CONFLICT (id) DO NOTHING;
