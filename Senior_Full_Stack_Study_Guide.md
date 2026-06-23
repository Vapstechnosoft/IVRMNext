# Senior Full Stack Developer Study Guide - Part 1: Core Frameworks

This document covers **Section 1 (React Fundamentals)**, **Section 2 (Next.js Complete Architecture)**, and **Section 8 (State Management)** with a focus on enterprise-level production standards.

---

# SECTION 1 - REACT FUNDAMENTALS

## 1. Virtual DOM & Reconciliation
- **Concept Explanation:** The Virtual DOM is a lightweight JavaScript representation of the actual DOM. When state changes, React creates a new Virtual DOM, compares it with the previous one (Diffing Algorithm), and calculates the most efficient way to update the real DOM.
- **Why it is needed:** Direct DOM manipulation is extremely slow and resource-intensive. The Virtual DOM batches updates and applies them efficiently.
- **Where it is used:** Every single React component rendering process.
- **Mistakes Developers Make:** Using array indices as `key` props in mapped lists. This breaks the diffing algorithm during reconciliation, causing unnecessary re-renders or state mismatches.

## 2. React Lifecycle (Hooks Era)
- **Concept Explanation:** The lifecycle of a component includes Mounting, Updating, and Unmounting. In functional components, this is entirely managed via the `useEffect` hook.
- **Why it is needed:** To execute side effects like fetching data when a component loads, reacting to state changes, or cleaning up event listeners when a component unmounts.
- **Production Code Example:**
```tsx
import { useEffect, useState } from 'react';

export function ExamTimer({ durationInMinutes }: { durationInMinutes: number }) {
    const [timeLeft, setTimeLeft] = useState(durationInMinutes * 60);

    useEffect(() => {
        // MOUNTING: Start the timer
        const timerId = setInterval(() => {
            setTimeLeft((prev) => prev - 1);
        }, 1000);

        // UNMOUNTING: Cleanup to prevent memory leaks
        return () => clearInterval(timerId);
    }, []); // Empty dependency array = runs once on mount

    return <div>Time Left: {Math.floor(timeLeft / 60)}:{timeLeft % 60}</div>;
}
```

## 3. Hooks (`useState`, `useEffect`, `useMemo`, `useCallback`, `useRef`)
- **`useState`:** Manages local component state.
- **`useEffect`:** Handles side effects (API calls, DOM manipulation).
- **`useMemo`:** Memoizes an expensive calculation so it doesn't re-run on every render unless its dependencies change.
- **`useCallback`:** Memoizes a function definition so it doesn't get recreated on every render (crucial when passing callbacks to optimized child components).
- **`useRef`:** Stores a mutable value that does *not* cause a re-render when updated, or accesses DOM elements directly.

> [!TIP]
> **Performance Consideration:** Never overuse `useMemo` and `useCallback`. The cost of memoization (comparing dependencies) can sometimes be higher than just recreating the function or value. Only use them for expensive calculations or when passing props to deeply nested/memoized children.

## 4. Props vs State
- **Props:** Immutable data passed from a parent to a child.
- **State:** Mutable data managed internally by the component itself.

## 5. Controlled vs Uncontrolled Components
- **Controlled:** Form data is handled by React state. Every keystroke updates the state.
- **Uncontrolled:** Form data is handled by the DOM itself. You read the values using `useRef` only when needed (e.g., on submit).
- **Senior Answer:** Use Controlled components for dynamic forms requiring validation on-the-fly (like matching passwords). Use Uncontrolled components using libraries like `react-hook-form` to drastically improve performance in massive enterprise forms (like a 50-field student admission form).

---

# SECTION 2 - NEXT JS COMPLETE ARCHITECTURE

## 1. Why Next.js over React?
React is a library; Next.js is a framework. Next.js provides built-in routing, Server-Side Rendering (SSR), Static Site Generation (SSG), Image Optimization, SEO capabilities, and API Routes out of the box, which are required for enterprise-grade applications.

