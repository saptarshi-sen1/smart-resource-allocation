/**
 * CrisisConnect — Demo Data Service
 *
 * Generates realistic demo data for the hackathon demonstration:
 * - 25 volunteers with varied skills, locations, and statuses
 * - 10 disaster requests with mixed severities and skill requirements
 *
 * All data uses real Indian cities and realistic disaster scenarios.
 * This runs entirely in-memory — no Firestore writes required for demo mode.
 */

import type { Volunteer, DisasterRequest } from '@/types/optimizer';

// ─── Demo Volunteers (25) ────────────────────────────────────────────────────

export const DEMO_VOLUNTEERS: Volunteer[] = [
  // Kolkata cluster
  {
    id: 'v1', name: 'Ananya Sharma', latitude: 22.5726, longitude: 88.3639,
    skills: ['First Aid', 'Water Rescue', 'Triage'], certifications: ['CPR', 'First Aid Level 3'],
    vehicleType: 'motorcycle', available: true, capacity: 2,
    previousAssignments: 12, fatigueLevel: 2, currentStatus: 'available', city: 'Kolkata',
  },
  {
    id: 'v2', name: 'Rajesh Kumar', latitude: 22.5800, longitude: 88.3500,
    skills: ['Logistics', 'Food Distribution', 'Crowd Management'], certifications: ['Logistics Level 2'],
    vehicleType: 'truck', available: true, capacity: 20,
    previousAssignments: 8, fatigueLevel: 3, currentStatus: 'available', city: 'Kolkata',
  },
  {
    id: 'v3', name: 'Priya Banerjee', latitude: 22.5550, longitude: 88.3800,
    skills: ['Medical', 'First Aid', 'Mental Health Support'], certifications: ['MBBS', 'CPR'],
    vehicleType: 'car', available: true, capacity: 4,
    previousAssignments: 19, fatigueLevel: 4, currentStatus: 'available', city: 'Kolkata',
  },
  {
    id: 'v4', name: 'Suresh Mondal', latitude: 22.5650, longitude: 88.3400,
    skills: ['Boat Operation', 'Water Rescue', 'Navigation'], certifications: ['Boatman License'],
    vehicleType: 'boat', available: true, capacity: 8,
    previousAssignments: 6, fatigueLevel: 1, currentStatus: 'available', city: 'Kolkata',
  },
  {
    id: 'v5', name: 'Meera Ghosh', latitude: 22.5900, longitude: 88.3700,
    skills: ['Communication', 'Coordination', 'Language: Bengali'], certifications: ['Disaster Management Level 1'],
    vehicleType: 'motorcycle', available: true, capacity: 1,
    previousAssignments: 15, fatigueLevel: 3, currentStatus: 'available', city: 'Kolkata',
  },

  // Patna cluster
  {
    id: 'v6', name: 'Amit Singh', latitude: 25.5941, longitude: 85.1376,
    skills: ['First Aid', 'Rescue', 'Heavy Lifting'], certifications: ['First Aid', 'NDRF Basic'],
    vehicleType: 'suv', available: true, capacity: 6,
    previousAssignments: 10, fatigueLevel: 2, currentStatus: 'available', city: 'Patna',
  },
  {
    id: 'v7', name: 'Sunita Devi', latitude: 25.6000, longitude: 85.1500,
    skills: ['Medical', 'Midwifery', 'First Aid'], certifications: ['ANM', 'First Aid'],
    vehicleType: 'motorcycle', available: true, capacity: 1,
    previousAssignments: 22, fatigueLevel: 5, currentStatus: 'available', city: 'Patna',
  },
  {
    id: 'v8', name: 'Ravi Prasad', latitude: 25.5800, longitude: 85.1200,
    skills: ['Flood Management', 'Boat Operation', 'Water Rescue'], certifications: ['NDRF Flood Module'],
    vehicleType: 'boat', available: true, capacity: 10,
    previousAssignments: 5, fatigueLevel: 1, currentStatus: 'available', city: 'Patna',
  },
  {
    id: 'v9', name: 'Deepak Yadav', latitude: 25.6100, longitude: 85.1400,
    skills: ['Logistics', 'Supply Chain', 'Food Distribution'], certifications: ['Supply Chain Level 1'],
    vehicleType: 'truck', available: true, capacity: 25,
    previousAssignments: 7, fatigueLevel: 2, currentStatus: 'available', city: 'Patna',
  },
  {
    id: 'v10', name: 'Kavita Kumari', latitude: 25.5850, longitude: 85.1600,
    skills: ['Communication', 'Social Work', 'Crowd Management'], certifications: ['Social Work Diploma'],
    vehicleType: 'car', available: true, capacity: 4,
    previousAssignments: 18, fatigueLevel: 4, currentStatus: 'available', city: 'Patna',
  },

  // Guwahati cluster
  {
    id: 'v11', name: 'Bhupen Gogoi', latitude: 26.1445, longitude: 91.7362,
    skills: ['Flood Management', 'Rescue', 'First Aid'], certifications: ['SDRF Certified'],
    vehicleType: 'suv', available: true, capacity: 5,
    previousAssignments: 14, fatigueLevel: 3, currentStatus: 'available', city: 'Guwahati',
  },
  {
    id: 'v12', name: 'Rina Borah', latitude: 26.1500, longitude: 91.7200,
    skills: ['Medical', 'Triage', 'Emergency Care'], certifications: ['BMLT', 'Emergency Response'],
    vehicleType: 'motorcycle', available: true, capacity: 1,
    previousAssignments: 9, fatigueLevel: 2, currentStatus: 'available', city: 'Guwahati',
  },
  {
    id: 'v13', name: 'Mrinal Das', latitude: 26.1300, longitude: 91.7500,
    skills: ['Logistics', 'Shelter Setup', 'Construction'], certifications: ['Civil Work Level 1'],
    vehicleType: 'truck', available: true, capacity: 15,
    previousAssignments: 3, fatigueLevel: 1, currentStatus: 'available', city: 'Guwahati',
  },

  // Mumbai cluster
  {
    id: 'v14', name: 'Pooja Desai', latitude: 19.0760, longitude: 72.8777,
    skills: ['Medical', 'First Aid', 'Counselling'], certifications: ['MBBS', 'Disaster Counsellor'],
    vehicleType: 'car', available: true, capacity: 3,
    previousAssignments: 25, fatigueLevel: 6, currentStatus: 'available', city: 'Mumbai',
  },
  {
    id: 'v15', name: 'Vivek Nair', latitude: 19.0900, longitude: 72.8600,
    skills: ['Search and Rescue', 'Heavy Equipment', 'Rope Rescue'], certifications: ['NDRF Level 2', 'Rope Rescue'],
    vehicleType: 'suv', available: true, capacity: 5,
    previousAssignments: 11, fatigueLevel: 3, currentStatus: 'available', city: 'Mumbai',
  },
  {
    id: 'v16', name: 'Anita Joshi', latitude: 19.0600, longitude: 72.8900,
    skills: ['Food Distribution', 'Coordination', 'Volunteer Management'], certifications: ['NGO Leadership'],
    vehicleType: 'car', available: true, capacity: 4,
    previousAssignments: 30, fatigueLevel: 5, currentStatus: 'available', city: 'Mumbai',
  },

  // Chennai cluster
  {
    id: 'v17', name: 'Karthik Rajan', latitude: 13.0827, longitude: 80.2707,
    skills: ['Flood Management', 'Community Outreach', 'Tamil Translation'], certifications: ['Disaster Mgmt Level 2'],
    vehicleType: 'motorcycle', available: true, capacity: 1,
    previousAssignments: 16, fatigueLevel: 4, currentStatus: 'available', city: 'Chennai',
  },
  {
    id: 'v18', name: 'Divya Krishnan', latitude: 13.0700, longitude: 80.2800,
    skills: ['Medical', 'First Aid', 'Nutrition Support'], certifications: ['BSc Nursing', 'First Aid'],
    vehicleType: 'car', available: true, capacity: 3,
    previousAssignments: 20, fatigueLevel: 4, currentStatus: 'available', city: 'Chennai',
  },

  // Bhubaneswar cluster
  {
    id: 'v19', name: 'Prakash Mohanty', latitude: 20.2961, longitude: 85.8245,
    skills: ['Cyclone Preparedness', 'Evacuation', 'Rescue'], certifications: ['ODRAF Certified'],
    vehicleType: 'suv', available: true, capacity: 6,
    previousAssignments: 8, fatigueLevel: 2, currentStatus: 'available', city: 'Bhubaneswar',
  },
  {
    id: 'v20', name: 'Sita Panda', latitude: 20.3000, longitude: 85.8100,
    skills: ['Shelter Setup', 'Logistics', 'Community Outreach'], certifications: ['Camp Management'],
    vehicleType: 'truck', available: true, capacity: 20,
    previousAssignments: 12, fatigueLevel: 3, currentStatus: 'available', city: 'Bhubaneswar',
  },

  // Hyderabad cluster
  {
    id: 'v21', name: 'Sanjay Reddy', latitude: 17.3850, longitude: 78.4867,
    skills: ['Search and Rescue', 'Technical Rescue', 'Rope Rescue'], certifications: ['NDRF Advanced', 'Technical Rescue'],
    vehicleType: 'suv', available: true, capacity: 4,
    previousAssignments: 17, fatigueLevel: 3, currentStatus: 'available', city: 'Hyderabad',
  },
  {
    id: 'v22', name: 'Laxmi Devi', latitude: 17.3900, longitude: 78.5000,
    skills: ['Medical', 'Emergency Care', 'Triage'], certifications: ['GNM Nursing', 'ACLS'],
    vehicleType: 'motorcycle', available: true, capacity: 1,
    previousAssignments: 14, fatigueLevel: 4, currentStatus: 'available', city: 'Hyderabad',
  },

  // Delhi cluster
  {
    id: 'v23', name: 'Manish Sharma', latitude: 28.7041, longitude: 77.1025,
    skills: ['Coordination', 'Logistics', 'Media Relations'], certifications: ['ICS Level 2'],
    vehicleType: 'car', available: true, capacity: 4,
    previousAssignments: 21, fatigueLevel: 5, currentStatus: 'available', city: 'Delhi',
  },
  {
    id: 'v24', name: 'Neha Gupta', latitude: 28.6900, longitude: 77.1100,
    skills: ['Medical', 'First Aid', 'Community Health'], certifications: ['MBBS', 'Public Health'],
    vehicleType: 'car', available: true, capacity: 3,
    previousAssignments: 28, fatigueLevel: 6, currentStatus: 'available', city: 'Delhi',
  },
  {
    id: 'v25', name: 'Arjun Malik', latitude: 28.7100, longitude: 77.0900,
    skills: ['Rescue', 'Fire Safety', 'Emergency Response'], certifications: ['Fire & Rescue Level 2', 'NDRF Basic'],
    vehicleType: 'truck', available: true, capacity: 8,
    previousAssignments: 9, fatigueLevel: 2, currentStatus: 'available', city: 'Delhi',
  },
];

