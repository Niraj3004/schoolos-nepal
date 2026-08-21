import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.join(__dirname, '../../../apps/api/.env') });

import { User } from '../modules/auth/user.model';
import { Tenant } from '../modules/tenant/tenant.model';
import { AcademicYear } from '../modules/academic/academicYear.model';
import { Class } from '../modules/academic/class.model';
import { Section } from '../modules/academic/section.model';
import { Subject } from '../modules/academic/subject.model';
import { SubjectAllocation } from '../modules/academic/subjectAllocation.model';
import { Student } from '../modules/student/student.model';
import { Parent } from '../modules/student/parent.model';
import { PlatformPlan, TenantSubscription, PlatformSetting } from '../modules/saas/saas.model';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/schoolos';

const seedDB = async () => {
  try {
    if (process.env.NODE_ENV === 'production') {
      console.log('Cannot run seed script in production!');
      process.exit(1);
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB Connected.');

    // 1. Clean up demo school data (Idempotency)
    const existingTenant = await Tenant.findOne({ code: 'bmss' });
    if (existingTenant) {
      console.log('Purging existing Demo School data...');
      const schoolId = existingTenant._id;
      await Student.deleteMany({ schoolId });
      await Parent.deleteMany({ schoolId });
      await SubjectAllocation.deleteMany({ schoolId });
      await Subject.deleteMany({ schoolId });
      await Section.deleteMany({ schoolId });
      await Class.deleteMany({ schoolId });
      await AcademicYear.deleteMany({ schoolId });
      await User.deleteMany({ schoolId });
      await TenantSubscription.deleteMany({ schoolId });
      await Tenant.deleteOne({ _id: schoolId });
    }

    // Ensure Superadmin is clean
    await User.deleteOne({ email: 'superadmin@schoolos.np' });
    await PlatformPlan.deleteMany({});

    // 2. Create Platform Superadmin & Plans
    await User.create({
      email: 'superadmin@schoolos.np',
      password: 'SuperPass123',
      role: 'SUPERADMIN',
      isActive: true
    });

    const starterPlan = (await PlatformPlan.create({
      name: 'Starter',
      maxStudents: 500,
      priceNPRPerYear: 50000,
      features: ['Attendance', 'Homework', 'Exams'],
      isActive: true
    })) as any;

    await PlatformSetting.deleteMany({});
    await PlatformSetting.create({
      bankName: 'Global IME Bank',
      accountName: 'SchoolOS Nepal Pvt Ltd',
      accountNumber: '1234567890123',
      branch: 'Kathmandu',
      qrCodeImageUrl: 'https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg',
      supportEmail: 'support@schoolos.np',
      supportPhone: '9800000001'
    });

    // 3. Create Demo School
    const bmss = (await Tenant.create({
      name: 'Birgunj Model Secondary School',
      code: 'bmss',
      address: { city: 'Birgunj', district: 'Parsa', province: 'Madhesh' },
      phone: '9800000000',
      email: 'info@bmss.edu.np',
      principalName: 'Ram Kumar Sharma'
    })) as any;

    await TenantSubscription.create({
      schoolId: bmss._id,
      planId: starterPlan._id,
      billingCycle: 'ANNUAL',
      amountNPR: 50000,
      slipImageUrl: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
      transactionReference: 'SEED-TXN-123',
      status: 'ACTIVE',
      startDate: new Date(),
      endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
    });

    // 4. Create School Admin
    await User.create({
      schoolId: bmss._id,
      email: 'admin@bmss.edu.np',
      password: 'SchoolPass123',
      role: 'ADMIN',
      isActive: true
    });

    // 5. Create Academic Year
    const year2083 = (await AcademicYear.create({
      schoolId: bmss._id,
      name: '2083/2084',
      startDateBS: '2083-01-01',
      endDateBS: '2083-12-30',
      startDateAD: new Date('2026-04-14'),
      endDateAD: new Date('2027-04-12'),
      isCurrent: true
    })) as any;

    // 6. Create Teacher
    const demoTeacher = (await User.create({
      schoolId: bmss._id,
      email: 'teacher@bmss.edu.np',
      password: 'SchoolPass123',
      role: 'TEACHER',
      isActive: true
    })) as any;

    // 7. Create Class, Section, Subjects
    const grade10 = (await Class.create({
      schoolId: bmss._id,
      name: 'Grade 10',
      numericValue: 10,
      order: 10
    })) as any;

    const sectionA = (await Section.create({
      schoolId: bmss._id,
      classId: grade10._id,
      name: 'Section A',
      capacity: 40,
      classTeacherId: demoTeacher._id
    })) as any;

    await Subject.create({
      schoolId: bmss._id,
      name: 'Compulsory Mathematics',
      code: 'MTH-10',
      isOptional: false,
      creditHours: 4,
      theoryFullMarks: 75,
      practicalFullMarks: 25,
      theoryPassMarks: 27,
      practicalPassMarks: 10
    });

    // 8. Create Parent and Student
    const parentUser = (await User.create({
      schoolId: bmss._id,
      email: 'parent@bmss.edu.np',
      password: 'SchoolPass123',
      role: 'PARENT',
      isActive: true
    })) as any;

    const parentProfile = (await Parent.create({
      schoolId: bmss._id,
      userId: parentUser._id,
      fatherName: 'Hari B. Parent',
      motherName: 'Gita Parent',
      primaryPhone: '9840000000',
      address: 'Miteri Pul, Birgunj'
    })) as any;

    const studentUser = (await User.create({
      schoolId: bmss._id,
      email: 'student@bmss.edu.np', // We usually use admissionNumber@subdomain, but we simplify for seed auth table
      password: 'SchoolPass123',
      role: 'STUDENT',
      isActive: true
    })) as any;

    await Student.create({
      schoolId: bmss._id,
      userId: studentUser._id,
      admissionNumber: 'BMSS-2083-001',
      rollNumber: 1,
      currentClassId: grade10._id,
      currentSectionId: sectionA._id,
      academicYearId: year2083._id,
      firstName: 'Ramesh',
      lastName: 'Student',
      dobBS: '2067-05-12',
      gender: 'MALE',
      parentId: parentProfile._id,
      status: 'ENROLLED'
    });

    console.log('\n✅ Database Seeded Successfully!\n');
    console.table([
      { Role: 'SUPERADMIN', Email: 'superadmin@schoolos.np', Password: 'SuperPass123' },
      { Role: 'ADMIN', Email: 'admin@bmss.edu.np', Password: 'SchoolPass123' },
      { Role: 'TEACHER', Email: 'teacher@bmss.edu.np', Password: 'SchoolPass123' },
      { Role: 'PARENT', Email: 'parent@bmss.edu.np', Password: 'SchoolPass123' },
      { Role: 'STUDENT', Email: 'student@bmss.edu.np', Password: 'SchoolPass123' }
    ]);

    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedDB();
