# MediWatch - Patient Dashboard Frontend

A modern healthcare patient monitoring dashboard built with [Next.js](https://nextjs.org) and React. This application enables patients to:
- Authenticate securely using OTP-based login
- Submit daily health monitoring data through symptom questionnaires
- Track health trends and disease progression
- View health history and alerts from their healthcare providers
- Access their medical profile and healthcare information

---

## Project Structure

### 📁 Root Level Files

| File | Purpose |
|------|---------|
| `package.json` | Project dependencies and build scripts |
| `tsconfig.json` | TypeScript configuration |
| `next.config.ts` | Next.js framework configuration |
| `tailwind.config.js` | Tailwind CSS styling configuration |
| `postcss.config.mjs` | PostCSS plugin configuration for Tailwind |
| `eslint.config.mjs` | Code linting rules and standards |
| `middleware.ts` | Next.js middleware for request handling (authentication checks) |

### 📁 `src/` - Application Source Code

#### **`src/app/` - Next.js App Router Pages**

The application uses Next.js 16 with the App Router pattern for file-based routing.

| Path | Description |
|------|-------------|
| `src/app/layout.tsx` | Root layout wrapper for entire application (metadata, HTML structure) |
| `src/app/globals.css` | Global CSS styles applied across all pages |
| `src/app/(auth)/login/page.tsx` | **Login Page** - OTP-based authentication (phone → OTP → onboarding) |
| `src/app/(auth)/layout.tsx` | Layout for auth-related routes |
| `src/app/(dashboard)/page.tsx` | **Dashboard/Home Page** - Main overview with health status, trends, and recent submissions |
| `src/app/(dashboard)/monitoring/page.tsx` | **Monitoring Page** - Daily symptom questionnaire for health data collection |
| `src/app/(dashboard)/history/page.tsx` | **History Page** - View past submissions and health trend history |
| `src/app/(dashboard)/profile/page.tsx` | **Profile Page** - Patient information and healthcare provider details |
| `src/app/(dashboard)/layout.tsx` | Dashboard layout with sidebar navigation and auth protection |

#### **`src/components/` - React Components**

| Component | Purpose |
|-----------|---------|
| `AuthProvider.tsx` | Client-side authentication provider that checks for auth tokens in cookies and redirects to login if missing |
| `HealthcareOnboarding.tsx` | Multi-step onboarding form during first login (patient details, healthcare info) |
| `Sidebar.tsx` | Navigation sidebar for dashboard pages with collapsible menu |

#### **`src/components/monitoring/` - Monitoring Feature Components**

These components handle the daily health monitoring questionnaire flow:

| File | Purpose |
|------|---------|
| **`apihelper.ts`** | API calls for monitoring: `fetchSymptomQuestions()` and `submitAnswers()` |
| **`types.ts`** | TypeScript types for monitoring data: questions, answers, submission results, disease scores |
| **`constants.ts`** | Reusable constants (e.g., score thresholds, question types) |
| **`helpers.ts`** | Utility functions for label generation and data transformation |
| **`LoadingScreen.tsx`** | Loading state UI while fetching questions |
| **`ErrorScreen.tsx`** | Error state UI with error messages |
| **`ResultScreen.tsx`** | Success/result screen shown after submission with disease score and trend status |
| **`questionInputFormats/BooleanQuestion.tsx`** | Yes/No question component |
| **`questionInputFormats/RangeQuestion.tsx`** | Slider-based question component (0-100 scale) |

#### **`src/lib/` - Utility Functions & API Client**

| File | Purpose |
|------|---------|
| **`api.ts`** | Main API client with `apiFetch()` function that: handles authentication headers, manages token refresh, handles timeouts, redirects on auth errors |

---

## Data Flow Architecture

### 1️⃣ **Authentication Flow**

```
User → Login Page (Phone) → Send OTP → Verify OTP → Healthcare Onboarding → Set Token Cookie → Dashboard
```

- **Login Page** (`src/app/(auth)/login/page.tsx`):
  - User enters phone number
  - Backend sends OTP via SMS
  - User enters 6-digit OTP
  - On success, receives auth token and patient data
  - Redirected to onboarding if first-time login
  
- **Middleware** (`middleware.ts`):
  - Intercepts all requests
  - Checks for `token` cookie
  - Redirects unauthenticated users to `/login`
  - Redirects authenticated users away from login page to `/`

- **AuthProvider** (`AuthProvider.tsx`):
  - Client-side protection
  - Checks if token exists in cookies
  - Shows loading state while checking
  - Redirects to login if no token found

### 2️⃣ **Daily Monitoring Flow**

```
Dashboard → Monitoring Page → Load Questions → Answer Questions → Submit Answers → Disease Score → Results
```

**Step-by-Step:**

1. **Monitoring Page Load** (`src/app/(dashboard)/monitoring/page.tsx`):
   - Calls `fetchSymptomQuestions()` to get list of questions
   - Questions include disease-specific + override questions
   - Handles 409 error (already submitted today)

2. **Question Types**:
   - **Disease Questions** (`DiseaseQuestion`): Boolean (Yes/No) or Range (0-100) questions about symptoms
   - **Override Questions** (`OverrideQuestion`): Boolean questions that can override disease score calculations

3. **Answer Collection**:
   - Questions displayed one-by-one
   - User answers tracked in `answers` object
   - Form disabled until all questions answered
   - Auto-scroll support for accessibility

4. **Submission** (`apihelper.ts`):
   ```
   POST /api/v1/patient/submit
   Payload: { answers: { question_key: value } }
   Response: { disease_score, trend_status, override_triggered }
   ```

5. **Results Screen** (`ResultScreen.tsx`):
   - Shows disease score (0-100)
   - Shows trend status: 🟢 Green (Good), 🟡 Yellow (Warning), 🔴 Red (Critical)
   - Shows if override was triggered
   - Option to submit next day's update

### 3️⃣ **Dashboard/Home Page Flow**

```
API Call → Fetch Dashboard Data → Display Health Overview → Show Trends & Alerts
```

**Dashboard Data** (`src/app/(dashboard)/page.tsx`):
- Patient name, current day of monitoring
- Today's submission status
- Overall trend status
- Recent submissions (last 7-14 days)
- Active alerts from healthcare provider
- Doctor name and healthcare info

**Data Structure**:
```typescript
{
  name: string,
  currentDay: number,
  totalDays: number,
  todaySubmitted: boolean,
  lastSubmittedAt: string,
  trendStatus: "green" | "yellow" | "red",
  doctorName: string,
  recentSubmissions: [{
    day_number, status, submitted_at_ist, disease_score, trend_status
  }],
  alerts: [{ id, alert_type, alert_status, created_at_ist }]
}
```

### 4️⃣ **History Page Flow**

```
Load Historical Data → Display Timeline → Show Trends & Patterns
```

- Shows calendar of past submissions
- Color-coded status: ✓ Submitted, ✗ Missed
- Disease score history
- Trend progression over time

### 5️⃣ **API Layer Flow**

```
Component → apiFetch() → Add Auth Headers → Set Timeout → Fetch from Backend → Handle Response/Errors → Return Data
```

**apiFetch Function** (`src/lib/api.ts`):
- Base URL: `https://api.mediwatch.in`
- Request timeout: 15 seconds
- Automatically adds `Authorization: Bearer {token}` header
- On 401 error: clears auth and redirects to login
- On timeout: throws error to component
- Generic TypeScript support for type-safe responses

**Error Handling**:
- `ApiError` class with status code and response data
- Components catch errors and display to users
- 409 status = Already submitted today
- 401/403 = Authentication required

---

## Key Features

### 🔐 **Security**
- OTP-based authentication (no passwords)
- Secure token storage in HTTP-only cookies
- Middleware protection on all routes
- Automatic token validation and refresh

### 📱 **Responsive Design**
- Tailwind CSS for responsive layouts
- Mobile-first approach
- Collapsible sidebar for mobile devices
- Touch-friendly components

### 📊 **Health Monitoring**
- Daily symptom questionnaires
- Disease score calculation (0-100)
- Trend tracking (Green/Yellow/Red status)
- Alert system for healthcare providers
- Health history visualization

### ♿ **Accessibility**
- Auto-scroll to submission form
- Keyboard navigation support
- Semantic HTML structure
- Loading and error states

---

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn package manager

### Installation & Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open browser to http://localhost:3000
# Login with your phone number (OTP will be sent)
```

### Build for Production

```bash
# Build optimized production bundle
npm run build

# Start production server
npm start
```

### Code Quality

```bash
# Run ESLint to check code standards
npm run lint
```

---

## Technology Stack

| Technology | Purpose |
|------------|---------|
| **Next.js 16** | React framework with App Router, SSR, and API routes |
| **React 19** | UI component library |
| **TypeScript** | Type-safe JavaScript |
| **Tailwind CSS** | Utility-first CSS framework |
| **Lucide React** | Icon library |
| **Recharts** | Chart/graph visualization |
| **js-cookie** | Cookie management for auth tokens |
| **react-icons** | Additional icon support |

---

## Environment Variables

Create a `.env.local` file in the project root:

```env
# API Configuration (already set in api.ts)
NEXT_PUBLIC_API_URL=https://api.mediwatch.in
```

---

## Authentication Token

After successful OTP verification, the backend returns a JWT token that is stored as an HTTP-only cookie called `token`. This token is:
- Automatically sent with every API request via `apiFetch()`
- Validated by middleware on every request
- Cleared on logout or token expiration
- Used to identify the patient across all requests

---

## Common Tasks

### Add a New Page
1. Create file in `src/app/(dashboard)/` folder
2. Export default React component
3. Use `AuthProvider` wrapper if authentication required
4. Update navigation in `Sidebar.tsx`

### Add a New API Endpoint
1. Use `apiFetch()` from `src/lib/api.ts`
2. Define TypeScript interface for response
3. Handle errors appropriately in component

### Customize Styling
- Global styles: `src/app/globals.css`
- Tailwind config: `tailwind.config.js`
- Component-level styles: Tailwind classes directly in JSX

---

## Further Learning

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
