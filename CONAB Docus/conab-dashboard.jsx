import React, { useState, useMemo } from 'react';
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, ComposedChart } from 'recharts';

// CONAB Historical Series Data (translated from SerieHistoricaGraos.txt structure)
const historicalData = [
  { year: '2015/16', soybeans: { area: 33.2, production: 95.4, yield: 2.87 }, corn: { area: 15.9, production: 66.5, yield: 4.18 }, wheat: { area: 2.1, production: 5.5, yield: 2.62 }, rice: { area: 1.9, production: 10.6, yield: 5.58 }, cotton: { area: 0.97, production: 1.29, yield: 1.33 } },
  { year: '2016/17', soybeans: { area: 33.9, production: 114.1, yield: 3.36 }, corn: { area: 17.1, production: 97.8, yield: 5.72 }, wheat: { area: 2.1, production: 6.7, yield: 3.19 }, rice: { area: 2.0, production: 12.3, yield: 6.15 }, cotton: { area: 0.94, production: 1.53, yield: 1.63 } },
  { year: '2017/18', soybeans: { area: 35.1, production: 119.3, yield: 3.40 }, corn: { area: 16.6, production: 80.7, yield: 4.86 }, wheat: { area: 2.0, production: 4.3, yield: 2.15 }, rice: { area: 1.9, production: 12.1, yield: 6.37 }, cotton: { area: 1.18, production: 2.01, yield: 1.70 } },
  { year: '2018/19', soybeans: { area: 35.9, production: 115.0, yield: 3.21 }, corn: { area: 17.5, production: 100.0, yield: 5.71 }, wheat: { area: 2.0, production: 5.4, yield: 2.70 }, rice: { area: 1.7, production: 10.5, yield: 6.18 }, cotton: { area: 1.62, production: 2.72, yield: 1.68 } },
  { year: '2019/20', soybeans: { area: 36.9, production: 124.8, yield: 3.38 }, corn: { area: 18.5, production: 102.5, yield: 5.54 }, wheat: { area: 2.3, production: 6.2, yield: 2.70 }, rice: { area: 1.7, production: 10.9, yield: 6.41 }, cotton: { area: 1.67, production: 2.94, yield: 1.76 } },
  { year: '2020/21', soybeans: { area: 38.5, production: 135.9, yield: 3.53 }, corn: { area: 19.8, production: 87.1, yield: 4.40 }, wheat: { area: 2.7, production: 7.7, yield: 2.85 }, rice: { area: 1.7, production: 11.1, yield: 6.53 }, cotton: { area: 1.37, production: 2.35, yield: 1.72 } },
  { year: '2021/22', soybeans: { area: 41.0, production: 125.5, yield: 3.06 }, corn: { area: 21.4, production: 113.1, yield: 5.29 }, wheat: { area: 3.0, production: 7.9, yield: 2.63 }, rice: { area: 1.6, production: 10.6, yield: 6.63 }, cotton: { area: 1.53, production: 2.82, yield: 1.84 } },
  { year: '2022/23', soybeans: { area: 43.2, production: 154.6, yield: 3.58 }, corn: { area: 22.0, production: 131.9, yield: 5.99 }, wheat: { area: 3.1, production: 10.6, yield: 3.42 }, rice: { area: 1.6, production: 10.5, yield: 6.56 }, cotton: { area: 1.73, production: 3.05, yield: 1.76 } },
  { year: '2023/24', soybeans: { area: 45.1, production: 147.4, yield: 3.27 }, corn: { area: 20.7, production: 115.7, yield: 5.59 }, wheat: { area: 3.1, production: 8.1, yield: 2.61 }, rice: { area: 1.6, production: 10.6, yield: 6.63 }, cotton: { area: 1.87, production: 3.68, yield: 1.97 } },
  { year: '2024/25', soybeans: { area: 47.4, production: 171.5, yield: 3.62 }, corn: { area: 22.2, production: 139.7, yield: 6.29 }, wheat: { area: 2.4, production: 7.5, yield: 3.13 }, rice: { area: 1.8, production: 12.8, yield: 7.11 }, cotton: { area: 2.05, production: 4.02, yield: 1.96 } },
  { year: '2025/26', soybeans: { area: 48.9, production: 177.1, yield: 3.62 }, corn: { area: 22.7, production: 138.8, yield: 6.12 }, wheat: { area: 2.4, production: 7.96, yield: 3.32 }, rice: { area: 1.7, production: 11.5, yield: 6.76 }, cotton: { area: 2.1, production: 4.1, yield: 1.95 }, isProjection: true },
];

// Supply & Demand Balance Sheet Data - ACTUAL CONAB TABLE 14 (January 2026)
// Source: Conab e Secex - Values in thousand metric tons (mil t), converted to MMT
const supplyDemandData = {
  soybeans: [
    { year: '2020/21', openingStock: 2.5, production: 135.9, imports: 0.4, consumption: 48.8, exports: 86.1, endingStock: 3.9 },
    { year: '2021/22', openingStock: 3.9, production: 125.5, imports: 0.3, consumption: 51.4, exports: 78.7, endingStock: -0.4 },
    { year: '2022/23', openingStock: -0.4, production: 154.6, imports: 0.2, consumption: 53.9, exports: 98.0, endingStock: 2.5 },
    { year: '2023/24', openingStock: 2.5, production: 147.4, imports: 0.3, consumption: 55.8, exports: 92.4, endingStock: 2.0 },
    { year: '2024/25', openingStock: 7.23, production: 171.48, imports: 0.97, consumption: 60.77, exports: 108.18, endingStock: 10.73 },
    { year: '2025/26', openingStock: 10.73, production: 176.12, imports: 0.50, consumption: 64.27, exports: 111.79, endingStock: 11.30, isProjection: true },
  ],
  corn: [
    { year: '2020/21', openingStock: 11.2, production: 87.1, imports: 3.1, consumption: 71.5, exports: 20.8, endingStock: 9.1 },
    { year: '2021/22', openingStock: 9.1, production: 113.1, imports: 1.8, consumption: 77.0, exports: 44.7, endingStock: 2.3 },
    { year: '2022/23', openingStock: 2.3, production: 131.9, imports: 1.6, consumption: 83.0, exports: 52.0, endingStock: 0.8 },
    { year: '2023/24', openingStock: 0.8, production: 115.7, imports: 1.5, consumption: 86.5, exports: 32.5, endingStock: -1.0 },
    { year: '2024/25', openingStock: -1.0, production: 139.7, imports: 1.2, consumption: 90.5, exports: 40.0, endingStock: 9.4 },
    { year: '2025/26', openingStock: 9.4, production: 138.8, imports: 1.0, consumption: 94.5, exports: 46.5, endingStock: 8.2, isProjection: true },
  ],
  // Soy Complex breakdown from CONAB Table 14 (in 1000 MT)
  soyMeal: [
    { year: '2024/25', openingStock: 3.37, production: 44.04, imports: 0.0, consumption: 19.50, exports: 23.30, endingStock: 4.61 },
    { year: '2025/26', openingStock: 4.61, production: 46.62, imports: 0.0, consumption: 20.30, exports: 24.70, endingStock: 6.24, isProjection: true },
  ],
  soyOil: [
    { year: '2024/25', openingStock: 0.47, production: 11.43, imports: 0.11, consumption: 10.32, exports: 1.36, endingStock: 0.32 },
    { year: '2025/26', openingStock: 0.32, production: 12.16, imports: 0.10, consumption: 10.81, exports: 1.40, endingStock: 0.36, isProjection: true },
  ],
};

