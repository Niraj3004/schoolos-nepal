"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Select } from "@/components/ui/Select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table"
import { Modal } from "@/components/ui/Modal"
import { Toast } from "@/components/ui/Toast"
import { Spinner } from "@/components/ui/Spinner"
import { EmptyState } from "@/components/ui/EmptyState"

export default function StyleguidePage() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background p-8 font-sans">
      <div className="mx-auto max-w-6xl space-y-12">
        
        {/* Header */}
        <div className="space-y-4 pb-8 border-b">
          <h1 className="text-4xl font-bold text-foreground">SchoolOS Design System</h1>
          <p className="text-gray-500">Navy & Yellow Theme Tokens</p>
        </div>

        {/* Colors */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Theme Colors</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="h-20 rounded-md bg-primary border"></div>
              <p className="text-sm font-medium">Primary (Navy)</p>
            </div>
            <div className="space-y-2">
              <div className="h-20 rounded-md bg-accent border"></div>
              <p className="text-sm font-medium">Accent (Yellow)</p>
            </div>
            <div className="space-y-2">
              <div className="h-20 rounded-md bg-background border"></div>
              <p className="text-sm font-medium">Background</p>
            </div>
            <div className="space-y-2">
              <div className="h-20 rounded-md bg-card border"></div>
              <p className="text-sm font-medium">Card (White)</p>
            </div>
          </div>
        </section>

        {/* Typography */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Typography</h2>
          <div className="space-y-2 border rounded-lg p-6 bg-card text-card-foreground">
            <h1 className="text-4xl font-bold">Heading 1</h1>
            <h2 className="text-3xl font-semibold">Heading 2</h2>
            <h3 className="text-2xl font-semibold">Heading 3</h3>
            <h4 className="text-xl font-medium">Heading 4</h4>
            <p className="text-base text-gray-700">Regular paragraph text. The quick brown fox jumps over the lazy dog.</p>
            <p className="text-sm text-gray-500">Small secondary text.</p>
          </div>
        </section>

        {/* Buttons */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Buttons</h2>
          <div className="flex flex-wrap gap-4 items-center p-6 border rounded-lg bg-card">
            <Button>Default Button</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Danger</Button>
            <Button variant="link">Link</Button>
            <Button isLoading>Loading</Button>
            <Button size="sm">Small</Button>
            <Button size="lg">Large</Button>
          </div>
        </section>

        {/* Forms */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Forms</h2>
          <div className="grid md:grid-cols-2 gap-8 p-6 border rounded-lg bg-card">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Email Address</label>
                <Input placeholder="Enter your email" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Password (Error)</label>
                <Input type="password" value="wrongpass" error readOnly />
                <p className="text-xs text-danger">Invalid password</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Role Selection</label>
                <Select>
                  <option>Select a role...</option>
                  <option>Admin</option>
                  <option>Teacher</option>
                  <option>Student</option>
                </Select>
              </div>
            </div>
          </div>
        </section>

        {/* Badges */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Badges (Statuses)</h2>
          <div className="flex flex-wrap gap-4 p-6 border rounded-lg bg-card">
            <Badge>DEFAULT</Badge>
            <Badge variant="success">PAID</Badge>
            <Badge variant="warning">PENDING</Badge>
            <Badge variant="danger">ABSENT</Badge>
          </div>
        </section>

        {/* Cards */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Cards</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>School Statistics</CardTitle>
                <CardDescription>Overview of current term</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm">Main content area goes here.</p>
              </CardContent>
              <CardFooter className="justify-between">
                <Button variant="outline" size="sm">Cancel</Button>
                <Button size="sm">Save</Button>
              </CardFooter>
            </Card>
          </div>
        </section>

        {/* Table */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Tables</h2>
          <div className="bg-card p-4 border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">INV001</TableCell>
                  <TableCell><Badge variant="success">PAID</Badge></TableCell>
                  <TableCell>Bank Transfer</TableCell>
                  <TableCell className="text-right">रू 5,000</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">INV002</TableCell>
                  <TableCell><Badge variant="warning">PENDING</Badge></TableCell>
                  <TableCell>eSewa</TableCell>
                  <TableCell className="text-right">रू 2,500</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </section>

        {/* Modals & Feedback */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Feedback & Overlays</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6 p-6 border rounded-lg bg-card">
              <div>
                <h3 className="text-lg font-medium mb-4">Modal</h3>
                <Button onClick={() => setIsModalOpen(true)}>Open Modal</Button>
                <Modal 
                  isOpen={isModalOpen} 
                  onClose={() => setIsModalOpen(false)}
                  title="Example Modal"
                >
                  <p className="mb-6 text-gray-600">This is the content of the modal. It handles trapping focus and rendering an overlay.</p>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsModalOpen(false)}>Close</Button>
                    <Button onClick={() => setIsModalOpen(false)}>Confirm</Button>
                  </div>
                </Modal>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-4">Spinners</h3>
                <div className="flex gap-4 items-center">
                  <Spinner size="sm" />
                  <Spinner size="default" />
                  <Spinner size="lg" />
                </div>
              </div>
            </div>
            
            <div className="space-y-4 p-6 border rounded-lg bg-card flex flex-col justify-center bg-gray-50/50">
              <Toast title="Payment Successful" description="The transaction was completed." variant="success" />
              <Toast title="Network Error" description="Could not connect to the server." variant="error" />
              <Toast title="New Notice" description="Tomorrow is a public holiday." variant="info" />
            </div>
          </div>
        </section>

        {/* Empty States */}
        <section className="space-y-4 pb-20">
          <h2 className="text-2xl font-semibold">Empty States</h2>
          <EmptyState 
            title="No students found" 
            description="Get started by adding a new student to this class."
            action={<Button>Add Student</Button>}
          />
        </section>

      </div>
    </div>
  )
}
