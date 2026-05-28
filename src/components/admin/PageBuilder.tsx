'use client';

import { useState, useCallback } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  PointerSensorOptions,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Image,
  LayoutGrid,
  MousePointerClick,
  Quote,
  Images,
  Type,
  MoveVertical,
  Minus,
  Package,
  HelpCircle,
  GripVertical,
  Pencil,
  Trash2,
  Plus,
  ChevronDown,
  ChevronUp,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { PageBlock, BlockType } from '@/lib/page-blocks';
import { BLOCK_DEFAULTS, createBlock } from '@/lib/page-blocks';

const BLOCK_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  hero: Image,
  features: LayoutGrid,
  cta: MousePointerClick,
  testimonials: Quote,
  'image-gallery': Images,
  text: Type,
  spacer: MoveVertical,
  divider: Minus,
  products: Package,
  faq: HelpCircle,
};

interface PageBuilderProps {
  blocks: PageBlock[];
  onChange: (blocks: PageBlock[]) => void;
}

// Sortable block card
function SortableBlockCard({
  block,
  index,
  total,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
}: {
  block: PageBlock;
  index: number;
  total: number;
  onEdit: (block: PageBlock) => void;
  onDelete: (block: PageBlock) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const Icon = BLOCK_ICONS[block.type] || Type;
  const defaults = BLOCK_DEFAULTS[block.type];

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-stretch gap-2 rounded-lg border bg-card p-3 shadow-sm"
    >
      {/* Drag Handle */}
      <div
        className="flex items-center cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-5 w-5" />
      </div>

      {/* Block Info */}
      <div className="flex flex-1 items-center gap-3 min-w-0">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted">
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">{defaults.label}</p>
          <p className="text-xs text-muted-foreground">#{index + 1}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => onMoveUp(index)}
          disabled={index === 0}
        >
          <ChevronUp className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => onMoveDown(index)}
          disabled={index === total - 1}
        >
          <ChevronDown className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => onEdit(block)}
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
          onClick={() => onDelete(block)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// Block edit dialog
function BlockEditDialog({
  block,
  open,
  onClose,
  onSave,
}: {
  block: PageBlock | null;
  open: boolean;
  onClose: () => void;
  onSave: (block: PageBlock) => void;
}) {
  const [localData, setLocalData] = useState<Record<string, unknown>>({});

  const handleOpen = (blk: PageBlock | null) => {
    if (blk) {
      setLocalData({ ...blk.data });
    }
  };

  const handleSave = () => {
    if (!block) return;
    onSave({ ...block, data: { ...localData } });
  };

  const updateField = (key: string, value: unknown) => {
    setLocalData(prev => ({ ...prev, [key]: value }));
  };

  if (!block) return null;

  const defaults = BLOCK_DEFAULTS[block.type];

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (isOpen) handleOpen(block);
        else onClose();
      }}
    >
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Edit {defaults.label}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[calc(90vh-140px)] pr-4">
          <div className="grid gap-4 py-4">
            {/* Common fields based on block type */}
            {block.type === 'hero' && (
              <>
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={(localData.title as string) || ''}
                    onChange={(e) => updateField('title', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Subtitle</Label>
                  <Input
                    value={(localData.subtitle as string) || ''}
                    onChange={(e) => updateField('subtitle', e.target.value)}
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Button Text</Label>
                    <Input
                      value={(localData.buttonText as string) || ''}
                      onChange={(e) => updateField('buttonText', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Button Link</Label>
                    <Input
                      value={(localData.buttonLink as string) || ''}
                      onChange={(e) => updateField('buttonLink', e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Background Image URL</Label>
                  <Input
                    value={(localData.backgroundImage as string) || ''}
                    onChange={(e) => updateField('backgroundImage', e.target.value)}
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Height</Label>
                    <select
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors"
                      value={(localData.height as string) || 'medium'}
                      onChange={(e) => updateField('height', e.target.value)}
                    >
                      <option value="small">Small</option>
                      <option value="medium">Medium</option>
                      <option value="large">Large</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Alignment</Label>
                    <select
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors"
                      value={(localData.alignment as string) || 'center'}
                      onChange={(e) => updateField('alignment', e.target.value)}
                    >
                      <option value="left">Left</option>
                      <option value="center">Center</option>
                      <option value="right">Right</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            {block.type === 'features' && (
              <>
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={(localData.title as string) || ''}
                    onChange={(e) => updateField('title', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Columns</Label>
                  <select
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors"
                    value={(localData.columns as number) || 3}
                    onChange={(e) => updateField('columns', Number(e.target.value))}
                  >
                    <option value={2}>2</option>
                    <option value={3}>3</option>
                    <option value={4}>4</option>
                  </select>
                </div>
                <Separator />
                <Label className="text-base font-semibold">Features</Label>
                {((localData.features as Array<{ title: string; description: string; icon: string }>) || []).map((f, i) => (
                  <Card key={i} className="p-4 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Feature {i + 1}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-rose-600"
                        onClick={() => {
                          const feats = [...((localData.features as Array<unknown>) || [])];
                          feats.splice(i, 1);
                          updateField('features', feats);
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                    <Input
                      placeholder="Title"
                      value={f.title}
                      onChange={(e) => {
                        const feats = [...((localData.features as Array<Record<string, string>>) || [])];
                        feats[i] = { ...feats[i], title: e.target.value };
                        updateField('features', feats);
                      }}
                    />
                    <Input
                      placeholder="Description"
                      value={f.description}
                      onChange={(e) => {
                        const feats = [...((localData.features as Array<Record<string, string>>) || [])];
                        feats[i] = { ...feats[i], description: e.target.value };
                        updateField('features', feats);
                      }}
                    />
                    <Input
                      placeholder="Icon name (e.g. Star, Heart)"
                      value={f.icon}
                      onChange={(e) => {
                        const feats = [...((localData.features as Array<Record<string, string>>) || [])];
                        feats[i] = { ...feats[i], icon: e.target.value };
                        updateField('features', feats);
                      }}
                    />
                  </Card>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const feats = [...((localData.features as Array<Record<string, string>>) || []), { title: 'New Feature', description: '', icon: 'Star' }];
                    updateField('features', feats);
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Feature
                </Button>
              </>
            )}

            {block.type === 'cta' && (
              <>
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={(localData.title as string) || ''}
                    onChange={(e) => updateField('title', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input
                    value={(localData.description as string) || ''}
                    onChange={(e) => updateField('description', e.target.value)}
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Button Text</Label>
                    <Input
                      value={(localData.buttonText as string) || ''}
                      onChange={(e) => updateField('buttonText', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Button Link</Label>
                    <Input
                      value={(localData.buttonLink as string) || ''}
                      onChange={(e) => updateField('buttonLink', e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Background Color</Label>
                  <select
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors"
                    value={(localData.backgroundColor as string) || 'emerald'}
                    onChange={(e) => updateField('backgroundColor', e.target.value)}
                  >
                    <option value="emerald">Emerald</option>
                    <option value="rose">Rose</option>
                    <option value="amber">Amber</option>
                    <option value="slate">Slate</option>
                  </select>
                </div>
              </>
            )}

            {block.type === 'testimonials' && (
              <>
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={(localData.title as string) || ''}
                    onChange={(e) => updateField('title', e.target.value)}
                  />
                </div>
                <Separator />
                <Label className="text-base font-semibold">Testimonials</Label>
                {((localData.testimonials as Array<Record<string, string>>) || []).map((t, i) => (
                  <Card key={i} className="p-4 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Testimonial {i + 1}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-rose-600"
                        onClick={() => {
                          const items = [...((localData.testimonials as Array<unknown>) || [])];
                          items.splice(i, 1);
                          updateField('testimonials', items);
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Input
                        placeholder="Name"
                        value={t.name}
                        onChange={(e) => {
                          const items = [...((localData.testimonials as Array<Record<string, string>>) || [])];
                          items[i] = { ...items[i], name: e.target.value };
                          updateField('testimonials', items);
                        }}
                      />
                      <Input
                        placeholder="Role"
                        value={t.role}
                        onChange={(e) => {
                          const items = [...((localData.testimonials as Array<Record<string, string>>) || [])];
                          items[i] = { ...items[i], role: e.target.value };
                          updateField('testimonials', items);
                        }}
                      />
                    </div>
                    <Textarea
                      placeholder="Quote"
                      rows={2}
                      value={t.quote}
                      onChange={(e) => {
                        const items = [...((localData.testimonials as Array<Record<string, string>>) || [])];
                        items[i] = { ...items[i], quote: e.target.value };
                        updateField('testimonials', items);
                      }}
                    />
                    <Input
                      placeholder="Avatar URL (optional)"
                      value={t.avatar}
                      onChange={(e) => {
                        const items = [...((localData.testimonials as Array<Record<string, string>>) || [])];
                        items[i] = { ...items[i], avatar: e.target.value };
                        updateField('testimonials', items);
                      }}
                    />
                  </Card>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const items = [...((localData.testimonials as Array<Record<string, string>>) || []), { name: 'Name', role: 'Role', quote: 'Quote', avatar: '' }];
                    updateField('testimonials', items);
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Testimonial
                </Button>
              </>
            )}

            {block.type === 'image-gallery' && (
              <>
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={(localData.title as string) || ''}
                    onChange={(e) => updateField('title', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Columns</Label>
                  <select
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors"
                    value={(localData.columns as number) || 3}
                    onChange={(e) => updateField('columns', Number(e.target.value))}
                  >
                    <option value={2}>2</option>
                    <option value={3}>3</option>
                    <option value={4}>4</option>
                  </select>
                </div>
                <Separator />
                <Label className="text-base font-semibold">Image URLs</Label>
                {((localData.images as string[]) || []).map((img, i) => (
                  <div key={i} className="flex gap-2">
                    <Input
                      placeholder="Image URL"
                      value={img}
                      onChange={(e) => {
                        const imgs = [...((localData.images as string[]) || [])];
                        imgs[i] = e.target.value;
                        updateField('images', imgs);
                      }}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 shrink-0 text-rose-600"
                      onClick={() => {
                        const imgs = [...((localData.images as string[]) || [])];
                        imgs.splice(i, 1);
                        updateField('images', imgs);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const imgs = [...((localData.images as string[]) || []), ''];
                    updateField('images', imgs);
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Image
                </Button>
              </>
            )}

            {block.type === 'text' && (
              <div className="space-y-2">
                <Label>HTML Content</Label>
                <Textarea
                  rows={12}
                  value={(localData.content as string) || ''}
                  onChange={(e) => updateField('content', e.target.value)}
                  placeholder="Enter HTML content..."
                />
                <p className="text-xs text-muted-foreground">
                  Supports HTML tags: &lt;p&gt;, &lt;h1&gt;-&lt;h6&gt;, &lt;strong&gt;, &lt;em&gt;, &lt;ul&gt;, &lt;li&gt;, &lt;a&gt;, etc.
                </p>
              </div>
            )}

            {block.type === 'spacer' && (
              <div className="space-y-2">
                <Label>Height (px)</Label>
                <Input
                  type="number"
                  min={8}
                  max={512}
                  value={(localData.height as number) || 64}
                  onChange={(e) => updateField('height', Number(e.target.value))}
                />
              </div>
            )}

            {block.type === 'divider' && (
              <div className="space-y-2">
                <Label>Style</Label>
                <select
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors"
                  value={(localData.style as string) || 'solid'}
                  onChange={(e) => updateField('style', e.target.value)}
                >
                  <option value="solid">Solid</option>
                  <option value="dashed">Dashed</option>
                  <option value="dotted">Dotted</option>
                </select>
              </div>
            )}

            {block.type === 'products' && (
              <>
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={(localData.title as string) || ''}
                    onChange={(e) => updateField('title', e.target.value)}
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Max Products</Label>
                    <Input
                      type="number"
                      min={1}
                      max={20}
                      value={(localData.maxProducts as number) || 6}
                      onChange={(e) => updateField('maxProducts', Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Layout</Label>
                    <select
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors"
                      value={(localData.layout as string) || 'grid'}
                      onChange={(e) => updateField('layout', e.target.value)}
                    >
                      <option value="grid">Grid</option>
                      <option value="list">List</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            {block.type === 'faq' && (
              <>
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={(localData.title as string) || ''}
                    onChange={(e) => updateField('title', e.target.value)}
                  />
                </div>
                <Separator />
                <Label className="text-base font-semibold">FAQ Items</Label>
                {((localData.items as Array<Record<string, string>>) || []).map((item, i) => (
                  <Card key={i} className="p-4 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Item {i + 1}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-rose-600"
                        onClick={() => {
                          const items = [...((localData.items as Array<unknown>) || [])];
                          items.splice(i, 1);
                          updateField('items', items);
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                    <Input
                      placeholder="Question"
                      value={item.question}
                      onChange={(e) => {
                        const items = [...((localData.items as Array<Record<string, string>>) || [])];
                        items[i] = { ...items[i], question: e.target.value };
                        updateField('items', items);
                      }}
                    />
                    <Textarea
                      placeholder="Answer"
                      rows={2}
                      value={item.answer}
                      onChange={(e) => {
                        const items = [...((localData.items as Array<Record<string, string>>) || [])];
                        items[i] = { ...items[i], answer: e.target.value };
                        updateField('items', items);
                      }}
                    />
                  </Card>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const items = [...((localData.items as Array<Record<string, string>>) || []), { question: '', answer: '' }];
                    updateField('items', items);
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Question
                </Button>
              </>
            )}
          </div>
        </ScrollArea>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function PageBuilder({ blocks, onChange }: PageBuilderProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const [editingBlock, setEditingBlock] = useState<PageBlock | null>(null);
  const [deleteBlock, setDeleteBlock] = useState<PageBlock | null>(null);

  const handleAddBlock = useCallback((type: BlockType) => {
    const newBlock = createBlock(type);
    onChange([...blocks, newBlock]);
  }, [blocks, onChange]);

  const handleDeleteBlock = useCallback(() => {
    if (!deleteBlock) return;
    onChange(blocks.filter((b) => b.id !== deleteBlock.id));
    setDeleteBlock(null);
  }, [blocks, deleteBlock, onChange]);

  const handleEditSave = useCallback((updatedBlock: PageBlock) => {
    onChange(blocks.map((b) => (b.id === updatedBlock.id ? updatedBlock : b)));
    setEditingBlock(null);
  }, [blocks, onChange]);

  const handleMoveUp = useCallback((index: number) => {
    if (index <= 0) return;
    const newBlocks = [...blocks];
    [newBlocks[index - 1], newBlocks[index]] = [newBlocks[index], newBlocks[index - 1]];
    onChange(newBlocks);
  }, [blocks, onChange]);

  const handleMoveDown = useCallback((index: number) => {
    if (index >= blocks.length - 1) return;
    const newBlocks = [...blocks];
    [newBlocks[index], newBlocks[index + 1]] = [newBlocks[index + 1], newBlocks[index]];
    onChange(newBlocks);
  }, [blocks, onChange]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = blocks.findIndex((b) => b.id === active.id);
      const newIndex = blocks.findIndex((b) => b.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        const newBlocks = [...blocks];
        const [moved] = newBlocks.splice(oldIndex, 1);
        newBlocks.splice(newIndex, 0, moved);
        onChange(newBlocks);
      }
    }
  }, [blocks, onChange]);

  const blockTypes = Object.keys(BLOCK_DEFAULTS) as BlockType[];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
      {/* Sidebar: Add Block Panel */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Add Block</h3>
        <p className="text-sm text-muted-foreground">Click to add a block to the end</p>
        <ScrollArea className="h-[calc(100vh-320px)]">
          <div className="space-y-2 pr-4">
            {blockTypes.map((type) => {
              const defaults = BLOCK_DEFAULTS[type];
              const Icon = BLOCK_ICONS[type] || Type;
              return (
                <button
                  key={type}
                  className="flex w-full items-center gap-3 rounded-lg border bg-card p-3 text-left hover:bg-accent/50 transition-colors"
                  onClick={() => handleAddBlock(type)}
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-emerald-100 dark:bg-emerald-900/30">
                    <Icon className="h-4 w-4 text-emerald-600" />
                  </div>
                  <span className="text-sm font-medium">{defaults.label}</span>
                </button>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      {/* Main: Block List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            Page Blocks
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              ({blocks.length})
            </span>
          </h3>
          {blocks.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
              onClick={() => onChange([])}
            >
              Clear All
            </Button>
          )}
        </div>

        {blocks.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
            <LayoutGrid className="h-10 w-10 text-muted-foreground/50" />
            <h4 className="mt-4 text-lg font-medium">No blocks yet</h4>
            <p className="mt-1 text-sm text-muted-foreground">
              Click a block type from the left panel to start building your page
            </p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={blocks.map((b) => b.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {blocks.map((block, index) => (
                  <SortableBlockCard
                    key={block.id}
                    block={block}
                    index={index}
                    total={blocks.length}
                    onEdit={setEditingBlock}
                    onDelete={setDeleteBlock}
                    onMoveUp={handleMoveUp}
                    onMoveDown={handleMoveDown}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* Edit Dialog */}
      <BlockEditDialog
        block={editingBlock}
        open={!!editingBlock}
        onClose={() => setEditingBlock(null)}
        onSave={handleEditSave}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteBlock} onOpenChange={() => setDeleteBlock(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Block</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this block? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteBlock}
              className="bg-rose-600 hover:bg-rose-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
