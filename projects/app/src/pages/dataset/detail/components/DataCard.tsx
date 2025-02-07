import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Box,
  Card,
  IconButton,
  Flex,
  Button,
  useTheme,
  TabList,
  Tabs,
  Tab,
  TabIndicator,
  TabPanels,
  TabPanel
} from '@chakra-ui/react';
import {
  getDatasetDataList,
  delOneDatasetDataById,
  getDatasetCollectionById,
  getGraphStatus,
  getGraphMetaData
} from '@/web/core/dataset/api';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@fastgpt/web/hooks/useToast';
import { getErrText } from '@fastgpt/global/common/error/utils';
import { useConfirm } from '@fastgpt/web/hooks/useConfirm';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import MyIcon from '@fastgpt/web/components/common/Icon';
import MyInput from '@/components/MyInput';
import InputDataModal from '../components/InputDataModal';
import RawSourceBox from '@/components/core/dataset/RawSourceBox';
import { getCollectionSourceData } from '@fastgpt/global/core/dataset/collection/utils';
import EmptyTip from '@fastgpt/web/components/common/EmptyTip';
import { DatasetPageContext } from '@/web/core/dataset/context/datasetPageContext';
import { useContextSelector } from 'use-context-selector';
import MyTag from '@fastgpt/web/components/common/Tag/index';
import MyBox from '@fastgpt/web/components/common/MyBox';
import { useSystem } from '@fastgpt/web/hooks/useSystem';
import TagsPopOver from './CollectionCard/TagsPopOver';
import { useSystemStore } from '@/web/common/system/useSystemStore';
import MyDivider from '@fastgpt/web/components/common/MyDivider';
import Markdown from '@/components/Markdown';
import { useMemoizedFn } from 'ahooks';
import { useScrollPagination } from '@fastgpt/web/hooks/useScrollPagination';
import AIcon from '@/components/AIcon/AIcon';
import { GraphEntityData, GraphMetaData, GraphRelationData } from '@/web/core/dataset/type';
import { ColumnDef } from '@tanstack/react-table';
import ATable from '@/components/common/ATable';

export enum TabEnum {
  dataCard = 'dataCard',
  collectionCard = 'collectionCard',
  test = 'test',
  info = 'info',
  import = 'import',
  settings = 'settings'
}

