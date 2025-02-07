import React, { useCallback, useMemo, useState, useTransition } from 'react';
import {
  Box,
  Flex,
  Grid,
  BoxProps,
  useTheme,
  useDisclosure,
  Button,
  HStack,
  Stack,
  Text,
  Tooltip
} from '@chakra-ui/react';
import { SmallAddIcon } from '@chakra-ui/icons';
import type { AppSimpleEditFormType } from '@fastgpt/global/core/app/type.d';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useDatasetStore } from '@/web/core/dataset/store/dataset';
import { TabEnum } from '../context';
import { formatTime2YMDHMS } from '@fastgpt/global/common/string/time';
import { form2AppWorkflow } from '@/web/core/app/utils';

import dynamic from 'next/dynamic';
import MyTooltip from '@fastgpt/web/components/common/MyTooltip';
import Avatar from '@fastgpt/web/components/common/Avatar';
import MyIcon from '@fastgpt/web/components/common/Icon';
import VariableEdit from '@/components/core/app/VariableEdit';
import PromptEditor from '@fastgpt/web/components/common/Textarea/PromptEditor';
import { formatEditorVariablePickerIcon } from '@fastgpt/global/core/workflow/utils';
import SearchParamsTip from '@/components/core/dataset/SearchParamsTip';
import SettingLLMModel from '@/components/core/ai/SettingLLMModel';
import type { SettingAIDataType } from '@fastgpt/global/core/app/type.d';
import DeleteIcon, { hoverDeleteStyles } from '@fastgpt/web/components/common/Icon/delete';
import { TTSTypeEnum } from '@/web/core/app/constants';
import { workflowSystemVariables } from '@/web/core/app/utils';
import { useI18n } from '@/web/context/I18n';
import { useContextSelector } from 'use-context-selector';
import { AppContext } from '@/pages/app/detail/components/context';
import QuestionTip from '@fastgpt/web/components/common/MyTooltip/QuestionTip';
import FormLabel from '@fastgpt/web/components/common/MyBox/FormLabel';
import VariableTip from '@/components/common/Textarea/MyTextarea/VariableTip';
import { getWebLLMModel } from '@/web/common/system/utils';
import { useBoolean, useDebounceEffect } from 'ahooks';
import { useSimpleAppSnapshots } from './useSnapshots';
import PublishHistories from '../PublishHistoriesSlider';
import { AppTemplateTypeEnum, AppTypeEnum } from '@fastgpt/global/core/app/constants';
import { FlowNodeTypeEnum } from '@fastgpt/global/core/workflow/node/constant';
const DatasetSelectModal = dynamic(() => import('@/components/core/app/DatasetSelectModal'));
const DatasetParamsModal = dynamic(() => import('@/components/core/app/DatasetParamsModal'));
const ToolSelectModal = dynamic(() => import('./components/ToolSelectModal'));
const TTSSelect = dynamic(() => import('@/components/core/app/TTSSelect'));
const QGSwitch = dynamic(() => import('@/components/core/app/QGSwitch'));
const WhisperConfig = dynamic(() => import('@/components/core/app/WhisperConfig'));
const InputGuideConfig = dynamic(() => import('@/components/core/app/InputGuideConfig'));
const WelcomeTextConfig = dynamic(() => import('@/components/core/app/WelcomeTextConfig'));
const FileSelectConfig = dynamic(() => import('@/components/core/app/FileSelect'));
import {
  compareSimpleAppSnapshot,
  onSaveSnapshotFnType,
  SimpleAppSnapshotType
} from './useSnapshots';
import { AppVersionSchemaType } from '@fastgpt/global/core/app/version';
import { appWorkflow2Form } from '@fastgpt/global/core/app/utils';
import SaveButton from '../Workflow/components/SaveButton';
import { useRequest2 } from '@fastgpt/web/hooks/useRequest';
import AIcon from '@/components/AIcon/AIcon';
import { AiChatModule } from '@fastgpt/global/core/workflow/template/system/aiChat';
const BoxStyles: BoxProps = {
  px: [4, 5],
  py: '16px',
  borderBottomWidth: '1px',
  borderBottomColor: 'borderColor.low'
};
const LabelStyles: BoxProps = {
  w: ['60px', '100px'],
  whiteSpace: 'nowrap',
  flexShrink: 0,
  fontSize: 'sm',
  color: 'myGray.900'
};

