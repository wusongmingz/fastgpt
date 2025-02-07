import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Box, Grid, Flex, IconButton, HStack, useDisclosure, Text } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import {
  delAppById,
  putAppById,
  resumeInheritPer,
  changeOwner,
  getMyApps
} from '@/web/core/app/api';
import { useConfirm } from '@fastgpt/web/hooks/useConfirm';
import MyIcon from '@fastgpt/web/components/common/Icon';
import Avatar from '@fastgpt/web/components/common/Avatar';
import PermissionIconText from '@/components/support/permission/IconText';
import EmptyTip from '@fastgpt/web/components/common/EmptyTip';
import CreateFolderOrApp from './CreateFolderOrApp';
import { useTranslation } from 'next-i18next';
import MyBox from '@fastgpt/web/components/common/MyBox';
import { useRequest2 } from '@fastgpt/web/hooks/useRequest';
import { useContextSelector } from 'use-context-selector';
import { AppListContext } from '../../app/list/components/context';
import { AppFolderTypeList, AppTypeEnum } from '@fastgpt/global/core/app/constants';
import { useFolderDrag } from '@/components/common/folder/useFolderDrag';
import dynamic from 'next/dynamic';
import type { EditResourceInfoFormType } from '@/components/common/Modal/EditResourceModal';
import MyMenu from '@fastgpt/web/components/common/MyMenu';
import {
  AppDefaultPermissionVal,
  AppPermissionList
} from '@fastgpt/global/support/permission/app/constant';
import {
  deleteAppCollaborators,
  getCollaboratorList,
  postUpdateAppCollaborators
} from '@/web/core/app/api/collaborator';
import MyTooltip from '@fastgpt/web/components/common/MyTooltip';
import AppTypeTag from '@/pages/app/list/components/TypeTag';

const EditResourceModal = dynamic(() => import('@/components/common/Modal/EditResourceModal'));
const ConfigPerModal = dynamic(() => import('@/components/support/permission/ConfigPerModal'));

import type { EditHttpPluginProps } from '../../app/list/components/HttpPluginEditModal';
import { postCopyApp } from '@/web/core/app/api/app';
import { formatTimeToChatTime } from '@fastgpt/global/common/string/time';
import { useSystem } from '@fastgpt/web/hooks/useSystem';
import { useChatStore } from '@/web/core/chat/context/storeChat';
import { useUserStore } from '@/web/support/user/useUserStore';
import NoAppdataPage from './NoAppdataPage';
import AIcon from '@/components/AIcon/AIcon';
import { color } from 'framer-motion';
import { useMemoizedFn } from 'ahooks';
import { AppListItemType } from '@fastgpt/global/core/app/type';
import { nextTick } from 'process';
const HttpEditModal = dynamic(() => import('../../app/list/components/HttpPluginEditModal'));

