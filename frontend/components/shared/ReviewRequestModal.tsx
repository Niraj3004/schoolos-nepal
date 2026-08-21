"use client";

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';
import { api } from '@/lib/api';
import { useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';

interface ReviewRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: any; // The TenantSubscription populated object
}

export default function ReviewRequestModal({ isOpen, onClose, request }: ReviewRequestModalProps) {
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectInput, setShowRejectInput] = useState(false);
  
  const queryClient = useQueryClient();

  if (!request) return null;

  const handleApprove = async () => {
    setIsApproving(true);
    try {
      await api.patch(`/saas/admin/requests/${request._id}/approve`, { status: 'ACTIVE' });
      queryClient.invalidateQueries({ queryKey: ['adminRequests'] });
      onClose();
    } catch (error) {
      console.error(error);
      alert("Failed to approve request.");
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = async () => {
    if (!showRejectInput) {
      setShowRejectInput(true);
      return;
    }
    
    if (!rejectionReason) {
      alert("Please provide a rejection reason.");
      return;
    }

    setIsRejecting(true);
    try {
      await api.patch(`/saas/admin/requests/${request._id}/reject`, { 
        status: 'REJECTED', 
        rejectionReason 
      });
      queryClient.invalidateQueries({ queryKey: ['adminRequests'] });
      onClose();
    } catch (error) {
      console.error(error);
      alert("Failed to reject request.");
    } finally {
      setIsRejecting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Review Subscription Request">
      <div className="space-y-6">
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500 font-medium">School Name</p>
            <p className="font-semibold">{request.schoolId?.name}</p>
          </div>
          <div>
            <p className="text-gray-500 font-medium">Plan</p>
            <p className="font-semibold">{request.planId?.name} ({request.billingCycle})</p>
          </div>
          <div>
            <p className="text-gray-500 font-medium">Amount</p>
            <p className="font-semibold text-primary">रू {request.amountNPR}</p>
          </div>
          <div>
            <p className="text-gray-500 font-medium">Transaction Ref</p>
            <p className="font-semibold">{request.transactionReference || 'N/A'}</p>
          </div>
        </div>

        <div>
          <p className="text-gray-500 font-medium mb-2 text-sm">Uploaded Payment Receipt</p>
          {request.slipImageUrl ? (
            <div className="relative w-full h-64 border rounded-xl overflow-hidden bg-gray-50">
              <Image 
                src={request.slipImageUrl} 
                alt="Payment Receipt"
                fill
                style={{ objectFit: 'contain' }}
              />
            </div>
          ) : (
            <div className="p-4 bg-gray-100 rounded-lg text-center text-gray-500">
              No receipt uploaded.
            </div>
          )}
        </div>

        {showRejectInput && (
          <div className="space-y-2 p-4 bg-red-50 rounded-lg border border-red-100">
            <label className="text-sm font-medium text-red-800">Reason for rejection:</label>
            <Input 
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Invalid receipt, amount mismatch..."
            />
          </div>
        )}

        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose} disabled={isApproving || isRejecting}>
            Cancel
          </Button>
          
          <Button 
            variant="danger" 
            onClick={handleReject} 
            disabled={isApproving || isRejecting}
          >
            {isRejecting ? <Spinner size="sm" /> : showRejectInput ? "Confirm Rejection" : "Reject"}
          </Button>
          
          {!showRejectInput && (
            <Button 
              variant="default" 
              onClick={handleApprove}
              disabled={isApproving || isRejecting}
            >
              {isApproving ? <Spinner size="sm" /> : "Approve & Activate"}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
