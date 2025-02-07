import { Box, Flex, IconButton, Button } from '@chakra-ui/react';
import { useTranslation } from 'next-i18next';
import React, { useEffect } from 'react';
import MyTooltip from '@fastgpt/web/components/common/MyTooltip';
import MyIcon from '@fastgpt/web/components/common/Icon';

import { useSafeState } from 'ahooks';
import { AppSimpleEditFormType } from '@fastgpt/global/core/app/type';
import { form2AppWorkflow } from '@/web/core/app/utils';
import { useI18n } from '@/web/context/I18n';
import { useContextSelector } from 'use-context-selector';
import { AppContext } from '../context';
import { useChatTest } from '../useChatTest';
import { useDatasetStore } from '@/web/core/dataset/store/dataset';
import AIcon from '@/components/AIcon/AIcon';

const ChatTest = ({ appForm }: { appForm: AppSimpleEditFormType }) => {
  const { t } = useTranslation();
  const { appT } = useI18n();

  const { appDetail } = useContextSelector(AppContext, (v) => v);
  // form2AppWorkflow dependent allDatasets
  const { allDatasets } = useDatasetStore();

  const [workflowData, setWorkflowData] = useSafeState({
    nodes: appDetail.modules || [],
    edges: appDetail.edges || []
  });

  useEffect(() => {
    const { nodes, edges } = form2AppWorkflow(appForm, t);
    // console.log(form2AppWorkflow(appForm, t));
    setWorkflowData({ nodes, edges });
  }, [appForm, setWorkflowData, allDatasets, t]);

  const { restartChat, ChatContainer } = useChatTest({
    ...workflowData,
    chatConfig: appForm.chatConfig,
    aiSettings: appForm.aiSettings
  });
  return (
    <Flex position={'relative'} flexDirection={'column'} h={'100%'}>
      <Flex
        px={[2, 5]}
        py={2}
        borderBottom={'1px solid primary.500'}
        alignItems={'center'}
        boxShadow={'0px 2px 4px rgb(0,0,0,0.2)'}
        borderRadius={' 10px 10px 0px  0px'}
      >
        <Box fontSize={['md', 'lg']} fontWeight={'bold'} flex={1} color={'myGray.900'}>
          {appT('chat_debug')}
        </Box>
        {/* <MyTooltip label={t('common:core.chat.Restart')}> */}
        <Button
          className="chat"
          size={'smSquare'}
          w={'120px'}
          fontSize={'13px'}
          borderColor={'gray'}
          leftIcon={<AIcon name="icon-duihua1" color="primary.500" fontSize="25px"></AIcon>}
          variant={'whiteDanger'}
          borderRadius={'md'}
          aria-label={'delete'}
          onClick={(e) => {
            e.stopPropagation();
            restartChat();
          }}
          _hover={{
            bg: 'rgb(242,242,242)',
            borderColor: 'primary.500'
          }}
        >
          新的聊天
        </Button>
        {/* </MyTooltip> */}
      </Flex>
      <Box flex={1}>
        <ChatContainer />
      </Box>
    </Flex>
  );
};

export default React.memo(ChatTest);
