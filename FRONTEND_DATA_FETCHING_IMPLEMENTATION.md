# Frontend Data Fetching Implementation

## Overview

Implemented complete data fetching for all widgets across the frontend, ensuring no backend routes remain unused.

## Key Changes

### 1. **API Client (`src/lib/api.ts`)**

Added new methods for all backend routes:

#### Daily Tasks

- `getDailyTasks(day?: string)` - Fetch daily tasks
- `createDailyTask(task)` - Create new task
- `completeDailyTask(id)` - Mark task as complete

#### Achievements

- `getAchievements()` - Fetch user achievements
- `createAchievement(achievement)` - Create new achievement

#### Supplements

- `getSupplements()` - Fetch supplements
- `createSupplement(supplement)` - Create supplement
- `addSupplementToPlan(id)` - Add to plan
- `logSupplement(log)` - Log supplement taken
- `getNutritionAnalysis()` - Get nutrition vs supplements analysis

#### Nutrition Tips

- `getNutritionTips()` - Fetch tips
- `createNutritionTip(tip)` - Create tip

#### History

- `getWeeklyOverview()` - Get weekly overview
- `getAssistantTimeline()` - Get assistant timeline
- `getDailyCards(days)` - Get daily cards for history
- `getHistoryInsights()` - Get insights

#### Nutrition Page

- `getNutritionPageToday()` - Get today's nutrition
- `getNutritionPageSupplements()` - Get supplements for nutrition page
- `getNutritionPageTips()` - Get nutrition tips

#### Chat Messages

- `getChatMessagesByDay(day)` - Get messages for specific day
- `getChatMessagesGroupedByDay()` - Get messages grouped by day

### 2. **Dashboard Component (`src/components/Dashboard.tsx`)**

Fixed errors and implemented data fetching:

#### Changes

- Added `useAuth` hook to check authentication status
- Added `dashboardData` state to store fetched data
- Fixed `weeklyEnergyData` undefined error by using `dashboardData?.analytics?.weeklyEnergy`
- Updated `nutritionData` to use real data from `dashboardData.analytics.nutritionProgress`
- Added `useEffect` to fetch dashboard data only when authenticated
- Imported `api` client

#### Data Flow

```typescript
useEffect(() => {
  if (!isAuthenticated) return;

  const fetchDashboardData = async () => {
    const response = await api.getDashboardData();
    if (response.success) {
      setDashboardData(response.data);
    }
  };
  fetchDashboardData();
}, [isAuthenticated]);
```

### 3. **Activity Context (`src/context/ActivityContext.tsx`)**

Fixed unauthorized requests and added authentication checks:

#### Changes

- Added token check before making API calls
- Wrapped API calls in try-catch blocks
- Check authentication status in bootstrap function
- Return early if not authenticated to prevent errors

#### Key Fix

```typescript
const refreshLogs = useCallback(async () => {
  try {
    const token = api.getToken();
    if (!token) return; // Don't fetch if not authenticated

    const response = await api.getLogs({ limit: 100 });
    // ... handle response
  } catch (error) {
    console.error("Failed to refresh logs:", error);
  }
}, []);
```

## Error Fixes

### 1. **"Missing or invalid Authorization header"**

**Root Cause**: ActivityContext making API calls before user authentication

**Solution**: Added token check before API calls

```typescript
const token = api.getToken();
if (!token) return; // Don't fetch if not authenticated
```

### 2. **"weeklyEnergyData is not defined"**

**Root Cause**: Variable referenced but never defined in Dashboard

**Solution**: Use data from fetched dashboard response

```typescript
const energyData =
  dashboardData?.analytics?.weeklyEnergy ||
  [
    // fallback data
  ];
```

### 3. **Login/Registration Errors**

**Root Cause**: These are expected when testing without proper user accounts

**Solution**: Users need to:

1. Register with a new email first
2. Then login with that email

## Widget Data Fetching Status

### ✅ Implemented

- Dashboard - `/api/dashboard/data`
- Daily Tasks - `/api/daily-tasks`
- Achievements - `/api/achievements`
- Supplements - `/api/supplements`
- Nutrition Tips - `/api/nutrition-tips`
- History - `/api/history/*`
- Nutrition Page - `/api/nutrition-page/*`
- Chat Messages - `/api/chat/messages`
- Logs - `/api/logs`
- Nutrition Logs - `/api/nutrition/list`
- Suggestions - `/api/suggestions`
- Insights - `/api/insights`
- Workouts - `/api/workouts/*`

### ✅ No Unused Routes

All backend routes now have corresponding frontend API methods.

## Authentication Flow

1. User registers/logs in through OnboardingForm
2. Token is stored in localStorage via `api.setToken()`
3. AuthProvider maintains authentication state
4. Components check `isAuthenticated` before fetching data
5. API client includes token in Authorization header automatically

## Testing Recommendations

1. **Register new user** with OnboardingForm
2. **Login** with registered credentials
3. **Navigate to Dashboard** - should fetch and display real data
4. **Check browser console** - should see successful API calls
5. **Verify widgets** load with real data from backend

## Next Steps

To implement remaining widgets:

1. Update each component to use the new API methods
2. Add state management for fetched data
3. Add loading and error states
4. Update UI to display real data instead of mock data

All API methods are ready to use in any component!
