import "./AnomalyPlot.scss";
import { useEffect, useState } from "react";
import { Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, ReferenceLine } from "recharts";
import { Stats } from "../varTable/VarTable";
import { QuantitativeStats } from "../quantitativeСharacteristics/QuantitativeСharacteristics";
import { calculateAnomaly } from "../../utils/utils";

type AnomalyPlotProps = {
  fileInfo: Stats[];
  anomalyBoundaries: number[];
};

export type AnomalyStats = {
  id: number;
  value: number;
};

const AnomalyPlot: React.FC<AnomalyPlotProps> = ({ fileInfo, anomalyBoundaries }) => {
  const [processedInfo, setProcessedInfo] = useState<AnomalyStats[]>([]);

  useEffect(() => {
    const processed = fileInfo.map((item, id) => ({
      id: id,
      value: item.item,
    }));

    setProcessedInfo(processed);
  }, [fileInfo]);

  return (
    <div className="anomaly-plot-wrapper">
      <LineChart
        width={600}
        height={400}
        data={[...processedInfo, { parallel: anomalyBoundaries[0] }, { parallel: anomalyBoundaries[1] }]}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="id" type="number" />
        <YAxis />
        <Tooltip />
        <Line type="basis" dataKey="value" stroke="#8884d8" />
        {anomalyBoundaries.map((value) => (
          <ReferenceLine y={value} label={value} stroke="red" strokeDasharray="3 3" />
        ))}
      </LineChart>
    </div>
  );
};

export default AnomalyPlot;
