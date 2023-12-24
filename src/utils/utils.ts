import { Tables } from "../App";
import { HistogramStats } from "../components/histogram/Histogram";
import { QuantitativeStats } from "../components/quantitativeСharacteristics/QuantitativeСharacteristics";
import { VarClassesStats } from "../components/varClassesTable/VarClassesTable";
import { Stats } from "./../components/varTable/VarTable";

export const countStats = (data: Stats[]): Stats[] => {
  let innerData = [...data];
  innerData = frequencyCounter(innerData);
  innerData = relFrequencyCounter(innerData, data.length);
  empValueCounter(innerData);

  return innerData;
};

export const frequencyCounter = (data: Stats[]): Stats[] => {
  const innerData = [...data];
  const reducedItems = new Set(data.map(({ item }: Stats) => item));
  let isFrequencyCountNeed = reducedItems.size === data.length ? false : true;

  if (isFrequencyCountNeed) {
    const sorted = innerData.sort(compare);
    let current = sorted[0];
    for (let i = 1; i < innerData.length; i++) {
      if (current.item === sorted[i].item) {
        current.frequency += 1;
        sorted.splice(i, 1);
        i--;
        continue;
      }
      current = sorted[i];
    }
    return sorted;
  }
  return data;
};

export const relFrequencyCounter = (data: Stats[], amount: number): Stats[] => {
  return data.map((item) => ({
    ...item,
    relativeFrequency: parseFloat((item.frequency / amount).toPrecision(4)),
  }));
};

export const empValueCounter = (data: Stats[]) => {
  // const a = (acc: number, i:number) => acc.push();
  // const accumulator = (arr:[])=>arr.reduce()
  data.sort(compare).reduce((acc, currentValue, currentIndex, array) => {
    // Вычисляем новое значение для empValue
    if (currentIndex === 1) {
      acc.empValue = acc.relativeFrequency;
    }
    const newEmpValue = acc.empValue + currentValue.relativeFrequency;
    //console.log(currentIndex, acc.empValue, currentValue.relativeFrequency);
    // Мутируем текущий объект
    currentValue.empValue = newEmpValue;

    // Возвращаем новый аккумулятор для следующей итерации
    return { ...currentValue, empValue: parseFloat(newEmpValue.toPrecision(4)) };
  });
};

const compare = (a: Stats, b: Stats) => {
  if (a.item < b.item) return -1;
  if (a.item > b.item) return 1;
  return 0;
};

export const createFrequencyClasses = (data: Stats[], numClasses: number): VarClassesStats[] => {
  const values = data.map((item) => item.item);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);

  const classWidth = (maxValue - minValue) / numClasses;

  const sortedData = data.sort(compare);
  const processedData: VarClassesStats[] = [];

  for (let i = 0; i < numClasses; i++) {
    let frequencyCounter = 0;
    let empCounter = 0;
    const lowerBound = minValue + i * classWidth;
    const upperBound = minValue + (i + 1) * classWidth;

    sortedData.forEach((item, id) => {
      if (item.item > upperBound) {
        return;
      }
      if (!i && !id) {
        frequencyCounter += item.frequency;
        empCounter = item.empValue;
        return;
      }
      if (item.item > lowerBound && item.item <= upperBound) {
        frequencyCounter += item.frequency;
        //empCounter += item.empValue;
        empCounter = item.empValue;
      }
    });

    processedData.push({
      classBoundaries: [parseFloat(lowerBound.toPrecision(3)), parseFloat(upperBound.toPrecision(3))],
      frequency: frequencyCounter,
      relativeFrequency: parseFloat((frequencyCounter / data.length).toPrecision(3)),
      empValue: parseFloat(empCounter.toPrecision(3)),
    });
  }

  return processedData;
};