## 2. App Router vs Pages Router
- **Pages Router (`pages/`):** The legacy routing system based on file structure. Relies heavily on `getServerSideProps` and `getStaticProps`.
- **App Router (`app/`):** The modern, default routing system based on React Server Components. It introduces layouts, streaming, and simplifies data fetching.

## 3. Layouts, Nested Layouts & Route Groups
- **Layouts (`layout.tsx`):** UI that is shared between multiple routes. State is preserved on navigation.
- **Nested Layouts:** Layouts can be nested. A `dashboard/layout.tsx` sits inside the root `layout.tsx`.
- **Route Groups (`(folder)`):** Allows grouping routes logically without affecting the URL. E.g., `app/(auth)/login` resolves to `/login`.

## 4. Rendering Strategies
- **CSR (Client-Side Rendering):** HTML is empty; JS renders the UI in the browser. Best for highly interactive dashboards.
- **SSR (Server-Side Rendering):** HTML is generated on the server per request. Best for dynamic SEO data.
- **SSG (Static Site Generation):** HTML is generated at build time. Best for blogs or marketing pages.
- **ISR (Incremental Static Regeneration):** Static pages that rebuild in the background after a certain time interval.

## 5. Server Components vs Client Components
- **Server Components (Default):** Render on the server, send zero JS to the client. Secure (can query DB directly), fast, and SEO friendly.
- **Client Components (`'use client'`):** Render on the client. Required for interactivity (onClick), React Hooks (`useState`), or browser APIs (`window`).

> [!IMPORTANT]
> **Architecture Rule:** Push Client Components as far down the tree as possible. If a page needs a button, make *only the button* a Client Component, leaving the rest of the page as a Server Component.

## Architecture Diagram (Next.js Request Flow)

```ascii
[ User Browser ]
       |
       v (HTTP Request)
[ Next.js Edge / Node Server ]
       |
       +--> Middleware (Check JWT / Role Auth)
       |      |-- Fail -> Redirect to /login
       |      |-- Pass -> Continue
       v
[ App Router (Server Components) ]
       |
       +--> Fetch Data (SQL Server via Web API / EF Core)
       +--> Render Initial HTML + Server State
       |
       v (Send HTML to Browser)
[ Browser ] -> Renders HTML instantly (Fast FCP)
       |
       v (Download JS Bundles)
[ Hydration ] -> React attaches Event Listeners to Client Components
```

---

# SECTION 8 - STATE MANAGEMENT

In an enterprise Exam Module, state management must be highly structured.

## 1. Context API
- **Concept:** Built-in React tool to pass data through the component tree without prop drilling.
- **When to use:** Global themes (Light/Dark mode), user authentication state, localization.
- **Mistakes:** Do not use Context for frequently changing data. Whenever a Context value changes, *every* component consuming that context re-renders.

## 2. Redux Toolkit (RTK)
- **Concept:** Predictable state container. RTK is the modern, boilerplate-free version of Redux.
- **When to use:** Massive applications with complex, highly interconnected global state (e.g., caching hundreds of exam questions, offline syncing).
- **Architecture Note:** With Next.js Server Components and React Query / SWR handling server state caching, the need for Redux has drastically decreased.

## 3. Zustand
- **Concept:** A small, fast, and scalable bearbones state-management solution using simplified flux principles.
- **When to use:** When you need global state but want to avoid the heavy boilerplate of Redux. It solves the performance issues of Context API because components only re-render if the specific slice of state they subscribe to changes.

## Production Example: Zustand in Exam Module

```typescript
import { create } from 'zustand';

// 1. Define Types
interface ExamState {
    examId: number | null;
    currentQuestionIndex: number;
    answers: Record<number, string>; // QuestionId -> Answer
    setExam: (id: number) => void;
    setAnswer: (questionId: number, answer: string) => void;
    nextQuestion: () => void;
}

// 2. Create Store
export const useExamStore = create<ExamState>((set) => ({
    examId: null,
    currentQuestionIndex: 0,
    answers: {},
    
    setExam: (id) => set({ examId: id, currentQuestionIndex: 0, answers: {} }),
    
    setAnswer: (questionId, answer) => 
        set((state) => ({
            answers: { ...state.answers, [questionId]: answer }
        })),
        
    nextQuestion: () => 
        set((state) => ({ currentQuestionIndex: state.currentQuestionIndex + 1 }))
}));

// 3. Usage in Component
function QuestionViewer({ questionId }: { questionId: number }) {
    // Component ONLY re-renders if the answer for THIS specific question changes!
    const answer = useExamStore((state) => state.answers[questionId]);
    const setAnswer = useExamStore((state) => state.setAnswer);

    return (
        <input 
            value={answer || ''} 
            onChange={(e) => setAnswer(questionId, e.target.value)} 
        />
    );
}
```
# Senior Full Stack Developer Study Guide - Part 2: Security & Architecture

