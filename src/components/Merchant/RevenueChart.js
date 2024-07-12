import React from "react";
import ReactECharts from "echarts-for-react";

const RevenueChart = () => {
  const generateRandomData = () => {
    const categories = ["一月", "二月", "三月", "四月", "五月", "六月"];
    const revenueData = [];
    const booksSoldData = [];
    for (let i = 0; i < categories.length; i++) {
      revenueData.push(Math.floor(Math.random() * 1000));
      booksSoldData.push(Math.floor(Math.random() * 100));
    }
    return { categories, revenueData, booksSoldData };
  };

  const { categories, revenueData, booksSoldData } = generateRandomData();

  const option = {
    title: {
      text: "月度营收",
      left: "center",
    },
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow",
      },
    },
    legend: {
      data: ["营收", "销售书目数量"],
      top: 20,
    },
    xAxis: {
      type: "category",
      data: categories,
      axisTick: {
        alignWithLabel: true,
      },
      name: "月份",
    },
    yAxis: {
      type: "value",
      name: "收入/元",
    },
    series: [
      {
        name: "营收",
        type: "bar",
        barWidth: "40%",
        data: revenueData,
        label: {
          show: true,
          position: "top",
          color: "black",
        },
      },
      {
        name: "销售书目数量",
        type: "line",
        data: booksSoldData,
        label: {
          show: true,
          position: "top",
          color: "black",
        },
      },
    ],
  };

  return (
    <ReactECharts option={option} style={{ height: "400px", width: "100%" }} />
  );
};

export default RevenueChart;
