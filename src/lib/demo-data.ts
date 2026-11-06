import {
  College,
  Department,
  Batch,
  AcademicSession,
  Profile,
  Course,
  Module,
  Lesson,
  Resource,
  WatchProgress,
  PdfBookmark,
  Note,
  Assignment,
  AssignmentSubmission,
  Announcement,
  NotificationItem,
  CourseEnrollment
} from "@/types/database";

export const DEMO_COLLEGES: College[] = [
  {
    id: "col-stjude-001",
    name: "St. Jude Institute of Technology & Design",
    slug: "st-jude",
    domain: "stjude.edu",
    logo_url: "https://images.unsplash.com/photo-1592280771190-3e2e4d571952?q=80&w=240&auto=format&fit=crop",
    primary_color: "#C58B51",
    address: "740 University Avenue, Cambridge, MA",
    created_at: "2024-01-10T00:00:00Z",
    updated_at: "2024-01-10T00:00:00Z",
  },
  {
    id: "col-metro-002",
    name: "Metropolitan College of Engineering",
    slug: "metro-eng",
    domain: "metro.edu",
    logo_url: "https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=240&auto=format&fit=crop",
    primary_color: "#3B82F6",
    address: "100 South Bank Blvd, Chicago, IL",
    created_at: "2024-02-15T00:00:00Z",
    updated_at: "2024-02-15T00:00:00Z",
  }
];

export const DEMO_DEPARTMENTS: Department[] = [
  {
    id: "dept-des-01",
    college_id: "col-stjude-001",
    name: "Interaction & Product Design",
    code: "DES",
    description: "Digital systems architecture, cognitive ergonomics, and modern editorial UI/UX.",
    created_at: "2024-01-10T00:00:00Z",
    updated_at: "2024-01-10T00:00:00Z",
  },
  {
    id: "dept-cs-02",
    college_id: "col-stjude-001",
    name: "Computer Science & Engineering",
    code: "CS",
    description: "Distributed consensus, cloud infrastructure, and low-latency systems.",
    created_at: "2024-01-10T00:00:00Z",
    updated_at: "2024-01-10T00:00:00Z",
  },
  {
    id: "dept-econ-03",
    college_id: "col-stjude-001",
    name: "Computational Economics",
    code: "ECON",
    description: "Algorithmic game theory, mechanism design, and quantitative networks.",
    created_at: "2024-01-10T00:00:00Z",
    updated_at: "2024-01-10T00:00:00Z",
  }
];

export const DEMO_BATCHES: Batch[] = [
  {
    id: "batch-2027-des",
    college_id: "col-stjude-001",
    department_id: "dept-des-01",
    name: "Class of 2027 (Junior Cohort)",
    graduation_year: 2027,
    created_at: "2024-01-10T00:00:00Z"
  },
  {
    id: "batch-2026-cs",
    college_id: "col-stjude-001",
    department_id: "dept-cs-02",
    name: "Class of 2026 (Senior Cohort)",
    graduation_year: 2026,
    created_at: "2024-01-10T00:00:00Z"
  }
];

export const DEMO_SESSIONS: AcademicSession[] = [
  {
    id: "sess-fall-2026",
    college_id: "col-stjude-001",
    name: "Fall Semester 2026",
    start_date: "2026-09-01",
    end_date: "2026-12-20",
    is_current: true,
    created_at: "2024-01-10T00:00:00Z"
  },
  {
    id: "sess-spring-2026",
    college_id: "col-stjude-001",
    name: "Spring Semester 2026",
    start_date: "2026-01-15",
    end_date: "2026-05-30",
    is_current: false,
    created_at: "2024-01-10T00:00:00Z"
  }
];