This document covers **Section 3 (Login Implementation)**, **Section 4 (Enterprise Project Structure)**, and **Section 7 (API Integration)**.

---

# SECTION 3 - LOGIN IMPLEMENTATION & AUTHENTICATION

## 1. Authentication vs Authorization
- **Authentication (AuthN):** Verifying *who* the user is (Login, JWT, Sessions).
- **Authorization (AuthZ):** Verifying *what* the user is allowed to do (Role-Based Access Control).

## 2. JWT & Token Flow
- **Access Token:** Short-lived token (e.g., 15 minutes) used to access protected APIs.
- **Refresh Token:** Long-lived token (e.g., 7 days) stored securely (HttpOnly Cookie) used to request a new Access Token without forcing the user to log in again.

## 3. Login Architecture Diagram

```ascii
[ Next.js Client ]                           [ .NET Core Web API ]
       |                                              |
       |-- 1. POST /api/login (User/Pass) ----------->| Validate DB
       |<-- 2. Returns JWT Access & Refresh Token ----|
       |                                              |
       |-- 3. Save Access Token in Memory/AuthStore   |
       |-- 4. Save Refresh Token in HttpOnly Cookie   |
       |                                              |
       |-- 5. Request Protected Route (Header Auth) ->|
       |<-- 6. 401 Unauthorized (Token Expired) ------|
       |                                              |
       |-- 7. POST /api/refresh (Send HttpOnly) ----->| Validate Token
       |<-- 8. Returns NEW Access Token --------------|
       |                                              |
       |-- 9. Retry Original Request (Step 5) ------->|
```

## 4. Next.js Middleware Implementation
Middleware intercepts all requests *before* they complete. This prevents unauthorized users from even loading a protected page.

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const token = request.cookies.get('ivrm_access_token')?.value;
    const { pathname } = request.nextUrl;

    const publicRoutes = ['/login', '/forgot-password'];
    
    // 1. If trying to access a protected route without a token
    if (!token && !publicRoutes.includes(pathname)) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // 2. If logged in and trying to access login page
    if (token && publicRoutes.includes(pathname)) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
