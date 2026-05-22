import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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
import { CheckCircle, XCircle, Trash2, Image as ImageIcon } from 'lucide-react';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { propertyStatusBadge, statusBadgeClass } from '../lib/theme';

interface Property {
  id: string;
  title: string;
  status: string;
  propertyType: string;
  purpose: string;
  price: number;
  owner: { name: string; email: string };
  location: { city: string } | null;
  images: Array<{ imageUrl: string }>;
  createdAt: string;
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

const AdminProperties = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchProperties();
  }, [pagination.page, searchTerm, statusFilter]);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });
      
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter) params.append('status', statusFilter);

      const response = await api.get(`/admin/properties?${params}`);
      setProperties(response.data.properties);
      setPagination(response.data.pagination);
    } catch (error: any) {
      toast.error('Failed to load properties');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await api.put(`/admin/properties/${id}/approve`);
      toast.success('Property approved');
      fetchProperties();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to approve property');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await api.put(`/admin/properties/${id}/reject`);
      toast.success('Property rejected');
      fetchProperties();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to reject property');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this property?')) return;

    try {
      await api.delete(`/admin/properties/${id}`);
      toast.success('Property deleted');
      fetchProperties();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to delete property');
    }
  };

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2">Manage Properties</h1>
          <p className="text-lg text-muted-foreground">Review and manage property listings</p>
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
                    placeholder="Search properties by title, owner, or location..."
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
                    <option value="PENDING">Pending</option>
                    <option value="APPROVED">Approved</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Properties Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-2 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Properties ({pagination.total})</span>
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
              ) : properties.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground text-lg">No properties found</p>
                </div>
              ) : (
                <>
                  <div className="rounded-lg border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead>Property</TableHead>
                          <TableHead>Owner</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Location</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {properties.map((property, index) => (
                          <motion.tr
                            key={property.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="border-b hover:bg-muted/50 transition-colors"
                          >
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                                  {property.images.length > 0 ? (
                                    <img
                                      src={`http://localhost:5000${property.images[0].imageUrl}`}
                                      alt={property.title}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                      <ImageIcon className="h-4 w-4" />
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <Link 
                                    to={`/properties/${property.id}`}
                                    className="font-semibold hover:text-primary transition-colors"
                                  >
                                    {property.title}
                                  </Link>
                                  <div className="text-sm text-muted-foreground">
                                    {property.purpose}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">{property.owner.name}</div>
                                <div className="text-sm text-muted-foreground">{property.owner.email}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusBadgeClass('info')}`}>
                                {property.propertyType}
                              </span>
                            </TableCell>
                            <TableCell className="font-semibold">
                              {formatPrice(property.price)}
                            </TableCell>
                            <TableCell>
                              {property.location?.city || <span className="text-muted-foreground">No location</span>}
                            </TableCell>
                            <TableCell>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${propertyStatusBadge(property.status)}`}>
                                {property.status}
                              </span>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {new Date(property.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex gap-2 justify-end">
                                {property.status === 'PENDING' && (
                                  <>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleApprove(property.id)}
                                      className="text-success hover:text-success/80"
                                    >
                                      <CheckCircle className="h-4 w-4 mr-1" />
                                      Approve
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleReject(property.id)}
                                      className="text-destructive hover:text-destructive/80"
                                    >
                                      <XCircle className="h-4 w-4 mr-1" />
                                      Reject
                                    </Button>
                                  </>
                                )}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDelete(property.id)}
                                  className="text-destructive hover:text-destructive/80"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
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

export default AdminProperties;

