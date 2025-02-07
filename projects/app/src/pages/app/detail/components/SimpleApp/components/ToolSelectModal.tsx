import React, { useCallback, useEffect, useState } from 'react';

import MyModal from '@fastgpt/web/components/common/MyModal';
import { useTranslation } from 'next-i18next';
import {
  Box,
  Button,
  Flex,
  Grid,
  HStack,
  Image,
  Input,
  InputGroup,
  InputLeftElement,
  ModalBody,
  ModalFooter,
  Text
} from '@chakra-ui/react';
import FillRowTabs from '@fastgpt/web/components/common/Tabs/FillRowTabs';
import { useRequest2 } from '@fastgpt/web/hooks/useRequest';
import EmptyTip from '@fastgpt/web/components/common/EmptyTip';
import {
  FlowNodeTemplateType,
  NodeTemplateListItemType
} from '@fastgpt/global/core/workflow/type/node.d';
import Avatar from '@fastgpt/web/components/common/Avatar';
import MyIcon from '@fastgpt/web/components/common/Icon';
import { AddIcon } from '@chakra-ui/icons';
import {
  getPreviewPluginNode,
  getSystemPlugTemplates,
  getSystemPluginPaths
} from '@/web/core/app/api/plugin';
import MyBox from '@fastgpt/web/components/common/MyBox';
import { Controller, useForm } from 'react-hook-form';
import { getTeamPlugTemplates } from '@/web/core/app/api/plugin';
import { ParentIdType } from '@fastgpt/global/common/parentFolder/type';
import { getAppFolderPath } from '@/web/core/app/api/app';
import FolderPath from '@/components/common/folder/Path';
import MyTooltip from '@fastgpt/web/components/common/MyTooltip';
import CostTooltip from '@/components/core/app/plugin/CostTooltip';
import { useSystemStore } from '@/web/common/system/useSystemStore';
import RenderPluginInput from '@/components/core/chat/ChatContainer/PluginRunBox/components/renderPluginInput';
import { NodeInputKeyEnum, WorkflowIOValueTypeEnum } from '@fastgpt/global/core/workflow/constants';
import { useContextSelector } from 'use-context-selector';
import { AppContext } from '../../context';
import { AppTypeEnum } from '@fastgpt/global/core/app/constants';
import AIcon from '@/components/AIcon/AIcon';
import Loading from '@fastgpt/web/components/common/MyLoading';
type Props = {
  selectedTools: FlowNodeTemplateType[];
  onAddTool: (tool: FlowNodeTemplateType) => void;
  onRemoveTool: (tool: NodeTemplateListItemType) => void;
};

const childAppSystemKey: string[] = [
  NodeInputKeyEnum.forbidStream,
  NodeInputKeyEnum.history,
  NodeInputKeyEnum.historyMaxAmount,
  NodeInputKeyEnum.userChatInput
];

enum TemplateTypeEnum {
  'systemPlugin' = 'systemPlugin',
  'teamPlugin' = 'teamPlugin'
}

