"use client";

import React from 'react';
import { cn } from '@/lib/utils';

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';

export interface AttendanceEntry {
  studentId: string;
  status: AttendanceStatus;
  remarks?: string;
}

export interface StudentInfo {
  _id: string;
  firstName: string;
  lastName: string;
  rollNumber?: number;
  avatarUrl?: string;
  admissionNumber?: string;
}

interface AttendanceGridProps {
  students: StudentInfo[];
  entries: AttendanceEntry[];
  onEntryChange: (studentId: string, status: AttendanceStatus) => void;
  disabled?: boolean;
}

const STATUS_OPTIONS: { value: AttendanceStatus; label: string; color: string; activeColor: string }[] = [
  { value: 'PRESENT', label: 'Present', color: 'border-emerald-200 text-emerald-600 bg-emerald-50/50 hover:bg-emerald-50', activeColor: 'bg-emerald-500 text-white border-emerald-500 shadow-sm' },
  { value: 'ABSENT', label: 'Absent', color: 'border-red-200 text-red-600 bg-red-50/50 hover:bg-red-50', activeColor: 'bg-red-500 text-white border-red-500 shadow-sm' },
  { value: 'LATE', label: 'Late', color: 'border-amber-200 text-amber-600 bg-amber-50/50 hover:bg-amber-50', activeColor: 'bg-amber-500 text-white border-amber-500 shadow-sm' },
  { value: 'EXCUSED', label: 'Excused', color: 'border-blue-200 text-blue-600 bg-blue-50/50 hover:bg-blue-50', activeColor: 'bg-blue-500 text-white border-blue-500 shadow-sm' },
];

export function AttendanceGrid({ students, entries, onEntryChange, disabled = false }: AttendanceGridProps) {
  const getStudentStatus = (studentId: string): AttendanceStatus => {
    const entry = entries.find(e => e.studentId === studentId);
    return entry?.status || 'PRESENT';
  };

  if (students.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed rounded-lg bg-gray-50/50">
        <div className="text-gray-400 text-sm">No students found for this class/section.</div>
      </div>
    );
  }

  // Summary counts
  const counts = entries.reduce((acc, e) => {
    acc[e.status] = (acc[e.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-4">
      {/* Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6">
        <div className="flex flex-col items-center justify-center p-4 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <span className="text-3xl font-black text-slate-800">{students.length}</span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Total</span>
        </div>
        <div className="flex flex-col items-center justify-center p-4 bg-emerald-50 border border-emerald-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <span className="text-3xl font-black text-emerald-600">{counts.PRESENT || 0}</span>
          <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mt-1">Present</span>
        </div>
        <div className="flex flex-col items-center justify-center p-4 bg-red-50 border border-red-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <span className="text-3xl font-black text-red-600">{counts.ABSENT || 0}</span>
          <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest mt-1">Absent</span>
        </div>
        <div className="flex flex-col items-center justify-center p-4 bg-amber-50 border border-amber-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <span className="text-3xl font-black text-amber-600">{counts.LATE || 0}</span>
          <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mt-1">Late</span>
        </div>
        <div className="flex flex-col items-center justify-center p-4 bg-blue-50 border border-blue-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <span className="text-3xl font-black text-blue-600">{counts.EXCUSED || 0}</span>
          <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mt-1">Excused</span>
        </div>
      </div>

      {/* Grid */}
      <div className="rounded-3xl border border-slate-100 overflow-hidden bg-white shadow-sm">
        {/* Header */}
        <div className="grid grid-cols-[auto_1fr_auto] items-center gap-4 px-6 py-4 bg-slate-50/80 backdrop-blur-sm border-b text-xs font-bold text-slate-500 uppercase tracking-wider">
          <div className="w-12 text-center">Roll</div>
          <div>Student Details</div>
          <div className="flex gap-2 min-w-[340px] justify-center opacity-0 sm:opacity-100">
            {/* We hide the header text on mobile because it gets cramped, but keep the spacing */}
            {STATUS_OPTIONS.map(opt => (
              <div key={opt.value} className="w-20 text-center text-[10px] tracking-wider">{opt.label}</div>
            ))}
          </div>
        </div>

        {/* Rows */}
        {students.map((student, idx) => {
          const currentStatus = getStudentStatus(student._id);
          return (
            <div
              key={student._id}
              className={cn(
                "grid grid-cols-[auto_1fr_auto] items-center gap-4 px-4 py-3 border-b last:border-0 transition-colors",
                currentStatus === 'ABSENT' && "bg-danger/3",
                currentStatus === 'LATE' && "bg-warning/3",
              )}
            >
              {/* Roll */}
              <div className="w-10 text-center text-sm font-mono text-gray-400">
                {student.rollNumber || idx + 1}
              </div>

              {/* Student Info */}
              <div className="flex items-center gap-3">
                {student.avatarUrl ? (
                  <img
                    src={student.avatarUrl}
                    alt={`${student.firstName} ${student.lastName}`}
                    className="h-8 w-8 rounded-full object-cover border border-gray-200"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-xs">
                    {student.firstName?.charAt(0)}{student.lastName?.charAt(0)}
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {student.firstName} {student.lastName}
                  </p>
                  {student.admissionNumber && (
                    <p className="text-xs text-gray-400">{student.admissionNumber}</p>
                  )}
                </div>
              </div>

              {/* Status Radio Toggle Group */}
              <div className="flex gap-2 min-w-[340px] justify-center">
                {STATUS_OPTIONS.map(opt => {
                  const isActive = currentStatus === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      disabled={disabled}
                      onClick={() => onEntryChange(student._id, opt.value)}
                      className={cn(
                        "w-20 h-10 rounded-xl border font-bold text-xs transition-all duration-200",
                        "focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary/30",
                        "disabled:opacity-50 disabled:cursor-not-allowed",
                        isActive ? opt.activeColor : opt.color,
                        !isActive && !disabled && "hover:bg-opacity-80 cursor-pointer",
                      )}
                      title={opt.value}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
