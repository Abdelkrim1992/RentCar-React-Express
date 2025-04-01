import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getQueryFn, apiRequest } from '@/lib/queryClient';
import AdminLayout from '@/components/admin/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Settings as SettingsIcon, Save, Upload, Globe, Image, Palette } from 'lucide-react';

interface SiteSettings {
  id: number;
  siteName: string;
  logoColor: string;
  accentColor: string;
  logoText: string;
  customLogo: string | null;
  updatedAt: string;
}

interface ApiResponse {
  success: boolean;
  data: SiteSettings;
  message?: string;
}

const AdminSettings: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch current settings
  const { data: settingsResponse, isLoading } = useQuery<ApiResponse>({
    queryKey: ['/api/settings'],
    queryFn: getQueryFn({ on401: 'returnNull' }),
  });
  
  const settings = settingsResponse?.data;
  
  // State for form values
  const [formValues, setFormValues] = useState({
    siteName: '',
    logoColor: '#6843EC',
    accentColor: '#D2FF3A',
    logoText: 'ETHER',
    customLogo: ''
  });
  
  // Update form values when settings are loaded
  useEffect(() => {
    if (settings) {
      setFormValues({
        siteName: settings.siteName || 'Ether',
        logoColor: settings.logoColor || '#6843EC',
        accentColor: settings.accentColor || '#D2FF3A',
        logoText: settings.logoText || 'ETHER',
        customLogo: settings.customLogo || ''
      });
    }
  }, [settings]);
  
  // Preview values (for live preview)
  const [previewValues, setPreviewValues] = useState({ ...formValues });
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle preview button click
  const handlePreview = () => {
    setPreviewValues({ ...formValues });
    toast({
      title: "Preview Updated",
      description: "The preview has been updated with your changes.",
    });
  };
  
  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: (settings: typeof formValues) => 
      apiRequest('PUT', '/api/settings', settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
      toast({
        title: "Settings Saved",
        description: "Your site settings have been updated successfully.",
      });
      // Also update preview
      setPreviewValues({ ...formValues });
    },
    onError: (error) => {
      toast({
        title: "Error Saving Settings",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  });
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettingsMutation.mutate(formValues);
  };
  
  return (
    <AdminLayout>
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
          <Button
            variant="outline"
            onClick={handlePreview}
            disabled={isLoading || updateSettingsMutation.isPending}
          >
            Preview Changes
          </Button>
        </div>
        
        <Tabs defaultValue="general" className="space-y-4">
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Site Information</CardTitle>
                <CardDescription>
                  Manage your site name and branding details.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form id="settings-form" onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="siteName">Site Name</Label>
                      <Input
                        id="siteName"
                        name="siteName"
                        value={formValues.siteName}
                        onChange={handleInputChange}
                        placeholder="Enter your site name"
                      />
                      <p className="text-sm text-muted-foreground">
                        This name will be used throughout your site.
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="logoText">Logo Text</Label>
                      <Input
                        id="logoText"
                        name="logoText"
                        value={formValues.logoText}
                        onChange={handleInputChange}
                        placeholder="ETHER"
                      />
                      <p className="text-sm text-muted-foreground">
                        The text displayed in your logo.
                      </p>
                    </div>
                  </div>
                </form>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    if (settings) {
                      setFormValues({
                        siteName: settings.siteName || 'Ether',
                        logoColor: settings.logoColor || '#6843EC',
                        accentColor: settings.accentColor || '#D2FF3A',
                        logoText: settings.logoText || 'ETHER',
                        customLogo: settings.customLogo || ''
                      });
                    }
                  }}
                >
                  Reset
                </Button>
                <Button
                  type="submit"
                  form="settings-form"
                  disabled={updateSettingsMutation.isPending}
                >
                  {updateSettingsMutation.isPending ? (
                    <>Saving...</>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="appearance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Branding & Colors</CardTitle>
                <CardDescription>
                  Customize your site's visual identity.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form id="appearance-form" onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="customLogo">Custom Logo URL</Label>
                      <div className="flex space-x-2">
                        <Input
                          id="customLogo"
                          name="customLogo"
                          value={formValues.customLogo}
                          onChange={handleInputChange}
                          placeholder="https://example.com/your-logo.png"
                        />
                        <Button type="button" variant="outline" size="icon">
                          <Upload className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Leave blank to use the text logo with colors below.
                      </p>
                    </div>
                    
                    <Separator />
                    
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="logoColor">Logo Color</Label>
                        <div className="flex space-x-2">
                          <div 
                            className="w-10 h-10 rounded border"
                            style={{ backgroundColor: formValues.logoColor }}
                          />
                          <Input
                            id="logoColor"
                            name="logoColor"
                            type="color"
                            value={formValues.logoColor}
                            onChange={handleInputChange}
                          />
                          <Input
                            value={formValues.logoColor}
                            onChange={handleInputChange}
                            name="logoColor"
                            placeholder="#6843EC"
                            className="flex-1"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="accentColor">Accent Color</Label>
                        <div className="flex space-x-2">
                          <div 
                            className="w-10 h-10 rounded border"
                            style={{ backgroundColor: formValues.accentColor }}
                          />
                          <Input
                            id="accentColor"
                            name="accentColor"
                            type="color"
                            value={formValues.accentColor}
                            onChange={handleInputChange}
                          />
                          <Input
                            value={formValues.accentColor}
                            onChange={handleInputChange}
                            name="accentColor"
                            placeholder="#D2FF3A"
                            className="flex-1"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </form>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    if (settings) {
                      setFormValues({
                        ...formValues,
                        logoColor: settings.logoColor || '#6843EC',
                        accentColor: settings.accentColor || '#D2FF3A',
                        customLogo: settings.customLogo || ''
                      });
                    }
                  }}
                >
                  Reset
                </Button>
                <Button
                  type="submit"
                  form="appearance-form"
                  disabled={updateSettingsMutation.isPending}
                >
                  {updateSettingsMutation.isPending ? (
                    <>Saving...</>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Logo Preview</CardTitle>
                <CardDescription>
                  See how your logo will appear throughout the site.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-6 bg-white rounded-lg border flex justify-between items-center">
                  {previewValues.customLogo ? (
                    <img src={previewValues.customLogo} alt="Custom Logo" className="h-10" />
                  ) : (
                    <a className="font-turret text-3xl font-bold tracking-wider text-black">
                      <span style={{ color: previewValues.logoColor }}>{previewValues.logoText}</span>
                      <span style={{ color: previewValues.accentColor }}>.</span>
                    </a>
                  )}
                  
                  <nav className="hidden md:flex items-center space-x-8">
                    <a className="font-work font-medium relative group">
                      Fleet
                      <span 
                        className="absolute left-0 bottom-[-4px] w-0 h-[2px] transition-all duration-300 group-hover:w-full"
                        style={{ backgroundColor: previewValues.accentColor }}
                      ></span>
                    </a>
                    <a className="font-work font-medium relative group">
                      Features
                      <span 
                        className="absolute left-0 bottom-[-4px] w-0 h-[2px] transition-all duration-300 group-hover:w-full"
                        style={{ backgroundColor: previewValues.accentColor }}
                      ></span>
                    </a>
                    <a className="font-work font-medium relative group">
                      Book Now
                      <span 
                        className="absolute left-0 bottom-[-4px] w-0 h-[2px] transition-all duration-300 group-hover:w-full"
                        style={{ backgroundColor: previewValues.accentColor }}
                      ></span>
                    </a>
                  </nav>
                </div>
                
                <div className="p-6 bg-gray-900 text-white rounded-lg flex items-center space-x-4">
                  {previewValues.customLogo ? (
                    <img src={previewValues.customLogo} alt="Custom Logo" className="h-10" />
                  ) : (
                    <a className="font-turret text-3xl font-bold tracking-wider">
                      <span style={{ color: previewValues.logoColor }}>{previewValues.logoText}</span>
                      <span style={{ color: previewValues.accentColor }}>.</span>
                    </a>
                  )}
                  <span className="text-gray-400">|</span>
                  <span className="text-gray-300">{previewValues.siteName} Footer</span>
                </div>
                
                <div className="flex justify-center">
                  <div 
                    className="px-4 py-2 rounded-lg text-white font-semibold"
                    style={{ 
                      background: `linear-gradient(to right, ${previewValues.logoColor}, ${previewValues.accentColor})` 
                    }}
                  >
                    Button with Gradient
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="advanced" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Advanced Settings</CardTitle>
                <CardDescription>
                  These settings are for advanced users only.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="flex items-center p-4 rounded-lg bg-yellow-50 border border-yellow-200 text-yellow-700">
                    <SettingsIcon className="h-5 w-5 mr-2 flex-shrink-0" />
                    <p className="text-sm">
                      Advanced settings are currently under development and will be available in a future update.
                    </p>
                  </div>
                  
                  <div className="grid gap-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Globe className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Custom Domain</p>
                          <p className="text-sm text-muted-foreground">
                            Configure a custom domain for your car rental website
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" disabled>Coming Soon</Button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Image className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Image Storage</p>
                          <p className="text-sm text-muted-foreground">
                            Configure image storage options and optimization
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" disabled>Coming Soon</Button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Palette className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Theme Editor</p>
                          <p className="text-sm text-muted-foreground">
                            Advanced theme customization options
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" disabled>Coming Soon</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;