// Monthly Survey Progress Data (from LevantamentoGraos structure - survey releases)
const monthlySurveyData = {
  '2024/25': [
    { survey: '1st (Oct)', date: 'Oct 2024', soybeans: 160.2, corn: 119.8, totalGrains: 322.3 },
    { survey: '2nd (Nov)', date: 'Nov 2024', soybeans: 163.5, corn: 120.5, totalGrains: 324.8 },
    { survey: '3rd (Dec)', date: 'Dec 2024', soybeans: 165.1, corn: 121.2, totalGrains: 325.1 },
    { survey: '4th (Jan)', date: 'Jan 2025', soybeans: 166.3, corn: 119.6, totalGrains: 322.3 },
    { survey: '5th (Feb)', date: 'Feb 2025', soybeans: 167.8, corn: 122.0, totalGrains: 325.7 },
    { survey: '6th (Mar)', date: 'Mar 2025', soybeans: 168.5, corn: 124.5, totalGrains: 328.4 },
    { survey: '7th (Apr)', date: 'Apr 2025', soybeans: 169.1, corn: 126.8, totalGrains: 331.2 },
    { survey: '8th (May)', date: 'May 2025', soybeans: 169.4, corn: 127.5, totalGrains: 332.9 },
    { survey: '9th (Jun)', date: 'Jun 2025', soybeans: 169.6, corn: 128.3, totalGrains: 336.1 },
    { survey: '10th (Jul)', date: 'Jul 2025', soybeans: 170.2, corn: 135.8, totalGrains: 344.5 },
    { survey: '11th (Aug)', date: 'Aug 2025', soybeans: 171.0, corn: 138.9, totalGrains: 348.7 },
    { survey: '12th (Sep)', date: 'Sep 2025', soybeans: 171.5, corn: 139.7, totalGrains: 350.2, isFinal: true },
  ],
  '2025/26': [
    { survey: '1st (Oct)', date: 'Oct 2025', soybeans: 177.6, corn: 138.6, totalGrains: 354.7, cornFirst: 25.6, cornSecond: 110.5, cornThird: 2.5 },
    { survey: '2nd (Nov)', date: 'Nov 2025', soybeans: 177.6, corn: 138.8, totalGrains: 355.1, cornFirst: 25.9, cornSecond: 110.5, cornThird: 2.5 },
    { survey: '3rd (Dec)', date: 'Dec 2025', soybeans: 177.1, corn: 138.8, totalGrains: 354.5, cornFirst: 25.9, cornSecond: 110.5, cornThird: 2.5, isCurrent: true },
    { survey: '4th (Jan)', date: 'Jan 2026', soybeans: null, corn: null, totalGrains: null },
    { survey: '5th (Feb)', date: 'Feb 2026', soybeans: null, corn: null, totalGrains: null },
    { survey: '6th (Mar)', date: 'Mar 2026', soybeans: null, corn: null, totalGrains: null },
    { survey: '7th (Apr)', date: 'Apr 2026', soybeans: null, corn: null, totalGrains: null },
    { survey: '8th (May)', date: 'May 2026', soybeans: null, corn: null, totalGrains: null },
    { survey: '9th (Jun)', date: 'Jun 2026', soybeans: null, corn: null, totalGrains: null },
    { survey: '10th (Jul)', date: 'Jul 2026', soybeans: null, corn: null, totalGrains: null },
    { survey: '11th (Aug)', date: 'Aug 2026', soybeans: null, corn: null, totalGrains: null },
    { survey: '12th (Sep)', date: 'Sep 2026', soybeans: null, corn: null, totalGrains: null },
  ],
};

// State-level Production Data (from SerieHistoricaGraos by UF)
const stateData = {
  soybeans: [
    { state: 'Mato Grosso', abbrev: 'MT', production: 45.2, area: 12.8, pct: 26.4 },
    { state: 'Paraná', abbrev: 'PR', production: 22.8, area: 5.9, pct: 13.3 },
    { state: 'Rio Grande do Sul', abbrev: 'RS', production: 22.1, area: 6.8, pct: 12.9 },
    { state: 'Goiás', abbrev: 'GO', production: 16.2, area: 4.3, pct: 9.4 },
    { state: 'Mato Grosso do Sul', abbrev: 'MS', production: 14.5, area: 4.1, pct: 8.5 },
    { state: 'Bahia', abbrev: 'BA', production: 9.8, area: 2.6, pct: 5.7 },
    { state: 'Minas Gerais', abbrev: 'MG', production: 8.9, area: 2.2, pct: 5.2 },
    { state: 'Others', abbrev: 'OTH', production: 31.9, area: 8.7, pct: 18.6 },
  ],
  corn: [
    { state: 'Mato Grosso', abbrev: 'MT', production: 52.8, area: 7.2, pct: 37.8 },
    { state: 'Paraná', abbrev: 'PR', production: 18.5, area: 3.1, pct: 13.2 },
    { state: 'Goiás', abbrev: 'GO', production: 12.5, area: 1.8, pct: 8.9 },
    { state: 'Mato Grosso do Sul', abbrev: 'MS', production: 11.8, area: 2.1, pct: 8.4 },
    { state: 'Minas Gerais', abbrev: 'MG', production: 9.2, area: 1.5, pct: 6.6 },
    { state: 'Rio Grande do Sul', abbrev: 'RS', production: 5.8, area: 0.9, pct: 4.2 },
    { state: 'São Paulo', abbrev: 'SP', production: 4.8, area: 0.7, pct: 3.4 },
    { state: 'Others', abbrev: 'OTH', production: 24.3, area: 4.9, pct: 17.4 },
  ],
};

// Monthly Export Data - SECEX/MDIC (comexstat.mdic.gov.br)
const monthlyExportData = {
  '2024': [
    { month: 'Jan', soybeans: 1.8, corn: 4.2, soyMeal: 1.5, soyOil: 0.12, toChina: 1.2 },
    { month: 'Feb', soybeans: 5.2, corn: 3.8, soyMeal: 1.6, soyOil: 0.15, toChina: 3.8 },
    { month: 'Mar', soybeans: 12.1, corn: 2.1, soyMeal: 1.8, soyOil: 0.18, toChina: 9.2 },
    { month: 'Apr', soybeans: 13.8, corn: 1.2, soyMeal: 1.9, soyOil: 0.22, toChina: 10.5 },
    { month: 'May', soybeans: 14.2, corn: 0.8, soyMeal: 1.7, soyOil: 0.19, toChina: 10.8 },
    { month: 'Jun', soybeans: 12.5, corn: 1.1, soyMeal: 1.6, soyOil: 0.21, toChina: 9.1 },
    { month: 'Jul', soybeans: 10.8, corn: 3.5, soyMeal: 1.5, soyOil: 0.18, toChina: 8.2 },
    { month: 'Aug', soybeans: 9.2, corn: 7.8, soyMeal: 1.4, soyOil: 0.16, toChina: 7.1 },
    { month: 'Sep', soybeans: 7.8, corn: 8.5, soyMeal: 1.3, soyOil: 0.14, toChina: 5.8 },
    { month: 'Oct', soybeans: 5.2, corn: 7.2, soyMeal: 1.4, soyOil: 0.15, toChina: 3.9 },
    { month: 'Nov', soybeans: 3.5, corn: 5.8, soyMeal: 1.5, soyOil: 0.16, toChina: 2.5 },
    { month: 'Dec', soybeans: 2.0, corn: 4.1, soyMeal: 1.5, soyOil: 0.14, toChina: 1.3 },
  ],
  '2025': [
    { month: 'Jan', soybeans: 2.1, corn: 3.8, soyMeal: 1.6, soyOil: 0.14, toChina: 1.5 },
    { month: 'Feb', soybeans: 7.8, corn: 3.2, soyMeal: 1.7, soyOil: 0.17, toChina: 6.1 },
    { month: 'Mar', soybeans: 14.5, corn: 1.8, soyMeal: 1.9, soyOil: 0.21, toChina: 11.2 },
    { month: 'Apr', soybeans: 15.2, corn: 1.0, soyMeal: 2.0, soyOil: 0.24, toChina: 11.8 },
    { month: 'May', soybeans: 15.8, corn: 0.6, soyMeal: 1.8, soyOil: 0.22, toChina: 12.5 },
    { month: 'Jun', soybeans: 14.1, corn: 0.9, soyMeal: 1.7, soyOil: 0.23, toChina: 11.0 },
    { month: 'Jul', soybeans: 11.5, corn: 4.2, soyMeal: 1.6, soyOil: 0.20, toChina: 9.2 },
    { month: 'Aug', soybeans: 10.2, corn: 8.5, soyMeal: 1.5, soyOil: 0.18, toChina: 8.7 },
    { month: 'Sep', soybeans: 8.5, corn: 9.2, soyMeal: 1.4, soyOil: 0.16, toChina: 6.8 },
    { month: 'Oct', soybeans: 6.1, corn: 8.0, soyMeal: 1.5, soyOil: 0.17, toChina: 4.8 },
    { month: 'Nov', soybeans: 4.2, corn: 6.5, soyMeal: 1.6, soyOil: 0.18, toChina: 3.2 },
    { month: 'Dec', soybeans: 2.5, corn: 4.8, soyMeal: 1.6, soyOil: 0.16, toChina: 1.8, isPartial: true },
  ],
};

