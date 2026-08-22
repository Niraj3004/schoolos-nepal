"use client";

import React from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { BookOpen } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';

export default function StudentExamsPage() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">Exams & Results</h2>
        <p className="text-gray-500">View your upcoming exam schedules and past results.</p>
      </div>

      <Card>
        <CardContent className="p-12 flex flex-col items-center justify-center text-center">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <BookOpen className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">No Exams Scheduled</h3>
          <p className="mt-2 text-sm text-gray-500 max-w-sm">
            You currently have no upcoming exams or published results to display. Check back later!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
