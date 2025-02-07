import { Flex, Box, HStack, Text, Input, InputGroup, InputLeftElement } from '@chakra-ui/react';
import MyIcon from '@fastgpt/web/components/common/Icon';
import AppListContextProvider, { AppListContext } from '../../../app/list/components/context';

import { Select } from 'chakra-react-select';
import { useRouter } from 'next/router';
import { useMemo } from 'react';
import { useContextSelector } from 'use-context-selector';
import AIcon from '@/components/AIcon/AIcon';
import { sortTypeEnum } from '@fastgpt/global/core/app/constants';
export type FilterProps = {
  selectWidth?: string;
  selectmargin?: string;
  filterButtonList: {
    name: string;
    isActive?: boolean;
    value: string;
    hoverBg?: string;
  }[];
};
export default function HeaderFilter({ filterButtonList }: FilterProps) {
  const { searchKey, setSearchKey, setSortType } = useContextSelector(AppListContext, (v) => v);
  const router = useRouter();

  const chakraStyles = {
    container: (prev: any) => ({
      ...prev,
      w: '240px',
      maxH: '32px'
    }),
    placeholder: (prev: any) => ({
      ...prev,
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis',
      overflow: 'hidden'
    }),
    option: (provided: any, { isSelected }: any) => ({
      ...provided,
      _hover: {
        color: '#d7000f',
        bg: '#f7f8fa'
      },
      backgroundColor: '#fff',
      ...(isSelected && {
        backgroundColor: '#fff',
        color: '#d7000f'
      })
    }),
    dropdownIndicator: (prev: any, { selectProps }: any) => ({
      ...prev,
      // w: '120px',

      '> svg': {
        transform: `rotate(${selectProps.menuIsOpen ? 90 : 0}deg)`,
        transition: 'transform 0.3s'
      }
    })
  };
  const RenderSearchInput = useMemo(
    () => (
      <InputGroup maxW={['auto', '350px']} mr={'15px'} size={'sm'}>
        <InputLeftElement h={'full'} alignItems={'center'} display={'flex'}>
          {/* <MyIcon name={'common/searchLight'} w={'1rem'} /> */}
          <AIcon name="icon-sousuo" color="#d7000f"></AIcon>
        </InputLeftElement>
        <Input
          value={searchKey}
          onChange={(e) => setSearchKey(e.target.value)}
          // placeholder={'请选择排序方式'}
          maxLength={30}
          bg={'white'}
        />
      </InputGroup>
    ),
    [searchKey, setSearchKey]
  );
  return (
    <Flex pl={'30px'} alignItems={'center'} w={'calc(100% - 140px)'} gap={3}>
      <HStack gap={'5px'} h={'30px'}>
        {filterButtonList.map((item) => {
          return (
            <>
              <Box
                key={item.value}
                textAlign={'center'}
                borderRadius={'md'}
                fontSize={'12px'}
                borderWidth={'1px'}
                minW={'80px'}
                minH={'30px'}
                lineHeight={'30px'}
                userSelect={'none'}
                cursor={'pointer'}
                _hover={{
                  bgColor: item.hoverBg ? item.hoverBg : 'rgb(236,239,246)'
                }}
                {...(router.query.type === item.value && {
                  bgColor: 'rgb(236,239,246)'
                })}
                {...(item.value == 'ALL' &&
                  !router.query.type && {
                    bgColor: 'rgb(236,239,246)'
                  })}
                onClick={() => {
                  router.push({
                    query: {
                      ...router.query,
                      type: item.value
                    }
                  });
                }}
              >
                {item.name}
              </Box>
            </>
          );
        })}
      </HStack>
      <Box flex={1}></Box>
      <Select
        variant="outline"
        chakraStyles={chakraStyles}
        size={'sm'}
        defaultValue={{
          value: sortTypeEnum.updateTime,
          label: '按修改时间排序'
        }}
        placeholder="请选择排序方式"
        options={[
          {
            value: sortTypeEnum.fileType,
            label: '按文件类型排序'
          },
          {
            value: sortTypeEnum.updateTime,
            label: '按修改时间排序'
          },
          {
            value: sortTypeEnum.fileName,
            label: '按文件名排序'
          }
        ]}
        formatOptionLabel={(data) => {
          return (
            <>
              <Flex w={'100%'} justifyContent={'space-between'}>
                <Text>{data.label}</Text>
                {data.value === sortTypeEnum.fileType ? (
                  <MyIcon name={'desc'} w={'16px'} />
                ) : data.value === sortTypeEnum.updateTime ? (
                  <MyIcon name={'asc'} w={'16px'} />
                ) : (
                  <MyIcon name={'desc'} w={'16px'} />
                )}
              </Flex>
            </>
          );
        }}
        onChange={(v) => {
          setSortType(v?.value);
        }}
      ></Select>
      {RenderSearchInput}
    </Flex>
  );
}
