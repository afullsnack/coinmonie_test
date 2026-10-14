import {
  createColumnHelper,
  metaHelper,
  tableFeatures,
  useTable,
} from '@tanstack/react-table'
import type { ColumnDef, RowData } from '@tanstack/react-table'
import { cn } from 'cn'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table'

type DataColumnMeta = {
  width?: string
  className?: string
  headerClassName?: string
}

export const dataTableFeatures = tableFeatures({
  columnMeta: metaHelper<DataColumnMeta>(),
})

type Features = typeof dataTableFeatures

export type DataColumn<TData extends RowData> = ColumnDef<Features, TData, any>

export function createDataColumns<TData extends RowData>() {
  return createColumnHelper<Features, TData>()
}

const TONES = {
  muted: {
    head: 'h-12 bg-[#1f1f1f] text-[#9a9a9a]',
    row: 'h-[64px]',
  },
  raised: {
    head: 'h-11 bg-[#2a2a2a] text-[#b5b5b5]',
    row: 'h-[68px]',
  },
} as const

export function DataTable<TData extends RowData>({
  columns,
  data,
  getRowId,
  onRowClick,
  tone = 'muted',
  className,
  rowClassName,
  footer,
  minWidth,
}: {
  columns: Array<DataColumn<TData>>
  data: Array<TData>
  getRowId?: (row: TData, index: number) => string
  onRowClick?: (row: TData) => void
  tone?: keyof typeof TONES
  className?: string
  rowClassName?: string
  footer?: React.ReactNode
  /** Below this width the table scrolls horizontally instead of squeezing columns. */
  minWidth?: number
}) {
  const table = useTable({
    features: dataTableFeatures,
    columns,
    data,
    getRowId,
  })
  const styles = TONES[tone]

  return (
    <div className={cn('min-w-0', className)}>
      <Table
        className="table-fixed border-separate border-spacing-0 text-sm"
        style={{ minWidth: minWidth ?? columns.length * 150 }}
      >
        <colgroup>
          {table.getAllLeafColumns().map((column) => (
            <col key={column.id} style={{ width: column.columnDef.meta?.width }} />
          ))}
        </colgroup>
        <TableHeader className="[&_tr]:border-0">
          {table.getHeaderGroups().map((group) => (
            <TableRow key={group.id} className="border-0 hover:bg-transparent">
              {group.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className={cn(
                    'px-4 font-normal first:rounded-l-[10px] last:rounded-r-[10px]',
                    styles.head,
                    header.column.columnDef.meta?.headerClassName,
                  )}
                >
                  {header.isPlaceholder ? null : <table.FlexRender header={header} />}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow
              key={row.id}
              tabIndex={onRowClick ? 0 : undefined}
              onClick={onRowClick ? () => onRowClick(row.original) : undefined}
              onKeyDown={
                onRowClick
                  ? (event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault()
                        onRowClick(row.original)
                      }
                    }
                  : undefined
              }
              className={cn(
                'border-0 hover:bg-transparent',
                onRowClick && 'cursor-pointer outline-none hover:bg-[#1c1c1c] focus-visible:bg-[#1c1c1c]',
                rowClassName,
              )}
            >
              {row.getAllCells().map((cell) => (
                <TableCell
                  key={cell.id}
                  className={cn(
                    'truncate border-b border-[#232323] px-4 text-[#e6e6e6]',
                    styles.row,
                    cell.column.columnDef.meta?.className,
                  )}
                >
                  <table.FlexRender cell={cell} />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {footer}
    </div>
  )
}
