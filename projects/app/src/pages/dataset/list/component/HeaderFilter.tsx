import {
  Flex,
  Box,
  HStack,
  transition,
  Text,
  InputGroup,
  InputLeftElement,
  Input,
  Show
} from '@chakra-ui/react';
import MyIcon from '@fastgpt/web/components/common/Icon';
import { useMemo } from 'react';
import { Select } from 'chakra-react-select';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { DatasetsContext } from '../context';
import { useContextSelector } from 'use-context-selector';
import { bg } from 'date-fns/locale';
import { log } from 'console';
import { nextTick } from 'process';
import query from '@/pages/api/core/chat/inputGuide/query';
export type FilterProps = {
  filterButtonList: {
    name: string;
    isActive?: boolean;
    value: string;
    hoverBg?: string;
  }[];
};
export default function HeaderFilter({ filterButtonList }: FilterProps) {
  const router = useRouter();

  const {
    myDatasets,
    loadMyDatasets,
    paths,
    setDataset,
    searchKey,
    setSearchKey,
    selectDatasetType,
    setSelectDatasetType
  } = useContextSelector(DatasetsContext, (v) => v);
  const { t } = useTranslation();
  const RenderSearchInput = useMemo(
    () => (
      <InputGroup maxW={['auto', '500px']} mr={2}>
        <InputLeftElement h={'full'} alignItems={'center'} display={'flex'}>
          <MyIcon color={'primary.600'} name={'common/searchLight'} w={'1.5rem'} />
        </InputLeftElement>
        <Input
          pl={'34px'}
          value={searchKey}
          onChange={(e) => setSearchKey(e.target.value)}
          placeholder={t('common:dataset.dataset_name')}
          py={0}
          lineHeight={'34px'}
          maxLength={30}
          bg={'white'}
        />
      </InputGroup>
    ),
    [searchKey, setSearchKey, t]
  );
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
      ...prev, // w: '120px',
      '> svg': {
        transform: `rotate(${selectProps.menuIsOpen ? 90 : 0}deg)`,
        transition: 'transform 0.3s'
      }
    })
  };
  return (
    <Flex pl={'30px'} alignItems={'center'} w={'calc(100% - 140px)'} gap={3}>
      <HStack gap={'5px'} h={'30px'}>
        {filterButtonList.map((item) => {
          return (
            <>
              <Box
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
                {...(Object.keys(router.query).length === 0 &&
                  item.isActive === true && {
                    bgColor: 'rgb(236,239,246)'
                  })}
                // {...(item.isActive === true &&
                //   Object.keys(router.query) === 0 && {
                //     bgColor: 'rgb(236,239,246)'
                //   })}
                {...(router.query.selectType === item.value && {
                  bgColor: 'rgb(236,239,246)'
                })}
                onClick={async () => {
                  router.push({
                    query: {
                      ...router.query,
                      selectType: item.value
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
        // maxMenuHeight={'30px'}
        chakraStyles={chakraStyles}
        size={'sm'}
        placeholder="按修改时间排序"
        options={[
          {
            value: 'type',
            label: '按文件类型排序'
          },
          {
            value: 'time',
            label: '按修改时间排序'
          },
          {
            value: 'fileName',
            label: '按文件名排序'
          }
        ]}
        formatOptionLabel={(data) => {
          return (
            <>
              <Flex w={'100%'} justifyContent={'space-between'} minWidth="200px">
                <Text>{data.label}</Text>
                {data.value === 'type' ? (
                  <MyIcon name={'desc'} w={'16px'} />
                ) : data.value === 'time' ? (
                  <MyIcon name={'asc'} w={'16px'} />
                ) : (
                  <MyIcon name={'desc'} w={'16px'} />
                )}
              </Flex>
            </>
          );
        }}
        onChange={(e) => {
          setSelectDatasetType(e?.value);
        }}
      ></Select>
      {RenderSearchInput}
    </Flex>
  );
}
