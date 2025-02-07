import type { NextApiRequest, NextApiResponse } from 'next';
import { sseErrRes } from '@fastgpt/service/common/response';
import {
  DispatchNodeResponseKeyEnum,
  SseResponseEventEnum
} from '@fastgpt/global/core/workflow/runtime/constants';
import { responseWrite } from '@fastgpt/service/common/response';
import { pushChatUsage } from '@/service/support/wallet/usage/push';
import { UsageSourceEnum } from '@fastgpt/global/support/wallet/usage/constants';
import type { AIChatItemType, UserChatItemType } from '@fastgpt/global/core/chat/type';
import { authApp } from '@fastgpt/service/support/permission/app/auth';
import { dispatchWorkFlow } from '@fastgpt/service/core/workflow/dispatch';
import { authCert } from '@fastgpt/service/support/permission/auth/common';
import { getUserChatInfoAndAuthTeamPoints } from '@/service/support/permission/auth/team';
import { StoreEdgeItemType } from '@fastgpt/global/core/workflow/type/edge';
import { getChatTitleFromChatMessage, removeEmptyUserInput } from '@fastgpt/global/core/chat/utils';
import { ReadPermissionVal } from '@fastgpt/global/support/permission/constant';
import { AppTypeEnum } from '@fastgpt/global/core/app/constants';
import {
  getPluginRunUserQuery,
  updatePluginInputByVariables
} from '@fastgpt/global/core/workflow/utils';
import { NextAPI } from '@/service/middleware/entry';
import { chatValue2RuntimePrompt, GPTMessages2Chats } from '@fastgpt/global/core/chat/adapt';
import { ChatCompletionMessageParam } from '@fastgpt/global/core/ai/type';
import { AppChatConfigType } from '@fastgpt/global/core/app/type';
import {
  getLastInteractiveValue,
  getMaxHistoryLimitFromNodes,
  getWorkflowEntryNodeIds,
  initWorkflowEdgeStatus,
  rewriteNodeOutputByHistories,
  storeNodes2RuntimeNodes
} from '@fastgpt/global/core/workflow/runtime/utils';
import { StoreNodeItemType } from '@fastgpt/global/core/workflow/type/node';
import { getWorkflowResponseWrite } from '@fastgpt/service/core/workflow/dispatch/utils';
import { WORKFLOW_MAX_RUN_TIMES } from '@fastgpt/service/core/workflow/constants';
import { getPluginInputsFromStoreNodes } from '@fastgpt/global/core/app/plugin/utils';
import { getChatItems } from '@fastgpt/service/core/chat/controller';
import { MongoChat } from '@fastgpt/service/core/chat/chatSchema';
import { authHeaderRequest } from '../../v1/chat/completions';
import { getSystemTime } from '@fastgpt/global/common/time/timezone';
import { ChatRoleEnum, ChatSourceEnum } from '@fastgpt/global/core/chat/constants';
import { saveChat, updateInteractiveChat } from '@fastgpt/service/core/chat/saveChat';
import { FlowNodeTypeEnum } from '@fastgpt/global/core/workflow/node/constant';
import { NodeInputKeyEnum } from '@fastgpt/global/core/workflow/constants';

export type Props = {
  messages: ChatCompletionMessageParam[];
  nodes: StoreNodeItemType[];
  edges: StoreEdgeItemType[];
  variables: Record<string, any>;
  appId: string;
  appName: string;
  chatId: string;
  responseChatItemId: string;
  chatConfig: AppChatConfigType;
};

