'use client';

import * as React from 'react';
import { Label, Pie, PieChart, Sector } from 'recharts';
import type { PieSectorDataItem } from 'recharts/types/polar/Pie';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { type ChartConfig, ChartContainer, ChartStyle, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ExternalLink } from 'lucide-react';
import Link from 'next/link';

export interface ChartDataItem {
    key: string;
    label: string;
    value: number;
    fill: string;
}

export interface PieChartInteractiveProps {
    id: string;
    cardTitle: string;
    cardDescription: string;
    chartLabel: string;
    data: ChartDataItem[];
    chartConfig: ChartConfig;
    link?: string;
}

export function PieChartInteractive({ id, cardTitle, cardDescription, chartLabel, data, chartConfig, link }: PieChartInteractiveProps) {
    const [activeItem, setActiveItem] = React.useState(data[0]?.key || '');

    const activeIndex = React.useMemo(() => data.findIndex((item) => item.key === activeItem), [activeItem, data]);

    const itemKeys = React.useMemo(() => data.map((item) => item.key), [data]);

    // Update activeItem when data changes
    React.useEffect(() => {
        if (data.length > 0 && !data.find((item) => item.key === activeItem)) {
            setActiveItem(data[0].key);
        }
    }, [data, activeItem]);

    if (!data || data.length === 0) {
        return (
            <Card data-chart={id} className='flex flex-col'>
                <CardHeader>
                    <CardTitle>{cardTitle}</CardTitle>
                    <CardDescription>{cardDescription}</CardDescription>
                </CardHeader>
                <CardContent className='flex flex-1 items-center justify-center'>
                    <p className='text-muted-foreground'>No data available</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card data-chart={id} className='flex flex-col'>
            <ChartStyle id={id} config={chartConfig} />
            <CardHeader className='flex-row items-start space-y-0 pb-0'>
                <div className='grid gap-1'>
                    <CardTitle>{cardTitle}</CardTitle>
                    <CardDescription>{cardDescription}</CardDescription>
                    {link && (
                        <div className='flex items-end text-muted-foreground text-xs'>
                            {link && (
                                <Link href={link}>
                                    <div className='flex items-center text-primary'>
                                        <ExternalLink className='mr-1 h-3 w-3' />
                                        <span>View details</span>
                                    </div>
                                </Link>
                            )}
                        </div>
                    )}
                </div>
                <Select value={activeItem} onValueChange={setActiveItem}>
                    <SelectTrigger className='ml-auto h-7 w-[130px] rounded-lg pl-2.5' aria-label='Select a value'>
                        <SelectValue placeholder='Select item' />
                    </SelectTrigger>
                    <SelectContent align='end' className='rounded-xl'>
                        {itemKeys.map((key) => {
                            const config = chartConfig[key as keyof typeof chartConfig];
                            const dataItem = data.find((item) => item.key === key);

                            if (!config || !dataItem) {
                                return null;
                            }

                            return (
                                <SelectItem key={key} value={key} className='rounded-lg [&_span]:flex'>
                                    <div className='flex items-center gap-2 text-xs'>
                                        <span
                                            className='flex h-3 w-3 shrink-0 rounded-sm'
                                            style={{
                                                backgroundColor: `var(--color-${key})`
                                            }}
                                        />
                                        {dataItem.label}
                                    </div>
                                </SelectItem>
                            );
                        })}
                    </SelectContent>
                </Select>
            </CardHeader>
            <CardContent className='flex flex-1 justify-center pb-0'>
                <ChartContainer id={id} config={chartConfig} className='mx-auto aspect-square w-full max-w-[300px]'>
                    <PieChart>
                        <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                        <Pie
                            data={data.map((item) => ({
                                ...item,
                                name: item.key,
                                value: item.value
                            }))}
                            dataKey='value'
                            nameKey='name'
                            innerRadius={70}
                            strokeWidth={5}
                            activeIndex={activeIndex}
                            activeShape={({ outerRadius = 0, ...props }: PieSectorDataItem) => (
                                <g>
                                    <Sector {...props} outerRadius={outerRadius + 10} />
                                    <Sector {...props} outerRadius={outerRadius + 25} innerRadius={outerRadius + 12} />
                                </g>
                            )}>
                            <Label
                                content={({ viewBox }) => {
                                    if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                                        const activeData = data[activeIndex];
                                        return (
                                            <text x={viewBox.cx} y={viewBox.cy} textAnchor='middle' dominantBaseline='middle'>
                                                <tspan x={viewBox.cx} y={viewBox.cy} className='fill-foreground font-bold text-3xl'>
                                                    {activeData?.value?.toLocaleString() || '0'}
                                                </tspan>
                                                <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 24} className='fill-muted-foreground'>
                                                    {chartLabel}
                                                </tspan>
                                            </text>
                                        );
                                    }
                                }}
                            />
                        </Pie>
                    </PieChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}
