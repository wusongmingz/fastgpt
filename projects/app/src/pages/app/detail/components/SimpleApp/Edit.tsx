import React from 'react';
import { Box, Stack } from '@chakra-ui/react';
import { useMount } from 'ahooks';
import { useDatasetStore } from '@/web/core/dataset/store/dataset';
import { appWorkflow2Form } from '@fastgpt/global/core/app/utils';

import ChatTest from './ChatTest';
import AppCard from './AppCard';
import EditForm from './EditForm';
import { AppSimpleEditFormType } from '@fastgpt/global/core/app/type';
import { v1Workflow2V2 } from '@/web/core/workflow/adapt';
import { AppContext } from '@/pages/app/detail/components/context';
import { useContextSelector } from 'use-context-selector';
import { cardStyles } from '../constants';

import styles from './styles.module.scss';
import { useSystem } from '@fastgpt/web/hooks/useSystem';
import { useTranslation } from 'next-i18next';
import { onSaveSnapshotFnType, SimpleAppSnapshotType } from './useSnapshots';

const Edit = ({
  appForm,
  setAppForm,
  past,
  setPast,
  saveSnapshot
}: {
  appForm: AppSimpleEditFormType;
  setAppForm: React.Dispatch<React.SetStateAction<AppSimpleEditFormType>>;
  past: SimpleAppSnapshotType[];
  setPast: (value: React.SetStateAction<SimpleAppSnapshotType[]>) => void;
  saveSnapshot: onSaveSnapshotFnType;
}) => {
  const { isPc } = useSystem();
  const { loadAllDatasets } = useDatasetStore();
  const { appDetail } = useContextSelector(AppContext, (v) => v);
  const { t } = useTranslation();

  // Init app form
  useMount(() => {
    // show selected dataset
    loadAllDatasets();
    // Get the latest snapshot
    if (past?.[0]?.appForm) {
      return setAppForm(past[0].appForm);
    }

    const appForm = appWorkflow2Form({
      nodes: appDetail.modules,
      chatConfig: appDetail.chatConfig
    });

    // Set the first snapshot
    if (past.length === 0) {
      saveSnapshot({
        appForm,
        title: t('app:initial_form'),
        isSaved: true
      });
    }

    setAppForm(appForm);

    if (appDetail.version !== 'v2') {
      setAppForm(
        appWorkflow2Form({
          nodes: v1Workflow2V2((appDetail.modules || []) as any)?.nodes,
          chatConfig: appDetail.chatConfig
        })
      );
    }
  });
  return (
    <Box
      display={['block', 'flex']}
      flex={'1 0 0'}
      h={'calc(100vh - 197px)'}
      mt={[4, 0]}
      gap={1}
      borderRadius={'lg'}
      overflowY={['auto', 'unset']}
    >
      <Box
        className={styles.EditAppBox}
        pr={[0, 1]}
        overflowY={'auto'}
        // minW={['auto', '580px']}
        // flex={'1'}
        flex={5}
        mb={3}
        borderRadius="md"
      >
        <Box {...cardStyles} boxShadow={'2'}>
          <AppCard appForm={appForm} setPast={setPast} />
        </Box>

        <Box mt={2} {...cardStyles} boxShadow={'3.5'}>
          <EditForm appForm={appForm} past={past} setLocalPast={setPast} setAppForm={setAppForm} />
        </Box>
      </Box>
      {isPc && (
        <Box
          {...cardStyles}
          boxShadow={'3'}
          // flex={'2 0 0'}
          flex={5}
          w={0}
          mb={3}
        >
          <ChatTest appForm={appForm} />
        </Box>
      )}
    </Box>
  );
};

export default React.memo(Edit);