async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.on('close', () => {
    res.end();
  });
  res.on('error', () => {
    console.log('error: ', 'request error');
    res.end();
  });

  let {
    nodes = [],
    edges = [],
    messages = [],
    variables = {},
    appName,
    appId,
    chatConfig,
    chatId,
    responseChatItemId
  } = req.body as Props;
  try {
    if (!Array.isArray(nodes)) {
      throw new Error('Nodes is not array');
    }
    if (!Array.isArray(edges)) {
      throw new Error('Edges is not array');
    }
    const chatMessages = GPTMessages2Chats(messages);
    // console.log(JSON.stringify(chatMessages, null, 2), '====', chatMessages.length);

    /* user auth */
    const [{ app }, { teamId, tmbId }] = await Promise.all([
      authApp({ req, authToken: true, appId, per: ReadPermissionVal }),
      authCert({
        req,
        authToken: true
      })
    ]);
    // auth balance
    const { user } = await getUserChatInfoAndAuthTeamPoints(tmbId);

    const { user: users } = await authHeaderRequest({
      req,
      appId,
      chatId
    });

    const isPlugin = app.type === AppTypeEnum.plugin;

    const userQuestion: UserChatItemType = (() => {
      if (isPlugin) {
        return getPluginRunUserQuery({
          pluginInputs: getPluginInputsFromStoreNodes(app.modules),
          variables,
          files: variables.files
        });
      }

      const latestHumanChat = chatMessages.pop() as UserChatItemType | undefined;
      if (!latestHumanChat) {
        throw new Error('User question is empty');
      }
      return latestHumanChat;
    })();

    let runtimeNodes = storeNodes2RuntimeNodes(nodes, getWorkflowEntryNodeIds(nodes, chatMessages));

    // Plugin need to replace inputs
    if (isPlugin) {
      runtimeNodes = updatePluginInputByVariables(runtimeNodes, variables);
      variables = {};
    } else {
      if (!userQuestion.value) {
        throw new Error('Params Error');
      }
    }

    runtimeNodes = rewriteNodeOutputByHistories(chatMessages, runtimeNodes);
    const workflowResponseWrite = getWorkflowResponseWrite({
      res,
      detail: true,
      streamResponse: true
    });

    /* start process */
    const { flowResponses, assistantResponses, newVariables, flowUsages } = await dispatchWorkFlow({
      res,
      requestOrigin: req.headers.origin,
      mode: 'test',
      runningAppInfo: {
        id: appId,
        teamId,
        tmbId
      },
      uid: tmbId,
      user,
      runtimeNodes,
      runtimeEdges: initWorkflowEdgeStatus(edges, chatMessages),
      variables,
      query: removeEmptyUserInput(userQuestion.value),
      chatConfig,
      histories: chatMessages,
      stream: true,
      maxRunTimes: WORKFLOW_MAX_RUN_TIMES,
      workflowStreamResponse: workflowResponseWrite
    });

    responseWrite({
      res,
      event: SseResponseEventEnum.answer,
      data: '[DONE]'
    });
    responseWrite({
      res,
      event: SseResponseEventEnum.flowResponses,
      data: JSON.stringify(flowResponses)
    });
    const limit = getMaxHistoryLimitFromNodes(nodes); //  获取最大历史记录限制
    const [{ histories }, chatDetail] = await Promise.all([
      //  获取聊天项
      getChatItems({
        appId,
        chatId,
        offset: 0,
        limit,
        field: `dataId obj value nodeOutputs`
      }),
      MongoChat.findOne({ appId: app._id, chatId }, 'source variableList variables')
      // auth balance
    ]);
    if (chatDetail?.variables) {
      //  如果chatDetail存在且chatDetail.variables存在
      variables = {
        ...chatDetail.variables,
        ...variables
      };
    }
    if (!res.closed) {
      //如果当前连接没有关闭
      const isInteractiveRequest = !!getLastInteractiveValue(histories); //  判断是否为交互请求
      const { text: userInteractiveVal } = chatValue2RuntimePrompt(userQuestion.value); //  将用户交互值转换为运行时提示

      const newTitle = isPlugin
        ? variables.cTime ?? getSystemTime(users.timezone)
        : getChatTitleFromChatMessage(userQuestion);
      //ai返回值
      let aiModel = '';
      nodes.forEach((node) => {
        if (node.flowNodeType === FlowNodeTypeEnum.chatNode) {
          node.inputs.forEach((input) => {
            if (input.key === NodeInputKeyEnum.aiModel) {
              aiModel = input.value;
            }
          });
        }
      });
      const aiResponse: AIChatItemType & { dataId: string } = {
        dataId: responseChatItemId,
        obj: ChatRoleEnum.AI,
        value: assistantResponses,
        aiChatModel: aiModel,
        [DispatchNodeResponseKeyEnum.nodeResponse]: flowResponses
      };
      if (isInteractiveRequest) {
        await updateInteractiveChat({
          //  如果chatId存在，则更新交互式聊天
          chatId,
          appId: app._id,
          teamId,
          tmbId,
          newTitle,
          userInteractiveVal,
          aiResponse,
          newVariables
        });
      } else {
        await saveChat({
          chatId,
          appId: app._id,
          teamId,
          tmbId,
          nodes,
          appChatConfig: chatConfig,
          variables: newVariables,
          isUpdateUseTime: false,
          newTitle,
          source: ChatSourceEnum.test,
          content: [userQuestion, aiResponse]
        });
      }
    }
    res.end();

    pushChatUsage({
      //  记录聊天使用情况
      appName,
      appId,
      teamId,
      tmbId,
      source: UsageSourceEnum.fastgpt,
      flowUsages
    });
  } catch (err: any) {
    res.status(500);
    sseErrRes(res, err);
    res.end();
  }
}

export default NextAPI(handler);

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb'
    },
    responseLimit: '20mb'
  }
};