export const calculateQuantile = (p: number) => {
  const C0 = 2.515517;
  const C1 = 0.802853;
  const C2 = 0.010328;
  const D1 = 1.432788;
  const D2 = 0.1892659;
  const D3 = 0.001308;
  let t, quantile;

  if (p < 0 || p > 1) {
    console.log(p);

    throw new Error("Probability argument must be between 0 and 1");
  }

  if (p > 0.5) {
    t = Math.sqrt(-2 * Math.log(1 - p));
    quantile = t - (C0 + C1 * t + C2 * t ** 2) / (1 + D1 * t + D2 * t ** 2 + D3 * t ** 3);
  } else {
    t = Math.sqrt(-2 * Math.log(p));
    quantile = -(t - (C0 + C1 * t + C2 * t ** 2) / (1 + D1 * t + D2 * t ** 2 + D3 * t ** 3));
  }

  return quantile;
};

export const calculateQuantitativeStats = (data: QuantitativeStats[], stats: Stats[]) => {
  //варіаційний ряд кидати сюди
  if (!stats.length) {
    return;
  }
  const temp = [...data];
  for (let i = 0; i < temp.length; i++) {
    if (temp[i].characteristic === "Середнє арифметичне") {
      const statsLength = stats.reduce((acc, val) => acc + val.frequency, 0);
      temp[i].estimation = parseFloat(
        (stats.reduce((acc, val) => acc + val.item * val.frequency, 0) / statsLength).toPrecision(3)
      );
      //data[i].deviations ;
      const { quadDeviasion, boundaries } = calculateAvgConfidenceInterval(0.95, stats);
      temp[i].deviations = parseFloat(quadDeviasion.toPrecision(3));
      temp[i].interval = boundaries;
    } else if (temp[i].characteristic === "Медіана") {
      const tempData = [...stats];
      for (let y = 0; y < tempData.length; y++) {
        if (tempData[y].frequency > 1) {
          const dataToPush = [];

          for (let z = 0; z < tempData[y].frequency - 1; z++) {
            dataToPush.push({ ...tempData[y], frequency: 1 });
          }
          tempData.splice(y, 1, ...dataToPush);
        }
      }

      console.log(tempData.length % 2);
      temp[i].estimation =
        tempData.length % 2
          ? tempData[(tempData.length + 1) / 2].item
          : 0.5 * (tempData[tempData.length / 2].item + tempData[tempData.length / 2 + 1].item);

      temp[i].interval = calculateMedianConfidenceInterval(tempData);
    } else if (temp[i].characteristic === "Середньоквадратичне відхилення") {
      const statsLength = stats.reduce((acc, val) => acc + val.frequency, 0);
      const avg = stats.reduce((acc, val) => acc + val.item * val.frequency, 0) / statsLength;

      temp[i].estimation = parseFloat(
        Math.sqrt(
          (1 / statsLength) * stats.reduce((acc, val) => acc + (val.item - avg) ** 2 * val.frequency, 0)
        ).toPrecision(3)
      );
      temp[i].deviations = parseFloat((temp[i].estimation / Math.sqrt(2 * statsLength)).toPrecision(3));
      temp[i].interval = calculateConfidenceInterval(temp[i], statsLength);
    } else if (temp[i].characteristic === "Коефіцієнт асиметрії") {
      const statsLength = stats.reduce((acc, val) => acc + val.frequency, 0);
      const avg = stats.reduce((acc, val) => acc + val.item * val.frequency, 0) / statsLength;
      const dispers = Math.sqrt(
        (1 / statsLength) * stats.reduce((acc, val) => acc + (val.item - avg) ** 2 * val.frequency, 0)
      );

      temp[i].estimation = parseFloat(
        (
          (1 / (statsLength * dispers ** 3)) *
          stats.reduce((acc, val) => acc + (val.item - avg) ** 3 * val.frequency, 0)
        ).toPrecision(3)
      );
      temp[i].deviations = parseFloat(
        Math.sqrt(
          (6 * statsLength * (statsLength - 1)) / ((statsLength - 2) * (statsLength + 1) * (statsLength + 3))
        ).toPrecision(3)
      );
      temp[i].interval = calculateConfidenceInterval(temp[i], statsLength);
    } else if (temp[i].characteristic === "Коефіцієнт ексцесу") {
      const statsLength = stats.reduce((acc, val) => acc + val.frequency, 0);
      const avg = stats.reduce((acc, val) => acc + val.item * val.frequency, 0) / statsLength;
      const dispers = Math.sqrt(
        (1 / statsLength) * stats.reduce((acc, val) => acc + (val.item - avg) ** 2 * val.frequency, 0)
      );

      temp[i].estimation = parseFloat(
        (
          (1 / (statsLength * dispers ** 4)) *
            stats.reduce((acc, val) => acc + (val.item - avg) ** 4 * val.frequency, 0) -
          3
        ).toPrecision(3)
      );

      temp[i].deviations = parseFloat(
        Math.sqrt(
          (24 * statsLength * (statsLength - 1) ** 2) /
            ((statsLength - 3) * (statsLength - 2) * (statsLength + 3) * (statsLength + 5))
        ).toPrecision(3)
      );
      temp[i].interval = calculateConfidenceInterval(temp[i], statsLength);
    } else if (temp[i].characteristic === "Мінімум") {
      temp[i].estimation = Math.min(...stats.map((item) => item.item));
    } else if (temp[i].characteristic === "Максимум") {
      temp[i].estimation = Math.max(...stats.map((item) => item.item));
    }
  }
  return temp;
};

