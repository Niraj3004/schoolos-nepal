"use client";

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { Plus } from 'lucide-react';
import AcademicYearModal from '@/components/shared/academic/AcademicYearModal';
import TermModal from '@/components/shared/academic/TermModal';
import ClassModal from '@/components/shared/academic/ClassModal';
import SubjectModal from '@/components/shared/academic/SubjectModal';
import SectionModal from '@/components/shared/academic/SectionModal';
import AllocationModal from '@/components/shared/academic/AllocationModal';

const TABS = ['Academic Years', 'Terms', 'Classes & Sections', 'Subjects', 'Teacher Allocations'] as const;
type Tab = typeof TABS[number];

export default function AcademicConfigurationPage() {
  const [activeTab, setActiveTab] = useState<Tab>('Academic Years');
  
  // Modal States
  const [isYearModalOpen, setIsYearModalOpen] = useState(false);
  const [isTermModalOpen, setIsTermModalOpen] = useState(false);
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
  const [isAllocationModalOpen, setIsAllocationModalOpen] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);

  // Queries
  const { data: yearsData, isLoading: isLoadingYears } = useQuery({
    queryKey: ['academicYears'],
    queryFn: () => api.get('/academic/academic-years'),
  });

  const { data: termsData, isLoading: isLoadingTerms } = useQuery({
    queryKey: ['terms'],
    queryFn: () => api.get('/academic/terms'),
  });

  const { data: classesData, isLoading: isLoadingClasses } = useQuery({
    queryKey: ['classes'],
    queryFn: () => api.get('/academic/classes'),
  });

  const { data: subjectsData, isLoading: isLoadingSubjects } = useQuery({
    queryKey: ['subjects'],
    queryFn: () => api.get('/academic/subjects'),
  });

  const { data: allocationsData, isLoading: isLoadingAllocations } = useQuery({
    queryKey: ['allocations'],
    queryFn: () => api.get('/academic/allocations'),
  });

  const years = (yearsData as any)?.data || [];
  const terms = (termsData as any)?.data || [];
  const classes = (classesData as any)?.data || [];
  const subjects = (subjectsData as any)?.data || [];
  const allocations = (allocationsData as any)?.data || [];

  return (
    <div className="space-y-6">
      
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">Academic Setup</h2>
          <p className="text-gray-500">Configure academic structure, classes, and subjects.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                ${activeTab === tab 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
              `}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-4">
        
        {/* ACADEMIC YEARS TAB */}
        {activeTab === 'Academic Years' && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Academic Years</CardTitle>
                <CardDescription>Manage your school's academic calendar years.</CardDescription>
              </div>
              <Button onClick={() => setIsYearModalOpen(true)} size="sm">
                <Plus className="w-4 h-4 mr-1" /> Add Year
              </Button>
            </CardHeader>
            <CardContent>
              {isLoadingYears ? <Spinner /> : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                      <tr>
                        <th className="px-6 py-3">Name</th>
                        <th className="px-6 py-3">Start Date (BS)</th>
                        <th className="px-6 py-3">End Date (BS)</th>
                        <th className="px-6 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {years.map((y: any) => (
                        <tr key={y._id} className="border-b hover:bg-gray-50">
                          <td className="px-6 py-4 font-medium text-gray-900">{y.name}</td>
                          <td className="px-6 py-4">{y.startDateBS}</td>
                          <td className="px-6 py-4">{y.endDateBS}</td>
                          <td className="px-6 py-4">
                            {y.isCurrent 
                              ? <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Current</span>
                              : <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Past/Future</span>
                            }
                          </td>
                        </tr>
                      ))}
                      {years.length === 0 && (
                        <tr><td colSpan={4} className="px-6 py-4 text-center">No academic years found.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* TERMS TAB */}
        {activeTab === 'Terms' && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Terms</CardTitle>
                <CardDescription>Configure exam terms (e.g. First Term, Mid Term, Final).</CardDescription>
              </div>
              <Button onClick={() => setIsTermModalOpen(true)} size="sm">
                <Plus className="w-4 h-4 mr-1" /> Add Term
              </Button>
            </CardHeader>
            <CardContent>
              {isLoadingTerms ? <Spinner /> : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                      <tr>
                        <th className="px-6 py-3">Term Name</th>
                        <th className="px-6 py-3">Order</th>
                        <th className="px-6 py-3">Start Date (BS)</th>
                        <th className="px-6 py-3">End Date (BS)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {terms.map((t: any) => (
                        <tr key={t._id} className="border-b hover:bg-gray-50">
                          <td className="px-6 py-4 font-medium text-gray-900">{t.name}</td>
                          <td className="px-6 py-4">{t.termOrder}</td>
                          <td className="px-6 py-4">{t.startDateBS}</td>
                          <td className="px-6 py-4">{t.endDateBS}</td>
                        </tr>
                      ))}
                      {terms.length === 0 && (
                        <tr><td colSpan={4} className="px-6 py-4 text-center">No terms found.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* CLASSES & SECTIONS TAB */}
        {activeTab === 'Classes & Sections' && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Classes & Sections</CardTitle>
                <CardDescription>Manage grades and their respective sections.</CardDescription>
              </div>
              <Button onClick={() => setIsClassModalOpen(true)} size="sm">
                <Plus className="w-4 h-4 mr-1" /> Add Class
              </Button>
            </CardHeader>
            <CardContent>
              {isLoadingClasses ? <Spinner /> : (
                <div className="space-y-4">
                  {classes.map((c: any) => (
                    <div key={c._id} className="border rounded-lg p-4 bg-gray-50/50">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-semibold text-lg text-gray-900">{c.name} <span className="text-xs text-gray-500 font-normal ml-2">Numeric: {c.numericValue}</span></h4>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => {
                            setSelectedClassId(c._id);
                            setIsSectionModalOpen(true);
                          }}
                        >
                          <Plus className="w-4 h-4 mr-1" /> Add Section
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {c.sections && c.sections.length > 0 ? (
                          c.sections.map((s: any) => (
                            <div key={s._id} className="px-3 py-1 bg-white border shadow-sm rounded-md text-sm">
                              Section {s.name} <span className="text-gray-400 text-xs ml-1">(Cap: {s.capacity})</span>
                            </div>
                          ))
                        ) : (
                          <span className="text-sm text-gray-500 italic">No sections created yet.</span>
                        )}
                      </div>
                    </div>
                  ))}
                  {classes.length === 0 && (
                    <div className="text-center py-4 text-gray-500">No classes found.</div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* SUBJECTS TAB */}
        {activeTab === 'Subjects' && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Subjects</CardTitle>
                <CardDescription>Master list of all subjects taught in the school.</CardDescription>
              </div>
              <Button onClick={() => setIsSubjectModalOpen(true)} size="sm">
                <Plus className="w-4 h-4 mr-1" /> Add Subject
              </Button>
            </CardHeader>
            <CardContent>
              {isLoadingSubjects ? <Spinner /> : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                      <tr>
                        <th className="px-6 py-3">Name / Code</th>
                        <th className="px-6 py-3">Type</th>
                        <th className="px-6 py-3">Credits</th>
                        <th className="px-6 py-3">Theory (F/P)</th>
                        <th className="px-6 py-3">Practical (F/P)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subjects.map((s: any) => (
                        <tr key={s._id} className="border-b hover:bg-gray-50">
                          <td className="px-6 py-4 font-medium text-gray-900">
                            {s.name} <br/> <span className="text-xs text-gray-400">{s.code}</span>
                          </td>
                          <td className="px-6 py-4">
                            {s.isOptional ? 'Optional' : 'Compulsory'}
                          </td>
                          <td className="px-6 py-4">{s.creditHours}</td>
                          <td className="px-6 py-4">{s.theoryFullMarks} / {s.theoryPassMarks}</td>
                          <td className="px-6 py-4">{s.practicalFullMarks} / {s.practicalPassMarks}</td>
                        </tr>
                      ))}
                      {subjects.length === 0 && (
                        <tr><td colSpan={5} className="px-6 py-4 text-center">No subjects found.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* TEACHER ALLOCATIONS TAB */}
        {activeTab === 'Teacher Allocations' && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Teacher Allocations</CardTitle>
                <CardDescription>Assign teachers to specific subjects and classes.</CardDescription>
              </div>
              <Button onClick={() => setIsAllocationModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" /> Assign Teacher
              </Button>
            </CardHeader>
            <CardContent>
              {isLoadingAllocations ? (
                <div className="flex justify-center p-8"><Spinner /></div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                      <tr>
                        <th className="px-6 py-3">Teacher</th>
                        <th className="px-6 py-3">Subject</th>
                        <th className="px-6 py-3">Class</th>
                        <th className="px-6 py-3">Section</th>
                        <th className="px-6 py-3">Academic Year</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allocations.map((a: any) => (
                        <tr key={a._id} className="border-b hover:bg-gray-50">
                          <td className="px-6 py-4 font-medium text-gray-900">{a.teacherId?.firstName} {a.teacherId?.lastName}</td>
                          <td className="px-6 py-4">{a.subjectId?.name} ({a.subjectId?.code})</td>
                          <td className="px-6 py-4">{a.classId?.name}</td>
                          <td className="px-6 py-4">{a.sectionId?.name}</td>
                          <td className="px-6 py-4">{a.academicYearId?.name} {a.academicYearId?.isCurrent && '(Current)'}</td>
                        </tr>
                      ))}
                      {allocations.length === 0 && (
                        <tr><td colSpan={5} className="px-6 py-4 text-center">No teachers allocated yet.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modals */}
      <AcademicYearModal isOpen={isYearModalOpen} onClose={() => setIsYearModalOpen(false)} />
      <TermModal isOpen={isTermModalOpen} onClose={() => setIsTermModalOpen(false)} years={years} />
      <ClassModal isOpen={isClassModalOpen} onClose={() => setIsClassModalOpen(false)} />
      <SubjectModal isOpen={isSubjectModalOpen} onClose={() => setIsSubjectModalOpen(false)} />
      <AllocationModal isOpen={isAllocationModalOpen} onClose={() => setIsAllocationModalOpen(false)} />
      {selectedClassId && (
        <SectionModal 
          isOpen={isSectionModalOpen} 
          onClose={() => {
            setIsSectionModalOpen(false);
            setSelectedClassId(null);
          }} 
          classId={selectedClassId} 
        />
      )}

    </div>
  );
}
