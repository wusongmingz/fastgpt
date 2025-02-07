import { useUserStore } from '@/web/support/user/useUserStore';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import type { StartChatFnProps } from '@/components/core/chat/ChatContainer/type';
import { streamFetch } from '@/web/common/api/fetch';
import { getMaxHistoryLimitFromNodes } from '@fastgpt/global/core/workflow/runtime/utils';
import { useMemoizedFn } from 'ahooks';
import { useContextSelector } from 'use-context-selector';
import { AppContext } from './context';
import { StoreNodeItemType } from '@fastgpt/global/core/workflow/type/node';
import { StoreEdgeItemType } from '@fastgpt/global/core/workflow/type/edge';
import { FlowNodeTypeEnum } from '@fastgpt/global/core/workflow/node/constant';
import { AppTypeEnum } from '@fastgpt/global/core/app/constants';
import dynamic from 'next/dynamic';
import { useChat } from '@/components/core/chat/ChatContainer/useChat';
import { Box, BoxProps } from '@chakra-ui/react';
import { AppChatConfigType } from '@fastgpt/global/core/app/type';
import ChatBox from '@/components/core/chat/ChatContainer/ChatBox';
import { ChatSiteItemType } from '@fastgpt/global/core/chat/type';
import { useSystemStore } from '@/web/common/system/useSystemStore';
import { useChatStore } from '@/web/core/chat/context/storeChat';
import { getNanoid } from '@fastgpt/global/common/string/tools';
import { delChatRecordById, getInitChatInfo } from '@/web/core/chat/api';
import { useRequest2 } from '@fastgpt/web/hooks/useRequest';

const PluginRunBox = dynamic(() => import('@/components/core/chat/ChatContainer/PluginRunBox'));

export const useChatTest = ({
  nodes,
  edges,
  chatConfig,
  aiSettings
}: {
  nodes: StoreNodeItemType[];
  edges: StoreEdgeItemType[];
  chatConfig: AppChatConfigType;
  aiSettings?: any;
}) => {
  const { userInfo } = useUserStore();
  const { appDetail } = useContextSelector(AppContext, (v) => v);
  const { setChatId, chatId, appId } = useChatStore();
  // const [chatRecords, setChatRecords] = useState<ChatSiteItemType[]>([]);
  const { llmModelList } = useSystemStore();
  const currentModel =
    llmModelList.find((item) => item.model === aiSettings?.model) || llmModelList[0];
  const startChat = useMemoizedFn(
    async ({
      messages,
      controller,
      generatingMessage,
      responseChatItemId,
      variables
    }: StartChatFnProps) => {
      /* get histories */
      const historyMaxLen = getMaxHistoryLimitFromNodes(nodes);

      // 流请求，获取数据
      const { responseText, responseData } = await streamFetch({
        url: '/api/core/chat/chatTest',
        data: {
          // Send histories and user messages
          messages: messages.slice(-historyMaxLen - 2),
          nodes,
          edges,
          variables,
          appId: appDetail._id,
          responseChatItemId,
          chatId,
          appName: `调试-${appDetail.name}`,
          chatConfig
        },
        onMessage: generatingMessage,
        abortCtrl: controller
      });

      return { responseText, responseData };
    }
  );

  const pluginInputs = useMemo(() => {
    return nodes.find((node) => node.flowNodeType === FlowNodeTypeEnum.pluginInput)?.inputs || [];
  }, [nodes]);

  const chatRecordProviderParams = useMemo(
    () => ({
      chatId: chatId,
      appId: appDetail._id
    }),
    [appDetail._id, chatId]
  );
  const {
    ChatBoxRef,
    variablesForm,
    chatRecords,
    setChatRecords,
    pluginRunTab,
    setPluginRunTab,
    resetVariables,
    clearChatRecords
  } = useChat(chatRecordProviderParams);

  const { loading } = useRequest2(
    async () => {
      if (!appId || !chatId) return;
      const res = await getInitChatInfo({ appId, chatId });
      resetVariables({
        variables: res.variables,
        variableList: res.app?.chatConfig?.variables
      });
    },
    {
      manual: false,
      refreshDeps: [appId, chatId]
    }
  );

  // Mock ScrollData
  const ScrollData = useCallback(
    ({
      children,
      ScrollContainerRef,
      ...props
    }: {
      ScrollContainerRef?: React.RefObject<HTMLDivElement>;
      children: React.ReactNode;
    } & BoxProps) => {
      return (
        <Box ref={ScrollContainerRef} {...props} overflow={'overlay'}>
          {children}
        </Box>
      );
    },
    []
  );
  const restartChat = useCallback(() => {
    clearChatRecords();
    setChatId();
  }, [clearChatRecords, setChatId]);
  const CustomChatContainer = useMemoizedFn(() =>
    appDetail.type === AppTypeEnum.plugin ? (
      <Box p={5}>
        <PluginRunBox
          pluginInputs={pluginInputs}
          variablesForm={variablesForm}
          histories={chatRecords}
          setHistories={setChatRecords}
          appId={appDetail._id}
          chatConfig={appDetail.chatConfig}
          tab={pluginRunTab}
          setTab={setPluginRunTab}
          onNewChat={() => {
            clearChatRecords();
            setChatRecords([]);
            setChatId();
          }}
          onStartChat={startChat}
        />
      </Box>
    ) : (
      <ChatBox
        ref={ChatBoxRef}
        ScrollData={ScrollData}
        chatHistories={chatRecords}
        setChatHistories={setChatRecords}
        variablesForm={variablesForm}
        appId={appDetail._id}
        chatId={chatId}
        // appAvatar={currentModel.avatar}
        appAvatar={'/imgs/images/picture/bigmodel.png'}
        userAvatar={userInfo?.avatar}
        showMarkIcon
        chatType="chat"
        showRawSource
        aiName={currentModel.name}
        showNodeStatus
        chatConfig={chatConfig}
        onStartChat={startChat}
        onDelMessage={({ contentId }) => delChatRecordById({ contentId, appId, chatId })}
      />
    )
  );

  return {
    restartChat: restartChat,
    ChatContainer: CustomChatContainer,
    chatRecords,
    pluginRunTab,
    setPluginRunTab
  };
};

export default function Dom() {
  return <></>;
}
