import React, { useEffect, useMemo, useRef } from 'react';
import {
  Box,
  Button,
  Flex,
  useTheme,
  IconButton,
  useDisclosure,
  ModalBody,
  ModalFooter,
  Input,
  InputGroup,
  InputLeftElement,
  HStack
} from '@chakra-ui/react';
import { useSystem } from '@fastgpt/web/hooks/useSystem';
import { useEditTitle } from '@/web/common/hooks/useEditTitle';
import { useRouter } from 'next/router';
import Avatar from '@fastgpt/web/components/common/Avatar';
import MyTooltip from '@fastgpt/web/components/common/MyTooltip';
import MyIcon from '@fastgpt/web/components/common/Icon';
import { useTranslation } from 'next-i18next';
import { useConfirm } from '@fastgpt/web/hooks/useConfirm';
import { useUserStore } from '@/web/support/user/useUserStore';
import MyMenu from '@fastgpt/web/components/common/MyMenu';
import { useContextSelector } from 'use-context-selector';
import { ChatContext } from '@/web/core/chat/context/chatContext';
import MyBox from '@fastgpt/web/components/common/MyBox';
import { formatTimeToChatTime } from '@fastgpt/global/common/string/time';
import AIcon from '@/components/AIcon/AIcon';
import { AppTypeEnum } from '@fastgpt/global/core/app/constants';
import MyModal from '@fastgpt/web/components/common/MyModal';
import style from '../index.module.scss';
import { useBoolean } from 'ahooks';
import { bg } from 'date-fns/locale';

type HistoryItemType = {
  id: string;
  title: string;
  customTitle?: string;
  top?: boolean;
  updateTime: Date;
};