export const calculateStudentQuantile = (p: number, v: number) => {
  //v - length of data
  const up = calculateQuantile(p);

  return (
    up +
    (1 / v) * (1 / 4) * (up ** 3 + up) +
    (1 / v ** 2) * (1 / 96) * (5 * up ** 5 + 16 * up ** 3 + 3 * up) +
    (1 / v ** 3) * (1 / 384) * (3 * up ** 7 + 19 * up ** 5 + 17 * up ** 3 - 15 * up) +
    (1 / v ** 4) * (1 / 92160) * (79 * up ** 9 + 779 * up ** 7 + 1482 * up ** 5 - 1920 * up ** 3 - 945 * up)
  );
};

export const calculateAvgConfidenceInterval = (p: number, data: Stats[]) => {
  //p - 0.95
  const studentQuantile = calculateStudentQuantile(p, data.length - 1);
  const dataLength = data.reduce((acc, val) => acc + val.frequency, 0);
  const avg = data.reduce((acc, val) => acc + val.item * val.frequency, 0) / dataLength;
  const stdDev = Math.sqrt(data.reduce((acc, val) => acc + Math.pow(val.item - avg, 2), 0) / dataLength);
  const quadDeviasion = stdDev / Math.sqrt(dataLength);

  let upperBound = parseFloat((avg + studentQuantile * quadDeviasion).toPrecision(3));
  let lowerBound = parseFloat((avg - studentQuantile * quadDeviasion).toPrecision(3));

  return { boundaries: [lowerBound, upperBound], quadDeviasion: quadDeviasion };
};

export const calculateQuadDeviasion = (data: Stats[]) => {
  const statsLength = data.reduce((acc, val) => acc + val.frequency, 0);
  const avg = data.reduce((acc, val) => acc + val.item * val.frequency, 0) / statsLength;

  const quadDeviasion = parseFloat(
    Math.sqrt(
      (1 / statsLength) * data.reduce((acc, val) => acc + (val.item - avg) ** 2 * val.frequency, 0)
    ).toPrecision(3)
  );

  return quadDeviasion;
};

export const calculateMedianConfidenceInterval = (data: Stats[]) => {
  //maybe delete math functions
  const dataLength = data.reduce((acc, val) => acc + val.frequency, 0);
  const u = 1.96;
  const j = Math.floor(dataLength / 2 - u * (Math.sqrt(dataLength) / 2));
  const k = Math.ceil(dataLength / 2 + 1 + u * (Math.sqrt(dataLength) / 2));

  return [data[j].item, data[k].item];
};