const ToolSelectModal = ({ onClose, ...props }: Props & { onClose: () => void }) => {
  const { t } = useTranslation();
  const { appDetail } = useContextSelector(AppContext, (v) => v);

  const [templateType, setTemplateType] = useState(TemplateTypeEnum.teamPlugin);
  const [parentId, setParentId] = useState<ParentIdType>('');
  const [searchKey, setSearchKey] = useState('');
  const [selectType, setSelectType] = useState<any>();
  const [menuActive, setMenuActive] = useState('ALL');
  const changeTemplateData = (type: any) => {
    setSelectType(type);
  };
  const {
    data: templates = [],
    runAsync: loadTemplates,
    loading: isLoading
  } = useRequest2(
    async ({
      type = templateType,
      parentId = '',
      selectFilterType = selectType,
      searchVal = searchKey
    }: {
      type?: TemplateTypeEnum;
      selectFilterType?: any;
      parentId?: ParentIdType;
      searchVal?: string;
    }) => {
      if (selectFilterType === TemplateTypeEnum.systemPlugin) {
        return getSystemPlugTemplates({ parentId, searchKey: searchVal });
      } else {
        return getTeamPlugTemplates({
          parentId,
          type: selectFilterType,
          searchKey: searchVal
        }).then((res) => {
          return res.filter((app) => app.id !== appDetail._id);
        });
      }
    },
    {
      onSuccess(_, [{ type = templateType, parentId = '' }]) {
        setTemplateType(type);
        setParentId(parentId);
      },
      refreshDeps: [templateType, searchKey, parentId],
      errorToast: t('common:core.module.templates.Load plugin error')
    }
  );

  const { data: paths = [] } = useRequest2(
    () => {
      if (templateType === TemplateTypeEnum.teamPlugin) return getAppFolderPath(parentId);
      return getSystemPluginPaths(parentId);
    },
    {
      manual: false,
      refreshDeps: [parentId]
    }
  );

  const onUpdateParentId = useCallback(
    (parentId: ParentIdType) => {
      setMenuActive('ALL');
      //bug  系统插件如果有目录大概率出错
      loadTemplates({
        selectFilterType: [
          AppTypeEnum.folder,
          AppTypeEnum.plugin,
          AppTypeEnum.simple,
          AppTypeEnum.workflow,
          AppTypeEnum.httpPlugin
        ],
        parentId
      });
    },
    [loadTemplates]
  );
  const menuList = [
    {
      title: '全部',
      value: [
        AppTypeEnum.folder,
        AppTypeEnum.plugin,
        AppTypeEnum.simple,
        AppTypeEnum.workflow,
        AppTypeEnum.httpPlugin
      ],
      menuValue: 'ALL'
    },
    {
      title: t('app:type.Simple bot'),
      value: [AppTypeEnum.folder, AppTypeEnum.simple],
      menuValue: 'simple'
    },
    {
      title: '工作流',
      value: [AppTypeEnum.folder, AppTypeEnum.workflow],
      menuValue: 'workflow'
    },
    {
      title: '团队插件',
      value: [AppTypeEnum.folder, AppTypeEnum.plugin, AppTypeEnum.httpPlugin],
      menuValue: 'teamPlugin'
    },
    {
      title: '系统插件',
      value: TemplateTypeEnum.systemPlugin,
      menuValue: 'systemPlugin'
    }
  ];
  useRequest2(() => loadTemplates({ searchVal: searchKey }), {
    manual: false,
    throttleWait: 300,
    refreshDeps: [searchKey]
  });

  return (
    <MyModal
      isOpen
      titleBgc="#E2E3EA"
      title={
        <Flex alignItems={'center'} w={'62vw'} h={'42px'} justifyContent={'space-between'}>
          <Text>{t('common:core.app.Tool call')}</Text>
          {/* {!searchKey && parentId && ( */}
          {/* <Flex px={[3, 3]} flex={1}>
            <FolderPath
              paths={paths}
              FirstPathDom={null}
              onClick={() => {
                onUpdateParentId(null);
              }}
            />
          </Flex> */}
          {/* )} */}
          {/* <SelectPluginHeaderFilter></SelectPluginHeaderFilter> */}
          <HStack pl={'10vw'}>
            {menuList.map((item) => {
              return (
                <>
                  <Box
                    minWidth={'60px'}
                    fontSize={'13px'}
                    cursor={'pointer'}
                    key={item.menuValue}
                    userSelect={'none'}
                    h={'30px'}
                    px={'10px'}
                    lineHeight={'30px'}
                    bgColor={menuActive === item.menuValue ? '#ECEFF6' : '#fff'}
                    borderRadius={'md'}
                    textAlign={'center'}
                    onClick={() => {
                      setSelectType(item.value);
                      setMenuActive(item.menuValue);
                      loadTemplates({
                        selectFilterType: item.value,
                        parentId: parentId || null
                      });
                    }}
                  >
                    {item.title}
                  </Box>
                </>
              );
            })}
          </HStack>
          <InputGroup w={300} mr={1}>
            <InputLeftElement h={'full'} alignItems={'center'} display={'flex'}>
              {/* <MyIcon name={'common/searchLight'} w={'16px'} color={'myGray.500'} ml={3} /> */}
              <AIcon name="icon-sousuo" color="primary.500"></AIcon>
            </InputLeftElement>
            <Input
              // bg={'myGray.50'}
              border={'1px solid #AAAAAA'}
              size={'sm'}
              borderRadius={'md'}
              // placeholder={t('common:plugin.Search plugin')}
              onChange={(e) => setSearchKey(e.target.value)}
            />
          </InputGroup>
        </Flex>
      }
      iconSrc="/imgs/images/picture/plugin.png"
      onClose={onClose}
      maxW={['90vw', '70vw']}
      w={'70vw'}
      h={['90vh', '80vh']}
    >
      {/* Header: row and search */}
      {/* <Box px={[3, 6]} pt={4} display={'flex'} justifyContent={'space-between'} w={'full'}>
        <FillRowTabs
          list={[
            {
              icon: 'core/modules/teamPlugin',
              label: t('common:core.app.ToolCall.Team'),
              value: TemplateTypeEnum.teamPlugin
            },
            {
              icon: 'core/modules/systemPlugin',
              label: t('common:core.app.ToolCall.System'),
              value: TemplateTypeEnum.systemPlugin
            }
          ]}
          py={'5px'}
          px={'15px'}
          value={templateType}
          onChange={(e) => {
            loadTemplates({
              type: e as TemplateTypeEnum,
              parentId: null
            });
          }}
        />
      </Box> */}
      {/* route components */}
      {/* {!searchKey && parentId && ( */}
      <Flex mt={2} px={[3, 6]}>
        <FolderPath
          paths={paths}
          FirstPathDom={null}
          onClick={() => {
            onUpdateParentId(null);
          }}
        />
      </Flex>
      {/* )} */}
      <MyBox isLoading={isLoading} mt={2} px={[3, 6]} pb={3} flex={'1 0 0'} overflowY={'auto'}>
        <RenderList
          templates={templates}
          isLoadingData={isLoading}
          setParentId={onUpdateParentId}
          showCost={templateType === TemplateTypeEnum.systemPlugin}
          {...props}
        />
      </MyBox>
    </MyModal>
  );
};

