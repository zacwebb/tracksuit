import { useEffect, useState } from "react";
import { Header } from "../components/header/header.tsx";
import { Insights } from "../components/insights/insights.tsx";
import styles from "./app.module.css";
import type { Insight } from "../schemas/insight.ts";

// createdAt comes from the API as a string, and we convert to a JS Date in fetchInsights()
type InsightApiResponse = Omit<Insight, 'createdAt'> & {
  createdAt: string;
};

export const App = () => {
  const [insights, setInsights] = useState<Insight[]>([]);

  const fetchInsights = async () => {
    try {
      const res = await fetch(`/api/insights`);
      const data = await res.json();
      const insightsWithDates = data.map((insight: InsightApiResponse) => ({
        ...insight,
        createdAt: new Date(insight.createdAt),
      }));
      setInsights(insightsWithDates);
    } catch (error) {
      console.error("Failed to fetch insights:", error);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  return (
    <main className={styles.main}>
      <Header onInsightAdded={fetchInsights} />
      <Insights
        className={styles.insights}
        insights={insights}
        onInsightDeleted={fetchInsights}
      />
    </main>
  );
};
