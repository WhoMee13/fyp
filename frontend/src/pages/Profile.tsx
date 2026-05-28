import { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { statusBadgeClass } from '../lib/theme';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
});

const changePasswordSchema = z
  .object({
    currentPassword: z.string().optional(),
    newPassword: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

const setPasswordSchema = z
  .object({
    newPassword: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type ProfileFormData = z.infer<typeof profileSchema>;
type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
type SetPasswordFormData = z.infer<typeof setPasswordSchema>;

const authProviderLabel: Record<string, string> = {
  LOCAL: 'Email & password',
  GOOGLE: 'Google',
  BOTH: 'Google + password',
};

const Profile = () => {
  const { user, vendorStatus, refreshUser, isVendor, isAdmin } = useAuth();
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const isGoogleOnly = user?.authProvider === 'GOOGLE' && !user?.hasPassword;
  const usesGoogle = user?.authProvider === 'GOOGLE' || user?.authProvider === 'BOTH';

  const [citizenshipId, setCitizenshipId] = useState('');
  const [frontImage, setFrontImage] = useState<File | null>(null);
  const [backImage, setBackImage] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
    reset: resetProfile,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
    },
  });

  useEffect(() => {
    if (user) {
      resetProfile({
        name: user.name,
        email: user.email,
        phone: user.phone || '',
      });
    }
  }, [user, resetProfile]);

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPassword,
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
  });

  const {
    register: registerSetPassword,
    handleSubmit: handleSetPasswordSubmit,
    formState: { errors: setPasswordErrors },
    reset: resetSetPassword,
  } = useForm<SetPasswordFormData>({
    resolver: zodResolver(setPasswordSchema),
  });

  const onProfileSubmit = async (data: ProfileFormData) => {
    try {
      setLoading(true);
      await api.put('/users/profile', data);
      toast.success('Profile updated successfully');
      refreshUser();
    } catch (error: any) {
      // Handled globally
    } finally {
      setLoading(false);
    }
  };

  const onPasswordSubmit = async (data: ChangePasswordFormData) => {
    try {
      setPasswordLoading(true);
      await api.put('/users/change-password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      toast.success('Password changed successfully');
      resetPassword();
      refreshUser();
    } catch (error: any) {
      // Handled globally
    } finally {
      setPasswordLoading(false);
    }
  };

  const onSetPasswordSubmit = async (data: SetPasswordFormData) => {
    try {
      setPasswordLoading(true);
      await api.put('/users/change-password', {
        newPassword: data.newPassword,
      });
      toast.success('Password set successfully');
      resetSetPassword();
      refreshUser();
    } catch (error: any) {
      // Handled globally
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleFileChange = (setter: (file: File | null) => void) => (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setter(e.target.files[0]);
    }
  };

  const handleVendorSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!citizenshipId.trim()) {
      toast.error('Citizenship ID is required');
      return;
    }
    if (!frontImage || !backImage) {
      toast.error('Both front and back images are required');
      return;
    }

    const formData = new FormData();
    formData.append('citizenshipId', citizenshipId);
    formData.append('frontImage', frontImage);
    formData.append('backImage', backImage);

    try {
      setSubmitting(true);
      await api.post('/vendor/apply', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Vendor application submitted');
      refreshUser();
    } catch (error: any) {
      // Handled globally
    } finally {
      setSubmitting(false);
    }
  };

  const handleVendorCancel = async () => {
    try {
      setCancelling(true);
      await api.post('/vendor/cancel');
      toast.success('Vendor application cancelled');
      refreshUser();
    } catch (error: any) {
      // Handled globally
    } finally {
      setCancelling(false);
    }
  };

  const renderVendorStatus = () => {
    const base = 'font-medium tracking-wide uppercase text-xs';
    if (!vendorStatus) return <span className={`text-muted-foreground ${base}`}>Not Applied</span>;
    if (vendorStatus === 'PENDING') return <span className={`text-warning ${base}`}>Pending Review</span>;
    if (vendorStatus === 'APPROVED') return <span className={`text-success ${base}`}>Approved Vendor</span>;
    return <span className={`text-destructive ${base}`}>Rejected</span>;
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      <div className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight mb-2">Account Settings</h1>
        <p className="text-muted-foreground">Manage your profile, security, and partnership status.</p>
      </div>

      {/* Account overview */}
      <Card className="border-2 mb-8">
        <CardHeader>
          <CardTitle className="text-lg">Sign-in method</CardTitle>
          <CardDescription>How you access your account</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-3">
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusBadgeClass(usesGoogle ? 'info' : 'neutral')}`}
          >
            {authProviderLabel[user?.authProvider || 'LOCAL']}
          </span>
          {isGoogleOnly && (
            <p className="text-sm text-muted-foreground">
              Add a password below to also sign in with email, or complete your phone number for bookings.
            </p>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <Card className="border-2 shadow-sm transition-all hover:shadow-md">
          <CardHeader>
            <CardTitle className="text-xl">Personal Information</CardTitle>
            <CardDescription>Update your public profile details.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-5">
              <div>
                <Label htmlFor="name" className="text-sm font-semibold">Full Name</Label>
                <Input id="name" {...registerProfile('name')} className="mt-1.5" />
                {profileErrors.name && (
                  <p className="text-xs text-destructive mt-1.5">{profileErrors.name.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="email" className="text-sm font-semibold">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  {...registerProfile('email')}
                  className="mt-1.5"
                  disabled={user?.authProvider === 'GOOGLE'}
                />
                {user?.authProvider === 'GOOGLE' && (
                  <p className="text-xs text-muted-foreground mt-1.5">
                    Email is managed by Google for this account.
                  </p>
                )}
                {profileErrors.email && (
                  <p className="text-xs text-destructive mt-1.5">{profileErrors.email.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="phone" className="text-sm font-semibold">
                  Phone Number {isGoogleOnly && !user?.phone ? '(recommended)' : ''}
                </Label>
                <Input id="phone" type="tel" {...registerProfile('phone')} className="mt-1.5" />
                {profileErrors.phone && (
                  <p className="text-xs text-destructive mt-1.5">{profileErrors.phone.message}</p>
                )}
              </div>

              <Button type="submit" disabled={loading} className="w-full sm:w-auto">
                {loading ? 'Saving Changes...' : 'Save Profile'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="border-2 shadow-sm transition-all hover:shadow-md">
          <CardHeader>
            <CardTitle className="text-xl">Security</CardTitle>
            <CardDescription>
              {isGoogleOnly
                ? 'Set a password to enable email sign-in alongside Google.'
                : 'Update your password to keep your account secure.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isGoogleOnly ? (
              <form onSubmit={handleSetPasswordSubmit(onSetPasswordSubmit)} className="space-y-5">
                <div>
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    {...registerSetPassword('newPassword')}
                    className="mt-1.5"
                  />
                  {setPasswordErrors.newPassword && (
                    <p className="text-xs text-destructive mt-1.5">{setPasswordErrors.newPassword.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    {...registerSetPassword('confirmPassword')}
                    className="mt-1.5"
                  />
                  {setPasswordErrors.confirmPassword && (
                    <p className="text-xs text-destructive mt-1.5">{setPasswordErrors.confirmPassword.message}</p>
                  )}
                </div>
                <Button type="submit" disabled={passwordLoading} className="w-full sm:w-auto">
                  {passwordLoading ? 'Setting password...' : 'Set password'}
                </Button>
              </form>
            ) : (
              <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-5">
                <div>
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    {...registerPassword('currentPassword')}
                    className="mt-1.5"
                  />
                  {passwordErrors.currentPassword && (
                    <p className="text-xs text-destructive mt-1.5">{passwordErrors.currentPassword.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input id="newPassword" type="password" {...registerPassword('newPassword')} className="mt-1.5" />
                  {passwordErrors.newPassword && (
                    <p className="text-xs text-destructive mt-1.5">{passwordErrors.newPassword.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    {...registerPassword('confirmPassword')}
                    className="mt-1.5"
                  />
                  {passwordErrors.confirmPassword && (
                    <p className="text-xs text-destructive mt-1.5">{passwordErrors.confirmPassword.message}</p>
                  )}
                </div>
                <Button type="submit" disabled={passwordLoading} variant="outline" className="w-full sm:w-auto">
                  {passwordLoading ? 'Updating Password...' : 'Change Password'}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>

      {!isAdmin && !isVendor && (
        <Card className="border-2 border-primary/20 bg-primary/5 shadow-sm overflow-hidden mb-8">
          <CardHeader className="border-b bg-muted/30">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-xl">Vendor Partnership</CardTitle>
                <CardDescription>Sell or rent your properties on the platform.</CardDescription>
              </div>
              <div className="bg-background px-4 py-2 rounded-lg border flex items-center gap-2">
                <span className="text-xs text-muted-foreground font-semibold">Status:</span>
                {renderVendorStatus()}
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-8">
            {vendorStatus === 'APPROVED' ? (
              <div className="text-center py-6">
                <p className="text-lg font-medium text-success">You are an approved vendor!</p>
                <p className="text-muted-foreground mt-1">You can now add and manage properties.</p>
              </div>
            ) : (
              <form onSubmit={handleVendorSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="citizenshipId" className="text-sm font-semibold">Citizenship ID</Label>
                      <Input
                        id="citizenshipId"
                        value={citizenshipId}
                        onChange={(e) => setCitizenshipId(e.target.value)}
                        placeholder="Enter ID number"
                        className="mt-1.5"
                        disabled={vendorStatus === 'PENDING'}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground pt-2">
                      Please provide valid details. Your application will be reviewed by an administrator within 24-48
                      hours.
                    </p>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <Label className="text-sm font-semibold">Identity Verification</Label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-1.5">
                        <div className="space-y-2">
                          <Label htmlFor="frontImage" className="text-xs text-muted-foreground">Front Side</Label>
                          <Input
                            id="frontImage"
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange(setFrontImage)}
                            disabled={vendorStatus === 'PENDING'}
                            className="text-xs h-9 pt-1.5"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="backImage" className="text-xs text-muted-foreground">Back Side</Label>
                          <Input
                            id="backImage"
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange(setBackImage)}
                            disabled={vendorStatus === 'PENDING'}
                            className="text-xs h-9 pt-1.5"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 flex flex-col gap-3">
                      <Button type="submit" disabled={submitting || vendorStatus === 'PENDING'} className="w-full">
                        {submitting
                          ? 'Submitting Application...'
                          : vendorStatus === 'REJECTED'
                          ? 'Resubmit Application'
                          : 'Apply to Become Vendor'}
                      </Button>

                      {vendorStatus === 'PENDING' && (
                        <Button
                          type="button"
                          variant="ghost"
                          disabled={cancelling}
                          onClick={handleVendorCancel}
                          className="w-full text-destructive hover:text-destructive/80 hover:bg-destructive/10"
                        >
                          {cancelling ? 'Cancelling...' : 'Cancel Application'}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Profile;