```

---

# SECTION 4 - ENTERPRISE PROJECT STRUCTURE

A poorly structured project becomes unmaintainable within 6 months. For an enterprise Next.js App Router project, feature-driven architecture is highly recommended.

## 1. Folder Structure
```text
src/
â”œâ”€â”€ app/                    # Next.js App Router (Pages & Layouts)
â”‚   â”œâ”€â”€ (auth)/             # Route Group: login, register
â”‚   â”œâ”€â”€ (dashboard)/        # Route Group: layout.tsx wrapping dashboard
â”‚   â”‚   â”œâ”€â”€ exam/           # Exam Module Entry
â”‚   â”‚   â””â”€â”€ reports/        # Reports Module Entry
â”‚   â”œâ”€â”€ layout.tsx          # Root Layout (Providers, Fonts)
â”‚   â””â”€â”€ globals.css         # Global Tailwind CSS
â”‚
â”œâ”€â”€ components/             # Centralized UI Components (Atomic Design)
â”‚   â”œâ”€â”€ ui/                 # Reusable (Button, Input, GenericDataTable)
â”‚   â”œâ”€â”€ layout/             # Sidebar, Header, Breadcrumbs
â”‚   â””â”€â”€ forms/              # Form wrappers, React Hook Form setup
â”‚
â”œâ”€â”€ features/               # FEATURE-DRIVEN MODULES (Domain Logic)
â”‚   â”œâ”€â”€ exam/               # Everything related exclusively to Exams
â”‚   â”‚   â”œâ”€â”€ components/     # Exam-specific UI (MarksGrid.tsx)
â”‚   â”‚   â”œâ”€â”€ hooks/          # useExamData.ts
â”‚   â”‚   â”œâ”€â”€ services/       # examApi.ts
â”‚   â”‚   â””â”€â”€ types/          # IExam, IMarks
â”‚   â””â”€â”€ admission/          # Admission Module
â”‚
â”œâ”€â”€ lib/                    # Core configs & heavy utilities
â”‚   â”œâ”€â”€ axios.ts            # Axios Interceptors Configuration
â”‚   â”œâ”€â”€ auth.ts             # NextAuth / JWT Helpers
â”‚   â””â”€â”€ utils.ts            # ClassName mergers (tailwind-merge)
â”‚
â”œâ”€â”€ hooks/                  # Global Hooks (useDebounce, useWindowSize)
â”œâ”€â”€ store/                  # Global State (Zustand/Redux slices)
â”œâ”€â”€ types/                  # Global TypeScript Interfaces
â””â”€â”€ middleware.ts           # Edge Middleware for Route Protection
```

### Why this structure?
- **Feature Folders:** Putting all exam-related hooks, types, and APIs inside `features/exam/` ensures that if you delete the Exam module, you don't leave orphaned code scattered across `src/hooks`, `src/types`, and `src/services`.
- **Atomic UI:** `components/ui` strictly holds pure UI elements that have *no business logic*. A `Button` shouldn't know what an "Exam" is.

---

# SECTION 7 - API INTEGRATION

Enterprise API integration requires centralized logic for Tokens, Error Handling, and Retries.

## 1. Axios Instance with Interceptors & Token Refresh

```typescript
// lib/axios.ts
import axios from 'axios';
import { getCookie, setCookie, deleteCookie } from './cookieUtils'; // Custom helper

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    timeout: 10000, // 10 seconds
    headers: { 'Content-Type': 'application/json' }
});

