import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  Center,
  Drawer,
  DrawerCloseButton,
  DrawerContent,
  DrawerOverlay,
  Flex,
  useDisclosure
} from '@chakra-ui/react';
import { LoginPageTypeEnum } from '@/web/support/user/login/constants';
import { useSystemStore } from '@/web/common/system/useSystemStore';
import type { ResLogin } from '@/global/support/api/userRes.d';
import { useRouter } from 'next/router';
import { useUserStore } from '@/web/support/user/useUserStore';
import { useChatStore } from '@/web/core/chat/context/storeChat';
import LoginForm from './components/LoginForm/LoginForm';
import dynamic from 'next/dynamic';
import { serviceSideProps } from '@/web/common/utils/i18n';
import { clearToken, setToken } from '@/web/support/user/auth';
import Script from 'next/script';
import Loading from '@fastgpt/web/components/common/MyLoading';
import { useLocalStorageState, useMount } from 'ahooks';
import { useTranslation } from 'next-i18next';
import I18nLngSelector from '@/components/Select/I18nLngSelector';
import { useSystem } from '@fastgpt/web/hooks/useSystem';
import { GET } from '@/web/common/api/request';
import { getDocPath } from '@/web/common/system/doc';
import { getWebReqUrl } from '@fastgpt/web/common/system/utils';
import Image from 'next/image';
import MyImage from '@fastgpt/web/components/common/Image/MyImage';
import { getTeamLists } from '@/web/support/user/team/api';
// import GLOBE from 'vanta/dist/vanta.net.min';
// import * as THREE from './three.r134.min';
const RegisterForm = dynamic(() => import('./components/RegisterForm'));
const ForgetPasswordForm = dynamic(() => import('./components/ForgetPasswordForm'));
const WechatForm = dynamic(() => import('./components/LoginForm/WechatForm'));
const CommunityModal = dynamic(() => import('@/components/CommunityModal'));

const ipDetectURL = 'https://qifu-api.baidubce.com/ip/local/geo/v1/district';

