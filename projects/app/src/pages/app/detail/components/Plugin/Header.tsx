import React, { useCallback, useMemo, useState } from 'react';
import {
  Box,
  Flex,
  Button,
  IconButton,
  HStack,
  ModalBody,
  ModalFooter,
  useDisclosure
} from '@chakra-ui/react';
import { useTranslation } from 'next-i18next';

import MyIcon from '@fastgpt/web/components/common/Icon';
import { useContextSelector } from 'use-context-selector';
import { WorkflowContext, WorkflowSnapshotsType } from '../WorkflowComponents/context';
import { AppContext, TabEnum } from '../context';
import RouteTab from '../RouteTab';
import { useRouter } from 'next/router';

import AppCard from '../WorkflowComponents/AppCard';
import { useSystem } from '@fastgpt/web/hooks/useSystem';
import { useRequest2 } from '@fastgpt/web/hooks/useRequest';
import MyModal from '@fastgpt/web/components/common/MyModal';
import { compareSnapshot, filterSensitiveNodesData } from '@/web/core/workflow/utils';
import { formatTime2YMDHMS } from '@fastgpt/global/common/string/time';
import { useToast } from '@fastgpt/web/hooks/useToast';
import { useDebounceEffect } from 'ahooks';
import { useSystemStore } from '@/web/common/system/useSystemStore';
import SaveButton from '../Workflow/components/SaveButton';
import PublishHistories from '../PublishHistoriesSlider';
import {
  WorkflowNodeEdgeContext,
  WorkflowInitContext
} from '../WorkflowComponents/context/workflowInitContext';
import { WorkflowEventContext } from '../WorkflowComponents/context/workflowEventContext';
import AIcon from '@/components/AIcon/AIcon';
import MyBox from '@fastgpt/web/components/common/MyBox';
import MyPopover from '@fastgpt/web/components/common/MyPopover';
import { fileDownload } from '@/web/common/file/utils';
import { useCopyData } from '@/web/common/hooks/useCopyData';
import ImportSettings from '../WorkflowComponents/Flow/ImportSettings';

