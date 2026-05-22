import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { statIconColors, statusBadgeClass } from '../lib/theme';
import { Shield, Mail, Calendar, Activity } from 'lucide-react';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

const AdminProfile = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProperties: 0,
    pendingProperties: 0,
  });

  useEffect(() => {
    fetchAdminStats();
  }, []);

  const fetchAdminStats = async () => {
    try {
      const response = await api.get('/admin/dashboard');
      setStats({
        totalUsers: response.data.stats.totalUsers,
        totalProperties: response.data.stats.totalProperties,
        pendingProperties: response.data.stats.pendingProperties,
      });
    } catch (error) {
      console.error('Failed to fetch admin stats');
    }
  };

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPassword,
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const onProfileSubmit = async (data: ProfileFormData) => {
    try {
      setLoading(true);
      await api.put('/users/profile', data);
      toast.success('Profile updated successfully');
      window.location.reload();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const onPasswordSubmit = async (data: PasswordFormData) => {
    try {
      setPasswordLoading(true);
      await api.put('/users/change-password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      toast.success('Password changed successfully');
      resetPassword();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2">Admin Profile</h1>
          <p className="text-lg text-muted-foreground">Manage your administrator account</p>
        </motion.div>

        {/* Admin Stats Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card className="border-2 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Administrator Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">{stats.totalUsers}</div>
                  <div className="text-sm text-muted-foreground">Total Users</div>
                </div>
                <div className="text-center">
                  <div className={`text-3xl font-bold mb-2 ${statIconColors.primary}`}>{stats.totalProperties}</div>
                  <div className="text-sm text-muted-foreground">Total Properties</div>
                </div>
                <div className="text-center">
                  <div className={`text-3xl font-bold mb-2 ${statIconColors.warning}`}>{stats.pendingProperties}</div>
                  <div className="text-sm text-muted-foreground">Pending Properties</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Profile Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <Card className="border-2 shadow-lg">
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Your administrator account details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-primary" />
                    <div>
                      <div className="font-semibold">Role</div>
                      <Badge className={statusBadgeClass('info')}>Administrator</Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Activity className={`h-5 w-5 ${statIconColors.success}`} />
                    <div>
                      <div className="font-semibold">Status</div>
                      <Badge className={statusBadgeClass('success')}>Active</Badge>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Calendar className={`h-5 w-5 ${statIconColors.info}`} />
                    <div>
                      <div className="font-semibold">Member Since</div>
                      <div className="text-sm text-muted-foreground">
                        {user ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-orange-600" />
                    <div>
                      <div className="font-semibold">Email</div>
                      <div className="text-sm text-muted-foreground">{user?.email}</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Profile Update */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-2 shadow-lg">
              <CardHeader>
                <CardTitle>Update Profile</CardTitle>
                <CardDescription>Update your personal information</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" {...registerProfile('name')} />
                    {profileErrors.name && (
                      <p className="text-sm text-red-500 mt-1">{profileErrors.name.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" {...registerProfile('email')} />
                    {profileErrors.email && (
                      <p className="text-sm text-red-500 mt-1">{profileErrors.email.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" type="tel" {...registerProfile('phone')} />
                    {profileErrors.phone && (
                      <p className="text-sm text-red-500 mt-1">{profileErrors.phone.message}</p>
                    )}
                  </div>

                  <Button type="submit" disabled={loading} className="w-full">
                    {loading ? 'Updating...' : 'Update Profile'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Change Password */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="border-2 shadow-lg">
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>Update your password</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-4">
                  <div>
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input id="currentPassword" type="password" {...registerPassword('currentPassword')} />
                    {passwordErrors.currentPassword && (
                      <p className="text-sm text-red-500 mt-1">{passwordErrors.currentPassword.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input id="newPassword" type="password" {...registerPassword('newPassword')} />
                    {passwordErrors.newPassword && (
                      <p className="text-sm text-red-500 mt-1">{passwordErrors.newPassword.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input id="confirmPassword" type="password" {...registerPassword('confirmPassword')} />
                    {passwordErrors.confirmPassword && (
                      <p className="text-sm text-red-500 mt-1">{passwordErrors.confirmPassword.message}</p>
                    )}
                  </div>

                  <Button type="submit" disabled={passwordLoading} className="w-full">
                    {passwordLoading ? 'Changing...' : 'Change Password'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
