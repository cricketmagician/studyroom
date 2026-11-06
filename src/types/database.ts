export type UserRole = 'student' | 'instructor' | 'college_admin' | 'platform_admin';

export interface College {
  id: string;
  name: string;
  slug: string;
  domain?: string;
  logo_url?: string;
  primary_color?: string;
  address?: string;
  created_at: string;
  updated_at: string;
}

export interface Department {
  id: string;
  college_id: string;
  name: string;
  code: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface Batch {
  id: string;
  college_id: string;
  department_id: string;
  name: string;
  graduation_year: number;
  created_at: string;
}

export interface AcademicSession {
  id: string;
  college_id: string;
  name: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
  created_at: string;
}

export interface Profile {
  id: string;
  college_id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  role: UserRole;
  department_id?: string;
  batch_id?: string;
  student_id?: string;
  phone?: string;
  bio?: string;
  created_at: string;
  updated_at: string;
}

export interface Course {
  id: string;
  college_id: string;
  department_id: string;
  instructor_id: string;
  academic_session_id?: string;
  code: string;
  title: string;
  slug: string;
  description: string;
  syllabus?: string;
  cover_image: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  
  // Joins/aggregations
  instructor?: Profile;
  department?: Department;
  modules?: Module[];
  enrolled_count?: number;
  progress_percentage?: number;
}

export interface CourseEnrollment {
  id: string;
  college_id: string;
  course_id: string;
  student_id: string;
  enrolled_at: string;
  status: 'active' | 'completed' | 'dropped';
}

export interface Module {
  id: string;
  college_id: string;
  course_id: string;
  title: string;
  description?: string;
  order_index: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  lessons?: Lesson[];
}

export interface VideoChapter {
  id: string;
  title: string;
  timestamp_seconds: number;
  description?: string;
}

export interface Lesson {
  id: string;
  college_id: string;
  module_id: string;
  course_id: string;
  title: string;
  description?: string;
  lesson_type: 'video' | 'pdf' | 'mixed' | 'assignment';
  order_index: number;
  is_published: boolean;
  duration_seconds?: number;
  estimated_reading_time_mins?: number;
  created_at: string;
  updated_at: string;
  resources?: Resource[];
  assignment?: Assignment;
  is_completed?: boolean;
}

export interface Resource {
  id: string;
  college_id: string;
  lesson_id: string;
  course_id: string;
  title: string;
  resource_type: 'pdf' | 'video' | 'external_link' | 'notes';
  file_url: string;
  file_size?: number; // bytes
  storage_provider: 'r2' | 'supabase' | 'mux' | 'stream' | 'external' | 'local' | 'firebase';
  video_playback_id?: string;
  video_duration?: number;
  video_aspect_ratio?: string;
  chapters?: VideoChapter[];
  is_downloadable: boolean;
  created_at: string;
  updated_at: string;
}

export interface WatchProgress {
  id: string;
  college_id: string;
  student_id: string;
  lesson_id: string;
  resource_id: string;
  last_timestamp_seconds: number;
  max_timestamp_seconds: number;
  duration_seconds: number;
  is_completed: boolean;
  last_watched_at: string;
  updated_at: string;
}

export interface PdfBookmark {
  id: string;
  college_id: string;
  student_id: string;
  lesson_id: string;
  resource_id: string;
  page_number: number;
  note?: string;
  created_at: string;
}

export interface Note {
  id: string;
  college_id: string;
  student_id: string;
  course_id: string;
  lesson_id?: string;
  timestamp_seconds?: number;
  page_number?: number;
  content: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

export interface Assignment {
  id: string;
  college_id: string;
  course_id: string;
  lesson_id?: string;
  title: string;
  description: string;
  due_date: string;
  max_points: number;
  attachment_urls?: string[];
  created_at: string;
  updated_at: string;
  my_submission?: AssignmentSubmission;
}

export interface AssignmentSubmission {
  id: string;
  college_id: string;
  assignment_id: string;
  student_id: string;
  submission_text?: string;
  file_urls?: string[];
  grade?: number;
  feedback?: string;
  graded_by?: string;
  submitted_at: string;
  graded_at?: string;
}

export interface Announcement {
  id: string;
  college_id: string;
  course_id?: string;
  author_id: string;
  author_name?: string;
  author_avatar?: string;
  title: string;
  content: string;
  is_pinned: boolean;
  priority: 'normal' | 'important' | 'urgent';
  created_at: string;
  updated_at: string;
}

export interface NotificationItem {
  id: string;
  college_id: string;
  user_id: string;
  title: string;
  message: string;
  link?: string;
  type: 'assignment' | 'announcement' | 'course' | 'grade' | 'system';
  is_read: boolean;
  created_at: string;
}
