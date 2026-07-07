import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function WeeklyChart({ data }) {
  return (
    <div className="panel-card glass-panel">
      <h3 className="panel-title">Weekly Progress (Study Hours)</h3>
      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--accent-primary)" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="var(--accent-primary)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
            <XAxis 
              dataKey="day" 
              stroke="var(--text-secondary)" 
              fontSize={12}
              tickLine={false}
            />
            <YAxis 
              stroke="var(--text-secondary)" 
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--bg-secondary)',
                borderColor: 'var(--border-color)',
                borderRadius: '8px',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-sans)',
              }}
            />
            <Area 
              type="monotone" 
              dataKey="hours" 
              stroke="var(--accent-primary)" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorHours)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default WeeklyChart;