const DataCard = () => {
  const theme = useTheme();
  const router = useRouter();
  const { isPc } = useSystem();
  const { collectionId = '', datasetId } = router.query as {
    collectionId: string;
    datasetId: string;
  };
  const datasetDetail = useContextSelector(DatasetPageContext, (v) => v.datasetDetail);
  const { feConfigs } = useSystemStore();

  const { t } = useTranslation();
  const [searchText, setSearchText] = useState('');
  const { toast } = useToast();

  const scrollParams = useMemo(
    () => ({
      collectionId,
      searchText
    }),
    [collectionId, searchText]
  );
  const EmptyTipDom = useMemo(
    () => <EmptyTip text={t('common:core.dataset.data.Empty Tip')} />,
    [t]
  );
  const {
    data: datasetDataList,
    ScrollData,
    total,
    refreshList,
    setData: setDatasetDataList
  } = useScrollPagination(getDatasetDataList, {
    pageSize: 15,
    params: scrollParams,
    refreshDeps: [searchText, collectionId],
    EmptyTip: EmptyTipDom
  });

  const [editDataId, setEditDataId] = useState<string>();
  const [showGraph, setShowGraph] = useState(false);
  const [graphData, setGraphData] = useState<GraphMetaData>();

  // get file info
  const { data: collection } = useQuery(
    ['getDatasetCollectionById', collectionId],
    () => getDatasetCollectionById(collectionId),
    {
      onError: () => {
        router.replace({
          query: {
            datasetId
          }
        });
      }
    }
  );

  // get graph status
  const { data } = useQuery({
    queryKey: ['getGraphStatus', collection?.fileId],
    queryFn: async ({ queryKey }) => {
      if (queryKey[1]) {
        const res = await getGraphStatus({ fileId: queryKey[1] });
        return res;
      }
    },
    refetchInterval: 120 * 1000,
    enabled: !!collection?.fileId
  });

  const canWrite = useMemo(() => datasetDetail.permission.hasWritePer, [datasetDetail]);
  const isGraph = useMemo(() => datasetDetail.type === 'graph', [datasetDetail]);
  const graphStatus = useMemo(() => data?.status === 'success', [data?.status]);
  const entityColumns = useMemo<ColumnDef<GraphEntityData>[]>(() => {
    const entities = graphData?.create_final_entities;
    if (entities) {
      return Object.keys(entities[0]).map((key) => ({
        accessorKey: key,
        cell: (info) => info.getValue(),
        header: () => key
      }));
    }
    return [];
  }, [graphData]);
  const relationColumns = useMemo<ColumnDef<GraphRelationData>[]>(() => {
    const relations = graphData?.create_final_relationships;
    if (relations) {
      return Object.keys(relations[0]).map((key) => ({
        accessorKey: key,
        cell: (info) => info.getValue(),
        header: () => key
      }));
    }
    return [];
  }, [graphData]);
  const entityData = useMemo(() => graphData?.create_final_entities, [graphData]);
  const relationData = useMemo(() => graphData?.create_final_relationships, [graphData]);

  useEffect(() => {
    if (graphStatus && collection) {
      getGraphMetaData({ fileId: collection.fileId! }).then((res) => {
        setGraphData(res);
      });
    }
  }, [graphStatus]);

  const { openConfirm, ConfirmModal } = useConfirm({
    content: t('common:dataset.Confirm to delete the data'),
    type: 'delete'
  });
  const onDeleteOneData = useMemoizedFn((dataId: string) => {
    openConfirm(async () => {
      try {
        await delOneDatasetDataById(dataId);
        setDatasetDataList((prev) => {
          return prev.filter((data) => data._id !== dataId);
        });
        toast({
          title: t('common:common.Delete Success'),
          status: 'success'
        });
      } catch (error) {
        toast({
          title: getErrText(error),
          status: 'error'
        });
      }
    })();
  });

  const checkGraphify = useCallback(async () => {
    if (!graphStatus) {
      toast({
        title: '图谱正在生成中，请稍后再试',
        status: 'info'
      });
    } else {
      setShowGraph(true);
    }
  }, [collection, graphStatus]);

  return (
    <MyBox py={[1, 0]} h={'100%'}>
      <Flex flexDirection={'column'} h={'100%'}>
        {/* Header */}
        <Flex alignItems={'center'} px={6}>
          <Box flex={'1 0 0'} mr={[3, 5]} alignItems={'center'}>
            <Box
              className="textEllipsis"
              alignItems={'center'}
              gap={2}
              display={isPc ? 'flex' : ''}
              mt={1}
            >
              {collection?._id && (
                <RawSourceBox
                  collectionId={collection._id}
                  {...getCollectionSourceData(collection)}
                  fontSize={['sm', 'md']}
                  color={'black'}
                  textDecoration={'none'}
                />
              )}
              <Box flex={1}></Box>
              <Box>
                <Button
                  // ml={'800px'}
                  variant={'blackCommon'}
                  size={['sm', 'md']}
                  onClick={() => {
                    router.replace({
                      query: {
                        datasetId: router.query.datasetId,
                        parentId: router.query.parentId,
                        currentTab: TabEnum.collectionCard
                      }
                    });
                  }}
                >
                  {/* 插入 */}
                  退出
                </Button>
              </Box>
            </Box>
            {feConfigs?.isPlus && !!collection?.tags?.length && (
              <TagsPopOver currentCollection={collection} />
            )}
          </Box>
        </Flex>
        <Box justifyContent={'center'} px={6} pos={'relative'} w={'100%'}>
          <MyDivider my={'17px'} w={'100%'} />
        </Box>
        <Flex alignItems={'center'} px={6} pb={4}>
          <Flex align={'center'} color={'myGray.500'}>
            <MyIcon name="common/list" mr={2} w={'22px'} />
            <Box as={'span'} fontSize={['sm', '14px']} fontWeight={'500'}>
              {t('common:core.dataset.data.Total Amount', { total })}
            </Box>
          </Flex>
          {canWrite && !isGraph && (
            <Box>
              <Button
                ml={2}
                variant={'whitePrimary'}
                size={['sm', 'md']}
                onClick={() => {
                  if (!collection) return;
                  setEditDataId('');
                }}
              >
                {/* 插入 */}
                {t('common:dataset.Insert Data')}
              </Button>
            </Box>
          )}
          {isGraph && (
            <Button variant={'blackCommon'} ml={2} size={['sm', 'md']} onClick={checkGraphify}>
              图谱化
            </Button>
          )}
          <Box flex={1} mr={1} />
          <MyInput
            leftIcon={
              <MyIcon
                name="common/searchLight"
                position={'absolute'}
                w={'14px'}
                color={'myGray.600'}
              />
            }
            bg={'myGray.25'}
            borderColor={'myGray.200'}
            color={'myGray.500'}
            w={['200px', '300px']}
            placeholder={t('common:core.dataset.data.Search data placeholder')}
            value={searchText}
            onChange={(e) => {
              setSearchText(e.target.value);
            }}
          />
        </Flex>
        {/* data */}
        {!showGraph ? (
          <Box maxW={'1080px'}>
            <ScrollData px={5} pb={5}>
              <Flex flexDir={'column'} gap={2}>
                {datasetDataList.map((item, index) => (
                  <Card
                    key={item._id}
                    cursor={'pointer'}
                    p={3}
                    userSelect={'none'}
                    boxShadow={'none'}
                    bg={index % 2 === 1 ? 'myGray.50' : 'blue.50'}
                    border={theme.borders.sm}
                    position={'relative'}
                    overflow={'hidden'}
                    _hover={{
                      borderColor: 'blue.600',
                      boxShadow: 'lg',
                      '& .header': { visibility: 'visible' },
                      '& .footer': { visibility: 'visible' },
                      bg: index % 2 === 1 ? 'myGray.200' : 'blue.100'
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditDataId(item._id);
                    }}
                  >
                    {/* Data tag */}
                    <Flex
                      position={'absolute'}
                      zIndex={1}
                      alignItems={'center'}
                      visibility={'hidden'}
                      className="header"
                    >
                      <MyTag
                        px={2}
                        type="borderFill"
                        borderRadius={'sm'}
                        border={'1px'}
                        color={'myGray.200'}
                        bg={'white'}
                        fontWeight={'500'}
                      >
                        <Box color={'blue.600'}>#{item.chunkIndex ?? '-'} </Box>
                        <Box
                          ml={1.5}
                          className={'textEllipsis'}
                          fontSize={'mini'}
                          textAlign={'right'}
                          color={'myGray.500'}
                        >
                          ID:{item._id}
                        </Box>
                      </MyTag>
                    </Flex>

                    {/* Data content */}
                    <Box wordBreak={'break-all'} fontSize={'sm'}>
                      <Markdown source={item.q} isDisabled />
                      {!!item.a && (
                        <>
                          <MyDivider />
                          <Markdown source={item.a} isDisabled />
                        </>
                      )}
                    </Box>

                    {/* Mask */}
                    <Flex
                      className="footer"
                      position={'absolute'}
                      bottom={2}
                      right={2}
                      overflow={'hidden'}
                      alignItems={'flex-end'}
                      visibility={'hidden'}
                      fontSize={'mini'}
                    >
                      <Flex
                        alignItems={'center'}
                        bg={'white'}
                        color={'myGray.600'}
                        borderRadius={'sm'}
                        border={'1px'}
                        borderColor={'myGray.200'}
                        h={'24px'}
                        px={2}
                        fontSize={'mini'}
                        boxShadow={'1'}
                        py={1}
                        mr={2}
                      >
                        <MyIcon
                          bg={'white'}
                          color={'myGray.600'}
                          borderRadius={'sm'}
                          border={'1px'}
                          borderColor={'myGray.200'}
                          name="common/text/t"
                          w={'14px'}
                          mr={1}
                        />
                        {item.q.length + (item.a?.length || 0)}
                      </Flex>
                      {canWrite && (
                        <IconButton
                          display={'flex'}
                          p={1}
                          boxShadow={'1'}
                          icon={<MyIcon name={'common/trash'} w={'14px'} color={'myGray.600'} />}
                          variant={'whiteDanger'}
                          size={'xsSquare'}
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteOneData(item._id);
                          }}
                          aria-label={''}
                        />
                      )}
                    </Flex>
                  </Card>
                ))}
              </Flex>
            </ScrollData>
          </Box>
        ) : (
          <Box maxW={'1080px'} px={4}>
            {/* header */}
            <Flex
              h={'2.5rem'}
              justifyContent={'space-between'}
              alignItems={'center'}
              bgColor={'#E2E3EA'}
              px={2}
              borderTopLeftRadius={'md'}
              borderTopRightRadius={'md'}
            >
              <Flex alignItems={'center'}>
                <AIcon name="icon-zhishitupu" fontSize={'1.5rem'} color="primary.500" mr={2} />
                <Box>图谱化</Box>
              </Flex>
              <AIcon
                name="icon-quxiao"
                fontSize="1.5rem"
                cursor={'pointer'}
                onClick={() => setShowGraph(false)}
              />
            </Flex>

            {/* Tabs */}
            <Tabs w={'100%'} variant={'unstyled'}>
              <Flex alignItems={'center'} justifyContent={'space-between'}>
                <Box>
                  <TabList>
                    <Tab
                      fontSize={'sm'}
                      fontWeight={'600'}
                      _selected={{ color: 'primary.500' }}
                      _hover={{ color: 'primary.500' }}
                    >
                      实体数据
                    </Tab>
                    <Tab
                      fontSize={'sm'}
                      fontWeight={'600'}
                      _selected={{ color: 'primary.500' }}
                      _hover={{ color: 'primary.500' }}
                    >
                      关系数据
                    </Tab>
                  </TabList>
                  <TabIndicator
                    mt={'-1.5px'}
                    height={'1px'}
                    bg={'primary.500'}
                    borderRadius={'1px'}
                  />
                </Box>

                {/* <Button variant={'whiteCommon'} minH={'1.5rem'} minW={'6.5rem'} fontWeight={'600'}>
                  重新图谱化
                </Button> */}
              </Flex>
              <TabPanels>
                <TabPanel overflowX={'auto'}>
                  {entityData !== undefined && (
                    <ATable<GraphEntityData>
                      data={entityData}
                      columns={entityColumns}
                      align="left"
                    />
                  )}
                </TabPanel>
                <TabPanel overflowX={'auto'}>
                  {relationData !== undefined && (
                    <ATable<GraphRelationData>
                      data={relationData}
                      columns={relationColumns}
                      align="left"
                    />
                  )}
                </TabPanel>
              </TabPanels>
            </Tabs>
          </Box>
        )}
      </Flex>

      {editDataId !== undefined && collection && (
        <InputDataModal
          collectionId={collection._id}
          dataId={editDataId}
          onClose={() => setEditDataId(undefined)}
          onSuccess={(data) => {
            if (editDataId === '') {
              refreshList();
              return;
            }
            setDatasetDataList((prev) => {
              return prev.map((item) => {
                if (item._id === editDataId) {
                  return {
                    ...item,
                    ...data
                  };
                }
                return item;
              });
            });
          }}
        />
      )}
      <ConfirmModal />
    </MyBox>
  );
};

export default React.memo(DataCard);
