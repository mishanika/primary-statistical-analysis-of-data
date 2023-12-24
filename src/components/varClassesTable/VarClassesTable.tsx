import { useEffect, useState } from "react";
import "./VarClassesTable.scss";
import { Stats } from "../varTable/VarTable";
import { createFrequencyClasses } from "../../utils/utils";
import Histogram from "../histogram/Histogram";
import KernelDensityPlot from "../kernelDensityPlot/KernelDensityPlot";

type VarClassesTableProps = {
  fileInfo: Stats[];
};

export type VarClassesStats = {
  classBoundaries: number[];
  frequency: number;
  relativeFrequency: number;
  empValue: number;
};

const VarClassesTable: React.FC<VarClassesTableProps> = ({ fileInfo }) => {
  const [processedInfo, setProcessedInfo] = useState<VarClassesStats[]>([]);
  const [classesAmount, setClassesAmount] = useState<number>(5);
  // const [isHistogramSeen, setIsHistogramSeen] = useState<boolean>(false);
  // const [isKDESeen, setIsKDESeen] = useState<boolean>(false);

  const tableRender = ({ classBoundaries, frequency, relativeFrequency, empValue }: VarClassesStats, id: number) => (
    <div className="table-row">
      <div className="id">{id + 1}</div>
      <div className="value">{`${!id ? "[" : "("}${classBoundaries[0]}; ${classBoundaries[1]}]`}</div>
      <div className="frequency">{frequency}</div>
      <div className="relative-frequency">{relativeFrequency}</div>
      <div className="emp-value">{empValue}</div>
    </div>
  );

  useEffect(() => {
    const info = createFrequencyClasses(fileInfo, classesAmount);
    setProcessedInfo(info);
  }, [classesAmount, fileInfo]);

  return (
    <>
      <input
        type="text"
        className="numClasses"
        placeholder="Введіть кількість класів"
        onChange={(e) => setClassesAmount(parseInt(e.target.value))}
      />
      <div className="var-classes-table-wrapper">
        <div className="var-table var-classes-table">
          <div className="initial-row">
            <div className="id">№ варіанти</div>
            <div className="value">Значення варіанти</div>
            <div className="frequency">Частота</div>
            <div className="relative-frequency">Відносна частота</div>
            <div className="emp-value">Значення емпіричної функції розподілу</div>
          </div>
          {processedInfo.map(tableRender)}
        </div>
        {/* <div
          className="show-histogram"
          onClick={() => {
            setIsKDESeen(false);
            setIsHistogramSeen((prev) => !prev);
          }}
        >
          {!isHistogramSeen ? "Show Histogram" : "Close Histogram"}
        </div>
        <div
          className="show-histogram"
          onClick={() => {
            setIsKDESeen((prev) => !prev);
            setIsHistogramSeen(false);
          }}
        >
          {!isKDESeen ? "Show KDE" : "Close KDE"}
        </div> */}
        <div className="plots-wrapper">
          <Histogram fileInfo={processedInfo} />
          <KernelDensityPlot fileInfo={fileInfo} histogramStats={processedInfo} />
        </div>
      </div>
    </>
  );
};

export default VarClassesTable;
