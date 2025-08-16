import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { motion } from 'framer-motion';
import { Save, User, Building, Palette, Globe, Bell, Shield, Database, Printer } from 'lucide-react';
import { auth } from '../lib/firebaseConfig';
import { updateProfile } from 'firebase/auth';

interface UserSettings {
  // Company Information
  companyName: string;
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
  
  // User Preferences
  defaultCurrency: string;
  dateFormat: string;
  timeFormat: string;
  language: string;
  
  // Application Settings
  theme: string;
  autoSave: boolean;
  notifications: boolean;
  
  // Printing Settings
  printHeaderLogo: boolean;
  printCompanyDetails: boolean;
  defaultPaperSize: string;
  
  // System Settings
  backupFrequency: string;
  dataRetention: string;
}

const defaultSettings: UserSettings = {
  companyName: 'Lantabur Apparels Ltd.',
  companyAddress: 'Kewa, Boherar chala, Gila Beraeed, Sreepur, Gazipur',
  companyPhone: '+880-XXX-XXXXXXX',
  companyEmail: 'info@lantabur.com',
  defaultCurrency: 'BDT',
  dateFormat: 'DD/MM/YYYY',
  timeFormat: '24h',
  language: 'English',
  theme: 'light',
  autoSave: true,
  notifications: true,
  printHeaderLogo: true,
  printCompanyDetails: true,
  defaultPaperSize: 'A4',
  backupFrequency: 'daily',
  dataRetention: '1year',
};