const Header = () => {
  const { t } = useTranslation();
  const { isPc } = useSystem();
  const router = useRouter();
  const { toast } = useToast();

  const { appDetail, onSaveApp, currentTab } = useContextSelector(AppContext, (v) => v);
  const isV2Workflow = appDetail?.version === 'v2';
  const {
    isOpen: isOpenBackConfirm,
    onOpen: onOpenBackConfirm,
    onClose: onCloseBackConfirm
  } = useDisclosure();

  const nodes = useContextSelector(WorkflowInitContext, (v) => v.nodes);
  const edges = useContextSelector(WorkflowNodeEdgeContext, (v) => v.edges);
  const {
    flowData2StoreData,
    flowData2StoreDataAndCheck,
    setWorkflowTestData,
    past,
    future,
    setPast,
    onSwitchTmpVersion,
    onSwitchCloudVersion
  } = useContextSelector(WorkflowContext, (v) => v);
  const showHistoryModal = useContextSelector(WorkflowEventContext, (v) => v.showHistoryModal);
  const setShowHistoryModal = useContextSelector(
    WorkflowEventContext,
    (v) => v.setShowHistoryModal
  );

  const { lastAppListRouteType } = useSystemStore();

  const [isPublished, setIsPublished] = useState(false);
  useDebounceEffect(
    () => {
      const savedSnapshot =
        [...future].reverse().find((snapshot) => snapshot.isSaved) ||
        past.find((snapshot) => snapshot.isSaved);

      const val = compareSnapshot(
        {
          nodes: savedSnapshot?.nodes,
          edges: savedSnapshot?.edges,
          chatConfig: savedSnapshot?.chatConfig
        },
        {
          nodes: nodes,
          edges: edges,
          chatConfig: appDetail.chatConfig
        }
      );
      setIsPublished(val);
    },
    [future, past, nodes, edges, appDetail.chatConfig],
    {
      wait: 500
    }
  );

  const { runAsync: onClickSave, loading } = useRequest2(
    async ({
      isPublish,
      versionName = formatTime2YMDHMS(new Date())
    }: {
      isPublish?: boolean;
      versionName?: string;
    }) => {
      const data = flowData2StoreData();

      if (data) {
        await onSaveApp({
          ...data,
          isPublish,
          versionName,
          chatConfig: appDetail.chatConfig,
          //@ts-ignore
          version: 'v2'
        });
        // Mark the current snapshot as saved
        setPast((prevPast) =>
          prevPast.map((item, index) =>
            index === 0
              ? {
                  ...item,
                  isSaved: true
                }
              : item
          )
        );
      }
    }
  );
  const { isOpen: isOpenImport, onOpen: onOpenImport, onClose: onCloseImport } = useDisclosure();
  const { copyData } = useCopyData();

  const onExportWorkflow = useCallback(async () => {
    const data = flowData2StoreDataAndCheck();
    if (data) {
      copyData(
        JSON.stringify(
          {
            nodes: filterSensitiveNodesData(data.nodes),
            edges: data.edges,
            chatConfig: appDetail.chatConfig
          },
          null,
          2
        ),
        t('app:export_config_successful')
      );
    }
  }, [appDetail.chatConfig, copyData, flowData2StoreDataAndCheck, t]);
  const onBack = useCallback(async () => {
    try {
      localStorage.removeItem(`${appDetail._id}-past`);
      localStorage.removeItem(`${appDetail._id}-future`);
      router.push({
        pathname: '/applicationCenter',
        query: {
          parentId: appDetail.parentId,
          type: lastAppListRouteType
        }
      });
    } catch (error) {}
  }, [appDetail._id, appDetail.parentId, lastAppListRouteType, router]);

  const Render = useMemo(() => {
    return (
      <>
        {!isPc && (
          <Flex pt={2} justifyContent={'center'}>
            <RouteTab />
          </Flex>
        )}
        <Flex
          mt={[2, 0]}
          pl={[2, 4]}
          pr={[2, 6]}
          borderBottom={'base'}
          alignItems={['flex-start', 'center']}
          userSelect={'none'}
          h={['auto', '67px']}
          flexWrap={'wrap'}
          {...(currentTab === TabEnum.appEdit
            ? {
                bg: 'myGray.25'
              }
            : {
                bg: 'transparent',
                borderBottomColor: 'transparent'
              })}
        >
          {/* back */}
          <Box
            // _hover={{
            //   bg: 'myGray.200'
            // }}
            p={0.5}
            borderRadius={'sm'}
          >
            <AIcon
              name="icon-fanhui"
              color="#d7000f"
              fontSize="25px"
              cursor={'pointer'}
              onClick={isPublished ? onBack : onOpenBackConfirm}
            ></AIcon>
          </Box>

          {/* app info */}
          <Flex ml={1}>
            <AppCard isPublished={isPublished} showSaveStatus={isV2Workflow} />
            <Box
              px={3}
              cursor={'pointer'}
              py={1}
              ml={2}
              border={'1px solid #000'}
              borderRadius={'md'}
              fontSize={'13px'}
              onClick={() => {
                setShowHistoryModal(true);
              }}
            >
              {t('app:initial_release')}
            </Box>
          </Flex>

          {isPc && (
            <Box position={'absolute'} left={'50%'} transform={'translateX(-50%)'}>
              <RouteTab />
            </Box>
          )}
          <Box flex={1} />

          {currentTab === TabEnum.appEdit && (
            <HStack flexDirection={['column', 'row']} spacing={[2, 3]}>
              <MyBox
                display={'flex'}
                size={'md'}
                px={1}
                py={1.5}
                minW={'90px'}
                rounded={'4px'}
                border={'1px solid #e2e3ea'}
                borderRadius={'md'}
                _hover={{ bg: '#edf1f4' }}
                cursor={'pointer'}
                justifyContent={'center'}
                onClick={onOpenImport}
              >
                {/* <MyIcon name={'common/importLight'} w={'16px'} mr={2} /> */}
                <AIcon name="icon-daoru" fontSize="20px" color="primary.500"></AIcon>
                <Box fontSize={'sm'} px={2}>
                  {t('app:import_configs')}
                </Box>
              </MyBox>
              <MyBox
                display={'flex'}
                size={'md'}
                px={1}
                py={1.5}
                minW={'90px'}
                rounded={'4px'}
                border={'1px solid #e2e3ea'}
                borderRadius={'md'}
                _hover={{ bg: '#edf1f4' }}
                cursor={'pointer'}
                justifyContent={'center'}
              >
                {/* {ExportPopover({
                  chatConfig: appDetail.chatConfig,
                  appName: appDetail.name
                })} */}
                <MyPopover
                  placement="bottom"
                  trigger={'hover'}
                  w={'8.6rem'}
                  Trigger={
                    <MyBox display={'flex'}>
                      <AIcon name="icon-daochu" color="primary.500"></AIcon>
                      <Box px={2} fontSize={'sm'}>
                        {t('app:export_configs')}
                      </Box>
                    </MyBox>
                  }
                >
                  {({ onClose }) => {
                    return (
                      <Box p={1}>
                        <Flex
                          py={'0.38rem'}
                          px={1}
                          color={'myGray.600'}
                          _hover={{
                            bg: 'myGray.05',
                            color: 'primary.600',
                            cursor: 'pointer'
                          }}
                          borderRadius={'xs'}
                          onClick={onExportWorkflow}
                        >
                          <MyIcon name={'copy'} w={'1rem'} mr={2} />
                          <Box fontSize={'mini'}>{t('common:common.copy_to_clipboard')}</Box>
                        </Flex>
                        <Flex
                          py={'0.38rem'}
                          px={1}
                          color={'myGray.600'}
                          _hover={{
                            bg: 'myGray.05',
                            color: 'primary.600',
                            cursor: 'pointer'
                          }}
                          borderRadius={'xs'}
                          onClick={() => {
                            const data = flowData2StoreDataAndCheck();

                            if (!data) return;

                            fileDownload({
                              text: JSON.stringify(
                                {
                                  nodes: filterSensitiveNodesData(data.nodes),
                                  edges: data.edges,
                                  chatConfig: appDetail.chatConfig
                                },
                                null,
                                2
                              ),
                              type: 'application/json;charset=utf-8',
                              filename: `${appDetail.name}.json`
                            });
                          }}
                        >
                          <MyIcon name={'configmap'} w={'1rem'} mr={2} />
                          <Box fontSize={'mini'}>{t('common:common.export_to_json')}</Box>
                        </Flex>
                      </Box>
                    );
                  }}
                </MyPopover>
              </MyBox>
              <Button
                size={'sm'}
                leftIcon={<AIcon name="icon-duihua" color="primary.500" fontSize="22px"></AIcon>}
                _hover={{
                  bg: '#edf1f4'
                }}
                variant={'whitePrimary'}
                onClick={() => {
                  const data = flowData2StoreDataAndCheck();
                  if (data) {
                    setWorkflowTestData(data);
                  }
                }}
              >
                {t('app:chat_debug')}
              </Button>
              {/* <Button
                size={'sm'}
                leftIcon={<MyIcon name={'core/workflow/debug'} w={['14px', '16px']} />}
                variant={'whitePrimary'}
                onClick={() => {
                  const data = flowData2StoreDataAndCheck();
                  if (data) {
                    setWorkflowTestData(data);
                  }
                }}
              >
                {t('common:core.workflow.Run')}
              </Button> */}
              {!showHistoryModal && (
                <SaveButton
                  isLoading={loading}
                  onClickSave={onClickSave}
                  checkData={flowData2StoreDataAndCheck}
                />
              )}
            </HStack>
          )}
          {isOpenImport && <ImportSettings onClose={onCloseImport} />}
        </Flex>
      </>
    );
  }, [
    isPc,
    currentTab,
    isPublished,
    onBack,
    onOpenBackConfirm,
    isV2Workflow,
    showHistoryModal,
    t,
    isOpenImport,
    loading,
    onClickSave,
    flowData2StoreDataAndCheck,
    setShowHistoryModal,
    setWorkflowTestData
  ]);

  return (
    <>
      {Render}
      {showHistoryModal && isV2Workflow && currentTab === TabEnum.appEdit && (
        <PublishHistories<WorkflowSnapshotsType>
          onClose={() => {
            setShowHistoryModal(false);
          }}
          past={past}
          onSwitchTmpVersion={onSwitchTmpVersion}
          onSwitchCloudVersion={onSwitchCloudVersion}
        />
      )}
      <MyModal
        isOpen={isOpenBackConfirm}
        onClose={onCloseBackConfirm}
        // iconSrc="common/warn"
        titleBgc={'#e2e3ea'}
        title={t('common:common.Exit')}
        w={'400px'}
      >
        <ModalBody>
          <Box>{t('workflow:workflow.exit_tips')}</Box>
        </ModalBody>
        <ModalFooter gap={3}>
          <Button variant={'whiteCommon'} onClick={onBack}>
            {t('common:common.Exit Directly')}
          </Button>
          <Button
            isLoading={loading}
            variant={'blackCommon'}
            onClick={async () => {
              await onClickSave({});
              onCloseBackConfirm();
              onBack();
              toast({
                status: 'success',
                title: t('app:saved_success'),
                position: 'top-right'
              });
            }}
          >
            {t('common:common.Save_and_exit')}
          </Button>
        </ModalFooter>
      </MyModal>
    </>
  );
};

export default React.memo(Header);