export const DEMO_PROFILES: Profile[] = [
  {
    id: "user-student-001",
    college_id: "col-stjude-001",
    email: "simatupang@student.stjude.edu",
    full_name: "Simatupang Aris",
    avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=260&auto=format&fit=crop",
    role: "student",
    department_id: "dept-des-01",
    batch_id: "batch-2027-des",
    student_id: "ST-2024-8842",
    phone: "+1 (617) 555-0194",
    bio: "Undergraduate researcher focused on minimalist editorial UI, human perception, and cognitive interfaces.",
    created_at: "2024-08-01T00:00:00Z",
    updated_at: "2024-08-01T00:00:00Z"
  },
  {
    id: "user-instructor-001",
    college_id: "col-stjude-001",
    email: "marcus.vance@faculty.stjude.edu",
    full_name: "Prof. Marcus Vance, Ph.D.",
    avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=260&auto=format&fit=crop",
    role: "instructor",
    department_id: "dept-des-01",
    phone: "+1 (617) 555-0143",
    bio: "Professor of Interaction Design & Systems Architecture. Previously principal design architect at Linear.",
    created_at: "2023-06-01T00:00:00Z",
    updated_at: "2023-06-01T00:00:00Z"
  },
  {
    id: "user-admin-001",
    college_id: "col-stjude-001",
    email: "dean.price@admin.stjude.edu",
    full_name: "Dr. Katherine Price",
    avatar_url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=260&auto=format&fit=crop",
    role: "college_admin",
    phone: "+1 (617) 555-0100",
    bio: "Dean of Academic Operations & Technology Infrastructure, St. Jude Institute.",
    created_at: "2023-01-01T00:00:00Z",
    updated_at: "2023-01-01T00:00:00Z"
  },
  {
    id: "user-platform-001",
    college_id: "col-stjude-001",
    email: "platform.lead@studyroom.cloud",
    full_name: "Arthur Pendelton",
    avatar_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=260&auto=format&fit=crop",
    role: "platform_admin",
    bio: "Studyroom Global Platform Architect and Multi-Tenant Infrastructure Administrator.",
    created_at: "2022-01-01T00:00:00Z",
    updated_at: "2022-01-01T00:00:00Z"
  }
];

export const DEMO_COURSES: Course[] = [
  {
    id: "course-des-401",
    college_id: "col-stjude-001",
    department_id: "dept-des-01",
    instructor_id: "user-instructor-001",
    academic_session_id: "sess-fall-2026",
    code: "DES-401",
    title: "Human-Computer Interaction & Cognitive Interfaces",
    slug: "hci-cognitive-interfaces",
    description: "Exploration of human perception, spatial navigation, and modern minimalist design systems inspired by Linear, Notion, and Readwise.",
    syllabus: "1. Mental models & spatial mapping\n2. Warm neutral palettes and editorial typography\n3. Micro-interactions and 150ms-250ms transitions\n4. Digital reading ergonomics & high-density information systems.",
    cover_image: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?q=80&w=800&auto=format&fit=crop",
    is_published: true,
    created_at: "2026-08-15T00:00:00Z",
    updated_at: "2026-09-02T00:00:00Z",
    enrolled_count: 38,
    progress_percentage: 67,
  },
  {
    id: "course-cs-482",
    college_id: "col-stjude-001",
    department_id: "dept-cs-02",
    instructor_id: "user-instructor-001",
    academic_session_id: "sess-fall-2026",
    code: "CS-482",
    title: "Distributed Consensus & Cloud Storage Architecture",
    slug: "distributed-consensus-storage",
    description: "Deep dive into Raft consensus algorithms, multi-tenant database isolation, Cloudflare R2 object storage, and fault-tolerant video streaming pipelines.",
    syllabus: "1. Consensus protocols (Paxos, Raft)\n2. Sharding and tenant boundaries\n3. S3/R2 direct resumable uploads\n4. Low-latency edge delivery.",
    cover_image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=800&auto=format&fit=crop",
    is_published: true,
    created_at: "2026-08-18T00:00:00Z",
    updated_at: "2026-09-05T00:00:00Z",
    enrolled_count: 52,
    progress_percentage: 42,
  },
  {
    id: "course-econ-310",
    college_id: "col-stjude-001",
    department_id: "dept-econ-03",
    instructor_id: "user-instructor-001",
    academic_session_id: "sess-fall-2026",
    code: "ECON-310",
    title: "Algorithmic Game Theory & Mechanism Design",
    slug: "algorithmic-game-theory",
    description: "Mathematical foundations of incentive compatibility, auctions, computational social choice, and algorithmic mechanism design in distributed platforms.",
    syllabus: "1. Strategic games and Nash equilibria\n2. VCG mechanisms and optimal auction design\n3. Stable matching and market design algorithms.",
    cover_image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=800&auto=format&fit=crop",
    is_published: true,
    created_at: "2026-08-20T00:00:00Z",
    updated_at: "2026-09-10T00:00:00Z",
    enrolled_count: 29,
    progress_percentage: 15,
  }
];

