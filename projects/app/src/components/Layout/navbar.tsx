import React, { useMemo } from 'react';
import { Box, BoxProps, Flex, Link, LinkProps } from '@chakra-ui/react';
import AIcon from '../AIcon/AIcon';
import { useRouter } from 'next/router';
import { useUserStore } from '@/web/support/user/useUserStore';
import { useChatStore } from '@/web/core/chat/context/storeChat';

import NextLink from 'next/link';
import Badge from '../Badge';
import Avatar from '@fastgpt/web/components/common/Avatar';
import MyIcon from '@fastgpt/web/components/common/Icon';
import { useTranslation } from 'next-i18next';
import { useSystemStore } from '@/web/common/system/useSystemStore';
import MyTooltip from '@fastgpt/web/components/common/MyTooltip';
import { getDocPath } from '@/web/common/system/doc';
import query from '@/pages/api/core/chat/inputGuide/query';

export enum NavbarTypeEnum {
  normal = 'normal',
  small = 'small'
}

const Navbar = ({ unread }: { unread: number }) => {
  const { t } = useTranslation();
  const router = useRouter();
  const { userInfo } = useUserStore();
  const { gitStar, feConfigs } = useSystemStore();
  const { lastChatAppId, lastChatId } = useChatStore();
  const navbarList = useMemo(
    () => [
      //todo链接问题
      //todo 图标问题
      {
        label: '知识库',
        icon: 'icon-zhishiku',
        // activeIcon: 'core/dataset/datasetFill',
        link: `/dataset/list`,
        activeLink: ['/dataset/list', '/dataset/detail']
      },
      // {
      //   label: '知识库',
      //   icon: 'icon-zhishiku',
      //   // activeIcon: 'core/dataset/datasetFill',
      //   link: userInfo?.hasData ? `/dataset/list` : `/dataset/demo`,
      //   activeLink: ['/dataset/list', '/dataset/detail', '/dataset/demo']
      // },
      {
        label: '应用中心',
        icon: 'icon-yingyonglingyu',
        // activeIcon: 'core/dataset/datasetFill',
        link: `/applicationCenter`,
        // queryKey: 'type',
        // queryValue: 'simple',
        activeLink: ['/applicationCenter', '/app/detail']
      },
      {
        label: '对话',
        icon: 'icon-duihua',
        // activeIcon: 'core/chat/chatFill',
        link: `/chat?appId=${lastChatAppId}&chatId=${lastChatId}`,
        activeLink: ['/chat']
      },
      // {
      //   label: '插件',
      //   icon: 'icon-chajian',
      //   // activeIcon: 'core/chat/chatFill',
      //   link: `/plugins`,
      //   activeLink: ['/plugins']
      // },
      {
        label: '知识图谱',
        icon: 'icon-zhishitupu',
        // activeIcon: 'core/chat/chatFill',
        link: `/knowledgeGraph`,
        activeLink: ['/knowledgeGraph']
      },
      {
        label: '系统管理',
        icon: 'icon-quanxianguanli',
        // activeIcon: 'core/chat/chatFill',
        // link: `/systemManagement/${userInfo?.defaultGroup._id}`,
        link: `/systemManagement`,
        activeLink: ['/systemManagement', '/systemManagement/[groupId]']
      }
      // {
      //   label: '使用指南',
      //   icon: 'icon-shiyongwendang',
      //   // activeIcon: 'core/chat/chatFill',
      //   link: `/userGuide`,
      //   activeLink: ['/userGuide']
      // },
      // {
      //   label: '工作台',
      //   icon: 'icon-quanxianguanli',
      //   // activeIcon: 'core/app/aiFill',
      //   link: `/app/list`,
      //   activeLink: ['/app/list']
      // }
      // {
      //   label: 'demo',
      //   icon: 'icon-duihua',
      //   link: `/demo`,
      //   activeLink: ['/demo']
      // }

      // {s
      //   label: t('common:navbar.Account'),
      //   icon: 'support/user/userLight',
      //   activeIcon: 'support/user/userFill',
      //   link: '/account',
      //   activeLink: ['/account']
      // }
    ],
    [lastChatAppId, lastChatId, t]
  );

  const itemStyles: BoxProps & LinkProps = {
    // my: 3,
    display: 'flex',
    // flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    mb: '25px',
    textAlign: 'center',
    cursor: 'pointer',
    w: '230px',
    fontWeight: '700',
    h: '40px',
    borderRadius: '10px',
    _focus: {
      bg: 'black',
      color: 'white'
    }
  };
  const hoverStyle: LinkProps = {
    _hover: {
      bg: 'myGray.05',
      color: 'primary.600'
    }
  };

  return (
    <Flex
      flexDirection={'column'}
      alignItems={'center'}
      h={'100%'}
      w={'100%'}
      borderRadius={'20px'}
      backgroundColor={'rgb(236,239,246)'}
      userSelect={'none'}
    >
      {/* logo */}

      <Box
        h={'60px'}
        fontWeight={'800'}
        cursor={'pointer'}
        color={'black'}
        fontSize={'20px'}
        alignContent={'center'}
      >
        天元知识库
      </Box>
      {/* 导航列表 */}
      <Box w={'100%'} h={'520px'} p={'6px'} backgroundColor={'white'} borderRadius={'20px'}>
        {navbarList.map((item: any) => (
          <Box
            key={item.link}
            {...itemStyles}
            {...(item.activeLink.includes(router.pathname)
              ? {
                  color: 'white',
                  bg: 'black'
                }
              : {
                  bg: 'transparent',
                  color: 'black',
                  _hover: {
                    bg: 'rgb(236,239,246)'
                  }
                })}
            {...(item.link !== router.asPath
              ? {
                  onClick: () => {
                    // const { link, queryKey, queryValue } = item;
                    const { link, query } = item;
                    if (query) {
                      router.push({
                        pathname: link,
                        query: query
                      });
                    } else {
                      router.push(link);
                    }
                  }
                }
              : {})}
            fontSize={'15px'}
            pr={'20px'}
          >
            {/* <MyIcon
              name={
                item.activeLink.includes(router.pathname)
                  ? (item.activeIcon as any)
                  : (item.icon as any)
              }
              width={'20px'}
              height={'20px'}
            /> */}
            <AIcon
              name={item.icon}
              fontSize="22px"
              fontWeight="200"
              color={item.activeLink.includes(router.pathname) ? 'white' : 'primary.500'}
            />
            <Box fontSize={'15px'} w={'80px'} pl={'15px'} transform={'scale(0.9)'} lineHeight={1}>
              {item.label}
            </Box>
          </Box>
        ))}
      </Box>

      {unread > 0 && (
        <Box>
          <Link
            as={NextLink}
            {...itemStyles}
            {...hoverStyle}
            prefetch
            href={`/account?currentTab=inform`}
            mb={0}
            color={'myGray.500'}
          >
            <Badge count={unread}>
              <MyIcon name={'support/user/informLight'} width={'22px'} height={'22px'} />
            </Badge>
          </Link>
        </Box>
      )}
      {/* {(feConfigs?.docUrl || feConfigs?.chatbotUrl) && (
        <MyTooltip label={t('common:common.system.Use Helper')} placement={'right-end'}>
          <Link
            {...itemStyles}
            {...hoverStyle}
            href={feConfigs?.chatbotUrl || getDocPath('/docs/intro')}
            target="_blank"
            mb={0}
            color={'myGray.500'}
          >
            <MyIcon name={'common/courseLight'} width={'24px'} height={'24px'} />
          </Link>
        </MyTooltip>
      )}
      {feConfigs?.show_git && (
        <MyTooltip label={`Git Star: ${gitStar}`} placement={'right-end'}>
          <Link
            as={NextLink}
            href="https://github.com/labring/FastGPT"
            target={'_blank'}
            {...itemStyles}
            {...hoverStyle}
            mt={0}
            color={'myGray.500'}
          >
            <MyIcon name={'common/gitInlight'} width={'26px'} height={'26px'} />
          </Link>
        </MyTooltip>
      )} */}
    </Flex>
  );
};

export default Navbar;
