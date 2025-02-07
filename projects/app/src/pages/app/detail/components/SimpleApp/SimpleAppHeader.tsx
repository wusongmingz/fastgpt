import React, { useCallback, useState } from 'react';
import { useContextSelector } from 'use-context-selector';
import { AppContext } from '../context';
import { useRequest2 } from '@fastgpt/web/hooks/useRequest';
import { getAppFolderPath } from '@/web/core/app/api/app';
import { Box, Flex, HStack, Stack, IconButton, Image } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import RouteTab from '../RouteTab';
import { useTranslation } from 'next-i18next';
import { AppSimpleEditFormType } from '@fastgpt/global/core/app/type';
import { AppTypeEnum } from '@fastgpt/global/core/app/constants';
import { form2AppWorkflow } from '@/web/core/app/utils';
import { TabEnum } from '../context';
import MyIcon from '@fastgpt/web/components/common/Icon';
import MyTag from '@fastgpt/web/components/common/Tag/index';
import { publishStatusStyle } from '../constants';
import { useSystem } from '@fastgpt/web/hooks/useSystem';
import { formatTime2YMDHMS } from '@fastgpt/global/common/string/time';
import { useSystemStore } from '@/web/common/system/useSystemStore';
import { useDatasetStore } from '@/web/core/dataset/store/dataset';
import SaveButton from '../Workflow/components/SaveButton';
import { useBoolean, useDebounceEffect } from 'ahooks';
import { appWorkflow2Form } from '@fastgpt/global/core/app/utils';
import FolderPath from '@/components/common/folder/Path';
import {
  compareSimpleAppSnapshot,
  onSaveSnapshotFnType,
  SimpleAppSnapshotType
} from './useSnapshots';
import PublishHistories from '../PublishHistoriesSlider';
import { AppVersionSchemaType } from '@fastgpt/global/core/app/version';

const Header = ({
  forbiddenSaveSnapshot,
  appForm,
  setAppForm,
  past,
  setPast,
  saveSnapshot
}: {
  forbiddenSaveSnapshot: React.MutableRefObject<boolean>;
  appForm: AppSimpleEditFormType;
  setAppForm: (form: AppSimpleEditFormType) => void;
  past: SimpleAppSnapshotType[];
  setPast: (value: React.SetStateAction<SimpleAppSnapshotType[]>) => void;
  saveSnapshot: onSaveSnapshotFnType;
}) => {
  const router = useRouter();
  const { t } = useTranslation();

  const { appId, onSaveApp, currentTab } = useContextSelector(AppContext, (v) => v);
  const appTabList = [
    {
      name: t('app:type.Simple bot'),
      query: TabEnum.appEdit
    },
    {
      name: '对外发布',
      query: TabEnum.publish
    },
    {
      name: '对话日志',
      query: TabEnum.logs
    }
  ];
  const { lastAppListRouteType } = useSystemStore();
  const { data: paths = [] } = useRequest2(() => getAppFolderPath(appId), {
    manual: false,
    refreshDeps: [appId]
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
      <Flex
        h={'80px'}
        bgColor={'white'}
        direction={'column'}
        w={'100%'}
        borderRadius={'md'}
        // alignItems={'center'}
      >
        <HStack borderBottom={'1px solid #E0E0E0'} pl={'15px'} h={'40px'}>
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
            pl={'20px'}
            // lineHeight={'40px'}
            lineHeight={'30px'}
            fontWeight={1000}
            fontSize={'17px'}
          >
            我的应用
            <Box pl={'30px'} borderRight={'3px solid #d66686'}></Box>
          </Flex>
          <Box pl={'20px'}>
            <FolderPath
              rootName={'根目录'}
              paths={paths}
              hoverStyle={{ color: 'primary.600' }}
              onClick={onClickRoute}
              fontSize={'14px'}
            />
          </Box>
        </HStack>
        <Flex justifyContent={'center'} gap={5} flex={1} alignItems={'center'}>
          {appTabList.map((item) => {
            return (
              <Box
                w={'80px'}
                h={'30px'}
                lineHeight={'30px'}
                cursor={'pointer'}
                _hover={{
                  bgColor: 'rgb(239,239,246)',
                  color: 'rgb(215,0,15)'
                }}
                textAlign={'center'}
                userSelect={'none'}
                borderWidth={'1px'}
                borderColor={'#E0E0E0'}
                borderRadius={'md'}
                fontSize={'13px'}
                color={currentTab === item.query ? 'rgb(215,0,15)' : 'black'}
                bgColor={currentTab === item.query ? 'rgb(239,239,246)' : 'rgb(253,242,244)'}
                key={item.query}
                onClick={() => {
                  if (currentTab === item.query) return;
                  router.push({
                    query: {
                      ...router.query,
                      currentTab: item.query
                    }
                  });
                }}
              >
                {item.name}
              </Box>
            );
          })}
        </Flex>
      </Flex>
    </>
  );
};

export default Header;