export const DEMO_ENROLLMENTS: CourseEnrollment[] = [
  {
    id: "enr-01",
    college_id: "col-stjude-001",
    course_id: "course-des-401",
    student_id: "user-student-001",
    enrolled_at: "2026-09-01T09:00:00Z",
    status: "active"
  },
  {
    id: "enr-02",
    college_id: "col-stjude-001",
    course_id: "course-cs-482",
    student_id: "user-student-001",
    enrolled_at: "2026-09-01T09:15:00Z",
    status: "active"
  },
  {
    id: "enr-03",
    college_id: "col-stjude-001",
    course_id: "course-econ-310",
    student_id: "user-student-001",
    enrolled_at: "2026-09-02T10:00:00Z",
    status: "active"
  }
];

export const DEMO_MODULES: Module[] = [
  {
    id: "mod-des-01",
    college_id: "col-stjude-001",
    course_id: "course-des-401",
    title: "Module 1: Mental Models & Spatial UI Architecture",
    description: "Core cognitive principles for designing fluid, low-friction digital learning and workspace software.",
    order_index: 1,
    is_published: true,
    created_at: "2026-08-25T00:00:00Z",
    updated_at: "2026-08-25T00:00:00Z",
  },
  {
    id: "mod-des-02",
    college_id: "col-stjude-001",
    course_id: "course-des-401",
    title: "Module 2: Editorial Typography & Color Science",
    description: "Mastering warm neutrals, Manrope & Inter pairing, and typographic hierarchy for readability.",
    order_index: 2,
    is_published: true,
    created_at: "2026-08-26T00:00:00Z",
    updated_at: "2026-08-26T00:00:00Z",
  },
  {
    id: "mod-des-03",
    college_id: "col-stjude-001",
    course_id: "course-des-401",
    title: "Module 3: Motion Systems & Ergonomic Workflows",
    description: "Implementing 150ms-250ms physics transitions, contextual overlays, and frictionless keyboard controls.",
    order_index: 3,
    is_published: true,
    created_at: "2026-08-27T00:00:00Z",
    updated_at: "2026-08-27T00:00:00Z",
  },
  {
    id: "mod-cs-01",
    college_id: "col-stjude-001",
    course_id: "course-cs-482",
    title: "Module 1: Distributed Consensus & State Machine Replication",
    description: "Raft algorithm foundations, leader election, and log replication across multi-tenant clusters.",
    order_index: 1,
    is_published: true,
    created_at: "2026-08-20T00:00:00Z",
    updated_at: "2026-08-20T00:00:00Z",
  },
  {
    id: "mod-cs-02",
    college_id: "col-stjude-001",
    course_id: "course-cs-482",
    title: "Module 2: Cloud Storage Architecture & Object Stores",
    description: "Multi-tenant object stores, direct resumable chunk uploads, and edge media acceleration.",
    order_index: 2,
    is_published: true,
    created_at: "2026-08-22T00:00:00Z",
    updated_at: "2026-08-22T00:00:00Z",
  },
  {
    id: "mod-econ-01",
    college_id: "col-stjude-001",
    course_id: "course-econ-310",
    title: "Module 1: Game Theoretic Foundations & Nash Equilibria",
    description: "Strategic form games, dominant strategy equilibria, and extensive games with imperfect information.",
    order_index: 1,
    is_published: true,
    created_at: "2026-08-25T00:00:00Z",
    updated_at: "2026-08-25T00:00:00Z",
  }
];

