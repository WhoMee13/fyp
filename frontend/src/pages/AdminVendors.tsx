import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '../components/ui/table';
import { Button } from '../components/ui/button';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { propertyStatusBadge } from '../lib/theme';

interface VendorUser {
  id: string;
  name: string;
  email: string;
  phone: string | null;
}

interface VendorApplication {
  id: string;
  citizenshipId: string;
  frontImagePath: string;
  backImagePath: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  user: VendorUser;
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

const AdminVendors = () => {
  const [applications, setApplications] = useState<VendorApplication[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });
  const [statusFilter, setStatusFilter] = useState<string>('PENDING');
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetchApplications();
  }, [pagination.page, statusFilter]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString()
      });
      if (statusFilter) params.append('status', statusFilter);

      const response = await api.get(`/admin/vendors?${params.toString()}`);
      setApplications(response.data.applications);
      setPagination(response.data.pagination);
    } catch (error: any) {
      // Handled globally
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  const handleDecision = async (id: string, action: 'approve' | 'reject') => {
    try {
      setUpdatingId(id);
      await api.put(`/admin/vendors/${id}/${action}`);
      toast.success(`Application ${action}d`);
      fetchApplications();
    } catch (error: any) {
      // Handled globally
    } finally {
      setUpdatingId(null);
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
          <h1 className="text-4xl font-bold mb-2">Vendor Applications</h1>
          <p className="text-lg text-muted-foreground">
            Review and approve vendor onboarding requests
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <Card className="border-2">
            <CardContent className="p-4 flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Filter by status to focus on pending, approved, or rejected applications.
                </p>
              </div>
              <div className="flex gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPagination((prev) => ({ ...prev, page: 1 }));
                  }}
                  className="px-4 py-2 border-2 border-input rounded-lg bg-background focus:border-primary focus:outline-none"
                >
                  <option value="">All Status</option>
                  <option value="PENDING">Pending</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-2 shadow-lg">
            <CardHeader>
              <CardTitle>
                Applications ({pagination.total}) - Page {pagination.page} of {pagination.pages || 1}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full"
                  />
                </div>
              ) : applications.length === 0 ? (
                <p className="text-muted-foreground text-center py-12">
                  No vendor applications found.
                </p>
              ) : (
                <>
                  <div className="rounded-lg border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead>User</TableHead>
                          <TableHead>Citizenship ID</TableHead>
                          <TableHead>Documents</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Applied At</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {applications.map((app, index) => (
                          <motion.tr
                            key={app.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="border-b hover:bg-muted/50 transition-colors"
                          >
                            <TableCell>
                              <div>
                                <div className="font-semibold">{app.user.name}</div>
                                <div className="text-sm text-muted-foreground">{app.user.email}</div>
                              </div>
                            </TableCell>
                            <TableCell>{app.citizenshipId}</TableCell>
                            <TableCell>
                              <div className="flex flex-col text-sm">
                                <a
                                  href={`http://localhost:5000${app.frontImagePath}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-primary hover:underline"
                                >
                                  Front
                                </a>
                                <a
                                  href={`http://localhost:5000${app.backImagePath}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-primary hover:underline"
                                >
                                  Back
                                </a>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${propertyStatusBadge(app.status)}`}
                              >
                                {app.status}
                              </span>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {new Date(app.createdAt).toLocaleString()}
                            </TableCell>
                            <TableCell className="text-right space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={updatingId === app.id || app.status === 'APPROVED'}
                                onClick={() => handleDecision(app.id, 'approve')}
                              >
                                {updatingId === app.id ? 'Updating...' : 'Approve'}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={updatingId === app.id || app.status === 'REJECTED'}
                                onClick={() => handleDecision(app.id, 'reject')}
                              >
                                Reject
                              </Button>
                            </TableCell>
                          </motion.tr>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {pagination.pages > 1 && (
                    <div className="flex justify-end mt-4 space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={pagination.page === 1}
                        onClick={() => handlePageChange(pagination.page - 1)}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={pagination.page === pagination.pages}
                        onClick={() => handlePageChange(pagination.page + 1)}
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminVendors;

