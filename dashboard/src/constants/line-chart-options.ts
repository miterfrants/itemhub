import { ChartOptions } from 'chart.js';

const lineChartOption: ChartOptions<'line'> = {
    layout: {
        padding: {
            bottom: -30,
            left: -30,
        },
        autoPadding: true,
    },
    interaction: {
        intersect: false,
        mode: 'nearest',
    },
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            display: false,
        },
        title: {
            display: true,
            text: '',
            padding: 20,
            font: {
                size: 24,
                weight: 'normal',
            },
        },
        tooltip: {
            callbacks: {
                title: (data: any[]) => {
                    const createdAt = new Date(data[0].label);
                    return createdAt
                        .toLocaleString()
                        .replace(/T/gi, ' ')
                        .replace(/Z/gi, ' ')
                        .replace(/\.000/gi, '');
                },
            },
        },
    },
    elements: {
        point: {
            radius: 0,
        },
    },
    scales: {
        x: {
            border: {
                display: false,
            },
            grid: {
                display: false,
            },
            ticks: {
                display: false,
            },
        },
        y: {
            border: {
                width: 0,
                display: false,
            },
            grid: {
                color: '#f0f1f3',
                z: -2,
                tickWidth: 0,
                drawTicks: false,
            },
            ticks: {
                display: false,
            },
        },
    },
};
export default lineChartOption;
