import MyInput from '@/components/MyInput';
import MyIcon from '@fastgpt/web/components/common/Icon';
import { Box, Flex } from '@chakra-ui/react';
import ATable, { ColumnDef } from '@/components/common/ATable';
import React, { useEffect, useMemo, useState } from 'react';
import AIcon from '@/components/AIcon/AIcon';
import { formatTime2YMDHMS } from '@fastgpt/global/common/string/time';
import { debounce } from 'lodash';

interface Props<T> {
  data: T[];
  type: 'team' | 'user';
  loading?: boolean;
  Action: React.FC<{ record: T }>;
  onSearch: (searchText: string) => Promise<T[]> | T[];
}

function Table<T extends object>({ data, type, loading, Action, onSearch }: Props<T>) {
  const [searchText, setSearchText] = useState('');
  const [tableData, setTableData] = useState(data);
  const typeMap: Record<'team' | 'user', Record<string, string>> = {
    team: {
      name: '成员名称',
      role: '关联角色',
      action: '操作'
    },
    user: {
      username: '用户名称',
      // phone: '手机号码',
      // email: '邮箱',
      // password: '登录密码',
      groups: '所属团队',
      createTime: '创建时间',
      action: '操作'
    }
  };

  useEffect(() => {
    setTableData(data);
  }, [data]);

  const columns = useMemo<ColumnDef<T>[]>(
    () =>
      Object.keys(typeMap[type]).map((key) => {
        if (key === 'createTime') {
          return {
            accessorKey: key,
            header: typeMap[type][key],
            // cell: (info) => formatTime2YMDHMS(info.getValue() as Date)
            cell: (info) => info.getValue()
          };
        }
        if (key === 'action') {
          return {
            accessorKey: key,
            header: typeMap[type][key],
            cell: (info) => Action({ record: info.row.original })
          };
        }
        if (key === 'groups') {
          return {
            accessorKey: key,
            header: () => typeMap[type][key],
            cell: (info) => (
              <Box textOverflow={'ellipsis'} overflow={'hidden'} whiteSpace={'nowrap'}>
                {(info.getValue() as any).map((group: any) => group.name).join('、')}
              </Box>
            )
          };
        }
        return {
          accessorKey: key,
          cell: (info) => info.getValue(),
          header: () => typeMap[type][key]
        };
      }),
    []
  );

  const debounceSearch = useMemo(() => {
    return debounce(
      async (searchText: string) => {
        const res = await onSearch(searchText);
        setTableData(res);
      },
      300,
      {
        trailing: true
      }
    );
  }, [onSearch]);

  return (
    <Flex flexDir={'column'} w={'100%'} h={'100%'}>
      <Flex
        borderTop={'1px'}
        borderBottom={'1px'}
        borderStyle={'solid'}
        borderColor={'borderColor.low'}
      >
        <Box
          py={'2px'}
          flex={'1 1 200px'}
          borderRight={'1px solid'}
          borderColor={'borderColor.low'}
        >
          <MyInput
            leftIcon={
              <MyIcon
                name="common/searchLight"
                position={'absolute'}
                w={'1.5rem'}
                color={'primary.500'}
              />
            }
            rightIcon={
              <AIcon
                name="icon-quxiao1"
                fontSize={'1.25rem'}
                color={'myGray.300'}
                cursor={'pointer'}
                onClick={() => {
                  setSearchText('');
                  setTableData(data);
                }}
              />
            }
            pl={'38px'}
            bg={'#fff'}
            border={'none'}
            color={'myGray.500'}
            w={'100%'}
            value={searchText}
            onChange={(e) => {
              setSearchText(e.target.value);
              debounceSearch(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                debounceSearch(searchText);
              }
            }}
          />
        </Box>
        <Box display={'flex'} alignItems={'center'} flex={2} flexBasis={'100px'} px={4}>
          {type === 'team' ? '成员数：' : '用户数：'}
          {data.length}
        </Box>
      </Flex>
      <Box flex={1} position={'relative'}>
        <ATable<T> columns={columns} data={tableData} loading={loading} />
      </Box>
    </Flex>
  );
}

export default Table;
