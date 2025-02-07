import React, { useMemo, useState } from 'react';
import {
  Card,
  Flex,
  Box,
  Button,
  ModalBody,
  ModalFooter,
  useTheme,
  Grid,
  Divider,
  Image,
  Text
} from '@chakra-ui/react';
import Avatar from '@fastgpt/web/components/common/Avatar';
import type { SelectedDatasetType } from '@fastgpt/global/core/workflow/api.d';
import { useToast } from '@fastgpt/web/hooks/useToast';
import MyTooltip from '@fastgpt/web/components/common/MyTooltip';
import MyIcon from '@fastgpt/web/components/common/Icon';
import { DatasetTypeEnum } from '@fastgpt/global/core/dataset/constants';
import { useTranslation } from 'next-i18next';
import { useDatasetStore } from '@/web/core/dataset/store/dataset';
import DatasetSelectContainer, { useDatasetSelect } from '@/components/core/dataset/SelectModal';
import { useLoading } from '@fastgpt/web/hooks/useLoading';
import EmptyTip from '@fastgpt/web/components/common/EmptyTip';
import AIcon from '@/components/AIcon/AIcon';

export const DatasetSelectModal = ({
  isOpen,
  defaultSelectedDatasets = [],
  onChange,
  onClose
}: {
  isOpen: boolean;
  defaultSelectedDatasets: SelectedDatasetType;
  onChange: (e: SelectedDatasetType) => void;
  onClose: () => void;
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { allDatasets } = useDatasetStore();
  const [selectedDatasets, setSelectedDatasets] = useState<SelectedDatasetType>(
    defaultSelectedDatasets.filter((dataset) => {
      return allDatasets.find((item) => item._id === dataset.datasetId);
    })
  );
  const { toast } = useToast();
  const { paths, setParentId, datasets, isFetching } = useDatasetSelect();
  const { Loading } = useLoading();
  const [filterType, setFilterType] = useState<string>('all');
  const [searchKey, setSearchKey] = useState<string>('');
  const filterDatasets = useMemo(() => {
    return {
      selected: allDatasets.filter((item) =>
        selectedDatasets.find((dataset) => dataset.datasetId === item._id)
      ),
      unSelected: datasets
        .filter((item) => {
          if (filterType == 'all') {
            return item;
          } else if (filterType === DatasetTypeEnum.dataset) {
            return item.type === DatasetTypeEnum.dataset || item.type === DatasetTypeEnum.folder;
          } else {
            return item.type === DatasetTypeEnum.graph || item.type === DatasetTypeEnum.folder;
          }
        })
        .filter(
          (item) =>
            !selectedDatasets.find((dataset) => dataset.datasetId === item._id) &&
            item.name.includes(searchKey)
        )
    };
  }, [datasets, allDatasets, selectedDatasets, searchKey, filterType]);
  const activeVectorModel = allDatasets.find(
    (dataset) => dataset._id === selectedDatasets[0]?.datasetId
  )?.vectorModel?.model;

  return (
    <DatasetSelectContainer
      isOpen={isOpen}
      paths={paths}
      setSearchKey={setSearchKey}
      setFilterType={setFilterType}
      filterType={filterType}
      setParentId={setParentId}
      tips={t('common:dataset.Select Dataset Tips')}
      onClose={onClose}
    >
      <Flex h={'100%'} flexDirection={'column'} flex={'1 0 0'}>
        <ModalBody flex={'1 0 0'} overflowY={'auto'} userSelect={'none'}>
          <Grid
            gridTemplateColumns={[
              'repeat(1, minmax(0, 1fr))',
              'repeat(2, minmax(0, 1fr))',
              'repeat(4, minmax(0, 1fr))'
            ]}
            gridGap={3}
          >
            {filterDatasets.selected.map((item) =>
              (() => {
                return (
                  <Card
                    key={item._id}
                    p={2}
                    // border={theme.borders.base}
                    border={'1px solid #d9a0e9'}
                    bgImage={'/imgs/images/picture/datasetbackground.png'}
                    boxShadow={'sm'}
                    // bg={'primary.200'}
                  >
                    <Flex alignItems={'center'} h={'38px'}>
                      {/* <Avatar src={item.avatar} w={['1.25rem', '1.75rem']}></Avatar> */}
                      <Box flex={'1 0 0'} w={0} className="textEllipsis" mx={3}>
                        {item.name}
                      </Box>
                      {/* <MyIcon
                        name={'delete'}
                        w={'14px'}
                        cursor={'pointer'}
                        _hover={{ color: 'red.500' }}
                      /> */}
                      <AIcon
                        cursor={'pointer'}
                        name="icon-shanchu1"
                        onClick={() => {
                          setSelectedDatasets((state) =>
                            state.filter((dataset) => dataset.datasetId !== item._id)
                          );
                        }}
                      ></AIcon>
                    </Flex>
                  </Card>
                );
              })()
            )}
          </Grid>

          {filterDatasets.selected.length > 0 && <Divider my={3} />}

          <Grid
            gridTemplateColumns={[
              'repeat(1, minmax(0, 1fr))',
              'repeat(2, minmax(0, 1fr))',
              'repeat(3, minmax(0, 1fr))'
            ]}
            gridGap={3}
          >
            {filterDatasets.unSelected.map((item) =>
              (() => {
                return (
                  // <MyTooltip
                  //   key={item._id}
                  //   label={
                  //     item.type === DatasetTypeEnum.folder
                  //       ? t('common:dataset.Select Folder')
                  //       : t('common:dataset.Select Dataset')
                  //   }
                  // >
                  <Card
                    border={theme.borders.base}
                    boxShadow={'sm'}
                    key={item._id}
                    h={'100px'}
                    bgImage={'/imgs/images/picture/datasetbackground.png'}
                    bgSize={'cover'}
                    cursor={'pointer'}
                    overflow={'hidden'}
                    _hover={{
                      boxShadow: 'md'
                    }}
                    pb={1}
                    pr={2}
                    onClick={() => {
                      if (item.type === DatasetTypeEnum.folder) {
                        setParentId(item._id);
                      } else {
                        if (activeVectorModel && activeVectorModel !== item.vectorModel.model) {
                          return toast({
                            status: 'warning',
                            title: t('common:dataset.Select Dataset Tips')
                          });
                        }
                        setSelectedDatasets((state) => [...state, { datasetId: item._id }]);
                      }
                    }}
                  >
                    <Flex h={'40px'}>
                      {item.type === DatasetTypeEnum.folder ? (
                        <>
                          <Image
                            src="/imgs/images/picture/文件.png"
                            alt=""
                            w={'30px'}
                            m={'10px'}
                            mr={0}
                            ml={'15px'}
                            h={'30px'}
                          ></Image>
                        </>
                      ) : (
                        <>
                          <AIcon
                            name="icon-zhijiao-triangle1"
                            color={item.selectColor}
                            fontSize="28px"
                          ></AIcon>
                        </>
                      )}
                      {/* <Avatar src={item.avatar} w={['24px', '28px']}></Avatar> */}
                      <Box
                        flex={'1 0 0'}
                        w={0}
                        className="textEllipsis"
                        ml={3}
                        alignContent={'center'}
                        fontSize={'md'}
                        color={'myGray.900'}
                      >
                        {item.name}
                      </Box>
                    </Flex>
                    <Text
                      flex={1}
                      pl={2}
                      textAlign={'center'}
                      fontSize={'12px'}
                      color={'myGray.500'}
                      overflow={'hidden'}
                      lineHeight={'30px'}
                      pb={'10px'}
                    >
                      {item.type !== DatasetTypeEnum.folder ? item.intro : ''}
                    </Text>
                    <Flex>
                      {item.type != DatasetTypeEnum.folder && (
                        <Flex pl={1}>
                          {item.type === DatasetTypeEnum.dataset ? (
                            <AIcon
                              name="icon-tongyongzhishiku"
                              fontSize={'1.125rem'}
                              color="rgb(215, 0, 15)"
                            />
                          ) : (
                            <AIcon name="icon-tupu" fontSize={'1.125rem'} color="rgb(215, 0, 15)" />
                          )}
                          <Box fontWeight={'600'} fontSize={'sm'}>
                            {item.type === DatasetTypeEnum.graph ? '图谱知识库' : '通用知识库'}
                          </Box>
                        </Flex>
                      )}

                      <Box flex={'1 0 0'}></Box>
                      <Flex
                        justifyContent={'flex-end'}
                        alignItems={'center'}
                        fontSize={'sm'}
                        color={
                          activeVectorModel === item.vectorModel.name ? 'myGray.500' : 'myGray.500'
                        }
                      >
                        {item.type === DatasetTypeEnum.folder ? (
                          <Box color={'myGray.500'}>{t('common:Folder')}</Box>
                        ) : (
                          <>
                            <MyIcon mr={1} name="kbTest" w={'12px'} />
                            <Box>{item.vectorModel.name}</Box>
                          </>
                        )}
                      </Flex>
                    </Flex>
                  </Card>
                  // </MyTooltip>
                );
              })()
            )}
          </Grid>
          {/* {filterDatasets.unSelected.length === 0 && (
            <EmptyTip text={t('common:common.folder.empty')} />
          )} */}
        </ModalBody>

        <ModalFooter>
          <Button
            bg={'#000'}
            w={'100px'}
            size={'sm'}
            _hover={{
              bg: 'rgb(237,241,244)',
              color: '#000',
              border: '1px solid #000'
            }}
            onClick={() => {
              // filter out the dataset that is not in the kList
              const filterDatasets = selectedDatasets.filter((dataset) => {
                return allDatasets.find((item) => item._id === dataset.datasetId);
              });

              onClose();
              onChange(filterDatasets);
            }}
          >
            确认
          </Button>
        </ModalFooter>

        <Loading fixed={false} loading={isFetching} />
      </Flex>
    </DatasetSelectContainer>
  );
};

export default DatasetSelectModal;