export const calculateConfidenceInterval = (data: QuantitativeStats, v: number) => {
  const { estimation, deviations } = data;
  let quantile;
  if (v > 60) {
    quantile = 1.96;
  } else {
    quantile = calculateStudentQuantile(0.95, v);
  }

  const lowerBound = parseFloat((estimation - quantile * deviations!).toPrecision(3));
  const upperBound = parseFloat((estimation + quantile * deviations!).toPrecision(3));

  return [lowerBound, upperBound];
};

export const calculateAnomaly = (data: QuantitativeStats[]): number[] => {
  return [data[0].estimation - 1.96 * data[2].estimation, data[0].estimation + 1.96 * data[2].estimation];
};

export const deleteAnomaly = (
  data: Stats[],
  boundaries: number[],
  setFileInfo: React.Dispatch<React.SetStateAction<Stats[]>>
) => {
  const temp = data.filter((item) => item.item > boundaries[0] && item.item < boundaries[1]);
  console.log(temp);
  console.log(boundaries[0]);
  console.log(boundaries[1]);
  setFileInfo([...temp]);
};

export const normalDistribution = (data: QuantitativeStats[], length: number) => {
  const aKoef = data.find((item) => item.characteristic === "Коефіцієнт асиметрії");
  const eKoef = data.find((item) => item.characteristic === "Коефіцієнт ексцесу");
  if (aKoef && eKoef) {
    const aKoefCalculated = aKoef.estimation / aKoef.deviations!;
    const eKoefCalculated = eKoef.estimation / eKoef.deviations!;
    const studentQuantile = calculateStudentQuantile(1 - 0.05 / 2, length - 1);
    console.log(aKoefCalculated, eKoefCalculated, studentQuantile);

    if (Math.abs(aKoefCalculated) <= studentQuantile && Math.abs(eKoefCalculated) <= studentQuantile) {
      return true;
    }
  }
  return false;
};

export const calculatePaper = (data: Stats[]) => {
  console.log(data);
  return data.map((item) => ({
    item: item.item,
    quantile: calculateQuantile(parseFloat(item.empValue.toPrecision(2))),
  }));
};

export const scottBandwidth = (data: Stats[], quadDeviasion: number) => {
  const tempData = [...data];
  for (let i = 0; i < tempData.length; i++) {
    if (tempData[i].frequency > 1) {
      const dataToPush = [];

      for (let y = 0; y < tempData[i].frequency - 1; y++) {
        dataToPush.push({ ...tempData[i], frequency: 1 });
      }
      tempData.splice(i, 1, ...dataToPush);
    }
  }
  const bandwidth = quadDeviasion * tempData.length ** (-1 / 5);
  return bandwidth;
};

const gaussianKernel = (u: number) => {
  return Math.exp(-0.5 * u * u) / Math.sqrt(2 * Math.PI);
};

export const calculateKDE = (data: Stats[], histogramData: HistogramStats[], bandwidth: number) => {
  const tempData = [...data];
  for (let i = 0; i < tempData.length; i++) {
    if (tempData[i].frequency > 1) {
      const dataToPush = [];

      for (let y = 0; y < tempData[i].frequency - 1; y++) {
        dataToPush.push({ ...tempData[i], frequency: 1 });
      }
      tempData.splice(i, 1, ...dataToPush);
    }
  }
  // Вычисляем ядерную оценку плотности для каждой точки x
  const estimates = histogramData.map((point) => {
    let sum = 0;

    // Вычисляем взвешенную сумму ядерных функций для каждого элемента выборки
    for (let i = 0; i < histogramData.length; i++) {
      const u = (point.classBoundaries - histogramData[i].classBoundaries) / bandwidth;
      sum += gaussianKernel(u);
    }

    // Возвращаем нормализованное значение оценки плотности
    return { classBoundaries: point.classBoundaries, itemFrequency: sum / (histogramData.length * bandwidth) };
  });

  return estimates;
};
