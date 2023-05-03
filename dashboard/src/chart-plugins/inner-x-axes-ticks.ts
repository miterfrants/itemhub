import { Chart, Tick } from 'chart.js';

export const InnerXAxesTicks = {
    id: 'innerXAxesTicks',
    afterDraw: (chart: Chart, args: any, options: any) => {
        const { ctx } = chart;
        const xAxis = chart.scales.x;
        ctx.save();
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'left';
        ctx.fillStyle = 'rgba(34, 142, 149, 0.8)';
        ctx.font = '15px arial';

        xAxis.ticks
            .filter((tick) => tick.label !== '')
            .forEach((tick) => {
                ctx.save();
                const label: string = Array.isArray(tick.label)
                    ? tick.label[0]
                    : tick.label || '';
                const positionX = xAxis.getPixelForValue(tick.value);
                if (label.length > 5) {
                    ctx.save();
                    const metrics = ctx.measureText(label);
                    const targetPositionX = positionX + 5;
                    const targetPositionY = chart.scales.y.bottom - 10;
                    ctx.translate(
                        targetPositionX + metrics.width / 2,
                        targetPositionY
                    );
                    ctx.rotate(-Math.PI / 4);
                    ctx.translate(
                        -(targetPositionX + metrics.width / 2),
                        -targetPositionY
                    );
                    ctx.fillText(
                        label,
                        positionX + 5,
                        chart.scales.y.bottom - metrics.width / (2 ^ 0.5) - 10
                    );
                    ctx.restore();
                } else {
                    ctx.fillText(
                        label,
                        positionX + 5,
                        chart.scales.y.bottom - 10
                    );
                }
            });
        ctx.restore();
    },
};
