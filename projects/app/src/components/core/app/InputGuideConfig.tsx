import MyIcon from '@fastgpt/web/components/common/Icon';
import MyTooltip from '@fastgpt/web/components/common/MyTooltip';
import {
  Box,
  Button,
  Flex,
  ModalBody,
  useDisclosure,
  Switch,
  Textarea,
  Checkbox,
  Stack
} from '@chakra-ui/react';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'next-i18next';
import type { ChatInputGuideConfigType } from '@fastgpt/global/core/app/type.d';
import MyModal from '@fastgpt/web/components/common/MyModal';
import MyInput from '@/components/MyInput';
import QuestionTip from '@fastgpt/web/components/common/MyTooltip/QuestionTip';
import { useI18n } from '@/web/context/I18n';
import { fileDownload } from '@/web/common/file/utils';
import { getDocPath } from '@/web/common/system/doc';
import {
  delAllChatInputGuide,
  delChatInputGuide,
  getChatInputGuideList,
  getCountChatInputGuideTotal,
  postChatInputGuides,
  putChatInputGuide
} from '@/web/core/chat/inputGuide/api';
import { useQuery } from '@tanstack/react-query';
import { useVirtualScrollPagination } from '@fastgpt/web/hooks/useScrollPagination';
import EmptyTip from '@fastgpt/web/components/common/EmptyTip';
import { useToast } from '@fastgpt/web/hooks/useToast';
import { useSelectFile } from '@/web/common/file/hooks/useSelectFile';
import { readCsvRawText } from '@fastgpt/web/common/file/utils';
import { useRequest2 } from '@fastgpt/web/hooks/useRequest';
import HighlightText from '@fastgpt/web/components/common/String/HighlightText';
import { defaultChatInputGuideConfig } from '@fastgpt/global/core/app/constants';
import ChatFunctionTip from './Tip';
import FormLabel from '@fastgpt/web/components/common/MyBox/FormLabel';
import { useConfirm } from '@fastgpt/web/hooks/useConfirm';
import AIcon from '@/components/AIcon/AIcon';
import MyBox from '@fastgpt/web/components/common/MyBox';

const csvTemplate = `"第一列内容"
"只会将第一列内容导入，其余列会被忽略"
"AIGC发展分为几个阶段？"`;

