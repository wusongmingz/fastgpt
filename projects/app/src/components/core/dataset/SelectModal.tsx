import { getDatasets, getDatasetPaths } from '@/web/core/dataset/api';
import MyModal from '@fastgpt/web/components/common/MyModal';
import { useQuery } from '@tanstack/react-query';
import React, { Dispatch, useMemo, useState } from 'react';
import { useTranslation } from 'next-i18next';
import { Box, Flex, HStack, Input, InputGroup, InputLeftElement, Text } from '@chakra-ui/react';
import ParentPaths from '@/components/common/ParentPaths';
import MyBox from '@fastgpt/web/components/common/MyBox';
import { DatasetTypeEnum } from '@fastgpt/global/core/dataset/constants';
import AIcon from '@/components/AIcon/AIcon';

type PathItemType = {
  parentId: string;
  parentName: string;
};

const DatasetSelectContainer = ({
  isOpen,
  setParentId,
  paths,
  onClose,
  tips,
  setFilterType,
  setSearchKey,
  filterType,
  isLoading,
  children
}: {
  isOpen: boolean;
  setParentId: Dispatch<string>;
  paths: PathItemType[];
  onClose: () => void;
  tips?: string | null;
  isLoading?: boolean;
  setFilterType: (v: string) => void;
  setSearchKey: (v: string) => void;
  filterType?: string;
  children: React.ReactNode;
}) => {
  const { t } = useTranslation();
  const menuList = [
    {
      label: t('common:common.All'),
      value: 'all'
    },
    {
      label: '通用知识库',
      value: DatasetTypeEnum.dataset
    },
    {
      label: '图谱知识库',
      value: DatasetTypeEnum.graph
    }
  ];
  return (
    <MyModal
      iconSrc="/imgs/workflow/db2.png"
      titleBgc="#E2E3EA"
      title={
        <HStack display={'flex'} fontWeight={'normal'}>
          <Text fontWeight={'800'} fontSize={'13px'}>
            {t('common:core.chat.Select dataset')}
          </Text>

          <Box fontSize={'12px'} pr={'40px'}>
            {!!tips && (
              <Box color={'myGray.500'} fontWeight={'normal'}>
                {tips}
              </Box>
            )}
            <ParentPaths
              paths={paths.map((path, i) => ({
                parentId: path.parentId,
                parentName: path.parentName
              }))}
              // FirstPathDom={t('common:core.chat.Select dataset')}
              onClick={(e) => {
                setParentId(e);
              }}
            />
          </Box>
          <HStack pr={'20px'}>
            {menuList.map((item) => {
              return (
                <Box
                  key={item.value}
                  py={1}
                  px={2}
                  fontSize={'13px'}
                  onClick={() => {
                    setFilterType(item.value);
                  }}
                  bg={'#fff'}
                  borderRadius={'5px'}
                  cursor={'pointer'}
                  _hover={{
                    bg: '#eceff6'
                  }}
                  {...(filterType === item.value && {
                    bg: '#eceff6'
                  })}
                >
                  {item.label}
                </Box>
              );
            })}
          </HStack>

          <InputGroup w={'200px'}>
            <InputLeftElement>
              <AIcon name="icon-sousuo"></AIcon>
            </InputLeftElement>
            <Input
              borderColor={'#aaaaaa'}
              _hover={{
                bg: '#eae9ed',
                borderColor: 'primary.500'
              }}
              _focus={{
                bg: '#eae9ed',
                boxShadow: 'none',
                borderColor: 'primary.500'
              }}
              onChange={(e) => {
                setSearchKey(e.target.value);
              }}
            ></Input>
          </InputGroup>
        </HStack>
      }
      isOpen={isOpen}
      onClose={onClose}
      h={'80vh'}
      w={'100%'}
      maxW={['90vw', '900px']}
      isCentered
    >
      <MyBox isLoading={isLoading} h={'100%'}>
        {children}
      </MyBox>
    </MyModal>
  );
};

export function useDatasetSelect() {
  const [parentId, setParentId] = useState<string>('');

  const { data, isFetching } = useQuery(['loadDatasetData', parentId], () =>
    Promise.all([getDatasets({ parentId }), getDatasetPaths(parentId)])
  );

  const paths = useMemo(() => [...(data?.[1] || [])], [data]);

  return {
    parentId,
    setParentId,
    datasets: data?.[0] || [],
    paths,
    isFetching
  };
}

export default DatasetSelectContainer;
