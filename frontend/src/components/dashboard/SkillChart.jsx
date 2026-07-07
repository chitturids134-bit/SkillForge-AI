import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

function SkillChart({ data }) {
  // Use accent colors for cells
  const colors = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#3b82f6'];

  return (
    <div className="panel-card glass-panel">
      <h3 className="panel-title">Skill Proficiency (%)</h3>
      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 10, right: 10, left: 10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" horizontal={false} vertical={true} />
            <XAxis 
              type="number" 
              domain={[0, 100]} 
              stroke="var(--text-secondary)" 
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              type="category" 
              dataKey="skill" 
              stroke="var(--text-secondary)" 
              fontSize={12}
              tickLine={false}
              axisLine={false}
              width={70}
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
            <Bar 
              dataKey="level" 
              radius={[0, 4, 4, 0]}
              barSize={14}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default SkillChart;