const EditForm = ({
  appForm,
  setAppForm,
  past,
  setLocalPast
}: {
  appForm: AppSimpleEditFormType;
  past: SimpleAppSnapshotType[];
  setAppForm: React.Dispatch<React.SetStateAction<AppSimpleEditFormType>>;
  setLocalPast: (value: React.SetStateAction<SimpleAppSnapshotType[]>) => void;
}) => {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const { appT } = useI18n();

  const { appDetail, currentTab, onSaveApp } = useContextSelector(AppContext, (v) => v);

  const { allDatasets } = useDatasetStore();
  const [, startTst] = useTransition();

  const selectDatasets = useMemo(
    () =>
      allDatasets.filter((item) =>
        appForm.dataset?.datasets.find((dataset) => dataset.datasetId === item._id)
      ),
    [allDatasets, appForm?.dataset?.datasets]
  );

  const {
    isOpen: isOpenDatasetSelect,
    onOpen: onOpenKbSelect,
    onClose: onCloseKbSelect
  } = useDisclosure();
  const {
    isOpen: isOpenDatasetParams,
    onOpen: onOpenDatasetParams,
    onClose: onCloseDatasetParams
  } = useDisclosure();
  const {
    isOpen: isOpenToolsSelect,
    onOpen: onOpenToolsSelect,
    onClose: onCloseToolsSelect
  } = useDisclosure();

  const formatVariables = useMemo(
    () =>
      formatEditorVariablePickerIcon([
        ...workflowSystemVariables.filter(
          (variable) =>
            !['appId', 'chatId', 'responseChatItemId', 'histories'].includes(variable.key)
        ),
        ...(appForm.chatConfig.variables || [])
      ]).map((item) => ({
        ...item,
        label: t(item.label as any),
        parent: {
          id: 'VARIABLE_NODE_ID',
          label: t('common:core.module.Variable'),
          avatar: 'core/workflow/template/variable'
        }
      })),
    [appForm.chatConfig.variables, t]
  );

  const selectedModel = getWebLLMModel(appForm.aiSettings.model);
  const tokenLimit = useMemo(() => {
    return selectedModel?.quoteMaxToken || 3000;
  }, [selectedModel?.quoteMaxToken]);

  const { forbiddenSaveSnapshot, saveSnapshot } = useSimpleAppSnapshots(appDetail._id);
  const [isPublished, setIsPublished] = useState(false);
  useDebounceEffect(
    () => {
      const savedSnapshot = past.find((snapshot) => snapshot.isSaved);
      const val = compareSimpleAppSnapshot(savedSnapshot?.appForm, appForm);
      setIsPublished(val);
    },
    [past, allDatasets],
    { wait: 500 }
  );
  const [isShowHistories, { setTrue: setIsShowHistories, setFalse: closeHistories }] =
    useBoolean(false);
  const onSwitchTmpVersion = useCallback(
    (data: SimpleAppSnapshotType, customTitle: string) => {
      setAppForm(data.appForm);

      // Remove multiple "copy-"
      const copyText = t('app:version_copy');
      const regex = new RegExp(`(${copyText}-)\\1+`, 'g');
      const title = customTitle.replace(regex, `$1`);

      return saveSnapshot({
        appForm: data.appForm,
        title
      });
    },
    [saveSnapshot, setAppForm, t]
  );
  const onSwitchCloudVersion = useCallback(
    (appVersion: AppVersionSchemaType) => {
      const appForm = appWorkflow2Form({
        nodes: appVersion.nodes,
        chatConfig: appVersion.chatConfig
      });

      const res = saveSnapshot({
        appForm,
        title: `${t('app:version_copy')}-${appVersion.versionName}`
      });
      forbiddenSaveSnapshot.current = true;

      setAppForm(appForm);

      return res;
    },
    [forbiddenSaveSnapshot, saveSnapshot, setAppForm, t]
  );
  const { runAsync: onClickSave, loading } = useRequest2(
    async ({
      isPublish,
      versionName = formatTime2YMDHMS(new Date())
    }: {
      isPublish?: boolean;
      versionName?: string;
    }) => {
      const { nodes, edges } = form2AppWorkflow(appForm, t);
      await onSaveApp({
        nodes,
        edges,
        chatConfig: appForm.chatConfig,
        type: AppTypeEnum.simple,
        isPublish,
        versionName
      });
      setLocalPast((prevPast: any) =>
        prevPast.map((item: any, index: any) =>
          index === 0
            ? {
                ...item,
                isSaved: true
              }
            : item
        )
      );
    }
  );

  return (
    <>
      <Box>
        {/* ai */}
        <HStack
          borderBottom={'1px solid #e0e0e0'}
          h={'40px'}
          fontSize={'14px'}
          lineHeight={'40px'}
          p={'0px 20px'}
        >
          <Text>应用配置</Text>
          <Box flex={1}></Box>
          <Text
            w={'70px'}
            h={'30px'}
            lineHeight={'30px'}
            textAlign={'center'}
            borderRadius={'md'}
            userSelect={'none'}
            bgColor={isPublished ? 'rgb(193,217,154)' : 'rgb(254,242,244)'}
            fontSize={'13px'}
          >
            {isPublished ? '已保存' : '未保存'}
          </Text>
          <Box
            w={'100px'}
            h={'30px'}
            lineHeight={'30px'}
            textAlign={'center'}
            userSelect={'none'}
            borderRadius={'md'}
            cursor={'pointer'}
            border={'1px solid black'}
            onClick={() => {
              setIsShowHistories();
            }}
            fontSize={'13px'}
          >
            初始版本
          </Box>
          <SaveButton isLoading={loading} onClickSave={onClickSave} />
        </HStack>
        <Box {...BoxStyles} pt={1}>
          <Flex alignItems={'center'}>
            <AIcon name={'icon-jiqiren'} fontSize="1.5rem" color="primary.500" />
            <FormLabel ml={2} flex={1} fontSize={'13px'}>
              {t('app:ai_settings')}
            </FormLabel>
          </Flex>
          <Flex alignItems={'center'} mt={5}>
            <Box {...LabelStyles} pl={'30px'} fontSize={'13px'} pr={'20px'}>
              {t('common:core.ai.Model')}
            </Box>
            <Box flex={'1 0 0'} pr={'120px'}>
              <SettingLLMModel
                bg="white"
                llmModelType={'all'}
                defaultData={{
                  model: appForm.aiSettings.model,
                  temperature: appForm.aiSettings.temperature,
                  maxToken: appForm.aiSettings.maxToken,
                  maxHistories: appForm.aiSettings.maxHistories
                }}
                onChange={({ model, temperature, maxToken, maxHistories }: SettingAIDataType) => {
                  setAppForm((state) => ({
                    ...state,
                    aiSettings: {
                      ...state.aiSettings,
                      model,
                      temperature,
                      maxToken,
                      maxHistories: maxHistories ?? 6
                    }
                  }));
                }}
              />
            </Box>
          </Flex>

          <Flex mt={4}>
            <HStack
              //  {...LabelStyles}
              // w={'100%'}
              w={['60px', '100px']}
              h={'30px'}
              whiteSpace={'nowrap'}
              flexShrink={0}
              fontSize={'13px'}
              color={'myGray.900'}
            >
              <Box pl={'30px'}>{t('common:core.ai.Prompt')}</Box>
              <MyTooltip
                label="模型固定的引导词，通过调整该内容，可以引导模型聊天方向。该内容会被固定在上下文的开头。可通过输入 / 插入选择变量"
                placement="bottom-start"
              >
                <AIcon name="icon-yingwenzhushi" color="rgb(45,85,102)" fontSize="16px"></AIcon>
              </MyTooltip>
              {/* <QuestionTip label={t('common:core.app.tip.systemPromptTip')} />

              <Box flex={1} />
              <VariableTip color={'myGray.500'} /> */}
            </HStack>
            <Box mt={1} flex={1} pr={'120px'}>
              <PromptEditor
                minH={150}
                value={appForm.aiSettings.systemPrompt}
                bg={'white'}
                onChange={(text) => {
                  startTst(() => {
                    setAppForm((state) => ({
                      ...state,
                      aiSettings: {
                        ...state.aiSettings,
                        systemPrompt: text
                      }
                    }));
                  });
                }}
                variableLabels={formatVariables}
                variables={formatVariables}
                // placeholder={t('common:core.app.tip.systemPromptTip')}
                title={t('common:core.ai.Prompt')}
              />
            </Box>
          </Flex>
        </Box>

        {/* dataset */}
        <Box {...BoxStyles}>
          <Flex alignItems={'center'}>
            <Flex alignItems={'center'} flex={1}>
              {/* <MyIcon name={'core/app/simpleMode/dataset'} w={'20px'} /> */}
              <AIcon name="icon-peizhizhishikupeizhi" color="primary.500" fontSize="1.5rem"></AIcon>
              <FormLabel ml={2}>{t('common:core.dataset.Choose Dataset')}</FormLabel>
            </Flex>
            <Button
              variant={'transparentBase'}
              leftIcon={<MyIcon name="common/addLight" w={'0.8rem'} />}
              iconSpacing={1}
              size={'sm'}
              w={'100px'}
              mr={4}
              _hover={{
                bgColor: 'rgb(237,241,244)'
              }}
              borderWidth={'1px'}
              fontSize={'13px'}
              onClick={onOpenKbSelect}
            >
              选择知识库
            </Button>
            <Button
              variant={'transparentBase'}
              // leftIcon={<MyIcon name={'edit'} w={'14px'} />}
              // iconSpacing={1}
              w={'100px'}
              size={'sm'}
              borderWidth={'1px'}
              fontSize={'13px'}
              onClick={onOpenDatasetParams}
              _hover={{
                bgColor: 'rgb(237,241,244)'
              }}
            >
              参数设置
            </Button>
          </Flex>
          {appForm.dataset.datasets?.length > 0 && (
            <Box my={3}>
              <SearchParamsTip
                searchMode={appForm.dataset.searchMode}
                similarity={appForm.dataset.similarity}
                limit={appForm.dataset.limit}
                usingReRank={appForm.dataset.usingReRank}
                datasetSearchUsingExtensionQuery={appForm.dataset.datasetSearchUsingExtensionQuery}
                queryExtensionModel={appForm.dataset.datasetSearchExtensionModel}
              />
            </Box>
          )}
          <Grid gridTemplateColumns={'repeat(4, minmax(0, 1fr))'} gridGap={[2, 4]}>
            {selectDatasets.map((item) => (
              // <MyTooltip key={item._id} label={t('common:core.dataset.Read Dataset')}>
              <Flex
                key={item._id}
                overflow={'hidden'}
                alignItems={'center'}
                p={2}
                // bg={'linear-gradient(to right,rgb(252,244,222), white);'}
                _hover={{
                  borderColor: 'primary.500'
                }}
                boxShadow={'0 4px 8px -2px rgba(16,24,40,.1),0 2px 4px -2px rgba(16,24,40,.06)'}
                borderRadius={'md'}
                border={theme.borders.base}
                cursor={'pointer'}
                onClick={() =>
                  router.push({
                    pathname: '/dataset/detail',
                    query: {
                      datasetId: item._id
                    }
                  })
                }
              >
                {/* <Avatar src={item.avatar} w={'1.5rem'} borderRadius={'sm'} /> */}
                <AIcon name="icon-peizhizhishikupeizhi" fontSize="1.5rem" color="primary.500" />

                <Box
                  ml={2}
                  flex={'1 0 0'}
                  w={0}
                  className={'textEllipsis'}
                  fontSize={'sm'}
                  color={'myGray.900'}
                >
                  {item.name}
                </Box>
              </Flex>
              // </MyTooltip>
            ))}
          </Grid>
        </Box>

        {/* tool choice */}
        <Box {...BoxStyles}>
          <Flex alignItems={'center'}>
            <Flex alignItems={'center'} flex={1}>
              <AIcon name="icon-chajian" fontSize="1.5rem" color="primary.500" />
              <FormLabel mx={2}>{appT('plugin_dispatch')}</FormLabel>
              {/* <QuestionTip ml={1} label={appT('plugin_dispatch_tip')} /> */}
              <MyTooltip label={appT('plugin_dispatch_tip')} placement="top-start">
                <AIcon name="icon-yingwenzhushi" color="rgb(45,85,102)" fontSize="16px"></AIcon>
              </MyTooltip>
            </Flex>
            <Button
              variant={'transparentBase'}
              leftIcon={<SmallAddIcon />}
              iconSpacing={1}
              size={'sm'}
              w={'100px'}
              borderWidth={'1px'}
              _hover={{
                bgColor: 'rgb(237,241,244)'
              }}
              fontSize={'13px'}
              onClick={onOpenToolsSelect}
            >
              选择插件
            </Button>
          </Flex>
          <Grid
            mt={appForm.selectedTools.length > 0 ? 2 : 0}
            gridTemplateColumns={'repeat(4, minmax(0, 1fr))'}
            gridGap={[2, 4]}
          >
            {appForm.selectedTools.map((item) => {
              return (
                <MyTooltip key={item.id} label={item.intro}>
                  <Flex
                    overflow={'hidden'}
                    alignItems={'center'}
                    p={2.5}
                    lineHeight={'15px'}
                    bg={'white'}
                    boxShadow={'0 4px 8px -2px rgba(16,24,40,.1),0 2px 4px -2px rgba(16,24,40,.06)'}
                    borderRadius={'md'}
                    border={theme.borders.base}
                    _hover={{
                      ...hoverDeleteStyles,
                      borderColor: 'primary.500'
                    }}
                  >
                    {/* <Avatar src={item.avatar} w={'1.5rem'} borderRadius={'sm'} /> */}
                    {item.templateType === 'teamApp' && (
                      <AIcon
                        {...(item.flowNodeType === FlowNodeTypeEnum.appModule
                          ? { name: 'icon-biaoqian1', color: 'rgb(0,47,167)' }
                          : item.flowNodeType === FlowNodeTypeEnum.pluginModule
                            ? {
                                name: 'icon-guanyuchajian',
                                color: 'rgb(0,140,140)'
                              }
                            : {
                                name: 'icon-biaoqian2',
                                color: 'rgb(230,0,0)'
                              })}
                        fontSize="1.5rem"
                      ></AIcon>
                    )}

                    {item.templateType === 'tools' && (
                      <Avatar
                        src={item.avatar}
                        w={'1.5rem'}
                        h={'1.5rem'}
                        // m={'10px'}
                        borderRadius={'md'}
                      />
                    )}
                    <Box
                      ml={2}
                      flex={'1 0 0'}
                      w={0}
                      className={'textEllipsis'}
                      fontSize={'13px'}
                      color={'myGray.900'}
                    >
                      {item.name}
                    </Box>
                    <DeleteIcon
                      onClick={() => {
                        setAppForm((state) => ({
                          ...state,
                          selectedTools: state.selectedTools.filter((tool) => tool.id !== item.id)
                        }));
                      }}
                    />
                  </Flex>
                </MyTooltip>
              );
            })}
          </Grid>
        </Box>

        {/* File select */}
        <Box {...BoxStyles}>
          <FileSelectConfig
            forbidVision={!selectedModel?.vision}
            value={appForm.chatConfig.fileSelectConfig}
            onChange={(e) => {
              setAppForm((state) => ({
                ...state,
                chatConfig: {
                  ...state.chatConfig,
                  fileSelectConfig: e
                }
              }));
            }}
          />
        </Box>

        {/* variable */}
        <Box {...BoxStyles}>
          <VariableEdit
            variables={appForm.chatConfig.variables}
            onChange={(e) => {
              setAppForm((state) => ({
                ...state,
                chatConfig: {
                  ...state.chatConfig,
                  variables: e
                }
              }));
            }}
          />
        </Box>

        {/* welcome */}
        <Box {...BoxStyles}>
          <WelcomeTextConfig
            value={appForm.chatConfig.welcomeText}
            onChange={(e) => {
              setAppForm((state) => ({
                ...state,
                chatConfig: {
                  ...state.chatConfig,
                  welcomeText: e.target.value
                }
              }));
            }}
          />
        </Box>

        {/* tts */}
        <Box {...BoxStyles}>
          <TTSSelect
            value={appForm.chatConfig.ttsConfig}
            onChange={(e) => {
              setAppForm((state) => ({
                ...state,
                chatConfig: {
                  ...state.chatConfig,
                  ttsConfig: e
                }
              }));
            }}
          />
        </Box>

        {/* whisper */}
        <Box {...BoxStyles}>
          <WhisperConfig
            isOpenAudio={appForm.chatConfig.ttsConfig?.type !== TTSTypeEnum.none}
            value={appForm.chatConfig.whisperConfig}
            onChange={(e) => {
              setAppForm((state) => ({
                ...state,
                chatConfig: {
                  ...state.chatConfig,
                  whisperConfig: e
                }
              }));
            }}
          />
        </Box>

        {/* question guide */}
        <Box {...BoxStyles}>
          <QGSwitch
            isChecked={appForm.chatConfig.questionGuide}
            onChange={(e) => {
              setAppForm((state) => ({
                ...state,
                chatConfig: {
                  ...state.chatConfig,
                  questionGuide: e.target.checked
                }
              }));
            }}
          />
        </Box>

        {/* question tips */}
        <Box {...BoxStyles} borderRadius="md">
          <InputGuideConfig
            appId={appDetail._id}
            value={appForm.chatConfig.chatInputGuide}
            onChange={(e) => {
              setAppForm((state) => ({
                ...state,
                chatConfig: {
                  ...state.chatConfig,
                  chatInputGuide: e
                }
              }));
            }}
          />
        </Box>
      </Box>

      {isOpenDatasetSelect && (
        <DatasetSelectModal
          isOpen={isOpenDatasetSelect}
          defaultSelectedDatasets={selectDatasets.map((item) => ({
            datasetId: item._id,
            vectorModel: item.vectorModel
          }))}
          onClose={onCloseKbSelect}
          onChange={(e) => {
            setAppForm((state) => ({
              ...state,
              dataset: {
                ...state.dataset,
                datasets: e
              }
            }));
          }}
        />
      )}
      {isOpenDatasetParams && (
        <DatasetParamsModal
          {...appForm.dataset}
          maxTokens={tokenLimit}
          onClose={onCloseDatasetParams}
          onSuccess={(e) => {
            setAppForm((state) => ({
              ...state,
              dataset: {
                ...state.dataset,
                ...e
              }
            }));

            console.dir(e);
          }}
        />
      )}
      {isOpenToolsSelect && (
        <ToolSelectModal
          selectedTools={appForm.selectedTools}
          onAddTool={(e) => {
            setAppForm((state) => ({
              ...state,
              selectedTools: [...state.selectedTools, e]
            }));
          }}
          onRemoveTool={(e) => {
            setAppForm((state) => ({
              ...state,
              selectedTools: state.selectedTools.filter((item) => item.pluginId !== e.id)
            }));
          }}
          onClose={onCloseToolsSelect}
        />
      )}
      {isShowHistories && currentTab === TabEnum.appEdit && (
        <PublishHistories<SimpleAppSnapshotType>
          onClose={closeHistories}
          past={past}
          onSwitchTmpVersion={onSwitchTmpVersion}
          onSwitchCloudVersion={onSwitchCloudVersion}
          positionStyles={{
            top: 14,
            bottom: 3
          }}
        />
      )}
    </>
  );
};

export default React.memo(EditForm);
