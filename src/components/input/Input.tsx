import { useRef } from "react";
import "./Input.scss";
import { Stats } from "../varTable/VarTable";
import { countStats } from "../../utils/utils";

type InputProps = {
  setFileInfo: React.Dispatch<React.SetStateAction<Stats[]>>;
};

const Input: React.FC<InputProps> = ({ setFileInfo }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const readFile = () => {
    let reader = new FileReader();
    if (inputRef.current?.files) {
      reader.readAsText(inputRef.current.files[0]);
      let data;
      reader.onload = function () {
        //console.log(reader.result);
        // console.log(typeof reader.result);

        if (typeof reader.result === "string") {
          data = reader.result.split("\r\n");

          data = data.map((i) => ({
            item: parseFloat(i),
            frequency: 1,
            relativeFrequency: 0,
            empValue: 0,
          })) as Stats[];

          data = countStats(data);
          //console.log(data);
          setFileInfo([...data]);
        }
      };
    }
  };

  return (
    <div className="input-wrapper">
      Choose file or drag'n'drop it here
      <input type="file" className="" onChange={() => readFile()} ref={inputRef} />
    </div>
  );
};

export default Input;