const InputGuideConfig = ({
  appId,
  value = defaultChatInputGuideConfig,
  onChange
}: {
  appId: string;
  value?: ChatInputGuideConfigType;
  onChange: (e: ChatInputGuideConfigType) => void;
}) => {
  const { t } = useTranslation();
  const { chatT, commonT } = useI18n();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isOpenLexiconConfig,
    onOpen: onOpenLexiconConfig,
    onClose: onCloseLexiconConfig
  } = useDisclosure();
  const isOpenQuestionGuide = value.open;

  const { data } = useQuery(
    [appId, isOpenLexiconConfig],
    () => {
      return getCountChatInputGuideTotal({
        appId
      });
    },
    {
      enabled: !!appId
    }
  );
  const total = data?.total || 0;

  const formLabel = useMemo(() => {
    if (!isOpenQuestionGuide) {
      return t('common:core.app.whisper.Close');
    }
    return t('common:core.app.whisper.Open');
  }, [t, isOpenQuestionGuide]);

  return (
    <Flex alignItems={'center'}>
      {/* <MyIcon name={'core/app/inputGuides'} mr={2} w={'20px'} /> */}
      <AIcon pr={'10px'} name="icon-yindao" fontSize="25px" color="primary.500" />

      <Flex alignItems={'center'}>
        <FormLabel color={'myGray.600'}>{chatT('input_guide')}</FormLabel>
        <ChatFunctionTip type={'inputGuide'} />
      </Flex>
      <Box flex={1} />
      {/* <MyTooltip label={chatT('config_input_guide')}> */}
      <Button variant={'whiteCommon'} w={'100px'} iconSpacing={1} size={'sm'} onClick={onOpen}>
        {formLabel}
      </Button>
      {/* </MyTooltip> */}
      <MyModal
        title={chatT('input_guide')}
        iconSrc="/imgs/images/picture/inputGuides.png"
        isOpen={isOpen}
        onClose={onClose}
        titleBgc="#E2E3EA"
        minW={'750px'}
      >
        <ModalBody px={[5, 4]} py={[4, 4]} bg={'linear-gradient(to right, #EFEFF9, #fff)'}>
          <Flex alignItems={'center'} gap={5}>
            <FormLabel>{t('common:is_open')}</FormLabel>
            <Switch
              isChecked={isOpenQuestionGuide}
              onChange={(e) => {
                onChange({
                  ...value,
                  open: e.target.checked
                });
              }}
            />
          </Flex>
          {isOpenQuestionGuide && (
            <>
              <Flex mt={4} direction={'column'} justifyContent={'center'}>
                {/* <Flex>
                  <FormLabel>{chatT('input_guide_lexicon')}</FormLabel>
                  <Box fontSize={'xs'} px={2} bg={'myGray.100'} ml={1} rounded={'full'}>
                    {total}
                  </Box>
                  <Box flex={'1 0 0'} /> */}
                {/* <Button
                    variant={'whiteBase'}
                    size={'sm'}
                    leftIcon={<MyIcon boxSize={'4'} name={'common/settingLight'} />}
                    onClick={() => {
                      onOpenLexiconConfig();
                    }}
                  >
                    {chatT('config_input_guide_lexicon')}
                  </Button> */}
                {/* </Flex> */}
                <LexiconConfigModal appId={appId} onClose={onCloseLexiconConfig} />
              </Flex>
              <Stack bgColor={'#fff'} mt={3} p={2} borderRadius={'md'} border={'1px solid #e0e0e0'}>
                <Flex alignItems={'center'} borderBottom={'1px solid #B7BABF'}>
                  <FormLabel>{chatT('custom_input_guide_url')}</FormLabel>
                  <Flex
                    onClick={() => window.open(getDocPath('/docs/guide/course/chat_input_guide/'))}
                    color={'primary.700'}
                    alignItems={'center'}
                    cursor={'pointer'}
                  >
                    {/* <MyIcon name={'book'} w={'17px'} ml={4} mr={1} color={'myGray.600'} />
                    {commonT('common.Documents')} */}
                  </Flex>
                  <Box flex={'1 0 0'} />
                </Flex>
                <Textarea
                  h={'120px'}
                  // bg={'myGray.50'}
                  defaultValue={value.customUrl}
                  onBlur={(e) =>
                    onChange({
                      ...value,
                      customUrl: e.target.value
                    })
                  }
                />
              </Stack>
            </>
          )}
        </ModalBody>
      </MyModal>

      {/* {isOpenLexiconConfig && <LexiconConfigModal appId={appId} onClose={onCloseLexiconConfig} />} */}
    </Flex>
  );
};

export default React.memo(InputGuideConfig);

