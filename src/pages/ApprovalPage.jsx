import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, X, RefreshCw, AlertTriangle, Info } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';

const ApprovalPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { toast } = useToast();

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: requestData, error: requestError } = await supabase
        .from('deletion_requests')
        .select('*')
        .eq('status', 'pending')
        .order('requested_at', { ascending: true });

      if (requestError) throw requestError;
      if (!requestData || requestData.length === 0) {
        setRequests([]);
        setLoading(false);
        return;
      }

      const userIds = [...new Set(requestData.map(req => req.user_id).filter(Boolean))];

      if (userIds.length === 0) {
        const enrichedRequests = requestData.map(req => ({...req, user: { full_name: 'Unknown User' } }));
        setRequests(enrichedRequests);
        setLoading(false);
        return;
      }

      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', userIds);
      
      if (profilesError) throw profilesError;

      const profilesMap = new Map(profilesData.map(p => [p.id, p]));

      const enrichedRequests = requestData.map(req => ({
        ...req,
        user: profilesMap.get(req.user_id) || { full_name: 'Unknown User' }
      }));
      
      setRequests(enrichedRequests);

    } catch (err) {
      setError(err.message);
      toast({
        variant: "destructive",
        title: "Error fetching requests",
        description: err.message,
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleDecision = async (id, newStatus) => {
    try {
      const { data: request, error: fetchError } = await supabase
          .from('deletion_requests')
          .select('item_id, item_type, status')
          .eq('id', id)
          .single();

      if (fetchError || !request) {
          throw fetchError || new Error("Request not found");
      }
      
      if (request.status !== 'pending') {
          toast({
              variant: "destructive",
              title: "Action Already Taken",
              description: `This request has already been ${request.status}.`,
          });
          setRequests(prev => prev.filter(r => r.id !== id));
          return;
      }
      
      if (newStatus === 'approved') {
        const tableName = request.item_type;
        if(tableName && request.item_id) {
            const { error: deleteError } = await supabase
                .from(tableName)
                .delete()
                .eq('id', request.item_id);

            if (deleteError) {
                // If RLS prevents deletion, it might throw an error.
                // We should still update the request status to 'rejected' or something similar.
                // For now, we just throw the error.
                throw new Error(`Failed to delete item: ${deleteError.message}`);
            }
        } else {
             // If item_type or item_id is missing, we cannot proceed.
             throw new Error(`Invalid item_type or item_id for deletion request.`);
        }
      }

      const { error: updateError } = await supabase
        .from('deletion_requests')
        .update({ status: newStatus, resolved_at: new Date().toISOString() })
        .eq('id', id);

      if (updateError) throw updateError;

      toast({
        title: `Request ${newStatus}`,
        description: `The deletion request has been ${newStatus}.`,
      });
      setRequests(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error processing request",
        description: err.message,
      });
    }
  };

  const renderItemData = (itemData) => {
    if (!itemData) return <p className="text-sm text-muted-foreground">No item data available.</p>;
    return (
        <ul className="text-sm text-muted-foreground space-y-1 mt-2">
            {Object.entries(itemData).map(([key, value]) => (
                <li key={key} className="flex justify-between">
                    <span className="font-semibold capitalize">{key.replace(/_/g, ' ')}:</span>
                    <span>{typeof value === 'object' ? JSON.stringify(value) : value.toString()}</span>
                </li>
            ))}
        </ul>
    );
  }

  return (
    <>
      <Helmet>
        <title>Approval Management - Bangali Enterprise</title>
        <meta name="description" content="Manage deletion requests for approval." />
      </Helmet>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Approval Requests</h1>
            <p className="text-muted-foreground">Review and approve or reject pending deletion requests.</p>
          </div>
          <Button onClick={fetchRequests} disabled={loading} variant="outline">
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
        
        {loading && <p>Loading requests...</p>}
        {error && <p className="text-destructive">Error: {error}</p>}

        {!loading && !error && requests.length === 0 && (
          <Card className="text-center py-12">
            <CardHeader>
              <Info className="mx-auto h-12 w-12 text-muted-foreground" />
              <CardTitle className="mt-4">No Pending Requests</CardTitle>
              <CardDescription>There are no pending deletion requests to review at this time.</CardDescription>
            </CardHeader>
          </Card>
        )}

        <AnimatePresence>
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {requests.map((request, index) => (
              <motion.div
                key={request.id}
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                transition={{ delay: index * 0.05 }}
              >
                  <Card>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="capitalize text-lg">{request.item_type} Deletion</CardTitle>
                            <CardDescription>
                              Requested by {request.user?.full_name || 'Unknown User'}
                            </CardDescription>
                          </div>
                          <Badge variant="secondary">{new Date(request.requested_at).toLocaleDateString()}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm font-semibold">Reason:</p>
                      <p className="text-sm text-muted-foreground mb-4 italic">"{request.reason || 'No reason provided'}"</p>
                      
                      <p className="text-sm font-semibold mb-2">Item Details:</p>
                      <div className="p-3 rounded-md border bg-muted/50">
                        {renderItemData(request.item_data)}
                      </div>

                      <div className="flex justify-end gap-2 mt-6">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm"><X className="mr-2 h-4 w-4" />Reject</Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure you want to reject?</AlertDialogTitle>
                              <AlertDialogDescription>This action cannot be undone. The item will not be deleted.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDecision(request.id, 'rejected')} className="bg-destructive hover:bg-destructive/90">Confirm Reject</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="default" size="sm"><Check className="mr-2 h-4 w-4" />Approve</Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                               <div className="flex items-center space-x-2">
                                <AlertTriangle className="h-6 w-6 text-destructive" />
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                               </div>
                              <AlertDialogDescription>This action will permanently delete the item. This cannot be undone.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDecision(request.id, 'approved')}>Confirm Approve</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </CardContent>
                  </Card>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      </div>
    </>
  );
};

export default ApprovalPage;