export const DEMO_LESSONS: Lesson[] = [
  {
    id: "les-des-101",
    college_id: "col-stjude-001",
    module_id: "mod-des-01",
    course_id: "course-des-401",
    title: "Project Initiation & Mental Mapping in Modern Interfaces",
    description: "Detailed breakdown of cognitive friction, linear navigation vs multi-pane spatial workflows, and project lifecycle management.",
    lesson_type: "video",
    order_index: 1,
    is_published: true,
    duration_seconds: 2421, // 40 mins 21s (matches user screenshot 2!)
    estimated_reading_time_mins: 25,
    created_at: "2026-08-28T00:00:00Z",
    updated_at: "2026-08-28T00:00:00Z",
    is_completed: false,
  },
  {
    id: "les-des-102",
    college_id: "col-stjude-001",
    module_id: "mod-des-01",
    course_id: "course-des-401",
    title: "Reading Environment Design: The Readwise Heuristic",
    description: "Architecting digital reader layouts, page virtualization, annotation ergonomics, and contrast ratios.",
    lesson_type: "pdf",
    order_index: 2,
    is_published: true,
    duration_seconds: 1200,
    estimated_reading_time_mins: 15,
    created_at: "2026-08-29T00:00:00Z",
    updated_at: "2026-08-29T00:00:00Z",
    is_completed: true,
  },
  {
    id: "les-des-103",
    college_id: "col-stjude-001",
    module_id: "mod-des-01",
    course_id: "course-des-401",
    title: "Assignment 1: Minimalist Design System Specification",
    description: "Author a comprehensive 6-page design specification detailing color tokens, 8px rhythm, typography, and accessibility states.",
    lesson_type: "assignment",
    order_index: 3,
    is_published: true,
    estimated_reading_time_mins: 10,
    created_at: "2026-08-30T00:00:00Z",
    updated_at: "2026-08-30T00:00:00Z",
  },
  {
    id: "les-des-201",
    college_id: "col-stjude-001",
    module_id: "mod-des-02",
    course_id: "course-des-401",
    title: "Typographic Scales: Manrope & Inter in Production",
    description: "Pairing geometric modern headings with readable neutral body text across multi-device viewports.",
    lesson_type: "video",
    order_index: 1,
    is_published: true,
    duration_seconds: 1840,
    estimated_reading_time_mins: 20,
    created_at: "2026-09-02T00:00:00Z",
    updated_at: "2026-09-02T00:00:00Z",
  },
  {
    id: "les-cs-101",
    college_id: "col-stjude-001",
    module_id: "mod-cs-01",
    course_id: "course-cs-482",
    title: "Raft Consensus: Leader Election & Log Replication",
    description: "Detailed analysis of Raft consensus protocol, safety invariants, randomized timers, and distributed state machine replication.",
    lesson_type: "video",
    order_index: 1,
    is_published: true,
    duration_seconds: 2100,
    estimated_reading_time_mins: 25,
    created_at: "2026-08-21T00:00:00Z",
    updated_at: "2026-08-21T00:00:00Z",
  },
  {
    id: "les-cs-102",
    college_id: "col-stjude-001",
    module_id: "mod-cs-01",
    course_id: "course-cs-482",
    title: "Storage Hierarchy & Edge Caching Architecture Monograph",
    description: "Comprehensive whitepaper on S3/R2 direct multipart uploads, global replication, and high-concurrency video delivery.",
    lesson_type: "pdf",
    order_index: 2,
    is_published: true,
    duration_seconds: 1500,
    estimated_reading_time_mins: 20,
    created_at: "2026-08-22T00:00:00Z",
    updated_at: "2026-08-22T00:00:00Z",
  },
  {
    id: "les-econ-101",
    college_id: "col-stjude-001",
    module_id: "mod-econ-01",
    course_id: "course-econ-310",
    title: "Mechanism Design Foundations & Incentive Compatibility",
    description: "Theoretical framework for truth-telling mechanisms, revelation principle, and social choice functions in multi-agent environments.",
    lesson_type: "video",
    order_index: 1,
    is_published: true,
    duration_seconds: 1950,
    estimated_reading_time_mins: 20,
    created_at: "2026-08-26T00:00:00Z",
    updated_at: "2026-08-26T00:00:00Z",
  },
  {
    id: "les-econ-102",
    college_id: "col-stjude-001",
    module_id: "mod-econ-01",
    course_id: "course-econ-310",
    title: "VCG Mechanisms & Optimal Auction Design Monograph",
    description: "Mathematical foundations and proof sketches for Vickrey-Clarke-Groves mechanisms and revenue equivalence theorems.",
    lesson_type: "pdf",
    order_index: 2,
    is_published: true,
    duration_seconds: 1600,
    estimated_reading_time_mins: 18,
    created_at: "2026-08-27T00:00:00Z",
    updated_at: "2026-08-27T00:00:00Z",
  }
];