const ListItem = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { parentId = null } = router.query;
  const { isPc } = useSystem();
  const { isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose } = useDisclosure();
  const { loadAndGetTeamMembers } = useUserStore();
  const { lastChatAppId, setLastChatAppId } = useChatStore();

  const { myApps, loadMyApps, onUpdateApp, setMoveAppId, folderDetail, setSearchKey } =
    useContextSelector(AppListContext, (v) => v);
  const [loadingAppId, setLoadingAppId] = useState<string>();

  const [editedApp, setEditedApp] = useState<EditResourceInfoFormType>();
  const [editHttpPlugin, setEditHttpPlugin] = useState<EditHttpPluginProps>();
  const [editPerAppIndex, setEditPerAppIndex] = useState<number>();

  const editPerApp = useMemo(
    () => (editPerAppIndex !== undefined ? myApps[editPerAppIndex] : undefined),
    [editPerAppIndex, myApps]
  );

  const { getBoxProps } = useFolderDrag({
    activeStyles: {
      borderColor: 'primary.600'
    },
    onDrop: async (dragId: string, targetId: string) => {
      setLoadingAppId(dragId);
      try {
        await putAppById(dragId, { parentId: targetId });
        loadMyApps();
      } catch (error) {}
      setLoadingAppId(undefined);
    }
  });

  const { openConfirm: openConfirmDel, ConfirmModal: DelConfirmModal } = useConfirm({
    type: 'delete'
  });
  const { runAsync: onclickDelApp } = useRequest2(
    (id: string) => {
      if (id === lastChatAppId) {
        setLastChatAppId('');
      }
      return delAppById(id);
    },
    {
      onSuccess() {
        loadMyApps();
      },
      successToast: t('common:common.Delete Success'),
      errorToast: t('common:common.Delete Failed')
    }
  );
  const appBgImageMap = {
    [AppTypeEnum.folder]: '/imgs/images/picture/页面_2.png',
    [AppTypeEnum.simple]: '/imgs/images/picture/弥散渐变卡片.png',
    [AppTypeEnum.workflow]: '/imgs/images/picture/workflow.svg',
    [AppTypeEnum.plugin]: '/imgs/images/picture/plugin.svg',
    [AppTypeEnum.httpPlugin]: '/imgs/images/picture/plugin.svg'
  };
  const appNames = {
    [AppTypeEnum.simple]: { name: t('app:type.Simple bot'), icon: 'icon-duihua' },
    [AppTypeEnum.workflow]: { name: '工作流', icon: 'icon-duihua' },
    [AppTypeEnum.plugin]: { name: '插件', icon: 'icon-yunhang' },
    [AppTypeEnum.httpPlugin]: { name: '插件', icon: 'icon-yunhang' }
  };
  const appIconsMap = {
    [AppTypeEnum.simple]: { name: 'icon-biaoqian1', fontSize: '25px' },
    [AppTypeEnum.workflow]: { name: 'icon-biaoqian2', fontSize: '30px' },
    [AppTypeEnum.plugin]: { name: 'icon-guanyuchajian', fontSize: '30px' },
    [AppTypeEnum.httpPlugin]: {
      name: 'icon-guanyuchajian',
      color: 'rgb(0,140,140)',
      fontSize: '30px'
    }
  };
  const { openConfirm: openConfirmCopy, ConfirmModal: ConfirmCopyModal } = useConfirm({
    content: t('app:confirm_copy_app_tip')
  });
  const tips = useRef('');
  const deleteAppOrFolerTip = async (app: AppListItemType) => {
    if (app.type === AppTypeEnum.folder) {
      const apps = await getMyApps({ parentId: app._id });
      if (apps.length > 0) {
        tips.current = t('app:confirm_delete_folder_tip');
      } else {
        tips.current = t('common:common.delete none data folder');
      }
    } else {
      tips.current = t('app:confirm_del_app_tip', {
        name: app.name
      });
    }
  };
  const { runAsync: onclickCopy } = useRequest2(postCopyApp, {
    onSuccess({ appId }) {
      router.push(`/app/detail?appId=${appId}`);
      loadMyApps();
    },
    successToast: t('app:create_copy_success')
  });

  const { data: members = [] } = useRequest2(loadAndGetTeamMembers, {
    manual: false
  });

  const { runAsync: onResumeInheritPermission } = useRequest2(
    () => {
      return resumeInheritPer(editPerApp!._id);
    },
    {
      manual: true,
      errorToast: t('common:permission.Resume InheritPermission Failed'),
      onSuccess() {
        loadMyApps();
      }
    }
  );

  return (
    <>
      <Grid
        py={3}
        gridTemplateColumns={
          folderDetail
            ? ['1fr', 'repeat(2,1fr)', 'repeat(2,1fr)', 'repeat(4,1fr)', 'repeat(5,1fr)']
            : ['1fr', 'repeat(2,1fr)', 'repeat(3,1fr)', 'repeat(4,1fr)', 'repeat(5,1fr)']
        }
        gridGap={3}
        alignItems={'stretch'}
      >
        <Flex
          w={'100%'}
          h={'150px'}
          bgImage={'/imgs/images/picture/appbackgroundimage.png'}
          borderRadius={'10px'}
          bgSize={'cover'}
          transition={'all 0.3s'}
          cursor={'pointer'}
          onClick={() => {
            onCreateOpen();
          }}
          // boxShadow={3.5}
          _hover={{
            boxShadow: '5px 5px 4px rgba(0,0,0,0.15)'
          }}
        >
          <AIcon
            name="icon-biaoqian1"
            color={'rgb(0,47,167)'}
            fontSize="25px"
            position={'absolute'}
          ></AIcon>
          <AIcon name="icon-xinzeng" fontSize={'60px'} m={'auto'} color={'primary.500'}></AIcon>
        </Flex>
        {/* <MyTooltip
              key={app._id}
              h="100%"
              label={
                app.type === AppTypeEnum.folder
                  ? t('common:common.folder.Open folder')
                  : app.permission.hasWritePer
                    ? t('app:edit_app')
                    : t('app:go_to_chat')
              }
            > */}
        {myApps.map((app, index) => {
          const owner = members.find((v) => v.tmbId === app.tmbId);
          return (
            <MyBox
              isLoading={loadingAppId === app._id}
              lineHeight={1.5}
              h="150px"
              w={'100%'}
              bgImage={'/imgs/images/picture/appbackgroundimage.png'}
              bgSize={'cover'}
              key={app._id}
              cursor={'pointer'}
              borderRadius={'10px'}
              position={'relative'}
              display={'flex'}
              overflow={'hidden'}
              flexDirection={'column'}
              transition={'all 0.3s'}
              // boxShadow={3.5}
              _hover={{
                boxShadow: '5px 5px 4px rgba(0,0,0,0.15)',
                // scale: 1.05,
                '& .more': {
                  display: 'flex'
                }
                // '& .time': {
                //   display: ['flex', 'none']
                // }
              }}
              onClick={() => {
                if (AppFolderTypeList.includes(app.type)) {
                  setSearchKey('');
                  router.push({
                    query: {
                      ...router.query,
                      parentId: app._id
                    }
                  });
                } else if (app.permission.hasWritePer) {
                  // if (
                  //   app.type === AppTypeEnum.workflow ||
                  //   app.type === AppTypeEnum.plugin ||
                  //   app.type === AppTypeEnum.httpPlugin
                  // ) {
                  //   router.push(`/app/detail?appId=${app._id}&appType=${app.type}`);
                  //   return;
                  // }
                  router.push(`/app/detail?appId=${app._id}&appType=${app.type}`);
                } else {
                  router.push(`/chat?appId=${app._id}`);
                }
              }}
              {...getBoxProps({
                dataId: app._id,
                isFolder: app.type === AppTypeEnum.folder
              })}
            >
              <Flex pr={'5px'}>
                {app.type === AppTypeEnum.folder && (
                  <Avatar
                    src={'/imgs/images/picture/文件.png'}
                    m={'10px'}
                    ml={'20px'}
                    borderRadius={'sm'}
                    // boxShadow={'2px 2px 4px rgba(0,0,0,0.2)'}
                    w={'30px'}
                  />
                )}
                {app.type != AppTypeEnum.folder && (
                  <AIcon
                    {...(appIconsMap[app.type] || {})}
                    color={app.selectColor}
                    w={'50px !important'}
                    h={'60px !important'}
                  ></AIcon>
                )}
                <Box
                  h={'40px'}
                  flex={1}
                  alignContent={'center'}
                  whiteSpace={'nowrap'}
                  textOverflow={'ellipsis'}
                  overflow={'hidden'}
                  color={'myGray.900'}
                >
                  {app.name}
                </Box>
                {/* <Box mr={'-1.25rem'}>
                  <AppTypeTag type={app.type} />
                </Box> */}
                {app.permission.hasWritePer && (
                  <Box className="more" display={['', 'flex']}>
                    <MyMenu
                      Button={<MyIcon name={'more'} w={'1.2rem'} color={'black'} />}
                      menuList={[
                        // ...([AppTypeEnum.simple, AppTypeEnum.workflow].includes(app.type)
                        //   ? [
                        //       {
                        //         children: [
                        //           {
                        //             icon: 'core/chat/chatLight',
                        //             label: t('app:go_to_chat'),
                        //             onClick: () => {
                        //               router.push(`/chat?appId=${app._id}`);
                        //             }
                        //           }
                        //         ]
                        //       }
                        //     ]
                        //   : []),
                        // ...([AppTypeEnum.plugin].includes(app.type)
                        //   ? [
                        //       {
                        //         children: [
                        //           {
                        //             icon: 'core/chat/chatLight',
                        //             label: t('app:go_to_run'),
                        //             onClick: () => {
                        //               router.push(`/chat?appId=${app._id}`);
                        //             }
                        //           }
                        //         ]
                        //       }
                        //     ]
                        //   : []),
                        ...(app.permission.hasManagePer
                          ? [
                              {
                                children: [
                                  {
                                    icon: 'icon-zhongmingming',
                                    color: 'rgb(64,109,177)',
                                    label: t('common:common.Rename'),
                                    onClick: () => {
                                      if (app.type === AppTypeEnum.httpPlugin) {
                                        setEditHttpPlugin({
                                          id: app._id,
                                          name: app.name,
                                          avatar: 'app.avatar',
                                          intro: app.intro,
                                          pluginData: app.pluginData
                                        });
                                      } else {
                                        setEditedApp({
                                          id: app._id,
                                          avatar: app.avatar,
                                          name: app.name,
                                          intro: app.intro
                                        });
                                      }
                                    }
                                  },
                                  ...(folderDetail?.type === AppTypeEnum.httpPlugin
                                    ? []
                                    : [
                                        {
                                          icon: 'icon-move',
                                          color: '#8789f8',
                                          label: t('common:common.folder.Move to'),
                                          onClick: () => setMoveAppId(app._id)
                                        }
                                      ]),
                                  // ...(app.permission.hasManagePer
                                  //   ? [
                                  //       {
                                  //         icon: 'icon-quanxianguanli',
                                  //         color: 'rgb(132,134,248)',
                                  //         label: '权限查看',
                                  //         onClick: () => setEditPerAppIndex(index)
                                  //       }
                                  //     ]
                                  //   : []),
                                  ...(app.permission.hasManagePer
                                    ? [
                                        {
                                          // children: [
                                          // {
                                          // type: 'danger' as 'danger',
                                          icon: 'icon-shanchu',
                                          color: 'rgb(255,190,61)',
                                          label: t('common:common.Delete'),
                                          onClick: async () => {
                                            await deleteAppOrFolerTip(app);
                                            openConfirmDel(
                                              () => onclickDelApp(app._id),
                                              undefined,
                                              tips.current
                                            )();
                                          }

                                          // }
                                          // ]
                                        }
                                      ]
                                    : [])
                                ]
                              }
                            ]
                          : [])

                        // ...(AppFolderTypeList.includes(app.type)
                        //   ? []
                        //   : [
                        //       {
                        //         children: [
                        //           {
                        //             icon: 'copy',
                        //             label: t('app:copy_one_app'),
                        //             onClick: () =>
                        //               openConfirmCopy(() => onclickCopy({ appId: app._id }))()
                        //           }
                        //         ]
                        //       }
                        //     ]),
                      ]}
                    />
                  </Box>
                )}
              </Flex>
              <Box
                flex={['1 0 60px', '1 0 60px']}
                textAlign={'justify'}
                wordBreak={'break-all'}
                fontSize={'xs'}
                color={'myGray.500'}
                p={'0px 12px'}
              >
                <Box className={'textEllipsis2'}>{app.intro || t('common:common.no_intro')}</Box>
              </Box>
              <Flex
                h={'32px'}
                alignItems={'center'}
                justifyContent={'space-between'}
                fontSize={'mini'}
                color={'myGray.500'}
                // bgColor={'#fff'}
                pr={'5px'}
              >
                {/* <HStack spacing={3.5}> */}
                {/* {owner && (
                    <HStack spacing={1}>
                      <Avatar src={owner.avatar} w={'0.875rem'} borderRadius={'50%'} />
                      <Box maxW={'150px'} className="textEllipsis">
                        {owner.memberName}
                      </Box>
                    </HStack>
                  )}

                  <PermissionIconText
                    defaultPermission={app.defaultPermission}
                    color={'myGray.500'}
                    iconColor={'myGray.400'}
                    w={'0.875rem'}
                  /> */}
                {app.type === AppTypeEnum.folder && (
                  <>
                    <Text flex={1} pl={'15px'} color={'black'} fontWeight={'bold'}>
                      目录
                    </Text>
                  </>
                )}
                {app.type != AppTypeEnum.folder && (
                  <>
                    <Text flex={1} pl={'15px'} color={'black'} fontWeight={'bold'}>
                      {appNames[app.type].name}
                    </Text>
                    <AIcon
                      name={appNames[app.type].icon}
                      color="primary.500"
                      fontSize="25px"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/chat?appId=${app._id}`);
                      }}
                    ></AIcon>
                  </>
                )}
                {/* </HStack> */}

                {/* <HStack> */}
                {/* {isPc && (
                    <HStack spacing={0.5} className="time">
                      <MyIcon name={'history'} w={'0.85rem'} color={'myGray.400'} />
                      <Box color={'myGray.500'}>{formatTimeToChatTime(app.updateTime)}</Box>
                    </HStack>
                  )} */}
                {/* </HStack> */}
              </Flex>
            </MyBox>
          );
        })}
      </Grid>

      {/* {myApps.length === 0 && <EmptyTip text={t('common:core.app.no_app')} pt={'30vh'} />} */}

      <DelConfirmModal />
      <ConfirmCopyModal />
      {!!editedApp && (
        <EditResourceModal
          {...editedApp}
          title={t('common:core.app.edit_content')}
          onClose={() => {
            setEditedApp(undefined);
          }}
          onEdit={({ id, ...data }) => onUpdateApp(id, data)}
        />
      )}
      {!!editPerApp && (
        <ConfigPerModal
          onChangeOwner={(tmbId: string) =>
            changeOwner({
              appId: editPerApp._id,
              ownerId: tmbId
            }).then(() => loadMyApps())
          }
          refetchResource={loadMyApps}
          hasParent={Boolean(parentId)}
          resumeInheritPermission={onResumeInheritPermission}
          isInheritPermission={editPerApp.inheritPermission}
          avatar={editPerApp.avatar}
          name={editPerApp.name}
          defaultPer={{
            value: editPerApp.defaultPermission,
            defaultValue: AppDefaultPermissionVal,
            onChange: (e: any) => {
              return onUpdateApp(editPerApp._id, { defaultPermission: e });
            }
          }}
          managePer={{
            permission: editPerApp.permission,
            onGetCollaboratorList: () => getCollaboratorList(editPerApp._id),
            permissionList: AppPermissionList,
            onUpdateCollaborators: ({
              members = [], // TODO: remove the default value after group is ready
              permission
            }: {
              members?: string[];
              permission: number;
            }) => {
              return postUpdateAppCollaborators({
                members,
                permission,
                appId: editPerApp._id
              });
            },

            onDelOneCollaborator: (props) =>
              deleteAppCollaborators({
                appId: editPerApp._id,
                ...props
              }),
            refreshDeps: [editPerApp.inheritPermission]
          }}
          onClose={() => setEditPerAppIndex(undefined)}
        />
      )}
      {!!editHttpPlugin && (
        <HttpEditModal
          defaultPlugin={editHttpPlugin}
          onClose={() => setEditHttpPlugin(undefined)}
        />
      )}
      <CreateFolderOrApp isOpen={isCreateOpen} onClose={onCreateClose}></CreateFolderOrApp>
    </>
  );
};

export default ListItem;