const Login = ({ ChineseRedirectUrl }: { ChineseRedirectUrl: string }) => {
  const router = useRouter();
  const { t } = useTranslation();
  const { lastRoute = '' } = router.query as { lastRoute: string };
  const { feConfigs } = useSystemStore();
  const [pageType, setPageType] = useState<`${LoginPageTypeEnum}`>();
  const { setUserInfo, setTeamList } = useUserStore();
  const { setLastChatId, setLastChatAppId } = useChatStore();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isPc } = useSystem();

  const {
    isOpen: isOpenCookiesDrawer,
    onOpen: onOpenCookiesDrawer,
    onClose: onCloseCookiesDrawer
  } = useDisclosure();
  const cookieVersion = '1';
  const [localCookieVersion, setLocalCookieVersion] =
    useLocalStorageState<string>('localCookieVersion');

  const loginSuccess = useCallback(
    async (res: ResLogin) => {
      // init store
      setLastChatId('');
      setLastChatAppId('');

      setUserInfo(res.user);
      setToken(res.token);

      //获取团队存在store中
      const teamList = await getTeamLists();
      setTeamList(teamList);
      setTimeout(() => {
        router.push(lastRoute ? decodeURIComponent(lastRoute) : '/applicationCenter');
      }, 300);
    },
    [lastRoute, router, setLastChatId, setLastChatAppId, setUserInfo]
  );

  function DynamicComponent({ type }: { type: `${LoginPageTypeEnum}` }) {
    const TypeMap = {
      [LoginPageTypeEnum.passwordLogin]: LoginForm,
      [LoginPageTypeEnum.register]: RegisterForm,
      [LoginPageTypeEnum.forgetPassword]: ForgetPasswordForm,
      [LoginPageTypeEnum.wechat]: WechatForm
    };

    const Component = TypeMap[type];

    return <Component setPageType={setPageType} loginSuccess={loginSuccess} />;
  }

  /* default login type */
  useEffect(() => {
    const bd_vid = sessionStorage.getItem('bd_vid');
    if (bd_vid) {
      setPageType(LoginPageTypeEnum.passwordLogin);
      return;
    }
    setPageType(
      feConfigs?.oauth?.wechat ? LoginPageTypeEnum.wechat : LoginPageTypeEnum.passwordLogin
    );
  }, [feConfigs.oauth]);

  const {
    isOpen: isOpenRedirect,
    onOpen: onOpenRedirect,
    onClose: onCloseRedirect
  } = useDisclosure();
  const [showRedirect, setShowRedirect] = useLocalStorageState<boolean>('showRedirect', {
    defaultValue: true
  });
  const checkIpInChina = useCallback(async () => {
    try {
      const res = await GET<any>(ipDetectURL);
      const country = res?.country;
      if (
        country &&
        country === '中国' &&
        res.prov !== '中国香港' &&
        res.prov !== '中国澳门' &&
        res.prov !== '中国台湾'
      ) {
        onOpenRedirect();
      }
    } catch (error) {
      console.log(error);
    }
  }, [onOpenRedirect]);
  const loginbgRef = useRef(null);
  const [vantaEffect, setVantaEffect] = useState(0);
  // useEffect(() => {
  //   if (!vantaEffect) {
  //     if (typeof THREE !== 'undefined') {
  //       setVantaEffect(
  //         GLOBE({
  //           THREE,
  //           el: loginbgRef.current,
  //           mouseControls: true,
  //           touchControls: true,
  //           gyroControls: false,
  //           minHeight: 200.0,
  //           minWidth: 200.0,
  //           scale: 1.0,
  //           scaleMobile: 1.0
  //         })
  //       );
  //     }
  //   }
  //   return () => {
  //     if (vantaEffect) vantaEffect.destroy();
  //   };
  // }, []);
  useMount(() => {
    clearToken();
    router.prefetch('/applicationCenter');

    ChineseRedirectUrl && showRedirect && checkIpInChina();
    localCookieVersion !== cookieVersion && onOpenCookiesDrawer();
  });

  return (
    <>
      {feConfigs.googleClientVerKey && (
        <Script
          src={`https://www.recaptcha.net/recaptcha/api.js?render=${feConfigs.googleClientVerKey}`}
        ></Script>
      )}
      <Box
        // alignItems={'center'}
        // justifyContent={'center'}
        position={'relative'}
        bg={`url(${getWebReqUrl('/imgs/images/picture/login_bg.jpg')}) no-repeat`}
        backgroundSize={'cover'}
        ref={loginbgRef}
        userSelect={'none'}
        h={'100%'}
      >
        <MyImage
          src="/imgs/images/picture/logo.png"
          w={'230px'}
          h={'54px'}
          pos={'absolute'}
          left={['3rem', '30px']}
          top={['5rem', '40px']}
        />

        <MyImage
          src="/imgs/images/picture/login_bg_right.png"
          pos={'absolute'}
          w={['20', '500px']}
          h={['28', '586px']}
          right={'9%'}
          top={'15%'}
        />
        {/* 隐藏国际化按钮 */}
        {/* {isPc && (
          <Box position={'absolute'} top={'24px'} right={'50px'}>
            <I18nLngSelector />
          </Box>
        )} */}
        <Flex
          position={'absolute'}
          left={'18%'}
          top={'15%'}
          flexDirection={'column'}
          w={['100%', '700px']}
          h={['100%', '750px']}
          bg={'white'}
          px={['5vw', '60px']}
          py={['5vh', '32px']}
          borderRadius={[0, '16px']}
          boxShadow={[
            '',
            '0px 32px 64px -12px rgba(19, 51, 107, 0.20), 0px 0px 1px 0px rgba(19, 51, 107, 0.20)'
          ]}
        >
          <Box w={['100%', '100%']} flex={'1 0 0'}>
            {pageType ? (
              <DynamicComponent type={pageType} />
            ) : (
              <Center w={'full'} h={'full'} position={'relative'}>
                <Loading fixed={false} />
              </Center>
            )}
          </Box>
          {/* 注销无法登录，请联系提示字样 */}
          {/* {feConfigs?.concatMd && (
            <Box
              mt={8}
              color={'primary.700'}
              fontSize={'mini'}
              fontWeight={'medium'}
              cursor={'pointer'}
              textAlign={'center'}
              onClick={onOpen}
            >
              {t('common:support.user.login.can_not_login')}
            </Box>
          )} */}
        </Flex>

        {isOpen && <CommunityModal onClose={onClose} />}
      </Box>

      {showRedirect && (
        <RedirectDrawer
          isOpen={isOpenRedirect}
          onClose={onCloseRedirect}
          onRedirect={() => router.push(ChineseRedirectUrl)}
          disableDrawer={() => setShowRedirect(false)}
        />
      )}
      {/* 不弹出允许Cookie访问请求 */}
      {/* {isOpenCookiesDrawer && (
        <CookiesDrawer
          onAgree={() => {
            setLocalCookieVersion(cookieVersion);
            onCloseCookiesDrawer();
          }}
          onClose={onCloseCookiesDrawer}
        />
      )} */}
    </>
  );
};

