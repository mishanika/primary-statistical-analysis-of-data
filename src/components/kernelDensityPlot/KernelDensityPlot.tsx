import "./KernelDensityPlot.scss";
import { useState, useEffect, useRef } from "react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  ReferenceLine,
  ComposedChart,
  Line,
} from "recharts";
import { calculateKDE, calculateQuadDeviasion, scottBandwidth } from "../../utils/utils";
import { Stats } from "../varTable/VarTable";
import { VarClassesStats } from "../varClassesTable/VarClassesTable";
import { HistogramStats } from "../histogram/Histogram";

type KDEProps = {
  fileInfo: Stats[];
  histogramStats: VarClassesStats[];
};

export type KDEStats = {
  classBoundaries: number;
  relativeFrequency: number;
  itemFrequency: number;
};

const KernelDensityPlot: React.FC<KDEProps> = ({ fileInfo, histogramStats }) => {
  const densityRef = useRef<HTMLDivElement>(null);
  const [bandwidth, setBandwidth] = useState(0.3);

  const [kde, setKde] = useState<KDEStats[]>([]);
  const [processedInfo, setProcessedInfo] = useState<HistogramStats[]>([]);

  useEffect(() => {
    const quad = calculateQuadDeviasion(fileInfo);
    const processed = scottBandwidth(fileInfo, quad);
    const processedHhistogramStats = histogramStats.map((item) => ({
      relativeFrequency: item.relativeFrequency,
      classBoundaries: item.classBoundaries[1],
    }));
    setProcessedInfo(processedHhistogramStats);
    setBandwidth(processed);
  }, [fileInfo, histogramStats]);

  useEffect(() => {
    const processedHhistogramStats = histogramStats.map((item) => ({
      relativeFrequency: item.relativeFrequency,
      classBoundaries: item.classBoundaries[1],
    }));

    const processed = calculateKDE(fileInfo, processedHhistogramStats, bandwidth);
    const accumulatedData = [];

    for (let i = 0; i < processedInfo.length; i++) {
      let element = processedInfo.find((it) => it.classBoundaries === processed[i].classBoundaries);
      accumulatedData.push({ ...element, ...processed[i] });
    }

    setKde(accumulatedData as KDEStats[]);
  }, [processedInfo, bandwidth]);

  return (
    <div className="density-wrapper" ref={densityRef}>
      <ComposedChart width={600} height={300} data={[...kde]}>
        <CartesianGrid fill="#fff" />
        <XAxis dataKey="classBoundaries" stroke="#000" />
        <YAxis dataKey="relativeFrequency" stroke="#000" />
        <Tooltip />
        <Legend />
        <Bar dataKey="relativeFrequency" fill="#8884d8" />

        <Line type="monotone" dataKey="relativeFrequency" stroke="#ff7300" />
        {/* {[...kde].map((point, index) => (
          <ReferenceLine key={index} x={point.x} stroke="red" strokeDasharray="3 3" />
        ))} */}
      </ComposedChart>
    </div>
  );
};

export default KernelDensityPlot;
