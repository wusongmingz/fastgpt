import React, { useState } from 'react';
import {
  Box,
  Flex,
  Button,
  IconButton,
  HStack,
  ModalBody,
  Checkbox,
  ModalFooter,
  Text
} from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { AppSchema, AppSimpleEditFormType } from '@fastgpt/global/core/app/type.d';
import { useTranslation } from 'next-i18next';
import Avatar from '@fastgpt/web/components/common/Avatar';
import MyIcon from '@fastgpt/web/components/common/Icon';
import TagsEditModal from '../TagsEditModal';
import { useSystemStore } from '@/web/common/system/useSystemStore';
import { AppContext } from '@/pages/app/detail/components/context';
import { useContextSelector } from 'use-context-selector';
import MyMenu from '@fastgpt/web/components/common/MyMenu';
import { useI18n } from '@/web/context/I18n';
import MyModal from '@fastgpt/web/components/common/MyModal';
import { useRequest2 } from '@fastgpt/web/hooks/useRequest';
import { postTransition2Workflow } from '@/web/core/app/api/app';
import { AppTypeEnum } from '@fastgpt/global/core/app/constants';
import AIcon from '@/components/AIcon/AIcon';
import { form2AppWorkflow } from '@/web/core/app/utils';
import { appWorkflow2Form } from '@fastgpt/global/core/app/utils';
import { SimpleAppSnapshotType } from './useSnapshots';