export const DEMO_RESOURCES: Resource[] = [
  {
    id: "res-video-101",
    college_id: "col-stjude-001",
    lesson_id: "les-des-101",
    course_id: "course-des-401",
    title: "Lecture Recording: Initiation, Setup & Mental Models",
    resource_type: "video",
    file_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    file_size: 158400000,
    storage_provider: "stream",
    video_playback_id: "pb-video-des-101",
    video_duration: 2421,
    video_aspect_ratio: "16:9",
    chapters: [
      { id: "c1", title: "Introduction & Scope of Digital Projects", timestamp_seconds: 15, description: "Unique challenges and considerations in managing digital learning interfaces." },
      { id: "c2", title: "Project Initiation and Setup", timestamp_seconds: 383, description: "Identifying project goals, scope, building team roles, and milestone tracking." },
      { id: "c3", title: "Running the Project: Agile vs. Waterfall", timestamp_seconds: 1308, description: "Iterative sprints vs structured milestones: choosing the right approach." },
      { id: "c4", title: "Risk Mitigation & Production Delivery", timestamp_seconds: 1980, description: "Handling scope creep and ensuring high design fidelity." }
    ],
    is_downloadable: false,
    created_at: "2026-08-28T00:00:00Z",
    updated_at: "2026-08-28T00:00:00Z",
  },
  {
    id: "res-pdf-101",
    college_id: "col-stjude-001",
    lesson_id: "les-des-101",
    course_id: "course-des-401",
    title: "Lesson Slides & Cognitive Ergonomics Monograph",
    resource_type: "pdf",
    file_url: "/docs/cognitive-interfaces-guide.pdf",
    file_size: 4890000,
    storage_provider: "r2",
    is_downloadable: true,
    created_at: "2026-08-28T00:00:00Z",
    updated_at: "2026-08-28T00:00:00Z",
  },
  {
    id: "res-pdf-102",
    college_id: "col-stjude-001",
    lesson_id: "les-des-102",
    course_id: "course-des-401",
    title: "The Readwise Heuristic: Digital Reading Ergonomics (Full Text)",
    resource_type: "pdf",
    file_url: "/docs/readwise-design-heuristics.pdf",
    file_size: 7200000,
    storage_provider: "r2",
    is_downloadable: true,
    created_at: "2026-08-29T00:00:00Z",
    updated_at: "2026-08-29T00:00:00Z",
  },
  {
    id: "res-video-cs-101",
    college_id: "col-stjude-001",
    lesson_id: "les-cs-101",
    course_id: "course-cs-482",
    title: "Lecture: Raft Consensus Invariants",
    resource_type: "video",
    file_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    file_size: 142000000,
    storage_provider: "stream",
    video_playback_id: "pb-video-cs-101",
    video_duration: 2100,
    video_aspect_ratio: "16:9",
    chapters: [
      { id: "c1", title: "Introduction to Consensus", timestamp_seconds: 0 },
      { id: "c2", title: "Leader Election Dynamics", timestamp_seconds: 420 },
      { id: "c3", title: "Log Invariants & Commit Index", timestamp_seconds: 1200 }
    ],
    is_downloadable: false,
    created_at: "2026-08-21T00:00:00Z",
    updated_at: "2026-08-21T00:00:00Z",
  },
  {
    id: "res-pdf-cs-102",
    college_id: "col-stjude-001",
    lesson_id: "les-cs-102",
    course_id: "course-cs-482",
    title: "Storage Hierarchy & Edge Caching Monograph",
    resource_type: "pdf",
    file_url: "/docs/sample-monograph.pdf",
    file_size: 5120000,
    storage_provider: "r2",
    is_downloadable: true,
    created_at: "2026-08-22T00:00:00Z",
    updated_at: "2026-08-22T00:00:00Z",
  },
  {
    id: "res-video-econ-101",
    college_id: "col-stjude-001",
    lesson_id: "les-econ-101",
    course_id: "course-econ-310",
    title: "Lecture: Strategic Equilibrium & Incentives",
    resource_type: "video",
    file_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    file_size: 135000000,
    storage_provider: "stream",
    video_playback_id: "pb-video-econ-101",
    video_duration: 1950,
    video_aspect_ratio: "16:9",
    chapters: [
      { id: "c1", title: "Strategic Games Framework", timestamp_seconds: 0 },
      { id: "c2", title: "Dominant Strategy Mechanics", timestamp_seconds: 600 }
    ],
    is_downloadable: false,
    created_at: "2026-08-26T00:00:00Z",
    updated_at: "2026-08-26T00:00:00Z",
  },
  {
    id: "res-pdf-econ-102",
    college_id: "col-stjude-001",
    lesson_id: "les-econ-102",
    course_id: "course-econ-310",
    title: "VCG Mechanisms & Optimal Auctions Monograph",
    resource_type: "pdf",
    file_url: "/docs/sample-monograph.pdf",
    file_size: 6300000,
    storage_provider: "r2",
    is_downloadable: true,
    created_at: "2026-08-27T00:00:00Z",
    updated_at: "2026-08-27T00:00:00Z",
  }
];

