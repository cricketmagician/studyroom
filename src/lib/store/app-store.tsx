"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
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
  UserRole,
  College,
  Department,
  Batch,
  AcademicSession
} from "@/types/database";
import {
  DEMO_COLLEGES,
  DEMO_DEPARTMENTS,
  DEMO_BATCHES,
  DEMO_SESSIONS,
  DEMO_PROFILES,
  DEMO_COURSES,
  DEMO_MODULES,
  DEMO_LESSONS,
  DEMO_RESOURCES,
  DEMO_WATCH_PROGRESS,
  DEMO_PDF_BOOKMARKS,
  DEMO_NOTES,
  DEMO_ASSIGNMENTS,
  DEMO_ANNOUNCEMENTS,
  DEMO_NOTIFICATIONS
} from "@/lib/demo-data";

interface AppContextType {
  currentUser: Profile;
  currentCollege: College;
  allColleges: College[];
  departments: Department[];
  batches: Batch[];
  sessions: AcademicSession[];
  courses: Course[];
  modules: Module[];
  lessons: Lesson[];
  resources: Resource[];
  watchProgress: Record<string, WatchProgress>; // key: lesson_id
  pdfBookmarks: PdfBookmark[];
  notes: Note[];
  assignments: Assignment[];
  announcements: Announcement[];
  notifications: NotificationItem[];
  