const AppCard = ({
  appForm,
  setPast
}: {
  appForm: AppSimpleEditFormType;
  setPast: (value: React.SetStateAction<SimpleAppSnapshotType[]>) => void;
}) => {
  const router = useRouter();
  const { t } = useTranslation();
  const { appT } = useI18n();

  const { appDetail, setAppDetail, onOpenInfoEdit, onDelApp } = useContextSelector(
    AppContext,
    (v) => v
  );

  const appId = appDetail._id;
  const { feConfigs } = useSystemStore();
  const [TeamTagsSet, setTeamTagsSet] = useState<AppSchema>();
  const onSaveApp = useContextSelector(AppContext, (v) => v.onSaveApp);
  // transition to workflow
  const [transitionCreateNew, setTransitionCreateNew] = useState<boolean>();
  const { runAsync: onTransition, loading: transiting } = useRequest2(
    async () => {
      const { nodes, edges } = form2AppWorkflow(appForm, t);
      await onSaveApp({
        nodes,
        edges,
        chatConfig: appForm.chatConfig,
        isPublish: false,
        type: AppTypeEnum.simple,
        versionName: t('app:transition_to_workflow')
      });
      //todo 工作流
      return postTransition2Workflow({ appId, createNew: transitionCreateNew });
    },
    {
      onSuccess: ({ id }) => {
        if (id) {
          router.replace({
            query: {
              appId: id,
              appType: AppTypeEnum.workflow
            }
          });
        } else {
          // setAppDetail((state) => ({
          //   ...state,
          //   type: AppTypeEnum.workflow
          // }));
          setPast([]);
          router.replace({
            query: {
              appId: router.query.appId,
              appType: AppTypeEnum.workflow
            }
          });
        }
      },
      successToast: t('common:common.Success')
    }
  );
  const appOperations = [
    {
      label: '转工作流',
      icon: 'icon-gongzuoliuguanli',
      onclick: () => {
        setTransitionCreateNew(true);
      }
    },
    {
      label: '去对话',
      icon: 'icon-duihua1',
      onclick: () => {
        router.push(`/chat?appId=${appId}`);
      }
    },
    // {
    //   label: '设置',
    //   icon: 'icon-shezhi',
    //   onclick: () => {
    //     onOpenInfoEdit();
    //   }
    // },
    {
      label: '删除',
      icon: 'icon-icon--shanchu',
      onclick: () => {
        onDelApp();
      }
    }
  ];
  return (
    <>
      {/* basic info */}
      <Flex
        position={'relative'}
        direction={'column'}
        pr={5}
        pb={1}
        bgImage={'/imgs/images/picture/页面_3.png'}
        bgSize={'cover'}
        borderRadius={'md'}
        minH={'120px'}
      >
        <Flex h={'48px'}>
          {/* <Avatar src={appDetail.avatar} borderRadius={'md'} w={'28px'} /> */}
          <AIcon name="icon-biaoqian1" color={appDetail.selectColor}></AIcon>
          <Box
            ml={2}
            alignContent={'center'}
            fontWeight={'bold'}
            fontSize={'md'}
            flex={'1 0 0'}
            color={'myGray.900'}
            whiteSpace={'nowrap'}
            textOverflow={'ellipsis'}
            overflow={'hidden'}
          >
            {appDetail.name}
          </Box>
          <HStack gap={2}>
            {appOperations.map((item) => {
              return (
                <Box key={item.label}>
                  <Button
                    fontSize={'13px'}
                    // boxShadow={'2px 2px 3px rgb(0,0,0,0.2)'}
                    border={'1px  solid #e0e0e0'}
                    size={'sm'}
                    key={item.label}
                    minWidth={'100px'}
                    bgColor={'white'}
                    color={'black'}
                    p={0}
                    pl={'5px'}
                    display={'flex'}
                    _hover={{
                      border: '1px  solid #e0e0e0',
                      bgColor: 'rgb(237,241,244)'
                    }}
                    onClick={item.onclick}
                  >
                    <AIcon name={item.icon} color="primary.500" fontSize="22px"></AIcon>
                    <Text flex={1} textAlign={'center'}>
                      {item.label}
                    </Text>
                  </Button>
                </Box>
              );
            })}
          </HStack>
        </Flex>
        <Box
          flex={1}
          mt={1}
          mb={2}
          ml={5}
          p={1}
          // className={'textEllipsis3'}
          wordBreak={'break-all'}
          alignContent={'center'}
          borderRadius={'md'}
          // color={'myGray.600'}
          fontSize={'xs'}
          // minH={'46px'}
          border={'1px solid #d1d1d1'}
        >
          {appDetail.intro || '暂无介绍'}
        </Box>
        {/* <HStack alignItems={'center'}>
          <Button
            size={['sm', 'md']}
            variant={'whitePrimary'}
            leftIcon={<MyIcon name={'core/chat/chatLight'} w={'16px'} />}
            onClick={() => router.push(`/chat?appId=${appId}`)}
          >
            {t('common:core.Chat')}
          </Button>
          {appDetail.permission.hasManagePer && (
            <Button
              size={['sm', 'md']}
              variant={'whitePrimary'}
              leftIcon={<MyIcon name={'common/settingLight'} w={'16px'} />}
              onClick={onOpenInfoEdit}
            >
              {t('common:common.Setting')}
            </Button>
          )}
          {appDetail.permission.isOwner && (
            <MyMenu
              Button={
                <IconButton
                  variant={'whitePrimary'}
                  size={['smSquare', 'mdSquare']}
                  icon={<MyIcon name={'more'} w={'1rem'} />}
                  aria-label={''}
                />
              }
              menuList={[
                {
                  children: [
                    {
                      icon: 'core/app/type/workflow',
                      label: appT('transition_to_workflow'),
                      onClick: () => setTransitionCreateNew(true)
                    },
                    ...(appDetail.permission.hasWritePer && feConfigs?.show_team_chat
                      ? [
                          {
                            icon: 'core/chat/fileSelect',
                            label: t('common:common.Team Tags Set'),
                            onClick: () => setTeamTagsSet(appDetail)
                          }
                        ]
                      : [])
                  ]
                },
                {
                  children: [
                    {
                      icon: 'delete',
                      type: 'danger',
                      label: t('common:common.Delete'),
                      onClick: onDelApp
                    }
                  ]
                }
              ]}
            />
          )} */}
        {/* <Box flex={1} /> */}
        {/* {isPc && ( */}
        {/*   <MyTag */}
        {/*     type="borderFill" */}
        {/*     colorSchema="gray" */}
        {/*     onClick={() => (appDetail.permission.hasManagePer ? onOpenInfoEdit() : undefined)} */}
        {/*   > */}
        {/*     <PermissionIconText defaultPermission={appDetail.defaultPermission} /> */}
        {/*   </MyTag> */}
        {/* )} */}
        {/* </HStack> */}
      </Flex>
      {TeamTagsSet && <TagsEditModal onClose={() => setTeamTagsSet(undefined)} />}
      {transitionCreateNew !== undefined && (
        <MyModal
          isOpen
          minW={'250px'}
          title={<Text fontSize={'13px'}>{appT('transition_to_workflow')}</Text>}
          iconW="20px"
          titleBgc="#E2E3EA"
          iconSrc="/imgs/images/picture/tip.png"
        >
          <ModalBody minH={'100px'}>
            <Box fontSize={'13px'} mb={5}>
              {appT('transition_to_workflow_create_new_tip')}
            </Box>
            <HStack cursor={'pointer'} onClick={() => setTransitionCreateNew((state) => !state)}>
              <Checkbox
                isChecked={transitionCreateNew}
                icon={<MyIcon name={'common/check'} w={'12px'} />}
              />
              <Box fontSize={'13px'}>{appT('transition_to_workflow_create_new_placeholder')}</Box>
            </HStack>
          </ModalBody>
          <ModalFooter p={1} pr={3} borderTop={'1px solid #E2E3EA'}>
            <Button
              variant={'whiteCommon'}
              w={'70px'}
              size={'sm'}
              onClick={() => setTransitionCreateNew(undefined)}
              mr={3}
            >
              {t('common:common.Cancel')}
            </Button>
            <Button
              variant={'blackCommon'}
              w={'70px'}
              size={'sm'}
              isLoading={transiting}
              onClick={() => onTransition()}
            >
              {t('common:common.Confirm')}
            </Button>
          </ModalFooter>
        </MyModal>
      )}
    </>
  );
};

export default React.memo(AppCard);