export const DEMO_WATCH_PROGRESS: WatchProgress[] = [
  {
    id: "wp-001",
    college_id: "col-stjude-001",
    student_id: "user-student-001",
    lesson_id: "les-des-101",
    resource_id: "res-video-101",
    last_timestamp_seconds: 1110, // 18 mins 30s (matches screenshot 2: "18:30 / 40:21"!)
    max_timestamp_seconds: 1250,
    duration_seconds: 2421,
    is_completed: false,
    last_watched_at: "2026-11-04T12:30:00Z",
    updated_at: "2026-11-04T12:30:00Z",
  }
];

export const DEMO_PDF_BOOKMARKS: PdfBookmark[] = [
  {
    id: "bm-001",
    college_id: "col-stjude-001",
    student_id: "user-student-001",
    lesson_id: "les-des-102",
    resource_id: "res-pdf-102",
    page_number: 7,
    note: "Key diagram on line-height ratio: 1.6em for body paragraphs reduces cognitive fatigue by 24%.",
    created_at: "2026-11-02T16:45:00Z"
  },
  {
    id: "bm-002",
    college_id: "col-stjude-001",
    student_id: "user-student-001",
    lesson_id: "les-des-102",
    resource_id: "res-pdf-102",
    page_number: 12,
    note: "Warm off-white background (#F6F4EF) specular reflectance matrix.",
    created_at: "2026-11-03T11:20:00Z"
  }
];

export const DEMO_NOTES: Note[] = [
  {
    id: "note-001",
    college_id: "col-stjude-001",
    student_id: "user-student-001",
    course_id: "course-des-401",
    lesson_id: "les-des-101",
    timestamp_seconds: 383,
    content: "Project initiation: Identify project goals, scope, building team roles, and milestone tracking. Must avoid multi-modal dialog traps.",
    tags: ["project-initiation", "mental-models", "exam-prep"],
    created_at: "2026-11-04T10:14:00Z",
    updated_at: "2026-11-04T10:14:00Z"
  },
  {
    id: "note-002",
    college_id: "col-stjude-001",
    student_id: "user-student-001",
    course_id: "course-des-401",
    lesson_id: "les-des-101",
    timestamp_seconds: 1308,
    content: "Agile vs Waterfall trade-offs: Waterfall works best for regulatory compliance; Agile sprints are required for rapid iterative user feedback loops.",
    tags: ["methodologies", "agile"],
    created_at: "2026-11-04T10:35:00Z",
    updated_at: "2026-11-04T10:35:00Z"
  },
  {
    id: "note-003",
    college_id: "col-stjude-001",
    student_id: "user-student-001",
    course_id: "course-des-401",
    lesson_id: "les-des-102",
    page_number: 4,
    content: "Readwise spacing principle: keep gutter width >= 24px on desktop so eyes have clear horizontal breathing space.",
    tags: ["typography", "reading"],
    created_at: "2026-11-03T14:10:00Z",
    updated_at: "2026-11-03T14:10:00Z"
  }
];

export const DEMO_ASSIGNMENTS: Assignment[] = [
  {
    id: "asg-01",
    college_id: "col-stjude-001",
    course_id: "course-des-401",
    lesson_id: "les-des-103",
    title: "Minimalist Design System & Token Architecture",
    description: "Construct a complete design specification document for a modern academic workspace. Include typography scales, warm neutral token definitions, contrast verification, and responsive navigation wireframes.",
    due_date: "2026-11-12T23:59:00Z",
    max_points: 100,
    attachment_urls: ["/docs/assignment-1-guidelines.pdf"],
    created_at: "2026-09-01T00:00:00Z",
    updated_at: "2026-09-01T00:00:00Z",
    my_submission: {
      id: "sub-01",
      college_id: "col-stjude-001",
      assignment_id: "asg-01",
      student_id: "user-student-001",
      submission_text: "Attached is the comprehensive design system specification for Studyroom. Covers Manrope/Inter pairings, #F6F4EF surface tokens, and 8px grid matrices.",
      file_urls: ["https://example.com/simatupang_studyroom_spec.pdf"],
      grade: 96,
      feedback: "Exceptional clarity, rigorous typography tokens, and elegant hierarchy. Particularly impressed by the 150ms transition curves.",
      graded_by: "Prof. Marcus Vance",
      submitted_at: "2026-11-03T18:22:00Z",
      graded_at: "2026-11-04T09:15:00Z"
    }
  },
  {
    id: "asg-02",
    college_id: "col-stjude-001",
    course_id: "course-cs-482",
    title: "Raft Leader Election & Log Replication Implementation",
    description: "Implement a fault-tolerant state machine in Go or TypeScript satisfying the Raft consensus safety invariant. Test against simulated network partitions.",
    due_date: "2026-11-18T23:59:00Z",
    max_points: 100,
    created_at: "2026-09-05T00:00:00Z",
    updated_at: "2026-09-05T00:00:00Z"
  }
];

