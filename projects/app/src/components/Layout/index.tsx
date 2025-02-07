import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  background,
  Box,
  Button,
  calc,
  Flex,
  HStack,
  ModalBody,
  Stack,
  Text,
  useDisclosure,
  useToast
} from '@chakra-ui/react';
import { GET } from '@/web/common/api/request';

import { useRouter } from 'next/router';
import { useLoading } from '@fastgpt/web/hooks/useLoading';
import { useSystemStore } from '@/web/common/system/useSystemStore';
import { useQuery } from '@tanstack/react-query';
import { useUserStore } from '@/web/support/user/useUserStore';
import { getUnreadCount } from '@/web/support/user/inform/api';
import dynamic from 'next/dynamic';
import { useI18nLng } from '@fastgpt/web/hooks/useI18n';
import { Image } from '@chakra-ui/react';
import Auth from './auth';
import { useSystem } from '@fastgpt/web/hooks/useSystem';
import { useLocalStorageState, useMount } from 'ahooks';
import Icon from '@fastgpt/web/components/common/Icon';
import AIcon from '../AIcon/AIcon';
import { AppTypeEnum } from '@fastgpt/global/core/app/constants';
import LayoutHeader from './LayoutHeader';
import { HUMAN_ICON } from '@fastgpt/global/common/system/constants';
import MyModal from '@fastgpt/web/components/common/MyModal';
import { useConfirm } from '@fastgpt/web/hooks/useConfirm';
import { useTranslation } from 'react-i18next';
import MyTooltip from '@fastgpt/web/components/common/MyTooltip';
import EditPasswordModal from './EditPasswordModal';
import { TeamType } from '@/global/core/chat/api';
import TeamModal from './TeamModal';
import { useRequest2 } from '@fastgpt/web/hooks/useRequest';
import { useSelectFile } from '@/web/common/file/hooks/useSelectFile';
import { compressImgFileAndUpload } from '@/web/common/file/controller';
import { MongoImageTypeEnum } from '@fastgpt/global/common/file/image/constants';
import { UserType } from '@fastgpt/global/support/user/type';
import { useForm } from 'react-hook-form';
import { UserUpdateParams } from '@/types/user';
import Avatar from '@fastgpt/web/components/common/Avatar';
const Navbar = dynamic(() => import('./navbar'));
const NavbarPhone = dynamic(() => import('./navbarPhone'));
const UpdateInviteModal = dynamic(() => import('@/components/support/user/team/UpdateInviteModal'));
const NotSufficientModal = dynamic(() => import('@/components/support/wallet/NotSufficientModal'));
const SystemMsgModal = dynamic(() => import('@/components/support/user/inform/SystemMsgModal'));
const ImportantInform = dynamic(() => import('@/components/support/user/inform/ImportantInform'));

const pcUnShowLayoutRoute: Record<string, boolean> = {
  '/': true,
  '/login': true,
  '/login/provider': true,
  '/login/fastlogin': true,
  '/chat/share': true,
  '/chat/team': true,
  '/app/edit': true,
  '/chat': false,
  '/tools/price': true,
  '/price': true
};
const phoneUnShowLayoutRoute: Record<string, boolean> = {
  '/': true,
  '/login': true,
  '/login/provider': true,
  '/login/fastlogin': true,
  '/chat/share': true,
  '/chat/team': true,
  '/tools/price': true,
  '/price': true
};

