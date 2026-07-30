import * as React from 'react'
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import type { UniqueIdentifier } from '@dnd-kit/core'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  IconChevronLeft,
  IconChevronRight,
  IconExternalLink,
  IconPlus,
} from '@tabler/icons-react'
import {
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import type {
  ColumnDef,
  ColumnFiltersState,
  Row,
  SortingState,
  VisibilityState,
} from '@tanstack/react-table'
import { z } from 'zod'
import { toast } from 'sonner'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { Label } from '#/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '#/components/ui/tabs'
import { Link } from '@tanstack/react-router'
import { cn } from '#/lib/utils'
import { getExplorerUrl } from '#/lib/explorer'

export const schema = z.object({
  // id: z.number(),
  date: z.string(),
  reference: z.string(),
  youWillSend: z.object({
    amount: z.number(),
    currency: z.string(),
  }),
  youWillReceive: z.object({
    amount: z.number(),
    currency: z.string(),
  }),
  status: z.string(),
  transactionHash: z.string().nullable(),
  asset: z.string().nullable(),
})

const columns: ColumnDef<z.infer<typeof schema>>[] = [
  // {
  //   id: "drag",
  //   header: () => null,
  // cell: ({ row }) => <DragHandle id={row.original.id} />,
  // },
  // {
  //   id: "select",
  //   header: ({ table }) => (
  //     <div className="flex items-center justify-center">
  //       <Checkbox
  //         checked={
  //           table.getIsAllPageRowsSelected() ||
  //           (table.getIsSomePageRowsSelected() && "indeterminate")
  //         }
  //         onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
  //         aria-label="Select all"
  //       />
  //     </div>
  //   ),
  //   cell: ({ row }) => (
  //     <div className="flex items-center justify-center">
  //       <Checkbox
  //         checked={row.getIsSelected()}
  //         onCheckedChange={(value) => row.toggleSelected(!!value)}
  //         aria-label="Select row"
  //       />
  //     </div>
  //   ),
  //   enableSorting: false,
  //   enableHiding: false,
  // },
  {
    accessorKey: 'date',
    header: () => (
      <span className="px-4 font-semibold justify-center">Date</span>
    ),
    cell: ({ row }) => {
      return <span className="lg:px-4 capitalize">{row.original.date}</span>
    },
    enableHiding: false,
  },
  {
    accessorKey: 'reference',
    header: () => (
      <span className="font-semibold justify-center">Reference</span>
    ),
    cell: ({ row }) => <span>{row.original.reference}</span>,
  },
	{
		id: 'send',
    accessorFn: (prop) => prop.youWillSend.currency,
    header: () => (
      <span className="font-semibold justify-center">You'll send</span>
    ),
    cell: ({ row }) => {
      return (
        <span>
          {row.original.youWillSend.amount.toLocaleString('en-US', {
            maximumFractionDigits: 0,
            minimumFractionDigits: 0,
          })}{' '}
          {row.original.youWillSend.currency}
        </span>
      )
    },
  },
	{
		id: 'receive',
		accessorFn: (prop) => prop.youWillReceive.currency,
		header: () => (
      <span className="font-semibold justify-center">You'll receive</span>
    ),
    cell: ({ row }) => {
      return (
        <span>
          {row.original.youWillReceive.amount.toLocaleString('en-US', {
            maximumFractionDigits: 0,
            minimumFractionDigits: 0,
          })}{' '}
          {row.original.youWillReceive.currency}
        </span>
      )
    },
  },
  {
    accessorKey: 'status',
    header: () => <div className="w-full text-left font-semibold">Status</div>,
    cell: ({ row }) => (
      <span
        className={cn('text-muted-foreground', {
          'text-green-500': row.original.status.toLowerCase() === 'completed',
        })}
      >
        {row.original.status}
      </span>
    ),
  },
  {
    accessorKey: 'transactionHash',
    header: () => <div className="w-full text-left font-semibold">Tx hash</div>,
    cell: ({ row }) => {
      const hash = row.original.transactionHash
      const explorerUrl = getExplorerUrl(row.original.asset, hash)
      if (!hash) return <span className="text-muted-foreground">—</span>
      return (
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              navigator.clipboard.writeText(hash)
              toast.success('Transaction hash copied')
            }}
            className="font-mono text-xs hover:text-accent transition-colors max-w-28 truncate block text-left"
          >
            {hash}
          </button>
          {explorerUrl && (
            <a
              href={explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-muted-foreground hover:text-accent transition-colors shrink-0"
              aria-label="View on block explorer"
            >
              <IconExternalLink className="size-3.5" />
            </a>
          )}
        </div>
      )
    },
  },
]

