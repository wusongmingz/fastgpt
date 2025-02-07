import React, { useCallback } from 'react';
import { useRouter } from 'next/router';
import { Box, Flex, FlexProps, Image, IconButton, Progress, Text, Tooltip } from '@chakra-ui/react';
import { useToast } from '@fastgpt/web/hooks/useToast';
import { getErrText } from '@fastgpt/global/common/error/utils';
import dynamic from 'next/dynamic';
import PageContainer from '@/components/PageContainer';
import { serviceSideProps } from '@/web/common/utils/i18n';
import { useTranslation } from 'next-i18next';
import MetaDataCard from './components/MetaDataCard';
import NavBar from './components/NavBar';
import MyIcon from '@fastgpt/web/components/common/Icon';
import MyPopover from '@fastgpt/web/components/common/MyPopover';
import MyBox from '@fastgpt/web/components/common/MyBox';
import { useI18n } from '@/web/context/I18n';
import AIcon from '@/components/AIcon/AIcon';
import FolderPath from '@/components/common/folder/Path';
import {
  DatasetPageContext,
  DatasetPageContextProvider
} from '@/web/core/dataset/context/datasetPageContext';
import CollectionPageContextProvider from './components/CollectionCard/Context';
import { useContextSelector } from 'use-context-selector';
import NextHead from '@/components/common/NextHead';
import { useRequest2 } from '@fastgpt/web/hooks/useRequest';
import { useSystem } from '@fastgpt/web/hooks/useSystem';
import ParentPaths from '@/components/common/ParentPaths';
import { log } from 'console';

const CollectionCard = dynamic(() => import('./components/CollectionCard/index'));
const DataCard = dynamic(() => import('./components/DataCard'));
const Test = dynamic(() => import('./components/Test'));
const Info = dynamic(() => import('./components/Info'));
const Import = dynamic(() => import('./components/Import'));
const Setting = dynamic(() => import('./components/Setting'));
import { useSystemStore } from '@/web/common/system/useSystemStore';
import { DatasetTypeEnum } from '@fastgpt/global/core/dataset/constants';

export enum TabEnum {
  dataCard = 'dataCard',
  collectionCard = 'collectionCard',
  test = 'test',
  info = 'info',
  import = 'import',
  settings = 'settings'
}
type Props = { datasetId: string; currentTab: TabEnum };

const sliderStyles: FlexProps = {
  bg: 'white',
  borderRadius: 'md',
  overflowY: 'scroll',
  boxShadow: 2
};