const LexiconConfigModal = ({ appId, onClose }: { appId: string; onClose: () => void }) => {
  const { chatT, commonT } = useI18n();
  const { t } = useTranslation();
  const { toast } = useToast();
  const { File, onOpen: onOpenSelectFile } = useSelectFile({
    fileType: '.csv'
  });
  const [newData, setNewData] = useState<string>();

  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [editDataId, setEditDataId] = useState<string>();

  const [searchKey, setSearchKey] = useState('');

  const { openConfirm: openConfirmDel, ConfirmModal: DelConfirmModal } = useConfirm({
    type: 'delete'
  });

  const {
    scrollDataList,
    setData,
    ScrollList,
    isLoading: isRequesting,
    fetchData,
    scroll2Top
  } = useVirtualScrollPagination(getChatInputGuideList, {
    refreshDeps: [searchKey],
    // debounceWait: 300,

    itemHeight: 48,
    overscan: 20,

    pageSize: 20,
    defaultParams: {
      appId,
      searchKey
    }
  });

  const { run: createNewData, loading: isCreating } = useRequest2(
    (textList: string[]) => {
      if (textList.filter(Boolean).length === 0) {
        return Promise.resolve();
      }
      scroll2Top();
      return postChatInputGuides({
        appId,
        textList
      }).then((res) => {
        if (res.insertLength < textList.length) {
          toast({
            status: 'warning',
            title: chatT('insert_input_guide,_some_data_already_exists', { len: res.insertLength })
          });
        } else {
          toast({
            status: 'success',
            title: t('common:common.Add Success')
          });
        }
        fetchData(1);
      });
    },
    {
      onSuccess() {
        setNewData(undefined);
      },
      errorToast: t('common:error.Create failed')
    }
  );

  const onUpdateData = ({ text, dataId }: { text: string; dataId: string }) => {
    setData((state) =>
      state.map((item) => {
        if (item._id === dataId) {
          return {
            ...item,
            text
          };
        }
        return item;
      })
    );

    if (text) {
      putChatInputGuide({
        appId,
        text,
        dataId
      });
    }

    setEditDataId(undefined);
  };
  const onDeleteData = (dataIdList: string[]) => {
    setData((state) => state.filter((item) => !dataIdList.includes(item._id)));
    delChatInputGuide({
      appId,
      dataIdList
    });
  };
  const onDeleteAllData = () => {
    setData([]);
    delAllChatInputGuide({
      appId
    });
  };

  const onSelectFile = async (files: File[]) => {
    const file = files?.[0];
    if (file) {
      const list = await readCsvRawText({ file });
      const textList = list.map((item) => item[0]?.trim() || '').filter(Boolean);
      createNewData(textList);
    }
  };

  const isLoading = isRequesting || isCreating;
  return (
    <MyBox
      // title={chatT('config_input_guide_lexicon_title')}
      // iconSrc="core/app/inputGuides"
      // isOpen={true}
      // onClose={onClose}
      isLoading={isLoading}
      bg={'#fff'}
      borderRadius={'md'}
      h={'300px'}
      overflowY={'hidden'}
      border={'1px solid #e0e0e0'}
      px={2}
      // w={'500px'}
    >
      <Flex gap={4} px={4} py={2} mb={4} alignItems={'center'} borderBottom={'1px solid #B7BABF'}>
        <Box flex={4}>配置词库</Box>
        <Box flex={6}>
          <MyInput
            leftIcon={<MyIcon name={'common/searchLight'} boxSize={4} color={'primary.500'} />}
            bg={'myGray.50'}
            w={'220px'}
            // h={9}
            size={'sm'}
            // placeholder={commonT('common.Search')}
            onChange={(e) => setSearchKey(e.target.value)}
          />
        </Box>

        <Button
          onClick={onOpenSelectFile}
          variant={'whiteBase'}
          size={'sm'}
          w={'100px'}
          color={'#000'}
          _hover={{
            bg: '#EDF1F4'
          }}
          // leftIcon={<MyIcon name={'common/importLight'} boxSize={4} />}
        >
          {commonT('common.Import')}
        </Button>
        <Box
          cursor={'pointer'}
          onClick={() => {
            fileDownload({
              text: csvTemplate,
              type: 'text/csv;charset=utf-8',
              filename: 'questionGuide_template.csv'
            });
          }}
        >
          <AIcon name="icon-xiazaimoban" color="#1296DB" fontSize="30px"></AIcon>
          {/* <QuestionTip ml={-2} label={chatT('csv_input_lexicon_tip')} /> */}
        </Box>
      </Flex>
      <Box px={8}>
        {/* button */}
        <Flex mb={1} justifyContent={'space-between'}>
          <Box flex={1} />
          <Flex gap={4}>
            <Button
              variant={'whiteBase'}
              display={selectedRows.length === 0 ? 'none' : 'flex'}
              size={'sm'}
              // leftIcon={<MyIcon name={'delete'} boxSize={4} />}
              onClick={() => {
                onDeleteData(selectedRows);
                setSelectedRows([]);
              }}
              w={'100px'}
              color={'#000'}
              _hover={{
                bg: '#EDF1F4'
              }}
            >
              {commonT('common.Delete')}
            </Button>
            <Button
              variant={'whiteBase'}
              display={selectedRows.length !== 0 ? 'none' : 'flex'}
              size={'sm'}
              w={'100px'}
              color={'#000'}
              _hover={{
                bg: '#EDF1F4'
              }}
              onClick={() =>
                openConfirmDel(
                  () => {
                    onDeleteAllData();
                    setSelectedRows([]);
                  },
                  undefined,
                  t('chat:delete_all_input_guide_confirm')
                )()
              }
            >
              {t('chat:Delete_all')}
            </Button>
            <Button
              display={selectedRows.length !== 0 ? 'none' : 'flex'}
              onClick={() => {
                setNewData('');
              }}
              size={'sm'}
              leftIcon={<MyIcon name={'common/addLight'} boxSize={4} />}
              w={'100px'}
              bg={'#000'}
              _hover={{
                bg: '#EDF1F4',
                color: '#000',
                border: '1px solid #000'
              }}
            >
              {commonT('common.Add')}
            </Button>
          </Flex>
        </Flex>
        {/* new data input */}
        {newData !== undefined && (
          <Box mt={5} ml={scrollDataList.length > 0 ? 7 : 0}>
            <MyInput
              autoFocus
              rightIcon={<MyIcon name={'save'} w={'14px'} cursor={'pointer'} />}
              placeholder={chatT('new_input_guide_lexicon')}
              onBlur={(e) => {
                createNewData([e.target.value.trim()]);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  createNewData([e.currentTarget.value.trim()]);
                }
              }}
            />
          </Box>
        )}
      </Box>
      <ScrollList
        px={8}
        flex={'1 0 0'}
        fontSize={'sm'}
        EmptyChildren={<EmptyTip text={chatT('chat_input_guide_lexicon_is_empty')} />}
      >
        {scrollDataList.map((data, index) => {
          const item = data.data;

          const selected = selectedRows.includes(item._id);
          const edited = editDataId === item._id;
          return (
            <Flex
              key={index}
              alignItems={'center'}
              h={10}
              mt={2}
              _hover={{
                '& .icon-list': {
                  display: 'flex'
                }
              }}
            >
              <Checkbox
                mr={2}
                isChecked={selected}
                size={'lg'}
                icon={<MyIcon name={'common/check'} w={'12px'} />}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedRows([...selectedRows, item._id]);
                  } else {
                    setSelectedRows(selectedRows.filter((id) => id !== item._id));
                  }
                }}
              />
              {edited ? (
                <Box h={'full'} flex={'1 0 0'}>
                  <MyInput
                    autoFocus
                    defaultValue={item.text}
                    rightIcon={<MyIcon name={'save'} boxSize={4} cursor={'pointer'} />}
                    onBlur={(e) => {
                      onUpdateData({
                        text: e.target.value.trim(),
                        dataId: item._id
                      });
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        onUpdateData({
                          text: e.currentTarget.value.trim(),
                          dataId: item._id
                        });
                      }
                    }}
                  />
                </Box>
              ) : (
                <>
                  <Flex
                    h={'34px'}
                    w={0}
                    flex={'1 0 0'}
                    rounded={'md'}
                    px={4}
                    mr={5}
                    bg={'myGray.50'}
                    alignItems={'center'}
                    border={'base'}
                    _hover={{ borderColor: 'primary.300' }}
                  >
                    <Box className="textEllipsis" w={0} flex={'1 0 0'}>
                      <HighlightText rawText={item.text} matchText={searchKey} />
                    </Box>
                  </Flex>
                  {selectedRows.length === 0 && (
                    <Flex
                      gap={2}
                      className="icon-list"
                      // display={'none'}
                    >
                      <AIcon
                        name="icon-bianji"
                        fontSize="25px"
                        color={'myGray.600'}
                        cursor={'pointer'}
                        onClick={() => setEditDataId(item._id)}
                      ></AIcon>
                      <AIcon
                        name="icon-shanchu1"
                        fontSize="23px"
                        color={'myGray.600'}
                        cursor={'pointer'}
                        _hover={{ color: 'red.600' }}
                        onClick={() => onDeleteData([item._id])}
                      ></AIcon>
                      {/* <MyIcon
                        name={'edit'}
                        boxSize={4}
                        mr={2}
                        color={'myGray.600'}
                        cursor={'pointer'}
                        onClick={() => setEditDataId(item._id)}
                      />
                      <MyIcon
                        name={'delete'}
                        boxSize={4}
                        color={'myGray.600'}
                        cursor={'pointer'}
                        _hover={{ color: 'red.600' }}
                        onClick={() => onDeleteData([item._id])}
                      /> */}
                    </Flex>
                  )}
                </>
              )}
            </Flex>
          );
        })}
      </ScrollList>

      <DelConfirmModal />
      <File onSelect={onSelectFile} />
    </MyBox>
  );
};