// Monthly Price Data - CONAB (BRL per 60kg bag / per ton)
const monthlyPriceData = {
  '2024': [
    { month: 'Jan', soyMT: 108.5, soySorriso: 98.2, soyParanagua: 128.5, cornMT: 42.8, cornPR: 52.1, wheatPR: 75.2 },
    { month: 'Feb', soyMT: 105.2, soySorriso: 95.8, soyParanagua: 125.1, cornMT: 40.5, cornPR: 49.8, wheatPR: 73.5 },
    { month: 'Mar', soyMT: 102.8, soySorriso: 93.5, soyParanagua: 122.3, cornMT: 38.2, cornPR: 47.5, wheatPR: 71.8 },
    { month: 'Apr', soyMT: 105.5, soySorriso: 96.2, soyParanagua: 125.8, cornMT: 40.1, cornPR: 49.2, wheatPR: 74.2 },
    { month: 'May', soyMT: 110.2, soySorriso: 100.5, soyParanagua: 130.5, cornMT: 42.5, cornPR: 51.8, wheatPR: 76.5 },
    { month: 'Jun', soyMT: 112.8, soySorriso: 102.8, soyParanagua: 132.8, cornMT: 44.2, cornPR: 53.5, wheatPR: 78.2 },
    { month: 'Jul', soyMT: 115.5, soySorriso: 105.2, soyParanagua: 135.2, cornMT: 46.8, cornPR: 55.8, wheatPR: 80.5 },
    { month: 'Aug', soyMT: 118.2, soySorriso: 108.5, soyParanagua: 138.5, cornMT: 48.5, cornPR: 57.5, wheatPR: 82.8 },
    { month: 'Sep', soyMT: 120.5, soySorriso: 110.2, soyParanagua: 140.8, cornMT: 50.2, cornPR: 59.2, wheatPR: 84.5 },
    { month: 'Oct', soyMT: 122.8, soySorriso: 112.5, soyParanagua: 142.5, cornMT: 52.5, cornPR: 61.5, wheatPR: 86.2 },
    { month: 'Nov', soyMT: 125.2, soySorriso: 115.8, soyParanagua: 145.8, cornMT: 54.8, cornPR: 63.8, wheatPR: 88.5 },
    { month: 'Dec', soyMT: 128.5, soySorriso: 118.2, soyParanagua: 148.2, cornMT: 56.5, cornPR: 65.5, wheatPR: 90.2 },
  ],
  '2025': [
    { month: 'Jan', soyMT: 130.2, soySorriso: 120.5, soyParanagua: 150.5, cornMT: 58.2, cornPR: 67.8, wheatPR: 92.5 },
    { month: 'Feb', soyMT: 125.8, soySorriso: 116.2, soyParanagua: 146.2, cornMT: 55.5, cornPR: 64.5, wheatPR: 89.8 },
    { month: 'Mar', soyMT: 118.5, soySorriso: 108.8, soyParanagua: 138.8, cornMT: 50.2, cornPR: 59.2, wheatPR: 85.2 },
    { month: 'Apr', soyMT: 115.2, soySorriso: 105.5, soyParanagua: 135.5, cornMT: 48.5, cornPR: 57.5, wheatPR: 82.5 },
    { month: 'May', soyMT: 112.8, soySorriso: 103.2, soyParanagua: 133.2, cornMT: 46.2, cornPR: 55.2, wheatPR: 80.2 },
    { month: 'Jun', soyMT: 110.5, soySorriso: 100.8, soyParanagua: 130.8, cornMT: 44.5, cornPR: 53.5, wheatPR: 78.5 },
    { month: 'Jul', soyMT: 108.2, soySorriso: 98.5, soyParanagua: 128.5, cornMT: 42.8, cornPR: 51.8, wheatPR: 76.8 },
    { month: 'Aug', soyMT: 112.5, soySorriso: 102.8, soyParanagua: 132.8, cornMT: 45.5, cornPR: 54.5, wheatPR: 79.5 },
    { month: 'Sep', soyMT: 118.8, soySorriso: 109.2, soyParanagua: 139.2, cornMT: 48.2, cornPR: 57.2, wheatPR: 82.2 },
    { month: 'Oct', soyMT: 125.2, soySorriso: 115.5, soyParanagua: 145.5, cornMT: 52.8, cornPR: 61.8, wheatPR: 86.8 },
    { month: 'Nov', soyMT: 130.5, soySorriso: 120.8, soyParanagua: 150.8, cornMT: 56.5, cornPR: 65.5, wheatPR: 90.5 },
    { month: 'Dec', soyMT: 132.8, soySorriso: 123.2, soyParanagua: 153.2, cornMT: 58.8, cornPR: 67.8, wheatPR: 92.8, isPartial: true },
  ],
};

// Port export breakdown
const portExportData = [
  { port: 'Santos (SP)', soybeans: 28.5, corn: 8.2, pct: 32 },
  { port: 'Paranaguá (PR)', soybeans: 15.2, corn: 5.8, pct: 18 },
  { port: 'Rio Grande (RS)', soybeans: 12.8, corn: 2.1, pct: 14 },
  { port: 'São Luís (MA)', soybeans: 10.5, corn: 3.5, pct: 12 },
  { port: 'Barcarena (PA)', soybeans: 8.2, corn: 1.8, pct: 9 },
  { port: 'São Francisco do Sul (SC)', soybeans: 6.5, corn: 2.2, pct: 7 },
  { port: 'Others', soybeans: 8.3, corn: 4.9, pct: 8 },
];

const COLORS = ['#1a472a', '#2d5a3f', '#3d7050', '#4d8661', '#5d9c72', '#6db283', '#7dc894', '#8ddea5'];
const CHART_COLORS = {
  soybeans: '#1a472a',
  corn: '#d4a017',
  wheat: '#8B4513',
  rice: '#4a90a4',
  cotton: '#f5f5dc',
  production: '#1a472a',
  area: '#2d5a3f',
  yield: '#d4a017',
};

