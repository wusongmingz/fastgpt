import React, { useState, useMemo } from 'react';
import {
  Column,
  ColumnDef,
  OnChangeFn,
  PaginationState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable
} from '@tanstack/react-table';
import {
  Table,
  Tbody,
  Th,
  Thead,
  Tr,
  Td,
  Box,
  Flex,
  TableContainer,
  Button,
  TableProps,
  ButtonProps,
  Spinner
} from '@chakra-ui/react';
import { Select } from 'chakra-react-select';

interface ATableProps<T extends object> extends TableProps {
  data: T[];
  columns: ColumnDef<T, any>[];
  pagination?: boolean;
  paginationOptions?: PaginationOptions;
  align?: 'left' | 'right' | 'center';
  loading?: boolean;
}

interface PaginationOptions {
  current?: number;
  pageSize?: number;
  defaultPageSize?: number;
  defaultCurrent?: number;
  pageSizeOptions?: number[];
  hideOnSinglePage?: boolean;
  showTotal?: boolean;
  btnStyle?: ButtonProps;
  onChange?: (page: number, pageSize: number) => void;
  onPageSizeChange?: (current: number, pageSize: number) => void;
}

const defaultPageSizeOptions = [10, 20, 50, 100];

const defaultPaginationBtnStyle: ButtonProps = {
  w: '2rem',
  h: '2rem',
  minH: '2rem',
  minW: '2rem',
  rounded: 'full',
  bgColor: '#EDEFF3',
  color: 'primary.500',
  _hover: { color: '#fff', bgColor: 'primary.500' }
};

const defaultPaginationOptions: PaginationOptions = {
  defaultPageSize: 10,
  defaultCurrent: 1,
  pageSizeOptions: defaultPageSizeOptions,
  hideOnSinglePage: false,
  showTotal: true,
  btnStyle: defaultPaginationBtnStyle
};

function ATable<T extends object>({
  data,
  columns,
  pagination = true,
  paginationOptions,
  align = 'center',
  loading = false,
  children,
  ...props
}: ATableProps<T>) {
  const {
    current,
    pageSize,
    defaultCurrent,
    defaultPageSize,
    pageSizeOptions = defaultPageSizeOptions,
    showTotal = true,
    hideOnSinglePage = false,
    btnStyle = {},
    onChange,
    onPageSizeChange
  } = paginationOptions ?? defaultPaginationOptions;

  const [paginationState, setPaginationState] = useState<PaginationState>({
    pageIndex: (current ?? defaultCurrent ?? 1) - 1,
    pageSize: pageSize ?? defaultPageSize ?? pageSizeOptions[0]
  });

  const pageSizeSelectOptionList = pageSizeOptions.map((size) => ({
    value: size,
    label: size.toString()
  }));

  const showPagination = useMemo(() => {
    return pagination && (!hideOnSinglePage || data.length > paginationState.pageSize);
  }, [pagination, data, paginationState.pageSize]);

  const paginationBtnStyle = useMemo(
    () => ({ ...defaultPaginationBtnStyle, ...btnStyle }),
    [btnStyle]
  );

  const onPaginationChange: OnChangeFn<PaginationState> = (newPaginationState) => {
    if (typeof newPaginationState === 'function') {
      const { pageIndex, pageSize } = newPaginationState(paginationState);
      onChange?.(pageIndex + 1, pageSize);
      onPageSizeChange?.(pageIndex + 1, pageSize);
      setPaginationState(newPaginationState);
    } else {
      const { pageIndex, pageSize } = newPaginationState;
      onChange?.(pageIndex + 1, pageSize);
      onPageSizeChange?.(pageIndex + 1, pageSize);
      setPaginationState(newPaginationState);
    }
  };

  const table = showPagination
    ? useReactTable({
        data,
        columns,
        rowCount: data.length,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onPaginationChange,
        state: {
          pagination: paginationState
        }
      })
    : useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel()
      });

  const renderPageNumbers = () => {
    const pageCount = table.getPageCount();
    const pageNumbers = [];
    const maxVisiblePages = 5; // 最多显示5个页码
    const currentPage = paginationState.pageIndex + 1;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(pageCount, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <Button
          key={i}
          {...paginationBtnStyle}
          onClick={() => {
            table.setPageIndex(i - 1);
          }}
          isDisabled={currentPage === i}
        >
          {i}
        </Button>
      );
    }

    return pageNumbers;
  };

  return (
    <>
      <TableContainer overflowY={'auto'} position={'relative'} h={loading ? '100%' : 'auto'}>
        <Table {...props}>
          <Thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <Tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <Th key={header.id} textAlign={align} bgColor={'#ECEFF6'}>
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </Th>
                  );
                })}
              </Tr>
            ))}
          </Thead>
          {loading ? (
            <Spinner
              color="primary.500"
              size={props.size ?? ['md', 'lg']}
              position={'absolute'}
              top={'50%'}
              left={'50%'}
            />
          ) : (
            <Tbody>
              {table.getRowModel().rows.map((row) => (
                <Tr key={row.id} _hover={{ bgColor: '#ECEFF6' }}>
                  {row.getVisibleCells().map((cell) => {
                    return (
                      <Td key={cell.id} textAlign={align}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </Td>
                    );
                  })}
                </Tr>
              ))}
            </Tbody>
          )}
        </Table>
      </TableContainer>
      {/* 分页器 */}
      {showPagination && (
        <Flex justifyContent={'flex-end'} alignItems={'center'} gap={2} my={4}>
          <Button
            {...defaultPaginationBtnStyle}
            onClick={() => table.firstPage()}
            isDisabled={!table.getCanPreviousPage()}
          >
            {'<<'}
          </Button>
          <Button
            {...paginationBtnStyle}
            onClick={() => table.previousPage()}
            isDisabled={!table.getCanPreviousPage()}
          >
            {'<'}
          </Button>
          {renderPageNumbers()}
          <Button
            {...paginationBtnStyle}
            onClick={() => table.nextPage()}
            isDisabled={!table.getCanNextPage()}
          >
            {'>'}
          </Button>
          <Button
            {...paginationBtnStyle}
            onClick={() => table.lastPage()}
            isDisabled={!table.getCanNextPage()}
          >
            {'>>'}
          </Button>
          <Select
            size={'sm'}
            menuPlacement="auto"
            options={pageSizeSelectOptionList}
            defaultValue={pageSizeSelectOptionList[0]}
            onChange={(val) => {
              setPaginationState({
                ...paginationState,
                pageSize: val!.value,
                pageIndex: 0
              });
            }}
          />
          {showTotal && <Box px={2}>共{table.getPageCount().toLocaleString()}页</Box>}
        </Flex>
      )}
    </>
  );
}

export default ATable;
export * from '@tanstack/react-table';
