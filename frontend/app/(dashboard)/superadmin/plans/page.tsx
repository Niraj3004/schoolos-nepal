"use client";

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { Plus, CheckCircle2 } from 'lucide-react';
import PlanModal from '@/components/shared/saas/PlanModal';

export default function SuperadminPlansPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: response, isLoading, error } = useQuery({
    queryKey: ['saasPlans'],
    queryFn: () => api.get('/saas/plans') // Note: public endpoint used here since it fetches plans
  });

  const plans: any[] = (response as any)?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">SaaS Plans</h2>
          <p className="text-gray-500">Manage subscription tiers and pricing for schools.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" /> Add Plan
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10"><Spinner /></div>
      ) : error ? (
        <div className="text-danger p-4 bg-red-50 rounded-lg">Failed to load plans.</div>
      ) : (
        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <Card key={plan._id} className={!plan.isActive ? 'opacity-60' : ''}>
              <CardHeader className="pb-4">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-xl font-bold text-primary">{plan.name}</CardTitle>
                  {!plan.isActive && <span className="px-2 py-1 text-xs bg-gray-200 rounded-full text-gray-600">Inactive</span>}
                </div>
                <CardDescription>Up to {plan.maxStudents.toLocaleString()} Students</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <span className="text-3xl font-extrabold text-gray-900">
                    रू {plan.priceNPRPerYear.toLocaleString()}
                  </span>
                  <span className="text-gray-500 text-sm font-medium"> / year</span>
                </div>
                
                <div className="space-y-3 border-t pt-4">
                  <p className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Features</p>
                  <ul className="space-y-2">
                    {plan.features.map((feature: string, idx: number) => (
                      <li key={idx} className="flex items-start">
                        <CheckCircle2 className="w-5 h-5 text-success shrink-0 mr-2" />
                        <span className="text-sm text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          ))}
          {plans.length === 0 && (
            <div className="col-span-full py-12 text-center border-2 border-dashed rounded-lg text-gray-500">
              No SaaS plans configured yet. Click "Add Plan" to create one.
            </div>
          )}
        </div>
      )}

      <PlanModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
