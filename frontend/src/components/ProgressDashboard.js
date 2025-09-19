// frontend/src/components/ProgressDashboard.js
import React, { useEffect, useState, useMemo } from "react";
import { getHistory } from "../api";
import {
  PieChart, Pie, Cell, Tooltip, Legend,
  LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer
} from "recharts";

const COLORS = ["#10B981", "#EF4444"]; // Green-500, Red-500

const processChartData = (history) => {
  // --- Data for Pie Chart ---
  const correctCount = history.filter((h) => h.correct).length;
  const wrongCount = history.length - correctCount;
  const pieData = [
    { name: "Correct", value: correctCount },
    { name: "Wrong", value: wrongCount },
  ];

  // --- Data for Timeline (accuracy per day) ---
  const groupedByDate = history.reduce((acc, item) => {
    // Use a consistent, sortable date format (YYYY-MM-DD)
    const date = new Date(item.reviewed_at).toISOString().split('T')[0];
    if (!acc[date]) {
      acc[date] = { total: 0, correct: 0 };
    }
    acc[date].total++;
    if (item.correct) {
      acc[date].correct++;
    }
    return acc;
  }, {});

  const lineData = Object.keys(groupedByDate)
    .map(date => ({
      date,
      accuracy: (groupedByDate[date].correct / groupedByDate[date].total) * 100,
    }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));
    
  return { pieData, lineData };
};

export default function ProgressDashboard({ user }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchHistory() {
      try {
        setLoading(true);
        const data = await getHistory(user.id);
        setHistory(data);
        setError(null);
      } catch (err) {
        setError("Failed to load study history. Please try again later.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    if (user?.id) {
      fetchHistory();
    }
  }, [user]);

  const { pieData, lineData } = useMemo(() => processChartData(history), [history]);

  if (loading) {
    return <p className="text-gray-600 text-center mt-6">Loading progress...</p>;
  }

  if (error) {
    return <p className="text-red-600 text-center mt-6">{error}</p>;
  }

  if (!history || history.length === 0) {
    return <p className="text-gray-600 text-center mt-6">No study history yet. Complete a review to see your progress!</p>;
  }

  return (
    <div className="max-w-4xl mx-auto mt-6 p-6 bg-white rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">📊 Study Progress</h2>
      
      <div className="grid md:grid-cols-2 gap-8 items-center">
        <div className="flex flex-col items-center">
          <h3 className="text-lg font-semibold mb-2">Overall Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="flex flex-col items-center">
          <h3 className="text-lg font-semibold mb-2">Daily Accuracy (%)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={lineData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="accuracy" stroke="#8884d8" activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}