export default React.memo(ToolSelectModal);

const RenderList = React.memo(function RenderList({
  templates,
  selectedTools,
  isLoadingData,
  onAddTool,
  onRemoveTool,
  setParentId,
  showCost
}: Props & {
  templates: NodeTemplateListItemType[];
  isLoadingData: boolean;
  setParentId: (parentId: ParentIdType) => any;
  showCost?: boolean;
}) {
  const { t } = useTranslation();
  const { feConfigs } = useSystemStore();
  const [configTool, setConfigTool] = useState<FlowNodeTemplateType>();
  const onCloseConfigTool = useCallback(() => setConfigTool(undefined), []);

  const {
    handleSubmit,
    reset,
    control,
    formState: { errors }
  } = useForm();

  useEffect(() => {
    if (configTool) {
      const defaultValues = configTool.inputs.reduce(
        (acc, input) => {
          acc[input.key] = input.defaultValue;
          return acc;
        },
        {} as Record<string, any>
      );
      reset(defaultValues);
    }
  }, [configTool, reset]);

  const { runAsync: onClickAdd, loading: isLoading } = useRequest2(
    async (template: NodeTemplateListItemType) => {
      const res = await getPreviewPluginNode({ appId: template.id });

      // All input is tool params
      if (
        res.inputs.every((input) => childAppSystemKey.includes(input.key) || input.toolDescription)
      ) {
        onAddTool(res);
      } else {
        reset();
        setConfigTool(res);
      }
    },
    {
      errorToast: t('common:core.module.templates.Load plugin error')
    }
  );

  return templates.length === 0 && !isLoadingData ? (
    <EmptyTip text={t('common:core.app.ToolCall.No plugin')} />
  ) : (
    <Grid
      gridTemplateColumns={[
        'repeat(1, minmax(0, 1fr))',
        'repeat(2, minmax(0, 1fr))',
        'repeat(4, minmax(0, 1fr))'
      ]}
      gridGap={4}
    >
      {isLoading && <Loading fixed={false} />}
      {templates.map((item, i) => {
        const selected = selectedTools.some((tool) => tool.pluginId === item.id);

        return (
          // <MyTooltip
          //   key={item.id}
          //   placement={'bottom'}
          //   shouldWrapChildren={false}
          //   label={
          //     <Box>
          //       <Flex alignItems={'center'}>
          //         <Avatar
          //           src={item.avatar}
          //           w={'1.75rem'}
          //           objectFit={'contain'}
          //           borderRadius={'sm'}
          //         />
          //         <Box fontWeight={'bold'} ml={2} color={'myGray.900'}>
          //           {t(item.name as any)}
          //         </Box>
          //       </Flex>
          //       <Box mt={2} color={'myGray.500'}>
          //         {t(item.intro as any) || t('common:core.workflow.Not intro')}
          //       </Box>
          //       {showCost && <CostTooltip cost={item.currentCost} />}
          //     </Box>
          //   }
          // >
          <>
            <Flex
              // alignItems={'center'}
              position={'relative'}
              h={'100px'}
              // p={[4, 5]}
              // _notLast={{
              //   borderBottomWidth: '1px',
              //   borderBottomColor: 'myGray.150'
              // }}
              direction={'column'}
              pb={'5px'}
              key={item.id}
              justifyContent={'space-between'}
              borderRadius={'md'}
              boxShadow={'4px 4px 4px rgb(0,0,0,0.1) '}
              bgImage={'/imgs/images/picture/appbackgroundimage.png'}
              bgSize={'cover'}
              border={'1px solid #0C88BD'}
              _hover={
                {
                  // bg: 'myGray.50'
                }
              }
              cursor={selected ? '' : 'pointer'}
              onClick={() => {
                if (item.isFolder) {
                  setParentId(item.id);
                } else {
                  if (!selected) {
                    onClickAdd(item);
                  }
                }
              }}
            >
              <Flex>
                {item.isFolder && (
                  <Image
                    src="/imgs/images/picture/文件.png"
                    w={'30px'}
                    h={'30px'}
                    m={'10px'}
                    alt={''}
                  ></Image>
                )}
                {item.isSimpleApp && (
                  <AIcon name="icon-biaoqian1" color={item.selectColor} fontSize="25px"></AIcon>
                )}
                {item.isWorkflow && (
                  <AIcon name="icon-biaoqian2" color={item.selectColor} fontSize="30px"></AIcon>
                )}
                {item.isplugin && (
                  <AIcon name="icon-guanyuchajian" color={item.selectColor} fontSize="30px"></AIcon>
                )}
                {!item.isFolder && !item.isSimpleApp && !item.isWorkflow && !item.isplugin && (
                  <Avatar src={item.avatar} w={'30px'} h={'30px'} m={'10px'} borderRadius={'md'} />
                )}

                <Box ml={3} h={'50px'} lineHeight={'50px'} flex={'1 0 0'} color={'myGray.900'}>
                  {t(item.name as any)}
                </Box>
              </Flex>

              {/* {item.author !== undefined && (
                <Box fontSize={'xs'} mr={3}>
                  {`${item.author || ''}`}
                </Box>
              )} */}
              <HStack justifyContent={'space-between'}>
                <Text fontSize={'13px'} fontWeight={800} pl={'20px'}>
                  {item.isFolder
                    ? '目录'
                    : item.isSimpleApp
                      ? '应用'
                      : item.isWorkflow
                        ? '工作流'
                        : item.isplugin
                          ? '插件'
                          : ''}
                </Text>
                {selected && (
                  <AIcon
                    name="icon-shanchu1"
                    fontSize="20px"
                    onClick={() => onRemoveTool(item)}
                    mr={'5px'}
                    cursor={'pointer'}
                  ></AIcon>
                  // <Button
                  //   size={'sm'}
                  //   w={'30px'}
                  //   variant={'grayDanger'}
                  //   leftIcon={<MyIcon name={'delete'} w={'30px'} />}

                  // >

                  //   {t('common:common.Remove')}
                  // </Button>
                )}
                {/* : item.isFolder ? (
                  <Button size={'sm'} variant={'whiteBase'} onClick={() => setParentId(item.id)}>
                    {t('common:common.Open')}
                  </Button>
                ) : (
                  <Button
                    size={'sm'}
                    variant={'whiteBase'}
                    leftIcon={<AddIcon fontSize={'10px'} />}
                    isLoading={isLoading}
                    onClick={() => onClickAdd(item)}
                  >
                    {t('common:common.Add')}
                  </Button>
                ) */}
              </HStack>
            </Flex>
          </>
          // </MyTooltip>
        );
      })}

      {/* Plugin input config */}
      {!!configTool && (
        <MyModal
          isOpen
          isCentered
          title={t('common:core.app.ToolCall.Parameter setting')}
          iconSrc="core/app/toolCall"
          overflow={'auto'}
        >
          <ModalBody>
            <HStack mb={4} spacing={1} fontSize={'sm'}>
              <MyIcon name={'common/info'} w={'1.25rem'} />
              <Box flex={1}>{t('app:tool_input_param_tip')}</Box>
              {configTool.courseUrl && (
                <Box
                  cursor={'pointer'}
                  color={'primary.500'}
                  onClick={() => window.open(configTool.courseUrl, '_blank')}
                >
                  {t('app:workflow.Input guide')}
                </Box>
              )}
            </HStack>
            {configTool.inputs
              .filter((item) => !item.toolDescription && !childAppSystemKey.includes(item.key))
              .map((input) => {
                return (
                  <Controller
                    key={input.key}
                    control={control}
                    name={input.key}
                    rules={{
                      validate: (value) => {
                        if (input.valueType === WorkflowIOValueTypeEnum.boolean) {
                          return value !== undefined;
                        }
                        return !!value;
                      }
                    }}
                    render={({ field: { onChange, value } }) => {
                      return (
                        <RenderPluginInput
                          value={value}
                          isInvalid={errors && Object.keys(errors).includes(input.key)}
                          onChange={onChange}
                          input={input}
                          setUploading={() => {}}
                        />
                      );
                    }}
                  />
                );
              })}
          </ModalBody>
          <ModalFooter gap={6}>
            <Button onClick={onCloseConfigTool} variant={'whiteBase'}>
              {t('common:common.Cancel')}
            </Button>
            <Button
              variant={'primary'}
              onClick={handleSubmit((data) => {
                onAddTool({
                  ...configTool,
                  inputs: configTool.inputs.map((input) => ({
                    ...input,
                    value: data[input.key] ?? input.value
                  }))
                });
                onCloseConfigTool();
              })}
            >
              {t('common:common.Confirm')}
            </Button>
          </ModalFooter>
        </MyModal>
      )}
    </Grid>
  );
});
