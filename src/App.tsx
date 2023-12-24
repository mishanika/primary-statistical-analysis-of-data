import { useState } from "react";
import "./App.scss";
import Input from "./components/input/Input";
import VarTable, { Stats } from "./components/varTable/VarTable";
import VarClassesTable from "./components/varClassesTable/VarClassesTable";
import QuantitativeСharacteristics from "./components/quantitativeСharacteristics/QuantitativeСharacteristics";
import ProbabilityPaper from "./components/probabilityPaper/ProbabilityPaper";

export type Tables = {
  varTable: boolean;
  varClassesTable: boolean;
  quanСharacteristics: boolean;
  probabilityPaper: boolean;
};

const App = () => {
  const [fileInfo, setFileInfo] = useState<Stats[]>([]);
  const [activeTable, setActiveTable] = useState<Tables>({
    varTable: true,
    varClassesTable: false,
    quanСharacteristics: false,
    probabilityPaper: false,
  });

  const activateTable = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const target = e.target as Element;
    for (const key in activeTable) {
      if (key === target.className) {
        activeTable[key as keyof typeof activeTable] = true;
      } else {
        activeTable[key as keyof typeof activeTable] = false;
      }
    }
    setActiveTable((prev) => ({ ...prev }));
  };

  return (
    <div className="App">
      <Input setFileInfo={setFileInfo} />
      <div className="btn-wrapper" onClick={(e) => activateTable(e)}>
        <div className="varTable">Варіаційний ряд</div>
        <div className="varClassesTable">Варіаційний ряд поділений на класи</div>
        <div className="quanСharacteristics">Кількісні характеристики</div>
        <div className="probabilityPaper">Імовірнісний папір</div>
      </div>
      {activeTable.varTable && <VarTable fileInfo={fileInfo} />}
      {activeTable.varClassesTable && <VarClassesTable fileInfo={fileInfo} />}
      {activeTable.quanСharacteristics && <QuantitativeСharacteristics fileInfo={fileInfo} setFileInfo={setFileInfo} />}
      {activeTable.probabilityPaper && <ProbabilityPaper fileInfo={fileInfo} />}
    </div>
  );
};

export default App;