const Detail = ({ datasetId, currentTab }: Props) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const router = useRouter();
  const { isPc } = useSystem();
  const { datasetT } = useI18n();
  const datasetDetail = useContextSelector(DatasetPageContext, (v) => v.datasetDetail);
  const loadDatasetDetail = useContextSelector(DatasetPageContext, (v) => v.loadDatasetDetail);
  const { paths, rebuildingCount, agentTrainingMap, vectorTrainingMap } = useContextSelector(
    DatasetPageContext,
    (v) => v
  );
  useRequest2(() => loadDatasetDetail(datasetId), {
    onError(err: any) {
      router.replace(`/dataset/list`);
      toast({
        title: t(getErrText(err, t('common:common.Load Failed')) as any),
        status: 'error'
      });
    },
    manual: false
  });
  const { lastAppListRouteType } = useSystemStore();
  const onClickRoute = useCallback(
    (parentId: string) => {
      router.push({
        pathname: '/dataset/list',
        query: {
          parentId,
          type: lastAppListRouteType
        }
      });
    },
    [router, lastAppListRouteType]
  );

  return (
    <>
      <NextHead title={datasetDetail?.name} icon={datasetDetail?.avatar} />

      {isPc ? (
        <Flex
          h={'calc(100vh - 100px)'}
          bg={'#eceff6'}
          mt="10px"
          mr="10px"
          mb="10px"
          // ml="10px"
          borderRadius="10px"
          flexDirection={'column'}
        >
          <Flex
            h={'45px'}
            w={'calc(100% - 20px)'}
            bgColor={'white'}
            borderRadius={'md'}
            alignItems={'center'}
            pl={'15px'}
            mt="10px"
            mr="10px"
            ml="10px"
          >
            <Image
              w={'30px'}
              h={'30px'}
              src="/imgs/images/picture/书籍.png"
              alt=""
              borderRadius={'25px'}
              boxShadow={'4px 4px 4px rgba(0,0,0,0.20)'}
            />
            <Box pl={'23px'} fontWeight={1000} fontSize={'17px'}>
              我的知识库
            </Box>
            {!!datasetId && (
              <>
                <Box h={'30px'} pl={'10px'} borderRight={'3px solid #d7000f'}></Box>

                <Box pl={'20px'}>
                  <FolderPath
                    rootName={'根目录'}
                    paths={paths}
                    hoverStyle={{ color: 'primary.600' }}
                    onClick={onClickRoute}
                    fontSize={'14px'}
                  />
                </Box>
              </>
            )}
            {/* {currentTab === TabEnum.dataCard ? (
              <>
                <Flex
                  alignItems={'center'}
                  cursor={'pointer'}
                  py={'0.38rem'}
                  px={2}
                  ml={0}
                  borderRadius={'md'}
                  _hover={{ bg: 'myGray.05' }}
                  fontSize={'sm'}
                  fontWeight={500}
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
                  <IconButton
                    p={2}
                    mr={2}
                    border={'1px solid'}
                    borderColor={'myGray.200'}
                    boxShadow={'1'}
                    icon={<MyIcon name={'common/arrowLeft'} w={'16px'} color={'myGray.500'} />}
                    bg={'white'}
                    size={'xsSquare'}
                    borderRadius={'50%'}
                    aria-label={''}
                    _hover={'none'}
                  />
                  <Box fontWeight={500} color={'myGray.600'} fontSize={'sm'}>
                    {datasetDetail.name}
                  </Box>
                </Flex>
              </>
            ) : ( */}
            {/* <Flex py={'0.38rem'} px={2} h={10} ml={0.5}>
              <ParentPaths
                paths={paths}
                onClick={(e) => {
                  router.push(`/dataset/list?parentId=${e}`);
                }}
              />
            </Flex> */}
            {/* )} */}
          </Flex>
          <Flex w={'100%'} py={3} ml={3} pr={3} gap={2} h={'calc(100% - 45px)'}>
            {/* 左上侧边栏 */}
            <MyBox w={'13%'} h={'100%'}>
              <Flex bg={'white'} direction={'column'} borderRadius={'md'} h={'17%'}>
                <Box pt={'1px'}>
                  <Flex ml={4} mb={2} mt={2}>
                    <Box
                      minW="21px"
                      minH="21px"
                      bg={datasetDetail.selectColor}
                      borderRadius="50%"
                      mr="2px"
                      boxShadow={'4px 4px 4px rgba(0,0,0,0.20)'}
                    />
                    <Text
                      fontWeight={500}
                      ml={2}
                      whiteSpace={'nowrap'}
                      overflow={'hidden'}
                      textOverflow={'ellipsis'}
                    >
                      {datasetDetail.name}
                    </Text>
                  </Flex>
                </Box>

                <Box
                  w={'90%'}
                  h={'40%'}
                  border="1px solid"
                  borderColor={'myGray.200'}
                  display={'flex'}
                  justifyContent={'center'}
                  alignItems={'center'}
                  m={'auto'}
                  borderRadius={'10px'}
                  overflow={'hidden'}
                >
                  <Tooltip
                    label={datasetDetail.intro || t('common:core.dataset.Intro Placeholder')}
                    hasArrow
                  >
                    <Text
                      // noOfLines={3}
                      overflow={'hidden'}
                      textOverflow={'ellipsis'}
                      whiteSpace={'nowrap'}
                    >
                      {datasetDetail.intro || t('common:core.dataset.Intro Placeholder')}
                    </Text>
                  </Tooltip>
                </Box>
                <Box flex={1}></Box>
                <Flex justifyContent="flex-end" flex={1} mr={1} mt={1} ml="auto">
                  <AIcon
                    // name="icon-tongyongzhishiku"
                    name={datasetDetail.type === 'dataset' ? 'icon-tongyongzhishiku' : 'icon-tupu'}
                    fontSize={'1.125rem'}
                    color="rgb(215, 0, 15)"
                    pt={1}
                  />
                  <Box fontWeight={'700'} fontSize={'sm'} pt={0.8} pb={1} pr={1} mr={1.45}>
                    {/* {dataset.type === DatasetTypeEnum.graphDataset ? '图谱知识库' : '通用知识库'} */}
                    {datasetDetail.type === 'dataset' ? '通用知识库' : '图谱知识库'}
                  </Box>
                </Flex>
              </Flex>
              {/* 左下侧边栏 */}
              <Flex direction={'column'} bg={'white'} borderRadius={'md'} h={'82%'} mt={2}>
                <Box
                  display={'flex'}
                  flexDirection={'column'}
                  gap={2}
                  justifyContent={'center'}
                  alignItems={'center'}
                >
                  <Box
                    bg={'#eceff6'}
                    w={'130px'}
                    h={'30%'}
                    mt={'10px'}
                    borderRadius={'10px'}
                    display={'flex'}
                    flexDirection={'column'}
                    justifyContent={'center'}
                    alignItems={'center'}
                    {...(currentTab === TabEnum.collectionCard && {
                      bg: '#e2e3ea'
                    })}
                    _hover={{
                      cursor: 'pointer',
                      bg: '#e2e3ea',
                      '& .dataSetName': {
                        borderTop: 'none',
                        pt: '1px'
                      }
                    }}
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
                    <AIcon
                      name="icon-peizhizhishikupeizhi"
                      fontSize={'40px'}
                      color="rgb(215, 0, 15)"
                    />

                    <Box
                      display={'flex'}
                      borderTop="1px solid #e2e3ea"
                      className="dataSetName"
                      justifyContent={'center'}
                      alignItems={'center'}
                      mt={4}
                      {...(currentTab === TabEnum.collectionCard && {
                        borderTop: 'none',
                        pt: '1px'
                      })}
                      w="100%"

                      // _hover={{ borderTop: 'none' }}
                    >
                      <p>数据集</p>
                    </Box>
                  </Box>
                  <Box
                    bg={'#eceff6'}
                    w={'130px'}
                    h={'100px'}
                    mt={'10px'}
                    borderRadius={'10px'}
                    display={'flex'}
                    flexDirection={'column'}
                    justifyContent={'center'}
                    alignItems={'center'}
                    {...(currentTab === TabEnum.test && {
                      bg: '#e2e3ea'
                    })}
                    _hover={{ cursor: 'pointer', bg: '#e2e3ea' }}
                    onClick={() => {
                      router.replace({
                        query: {
                          datasetId: router.query.datasetId,
                          parentId: router.query.parentId,
                          currentTab: TabEnum.test
                        }
                      });
                    }}
                  >
                    <AIcon
                      name="icon-sousuo1-copy-copy"
                      fontSize={'40px'}
                      color="rgb(215, 0, 15)"
                    />
                    <Box
                      display={'flex'}
                      borderTop="1px solid #e2e3ea"
                      className="dataSetName"
                      justifyContent={'center'}
                      alignItems={'center'}
                      mt={4}
                      {...(currentTab === TabEnum.test && {
                        borderTop: 'none',
                        pt: '1px'
                      })}
                      w="100%"

                      // _hover={{ borderTop: 'none' }}
                    >
                      <p>搜索测试</p>
                    </Box>
                  </Box>
                  <Box
                    bg={'#eceff6'}
                    w={'130px'}
                    h={'100px'}
                    mt={'10px'}
                    display={'flex'}
                    flexDirection={'column'}
                    justifyContent={'center'}
                    borderRadius={'10px'}
                    alignItems={'center'}
                    {...(currentTab === TabEnum.settings && {
                      bg: '#e2e3ea'
                    })}
                    _hover={{ cursor: 'pointer', bg: '#e2e3ea' }}
                    onClick={() => {
                      router.replace({
                        query: {
                          datasetId: router.query.datasetId,
                          parentId: router.query.parentId,
                          currentTab: TabEnum.settings
                        }
                      });
                    }}
                  >
                    <AIcon name="icon-a-setting2" fontSize={'40px'} color="rgb(215, 0, 15)" />
                    <Box
                      display={'flex'}
                      borderTop="1px solid #e2e3ea"
                      className="dataSetName"
                      justifyContent={'center'}
                      alignItems={'center'}
                      mt={4}
                      {...(currentTab === TabEnum.settings && {
                        borderTop: 'none',
                        pt: '1px'
                      })}
                      w="100%"

                      // _hover={{ borderTop: 'none' }}
                    >
                      <p>配置</p>
                    </Box>
                  </Box>
                </Box>
                <Box flex={1}></Box>
                <Box p={6}>
                  {rebuildingCount > 0 && (
                    <Box mb={3}>
                      <Box fontSize={'sm'}>
                        {datasetT('rebuilding_index_count', { count: rebuildingCount })}
                      </Box>
                    </Box>
                  )}
                  <Box mb={3}>
                    <Box
                      fontSize={'sm'}
                      pb={1}
                      whiteSpace={'nowrap'}
                      overflow={'hidden'}
                      textOverflow={'ellipsis'}
                    >
                      {t('common:core.dataset.training.Agent queue')}({agentTrainingMap.tip})
                    </Box>
                    <Progress
                      value={100}
                      size={'xs'}
                      colorScheme={agentTrainingMap.colorSchema}
                      borderRadius={'md'}
                      isAnimated
                      hasStripe
                    />
                  </Box>
                  <Box>
                    <Box fontSize={'sm'} pb={1}>
                      {t('common:core.dataset.training.Vector queue')}({vectorTrainingMap.tip})
                    </Box>
                    <Progress
                      value={100}
                      size={'xs'}
                      colorScheme={vectorTrainingMap.colorSchema}
                      borderRadius={'md'}
                      isAnimated
                      hasStripe
                    />
                  </Box>
                </Box>
              </Flex>
            </MyBox>
            <Flex
              flex={1}
              mr={currentTab === TabEnum.dataCard ? '0px' : '10px'}
              bg={'white'}
              flexDir={'column'}
              boxShadow={'2'}
              borderRadius={'10px'}
            >
              {/* 隐藏原来的导航栏NavBar */}
              {/* {currentTab !== TabEnum.import && <NavBar currentTab={currentTab} />} */}
              <Box flex={'1'} overflowY={'auto'} borderRadius={'10px'}>
                {currentTab === TabEnum.collectionCard && (
                  <CollectionPageContextProvider>
                    <CollectionCard />
                  </CollectionPageContextProvider>
                )}
                {currentTab === TabEnum.test && <Test datasetId={datasetId} />}
                {currentTab === TabEnum.dataCard && <DataCard />}
                {currentTab === TabEnum.import && <Import />}
                {currentTab === TabEnum.settings && <Setting datasetId={datasetId} />}
              </Box>
            </Flex>

            {/* Slider 侧边栏*/}
            <>
              {currentTab === TabEnum.dataCard && (
                <Flex {...sliderStyles} flex={'0 0 20rem'} mr={'10px'}>
                  <MetaDataCard datasetId={datasetId} />
                </Flex>
              )}
              {/* {[TabEnum.collectionCard, TabEnum.test].includes(currentTab) && (
                <Flex {...sliderStyles} flex={'0 0 17rem'}>
                  <Info datasetId={datasetId} />
                </Flex>
              )} */}
            </>
          </Flex>
        </Flex>
      ) : (
        <PageContainer insertProps={{ bg: 'white' }}>
          <MyBox display={'flex'} flexDirection={'column'} h={'100%'} pt={1} borderRadius={'10px'}>
            <NavBar currentTab={currentTab} />

            {!!datasetDetail._id && (
              <Box flex={'1 0 0'} pb={0} overflow={'auto'}>
                {currentTab === TabEnum.collectionCard && (
                  <CollectionPageContextProvider>
                    <CollectionCard />
                  </CollectionPageContextProvider>
                )}
                {currentTab === TabEnum.dataCard && <DataCard />}
                {currentTab === TabEnum.test && <Test datasetId={datasetId} />}
                {currentTab === TabEnum.info && <Info datasetId={datasetId} />}
                {currentTab === TabEnum.import && <Import />}
                {currentTab === TabEnum.settings && <Setting datasetId={datasetId} />}
              </Box>
            )}
          </MyBox>
        </PageContainer>
      )}
    </>
  );
};

const Render = (data: Props) => (
  <DatasetPageContextProvider datasetId={data.datasetId}>
    <Detail {...data} />
  </DatasetPageContextProvider>
);
export default Render;

export async function getServerSideProps(context: any) {
  const currentTab = context?.query?.currentTab || TabEnum.collectionCard;
  const datasetId = context?.query?.datasetId;

  return {
    props: {
      currentTab,
      datasetId,
      ...(await serviceSideProps(context, ['dataset', 'file', 'user']))
    }
  };
}
