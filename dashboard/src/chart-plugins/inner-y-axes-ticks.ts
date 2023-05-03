import { Chart, Tick } from 'chart.js';

export const InnerYAxesTicks = {
    id: 'innerYAxesTicks',
    afterDraw: (chart: Chart, args: any, options: any) => {
        const { ctx } = chart;
        const yAxis = chart.scales.y;
        const minTicks: Tick = yAxis.ticks[1];
        const maxTicks: Tick = yAxis.ticks[yAxis.ticks.length - 1];
        const minPostion = yAxis.getPixelForValue(minTicks.value) || 0;
        const maxPostion = yAxis.getPixelForValue(maxTicks.value) || 0;

        ctx.save();
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'left';
        ctx.fillStyle = 'rgba(34, 142, 149, 0.8)';
        ctx.font = '15px arial';
        const min = minTicks?.value.toString() || '';
        ctx.fillText(min, 10, minPostion);

        const max = maxTicks?.value.toString() || '';
        ctx.fillText(max, 10, maxPostion);
        ctx.restore();
    },
};
