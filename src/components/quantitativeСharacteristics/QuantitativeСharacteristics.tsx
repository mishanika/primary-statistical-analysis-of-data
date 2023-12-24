import { Stats } from "../varTable/VarTable";
import "./QuantitativeСharacteristics.scss";
import { useState, useEffect } from "react";
import { exampleData } from "./exampleData";
import { calculateAnomaly, calculateQuantitativeStats, deleteAnomaly, normalDistribution } from "../../utils/utils";
import AnomalyPlot from "../anomalyPlot/AnomalyPlot";
import { Tables } from "../../App";

type QuantitativeСharacteristicsProps = {
  fileInfo: Stats[];
  setFileInfo: React.Dispatch<React.SetStateAction<Stats[]>>;
};

export type QuantitativeStats = {
  characteristic: string;
  estimation: number;
  deviations: number | null;
  interval: number[] | null;
};

const QuantitativeСharacteristics: React.FC<QuantitativeСharacteristicsProps> = ({ fileInfo, setFileInfo }) => {
  const [processedData, setProccessedData] = useState<QuantitativeStats[]>(exampleData);
  const [isAnomalySeen, setIsAnomalySeen] = useState<boolean>(false);
  const [isDistributionNormal, setIsDistributionNormal] = useState<boolean>(false);
  const [anomalyBoundaries, setAnomalyBoundaries] = useState<number[]>([]);

  const tableRender = ({ characteristic, estimation, deviations, interval }: QuantitativeStats, id: number) => (
    <div className="table-row">
      <div className="characteristic">{characteristic}</div>
      <div className="evaluation">{estimation}</div>
      <div className="deviations">{deviations ? deviations : "-"}</div>
      <div className="interval">{` [${interval && interval[0]}; ${interval && interval[1]}]`}</div>
    </div>
  );

  useEffect(() => {
    const data = calculateQuantitativeStats(processedData, fileInfo);

    if (data) {
      setProccessedData(data);
    }
  }, [fileInfo]);

  useEffect(() => {
    const anomaly = calculateAnomaly(processedData);
    const normalDist = normalDistribution(processedData, fileInfo.length);

    setAnomalyBoundaries(anomaly);
    setIsDistributionNormal(normalDist);
  }, [processedData]);

  return (
    <div className="quantitative-table-wrapper">
      <div className="quantitative-table">
        <div className="initial-row">
          <div className="characteristic">Характеристика </div>
          <div className="evaluation">Оцінка</div>
          <div className="deviations">Середньоквадратичне відхилення оцінки</div>
          <div className="interval">95% довірчий інтервалдля характеристики</div>
        </div>
        {processedData.map(tableRender)}
      </div>
      <div className="btns">
        <div className="show-anomaly" onClick={() => alert(isDistributionNormal)}>
          Показати розподіл
        </div>
        <div
          className="show-anomaly delete-anomaly"
          onClick={() => deleteAnomaly(fileInfo, anomalyBoundaries, setFileInfo)}
        >
          Delete anomalies
        </div>
      </div>
      <AnomalyPlot fileInfo={fileInfo} anomalyBoundaries={anomalyBoundaries} />
    </div>
  );
};

export default QuantitativeСharacteristics;
