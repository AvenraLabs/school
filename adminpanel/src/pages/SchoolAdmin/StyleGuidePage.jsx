import React, { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui/Card';
import { Input, Select, Textarea } from '../../components/ui/Input';
import { Table } from '../../components/ui/Table';
import { StatsCard } from '../../components/common/StatsCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { EmptyState } from '../../components/common/EmptyState';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { useToast } from '../../context/ToastContext';
import {
  Users,
  GraduationCap,
  IndianRupee,
  Calendar,
  Search,
  Plus,
  Trash2,
  Check,
  AlertCircle,
  Inbox,
  Filter
} from 'lucide-react';

export function StyleGuidePage() {
  const toast = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const sampleData = [
    { id: 'STU-001', name: 'Aarav Sharma', class: 'Grade 10-A', roll: '1001', status: 'active', fee: '₹14,500' },
    { id: 'STU-002', name: 'Ananya Verma', class: 'Grade 10-B', roll: '1002', status: 'pending', fee: '₹12,000' },
    { id: 'STU-003', name: 'Rohan Gupta', class: 'Grade 9-A', roll: '0905', status: 'overdue', fee: '₹18,200' },
    { id: 'STU-004', name: 'Priya Nair', class: 'Grade 11-C', roll: '1114', status: 'inactive', fee: '₹0' },
  ];

  const columns = [
    { header: 'Student ID', accessorKey: 'id', cell: (info) => <span className="font-mono text-xs font-semibold">{info.getValue()}</span> },
    { header: 'Full Name', accessorKey: 'name', cell: (info) => <span className="font-medium text-[#14213D]">{info.getValue()}</span> },
    { header: 'Class / Section', accessorKey: 'class' },
    { header: 'Roll No', accessorKey: 'roll', cell: (info) => <span className="tabular-nums">{info.getValue()}</span> },
    { header: 'Status', accessorKey: 'status', cell: (info) => <StatusBadge status={info.getValue()} /> },
    { header: 'Fee Due', accessorKey: 'fee', cell: (info) => <span className="tabular-nums font-semibold text-[#14213D]">{info.getValue()}</span> },
  ];

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-white border border-[#E4E1D8] rounded-[10px] p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#EAF3F0] text-[#2F6F5E] text-xs font-semibold uppercase tracking-wider mb-2">
            Phase 1 Design Tokens & Component Primitives
          </span>
          <h2 className="font-display font-bold text-2xl text-[#14213D]">
            SchooliQ Design System Style Guide
          </h2>
          <p className="text-sm text-[#52607D] mt-1">
            Built for high-density administrative operations with custom teal accents, warm surfaces, and tabular metrics.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" icon={Search} onClick={() => toast.info('Press ⌘K to open the Command Palette!')}>
            Test ⌘K Shortcut
          </Button>
          <Button variant="primary" icon={Plus} onClick={() => setModalOpen(true)}>
            Open Sample Modal
          </Button>
        </div>
      </div>

      {/* 1. Stat Cards Row */}
      <section className="space-y-3">
        <h3 className="font-display text-base font-semibold text-[#14213D]">1. Key Metrics & Stats Cards (Ledger Tab Signature)</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Total Students Enrolled"
            value="1,482"
            icon={GraduationCap}
            subtext="+42 new admissions this term"
            trend="up"
            trendValue="3.2%"
            active={true}
          />
          <StatsCard
            title="Total Faculty & Staff"
            value="118"
            icon={Users}
            subtext="98% attendance today"
            trend="up"
            trendValue="100%"
          />
          <StatsCard
            title="Fee Collection (Term 2)"
            value="₹42,85,000"
            icon={IndianRupee}
            subtext="84% of total billed"
            trend="up"
            trendValue="12.4%"
          />
          <StatsCard
            title="Pending Approvals"
            value="14"
            icon={Calendar}
            subtext="Requires admin review"
            trend="down"
            trendValue="-4"
          />
        </div>
      </section>

      {/* 2. Buttons & Badges */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Buttons & Variants</CardTitle>
              <CardDescription>Radix & token-based actionable buttons</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="primary">Primary Action</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="destructive" icon={Trash2}>Destructive</Button>
            </div>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button variant="primary" size="sm" icon={Plus}>Small Primary</Button>
              <Button variant="outline" size="sm">Small Outline</Button>
              <Button variant="primary" loading>Saving...</Button>
              <Button variant="outline" size="icon" icon={Filter} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Status Badges & Toasts</CardTitle>
              <CardDescription>Semantic state badges & Sonner notifications</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status="active" />
              <StatusBadge status="pending" />
              <StatusBadge status="overdue" />
              <StatusBadge status="inactive" />
              <StatusBadge status="approved" />
              <StatusBadge status="rejected" />
            </div>
            <div className="pt-2 border-t border-[#EDEAE1] flex flex-wrap items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => toast.success('Fee receipt generated successfully!')}>
                Success Toast
              </Button>
              <Button variant="outline" size="sm" onClick={() => toast.error('Failed to save timetable changes.')}>
                Error Toast
              </Button>
              <Button variant="outline" size="sm" onClick={() => toast.info('System maintenance scheduled at midnight.')}>
                Info Toast
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* 3. High-Density Table */}
      <section className="space-y-3">
        <h3 className="font-display text-base font-semibold text-[#14213D]">2. High-Density Data Table (TanStack Powered)</h3>
        <Table
          data={sampleData}
          columns={columns}
          pageSize={5}
        />
      </section>

      {/* 4. Form Controls */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Form Controls & Inputs</CardTitle>
            <CardDescription>High-contrast, focus-ring input fields</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#14213D] mb-1">Student Search</label>
            <Input icon={Search} placeholder="Search by name, roll no or ID..." />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#14213D] mb-1">Grade / Section</label>
            <Select>
              <option>Grade 10 - Section A</option>
              <option>Grade 10 - Section B</option>
              <option>Grade 11 - Section A</option>
            </Select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#14213D] mb-1">Administrative Notes</label>
            <Textarea placeholder="Enter official remarks..." rows={1} />
          </div>
        </CardContent>
      </Card>

      {/* Sample Modals */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Create New Student Record"
        footer={
          <>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={() => { setModalOpen(false); toast.success('Student record created!'); }}>Save Student</Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-xs text-[#52607D]">
            Fill in the essential information below. Accessible focus trapping and Escape key closing are built-in via Radix UI.
          </p>
          <div>
            <label className="block text-xs font-semibold text-[#14213D] mb-1">Full Student Name</label>
            <Input placeholder="e.g. Kavya Patel" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#14213D] mb-1">Parent Contact Email</label>
            <Input placeholder="parent@example.com" type="email" />
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => { setConfirmOpen(false); toast.error('Record deleted'); }}
        title="Delete Student Record?"
        message="Are you sure you want to permanently delete this student record? This action cannot be undone."
        danger={true}
        confirmText="Delete Record"
      />
    </div>
  );
}