// Request Interceptor: Attach Access Token
api.interceptors.request.use(
    (config) => {
        const token = getCookie('ivrm_access_token');
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor: Global Error Handling & Token Refresh
api.interceptors.response.use(
    (response) => response, // Success, pass it through
    async (error) => {
        const originalRequest = error.config;

        // Prevent infinite loops using a custom flag _retry
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // 1. Attempt to get a new token using HttpOnly Refresh Cookie
                // Assuming backend reads the refresh token from the cookie securely
                const { data } = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh-token`, {}, {
                    withCredentials: true 
                });

                // 2. Save the new access token
                setCookie('ivrm_access_token', data.accessToken);

                // 3. Update the original request header and retry it
                originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
                return api(originalRequest);
            } catch (refreshError) {
                // 4. Refresh failed. Log user out.
                deleteCookie('ivrm_access_token');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        // Global Exception Handling (Toasts)
        if (error.response?.status >= 500) {
            console.error('Server Error: ', error.response.data.message);
            // Optionally dispatch a global Toast notification here
        }

        return Promise.reject(error);
    }
);

export default api;
```

## 2. API Design Considerations
- **Avoid prop-drilling API logic:** Call APIs within feature-specific hooks (e.g., `useQuery` from React Query combined with your Axios instance).
- **Security:** Never store JWT Access Tokens in `localStorage` due to XSS (Cross-Site Scripting) vulnerabilities. Use HttpOnly cookies whenever possible, or store the Access Token in JavaScript memory while the Refresh Token sits in an HttpOnly cookie.
# Senior Full Stack Developer Study Guide - Part 3: UI & Navigation

This document covers **Section 5 (Centralized Components)** and **Section 9 (Navigation Flow)**.

---

# SECTION 5 - CENTRALIZED COMPONENTS

Enterprise applications require a central UI library. This prevents redundant code, maintains design consistency, and makes the application easily themeable.

## 1. Why Centralized Components?
- **Single Source of Truth:** If the client wants rounded buttons instead of square buttons, you change one file (`components/ui/Button.tsx`) instead of 500 files.
- **Accessibility:** Ensure ARIA roles and tab indices are implemented correctly once.
- **Variants:** Using libraries like `class-variance-authority` (CVA) allows you to define standard variants (primary, secondary, outline, destructive).

## 2. Reusable Button Component (Production Example)

```tsx
import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils'; // tailwind-merge utility
import { Loader2 } from 'lucide-react';

// Define standardized variants
const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-red-500 text-white hover:bg-red-600',
        outline: 'border border-input bg-transparent hover:bg-accent',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isLoading, children, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
```

## 3. Reusable Input Component (Production Example)
Handles standard inputs, integrates well with `react-hook-form`.

```tsx
import { forwardRef, InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <div className="w-full">
        <input
          type={type}
          className={cn(
            'flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-red-500 focus-visible:ring-red-500',
            className
          )}
          ref={ref}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';
```

## 4. Generic Data Table Architecture
A generic table is the most critical component in an ERP. It must handle columns, data, sorting, and pagination generically.

**Where it is used:** Exam List, Student List, Fee Defaulters.

**Implementation Concept:**
- Pass `columns` (using `@tanstack/react-table` column definitions).
- Pass `data`.
- Keep table state (pagination, sorting) synced with the URL using `nuqs` (Next Use Query State) so URLs are shareable.

---

# SECTION 9 - NAVIGATION FLOW

Enterprise navigation requires dynamic sidebar menus based on Role Permissions (AuthZ) and Breadcrumbs to prevent users from getting lost.

## 1. Page Navigation Flow
```ascii
[ Login Page ]
      |
      v (JWT Authenticated)
[ Dashboard (Overview) ]
      |
      +--> [ Exam Module ] 
      |          |--> [ Exam Master ] -> CRUD Exams
      |          |--> [ Marks Entry ] -> Enter marks for Students
      |          |--> [ Reports ]     -> Generate Report Cards
      |
      +--> [ Admission Module ]
```

## 2. Dynamic Sidebar Menu Implementation
In Next.js, the Sidebar is usually a Server Component that reads the user's role from the session and fetches the allowed menu items from the database.

```tsx
// components/layout/Sidebar.tsx
import { auth } from '@/lib/auth'; // Custom auth helper
import { getMenuForRole } from '@/services/menuService';
import Link from 'next/link';

export async function Sidebar() {
    const session = await auth();
    
    // Server-side fetching of menu items based on role (Admin, Teacher, etc.)
    const menuItems = await getMenuForRole(session.user.role);

    return (
        <aside className="w-64 bg-gray-900 text-white min-h-screen p-4">
            <div className="text-xl font-bold mb-6">School ERP</div>
            <nav className="flex flex-col space-y-2">
                {menuItems.map((item) => (
                    <Link key={item.id} href={item.url} className="p-2 hover:bg-gray-800 rounded">
                        {item.icon && <item.icon className="mr-2 inline" />}
                        {item.name}
                    </Link>
                ))}
            </nav>
        </aside>
    );
}
```

## 3. Dynamic Breadcrumbs
Breadcrumbs improve UX significantly. In Next.js App Router, we can parse the `usePathname` to generate breadcrumbs dynamically.

```tsx
// components/layout/Breadcrumbs.tsx
'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

export function Breadcrumbs() {
    const pathname = usePathname();
    const paths = pathname.split('/').filter(Boolean);

    return (
        <nav aria-label="breadcrumb">
            <ol className="flex space-x-2 text-sm text-gray-500">
                <li><Link href="/dashboard" className="hover:underline">Home</Link></li>
                {paths.map((path, index) => {
                    const href = '/' + paths.slice(0, index + 1).join('/');
                    const isLast = index === paths.length - 1;
                    const label = path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, ' ');

                    return (
                        <li key={href} className="flex items-center">
                            <span className="mx-2">/</span>
                            {isLast ? (
                                <span className="text-gray-900 font-semibold">{label}</span>
                            ) : (
                                <Link href={href} className="hover:underline">{label}</Link>
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}
```
# Senior Full Stack Developer Study Guide - Part 4: Domain & System Design

This document covers **Section 6 (Exam Module Architecture)** and **Section 11 (System Design)**.

---

# SECTION 6 - EXAM MODULE ARCHITECTURE

Building an Enterprise Exam Management Module requires careful entity relationship mapping and a robust data flow.

## 1. Complete Flow (Login to Marks Publishing)
1. **Admin Login:** Admin creates `Exam Categories` (e.g., Formative, Summative) and `Exam Groups`.
2. **Setup Schedule:** Admin creates `Exam Schedules` linking Subjects to Dates and Time Slots.
3. **Teacher Login:** Subject Teacher logs in. The system checks `Subject Allocation` tables.
4. **Marks Entry:** Teacher selects a Class, Section, and Exam. Enters marks. Data is saved as a Draft.
5. **Finalization:** Teacher marks the entry as "Final".
6. **Grade Calculation:** A background job (or Azure Function) triggers to calculate Totals, Percentages, and Grades based on predefined rubrics.
7. **Publishing:** Principal reviews and clicks "Publish".
8. **Notification:** Parents and Students receive an SMS/Email (via Azure Service Bus or Notification microservice).
9. **Report Cards:** Parents log in and download PDF Report Cards.

## 2. Database Design (SQL Server - Simplified ERD)

```sql
-- Core Tables
CREATE TABLE MasterExam (
    ExamId INT PRIMARY KEY IDENTITY(1,1),
    ExamName VARCHAR(100), -- e.g., 'Mid Term 1'
    ExamCategoryId INT FOREIGN KEY REFERENCES ExamCategory(CategoryId)
);

CREATE TABLE ExamSchedule (
    ScheduleId INT PRIMARY KEY IDENTITY(1,1),
    ExamId INT FOREIGN KEY REFERENCES MasterExam(ExamId),
    ClassId INT,
    SubjectId INT,
    ExamDate DATE,
    MaxMarks DECIMAL(5,2),
    MinMarks DECIMAL(5,2)
);

CREATE TABLE StudentMarks (
    MarkId BIGINT PRIMARY KEY IDENTITY(1,1),
    ScheduleId INT FOREIGN KEY REFERENCES ExamSchedule(ScheduleId),
    StudentId BIGINT,
    MarksObtained DECIMAL(5,2),
    Grade VARCHAR(5),
    IsAbsent BIT DEFAULT 0,
    EnteredBy INT -- TeacherId
);
```

## 3. Component Architecture (React/Next.js)

For the **Marks Entry** screen, performance is critical. A grid with 50 students and 10 subjects requires 500 input boxes.

**Optimized Component Structure:**
- `MarksEntryPage` (Server Component) -> Fetches students and subjects.
  - `MarksEntryGrid` (Client Component) -> Renders the table.
    - `MarksInputCell` (Memoized Client Component) -> Handles individual input changes using local state and debouncing before updating global `Zustand` store.

---

# SECTION 11 - SYSTEM DESIGN

A Senior .NET Full Stack Developer must understand how to scale the application when 50,000 students log in to check their results simultaneously.

## 1. High-Level Architecture Diagram (Azure)

```ascii
                     [ Internet ]
                          |
                  [ Azure Traffic Manager ]
                          |
             [ Azure Front Door / CDN (Caches Static Assets) ]
                          |
                [ Azure API Gateway ] ------------------+
                          |                             |
      +-------------------+-------------------+         | (Async Events)
      |                   |                   |         v
[ Auth Service ]  [ Exam Service ]  [ Student Service ] [ Azure Service Bus ]
 (.NET Web API)    (.NET Web API)    (.NET Web API)             |
      |                   |                   |                 v
   [ Redis ]           [ Redis ]           [ Redis ]    [ Notification Function ]
      |                   |                   |         (Sends SMS / Email)
      +-------------------+-------------------+
                          |
              [ Azure SQL Database (Primary) ]
                          |
            [ Azure SQL Database (Read-Replica) ]
```

## 2. Microservices Justification
- **Auth Service:** Handles JWT generation.
- **Exam Service:** Handles marks entry and grade calculation. Heaviest load during exam season.
- **Student Service:** Handles profiles, attendance.
- **Notification Service (Worker):** Consumes messages from Azure Service Bus to send SMS/Emails without blocking the main API.

## 3. Caching Strategy (Redis)
**Why Redis?** Relational databases bottleneck under heavy read load.
- **What to cache:** Master tables (Classes, Sections, Subjects, Exam Categories). These rarely change.
- **What NOT to cache:** Highly volatile data (Marks being actively entered).
- **Read-Heavy caching:** When results are published, cache the finalized Report Card JSON for each student. When 5,000 parents hit the "View Report Card" button, the data is served from Redis in 5ms instead of querying SQL Server.

## 4. Scalability (Azure)
- **Azure App Service (or AKS):** Configure auto-scaling rules. "If CPU > 70% for 5 minutes, spin up 2 more instances."
- **Azure SQL Read Replicas:** Route all `SELECT` queries (like generating reports) to the Read Replica, leaving the Primary database completely free to handle `INSERT/UPDATE` queries (like teachers entering marks).

## 5. Report Card Generation
**Challenge:** Generating 5,000 PDFs synchronously will crash the server.
**Solution:**
1. User clicks "Generate All Reports".
2. API puts a message `{"action": "generate_reports", "classId": 10}` on **Azure Service Bus**.
3. API returns HTTP 202 Accepted ("Processing started").
4. A background **Azure Function** picks up the message, generates PDFs, stores them in **Azure Blob Storage**, and updates a status table.
5. The frontend polls the status API or receives a SignalR WebSocket push notification when the PDFs are ready to download.
# Senior Full Stack Developer Study Guide - Part 5: Interview Masterclass

This document covers **Sections 10 & 12 (Highly Curated Interview Questions)**. It contains the most critical, heavily-tested questions for a Senior .NET Full Stack role focusing on Next.js, React, and Architecture. Each question provides a structured progression of answers.

---

## CATEGORY 1: NEXT.JS & RENDERING ARCHITECTURE

### Q1: Explain the difference between SSR, CSR, SSG, and ISR in Next.js.
- **Beginner Answer:** CSR renders HTML in the browser. SSR renders it on the server per request. SSG renders it once at build time. ISR updates static pages in the background.
- **Mid-Level Answer:** In App Router, we use Server Components for SSR/SSG. If we need SEO, we use SSR/SSG. If we have a dashboard with a lot of user interaction, we use Client Components (CSR). ISR allows us to cache a page but revalidate it every `X` seconds using `revalidate`.
- **Senior-Level Answer:** In an enterprise ERP, SSR is expensive if heavily trafficked. We reserve SSR for highly dynamic public pages. For the Exam Module Dashboard, we predominantly use Client Components with React Query for CSR data fetching, because the data is highly specific to the logged-in user and caching HTML isn't beneficial. We use ISR for public-facing Notice Boards so the database isn't hit for every request, drastically improving performance.

### Q2: How does Routing work in the Next.js App Router compared to the Pages Router?
- **Beginner Answer:** App Router uses folders instead of files. You have to name the file `page.tsx` for it to be a route.
- **Mid-Level Answer:** App Router allows nested layouts (`layout.tsx`) which preserve state across navigations, unlike Pages router where `_app.tsx` handled everything. It also defaults to Server Components.
- **Senior-Level Answer:** App Router fundamentally changes architecture. We use Route Groups `(auth)` to organize code without affecting URLs. It supports advanced routing patterns like Intercepting Routes and Parallel Routes, which are perfect for rendering Modals (like a quick "Edit Marks" modal) while keeping the background URL intact and preserving shareability.

---

## CATEGORY 2: REACT HOOKS & PERFORMANCE

### Q3: When should you use `useMemo` and `useCallback`?
- **Beginner Answer:** `useMemo` caches a value, `useCallback` caches a function. They make the app faster.
- **Mid-Level Answer:** They prevent unnecessary re-renders. If I pass a function to a child component, the child will re-render every time the parent renders because functions are re-created. Wrapping it in `useCallback` fixes this.
- **Senior-Level Answer:** Premature optimization is the root of all evil. The cost of comparing dependencies in `useMemo` can exceed the cost of re-calculating a simple array. I *only* use them for computationally expensive operations (like sorting a grid of 5,000 student marks) OR when providing referential equality for props passed to deeply nested `React.memo` components to prevent massive sub-tree renders.

### Q4: Explain the Virtual DOM and Reconciliation.
- **Beginner Answer:** It's a copy of the real DOM. React updates the Virtual DOM first, sees what changed, and then updates the real DOM.
- **Mid-Level Answer:** Direct DOM manipulation is slow. React uses a Diffing algorithm to compare the new V-DOM tree with the old one. The `key` prop helps React identify which items in a list changed, were added, or were removed.
- **Senior-Level Answer:** Under the hood, Reconciliation is powered by React Fiber, which allows React to pause, abort, or prioritize rendering work. If a user is typing in a search box, React can prioritize the input render over a heavy table render. Using stable `keys` (like Database IDs, not array indexes) is mathematically critical for the Diffing algorithm; using indexes forces React to mutate the DOM rather than moving elements, which destroys local state and kills performance.

---

## CATEGORY 3: AUTHENTICATION & SECURITY

### Q5: How do you secure a Next.js application using JWT?
- **Beginner Answer:** Save the JWT in `localStorage` and send it in the header of Axios requests. Protect routes by checking if the token exists.
- **Mid-Level Answer:** `localStorage` is vulnerable to XSS. It's better to store the Access Token in memory and the Refresh Token in an HttpOnly cookie. We use Next.js Middleware to check cookies before letting a user see a page.
- **Senior-Level Answer:** In our ERP, we use an HttpOnly, Secure, SameSite=Strict cookie for the Refresh Token to prevent XSS and CSRF attacks. Next.js Middleware intercepts requests at the Edge, parses the JWT payload (without querying the DB), checks the role claims (e.g., `Role: Teacher`), and issues a rewrite or redirect. For API calls, Axios interceptors handle 401 Unauthorized responses by pausing all pending requests, silently acquiring a new Access Token using the HttpOnly cookie, and retrying the queued requests without interrupting the user's workflow.

---

## CATEGORY 4: ENTERPRISE ARCHITECTURE & SYSTEM DESIGN

### Q6: If an API call is taking 5 seconds to load the Exam Dashboard, how do you fix it?
- **Beginner Answer:** I would add a loading spinner so the user knows it's loading. I'd also check if the DB query is slow.
- **Mid-Level Answer:** I would look at the SQL Server execution plan and add indexes. On the frontend, I would use Pagination so we only load 10 records at a time instead of all of them.
- **Senior-Level Answer:** 5 seconds indicates an architectural bottleneck. 
    1. **DB Level:** Ensure covering indexes exist. Avoid N+1 query problems in Entity Framework Core.
    2. **API Level:** Implement Redis caching for master data (Subjects, Classes) so we don't query SQL Server. 
    3. **Frontend Level:** In Next.js, I would implement `React Suspense` with a Skeleton Loader. Instead of fetching all dashboard widgets in one giant API call, I would break them into parallel micro-requests (`Promise.all` or separate components) so the fast widgets load instantly, and only the heavy widget shows a spinner.

### Q7: Why did you choose Zustand/Redux over the Context API for state management?
- **Beginner Answer:** Context API is for small things, Redux is for big things.
- **Mid-Level Answer:** Context API causes performance issues because any state change re-renders all components consuming the context. Redux or Zustand fix this by using selectors.
- **Senior-Level Answer:** Context API is a Dependency Injection mechanism, not a State Manager. In an Exam Module where 500 marks are being entered rapidly, putting that state in Context would force the entire grid to re-render on every keystroke. We use Zustand because it allows atomic updates. Component A can subscribe to `state.marks[0]` and Component B to `state.marks[1]`. When `marks[0]` changes, ONLY Component A re-renders. We pair this with React Query for server-state caching, leaving Zustand strictly for client UI state.
