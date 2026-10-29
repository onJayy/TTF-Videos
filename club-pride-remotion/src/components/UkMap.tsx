import React, {useEffect, useLayoutEffect, useRef, useState} from 'react';
import {continueRender, delayRender, staticFile} from 'remotion';
import {BRAND, H, W} from '../brand';

// Same projection the map data was prepared with (km, equirectangular around 53°N, 1.5°W)
const LAT0 = 53.0, LON0 = -1.5, KX = 111.32 * Math.cos((LAT0 * Math.PI) / 180), KY = 110.57;
export const toKm = (lat: number, lon: number): [number, number] => [(lon - LON0) * KX, -(lat - LAT0) * KY];

export type MapView = {cx: number; cy: number; scale: number; screenY?: number}; // centre (km) + px per km
export const project = (v: MapView, x: number, y: number): [number, number] => [(x - v.cx) * v.scale + W / 2, (y - v.cy) * v.scale + (v.screenY ?? H / 2)];

type MapData = {land: number[][][]; urban: number[][][]; lakes: number[][][]; rivers: number[][][]; roads: {m: number; c: number[][]}[]};
let cache: MapData | null = null;

export const useMapData = () => {
  const [data, setData] = useState<MapData | null>(cache);
  const [handle] = useState(() => (cache ? null : delayRender('Loading UK map')));
  useEffect(() => {
    if (cache) return;
    fetch(staticFile('map-uk.json'))
      .then((r) => r.json())
      .then((d) => {
        cache = d;
        setData(d);
        if (handle !== null) continueRender(handle);
      });
  }, [handle]);
  return data;
};

/** Flat Google-Maps-style UK map drawn on a canvas for the given view. */
export const UkMap: React.FC<{view: MapView}> = ({view}) => {
  const data = useMapData();
  const ref = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => {
    const cv = ref.current;
    if (!cv || !data) return;
    const ctx = cv.getContext('2d')!;
    const P = (p: number[]) => project(view, p[0], p[1]);
    const poly = (pts: number[][]) => {
      const a = P(pts[0]);
      ctx.moveTo(a[0], a[1]);
      for (let i = 1; i < pts.length; i++) {
        const b = P(pts[i]);
        ctx.lineTo(b[0], b[1]);
      }
    };
    ctx.fillStyle = BRAND.map.water;
    ctx.fillRect(0, 0, W, H);
    ctx.beginPath();
    data.land.forEach((p) => { poly(p); ctx.closePath(); });
    ctx.fillStyle = BRAND.map.land;
    ctx.fill();
    ctx.beginPath();
    data.urban.forEach((p) => { poly(p); ctx.closePath(); });
    ctx.fillStyle = BRAND.map.urban;
    ctx.fill();
    ctx.beginPath();
    data.lakes.forEach((p) => { poly(p); ctx.closePath(); });
    ctx.fillStyle = BRAND.map.water;
    ctx.fill();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    const k = Math.max(1, view.scale / 3);
    ctx.beginPath();
    data.rivers.forEach((p) => poly(p));
    ctx.strokeStyle = BRAND.map.river;
    ctx.lineWidth = 1.4 * k;
    ctx.stroke();
    ctx.beginPath();
    data.roads.filter((r) => !r.m).forEach((r) => poly(r.c));
    ctx.strokeStyle = BRAND.map.road;
    ctx.lineWidth = 1.6 * k;
    ctx.stroke();
    ctx.beginPath();
    data.roads.filter((r) => r.m).forEach((r) => poly(r.c));
    ctx.strokeStyle = BRAND.map.major;
    ctx.lineWidth = 2.6 * k;
    ctx.stroke();
  }, [data, view.cx, view.cy, view.scale, view.screenY]);
  return <canvas ref={ref} width={W} height={H} style={{position: 'absolute', left: 0, top: 0}} />;
};
