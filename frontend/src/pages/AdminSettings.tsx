import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { useSettings } from '../context/SettingsContext';
import { Settings, Globe, Mail, Phone, MapPin, Image as ImageIcon, CheckCircle2 } from 'lucide-react';

const AdminSettings = () => {
  const { settings, refreshSettings } = useSettings();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    appName: '',
    footerText: '',
    copyrightText: '',
    contactEmail: '',
    contactPhone: '',
    address: '',
  });
  
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  useEffect(() => {
    if (settings) {
      setFormData({
        appName: settings.appName || '',
        footerText: settings.footerText || '',
        copyrightText: settings.copyrightText || '',
        contactEmail: settings.contactEmail || '',
        contactPhone: settings.contactPhone || '',
        address: settings.address || '',
      });
      if (settings.logo) {
        setLogoPreview(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${settings.logo}`);
      }
    }
  }, [settings]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      data.append(key, value);
    });
    
    if (logoFile) {
      data.append('logo', logoFile);
    }

    try {
      await api.put('/settings', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      toast.success('Site settings updated successfully');
      await refreshSettings();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Site Settings</h1>
          <p className="text-muted-foreground mt-1">Configure your application branding and global information.</p>
        </div>
        <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-full border border-green-200">
          <CheckCircle2 className="h-4 w-4" />
          <span className="text-xs font-semibold uppercase">Dynamic Mode Active</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-8">
          {/* General Branding */}
          <Card className="border-2 shadow-sm">
            <CardHeader className="bg-muted/30 border-b">
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                <CardTitle className="text-xl">General Branding</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="appName" className="font-semibold">Application Name</Label>
                <Input 
                  id="appName" 
                  name="appName"
                  value={formData.appName} 
                  onChange={handleInputChange}
                  placeholder="e.g. PropertyRental" 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="footerText" className="font-semibold">Footer About Text</Label>
                <Textarea 
                  id="footerText" 
                  name="footerText"
                  value={formData.footerText} 
                  onChange={handleInputChange}
                  placeholder="A short description of your platform for the footer..."
                  className="min-h-[120px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="copyrightText" className="font-semibold">Copyright Text</Label>
                <Input 
                  id="copyrightText" 
                  name="copyrightText"
                  value={formData.copyrightText} 
                  onChange={handleInputChange}
                  placeholder="e.g. © 2024 PropertyRental. All rights reserved." 
                />
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="border-2 shadow-sm">
            <CardHeader className="bg-muted/30 border-b">
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" />
                <CardTitle className="text-xl">Contact Information</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="contactEmail" className="font-semibold flex items-center gap-2">
                   <Mail className="h-4 w-4 text-muted-foreground" /> Email Address
                </Label>
                <Input 
                  id="contactEmail" 
                  name="contactEmail"
                  type="email"
                  value={formData.contactEmail} 
                  onChange={handleInputChange}
                  placeholder="support@example.com" 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="contactPhone" className="font-semibold flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" /> Phone Number
                </Label>
                <Input 
                  id="contactPhone" 
                  name="contactPhone"
                  value={formData.contactPhone} 
                  onChange={handleInputChange}
                  placeholder="+977-1-4XXXXXX" 
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="address" className="font-semibold flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" /> Physical Address
                </Label>
                <Input 
                  id="address" 
                  name="address"
                  value={formData.address} 
                  onChange={handleInputChange}
                  placeholder="Kathmandu, Nepal" 
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Logo Configuration */}
        <div className="space-y-8">
          <Card className="border-2 shadow-sm">
            <CardHeader className="bg-muted/30 border-b">
              <div className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-primary" />
                <CardTitle className="text-xl">Logo</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl bg-muted/20">
                {logoPreview ? (
                  <div className="relative group">
                    <img 
                      src={logoPreview} 
                      alt="Logo Preview" 
                      className="h-32 w-32 object-contain rounded-lg p-2 bg-background border shadow-sm" 
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg cursor-pointer">
                      <span className="text-white text-xs font-bold uppercase tracking-wider">Change</span>
                      <input 
                        type="file" 
                        className="absolute inset-0 opacity-0 cursor-pointer" 
                        onChange={handleLogoChange}
                        accept="image/*"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <div className="bg-background p-4 rounded-full shadow-sm border mb-3">
                      <ImageIcon className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-medium">No logo uploaded</p>
                    <Label 
                      htmlFor="logo-upload" 
                      className="text-xs text-primary hover:underline cursor-pointer mt-2 block"
                    >
                      Click to upload
                    </Label>
                  </div>
                )}
                <input 
                  id="logo-upload"
                  type="file" 
                  className="hidden" 
                  onChange={handleLogoChange}
                  accept="image/*"
                />
              </div>
              <p className="text-[10px] text-muted-foreground text-center">
                Supported formats: PNG, JPG, WEBP. Max size: 2MB. Recommended: Transparent background.
              </p>
            </CardContent>
          </Card>

          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-6">
              <Button 
                type="submit" 
                className="w-full h-12 text-lg font-bold shadow-lg shadow-primary/20"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-current border-t-transparent animate-spin rounded-full" />
                    Saving Changes
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Update Settings
                  </div>
                )}
              </Button>
              <p className="text-[11px] text-muted-foreground text-center mt-4 px-2">
                Updating these settings will affect all pages, emails, and role-specific panels immediately.
              </p>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
};

export default AdminSettings;
