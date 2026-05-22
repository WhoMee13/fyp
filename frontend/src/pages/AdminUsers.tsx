import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { SearchInput } from '../components/ui/search';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../components/ui/table';
import { 
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '../components/ui/pagination';
import { UserCheck, UserX, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { userRoleBadge, userStatusBadge } from '../lib/theme';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  status: string;
  createdAt: string;
  _count: { properties: number };
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

const AdminUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  useEffect(() => {
    fetchUsers();
  }, [pagination.page, searchTerm, statusFilter, roleFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });
      
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter) params.append('status', statusFilter);
      if (roleFilter) params.append('role', roleFilter);

      const response = await api.get(`/admin/users?${params}`);
      setUsers(response.data.users);
      setPagination(response.data.pagination);
    } catch (error: any) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    
    try {
      await api.put(`/admin/users/${id}/status`, { status: newStatus });
      toast.success(`User ${newStatus.toLowerCase()}`);
      fetchUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update user status');
    }
  };

  const handleRoleToggle = async (id: string, currentRole: string) => {
    const newRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN';

    try {
      await api.put(`/admin/users/${id}/role`, { role: newRole });
      toast.success(`User role updated to ${newRole.toLowerCase()}`);
      fetchUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update user role');
    }
  };

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2">Manage Users</h1>
          <p className="text-lg text-muted-foreground">View and manage user accounts</p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <Card className="border-2">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <SearchInput
                    placeholder="Search users by name or email..."
                    onSearch={handleSearch}
                    className="w-full"
                  />
                </div>
                <div className="flex gap-2">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 border-2 border-input rounded-lg bg-background focus:border-primary focus:outline-none"
                  >
                    <option value="">All Status</option>
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="px-4 py-2 border-2 border-input rounded-lg bg-background focus:border-primary focus:outline-none"
                  >
                    <option value="">All Roles</option>
                    <option value="USER">User</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Users Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-2 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Users ({pagination.total})</span>
                <span className="text-sm font-normal text-muted-foreground">
                  Page {pagination.page} of {pagination.pages}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full"
                  />
                </div>
              ) : users.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground text-lg">No users found</p>
                </div>
              ) : (
                <>
                  <div className="rounded-lg border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead>User</TableHead>
                          <TableHead>Contact</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Properties</TableHead>
                          <TableHead>Joined</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users.map((user, index) => (
                          <motion.tr
                            key={user.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="border-b hover:bg-muted/50 transition-colors"
                          >
                            <TableCell>
                              <div>
                                <div className="font-semibold">{user.name}</div>
                                <div className="text-sm text-muted-foreground">{user.email}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              {user.phone || <span className="text-muted-foreground">No phone</span>}
                            </TableCell>
                            <TableCell>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${userRoleBadge(user.role)}`}>
                                {user.role}
                              </span>
                            </TableCell>
                            <TableCell>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${userStatusBadge(user.status)}`}>
                                {user.status}
                              </span>
                            </TableCell>
                            <TableCell>{user._count.properties}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {new Date(user.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-right space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleStatusChange(user.id, user.status)}
                                className={user.status === 'ACTIVE' ? 'text-destructive hover:text-destructive/80' : 'text-success hover:text-success/80'}
                              >
                                {user.status === 'ACTIVE' ? (
                                  <>
                                    <UserX className="h-4 w-4 mr-1" />
                                    Deactivate
                                  </>
                                ) : (
                                  <>
                                    <UserCheck className="h-4 w-4 mr-1" />
                                    Activate
                                  </>
                                )}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRoleToggle(user.id, user.role)}
                                className="ml-2"
                              >
                                {user.role === 'ADMIN' ? (
                                  <>
                                    <ArrowDownCircle className="h-4 w-4 mr-1" />
                                    Make User
                                  </>
                                ) : (
                                  <>
                                    <ArrowUpCircle className="h-4 w-4 mr-1" />
                                    Make Admin
                                  </>
                                )}
                              </Button>
                            </TableCell>
                          </motion.tr>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Pagination */}
                  {pagination.pages > 1 && (
                    <div className="mt-6">
                      <Pagination>
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious
                              onClick={() => handlePageChange(pagination.page - 1)}
                              disabled={pagination.page === 1}
                            />
                          </PaginationItem>
                          
                          {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                            <PaginationItem key={page}>
                              <PaginationLink
                                isActive={page === pagination.page}
                                onClick={() => handlePageChange(page)}
                              >
                                {page}
                              </PaginationLink>
                            </PaginationItem>
                          ))}
                          
                          <PaginationItem>
                            <PaginationNext
                              onClick={() => handlePageChange(pagination.page + 1)}
                              disabled={pagination.page === pagination.pages}
                            />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
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

export default AdminUsers;

