import React, { useState } from 'react';
import { getDefaultAppForm } from '@fastgpt/global/core/app/utils';

import SimpleAppHeader from './SimpleAppHeader';
import Edit from './Edit';
import { useContextSelector } from 'use-context-selector';
import { AppContext, TabEnum } from '../context';
import dynamic from 'next/dynamic';
import { Box, Flex } from '@chakra-ui/react';
import { useBeforeunload } from '@fastgpt/web/hooks/useBeforeunload';
import { useTranslation } from 'next-i18next';
import { useSimpleAppSnapshots } from './useSnapshots';
import { useDebounceEffect } from 'ahooks';
import Header from './Header';
import { getApiSchemaByUrl } from '@/web/core/app/api/plugin';

const Logs = dynamic(() => import('../Logs/index'));
const PublishChannel = dynamic(() => import('../Publish'));

const SimpleEdit = () => {
  const { t } = useTranslation();
  const { currentTab, appDetail } = useContextSelector(AppContext, (v) => v);
  const { forbiddenSaveSnapshot, past, setPast, saveSnapshot } = useSimpleAppSnapshots(
    appDetail._id
  );
  const [appForm, setAppForm] = useState(getDefaultAppForm());
  // Save snapshot to local
  useDebounceEffect(
    () => {
      saveSnapshot({
        appForm
      });
    },
    [appForm],
    { wait: 500 }
  );

  useBeforeunload({
    tip: t('common:core.common.tip.leave page')
  });
  return (
    <Flex
      h={'calc(100% - 20px)'}
      flexDirection={'column'}
      // px={[3, 2.5]}
      // pr={[3, 3]}
      gap={2}
      bg={'linear-gradient(to bottom,rgb(236,239,246),white)'}
      px={'10px'}
      pt={'10px'}
      m={'10px'}
      ml={0}
      borderRadius={'md'}
    >
      <SimpleAppHeader
        appForm={appForm}
        forbiddenSaveSnapshot={forbiddenSaveSnapshot}
        setAppForm={setAppForm}
        past={past}
        setPast={setPast}
        saveSnapshot={saveSnapshot}
      />
      {/* <Header
        appForm={appForm}
        forbiddenSaveSnapshot={forbiddenSaveSnapshot}
        setAppForm={setAppForm}
        past={past}
        setPast={setPast}
        saveSnapshot={saveSnapshot}
      /> */}

      {currentTab === TabEnum.appEdit ? (
        <Edit
          appForm={appForm}
          setAppForm={setAppForm}
          past={past}
          setPast={setPast}
          saveSnapshot={saveSnapshot}
        />
      ) : (
        <Box flex={1} mt={[4, 0]}>
          {currentTab === TabEnum.publish && <PublishChannel />}
          {currentTab === TabEnum.logs && <Logs />}
        </Box>
      )}
    </Flex>
  );
};

export default React.memo(SimpleEdit);
