// @ts-nocheck
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { api } from "../lib/api";

const ActivityContext = createContext(null);

const startOfToday = () => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  return start;
};

type ActivityProviderProps = { children?: any };

export const ActivityProvider = ({ children }: ActivityProviderProps) => {
  const [logs, setLogs] = useState([]);
  const [nutritionLogs, setNutritionLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshLogs = useCallback(async () => {
    const response = await api.getLogs({ limit: 100 });
    if (response?.success && Array.isArray(response.data)) {
      setLogs(
        response.data.slice().sort((a, b) => {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        })
      );
    }
  }, []);

  const refreshNutrition = useCallback(async () => {
    const response = await api.getNutritionLogs();
    if (response?.success && Array.isArray(response.data)) {
      setNutritionLogs(
        response.data.slice().sort((a, b) => {
          const end = b.date ?? b.loggedAt ?? 0;
          const start = a.date ?? a.loggedAt ?? 0;
          return new Date(end).getTime() - new Date(start).getTime();
        })
      );
    }
  }, []);

  const refreshAll = useCallback(async () => {
    await Promise.all([refreshLogs(), refreshNutrition()]);
  }, [refreshLogs, refreshNutrition]);

  useEffect(() => {
    let cancelled = false;

    const bootstrap = async () => {
      setIsLoading(true);
      try {
        await refreshAll();
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void bootstrap();

    return () => {
      cancelled = true;
    };
  }, [refreshAll]);

  const metrics = useMemo(() => {
    const todayStart = startOfToday();

    const hydration = logs
      .filter((log) => {
        return (
          log.type === "hydration" &&
          new Date(log.date).getTime() >= todayStart.getTime()
        );
      })
      .reduce((sum, log) => sum + (Number(log.value) || 0), 0);

    const workoutsToday = logs
      .filter((log) => {
        return (
          log.type === "workout" &&
          new Date(log.date).getTime() >= todayStart.getTime()
        );
      }).length;

    const sleepToday = logs
      .filter((log) => {
        return (
          log.type === "sleep" &&
          new Date(log.date).getTime() >= todayStart.getTime()
        );
      })
      .reduce((sum, log) => sum + (Number(log.value) || 0), 0);

    const mealsToday = nutritionLogs
      .filter((meal) => {
        const when = meal.date ?? meal.loggedAt ?? 0;
        return new Date(when).getTime() >= todayStart.getTime();
      }).length;

    return {
      hydrationToday: `${hydration.toFixed(1)}L`,
      workoutCaloriesToday: logs
        .filter((log) => log.type === "workout")
        .reduce((sum, log) => sum + (Number(log.value) || 0), 0),
      sleepHoursToday: sleepToday || null,
      mealCountToday: mealsToday,
    };
  }, [logs, nutritionLogs]);

  const value = useMemo(() => {
    return {
      logs,
      nutritionLogs,
      refreshAll,
      hydrationToday: metrics.hydrationToday,
      workoutCaloriesToday: metrics.workoutCaloriesToday,
      sleepHoursToday: metrics.sleepHoursToday,
      mealCountToday: metrics.mealCountToday,
    };
  }, [logs, nutritionLogs, metrics, refreshAll]);

  return (
    <ActivityContext.Provider value={value}>
      {children}
    </ActivityContext.Provider>
  );
};

export const useActivityData = () => {
  const context = useContext(ActivityContext);

  if (!context) {
    throw new Error("useActivityData must be used within an ActivityProvider");
  }

  return context;
};