// ─── Demo Requests (10) ──────────────────────────────────────────────────────

export const DEMO_REQUESTS: DisasterRequest[] = [
  {
    id: 'r1', title: 'Flood Relief — Patna North Zone',
    location: 'Patna North, Bihar', latitude: 25.6200, longitude: 85.1600,
    severity: 'critical', disasterType: 'flood',
    requiredSkills: ['Water Rescue', 'First Aid', 'Boat Operation'],
    peopleAffected: 3400, suppliesNeeded: ['Life jackets', 'Rope kits', 'Medical kits'],
    estimatedDuration: '6–8 hours', ngoId: 'ngo1', ngoName: 'Bihar Flood Response Org.',
    timestamp: Date.now() - 14 * 60 * 1000, isActive: true,
  },
  {
    id: 'r2', title: 'Medical Emergency — Guwahati Camp',
    location: 'Guwahati Relief Camp, Assam', latitude: 26.1600, longitude: 91.7500,
    severity: 'critical', disasterType: 'medical',
    requiredSkills: ['Medical', 'Triage', 'Emergency Care'],
    peopleAffected: 1200, suppliesNeeded: ['Medical supplies', 'Stretchers', 'IV fluids'],
    estimatedDuration: '4–6 hours', ngoId: 'ngo2', ngoName: 'Assam Medical Aid Trust',
    timestamp: Date.now() - 38 * 60 * 1000, isActive: true,
  },
  {
    id: 'r3', title: 'Cyclone Evacuation — Digha Coast',
    location: 'Digha, Purba Medinipur, WB', latitude: 21.6264, longitude: 87.5090,
    severity: 'high', disasterType: 'cyclone',
    requiredSkills: ['Evacuation', 'Crowd Management', 'Communication'],
    peopleAffected: 870, suppliesNeeded: ['Megaphones', 'Reflective vests', 'Rations'],
    estimatedDuration: '3–4 hours', ngoId: 'ngo3', ngoName: 'Coastal Aid Network',
    timestamp: Date.now() - 72 * 60 * 1000, isActive: true,
  },
  {
    id: 'r4', title: 'Food Distribution — Chennai Flood Zones',
    location: 'Tambaram, Chennai, TN', latitude: 12.9249, longitude: 80.1000,
    severity: 'high', disasterType: 'flood',
    requiredSkills: ['Food Distribution', 'Logistics', 'Coordination'],
    peopleAffected: 5600, suppliesNeeded: ['Rice', 'Dal', 'Water packets', 'Cooking fuel'],
    estimatedDuration: '8 hours', ngoId: 'ngo4', ngoName: 'Tamil Nadu Relief Foundation',
    timestamp: Date.now() - 2 * 3600 * 1000, isActive: true,
  },
  {
    id: 'r5', title: 'Shelter Setup — Bhubaneswar Cyclone Camp',
    location: 'Cuttack Naka, Bhubaneswar, Odisha', latitude: 20.3400, longitude: 85.8400,
    severity: 'high', disasterType: 'cyclone',
    requiredSkills: ['Shelter Setup', 'Construction', 'Logistics'],
    peopleAffected: 2100, suppliesNeeded: ['Tarpaulins', 'Bamboo poles', 'Rope', 'Tools'],
    estimatedDuration: '12 hours', ngoId: 'ngo5', ngoName: 'Odisha Disaster Relief Society',
    timestamp: Date.now() - 4 * 3600 * 1000, isActive: true,
  },
  {
    id: 'r6', title: 'Search & Rescue — Mumbai Building Collapse',
    location: 'Dharavi, Mumbai, Maharashtra', latitude: 19.0425, longitude: 72.8548,
    severity: 'critical', disasterType: 'earthquake',
    requiredSkills: ['Search and Rescue', 'Technical Rescue', 'Medical'],
    peopleAffected: 45, suppliesNeeded: ['Rescue equipment', 'Medical kits', 'Cutting tools'],
    estimatedDuration: '10–12 hours', ngoId: 'ngo6', ngoName: 'Maharashtra Urban Response Force',
    timestamp: Date.now() - 25 * 60 * 1000, isActive: true,
  },
  {
    id: 'r7', title: 'Medical Camp — Hyderabad Flash Flood',
    location: 'LB Nagar, Hyderabad, Telangana', latitude: 17.3470, longitude: 78.5461,
    severity: 'medium', disasterType: 'flood',
    requiredSkills: ['Medical', 'First Aid', 'Triage'],
    peopleAffected: 680, suppliesNeeded: ['First aid kits', 'Medications', 'Clean water'],
    estimatedDuration: '6 hours', ngoId: 'ngo7', ngoName: 'Telangana Health Volunteers Network',
    timestamp: Date.now() - 90 * 60 * 1000, isActive: true,
  },
  {
    id: 'r8', title: 'Community Outreach — Kolkata Flood Relief',
    location: 'Howrah Bridge Area, Kolkata, WB', latitude: 22.5852, longitude: 88.3498,
    severity: 'medium', disasterType: 'flood',
    requiredSkills: ['Communication', 'Community Outreach', 'Coordination'],
    peopleAffected: 950, suppliesNeeded: ['Flyers', 'Megaphone', 'Emergency contact lists'],
    estimatedDuration: '4 hours', ngoId: 'ngo8', ngoName: 'West Bengal Community Aid',
    timestamp: Date.now() - 3 * 3600 * 1000, isActive: true,
  },
  {
    id: 'r9', title: 'Supply Distribution — Delhi Heat Wave',
    location: 'Outer Ring Road, Delhi', latitude: 28.6800, longitude: 77.0800,
    severity: 'medium', disasterType: 'other',
    requiredSkills: ['Logistics', 'Food Distribution', 'Medical'],
    peopleAffected: 1800, suppliesNeeded: ['ORS packets', 'Water', 'Ice', 'Fans'],
    estimatedDuration: '6 hours', ngoId: 'ngo9', ngoName: 'Delhi Heat Response Network',
    timestamp: Date.now() - 5 * 3600 * 1000, isActive: true,
  },
  {
    id: 'r10', title: 'Rescue Support — Assam Landslide',
    location: 'Dima Hasao District, Assam', latitude: 25.5000, longitude: 93.0000,
    severity: 'low', disasterType: 'earthquake',
    requiredSkills: ['Rescue', 'Heavy Lifting', 'Communication'],
    peopleAffected: 120, suppliesNeeded: ['Shovels', 'Rope', 'First aid kits'],
    estimatedDuration: '8 hours', ngoId: 'ngo2', ngoName: 'Assam Medical Aid Trust',
    timestamp: Date.now() - 8 * 3600 * 1000, isActive: true,
  },
];
