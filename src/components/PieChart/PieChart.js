import { ArcElement, Chart } from 'chart.js';
import 'chart.js/auto';
import { Pie } from 'react-chartjs-2';

Chart.register(ArcElement);

const PieChart = () => {
  const data = {
    labels: ['Lau', 'Gran', 'Furu'],
    datasets: [
      {
        data: [20, 50, 30],
        backgroundColor: ['#f9e076', '#83c9a1', '#60a3d9'],
        borderColor: ['black'],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          font: {
            size: 16,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            let label = context.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed !== null) {
              label += `${context.parsed}%`;
            }
            return label;
          },
        },
      },
      // Custom plugin to display labels inside the chart
      datalabels: {
        display: true,
        color: 'white',
        formatter: (value, context) => {
          return `${context.chart.data.labels[context.dataIndex]} - ${value}%`;
        },
      },
    },
  };

  // Include the datalabels plugin
  const plugins = [
    {
      id: 'labels',
      beforeDraw: (chart) => {
        const ctx = chart.ctx;
        ctx.save();

        chart.data.datasets.forEach((dataset, i) => {
          chart.getDatasetMeta(i).data.forEach((datapoint, index) => {
            const { x, y, startAngle, endAngle, innerRadius, outerRadius } =
              datapoint;
            const midAngle = startAngle + (endAngle - startAngle) / 2;
            const textX = Math.round(
              ((outerRadius + innerRadius) / 2) * Math.cos(midAngle) + x
            );
            const textY = Math.round(
              ((outerRadius + innerRadius) / 2) * Math.sin(midAngle) + y
            );
            const text = `${dataset.data[index]}%`;

            ctx.fillStyle = 'white'; // or any color you need
            ctx.font = '16px Arial'; // adjust the font size and style
            ctx.textAlign = 'center';
            ctx.fillText(text, textX, textY);
          });
        });

        ctx.restore();
      },
    },
  ];

  return <Pie data={data} options={options} plugins={plugins} />;
};

export default PieChart;
