
import { Role, User, Document } from './types';

export const MOCK_USERS: User[] = [
  { 
    id: 'u1', 
    name: 'CEO', 
    email: 'ceo@enterprise.com', 
    password: 'ceo123', 
    role: Role.ADMIN, 
    avatar: 'https://picsum.photos/seed/ceo/100' 
  },
  { 
    id: 'u2', 
    name: 'HR', 
    email: 'hr@enterprise.com', 
    password: 'hr123', 
    role: Role.HR, 
    avatar: 'https://picsum.photos/seed/sarah/100' 
  },
  { 
    id: 'u3', 
    name: 'Manager', 
    email: 'manager@enterprise.com', 
    password: 'manager123', 
    role: Role.MANAGER, 
    avatar: 'https://picsum.photos/seed/mike/100' 
  },
  { 
    id: 'u4', 
    name: 'Employee', 
    email: 'staff@enterprise.com', 
    password: 'staff123', 
    role: Role.EMPLOYEE, 
    avatar: 'https://picsum.photos/seed/dave/100' 
  },
];

// Base64 for a minimal valid 1-page PDF to test the viewer
const DUMMY_PDF_BASE64 = "data:application/pdf;base64,JVBERi0xLjQKJcOkw7zDtsOfCjIgMCBvYmoKPDwvTGVuZ3RoIDMgMCBSL0ZpbHRlci9GbGF0ZURlY29kZT4+CnN0cmVhbQp4nDMvMdBQSExKTVfIzC9VKEpNK8mPr8gtV0hOzdUPzs8rKcnMBwD/uApsCmVuZHN0cmVhbQplbmRvYmoKMyAwIG9iago0OQplbmRvYmoKMSAwIG9iago8PC9UeXBlL1BhZ2UvUGFyZW50IDQgMCBSL1Jlc291cmNlczw8L0ZvbnQ8PC9GMSA1IDAgUj4+Pj4vTWVkaWFCb3hbMCAwIDU5NSA4NDJdL0NvbnRlbnRzIDIgMCBSPj4KZW5kb2JqCjUgMCBvYmoKPDwvVHlwZS9Gb250L1N1YnR5cGUvVHlwZTEvQmFzZUZvbnQvSGVsdmV0aWNhPj4KZW5kb2JqCjQgMCBvYmoKPDwvVHlwZS9QYWdlcy9Db3VudCAxL0tpZHNbMSAwIFJdPj4KZW5kb2JqCjYgMCBvYmoKPDwvVHlwZS9DYXRhbG9nL1BhZ2VzIDQgMCBSPj4KZW5kb2JqCjcgMCBvYmoKPDwvUHJvZHVjZXIocGRmanMpL01vZERhdGUoRDoyMDI0MDUxOTA5MzcwNlopPj4KZW5kb2JqCnRyYWlsZXIKPDwvU2l6ZSA4L1Jvb3QgNiAwIFIvSW5mbyA3IDAgUj4+CnN0YXJ0eHJlZgoxNjU1CiUlRU9GCg==";

export const DUMMY_DOCUMENTS: Document[] = [
  {
    id: 'd1',
    title: 'Employee Handbook 2024',
    type: 'pdf',
    uploadDate: '2024-01-15',
    accessLevel: 'PUBLIC',
    roleAccess: [Role.ADMIN, Role.HR, Role.MANAGER, Role.EMPLOYEE],
    ownerId: 'u1',
    author: 'CEO',
    fileSize: '2.4 MB',
    fileUrl: DUMMY_PDF_BASE64,
    content: 'Standard operating procedures for all employees. Includes vacation policy, sick leave, and code of conduct. Standard working hours are 9 AM to 5 PM. Remote work is permitted twice a week with manager approval.'
  },
  {
    id: 'd2',
    title: 'Executive Salary Report',
    type: 'pdf',
    uploadDate: '2024-02-10',
    accessLevel: 'INTERNAL',
    roleAccess: [Role.ADMIN, Role.HR],
    ownerId: 'u2',
    author: 'HR',
    fileSize: '1.1 MB',
    content: 'Sensitive salary data for C-level executives and department heads. CEO bonus is linked to annual revenue growth targets. HR must keep this document strictly confidential.'
  },
  {
    id: 'd3',
    title: 'IT Infrastructure Map',
    type: 'text',
    uploadDate: '2023-11-20',
    accessLevel: 'INTERNAL',
    roleAccess: [Role.ADMIN, Role.MANAGER],
    ownerId: 'u1',
    author: 'CEO',
    fileSize: '45 KB',
    content: 'Details of the server farm architecture, firewall configurations, and internal network subnets. VPN access is required for all administrative tasks.'
  },
  {
    id: 'd6',
    title: 'Personal Development Notes',
    type: 'text',
    uploadDate: '2024-03-05',
    accessLevel: 'PRIVATE',
    roleAccess: [],
    ownerId: 'u4',
    author: 'Employee',
    fileSize: '5 KB',
    content: 'My private notes for the annual review. I want to ask for a 10% raise and move into a Senior Developer role by Q4.'
  },
  {
    id: 'd9',
    title: 'Emergency Response Plan',
    type: 'text',
    uploadDate: '2023-08-19',
    accessLevel: 'PUBLIC',
    roleAccess: [Role.ADMIN, Role.HR, Role.MANAGER, Role.EMPLOYEE],
    ownerId: 'u1',
    author: 'CEO',
    fileSize: '150 KB',
    content: 'Procedures for fire, medical emergencies, and natural disasters. Assembly point is the parking lot across the street.'
  }
];
