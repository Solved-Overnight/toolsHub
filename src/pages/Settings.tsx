import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { motion } from 'framer-motion';
import { Save, User, Building, Palette, Globe, Bell, Shield, Database, Printer } from 'lucide-react';
import { auth } from '../lib/firebaseConfig';
import { updateProfile } from 'firebase/auth';
import * as Select from '@radix-ui/react-select'; // Import Radix UI Select

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
  theme: 'dark', // Default to dark theme for consistency
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

  // Common input classes - Updated for dark theme and consistency
  const inputClasses = "w-full rounded-lg border border-border shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 bg-surface text-text py-2 px-3 transition-all duration-200 hover:border-primary/50";
  // Select trigger classes - Updated for dark theme and custom arrow
  const selectTriggerClasses = "flex items-center justify-between w-full rounded-lg border border-border shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 bg-surface text-text py-2 px-3 transition-all duration-200 hover:border-primary/50";
  // Label classes - Updated for dark theme
  const labelClasses = "block text-sm font-medium text-textSecondary mb-2";


  const renderTabContent = () => {
    const SelectItemContent = ({ children, value }: { children: React.ReactNode; value: string }) => (
      <Select.Item
        value={value}
        className="relative flex items-center rounded-md py-2 pl-3 pr-9 text-text text-sm outline-none data-[highlighted]:bg-primary/20 data-[highlighted]:text-primary data-[highlighted]:outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 transition-colors duration-200"
      >
        <Select.ItemText>{children}</Select.ItemText>
        <Select.ItemIndicator className="absolute right-3 inline-flex items-center justify-center text-primary">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        </Select.ItemIndicator>
      </Select.Item>
    );

    return (
      <>
        {activeTab === 'company' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-foreground">Company Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelClasses}>Company Name</label>
                <Input
                  value={settings.companyName}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                  placeholder="Enter company name"
                  className={inputClasses}
                />
              </div>
              <div>
                <label className={labelClasses}>Company Email</label>
                <Input
                  type="email"
                  value={settings.companyEmail}
                  onChange={(e) => handleInputChange('companyEmail', e.target.value)}
                  placeholder="Enter company email"
                  className={inputClasses}
                />
              </div>
              <div className="md:col-span-2">
                <label className={labelClasses}>Company Address</label>
                <textarea
                  className={`${inputClasses} min-h-[80px]`}
                  rows={3}
                  value={settings.companyAddress}
                  onChange={(e) => handleInputChange('companyAddress', e.target.value)}
                  placeholder="Enter company address"
                />
              </div>
              <div>
                <label className={labelClasses}>Phone Number</label>
                <Input
                  value={settings.companyPhone}
                  onChange={(e) => handleInputChange('companyPhone', e.target.value)}
                  placeholder="Enter phone number"
                  className={inputClasses}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'preferences' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-foreground">User Preferences</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelClasses}>Default Currency</label>
                <Select.Root value={settings.defaultCurrency} onValueChange={(value) => handleInputChange('defaultCurrency', value)}>
                  <Select.Trigger className={selectTriggerClasses} aria-label="Default Currency">
                    <Select.Value placeholder="Select Currency" />
                    <Select.Icon className="text-textSecondary">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </Select.Icon>
                  </Select.Trigger>
                  <Select.Portal>
                    <Select.Content className="overflow-hidden rounded-lg bg-surface border border-border shadow-lg z-50">
                      <Select.Viewport className="p-1">
                        <SelectItemContent value="BDT">BDT (Bangladeshi Taka)</SelectItemContent>
                        <SelectItemContent value="USD">USD (US Dollar)</SelectItemContent>
                        <SelectItemContent value="EUR">EUR (Euro)</SelectItemContent>
                        <SelectItemContent value="GBP">GBP (British Pound)</SelectItemContent>
                        <SelectItemContent value="INR">INR (Indian Rupee)</SelectItemContent>
                      </Select.Viewport>
                    </Select.Content>
                  </Select.Portal>
                </Select.Root>
              </div>
              <div>
                <label className={labelClasses}>Date Format</label>
                <Select.Root value={settings.dateFormat} onValueChange={(value) => handleInputChange('dateFormat', value)}>
                  <Select.Trigger className={selectTriggerClasses} aria-label="Date Format">
                    <Select.Value placeholder="Select Format" />
                    <Select.Icon className="text-textSecondary">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </Select.Icon>
                  </Select.Trigger>
                  <Select.Portal>
                    <Select.Content className="overflow-hidden rounded-lg bg-surface border border-border shadow-lg z-50">
                      <Select.Viewport className="p-1">
                        <SelectItemContent value="DD/MM/YYYY">DD/MM/YYYY</SelectItemContent>
                        <SelectItemContent value="MM/DD/YYYY">MM/DD/YYYY</SelectItemContent>
                        <SelectItemContent value="YYYY-MM-DD">YYYY-MM-DD</SelectItemContent>
                      </Select.Viewport>
                    </Select.Content>
                  </Select.Portal>
                </Select.Root>
              </div>
              <div>
                <label className={labelClasses}>Time Format</label>
                <Select.Root value={settings.timeFormat} onValueChange={(value) => handleInputChange('timeFormat', value)}>
                  <Select.Trigger className={selectTriggerClasses} aria-label="Time Format">
                    <Select.Value placeholder="Select Format" />
                    <Select.Icon className="text-textSecondary">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </Select.Icon>
                  </Select.Trigger>
                  <Select.Portal>
                    <Select.Content className="overflow-hidden rounded-lg bg-surface border border-border shadow-lg z-50">
                      <Select.Viewport className="p-1">
                        <SelectItemContent value="12h">12 Hour</SelectItemContent>
                        <SelectItemContent value="24h">24 Hour</SelectItemContent>
                      </Select.Viewport>
                    </Select.Content>
                  </Select.Portal>
                </Select.Root>
              </div>
              <div>
                <label className={labelClasses}>Language</label>
                <Select.Root value={settings.language} onValueChange={(value) => handleInputChange('language', value)}>
                  <Select.Trigger className={selectTriggerClasses} aria-label="Language">
                    <Select.Value placeholder="Select Language" />
                    <Select.Icon className="text-textSecondary">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </Select.Icon>
                  </Select.Trigger>
                  <Select.Portal>
                    <Select.Content className="overflow-hidden rounded-lg bg-surface border border-border shadow-lg z-50">
                      <Select.Viewport className="p-1">
                        <SelectItemContent value="English">English</SelectItemContent>
                        <SelectItemContent value="Bengali">Bengali</SelectItemContent>
                      </Select.Viewport>
                    </Select.Content>
                  </Select.Portal>
                </Select.Root>
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
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
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
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'appearance' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-foreground">Appearance Settings</h3>
            <div>
              <label className={labelClasses}>Theme</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {['light', 'dark', 'dracula', 'github', 'monokai'].map((theme) => (
                  <div
                    key={theme}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      settings.theme === theme
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
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
                      <span className="text-sm font-medium capitalize text-text">{theme}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'printing' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-foreground">Printing Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelClasses}>Default Paper Size</label>
                <Select.Root value={settings.defaultPaperSize} onValueChange={(value) => handleInputChange('defaultPaperSize', value)}>
                  <Select.Trigger className={selectTriggerClasses} aria-label="Default Paper Size">
                    <Select.Value placeholder="Select Size" />
                    <Select.Icon className="text-textSecondary">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </Select.Icon>
                  </Select.Trigger>
                  <Select.Portal>
                    <Select.Content className="overflow-hidden rounded-lg bg-surface border border-border shadow-lg z-50">
                      <Select.Viewport className="p-1">
                        <SelectItemContent value="A4">A4</SelectItemContent>
                        <SelectItemContent value="A3">A3</SelectItemContent>
                        <SelectItemContent value="Letter">Letter</SelectItemContent>
                        <SelectItemContent value="Legal">Legal</SelectItemContent>
                      </Select.Viewport>
                    </Select.Content>
                  </Select.Portal>
                </Select.Root>
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
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
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
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'system' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-foreground">System Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelClasses}>Backup Frequency</label>
                <Select.Root value={settings.backupFrequency} onValueChange={(value) => handleInputChange('backupFrequency', value)}>
                  <Select.Trigger className={selectTriggerClasses} aria-label="Backup Frequency">
                    <Select.Value placeholder="Select Frequency" />
                    <Select.Icon className="text-textSecondary">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </Select.Icon>
                  </Select.Trigger>
                  <Select.Portal>
                    <Select.Content className="overflow-hidden rounded-lg bg-surface border border-border shadow-lg z-50">
                      <Select.Viewport className="p-1">
                        <SelectItemContent value="daily">Daily</SelectItemContent>
                        <SelectItemContent value="weekly">Weekly</SelectItemContent>
                        <SelectItemContent value="monthly">Monthly</SelectItemContent>
                        <SelectItemContent value="manual">Manual Only</SelectItemContent>
                      </Select.Viewport>
                    </Select.Content>
                  </Select.Portal>
                </Select.Root>
              </div>
              <div>
                <label className={labelClasses}>Data Retention</label>
                <Select.Root value={settings.dataRetention} onValueChange={(value) => handleInputChange('dataRetention', value)}>
                  <Select.Trigger className={selectTriggerClasses} aria-label="Data Retention">
                    <Select.Value placeholder="Select Retention" />
                    <Select.Icon className="text-textSecondary">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </Select.Icon>
                  </Select.Trigger>
                  <Select.Portal>
                    <Select.Content className="overflow-hidden rounded-lg bg-surface border border-border shadow-lg z-50">
                      <Select.Viewport className="p-1">
                        <SelectItemContent value="6months">6 Months</SelectItemContent>
                        <SelectItemContent value="1year">1 Year</SelectItemContent>
                        <SelectItemContent value="2years">2 Years</SelectItemContent>
                        <SelectItemContent value="5years">5 Years</SelectItemContent>
                        <SelectItemContent value="forever">Forever</SelectItemContent>
                      </Select.Viewport>
                    </Select.Content>
                  </Select.Portal>
                </Select.Root>
              </div>
            </div>
          </div>
        )}
      </>
    );
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