const ChatHistorySlider = ({
  appId,
  appName,
  appAvatar,
  confirmClearText,
  onDelHistory,
  onClearHistory,
  onSetHistoryTop,
  onSetCustomTitle,
  appType,
  appColor,
  setSearchKey
}: {
  appId?: string;
  appName: string;
  appAvatar: string;
  confirmClearText: string;
  onDelHistory: (e: { chatId: string }) => void;
  onClearHistory: () => void;
  onSetHistoryTop?: (e: { chatId: string; top: boolean }) => void;
  onSetCustomTitle?: (e: { chatId: string; title: string }) => void;
  appType: any;
  appColor?: string;
  setSearchKey: (key: string) => void;
}) => {
  const theme = useTheme();
  const router = useRouter();
  const isUserChatPage = router.pathname === '/chat';
  const { isOpen: isClearOpen, onOpen: onClearOpen, onClose: onClearClose } = useDisclosure();
  const { t } = useTranslation();

  const { isPc } = useSystem();
  const { userInfo } = useUserStore();

  const {
    onChangeChatId,
    chatId: activeChatId,
    isLoading,
    ScrollData,
    histories
  } = useContextSelector(ChatContext, (v) => v);
  function formatDate(date: any) {
    if (typeof date === 'string') {
      date = new Date(date);
    }
    const year = date.getFullYear(); // 获取年份
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}`;
  }
  const concatHistory = useMemo(() => {
    const formatHistories: HistoryItemType[] = histories.map((item) => {
      return {
        id: item.chatId,
        title: item.title,
        customTitle: item.customTitle,
        top: item.top,
        updateTime: item.updateTime
      };
    });
    const newChat: HistoryItemType = {
      id: activeChatId,
      title: t('common:core.chat.New Chat'),
      updateTime: new Date()
    };
    const activeChat = histories.find((item) => item.chatId === activeChatId);

    return !activeChat ? [newChat].concat(formatHistories) : formatHistories;
  }, [activeChatId, histories, t]);
  // custom title edit
  const { onOpenModal, EditModal: EditTitleModal } = useEditTitle({
    title: t('common:core.chat.Custom History Title'),
    placeholder: t('common:core.chat.Custom History Title Description')
  });
  const { openConfirm, ConfirmModal } = useConfirm({
    content: confirmClearText
  });

  const canRouteToDetail = useMemo(
    () => appId && userInfo?.team.permission.hasWritePer,
    [appId, userInfo?.team.permission.hasWritePer]
  );

  const [isDisplayInput, { setTrue: setIsDisplayInputTrue, setFalse: closeDisplayInputFalse }] =
    useBoolean(false);
  const inputgroup = useRef<any>(null);
  const inputRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutSide = (e: MouseEvent) => {
      //@ts-ignore
      if (inputgroup.current && !inputgroup.current.contains(e.target as Node)) {
        closeDisplayInputFalse();
      }
    };
    document.addEventListener('click', handleClickOutSide);
    return () => {
      document.removeEventListener('click', handleClickOutSide);
    };
  }, [inputgroup.current]);
  return (
    <MyBox
      isLoading={isLoading}
      display={'flex'}
      flexDirection={'column'}
      borderRadius={'10px'}
      w={'100%'}
      h={'100%'}
      bg={'linear-gradient(to bottom, #efeff9 0%, #fff 100%)'}
      borderRight={['', theme.borders.base]}
      whiteSpace={'nowrap'}
    >
      {isPc && (
        <MyTooltip
          label={canRouteToDetail ? t('app:app_detail') : ''}
          placement="top"
          offset={[0, 0]}
        >
          <Flex
            borderRadius={'md'}
            m={4}
            h={'50px'}
            flex={1}
            border={'1px solid #e2e3ea'}
            cursor={canRouteToDetail ? 'pointer' : 'default'}
            fontSize={'sm'}
            onClick={() =>
              canRouteToDetail &&
              router.push({
                pathname: '/app/detail',
                query: { appId, appType: appType }
              })
            }
          >
            {/* <Avatar src={appAvatar} borderRadius={'md'} /> */}
            <AIcon
              fontSize="25px"
              {...(appType === AppTypeEnum.simple
                ? {
                    name: 'icon-biaoqian1'
                  }
                : appType.type === AppTypeEnum.workflow
                  ? {
                      name: 'icon-biaoqian2'
                    }
                  : {
                      name: 'icon-guanyuchajian'
                    })}
              color={appColor}
            />
            <Box
              flex={'1 0 0'}
              w={0}
              pb={2}
              ml={4}
              alignContent={'center'}
              fontWeight={'bold'}
              className={'textEllipsis'}
            >
              {appName}
            </Box>
          </Flex>
        </MyTooltip>
      )}

      {/* menu */}
      <Flex
        w={'100%'}
        px={[2, 5]}
        h={'40px'}
        my={5}
        mt={0}
        justify={['space-between', '']}
        alignItems={'center'}
      >
        {!isPc && (
          <Flex height={'100%'} align={'center'} justify={'center'}>
            <MyIcon ml={2} name="core/chat/sideLine" />
            <Box ml={2} fontWeight={'bold'}>
              {t('common:core.chat.History')}
            </Box>
          </Flex>
        )}
        <Flex w={'100%'}>
          {!isDisplayInput && (
            <Button
              variant={'whitePrimary'}
              // maxW={'150px'}
              // flex={['0 0 auto', 1]}
              h={'40px'}
              bg={'none'}
              w={'cacl(100% - 40px)'}
              flex={1}
              borderColor={'#aaaaaa'}
              px={3}
              // color={'primary.600'}
              borderRadius={'md'}
              leftIcon={<AIcon name="icon-duihua" color="#d7000f" fontSize="22px"></AIcon>}
              overflow={'hidden'}
              _hover={{
                borderColor: '#d7000f',
                bg: '#f2f2f2'
              }}
              onClick={() => onChangeChatId()}
            >
              {t('common:core.chat.New Chat')}+
            </Button>
          )}

          <InputGroup
            ref={inputgroup}
            {...(!isDisplayInput
              ? {
                  width: '40px',
                  height: '40px'
                }
              : {
                  height: '40px',
                  width: '100%'
                })}
            onClick={() => {
              setIsDisplayInputTrue();
            }}
            cursor={'pointer'}
            borderRadius={'5px'}
            _hover={{
              bg: '#f6ecf1'
            }}
          >
            <InputLeftElement>
              <AIcon fontSize="25px" name="icon-sousuo"></AIcon>
            </InputLeftElement>
            {isDisplayInput && (
              <Input
                h={'100%'}
                _focus={{ bg: '#f6ecf1', borderColor: 'primary.600', boxShadow: 'none' }}
                _hover={{
                  bg: '#f6ecf1',
                  borderColor: 'primary.600'
                }}
                onChange={(e) => {
                  setSearchKey(e.target.value);
                }}
              ></Input>
            )}
          </InputGroup>
        </Flex>
      </Flex>

      <ScrollData flex={'1 0 0'} h={0} px={[2, 5]} overflow={'overlay'} className={style.scroll}>
        {/* chat history */}
        <>
          {concatHistory.map((item, i) => (
            <Flex
              position={'relative'}
              key={item.id}
              // alignItems={'center'}
              px={2}
              py={2}
              h={'60px'}
              cursor={'pointer'}
              userSelect={'none'}
              borderRadius={'md'}
              border={'1px solid #e2e3ea'}
              fontSize={'sm'}
              _hover={{
                bg: '#edf1f4',
                boxShadow: '2px 2px 3px rgb(0,0,0,0.2)'

                // '& .more': {
                //   display: 'block'
                // },
                // '& .time': {
                //   display: isPc ? 'none' : 'block'
                // }
              }}
              // bg={item.top ? '#E6F6F6 !important' : ''}
              {...(item.id === activeChatId
                ? {
                    backgroundColor: '#edf1f4 !important',
                    // color: 'primary.600'
                    boxShadow: '2px 2px 3px rgb(0,0,0,0.2)'
                  }
                : {
                    onClick: () => {
                      onChangeChatId(item.id);
                    }
                  })}
              {...(i !== concatHistory.length - 1 && {
                mb: '8px'
              })}
            >
              {/* <MyIcon
                name={item.id === activeChatId ? 'core/chat/chatFill' : 'core/chat/chatLight'}
                w={'16px'}
              /> */}
              <Flex direction={'column'} flex={1} maxW={'calc(100% - 8px)'}>
                <Box flex={'1 0 0'} textAlign={'center'} fontSize={'13px'} className="textEllipsis">
                  {item.customTitle || item.title}
                </Box>
                <Box
                  className="time"
                  display={'block'}
                  fontWeight={'400'}
                  fontSize={'mini'}
                  pl={2}
                  color={'myGray.500'}
                >
                  {/* {t(formatTimeToChatTime(item.updateTime) as any).replace('#', ':')} */}
                  {formatDate(item.updateTime)}
                </Box>
              </Flex>

              {!!item.id && (
                <AIcon
                  name={'icon-quxiao1'}
                  fontSize="10px"
                  mt={-1}
                  mr={-1}
                  onClick={() => {
                    onDelHistory({ chatId: item.id });
                    if (item.id === activeChatId) {
                      onChangeChatId();
                    }
                    return;
                  }}
                  color={'#b0b0b0'}
                ></AIcon>
                // <Flex gap={2} alignItems={'center'}>
                //   <Box className="more" display={['block', 'block']}>
                //     <MyMenu
                //       Button={
                //         <IconButton
                //           size={'xs'}
                //           variant={'whiteBase'}
                //           icon={<MyIcon name={'more'} w={'14px'} p={1} />}
                //           aria-label={''}
                //         />
                //       }
                //       menuList={[
                //         {
                //           children: [
                //             ...(onSetHistoryTop
                //               ? [
                //                   {
                //                     label: item.top
                //                       ? t('common:core.chat.Unpin')
                //                       : t('common:core.chat.Pin'),
                //                     icon: 'core/chat/setTopLight',
                //                     onClick: () => {
                //                       onSetHistoryTop({
                //                         chatId: item.id,
                //                         top: !item.top
                //                       });
                //                     }
                //                   }
                //                 ]
                //               : []),
                //             ...(onSetCustomTitle
                //               ? [
                //                   {
                //                     label: t('common:common.Custom Title'),
                //                     icon: 'common/customTitleLight',
                //                     onClick: () => {
                //                       onOpenModal({
                //                         defaultVal: item.customTitle || item.title,
                //                         onSuccess: (e) =>
                //                           onSetCustomTitle({
                //                             chatId: item.id,
                //                             title: e
                //                           })
                //                       });
                //                     }
                //                   }
                //                 ]
                //               : []),
                //             {
                //               label: t('common:common.Delete'),
                //               icon: 'delete',
                //               onClick: () => {
                //                 onDelHistory({ chatId: item.id });
                //                 if (item.id === activeChatId) {
                //                   onChangeChatId();
                //                 }
                //               },
                //               type: 'danger'
                //             }
                //           ]
                //         }
                //       ]}
                //     />
                //   </Box>
                // </Flex>
              )}
            </Flex>
          ))}
        </>
      </ScrollData>
      {/* Clear */}
      {isPc && histories.length > 0 && (
        <Flex w={'90%'} justifyContent={'center'} pb={3}>
          <Box
            textAlign={'center'}
            py={2}
            cursor={'pointer'}
            _hover={{
              bg: '#fbe6e8'
            }}
            w={'80%'}
            onClick={() => {
              // openConfirm(() => {
              //   onClearHistory();
              // })();
              onClearOpen();
            }}
            fontSize={'13px'}
            borderRadius={'lg'}
            border={'1px solid #e2e3ea'}
          >
            {t('common:common.clearAllChat')}
          </Box>
        </Flex>
      )}
      {/* exec */}
      {!isPc && isUserChatPage && (
        <Flex
          mt={2}
          borderTop={theme.borders.base}
          alignItems={'center'}
          cursor={'pointer'}
          p={3}
          onClick={() => router.push('/applicationCenter')}
        >
          <IconButton
            mr={3}
            icon={<MyIcon name={'common/backFill'} w={'18px'} color={'primary.500'} />}
            bg={'white'}
            boxShadow={'1px 1px 9px rgba(0,0,0,0.15)'}
            size={'smSquare'}
            borderRadius={'50%'}
            aria-label={''}
          />
          {t('common:core.chat.Exit Chat')}
        </Flex>
      )}
      <EditTitleModal />
      <ConfirmModal />
      {isClearOpen && (
        <MyModal
          onClose={onClearClose}
          titleBgc="#f5f5f5"
          w={'400px'}
          title={t('common:common.confirm.Common Tip')}
        >
          <ModalBody pt={6} minH={'200px'}>
            {confirmClearText}
          </ModalBody>
          <ModalFooter pt={3} borderTop={'1px solid #e2e3ea'}>
            <Button
              mr={3}
              size={'sm'}
              bg={'#fff'}
              color={'#999999'}
              w={'80px'}
              border={'1px solid #e2e3ea'}
              _hover={{
                bg: '#fbe6e8',
                color: '#d70010',
                borderColor: '#d70010'
              }}
              onClick={() => {
                onClearClose();
              }}
            >
              {t('common:common.Cancel')}
            </Button>
            <Button
              size={'sm'}
              w={'80px'}
              onClick={() => {
                onClearHistory();
                onClearClose();
              }}
            >
              {t('common:common.Confirm')}
            </Button>
          </ModalFooter>
        </MyModal>
      )}
    </MyBox>
  );
};

export default ChatHistorySlider;