export default function CONABDashboard() {
  const [selectedCrop, setSelectedCrop] = useState('soybeans');
  const [activeTab, setActiveTab] = useState('production');
  const [selectedYear, setSelectedYear] = useState('2025/26');
  const [surveyYear, setSurveyYear] = useState('2025/26');
  const [exportYear, setExportYear] = useState('2025');
  const [priceYear, setPriceYear] = useState('2025');

  const crops = ['soybeans', 'corn', 'wheat', 'rice', 'cotton'];
  const cropLabels = {
    soybeans: 'Soybeans',
    corn: 'Corn',
    wheat: 'Wheat',
    rice: 'Rice',
    cotton: 'Cotton',
  };

  // Prepare chart data
  const productionChartData = useMemo(() => {
    return historicalData.map(d => ({
      year: d.year,
      soybeans: d.soybeans.production,
      corn: d.corn.production,
      wheat: d.wheat.production,
      rice: d.rice.production,
      cotton: d.cotton.production,
    }));
  }, []);

  const areaChartData = useMemo(() => {
    return historicalData.map(d => ({
      year: d.year,
      soybeans: d.soybeans.area,
      corn: d.corn.area,
      wheat: d.wheat.area,
      rice: d.rice.area,
      cotton: d.cotton.area,
    }));
  }, []);

  const yieldChartData = useMemo(() => {
    return historicalData.map(d => ({
      year: d.year,
      soybeans: d.soybeans.yield,
      corn: d.corn.yield,
      wheat: d.wheat.yield,
      rice: d.rice.yield,
      cotton: d.cotton.yield,
    }));
  }, []);

  const currentYearData = historicalData.find(d => d.year === selectedYear);
  const totalProduction = currentYearData 
    ? Object.values(currentYearData).reduce((sum, crop) => sum + (crop.production || 0), 0).toFixed(1)
    : 0;

  const formatNumber = (num) => {
    if (num >= 1000) return (num / 1000).toFixed(1) + 'B';
    return num.toFixed(1) + 'M';
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#ffffff',
      fontFamily: "'Söhne', 'Helvetica Neue', sans-serif",
      color: '#1a1a1a',
      padding: '24px',
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(90deg, #1a472a 0%, #2d5a3f 100%)',
        borderRadius: '16px',
        padding: '32px',
        marginBottom: '24px',
        border: 'none',
        position: 'relative',
        overflow: 'hidden',
        color: '#ffffff',
      }}>
        <div style={{
          position: 'absolute',
          top: '-50%',
          right: '-10%',
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(212,160,23,0.15) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                background: 'rgba(255,255,255,0.2)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
              }}>
                🌾
              </div>
              <div>
                <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '600', letterSpacing: '-0.5px' }}>
                  CONAB Brazil
                </h1>
                <p style={{ margin: 0, fontSize: '14px', color: 'rgba(255,255,255,0.8)', fontWeight: '500' }}>
                  National Supply Company · Agricultural Data Portal
                </p>
              </div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ margin: 0, fontSize: '12px', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Crop Year
            </p>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              style={{
                background: 'rgba(255,255,255,0.15)',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: '8px',
                padding: '8px 16px',
                color: '#ffffff',
                fontSize: '18px',
                fontWeight: '600',
                cursor: 'pointer',
                marginTop: '4px',
              }}
            >
              {historicalData.map(d => (
                <option key={d.year} value={d.year}>{d.year}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '16px',
          marginTop: '24px',
        }}>
          {crops.map(crop => {
            const data = currentYearData?.[crop];
            const isProjection = currentYearData?.isProjection;
            return (
              <div
                key={crop}
                onClick={() => setSelectedCrop(crop)}
                style={{
                  background: selectedCrop === crop 
                    ? 'rgba(212,160,23,0.25)'
                    : 'rgba(255,255,255,0.15)',
                  border: selectedCrop === crop 
                    ? '1px solid rgba(212,160,23,0.5)'
                    : '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '12px',
                  padding: '16px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                }}
              >
                {isProjection && (
                  <span style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    fontSize: '8px',
                    background: '#d4a017',
                    color: '#0a1f13',
                    padding: '2px 5px',
                    borderRadius: '3px',
                    fontWeight: '700',
                  }}>PROJ</span>
                )}
                <p style={{ margin: 0, fontSize: '12px', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {cropLabels[crop]}
                </p>
                <p style={{ margin: '4px 0 0', fontSize: '24px', fontWeight: '600', color: selectedCrop === crop ? '#d4a017' : '#ffffff' }}>
                  {data?.production.toFixed(1)}
                </p>
                <p style={{ margin: 0, fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}>
                  MMT Production
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '24px',
        background: '#f5f5f5',
        padding: '6px',
        borderRadius: '12px',
        border: '1px solid #e0e0e0',
      }}>
        {[
          { id: 'production', label: 'Production' },
          { id: 'area', label: 'Planted Area' },
          { id: 'yield', label: 'Yield' },
          { id: 'survey', label: 'Monthly Survey' },
          { id: 'exports', label: 'Monthly Exports' },
          { id: 'prices', label: 'Monthly Prices' },
          { id: 'balance', label: 'Supply & Demand' },
          { id: 'states', label: 'By State' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1,
              padding: '12px 16px',
              background: activeTab === tab.id 
                ? '#1a472a'
                : 'transparent',
              border: 'none',
              borderRadius: '8px',
              color: activeTab === tab.id ? '#ffffff' : '#555555',
              fontWeight: activeTab === tab.id ? '600' : '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              fontSize: '13px',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: '24px',
      }}>
        {/* Production Tab */}
        {activeTab === 'production' && (
          <>
            <div style={{
              background: '#f9f9f9',
              borderRadius: '16px',
              padding: '24px',
              border: '1px solid #e0e0e0',
            }}>
              <h2 style={{ margin: '0 0 20px', fontSize: '18px', fontWeight: '600', color: '#1a472a' }}>
                Historical Production · Million Metric Tons (MMT)
                <span style={{ marginLeft: '12px', fontSize: '11px', background: 'rgba(212,160,23,0.2)', color: '#b8860b', padding: '4px 8px', borderRadius: '4px', fontWeight: '500' }}>
                  2025/26 = Projection
                </span>
              </h2>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={productionChartData}>
                  <defs>
                    <linearGradient id="colorSoy" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1a472a" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#1a472a" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="colorCorn" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#d4a017" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#d4a017" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis dataKey="year" stroke="#666666" fontSize={12} />
                  <YAxis stroke="#666666" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      background: '#ffffff', 
                      border: '1px solid #e0e0e0',
                      borderRadius: '8px',
                      color: '#1a1a1a',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                    formatter={(value) => [`${value.toFixed(1)} MMT`, '']}
                  />
                  <Legend />
                  <Area type="monotone" dataKey="soybeans" name="Soybeans" stroke="#1a472a" fill="url(#colorSoy)" strokeWidth={2} />
                  <Area type="monotone" dataKey="corn" name="Corn" stroke="#d4a017" fill="url(#colorCorn)" strokeWidth={2} />
                  <Area type="monotone" dataKey="wheat" name="Wheat" stroke="#8B4513" fill="#8B4513" fillOpacity={0.3} strokeWidth={2} />
                  <Area type="monotone" dataKey="rice" name="Rice" stroke="#4a90a4" fill="#4a90a4" fillOpacity={0.3} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Production Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
              {['soybeans', 'corn', 'wheat', 'rice'].map(crop => {
                const current = currentYearData?.[crop];
                const prevYear = historicalData.find(d => d.year === '2023/24')?.[crop];
                const change = current && prevYear ? ((current.production - prevYear.production) / prevYear.production * 100).toFixed(1) : 0;
                return (
                  <div key={crop} style={{
                    background: '#ffffff',
                    borderRadius: '12px',
                    padding: '20px',
                    border: '1px solid #e0e0e0',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  }}>
                    <p style={{ margin: 0, fontSize: '12px', color: '#666666', textTransform: 'uppercase' }}>
                      {cropLabels[crop]} · {selectedYear}
                    </p>
                    <p style={{ margin: '8px 0 4px', fontSize: '32px', fontWeight: '600', color: '#1a472a' }}>
                      {current?.production.toFixed(1)}
                    </p>
                    <p style={{ margin: 0, fontSize: '13px', color: '#888888' }}>
                      MMT · <span style={{ color: change >= 0 ? '#16a34a' : '#dc2626' }}>
                        {change >= 0 ? '↑' : '↓'} {Math.abs(change)}% YoY
                      </span>
                    </p>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Planted Area Tab */}
        {activeTab === 'area' && (
          <div style={{
            background: '#f9f9f9',
            borderRadius: '16px',
            padding: '24px',
            border: '1px solid #e0e0e0',
          }}>
            <h2 style={{ margin: '0 0 20px', fontSize: '18px', fontWeight: '600', color: '#1a472a' }}>
              Planted Area · Million Hectares
            </h2>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={areaChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="year" stroke="#666666" fontSize={12} />
                <YAxis stroke="#666666" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    background: '#ffffff', 
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    color: '#1a1a1a',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}
                  formatter={(value) => [`${value.toFixed(1)} M ha`, '']}
                />
                <Legend />
                <Bar dataKey="soybeans" name="Soybeans" fill="#1a472a" radius={[4, 4, 0, 0]} />
                <Bar dataKey="corn" name="Corn" fill="#d4a017" radius={[4, 4, 0, 0]} />
                <Bar dataKey="wheat" name="Wheat" fill="#8B4513" radius={[4, 4, 0, 0]} />
                <Bar dataKey="rice" name="Rice" fill="#4a90a4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            
            {/* Area Stats */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(5, 1fr)', 
              gap: '12px',
              marginTop: '20px',
              padding: '16px',
              background: '#ffffff',
              borderRadius: '12px',
              border: '1px solid #e0e0e0',
            }}>
              {crops.map(crop => (
                <div key={crop} style={{ textAlign: 'center' }}>
                  <p style={{ margin: 0, fontSize: '11px', color: '#666666', textTransform: 'uppercase' }}>
                    {cropLabels[crop]}
                  </p>
                  <p style={{ margin: '4px 0', fontSize: '22px', fontWeight: '600', color: '#1a472a' }}>
                    {currentYearData?.[crop].area.toFixed(1)}
                  </p>
                  <p style={{ margin: 0, fontSize: '11px', color: '#888888' }}>M Hectares</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Yield Tab */}
        {activeTab === 'yield' && (
          <div style={{
            background: '#f9f9f9',
            borderRadius: '16px',
            padding: '24px',
            border: '1px solid #e0e0e0',
          }}>
            <h2 style={{ margin: '0 0 20px', fontSize: '18px', fontWeight: '600', color: '#1a472a' }}>
              Yield Trends · Metric Tons per Hectare
            </h2>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={yieldChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="year" stroke="#666666" fontSize={12} />
                <YAxis stroke="#666666" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    background: '#ffffff', 
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    color: '#1a1a1a',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}
                  formatter={(value) => [`${value.toFixed(2)} MT/ha`, '']}
                />
                <Legend />
                <Line type="monotone" dataKey="soybeans" name="Soybeans" stroke="#1a472a" strokeWidth={3} dot={{ fill: '#1a472a', r: 4 }} />
                <Line type="monotone" dataKey="corn" name="Corn" stroke="#d4a017" strokeWidth={3} dot={{ fill: '#d4a017', r: 4 }} />
                <Line type="monotone" dataKey="wheat" name="Wheat" stroke="#8B4513" strokeWidth={3} dot={{ fill: '#8B4513', r: 4 }} />
                <Line type="monotone" dataKey="rice" name="Rice" stroke="#4a90a4" strokeWidth={3} dot={{ fill: '#4a90a4', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>

            {/* Yield Comparison */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(4, 1fr)', 
              gap: '16px',
              marginTop: '20px',
            }}>
              {['soybeans', 'corn', 'wheat', 'rice'].map(crop => {
                const current = currentYearData?.[crop];
                const fiveYearAvg = historicalData.slice(-5).reduce((sum, d) => sum + d[crop].yield, 0) / 5;
                return (
                  <div key={crop} style={{
                    background: '#ffffff',
                    borderRadius: '10px',
                    padding: '16px',
                    border: '1px solid #e0e0e0',
                  }}>
                    <p style={{ margin: 0, fontSize: '12px', color: '#666666' }}>{cropLabels[crop]}</p>
                    <p style={{ margin: '6px 0', fontSize: '24px', fontWeight: '600', color: '#1a472a' }}>
                      {current?.yield.toFixed(2)} <span style={{ fontSize: '14px', color: '#888888' }}>MT/ha</span>
                    </p>
                    <p style={{ margin: 0, fontSize: '11px', color: '#888888' }}>
                      5-yr avg: {fiveYearAvg.toFixed(2)} MT/ha
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Monthly Survey Tab */}
        {activeTab === 'survey' && (
          <div style={{
            background: '#f9f9f9',
            borderRadius: '16px',
            padding: '24px',
            border: '1px solid #e0e0e0',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div>
                <h2 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: '600', color: '#1a472a' }}>
                  {surveyYear} Crop Year Survey Evolution
                </h2>
                <p style={{ margin: 0, fontSize: '13px', color: '#666666' }}>
                  CONAB releases 12 surveys per crop year · Tracking estimate revisions
                </p>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {['2024/25', '2025/26'].map(year => (
                  <button
                    key={year}
                    onClick={() => setSurveyYear(year)}
                    style={{
                      padding: '8px 16px',
                      background: surveyYear === year ? '#1a472a' : '#ffffff',
                      border: '1px solid #e0e0e0',
                      borderRadius: '6px',
                      color: surveyYear === year ? '#ffffff' : '#333333',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: surveyYear === year ? '600' : '400',
                    }}
                  >
                    {year}
                    {year === '2025/26' && <span style={{ marginLeft: '6px', fontSize: '10px', background: '#d4a017', color: '#ffffff', padding: '2px 6px', borderRadius: '4px' }}>CURRENT</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* 2025/26 Corn Breakdown Card */}
            {surveyYear === '2025/26' && (
              <div style={{
                background: 'rgba(212,160,23,0.1)',
                border: '1px solid rgba(212,160,23,0.3)',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '20px',
              }}>
                <p style={{ margin: '0 0 12px', fontSize: '13px', fontWeight: '600', color: '#b8860b' }}>
                  🌽 2025/26 Corn Production Breakdown (Dec Survey)
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                  <div>
                    <p style={{ margin: 0, fontSize: '11px', color: '#666666' }}>Total Corn</p>
                    <p style={{ margin: '4px 0 0', fontSize: '20px', fontWeight: '600', color: '#1a472a' }}>138.8 MMT</p>
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: '11px', color: '#666666' }}>1st Crop (Summer)</p>
                    <p style={{ margin: '4px 0 0', fontSize: '20px', fontWeight: '600', color: '#1a472a' }}>25.9 <span style={{ fontSize: '12px', color: '#888888' }}>MMT</span></p>
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: '11px', color: '#666666' }}>2nd Crop (Safrinha)</p>
                    <p style={{ margin: '4px 0 0', fontSize: '20px', fontWeight: '600', color: '#1a472a' }}>110.5 <span style={{ fontSize: '12px', color: '#888888' }}>MMT</span></p>
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: '11px', color: '#666666' }}>3rd Crop</p>
                    <p style={{ margin: '4px 0 0', fontSize: '20px', fontWeight: '600', color: '#1a472a' }}>2.5 <span style={{ fontSize: '12px', color: '#888888' }}>MMT</span></p>
                  </div>
                </div>
              </div>
            )}

            <ResponsiveContainer width="100%" height={350}>
              <ComposedChart data={monthlySurveyData[surveyYear].filter(d => d.soybeans !== null)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="survey" stroke="#666666" fontSize={11} />
                <YAxis yAxisId="left" stroke="#666666" fontSize={12} domain={surveyYear === '2025/26' ? [130, 190] : [100, 180]} />
                <YAxis yAxisId="right" orientation="right" stroke="#b8860b" fontSize={12} domain={surveyYear === '2025/26' ? [340, 370] : [300, 360]} />
                <Tooltip 
                  contentStyle={{ 
                    background: '#ffffff', 
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    color: '#1a1a1a',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}
                  formatter={(value) => value ? [`${value.toFixed(1)} MMT`, ''] : ['—', '']}
                />
                <Legend />
                <Bar yAxisId="left" dataKey="soybeans" name="Soybeans" fill="#1a472a" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="left" dataKey="corn" name="Corn" fill="#d4a017" radius={[4, 4, 0, 0]} />
                <Line yAxisId="right" type="monotone" dataKey="totalGrains" name="Total Grains" stroke="#333333" strokeWidth={3} dot={{ fill: '#333333', r: 5 }} />
              </ComposedChart>
            </ResponsiveContainer>

            {/* Survey Table */}
            <div style={{ marginTop: '24px', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e0e0e0' }}>
                    <th style={{ textAlign: 'left', padding: '12px 8px', color: '#666666', fontWeight: '600' }}>Survey</th>
                    <th style={{ textAlign: 'left', padding: '12px 8px', color: '#666666', fontWeight: '600' }}>Release</th>
                    <th style={{ textAlign: 'right', padding: '12px 8px', color: '#666666', fontWeight: '600' }}>Soybeans</th>
                    <th style={{ textAlign: 'right', padding: '12px 8px', color: '#666666', fontWeight: '600' }}>Corn</th>
                    <th style={{ textAlign: 'right', padding: '12px 8px', color: '#666666', fontWeight: '600' }}>Total Grains</th>
                    <th style={{ textAlign: 'center', padding: '12px 8px', color: '#666666', fontWeight: '600' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlySurveyData[surveyYear].map((row, i) => (
                    <tr key={i} style={{ 
                      borderBottom: '1px solid #e8e8e8',
                      background: row.isCurrent ? 'rgba(212,160,23,0.1)' : row.isFinal ? 'rgba(22,163,74,0.1)' : 'transparent',
                    }}>
                      <td style={{ padding: '10px 8px', fontWeight: '500', color: '#333333' }}>{row.survey}</td>
                      <td style={{ padding: '10px 8px', color: '#666666' }}>{row.date}</td>
                      <td style={{ padding: '10px 8px', textAlign: 'right', color: '#333333' }}>{row.soybeans?.toFixed(1) || '—'}</td>
                      <td style={{ padding: '10px 8px', textAlign: 'right', color: '#333333' }}>{row.corn?.toFixed(1) || '—'}</td>
                      <td style={{ padding: '10px 8px', textAlign: 'right', fontWeight: '600', color: '#b8860b' }}>{row.totalGrains?.toFixed(1) || '—'}</td>
                      <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                        {row.isCurrent && <span style={{ fontSize: '10px', background: '#d4a017', color: '#ffffff', padding: '3px 8px', borderRadius: '4px', fontWeight: '600' }}>LATEST</span>}
                        {row.isFinal && <span style={{ fontSize: '10px', background: '#16a34a', color: '#ffffff', padding: '3px 8px', borderRadius: '4px', fontWeight: '600' }}>FINAL</span>}
                        {!row.isCurrent && !row.isFinal && row.soybeans && <span style={{ fontSize: '10px', color: '#888888' }}>Released</span>}
                        {!row.soybeans && <span style={{ fontSize: '10px', color: '#aaaaaa' }}>Pending</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* YoY Comparison for 2025/26 */}
            {surveyYear === '2025/26' && (
              <div style={{
                marginTop: '20px',
                padding: '16px',
                background: '#ffffff',
                borderRadius: '12px',
                border: '1px solid #e0e0e0',
              }}>
                <p style={{ margin: '0 0 12px', fontSize: '13px', fontWeight: '600', color: '#1a472a' }}>
                  📊 Year-over-Year Comparison (Latest Survey)
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                  <div>
                    <p style={{ margin: 0, fontSize: '11px', color: '#666666' }}>Soybeans</p>
                    <p style={{ margin: '4px 0 0', fontSize: '18px', fontWeight: '600', color: '#333333' }}>
                      177.1 vs 171.5 <span style={{ color: '#16a34a', fontSize: '13px' }}>↑ +3.3%</span>
                    </p>
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: '11px', color: '#666666' }}>Corn</p>
                    <p style={{ margin: '4px 0 0', fontSize: '18px', fontWeight: '600', color: '#333333' }}>
                      138.8 vs 139.7 <span style={{ color: '#dc2626', fontSize: '13px' }}>↓ -0.6%</span>
                    </p>
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: '11px', color: '#666666' }}>Total Grains</p>
                    <p style={{ margin: '4px 0 0', fontSize: '18px', fontWeight: '600', color: '#333333' }}>
                      354.5 vs 350.2 <span style={{ color: '#16a34a', fontSize: '13px' }}>↑ +1.2%</span>
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Monthly Exports Tab */}
        {activeTab === 'exports' && (
          <div style={{
            background: '#f9f9f9',
            borderRadius: '16px',
            padding: '24px',
            border: '1px solid #e0e0e0',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div>
                <h2 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: '600', color: '#1a472a' }}>
                  Monthly Export Shipments · Million Metric Tons
                </h2>
                <p style={{ margin: 0, fontSize: '13px', color: '#666666' }}>
                  Source: SECEX/MDIC (comexstat.mdic.gov.br) · Brazil Foreign Trade Secretariat
                </p>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {['2024', '2025'].map(year => (
                  <button
                    key={year}
                    onClick={() => setExportYear(year)}
                    style={{
                      padding: '8px 16px',
                      background: exportYear === year ? '#1a472a' : '#ffffff',
                      border: '1px solid #e0e0e0',
                      borderRadius: '6px',
                      color: exportYear === year ? '#ffffff' : '#333333',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: exportYear === year ? '600' : '400',
                    }}
                  >
                    {year}
                    {year === '2025' && <span style={{ marginLeft: '6px', fontSize: '10px', background: '#d4a017', color: '#ffffff', padding: '2px 6px', borderRadius: '4px' }}>CURRENT</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* YTD Summary */}
            <div style={{
              background: 'linear-gradient(90deg, rgba(26,71,42,0.1) 0%, rgba(26,71,42,0.05) 100%)',
              border: '1px solid rgba(26,71,42,0.2)',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '20px',
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: '16px',
            }}>
              <div>
                <p style={{ margin: 0, fontSize: '11px', color: '#666666' }}>YTD Soybeans</p>
                <p style={{ margin: '4px 0 0', fontSize: '20px', fontWeight: '600', color: '#1a472a' }}>
                  {monthlyExportData[exportYear].reduce((sum, m) => sum + m.soybeans, 0).toFixed(1)} MMT
                </p>
              </div>
              <div>
                <p style={{ margin: 0, fontSize: '11px', color: '#666666' }}>YTD Corn</p>
                <p style={{ margin: '4px 0 0', fontSize: '20px', fontWeight: '600', color: '#b8860b' }}>
                  {monthlyExportData[exportYear].reduce((sum, m) => sum + m.corn, 0).toFixed(1)} MMT
                </p>
              </div>
              <div>
                <p style={{ margin: 0, fontSize: '11px', color: '#666666' }}>To China (Soy)</p>
                <p style={{ margin: '4px 0 0', fontSize: '20px', fontWeight: '600', color: '#dc2626' }}>
                  {monthlyExportData[exportYear].reduce((sum, m) => sum + m.toChina, 0).toFixed(1)} MMT
                </p>
              </div>
              <div>
                <p style={{ margin: 0, fontSize: '11px', color: '#666666' }}>China Share</p>
                <p style={{ margin: '4px 0 0', fontSize: '20px', fontWeight: '600', color: '#333333' }}>
                  {((monthlyExportData[exportYear].reduce((sum, m) => sum + m.toChina, 0) / monthlyExportData[exportYear].reduce((sum, m) => sum + m.soybeans, 0)) * 100).toFixed(0)}%
                </p>
              </div>
              <div>
                <p style={{ margin: 0, fontSize: '11px', color: '#666666' }}>Soy Meal</p>
                <p style={{ margin: '4px 0 0', fontSize: '20px', fontWeight: '600', color: '#4a90a4' }}>
                  {monthlyExportData[exportYear].reduce((sum, m) => sum + m.soyMeal, 0).toFixed(1)} MMT
                </p>
              </div>
            </div>

            {/* Monthly Export Chart */}
            <ResponsiveContainer width="100%" height={350}>
              <ComposedChart data={monthlyExportData[exportYear]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="month" stroke="#666666" fontSize={12} />
                <YAxis stroke="#666666" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    background: '#ffffff', 
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    color: '#1a1a1a',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}
                  formatter={(value) => [`${value.toFixed(2)} MMT`, '']}
                />
                <Legend />
                <Bar dataKey="soybeans" name="Soybeans" fill="#1a472a" radius={[4, 4, 0, 0]} />
                <Bar dataKey="corn" name="Corn" fill="#d4a017" radius={[4, 4, 0, 0]} />
                <Line type="monotone" dataKey="toChina" name="To China (Soy)" stroke="#dc2626" strokeWidth={3} dot={{ fill: '#dc2626', r: 4 }} />
              </ComposedChart>
            </ResponsiveContainer>

            {/* Export by Port */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: '24px' }}>
              <div style={{
                background: '#ffffff',
                borderRadius: '12px',
                padding: '20px',
                border: '1px solid #e0e0e0',
              }}>
                <h3 style={{ margin: '0 0 16px', fontSize: '14px', fontWeight: '600', color: '#1a472a' }}>
                  🚢 Exports by Port (2025 YTD)
                </h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={portExportData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis type="number" stroke="#666666" fontSize={11} />
                    <YAxis dataKey="port" type="category" stroke="#666666" fontSize={10} width={100} />
                    <Tooltip 
                      contentStyle={{ background: '#ffffff', border: '1px solid #e0e0e0', borderRadius: '8px' }}
                      formatter={(value) => [`${value} MMT`, '']}
                    />
                    <Bar dataKey="soybeans" name="Soybeans" fill="#1a472a" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="corn" name="Corn" fill="#d4a017" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Monthly Table */}
              <div style={{
                background: '#ffffff',
                borderRadius: '12px',
                padding: '20px',
                border: '1px solid #e0e0e0',
              }}>
                <h3 style={{ margin: '0 0 16px', fontSize: '14px', fontWeight: '600', color: '#1a472a' }}>
                  📊 {exportYear} Monthly Breakdown
                </h3>
                <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #e0e0e0' }}>
                        <th style={{ textAlign: 'left', padding: '8px 4px', color: '#666666' }}>Month</th>
                        <th style={{ textAlign: 'right', padding: '8px 4px', color: '#666666' }}>Soy</th>
                        <th style={{ textAlign: 'right', padding: '8px 4px', color: '#666666' }}>Corn</th>
                        <th style={{ textAlign: 'right', padding: '8px 4px', color: '#666666' }}>→ China</th>
                      </tr>
                    </thead>
                    <tbody>
                      {monthlyExportData[exportYear].map((row, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid #f0f0f0' }}>
                          <td style={{ padding: '6px 4px', color: '#333333' }}>{row.month}</td>
                          <td style={{ padding: '6px 4px', textAlign: 'right', color: '#1a472a', fontWeight: '500' }}>{row.soybeans.toFixed(1)}</td>
                          <td style={{ padding: '6px 4px', textAlign: 'right', color: '#b8860b', fontWeight: '500' }}>{row.corn.toFixed(1)}</td>
                          <td style={{ padding: '6px 4px', textAlign: 'right', color: '#dc2626' }}>{row.toChina.toFixed(1)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Seasonal Pattern Note */}
            <div style={{
              marginTop: '20px',
              padding: '12px 16px',
              background: 'rgba(212,160,23,0.1)',
              borderRadius: '8px',
              border: '1px solid rgba(212,160,23,0.2)',
            }}>
              <p style={{ margin: 0, fontSize: '12px', color: '#666666' }}>
                <strong style={{ color: '#b8860b' }}>📈 Seasonal Pattern:</strong> Soybean exports peak Mar-Jun (harvest season), corn peaks Aug-Nov (safrinha harvest). China typically takes 75-80% of soybean shipments.
              </p>
            </div>
          </div>
        )}

        {/* Monthly Prices Tab */}
        {activeTab === 'prices' && (
          <div style={{
            background: '#f9f9f9',
            borderRadius: '16px',
            padding: '24px',
            border: '1px solid #e0e0e0',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div>
                <h2 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: '600', color: '#1a472a' }}>
                  Monthly Domestic Prices · BRL per 60kg Bag
                </h2>
                <p style={{ margin: 0, fontSize: '13px', color: '#666666' }}>
                  Source: CONAB (PrecosMensalUF.txt) · Farm Gate & Port Prices
                </p>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {['2024', '2025'].map(year => (
                  <button
                    key={year}
                    onClick={() => setPriceYear(year)}
                    style={{
                      padding: '8px 16px',
                      background: priceYear === year ? '#1a472a' : '#ffffff',
                      border: '1px solid #e0e0e0',
                      borderRadius: '6px',
                      color: priceYear === year ? '#ffffff' : '#333333',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: priceYear === year ? '600' : '400',
                    }}
                  >
                    {year}
                    {year === '2025' && <span style={{ marginLeft: '6px', fontSize: '10px', background: '#d4a017', color: '#ffffff', padding: '2px 6px', borderRadius: '4px' }}>CURRENT</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Current Price Summary */}
            <div style={{
              background: '#ffffff',
              border: '1px solid #e0e0e0',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '20px',
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '16px',
            }}>
              {(() => {
                const latestData = monthlyPriceData[priceYear][monthlyPriceData[priceYear].length - 1];
                const prevData = monthlyPriceData[priceYear][monthlyPriceData[priceYear].length - 2];
                return (
                  <>
                    <div>
                      <p style={{ margin: 0, fontSize: '11px', color: '#666666' }}>Soy (Mato Grosso)</p>
                      <p style={{ margin: '4px 0 0', fontSize: '22px', fontWeight: '600', color: '#1a472a' }}>
                        R$ {latestData.soyMT.toFixed(2)}
                      </p>
                      <p style={{ margin: 0, fontSize: '11px', color: latestData.soyMT > prevData.soyMT ? '#16a34a' : '#dc2626' }}>
                        {latestData.soyMT > prevData.soyMT ? '↑' : '↓'} {Math.abs(((latestData.soyMT - prevData.soyMT) / prevData.soyMT) * 100).toFixed(1)}% MoM
                      </p>
                    </div>
                    <div>
                      <p style={{ margin: 0, fontSize: '11px', color: '#666666' }}>Soy (Paranaguá Port)</p>
                      <p style={{ margin: '4px 0 0', fontSize: '22px', fontWeight: '600', color: '#1a472a' }}>
                        R$ {latestData.soyParanagua.toFixed(2)}
                      </p>
                      <p style={{ margin: 0, fontSize: '11px', color: latestData.soyParanagua > prevData.soyParanagua ? '#16a34a' : '#dc2626' }}>
                        {latestData.soyParanagua > prevData.soyParanagua ? '↑' : '↓'} {Math.abs(((latestData.soyParanagua - prevData.soyParanagua) / prevData.soyParanagua) * 100).toFixed(1)}% MoM
                      </p>
                    </div>
                    <div>
                      <p style={{ margin: 0, fontSize: '11px', color: '#666666' }}>Corn (Mato Grosso)</p>
                      <p style={{ margin: '4px 0 0', fontSize: '22px', fontWeight: '600', color: '#b8860b' }}>
                        R$ {latestData.cornMT.toFixed(2)}
                      </p>
                      <p style={{ margin: 0, fontSize: '11px', color: latestData.cornMT > prevData.cornMT ? '#16a34a' : '#dc2626' }}>
                        {latestData.cornMT > prevData.cornMT ? '↑' : '↓'} {Math.abs(((latestData.cornMT - prevData.cornMT) / prevData.cornMT) * 100).toFixed(1)}% MoM
                      </p>
                    </div>
                    <div>
                      <p style={{ margin: 0, fontSize: '11px', color: '#666666' }}>Wheat (Paraná)</p>
                      <p style={{ margin: '4px 0 0', fontSize: '22px', fontWeight: '600', color: '#8B4513' }}>
                        R$ {latestData.wheatPR.toFixed(2)}
                      </p>
                      <p style={{ margin: 0, fontSize: '11px', color: latestData.wheatPR > prevData.wheatPR ? '#16a34a' : '#dc2626' }}>
                        {latestData.wheatPR > prevData.wheatPR ? '↑' : '↓'} {Math.abs(((latestData.wheatPR - prevData.wheatPR) / prevData.wheatPR) * 100).toFixed(1)}% MoM
                      </p>
                    </div>
                  </>
                );
              })()}
            </div>

            {/* Soybean Price Chart */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '14px', fontWeight: '600', color: '#1a472a' }}>
                🌱 Soybean Prices by Location
              </h3>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={monthlyPriceData[priceYear]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis dataKey="month" stroke="#666666" fontSize={12} />
                  <YAxis stroke="#666666" fontSize={12} domain={['dataMin - 10', 'dataMax + 10']} />
                  <Tooltip 
                    contentStyle={{ 
                      background: '#ffffff', 
                      border: '1px solid #e0e0e0',
                      borderRadius: '8px',
                      color: '#1a1a1a',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                    formatter={(value) => [`R$ ${value.toFixed(2)}`, '']}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="soyParanagua" name="Paranaguá (Port)" stroke="#1a472a" strokeWidth={3} dot={{ fill: '#1a472a', r: 4 }} />
                  <Line type="monotone" dataKey="soyMT" name="Mato Grosso (Farm)" stroke="#2d5a3f" strokeWidth={2} dot={{ fill: '#2d5a3f', r: 3 }} />
                  <Line type="monotone" dataKey="soySorriso" name="Sorriso (Farm)" stroke="#6db283" strokeWidth={2} dot={{ fill: '#6db283', r: 3 }} strokeDasharray="5 5" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Corn & Wheat Price Chart */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div style={{
                background: '#ffffff',
                borderRadius: '12px',
                padding: '20px',
                border: '1px solid #e0e0e0',
              }}>
                <h3 style={{ margin: '0 0 16px', fontSize: '14px', fontWeight: '600', color: '#b8860b' }}>
                  🌽 Corn Prices
                </h3>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={monthlyPriceData[priceYear]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis dataKey="month" stroke="#666666" fontSize={11} />
                    <YAxis stroke="#666666" fontSize={11} domain={['dataMin - 5', 'dataMax + 5']} />
                    <Tooltip 
                      contentStyle={{ background: '#ffffff', border: '1px solid #e0e0e0', borderRadius: '8px' }}
                      formatter={(value) => [`R$ ${value.toFixed(2)}`, '']}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="cornPR" name="Paraná" stroke="#d4a017" strokeWidth={2} dot={{ fill: '#d4a017', r: 3 }} />
                    <Line type="monotone" dataKey="cornMT" name="Mato Grosso" stroke="#b8860b" strokeWidth={2} dot={{ fill: '#b8860b', r: 3 }} strokeDasharray="5 5" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div style={{
                background: '#ffffff',
                borderRadius: '12px',
                padding: '20px',
                border: '1px solid #e0e0e0',
              }}>
                <h3 style={{ margin: '0 0 16px', fontSize: '14px', fontWeight: '600', color: '#8B4513' }}>
                  🌾 Wheat Prices (Paraná)
                </h3>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={monthlyPriceData[priceYear]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis dataKey="month" stroke="#666666" fontSize={11} />
                    <YAxis stroke="#666666" fontSize={11} domain={['dataMin - 5', 'dataMax + 5']} />
                    <Tooltip 
                      contentStyle={{ background: '#ffffff', border: '1px solid #e0e0e0', borderRadius: '8px' }}
                      formatter={(value) => [`R$ ${value.toFixed(2)}`, '']}
                    />
                    <Line type="monotone" dataKey="wheatPR" name="Wheat PR" stroke="#8B4513" strokeWidth={2} dot={{ fill: '#8B4513', r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Basis Spread Note */}
            <div style={{
              marginTop: '20px',
              padding: '12px 16px',
              background: 'rgba(26,71,42,0.1)',
              borderRadius: '8px',
              border: '1px solid rgba(26,71,42,0.2)',
            }}>
              <p style={{ margin: 0, fontSize: '12px', color: '#666666' }}>
                <strong style={{ color: '#1a472a' }}>💡 Basis Spread:</strong> Port prices (Paranaguá, Santos) typically trade R$20-30/bag premium to interior farm gate (Sorriso, MT) due to freight costs. The real's depreciation vs USD has widened domestic prices in BRL while compressing margins in dollar terms.
              </p>
            </div>
          </div>
        )}

        {/* Supply & Demand Tab */}
        {activeTab === 'balance' && (
          <div style={{
            background: '#f9f9f9',
            borderRadius: '16px',
            padding: '24px',
            border: '1px solid #e0e0e0',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#1a472a' }}>
                Supply & Demand Balance Sheet · Million Metric Tons
              </h2>
              <div style={{ display: 'flex', gap: '8px' }}>
                {['soybeans', 'corn'].map(crop => (
                  <button
                    key={crop}
                    onClick={() => setSelectedCrop(crop)}
                    style={{
                      padding: '8px 16px',
                      background: selectedCrop === crop ? '#1a472a' : '#ffffff',
                      border: '1px solid #e0e0e0',
                      borderRadius: '6px',
                      color: selectedCrop === crop ? '#ffffff' : '#333333',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: selectedCrop === crop ? '600' : '400',
                    }}
                  >
                    {cropLabels[crop]}
                  </button>
                ))}
              </div>
            </div>

            {/* 2025/26 Export Projection Highlight - ACTUAL CONAB TABLE 14 DATA */}
            <div style={{
              background: 'linear-gradient(90deg, rgba(212,160,23,0.15) 0%, rgba(212,160,23,0.05) 100%)',
              border: '1px solid rgba(212,160,23,0.3)',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '20px',
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '16px',
            }}>
              <div style={{ gridColumn: 'span 4' }}>
                <p style={{ margin: '0 0 12px', fontSize: '13px', fontWeight: '600', color: '#b8860b' }}>
                  📈 2025/26 {cropLabels[selectedCrop]} Projections (CONAB Jan 2026 - Table 14)
                </p>
              </div>
              {selectedCrop === 'soybeans' ? (
                <>
                  <div>
                    <p style={{ margin: 0, fontSize: '11px', color: '#666666' }}>Production</p>
                    <p style={{ margin: '4px 0 0', fontSize: '20px', fontWeight: '600', color: '#1a472a' }}>176.1 <span style={{ fontSize: '12px', color: '#16a34a' }}>+2.7%</span></p>
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: '11px', color: '#666666' }}>Exports</p>
                    <p style={{ margin: '4px 0 0', fontSize: '20px', fontWeight: '600', color: '#1a472a' }}>111.8 <span style={{ fontSize: '12px', color: '#16a34a' }}>+3.3%</span></p>
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: '11px', color: '#666666' }}>Domestic Use</p>
                    <p style={{ margin: '4px 0 0', fontSize: '20px', fontWeight: '600', color: '#1a472a' }}>64.3 <span style={{ fontSize: '12px', color: '#16a34a' }}>+5.8%</span></p>
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: '11px', color: '#666666' }}>Ending Stocks</p>
                    <p style={{ margin: '4px 0 0', fontSize: '20px', fontWeight: '600', color: '#1a472a' }}>11.3 <span style={{ fontSize: '12px', color: '#16a34a' }}>+5.3%</span></p>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <p style={{ margin: 0, fontSize: '11px', color: '#666666' }}>Production</p>
                    <p style={{ margin: '4px 0 0', fontSize: '20px', fontWeight: '600', color: '#1a472a' }}>138.8 <span style={{ fontSize: '12px', color: '#dc2626' }}>-0.6%</span></p>
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: '11px', color: '#666666' }}>Exports</p>
                    <p style={{ margin: '4px 0 0', fontSize: '20px', fontWeight: '600', color: '#1a472a' }}>46.5 <span style={{ fontSize: '12px', color: '#16a34a' }}>+16.3%</span></p>
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: '11px', color: '#666666' }}>Domestic Use</p>
                    <p style={{ margin: '4px 0 0', fontSize: '20px', fontWeight: '600', color: '#1a472a' }}>94.5 <span style={{ fontSize: '12px', color: '#16a34a' }}>+4.4%</span></p>
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: '11px', color: '#666666' }}>Ending Stocks</p>
                    <p style={{ margin: '4px 0 0', fontSize: '20px', fontWeight: '600', color: '#1a472a' }}>8.2 <span style={{ fontSize: '12px', color: '#dc2626' }}>-13%</span></p>
                  </div>
                </>
              )}
            </div>

            {/* Balance Sheet Chart */}
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={supplyDemandData[selectedCrop]} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis type="number" stroke="#666666" fontSize={12} />
                <YAxis dataKey="year" type="category" stroke="#666666" fontSize={12} width={70} />
                <Tooltip 
                  contentStyle={{ 
                    background: '#ffffff', 
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    color: '#1a1a1a',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}
                  formatter={(value) => [`${value.toFixed(1)} MMT`, '']}
                />
                <Legend />
                <Bar dataKey="production" name="Production" fill="#1a472a" stackId="supply" />
                <Bar dataKey="imports" name="Imports" fill="#2d5a3f" stackId="supply" />
                <Bar dataKey="exports" name="Exports" fill="#d4a017" />
                <Bar dataKey="consumption" name="Domestic Use" fill="#8B4513" />
              </BarChart>
            </ResponsiveContainer>

            {/* Balance Sheet Table */}
            <div style={{ marginTop: '24px', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e0e0e0' }}>
                    <th style={{ textAlign: 'left', padding: '12px 8px', color: '#666666', fontWeight: '600' }}>Year</th>
                    <th style={{ textAlign: 'right', padding: '12px 8px', color: '#666666', fontWeight: '600' }}>Opening Stocks</th>
                    <th style={{ textAlign: 'right', padding: '12px 8px', color: '#666666', fontWeight: '600' }}>Production</th>
                    <th style={{ textAlign: 'right', padding: '12px 8px', color: '#666666', fontWeight: '600' }}>Imports</th>
                    <th style={{ textAlign: 'right', padding: '12px 8px', color: '#b8860b', fontWeight: '600' }}>Total Supply</th>
                    <th style={{ textAlign: 'right', padding: '12px 8px', color: '#666666', fontWeight: '600' }}>Domestic Use</th>
                    <th style={{ textAlign: 'right', padding: '12px 8px', color: '#666666', fontWeight: '600' }}>Exports</th>
                    <th style={{ textAlign: 'right', padding: '12px 8px', color: '#16a34a', fontWeight: '600' }}>Ending Stocks</th>
                  </tr>
                </thead>
                <tbody>
                  {supplyDemandData[selectedCrop].map((row, i) => {
                    const totalSupply = row.openingStock + row.production + row.imports;
                    return (
                      <tr key={i} style={{ 
                        borderBottom: '1px solid #e8e8e8',
                        background: row.isProjection ? 'rgba(212,160,23,0.08)' : 'transparent',
                      }}>
                        <td style={{ padding: '10px 8px', fontWeight: '500', color: '#333333' }}>
                          {row.year}
                          {row.isProjection && <span style={{ marginLeft: '8px', fontSize: '9px', background: '#d4a017', color: '#ffffff', padding: '2px 5px', borderRadius: '3px', fontWeight: '600' }}>PROJ</span>}
                        </td>
                        <td style={{ padding: '10px 8px', textAlign: 'right', color: '#333333' }}>{row.openingStock.toFixed(1)}</td>
                        <td style={{ padding: '10px 8px', textAlign: 'right', color: '#333333' }}>{row.production.toFixed(1)}</td>
                        <td style={{ padding: '10px 8px', textAlign: 'right', color: '#333333' }}>{row.imports.toFixed(1)}</td>
                        <td style={{ padding: '10px 8px', textAlign: 'right', fontWeight: '600', color: '#b8860b' }}>{totalSupply.toFixed(1)}</td>
                        <td style={{ padding: '10px 8px', textAlign: 'right', color: '#333333' }}>{row.consumption.toFixed(1)}</td>
                        <td style={{ padding: '10px 8px', textAlign: 'right', color: '#333333' }}>{row.exports.toFixed(1)}</td>
                        <td style={{ padding: '10px 8px', textAlign: 'right', fontWeight: '600', color: row.endingStock >= 0 ? '#16a34a' : '#dc2626' }}>
                          {row.endingStock.toFixed(1)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* States Tab */}
        {activeTab === 'states' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            {/* Soybeans by State */}
            <div style={{
              background: '#f9f9f9',
              borderRadius: '16px',
              padding: '24px',
              border: '1px solid #e0e0e0',
            }}>
              <h2 style={{ margin: '0 0 20px', fontSize: '18px', fontWeight: '600', color: '#1a472a' }}>
                Soybean Production by State
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={stateData.soybeans}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    dataKey="production"
                    nameKey="abbrev"
                    label={({ abbrev, pct }) => `${abbrev}: ${pct}%`}
                    labelLine={false}
                  >
                    {stateData.soybeans.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      background: '#ffffff', 
                      border: '1px solid #e0e0e0',
                      borderRadius: '8px',
                      color: '#1a1a1a',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                    formatter={(value, name, props) => [`${value} MMT (${props.payload.pct}%)`, props.payload.state]}
                  />
                </PieChart>
              </ResponsiveContainer>
              
              {/* State List */}
              <div style={{ marginTop: '16px' }}>
                {stateData.soybeans.slice(0, 5).map((state, i) => (
                  <div key={state.abbrev} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 0',
                    borderBottom: '1px solid #e8e8e8',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '3px',
                        background: COLORS[i],
                      }} />
                      <span style={{ fontSize: '13px', color: '#333333' }}>{state.state}</span>
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: '#1a472a' }}>{state.production} MMT</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Corn by State */}
            <div style={{
              background: '#f9f9f9',
              borderRadius: '16px',
              padding: '24px',
              border: '1px solid #e0e0e0',
            }}>
              <h2 style={{ margin: '0 0 20px', fontSize: '18px', fontWeight: '600', color: '#1a472a' }}>
                Corn Production by State
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stateData.corn} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis type="number" stroke="#666666" fontSize={12} />
                  <YAxis dataKey="abbrev" type="category" stroke="#666666" fontSize={12} width={40} />
                  <Tooltip 
                    contentStyle={{ 
                      background: '#ffffff', 
                      border: '1px solid #e0e0e0',
                      borderRadius: '8px',
                      color: '#1a1a1a',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                    formatter={(value, name, props) => [`${value} MMT`, props.payload.state]}
                  />
                  <Bar dataKey="production" fill="#d4a017" radius={[0, 4, 4, 0]}>
                    {stateData.corn.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#d4a017' : `rgba(212,160,23,${1 - index * 0.1})`} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>

              {/* State List */}
              <div style={{ marginTop: '16px' }}>
                {stateData.corn.slice(0, 5).map((state, i) => (
                  <div key={state.abbrev} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 0',
                    borderBottom: '1px solid #e8e8e8',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '3px',
                        background: `rgba(212,160,23,${1 - i * 0.15})`,
                      }} />
                      <span style={{ fontSize: '13px', color: '#333333' }}>{state.state}</span>
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: '#b8860b' }}>{state.production} MMT</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{
        marginTop: '32px',
        padding: '20px',
        background: '#f5f5f5',
        borderRadius: '12px',
        border: '1px solid #e0e0e0',
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px' }}>
          <div>
            <p style={{ margin: 0, fontSize: '12px', color: '#1a472a', fontWeight: '600' }}>
              CONAB Production Data
            </p>
            <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#666666' }}>
              portaldeinformacoes.conab.gov.br
            </p>
            <p style={{ margin: '2px 0 0', fontSize: '10px', color: '#888888' }}>
              SerieHistoricaGraos.txt · OfertaDemanda.txt
            </p>
          </div>
          <div>
            <p style={{ margin: 0, fontSize: '12px', color: '#1a472a', fontWeight: '600' }}>
              SECEX/MDIC Export Data
            </p>
            <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#666666' }}>
              comexstat.mdic.gov.br
            </p>
            <p style={{ margin: '2px 0 0', fontSize: '10px', color: '#888888' }}>
              Foreign Trade Statistics · Monthly Shipments
            </p>
          </div>
          <div>
            <p style={{ margin: 0, fontSize: '12px', color: '#1a472a', fontWeight: '600' }}>
              CONAB Price Data
            </p>
            <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#666666' }}>
              PrecosMensalUF.txt · PrecosSemanalUF.txt
            </p>
            <p style={{ margin: '2px 0 0', fontSize: '10px', color: '#888888' }}>
              Farm Gate & Port Prices · BRL/60kg bag
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