export function Settings() {
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [activeTab, setActiveTab] = useState('company');

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('userSettings');
    if (savedSettings) {
      setSettings({ ...defaultSettings, ...JSON.parse(savedSettings) });
    }
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Save to localStorage
      localStorage.setItem('userSettings', JSON.stringify(settings));
      
      // Apply theme change immediately
      const currentTheme = settings.theme;
      document.body.className = `theme-${currentTheme}`;
      
      setNotification({ type: 'success', message: 'Settings saved successfully!' });
      
      // Clear notification after 3 seconds
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setNotification({ type: 'error', message: 'Failed to save settings. Please try again.' });
      setTimeout(() => setNotification(null), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: keyof UserSettings, value: string | boolean) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const tabs = [
    { id: 'company', label: 'Company', icon: Building },
    { id: 'preferences', label: 'Preferences', icon: User },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'printing', label: 'Printing', icon: Printer },
    { id: 'system', label: 'System', icon: Database },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'company':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-foreground">Company Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Company Name</label>
                <Input
                  value={settings.companyName}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                  placeholder="Enter company name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Company Email</label>
                <Input
                  type="email"
                  value={settings.companyEmail}
                  onChange={(e) => handleInputChange('companyEmail', e.target.value)}
                  placeholder="Enter company email"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-2">Company Address</label>
                <textarea
                  className="w-full px-3 py-2 border border-border bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  value={settings.companyAddress}
                  onChange={(e) => handleInputChange('companyAddress', e.target.value)}
                  placeholder="Enter company address"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Phone Number</label>
                <Input
                  value={settings.companyPhone}
                  onChange={(e) => handleInputChange('companyPhone', e.target.value)}
                  placeholder="Enter phone number"
                />
              </div>
            </div>
          </div>
        );

      case 'preferences':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-foreground">User Preferences</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Default Currency</label>
                <select
                  className="w-full px-3 py-2 border border-border bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={settings.defaultCurrency}
                  onChange={(e) => handleInputChange('defaultCurrency', e.target.value)}
                >
                  <option value="BDT">BDT (Bangladeshi Taka)</option>
                  <option value="USD">USD (US Dollar)</option>
                  <option value="EUR">EUR (Euro)</option>
                  <option value="GBP">GBP (British Pound)</option>
                  <option value="INR">INR (Indian Rupee)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Date Format</label>
                <select
                  className="w-full px-3 py-2 border border-border bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={settings.dateFormat}
                  onChange={(e) => handleInputChange('dateFormat', e.target.value)}
                >
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Time Format</label>
                <select
                  className="w-full px-3 py-2 border border-border bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={settings.timeFormat}
                  onChange={(e) => handleInputChange('timeFormat', e.target.value)}
                >
                  <option value="12h">12 Hour</option>
                  <option value="24h">24 Hour</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Language</label>
                <select
                  className="w-full px-3 py-2 border border-border bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={settings.language}
                  onChange={(e) => handleInputChange('language', e.target.value)}
                >
                  <option value="English">English</option>
                  <option value="Bengali">Bengali</option>
                </select>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-foreground">Auto Save</label>
                  <p className="text-xs text-muted-foreground">Automatically save your work</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.autoSave}
                  onChange={(e) => handleInputChange('autoSave', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-foreground">Notifications</label>
                  <p className="text-xs text-muted-foreground">Receive system notifications</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.notifications}
                  onChange={(e) => handleInputChange('notifications', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
            </div>
          </div>
        );

      case 'appearance':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-foreground">Appearance Settings</h3>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Theme</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {['light', 'dark', 'dracula', 'github', 'monokai'].map((theme) => (
                  <div
                    key={theme}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      settings.theme === theme
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-border hover:border-muted-foreground'
                    }`}
                    onClick={() => handleInputChange('theme', theme)}
                  >
                    <div className="text-center">
                      <div className={`w-full h-8 rounded mb-2 ${
                        theme === 'light' ? 'bg-white border border-gray-300' :
                        theme === 'dark' ? 'bg-gray-800' :
                        theme === 'dracula' ? 'bg-purple-900' :
                        theme === 'github' ? 'bg-gray-100 border border-gray-300' :
                        'bg-gray-900'
                      }`}></div>
                      <span className="text-sm font-medium capitalize">{theme}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'printing':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-foreground">Printing Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Default Paper Size</label>
                <select
                  className="w-full px-3 py-2 border border-border bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={settings.defaultPaperSize}
                  onChange={(e) => handleInputChange('defaultPaperSize', e.target.value)}
                >
                  <option value="A4">A4</option>
                  <option value="A3">A3</option>
                  <option value="Letter">Letter</option>
                  <option value="Legal">Legal</option>
                </select>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-foreground">Print Header Logo</label>
                  <p className="text-xs text-muted-foreground">Include company logo in printed reports</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.printHeaderLogo}
                  onChange={(e) => handleInputChange('printHeaderLogo', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-foreground">Print Company Details</label>
                  <p className="text-xs text-muted-foreground">Include company information in reports</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.printCompanyDetails}
                  onChange={(e) => handleInputChange('printCompanyDetails', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
            </div>
          </div>
        );

      case 'system':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-foreground">System Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Backup Frequency</label>
                <select
                  className="w-full px-3 py-2 border border-border bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={settings.backupFrequency}
                  onChange={(e) => handleInputChange('backupFrequency', e.target.value)}
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="manual">Manual Only</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Data Retention</label>
                <select
                  className="w-full px-3 py-2 border border-border bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={settings.dataRetention}
                  onChange={(e) => handleInputChange('dataRetention', e.target.value)}
                >
                  <option value="6months">6 Months</option>
                  <option value="1year">1 Year</option>
                  <option value="2years">2 Years</option>
                  <option value="5years">5 Years</option>
                  <option value="forever">Forever</option>
                </select>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card text-card-foreground rounded-lg shadow-sm border border-border"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-border">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Settings</h1>
                <p className="text-sm text-muted-foreground">Manage your application preferences and configuration</p>
              </div>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-[#1A3636] hover:bg-green-900 text-white flex items-center"
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Settings'}
              </Button>
            </div>
          </div>

          {/* Notification */}
          {notification && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mx-6 mt-4 p-4 rounded-md ${
                notification.type === 'success'
                  ? 'bg-green-100 border border-green-400 text-green-700'
                  : 'bg-red-100 border border-red-400 text-red-700'
              }`}
            >
              {notification.message}
            </motion.div>
          )}

          <div className="flex">
            {/* Sidebar */}
            <div className="w-64 border-r border-border p-6">
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      activeTab === tab.id
                        ? 'bg-[#1A3636] text-white'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    <tab.icon className="h-5 w-5 mr-3" />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Content */}
            <div className="flex-1 p-6">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
              >
                {renderTabContent()}
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}