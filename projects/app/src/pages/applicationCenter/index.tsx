import { serviceSideProps } from '@/web/common/utils/i18n';
import { Box, Flex, Image } from '@chakra-ui/react';
import AppListContextProvider, { AppListContext } from '../app/list/components/context';
import SimpleAppList from './components/SimpleAppList';
import MyBox from '@fastgpt/web/components/common/MyBox';
import { useContextSelector } from 'use-context-selector';
import HeaderFilter from '@/pages/applicationCenter/components/HeaderFilter/index';
import NoAppdataPage from './components/NoAppdataPage';
import FolderPath from '@/components/common/folder/Path';
import { AppTypeEnum } from '@fastgpt/global/core/app/constants';
import { useSystemStore } from '@/web/common/system/useSystemStore';
import { getAppFolderPath } from '@/web/core/app/api/app';
import { useRequest2 } from '@fastgpt/web/hooks/useRequest';
import { useRouter } from 'next/router';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

function MySimpleApp() {
  const router = useRouter();
  const { myApps, isFetchingApps, parentId, searchKey } = useContextSelector(
    AppListContext,
    (v) => v
  );
  const { t } = useTranslation();

  const { lastAppListRouteType } = useSystemStore();
  const { data: paths = [] } = useRequest2(() => getAppFolderPath(parentId), {
    manual: false,
    refreshDeps: [parentId]
  });
  const onClickRoute = useCallback(
    (parentId: string) => {
      router.push({
        pathname: '/applicationCenter',
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
      <MyBox
        bgColor={'rgb(236,239,246)'}
        flexDirection={'column'}
        h={'calc(100vh - 100px)'}
        m={'10px'}
        ml={0}
        p={'8px'}
        borderRadius={'md'}
      >
        <Flex
          h={'40px'}
          bgColor={'white'}
          w={'100%'}
          borderRadius={'md'}
          alignItems={'center'}
          pl={'15px'}
        >
          <Image
            w={'30px'}
            src="/imgs/images/picture/项目.png"
            alt=""
            borderRadius={'15px'}
            boxShadow={'4px 4px 4px rgba(0,0,0,0.15)'}
          />
          <Flex
            p={'5px 0px '}
            h={'40px'}
            pl={'40px'}
            // lineHeight={'40px'}
            lineHeight={'30px'}
            fontWeight={1000}
            fontSize={'17px'}
          >
            我的应用
          </Flex>
          {!!parentId && (
            <>
              <Box h={'30px'} pl={'30px'} borderRight={'3px solid rgb(7,190,214)'}></Box>

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
          {!parentId && (
            <HeaderFilter
              filterButtonList={[
                {
                  name: '全部',
                  value: 'ALL'
                },
                {
                  name: t('app:type.Simple bot'),
                  value: AppTypeEnum.simple
                },
                {
                  name: '工作流',
                  value: AppTypeEnum.workflow
                },
                {
                  name: '插件',
                  value: AppTypeEnum.plugin
                }
              ]}
            ></HeaderFilter>
          )}
        </Flex>
        <MyBox h={'calc(100% - 40px)'} flex={1} isLoading={isFetchingApps} overflowY={'auto'}>
          {(myApps.length > 0 || !!searchKey) && <SimpleAppList></SimpleAppList>}
          {myApps.length === 0 && !isFetchingApps && !searchKey && <NoAppdataPage></NoAppdataPage>}
        </MyBox>
      </MyBox>
    </>
  );
}

export default function ApplicationCenter() {
  return (
    <>
      <AppListContextProvider>
        <MySimpleApp></MySimpleApp>
      </AppListContextProvider>
    </>
  );
}

export async function getServerSideProps(content: any) {
  return {
    props: {
      ...(await serviceSideProps(content, ['app', 'user']))
    }
  };
}