function DraggableRow({ row }: { row: Row<z.infer<typeof schema>> }) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: row.original.reference,
  })

  return (
    <TableRow
      data-state={row.getIsSelected() && 'selected'}
      data-dragging={isDragging}
      ref={setNodeRef}
      className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80 text-primary"
      style={{
        transform: CSS.Transform.toString(transform),
        transition: transition,
      }}
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id} className="px-4">
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  )
}

export function DataTable({
  data,
}: {
  data: z.infer<typeof schema>[]
}) {
  const [rowSelection, setRowSelection] = React.useState({})
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  )
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  })
  const sortableId = React.useId()
  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {}),
  )

  const dataIds = React.useMemo<UniqueIdentifier[]>(
    () => data.map(({ reference }) => reference),
    [data],
  )

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
    },
    getRowId: (row) => row.reference,
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  return (
    <Tabs
      defaultValue="outline"
      className="w-full flex-col justify-start gap-6"
    >
      <div className="flex items-center justify-between px-4 lg:px-6">
        <Label htmlFor="view-selector" className="sr-only">
          View
        </Label>
        <div />
        <TabsList className="hidden **:data-[slot=badge]:size-5 **:data-[slot=badge]:rounded-full **:data-[slot=badge]:bg-muted-foreground/30 **:data-[slot=badge]:px-1 @4xl/main:flex">
          <TabsTrigger value="outline">Outline</TabsTrigger>
          <TabsTrigger value="past-performance">
            Past Performance <Badge variant="secondary">3</Badge>
          </TabsTrigger>
          <TabsTrigger value="key-personnel">
            Key Personnel <Badge variant="secondary">2</Badge>
          </TabsTrigger>
          <TabsTrigger value="focus-documents">Focus Documents</TabsTrigger>
        </TabsList>
        <div className="flex items-center gap-2">
          <Button
            variant="default"
            size="sm"
            asChild
            className="bg-accent"
          >
            <Link to="/" preload="intent" className="no-underline">
              <IconPlus className="text-secondary" />
              <span className="hidden lg:inline text-secondary">
                New Transfer
              </span>
            </Link>
          </Button>
        </div>
      </div>
      <TabsContent
        value="outline"
        className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6"
      >
        <div className="overflow-hidden rounded-lg border">
          <DndContext
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis]}
            // onDragEnd={handleDragEnd}
            sensors={sensors}
            id={sortableId}
          >
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-muted">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead
                          key={header.id}
                          colSpan={header.colSpan}
                          className="text-primary"
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext(),
                              )}
                        </TableHead>
                      )
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody className="**:data-[slot=table-cell]:first:w-8">
                {table.getRowModel().rows.length ? (
                  <SortableContext
                    items={dataIds}
                    strategy={verticalListSortingStrategy}
                  >
                    {table.getRowModel().rows.map((row) => (
                      <DraggableRow key={row.id} row={row} />
                    ))}
                  </SortableContext>
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center text-primary"
                    >
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </DndContext>
        </div>
        {table.getPageCount() > 1 && (
          <div className="flex items-center justify-between px-4">
            <div className="text-sm font-medium text-muted-foreground">
              Page {table.getState().pagination.pageIndex + 1} of{' '}
              {table.getPageCount()}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to previous page</span>
                <IconChevronLeft />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to next page</span>
                <IconChevronRight />
              </Button>
            </div>
          </div>
        )}
      </TabsContent>
    </Tabs>
  )
}

