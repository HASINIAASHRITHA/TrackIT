import React, { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Reports: React.FC = () => {
  useEffect(() => {
    document.title = "Reports | Expense Manager";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Analyze your expenses with insightful reports");
  }, []);

  return (
    <article>
      <header className="pb-6 border-b">
        <h1 className="text-2xl font-semibold tracking-tight">Reports</h1>
        <p className="text-sm text-muted-foreground mt-1">Detailed analytics to help you understand your spending.</p>
      </header>

      <section className="grid grid-cols-1 xl:grid-cols-2 gap-6 pt-6">
        <Card className="card-hover">
          <CardHeader>
            <CardTitle>Monthly Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-56 rounded-md bg-muted/40" />
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardHeader>
            <CardTitle>Category Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-56 rounded-md bg-muted/40" />
          </CardContent>
        </Card>
      </section>
    </article>
  );
};

export default Reports;
