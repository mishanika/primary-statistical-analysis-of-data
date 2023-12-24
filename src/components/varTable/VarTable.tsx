import EmpiricalDistributionPlot from "../empiricalDistributionPlot/EmpiricalDistributionPlot";
import "./VarTable.scss";

type VarClassesTableProps = {
  fileInfo: Stats[];
};

export type Stats = {
  item: number;
  frequency: number;
  relativeFrequency: number;
  empValue: number;
};

const VarTable: React.FC<VarClassesTableProps> = ({ fileInfo }) => {
  const tableRender = ({ item, frequency, relativeFrequency, empValue }: Stats, id: number) => (
    <div className="table-row">
      <div className="id">{id + 1}</div>
      <div className="value">{item}</div>
      <div className="frequency">{frequency}</div>
      <div className="relative-frequency">{relativeFrequency}</div>
      <div className="emp-value">{empValue}</div>
    </div>
  );

  return (
    <div className="var-table-wrapper">
      <div className="var-table">
        <div className="initial-row">
          <div className="id">№ варіанти</div>
          <div className="value">Значення варіанти</div>
          <div className="frequency">Частота</div>
          <div className="relative-frequency">Відносна частота</div>
          <div className="emp-value">Значення емпіричної функції розподілу</div>
        </div>
        {fileInfo.map(tableRender)}
      </div>

      <EmpiricalDistributionPlot fileInfo={fileInfo} />
    </div>
  );
};

export default VarTable;
