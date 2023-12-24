import "./ProbabilityPaper.scss";
import { useEffect, useState } from "react";
import { Line, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, ReferenceLine } from "recharts";
import { Stats } from "../varTable/VarTable";
import { calculatePaper } from "../../utils/utils";

type ProbabilityPaperProps = {
  fileInfo: Stats[];
};

export type ProbabilityPaperStats = {
  item: number;
  quantile: number;
};

const ProbabilityPaper: React.FC<ProbabilityPaperProps> = ({ fileInfo }) => {
  const [processedInfo, setProcessedInfo] = useState<ProbabilityPaperStats[]>([]);

  useEffect(() => {
    const processed = calculatePaper(fileInfo);

    setProcessedInfo(processed);
  }, [fileInfo]);

  return (
    <div className="probability-paper-plot-wrapper">
      <LineChart width={600} height={400} data={processedInfo}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="item" />
        <YAxis dataKey="quantile" />
        <Tooltip />

        <Line type="monotone" dataKey="quantile" stroke="#8884d8" />
      </LineChart>
    </div>
  );
};

export default ProbabilityPaper;