const Layout = ({ children }: { children: JSX.Element }) => {
  const router = useRouter();
  const { t } = useTranslation();
  const { Loading } = useLoading();
  const { loading, feConfigs, isNotSufficientModal } = useSystemStore();
  const { isPc } = useSystem();
  const { userInfo, setUserInfo, updateUserInfo } = useUserStore();
  const { setUserDefaultLng } = useI18nLng();
  const [defaultTeam, setDefaultTeam] = useLocalStorageState<TeamType | undefined>('defaultTeam');
  const { teamList } = useUserStore();
  const toast = useToast();
  useEffect(() => {
    if (
      !defaultTeam ||
      !teamList?.find((item) => {
        return item._id === defaultTeam?._id;
      })
    ) {
      setDefaultTeam(teamList?.[0] ?? undefined);
    }
  }, [teamList]);
  const isChatPage = useMemo(
    () => router.pathname === '/chat' && Object.values(router.query).join('').length !== 0,
    [router.pathname, router.query]
  );
  const { File, onOpen: onOpenSelectFile } = useSelectFile({
    fileType: '.jpg,.png',
    multiple: false
  });
  const { reset } = useForm<UserUpdateParams>({
    defaultValues: userInfo as UserType
  });
  const onclickSave = useCallback(
    async (data: UserType) => {
      await updateUserInfo({
        avatar: data.avatar,
        timezone: data.timezone,
        openaiAccount: data.openaiAccount
      });
      reset(data);
      toast({
        title: t('common:dataset.data.Update Success Tip'),
        status: 'success'
      });
    },
    [reset, toast, updateUserInfo]
  );
  const onSelectFile = useCallback(
    async (e: File[]) => {
      const file = e[0];
      if (!file || !userInfo) return;
      try {
        const src = await compressImgFileAndUpload({
          type: MongoImageTypeEnum.userAvatar,
          file,
          maxW: 300,
          maxH: 300
        });

        onclickSave({
          ...userInfo,
          avatar: src
        });
      } catch (err: any) {
        toast({
          title: typeof err === 'string' ? err : t('common:common.error.Select avatar failed'),
          status: 'warning'
        });
      }
    },
    [onclickSave, t, toast, userInfo]
  );
  const {
    isOpen: isChangeTeamOpen,
    onOpen: onChangeTeamOpen,
    onClose: onChangeTeamClose
  } = useDisclosure();
  const {
    isOpen: isShowUserInfoOpen,
    onOpen: onShowUserInfoOpen,
    onClose: onShowUserInfoClose
  } = useDisclosure();
  const {
    isOpen: isShowEditPasswordOpen,
    onOpen: onShowEditPasswordOpen,
    onClose: onShowEditPasswordClose
  } = useDisclosure();
  const [appType, setAppType] = useState<string | string[] | undefined>('');
  useEffect(() => {
    setAppType(router.query.appType);
  }, [router.query]);
  const { openConfirm, ConfirmModal } = useConfirm({
    content: t('common:support.user.logout.confirm')
  });

  const userMenuList = [
    {
      icon: 'icon-qiehuan',
      name: '切换团队',
      rightIcon: 'icon-shousuo1',
      isopen: isChangeTeamOpen,
      onclick: () => {
        onChangeTeamOpen();
      }
    },
    {
      // icon: 'icon-shiyongwendang',
      name: '个人信息',
      leftAvatar: userInfo?.avatar || HUMAN_ICON,
      onclick: () => {
        onShowUserInfoOpen();
      }
    },
    {
      icon: 'icon-chanpinwendang',
      name: '产品文档',
      onclick: () => {}
    },
    {
      icon: 'icon-tuichudenglu',
      name: '退出登录',
      onclick: () => {
        openConfirm(() => {
          setUserInfo(null);
          setDefaultTeam(undefined);
          router.replace('/login');
        })();
      }
    }
  ];
  const [isShowUserInfoMenu, setIsShowUserInfoMenu] = useState(false);
  const userInfoMenuRef = useRef<HTMLDivElement>(null);
  const displayMenuRef = useRef<HTMLDivElement>(null);
  // System hook
  const { data, refetch: refetchUnRead } = useQuery(['getUnreadCount'], getUnreadCount, {
    enabled: !!userInfo && !!feConfigs.isPlus,
    refetchInterval: 10000
  });
  const unread = data?.unReadCount || 0;
  const importantInforms = data?.importantInforms || [];

  const isHideNavbar = !!pcUnShowLayoutRoute[router.pathname];
  useEffect(() => {
    const handleClickOutSide = (e: MouseEvent) => {
      if (
        userInfoMenuRef.current &&
        !userInfoMenuRef.current.contains(e.target as Node) &&
        !displayMenuRef.current?.contains(e.target as Node)
      ) {
        setIsShowUserInfoMenu(false);
      }
    };
    document.addEventListener('click', handleClickOutSide);
    return () => {
      document.removeEventListener('click', handleClickOutSide);
    };
  }, [userInfoMenuRef.current]);
  useMount(() => {
    setUserDefaultLng();
  });

  // const teamList: TeamType[] = [
  //   {
  //     avatar: HUMAN_ICON,
  //     name: '团队1'
  //   },
  //   {
  //     avatar: HUMAN_ICON,
  //     name: '团队2'
  //   },
  //   {
  //     avatar: HUMAN_ICON,
  //     name: '团队3'
  //   },
  //   {
  //     avatar: HUMAN_ICON,
  //     name: '团队4'
  //   }
  // ];
  const { openConfirm: openEditConfirm, ConfirmModal: EditConfirmModal } = useConfirm({
    content:
      '确认切换团队并刷新页面吗？请确保你的应用、知识库等已经被妥善保存。刷新后，已打开的页面不再保留'
  });
  return (
    <>
      <Box h={'100%'} bgImage={'/imgs/home/background.png'}>
        {isPc === true && (
          <>
            {isHideNavbar ||
            appType === AppTypeEnum.plugin ||
            appType === AppTypeEnum.workflow ||
            appType === AppTypeEnum.httpPlugin ? (
              <Auth>{children}</Auth>
            ) : (
              <>
                <Flex direction={'column'} h={'100%'}>
                  <LayoutHeader
                    userMenuList={userMenuList}
                    defaultTeam={defaultTeam}
                    userInfo={userInfo}
                  ></LayoutHeader>
                  <Flex flex={1} direction={'row'} bg={'rgb(252,242,244,0.8)'} w={'100%'}>
                    {!isChatPage && (
                      <Box h={'100%'} w={'240px'} m={'10px'}>
                        <Navbar unread={unread} />
                      </Box>
                    )}

                    <Box h={'100%'} flex={1}>
                      <Auth>{children}</Auth>
                    </Box>
                  </Flex>
                </Flex>
                {/*               <>
                <Box h={'100%'} position={'fixed'} left={0} top={0} w={'64px'}>
                  <Navbar unread={unread} />
                </Box>
                <Box h={'100%'} ml={'70px'} overflow={'overlay'}>
                  <Auth>{children}</Auth>
                </Box>
              </> */}
              </>
            )}
          </>
        )}
        {isPc === false && (
          <>
            {phoneUnShowLayoutRoute[router.pathname] || isChatPage ? (
              <Auth>{children}</Auth>
            ) : (
              <Flex h={'100%'} flexDirection={'column'}>
                <Box flex={'1 0 0'} h={0}>
                  <Auth>{children}</Auth>
                </Box>
                <Box h={'50px'} borderTop={'1px solid rgba(0,0,0,0.1)'}>
                  <NavbarPhone unread={unread} />
                </Box>
              </Flex>
            )}
          </>
        )}
      </Box>
      {feConfigs?.isPlus && (
        <>
          {!!userInfo && <UpdateInviteModal />}
          {isNotSufficientModal && <NotSufficientModal />}
          {!!userInfo && <SystemMsgModal />}
          {!!userInfo && importantInforms.length > 0 && (
            <ImportantInform informs={importantInforms} refetch={refetchUnRead} />
          )}
        </>
      )}
      {isChangeTeamOpen && (
        <TeamModal
          onClose={onChangeTeamClose}
          teamList={teamList}
          defaultTeam={defaultTeam}
          openEditConfirm={(team: TeamType) => {
            openEditConfirm(() => {
              setDefaultTeam(team);
            })();
          }}
        ></TeamModal>
      )}
      {isShowUserInfoOpen && (
        <MyModal
          title={t('user:personal_information')}
          titleBgc="#e2e3ea"
          onClose={onShowUserInfoClose}
        >
          <ModalBody>
            <Stack>
              <Flex alignItems={'center'} py={2}>
                <Text w={'100px'}>{t('common:support.user.Avatar')}:</Text>
                <MyTooltip label={t('common:common.avatar.Select Avatar')} placement="bottom">
                  <Avatar
                    cursor={'pointer'}
                    src={userInfo?.avatar || HUMAN_ICON}
                    fallbackSrc={HUMAN_ICON}
                    w={'40px'}
                    borderRadius={'20px'}
                    onClick={onOpenSelectFile}
                  ></Avatar>
                </MyTooltip>
              </Flex>
              <Flex minH={'40px'} alignItems={'center'}>
                <Text w={'100px'}>{t('common:user.Account')}:</Text>
                <Text>{userInfo?.username}</Text>
              </Flex>
              <Flex minH={'40px'} alignItems={'center'}>
                <Text w={'100px'}>{t('common:user.Password')}:</Text>
                <Text>********</Text>
                <Box flex={1}></Box>
                <Button
                  variant={'whiteCommon'}
                  size={'sm'}
                  w={'85px'}
                  onClick={() => {
                    onShowEditPasswordOpen();
                    onShowUserInfoClose();
                  }}
                >
                  {t('common:user.Change')}
                </Button>
              </Flex>
              <Flex minH={'40px'} alignItems={'center'}>
                <Text w={'100px'}>{t('common:user.In_team')}:</Text>
                <Text>{defaultTeam?.name}</Text>
              </Flex>
            </Stack>
          </ModalBody>
        </MyModal>
      )}
      {isShowEditPasswordOpen && <EditPasswordModal onclose={onShowEditPasswordClose} />}
      <EditConfirmModal />
      <Loading loading={loading} zIndex={999999} />
      <ConfirmModal />
      <File onSelect={onSelectFile} />
    </>
  );
};

export default Layout;
