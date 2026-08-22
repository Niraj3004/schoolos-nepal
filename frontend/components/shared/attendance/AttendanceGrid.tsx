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
  { value: 'PRESENT', label: 'P', color: 'border-success/30 text-success bg-white', activeColor: 'bg-success text-white border-success shadow-sm shadow-success/20' },
  { value: 'ABSENT', label: 'A', color: 'border-danger/30 text-danger bg-white', activeColor: 'bg-danger text-white border-danger shadow-sm shadow-danger/20' },
  { value: 'LATE', label: 'L', color: 'border-warning/30 text-warning bg-white', activeColor: 'bg-warning text-white border-warning shadow-sm shadow-warning/20' },
  { value: 'EXCUSED', label: 'E', color: 'border-blue-300 text-blue-600 bg-white', activeColor: 'bg-blue-500 text-white border-blue-500 shadow-sm shadow-blue-500/20' },
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
      <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg border text-sm">
        <span className="text-gray-500 font-medium">Summary:</span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-success" />
          <span className="font-medium">{counts.PRESENT || 0}</span>
          <span className="text-gray-400">Present</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-danger" />
          <span className="font-medium">{counts.ABSENT || 0}</span>
          <span className="text-gray-400">Absent</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-warning" />
          <span className="font-medium">{counts.LATE || 0}</span>
          <span className="text-gray-400">Late</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
          <span className="font-medium">{counts.EXCUSED || 0}</span>
          <span className="text-gray-400">Excused</span>
        </span>
        <span className="ml-auto text-gray-500">{students.length} students</span>
      </div>

      {/* Grid */}
      <div className="rounded-lg border overflow-hidden bg-white">
        {/* Header */}
        <div className="grid grid-cols-[auto_1fr_auto] items-center gap-4 px-4 py-3 bg-gray-50 border-b text-sm font-medium text-gray-500">
          <div className="w-10 text-center">#</div>
          <div>Student</div>
          <div className="flex gap-3 min-w-[200px] justify-center">
            {STATUS_OPTIONS.map(opt => (
              <div key={opt.value} className="w-10 text-center text-xs">{opt.value}</div>
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
              <div className="flex gap-2 min-w-[200px] justify-center">
                {STATUS_OPTIONS.map(opt => {
                  const isActive = currentStatus === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      disabled={disabled}
                      onClick={() => onEntryChange(student._id, opt.value)}
                      className={cn(
                        "w-10 h-10 rounded-lg border-2 text-sm font-bold transition-all duration-150",
                        "focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary/30",
                        "disabled:opacity-50 disabled:cursor-not-allowed",
                        isActive ? opt.activeColor : opt.color,
                        !isActive && !disabled && "hover:scale-105 cursor-pointer",
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
