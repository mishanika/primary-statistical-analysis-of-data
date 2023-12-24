import "./Histogram.scss";
import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { VarClassesStats } from "../varClassesTable/VarClassesTable";

type HistogramProps = {
  fileInfo: VarClassesStats[];
};

export type HistogramStats = {
  classBoundaries: number;

  relativeFrequency: number;
};

const Histogram: React.FC<HistogramProps> = ({ fileInfo }) => {
  const [processedInfo, setProcessedInfo] = useState<HistogramStats[]>([]);

  useEffect(() => {
    const processed = fileInfo.map((item) => ({
      relativeFrequency: item.relativeFrequency,
      classBoundaries: item.classBoundaries[1],
    }));
    setProcessedInfo(processed);
  }, [fileInfo]);

  return (
    <div className="histogram-wrapper">
      <BarChart width={600} height={300} data={processedInfo}>
        <CartesianGrid />
        <XAxis dataKey="classBoundaries" />
        <YAxis dataKey="relativeFrequency" />
        <Tooltip />
        <Legend />
        <Bar dataKey="relativeFrequency" fill="#8884d8" />
      </BarChart>
    </div>
  );
};

export default Histogram;