  // Actions
  switchRole: (role: UserRole) => void;
  switchCollege: (collegeId: string) => void;
  updateWatchProgress: (lessonId: string, resourceId: string, timestamp: number, duration: number, isCompleted?: boolean) => void;
  addNote: (note: Omit<Note, "id" | "college_id" | "student_id" | "created_at" | "updated_at">) => Note;
  deleteNote: (id: string) => void;
  addPdfBookmark: (lessonId: string, resourceId: string, pageNumber: number, note?: string) => void;
  removePdfBookmark: (bookmarkId: string) => void;
  createCourse: (course: Partial<Course>) => Course;
  updateCourse: (id: string, updates: Partial<Course>) => void;
  createModule: (moduleId: Partial<Module>) => Module;
  createLesson: (lessonData: Partial<Lesson>, resourceData?: Partial<Resource>) => Lesson;
  reorderLessons: (moduleId: string, newLessonIds: string[]) => void;
  submitAssignment: (assignmentId: string, text: string, fileUrls: string[]) => void;
  markNotificationRead: (id: string) => void;
  createDepartment: (dept: Partial<Department>) => Department;
  createBatch: (batch: Partial<Batch>) => Batch;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentRole, setCurrentRole] = useState<UserRole>("student");
  const [colleges, setColleges] = useState<College[]>(DEMO_COLLEGES);
  const [selectedCollegeId, setSelectedCollegeId] = useState<string>("col-stjude-001");
  const [departments, setDepartments] = useState<Department[]>(DEMO_DEPARTMENTS);
  const [batches, setBatches] = useState<Batch[]>(DEMO_BATCHES);
  const [sessions, setSessions] = useState<AcademicSession[]>(DEMO_SESSIONS);
  const [courses, setCourses] = useState<Course[]>(DEMO_COURSES);
  const [modules, setModules] = useState<Module[]>(DEMO_MODULES);
  const [lessons, setLessons] = useState<Lesson[]>(DEMO_LESSONS);
  const [resources, setResources] = useState<Resource[]>(DEMO_RESOURCES);
  const [watchProgress, setWatchProgress] = useState<Record<string, WatchProgress>>({
    "les-des-101": DEMO_WATCH_PROGRESS[0]
  });
  const [pdfBookmarks, setPdfBookmarks] = useState<PdfBookmark[]>(DEMO_PDF_BOOKMARKS);
  const [notes, setNotes] = useState<Note[]>(DEMO_NOTES);
  const [assignments, setAssignments] = useState<Assignment[]>(DEMO_ASSIGNMENTS);
  const [announcements, setAnnouncements] = useState<Announcement[]>(DEMO_ANNOUNCEMENTS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(DEMO_NOTIFICATIONS);

  // Load from localStorage if present
  useEffect(() => {
    try {
      const savedRole = localStorage.getItem("studyroom_active_role") as UserRole | null;
      if (savedRole && ["student", "instructor", "college_admin", "platform_admin"].includes(savedRole)) {
        setCurrentRole(savedRole);
      }
      const savedWP = localStorage.getItem("studyroom_watch_progress");
      if (savedWP) {
        setWatchProgress(JSON.parse(savedWP));
      }
      const savedNotes = localStorage.getItem("studyroom_notes");
      if (savedNotes) {
        setNotes(JSON.parse(savedNotes));
      }
      const savedBookmarks = localStorage.getItem("studyroom_bookmarks");
      if (savedBookmarks) {
        setPdfBookmarks(JSON.parse(savedBookmarks));
      }
    } catch (e) {
      console.error("Error reading localStorage:", e);
    }
  }, []);

  const currentUser = DEMO_PROFILES.find(p => p.role === currentRole) || DEMO_PROFILES[0];
  const currentCollege = colleges.find(c => c.id === selectedCollegeId) || colleges[0];

  const switchRole = (role: UserRole) => {
    setCurrentRole(role);
    localStorage.setItem("studyroom_active_role", role);
  };

  const switchCollege = (collegeId: string) => {
    setSelectedCollegeId(collegeId);
  };

  const updateWatchProgress = (
    lessonId: string,
    resourceId: string,
    timestamp: number,
    duration: number,
    isCompleted?: boolean
  ) => {
    setWatchProgress(prev => {
      const existing = prev[lessonId];
      const maxTime = Math.max(existing?.max_timestamp_seconds || 0, timestamp);
      const completed = isCompleted ?? (existing?.is_completed || (duration > 0 && timestamp >= duration * 0.9));
      
      const updated: WatchProgress = {
        id: existing?.id || `wp-${Date.now()}`,
        college_id: selectedCollegeId,
        student_id: currentUser.id,
        lesson_id: lessonId,
        resource_id: resourceId,
        last_timestamp_seconds: Math.floor(timestamp),
        max_timestamp_seconds: Math.floor(maxTime),
        duration_seconds: Math.floor(duration),
        is_completed: completed,
        last_watched_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      const nextMap = { ...prev, [lessonId]: updated };
      localStorage.setItem("studyroom_watch_progress", JSON.stringify(nextMap));
      return nextMap;
    });
  };

  const addNote = (noteData: Omit<Note, "id" | "college_id" | "student_id" | "created_at" | "updated_at">): Note => {
    const newNote: Note = {
      id: `note-${Date.now()}`,
      college_id: selectedCollegeId,
      student_id: currentUser.id,
      ...noteData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const nextNotes = [newNote, ...notes];
    setNotes(nextNotes);
    localStorage.setItem("studyroom_notes", JSON.stringify(nextNotes));
    return newNote;
  };

  const deleteNote = (id: string) => {
    const nextNotes = notes.filter(n => n.id !== id);
    setNotes(nextNotes);
    localStorage.setItem("studyroom_notes", JSON.stringify(nextNotes));
  };

  const addPdfBookmark = (lessonId: string, resourceId: string, pageNumber: number, note?: string) => {
    const newBm: PdfBookmark = {
      id: `bm-${Date.now()}`,
      college_id: selectedCollegeId,
      student_id: currentUser.id,
      lesson_id: lessonId,
      resource_id: resourceId,
      page_number: pageNumber,
      note,
      created_at: new Date().toISOString(),
    };
    const next = [...pdfBookmarks, newBm];
    setPdfBookmarks(next);
    localStorage.setItem("studyroom_bookmarks", JSON.stringify(next));
  };

  const removePdfBookmark = (bookmarkId: string) => {
    const next = pdfBookmarks.filter(b => b.id !== bookmarkId);
    setPdfBookmarks(next);
    localStorage.setItem("studyroom_bookmarks", JSON.stringify(next));
  };

  const createCourse = (courseData: Partial<Course>): Course => {
    const newCourse: Course = {
      id: `course-${Date.now()}`,
      college_id: selectedCollegeId,
      department_id: courseData.department_id || departments[0].id,
      instructor_id: currentUser.id,
      academic_session_id: sessions[0].id,
      code: courseData.code || "NEW-101",
      title: courseData.title || "Untitled Academic Course",
      slug: (courseData.title || "untitled-course").toLowerCase().replace(/[^a-z0-9]/g, "-"),
      description: courseData.description || "Course description pending.",
      cover_image: courseData.cover_image || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800&auto=format&fit=crop",
      is_published: courseData.is_published ?? true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      enrolled_count: 0,
      progress_percentage: 0
    };
    setCourses(prev => [newCourse, ...prev]);
    return newCourse;
  };

  const updateCourse = (id: string, updates: Partial<Course>) => {
    setCourses(prev => prev.map(c => c.id === id ? { ...c, ...updates, updated_at: new Date().toISOString() } : c));
  };

  const createModule = (modData: Partial<Module>): Module => {
    const newMod: Module = {
      id: `mod-${Date.now()}`,
      college_id: selectedCollegeId,
      course_id: modData.course_id || courses[0].id,
      title: modData.title || "New Module",
      description: modData.description || "",
      order_index: (modules.filter(m => m.course_id === modData.course_id).length + 1),
      is_published: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setModules(prev => [...prev, newMod]);
    return newMod;
  };

  const createLesson = (lessonData: Partial<Lesson>, resourceData?: Partial<Resource>): Lesson => {
    const lessonId = `les-${Date.now()}`;
    const newLesson: Lesson = {
      id: lessonId,
      college_id: selectedCollegeId,
      module_id: lessonData.module_id || modules[0].id,
      course_id: lessonData.course_id || courses[0].id,
      title: lessonData.title || "New Lesson",
      description: lessonData.description || "",
      lesson_type: lessonData.lesson_type || "video",
      order_index: (lessons.filter(l => l.module_id === lessonData.module_id).length + 1),
      is_published: lessonData.is_published ?? true,
      duration_seconds: lessonData.duration_seconds || 1200,
      estimated_reading_time_mins: lessonData.estimated_reading_time_mins || 15,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    setLessons(prev => [...prev, newLesson]);

    if (resourceData) {
      const newResource: Resource = {
        id: `res-${Date.now()}`,
        college_id: selectedCollegeId,
        lesson_id: lessonId,
        course_id: newLesson.course_id,
        title: resourceData.title || newLesson.title,
        resource_type: resourceData.resource_type || (newLesson.lesson_type === 'pdf' ? 'pdf' : 'video'),
        file_url: resourceData.file_url || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        file_size: resourceData.file_size || 52428800,
        storage_provider: resourceData.storage_provider || "stream",
        chapters: resourceData.chapters || [
          { id: "c1", title: "Introduction", timestamp_seconds: 0 },
          { id: "c2", title: "Main Topic Analysis", timestamp_seconds: 300 }
        ],
        is_downloadable: resourceData.is_downloadable ?? true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      setResources(prev => [...prev, newResource]);
    }

    return newLesson;
  };

  const reorderLessons = (moduleId: string, newLessonIds: string[]) => {
    setLessons(prev => {
      return prev.map(l => {
        if (l.module_id === moduleId) {
          const newIdx = newLessonIds.indexOf(l.id);
          if (newIdx !== -1) {
            return { ...l, order_index: newIdx + 1 };
          }
        }
        return l;
      });
    });
  };

  const submitAssignment = (assignmentId: string, text: string, fileUrls: string[]) => {
    const submission: AssignmentSubmission = {
      id: `sub-${Date.now()}`,
      college_id: selectedCollegeId,
      assignment_id: assignmentId,
      student_id: currentUser.id,
      submission_text: text,
      file_urls: fileUrls,
      submitted_at: new Date().toISOString(),
    };

    setAssignments(prev => prev.map(a => {
      if (a.id === assignmentId) {
        return {
          ...a,
          my_submission: submission
        };
      }
      return a;
    }));
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const createDepartment = (dept: Partial<Department>): Department => {
    const newDept: Department = {
      id: `dept-${Date.now()}`,
      college_id: selectedCollegeId,
      name: dept.name || "New Department",
      code: dept.code || "NEW",
      description: dept.description || "",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setDepartments(prev => [...prev, newDept]);
    return newDept;
  };

  const createBatch = (batch: Partial<Batch>): Batch => {
    const newBatch: Batch = {
      id: `batch-${Date.now()}`,
      college_id: selectedCollegeId,
      department_id: batch.department_id || departments[0]?.id || "",
      name: batch.name || "Class of 2029",
      graduation_year: batch.graduation_year || 2029,
      created_at: new Date().toISOString(),
    };
    setBatches(prev => [...prev, newBatch]);
    return newBatch;
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        currentCollege,
        allColleges: colleges,
        departments,
        batches,
        sessions,
        courses,
        modules,
        lessons,
        resources,
        watchProgress,
        pdfBookmarks,
        notes,
        assignments,
        announcements,
        notifications,
        switchRole,
        switchCollege,
        updateWatchProgress,
        addNote,
        deleteNote,
        addPdfBookmark,
        removePdfBookmark,
        createCourse,
        updateCourse,
        createModule,
        createLesson,
        reorderLessons,
        submitAssignment,
        markNotificationRead,
        createDepartment,
        createBatch
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
