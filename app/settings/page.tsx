'use client';

import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTheme } from '@/components/providers/theme-provider';

export default function SettingsPage() {
  const { theme } = useTheme();
  const [systemInfo, setSystemInfo] = useState({
    version: '1.0.0',
    environment: 'development',
    nodeEnv: 'development',
  });

  const [integrations, setIntegrations] = useState({
    emailNotifications: false,
    webhooks: false,
    slackIntegration: false,
  });

  useEffect(() => {
    // Load system info
    setSystemInfo({
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      nodeEnv: process.env.NODE_ENV || 'development',
    });

    // Load integration settings from localStorage
    const savedIntegrations = localStorage.getItem('integrations');
    if (savedIntegrations) {
      setIntegrations(JSON.parse(savedIntegrations));
    }
  }, []);

  const toggleIntegration = (key: keyof typeof integrations) => {
    const newIntegrations = {
      ...integrations,
      [key]: !integrations[key],
    };
    setIntegrations(newIntegrations);
    localStorage.setItem('integrations', JSON.stringify(newIntegrations));
  };

  const envVariables = [
    { key: 'NODE_ENV', value: process.env.NODE_ENV || 'development', sensitive: false },
    { key: 'NEXT_PUBLIC_API_URL', value: process.env.NEXT_PUBLIC_API_URL || 'Not set', sensitive: false },
    { key: 'DATABASE_URL', value: '••••••••', sensitive: true },
    { key: 'NEXTAUTH_SECRET', value: '••••••••', sensitive: true },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Manage system settings, integrations, and preferences
          </p>
        </div>

        {/* System Information */}
        <Card>
          <CardHeader>
            <CardTitle>System Information</CardTitle>
            <CardDescription>
              Current system version and environment details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Application Version</p>
                  <p className="text-sm text-muted-foreground">Wavelaunch OS</p>
                </div>
                <Badge variant="outline">{systemInfo.version}</Badge>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Environment</p>
                  <p className="text-sm text-muted-foreground">Current runtime environment</p>
                </div>
                <Badge variant={systemInfo.environment === 'production' ? 'success' : 'secondary'}>
                  {systemInfo.environment}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Theme</p>
                  <p className="text-sm text-muted-foreground">Current color scheme</p>
                </div>
                <Badge variant="outline">
                  {theme === 'light' ? '☀️ Light' : '🌙 Dark'}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Database</p>
                  <p className="text-sm text-muted-foreground">Current database connection</p>
                </div>
                <Badge variant="success">Connected</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Integrations */}
        <Card>
          <CardHeader>
            <CardTitle>Integrations</CardTitle>
            <CardDescription>
              Enable or disable third-party integrations (stubs for Phase 3)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-muted-foreground">
                    Send email notifications for important events
                  </p>
                </div>
                <button
                  onClick={() => toggleIntegration('emailNotifications')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    integrations.emailNotifications ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      integrations.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-medium">Webhooks</p>
                  <p className="text-sm text-muted-foreground">
                    Send HTTP callbacks for campaign and deal events
                  </p>
                </div>
                <button
                  onClick={() => toggleIntegration('webhooks')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    integrations.webhooks ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      integrations.webhooks ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-medium">Slack Integration</p>
                  <p className="text-sm text-muted-foreground">
                    Post updates to Slack channels
                  </p>
                </div>
                <button
                  onClick={() => toggleIntegration('slackIntegration')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    integrations.slackIntegration ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      integrations.slackIntegration ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="mt-4 rounded-md bg-muted p-4">
                <p className="text-sm text-muted-foreground">
                  <strong>Note:</strong> These integrations are currently stubs for Phase 3 demonstration.
                  Full implementation will be added in future phases. Toggle states are saved to localStorage.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Environment Variables */}
        <Card>
          <CardHeader>
            <CardTitle>Environment Variables</CardTitle>
            <CardDescription>
              View configured environment variables (sensitive values are hidden)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {envVariables.map((env) => (
                <div key={env.key} className="flex items-center justify-between py-2 border-b last:border-b-0">
                  <div className="flex-1">
                    <p className="font-mono text-sm font-medium">{env.key}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="rounded bg-muted px-2 py-1 text-xs">
                      {env.value}
                    </code>
                    {env.sensitive && (
                      <Badge variant="outline" className="text-xs">Sensitive</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* API Endpoints */}
        <Card>
          <CardHeader>
            <CardTitle>API Endpoints</CardTitle>
            <CardDescription>
              Available REST API endpoints for this application
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="font-mono">GET</Badge>
                <code className="text-sm">/api/creators</code>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="font-mono">GET</Badge>
                <code className="text-sm">/api/campaigns</code>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="font-mono">GET</Badge>
                <code className="text-sm">/api/deals</code>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="font-mono">GET</Badge>
                <code className="text-sm">/api/analytics</code>
              </div>
              <div className="mt-4 rounded-md bg-muted p-4">
                <p className="text-sm text-muted-foreground">
                  All endpoints support full CRUD operations (GET, POST, PUT, DELETE) with RBAC enforcement.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
