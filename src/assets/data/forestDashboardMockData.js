// assets/data/forestData.js

export const forestAreaData = {
  labels: ['2000', '2005', '2010', '2015', '2020'],
  datasets: [
    {
      label: 'Forest Area (in hectares)',
      data: [5000, 5200, 5300, 5400, 5500],
      fill: false,
      backgroundColor: 'rgba(75,192,192,0.2)',
      borderColor: 'rgba(75,192,192,1)',
    },
  ],
};

export const forestAreaOptions = {
  scales: {
    yAxes: [
      {
        ticks: {
          beginAtZero: true,
        },
      },
    ],
  },
};

export const treeSpeciesData = {
  labels: ['Gran', 'Furu', 'Lau'],
  datasets: [
    {
      label: '# av trær',
      data: [50, 30, 20],
      backgroundColor: [
        'rgba(255, 99, 132, 0.2)',
        'rgba(54, 162, 235, 0.2)',
        'rgba(255, 206, 86, 0.2)',
      ],
      borderColor: [
        'rgba(255, 99, 132, 1)',
        'rgba(54, 162, 235, 1)',
        'rgba(255, 206, 86, 1)',
      ],
      borderWidth: 1,
    },
  ],
};

export const treeSpeciesOptions = {
  scales: {
    yAxes: [
      {
        ticks: {
          beginAtZero: true,
        },
      },
    ],
  },
};

export const treesPerHectareData = {
  labels: ['2000', '2005', '2010', '2015', '2020'],
  datasets: [
    {
      label: 'Trees per Hectare',
      data: [100, 105, 110, 115, 120],
      fill: false,
      backgroundColor: 'rgba(153,102,255,0.2)',
      borderColor: 'rgba(153,102,255,1)',
    },
  ],
};

export const treesPerHectareOptions = {
  scales: {
    yAxes: [
      {
        ticks: {
          beginAtZero: true,
        },
      },
    ],
  },
};
