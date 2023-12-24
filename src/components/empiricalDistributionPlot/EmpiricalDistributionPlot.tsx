import "./EmpiricalDistributionPlot.scss";
import { useState, useEffect } from "react";
import { Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart } from "recharts";
import { Stats } from "../varTable/VarTable";

type EmpiricalDistributionPlotProps = {
  fileInfo: Stats[];
};

const EmpiricalDistributionPlot: React.FC<EmpiricalDistributionPlotProps> = ({ fileInfo }) => {
  return (
    <div className="empirical-distribution-plot-wrapper">
      <LineChart width={600} height={400} data={fileInfo}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="item" type="number" />
        <YAxis />
        <Tooltip />
        <Line type="step" dataKey="empValue" stroke="#8884d8" />
      </LineChart>
    </div>
  );
};

export default EmpiricalDistributionPlot;