export const DEMO_ANNOUNCEMENTS: Announcement[] = [
  {
    id: "ann-001",
    college_id: "col-stjude-001",
    course_id: "course-des-401",
    author_id: "user-instructor-001",
    author_name: "Prof. Marcus Vance",
    author_avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=260&auto=format&fit=crop",
    title: "Midterm Design Critiques Schedule & Studio Guidelines",
    content: "Please review the updated presentation slots for next Tuesday's live design critiques. Ensure your high-fidelity prototype is deployed to a live staging URL by Monday 6:00 PM.",
    is_pinned: true,
    priority: "important",
    created_at: "2026-11-03T15:00:00Z",
    updated_at: "2026-11-03T15:00:00Z"
  },
  {
    id: "ann-002",
    college_id: "col-stjude-001",
    author_id: "user-admin-001",
    author_name: "Dr. Katherine Price (Dean of Academic Affairs)",
    author_avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=260&auto=format&fit=crop",
    title: "Campus Library Extended Hours & Cloud Compute Allocation",
    content: "All undergraduate researchers enrolled in Advanced HCI and Distributed Cloud Systems have been granted additional GPU compute credits for end-of-semester research projects.",
    is_pinned: false,
    priority: "normal",
    created_at: "2026-11-01T09:30:00Z",
    updated_at: "2026-11-01T09:30:00Z"
  }
];

export const DEMO_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-01",
    college_id: "col-stjude-001",
    user_id: "user-student-001",
    title: "Grade Released: Assignment 1",
    message: "Prof. Marcus Vance graded your Minimalist Design System specification: 96/100.",
    link: "/student/courses/course-des-401",
    type: "grade",
    is_read: false,
    created_at: "2026-11-04T09:15:00Z"
  },
  {
    id: "notif-02",
    college_id: "col-stjude-001",
    user_id: "user-student-001",
    title: "Upcoming Lecture Tomorrow at 10:00 AM",
    message: "DES-401: Typographic Scales & Spatial Rhythm live session in Hall 4B.",
    link: "/student/schedule",
    type: "course",
    is_read: false,
    created_at: "2026-11-04T08:00:00Z"
  }
];

export const DEMO_SCHEDULE_EVENTS = [
  {
    id: "ev-01",
    title: "DES-401: Spatial Models & Cognitive Interfaces",
    type: "lecture",
    date: "2026-11-05",
    time: "10:00 AM - 11:30 AM",
    location: "Design Studio 402 / Stream 1",
    instructor: "Prof. Marcus Vance",
    courseCode: "DES-401"
  },
  {
    id: "ev-02",
    title: "CS-482: Cloud Storage & Multi-Tenant Boundaries",
    type: "lecture",
    date: "2026-11-06",
    time: "02:00 PM - 03:30 PM",
    location: "Engineering Hall 101",
    instructor: "Prof. Marcus Vance",
    courseCode: "CS-482"
  },
  {
    id: "ev-03",
    title: "Assignment Due: Minimalist Design System Spec",
    type: "deadline",
    date: "2026-11-12",
    time: "11:59 PM",
    location: "Online Portal",
    courseCode: "DES-401"
  },
  {
    id: "ev-04",
    title: "Faculty Office Hours: Architecture Reviews",
    type: "office_hours",
    date: "2026-11-08",
    time: "03:00 PM - 05:00 PM",
    location: "Faculty Office 312 / Google Meet",
    instructor: "Prof. Marcus Vance",
    courseCode: "DES-401"
  }
];
