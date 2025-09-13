import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export const Settings: React.FC = () => {
  useEffect(() => {
    document.title = "Settings | Expense Manager";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Update your account and application preferences");
  }, []);

  const [darkMode, setDarkMode] = React.useState<boolean>(() => {
    return localStorage.getItem('theme') === 'dark';
  });
  const [emailAlerts, setEmailAlerts] = React.useState<boolean>(() => {
    return localStorage.getItem('emailAlerts') === 'true';
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('emailAlerts', emailAlerts ? 'true' : 'false');
  }, [emailAlerts]);

  return (
    <div>
      <header className="pb-6 border-b">
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-6">
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="dark-mode">Dark mode</Label>
              <Switch id="dark-mode" checked={darkMode} onCheckedChange={setDarkMode} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="email-notifs">Email alerts</Label>
              <Switch id="email-notifs" checked={emailAlerts} onCheckedChange={setEmailAlerts} />
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Settings;
