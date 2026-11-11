'use client';
import { useEffect, useRef, useState } from 'react';
import { Stage, Layer, Rect, Text, Line, Arrow, Circle, Group, Image as KImage } from 'react-konva';
import type Konva from 'konva';
import { useStrat } from '@/lib/store';
import { getMap } from '@/lib/maps';
import { initials } from '@/lib/operators';
import type { Item, Tool } from '@/lib/types';

const DRAW_TOOLS: Tool[] = ['path', 'arrow', 'rotation'];
const PLACE_TOOLS: Tool[] = ['operator', 'reinforce', 'breach', 'drone', 'note'];
const uid = () => crypto.randomUUID();

function useImg(src: string) {
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  useEffect(() => {
    setImg(null);
    const i = new window.Image();
    i.onload = () => setImg(i);
    i.src = src;
  }, [src]);
  return img;
}

type Props = { stageRef: React.RefObject<Konva.Stage>; readOnly?: boolean };

export default function StratCanvas({ stageRef, readOnly }: Props) {
  const { mapId, floorId, scene, tool, color, side, pending, add, update, remove } = useStrat();
  const map = getMap(mapId);
  const floor = map.floors.find((f) => f.id === floorId) ?? map.floors[0];
  const items = scene[floor.id] ?? [];
  const bg = useImg(floor.image);

  const box = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 800, h: 600 });
  const [draft, setDraft] = useState<Item | null>(null);
  const [view, setView] = useState({ x: 0, y: 0, scale: 1 });

  // acompanha o tamanho do container
  useEffect(() => {
    if (!box.current) return;
    const ro = new ResizeObserver(([e]) => setSize({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(box.current);
    return () => ro.disconnect();
  }, []);

  // enquadra o mapa ao trocar de mapa ou redimensionar
  useEffect(() => {
    const scale = Math.min(size.w / map.w, size.h / map.h) * 0.95;
    setView({ scale, x: (size.w - map.w * scale) / 2, y: (size.h - map.h * scale) / 2 });
  }, [map.id, size.w, size.h, map.w, map.h]);

  const onWheel = (e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    const stage = e.target.getStage()!;
    const p = stage.getPointerPosition()!;
    const k = e.evt.deltaY > 0 ? 1 / 1.1 : 1.1;
    const scale = Math.min(4, Math.max(0.3, view.scale * k));
    const wx = (p.x - view.x) / view.scale;
    const wy = (p.y - view.y) / view.scale;
    setView({ scale, x: p.x - wx * scale, y: p.y - wy * scale });
  };

  const pointer = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) =>
    e.target.getStage()!.getRelativePointerPosition()!;

  const onDown = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    if (readOnly) return;
    const p = pointer(e);
    if (DRAW_TOOLS.includes(tool)) {
      setDraft({ id: uid(), type: tool as Item['type'], x: 0, y: 0, points: [p.x, p.y, p.x, p.y], color });
      return;
    }
    if (!PLACE_TOOLS.includes(tool)) return;
    if (tool === 'operator') {
      if (!pending) return;
      add({ id: uid(), type: 'operator', x: p.x, y: p.y, label: pending, side });
    } else if (tool === 'note') {
      const text = window.prompt('Texto da anotação:');
      if (text) add({ id: uid(), type: 'note', x: p.x, y: p.y, label: text, color });
    } else {
      add({ id: uid(), type: tool as Item['type'], x: p.x, y: p.y, rotation: 0 });
    }
  };

  const onMove = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    if (!draft?.points) return;
    const p = pointer(e);
    const pts = draft.points;
    setDraft({
      ...draft,
      points: draft.type === 'path' ? [...pts, p.x, p.y] : [pts[0], pts[1], p.x, p.y], // livre vs. reta
    });
  };

  const onUp = () => {
    if (draft && draft.points && draft.points.length >= 4) {
      const [x0, y0, x1, y1] = [draft.points[0], draft.points[1], draft.points.at(-2)!, draft.points.at(-1)!];
      if (Math.hypot(x1 - x0, y1 - y0) > 6) add(draft); // ignora cliques sem arrasto
    }
    setDraft(null);
  };

  const interactive = !readOnly;
  const common = (it: Item) => ({
    x: it.x,
    y: it.y,
    draggable: interactive && tool === 'select',
    onDragEnd: (e: Konva.KonvaEventObject<DragEvent>) => update(it.id, { x: e.target.x(), y: e.target.y() }),
    onClick: () => interactive && tool === 'erase' && remove(it.id),
    onTap: () => interactive && tool === 'erase' && remove(it.id),
  });

  const renderItem = (it: Item) => {
    switch (it.type) {
      case 'operator': {
        const c = it.side === 'def' ? '#3ea0d8' : '#e8553d';
        return (
          <Group key={it.id} {...common(it)}>
            <Circle radius={18} fill={c} stroke="#0b141b" strokeWidth={3} />
            <Text text={initials(it.label ?? '?')} fontSize={13} fontStyle="bold" fill="#fff" x={-12} y={-6} width={24} align="center" />
            <Text text={it.label} fontSize={11} fill="#d7e4ec" x={-40} y={22} width={80} align="center" />
          </Group>
        );
      }
      case 'path':
        return <Line key={it.id} {...common(it)} points={it.points} stroke={it.color} strokeWidth={4} tension={0.4} lineCap="round" lineJoin="round" hitStrokeWidth={16} />;
      case 'arrow':
        return <Arrow key={it.id} {...common(it)} points={it.points!} stroke={it.color} fill={it.color} strokeWidth={4} pointerLength={14} pointerWidth={14} hitStrokeWidth={16} />;
      case 'rotation':
        return <Arrow key={it.id} {...common(it)} points={it.points!} stroke={it.color} fill={it.color} strokeWidth={3} dash={[10, 8]} pointerLength={12} pointerWidth={12} hitStrokeWidth={16} />;
      case 'reinforce':
        // parede reforçada: barra amarela. Duplo clique gira 90°.
        return (
          <Group key={it.id} {...common(it)} rotation={it.rotation ?? 0} onDblClick={() => interactive && update(it.id, { rotation: ((it.rotation ?? 0) + 90) % 360 })}>
            <Rect x={-36} y={-6} width={72} height={12} fill="#f2b134" stroke="#0b141b" strokeWidth={2} />
            <Line points={[-28, 6, -16, -6, -4, 6, 8, -6, 20, 6, 32, -6]} stroke="#0b141b" strokeWidth={2} listening={false} />
          </Group>
        );
      case 'breach':
        return (
          <Group key={it.id} {...common(it)}>
            <Circle radius={14} fill="#c0392b" stroke="#fff" strokeWidth={2} />
            <Text text="B" fontSize={14} fontStyle="bold" fill="#fff" x={-7} y={-7} width={14} align="center" />
          </Group>
        );
      case 'drone':
        return (
          <Group key={it.id} {...common(it)}>
            <Circle radius={11} fill="#16a085" stroke="#fff" strokeWidth={2} />
            <Text text="D" fontSize={12} fontStyle="bold" fill="#fff" x={-6} y={-6} width={12} align="center" />
          </Group>
        );
      case 'note':
        return <Text key={it.id} {...common(it)} text={it.label} fontSize={14} fill={it.color} padding={4} />;
    }
  };

  const cursor = tool === 'select' ? 'grab' : tool === 'erase' ? 'not-allowed' : 'crosshair';

  return (
    <div ref={box} className="h-full w-full" style={{ cursor }}>
      <Stage
        ref={stageRef}
        width={size.w}
        height={size.h}
        x={view.x}
        y={view.y}
        scaleX={view.scale}
        scaleY={view.scale}
        draggable={tool === 'select'}
        onDragEnd={(e) => e.target === e.target.getStage() && setView({ ...view, x: e.target.x(), y: e.target.y() })}
        onWheel={onWheel}
        onMouseDown={onDown}
        onTouchStart={onDown}
        onMouseMove={onMove}
        onTouchMove={onMove}
        onMouseUp={onUp}
        onTouchEnd={onUp}
      >
        <Layer listening={false}>
          <Rect width={map.w} height={map.h} fill="#0b141b" />
          {bg && <KImage image={bg} width={map.w} height={map.h} />}
        </Layer>
        <Layer>
          {items.map(renderItem)}
          {draft && renderItem(draft)}
        </Layer>
      </Stage>
    </div>
  );
}