function RedirectDrawer({
  isOpen,
  onClose,
  disableDrawer,
  onRedirect
}: {
  isOpen: boolean;
  onClose: () => void;
  disableDrawer: () => void;
  onRedirect: () => void;
}) {
  const { t } = useTranslation();
  return (
    <Drawer placement="bottom" size={'xs'} isOpen={isOpen} onClose={onClose}>
      <DrawerOverlay backgroundColor={'rgba(0,0,0,0.2)'} />
      <DrawerContent py={'1.75rem'} px={'3rem'}>
        <DrawerCloseButton size={'sm'} />
        <Flex align={'center'} justify={'space-between'}>
          <Box>
            <Box color={'myGray.900'} fontWeight={'500'} fontSize={'1rem'}>
              {t('login:Chinese_ip_tip')}
            </Box>
            <Box
              color={'primary.700'}
              fontWeight={'500'}
              fontSize={'1rem'}
              textDecorationLine={'underline'}
              cursor={'pointer'}
              onClick={disableDrawer}
            >
              {t('login:no_remind')}
            </Box>
          </Box>
          <Button ml={'0.75rem'} onClick={onRedirect}>
            {t('login:redirect')}
          </Button>
        </Flex>
      </DrawerContent>
    </Drawer>
  );
}

function CookiesDrawer({ onClose, onAgree }: { onClose: () => void; onAgree: () => void }) {
  const { t } = useTranslation();

  return (
    <Drawer placement="bottom" size={'xs'} isOpen={true} onClose={onClose}>
      <DrawerOverlay backgroundColor={'rgba(0,0,0,0.2)'} />
      <DrawerContent py={'1.75rem'} px={'3rem'}>
        <DrawerCloseButton size={'sm'} />
        <Flex align={'center'} justify={'space-between'}>
          <Box>
            <Box color={'myGray.900'} fontWeight={'500'} fontSize={'1rem'}>
              {t('login:cookies_tip')}
            </Box>
            <Box
              color={'primary.700'}
              fontWeight={'500'}
              fontSize={'1rem'}
              textDecorationLine={'underline'}
              cursor={'pointer'}
              w={'fit-content'}
              onClick={() => window.open(getDocPath('/docs/agreement/privacy/'), '_blank')}
            >
              {t('login:privacy_policy')}
            </Box>
          </Box>
          <Button ml={'0.75rem'} onClick={onAgree}>
            {t('login:agree')}
          </Button>
        </Flex>
      </DrawerContent>
    </Drawer>
  );
}

export async function getServerSideProps(context: any) {
  return {
    props: {
      ChineseRedirectUrl: process.env.CHINESE_IP_REDIRECT_URL ?? '',
      ...(await serviceSideProps(context, ['app', 'user', 'login']))
    }
  };
}

export default Login;
