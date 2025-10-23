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

export const ActivityProvider = ({ children }) => {
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
      .reduce((total, log) => total + (log.value ?? 0), 0);

    const workoutCalories = logs
      .filter((log) => {
        return (
          log.type === "workout" &&
          new Date(log.date).getTime() >= todayStart.getTime()
        );
      })
      .reduce((total, log) => total + (log.value ?? 0), 0);

    const sleepEntries = logs
      .filter((log) => {
        return (
          log.type === "sleep" &&
          new Date(log.date).getTime() >= todayStart.getTime()
        );
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const sleepHours = sleepEntries.length > 0 ? sleepEntries[0].value ?? 0 : null;

    const mealsToday = nutritionLogs.filter((log) => {
      const timestamp = log.date ?? log.loggedAt;
      return new Date(timestamp).getTime() >= todayStart.getTime();
    }).length;

    return {
      hydrationToday: hydration,
      workoutCaloriesToday: workoutCalories,
      sleepHoursToday: sleepHours,
      mealCountToday: mealsToday,
    };
  }, [logs, nutritionLogs]);

  const addLog = useCallback((log: Log) => {
    setLogs((previous) =>
      [log, ...previous].sort((a, b) => {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      })
    );
  }, []);

  const addNutritionLog = useCallback((log: NutritionLog) => {
    setNutritionLogs((previous) =>
      [log, ...previous].sort((a, b) => {
        const end = b.date ?? b.loggedAt ?? 0;
        const start = a.date ?? a.loggedAt ?? 0;
        return new Date(end).getTime() - new Date(start).getTime();
      })
    );
  }, []);

  const value = useMemo(
    () => ({
      logs,
      nutritionLogs,
      hydrationToday: metrics.hydrationToday,
      workoutCaloriesToday: metrics.workoutCaloriesToday,
      sleepHoursToday: metrics.sleepHoursToday,
      mealCountToday: metrics.mealCountToday,
      isLoading,
      refreshLogs,
      refreshNutrition,
      refreshAll,
      addLog,
      addNutritionLog,
    }),
    [
      logs,
      nutritionLogs,
      metrics.hydrationToday,
      metrics.workoutCaloriesToday,
      metrics.sleepHoursToday,
      metrics.mealCountToday,
      isLoading,
      refreshLogs,
      refreshNutrition,
      refreshAll,
      addLog,
      addNutritionLog,
    ]
  );

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
