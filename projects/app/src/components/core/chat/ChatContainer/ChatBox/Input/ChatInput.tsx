import { useSpeech } from '@/web/common/hooks/useSpeech';
import { useSystemStore } from '@/web/common/system/useSystemStore';
import { Box, Button, Flex, Image, Spinner, Textarea } from '@chakra-ui/react';
import React, { useRef, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'next-i18next';
import MyTooltip from '@fastgpt/web/components/common/MyTooltip';
import MyIcon from '@fastgpt/web/components/common/Icon';
import { useRequest2 } from '@fastgpt/web/hooks/useRequest';
import { ChatBoxInputFormType, ChatBoxInputType, SendPromptFnType } from '../type';
import { textareaMinH } from '../constants';
import { useFieldArray, UseFormReturn } from 'react-hook-form';
import { ChatBoxContext } from '../Provider';
import dynamic from 'next/dynamic';
import { useContextSelector } from 'use-context-selector';
import { useSystem } from '@fastgpt/web/hooks/useSystem';
import { documentFileType } from '@fastgpt/global/common/file/constants';
import FilePreview from '../../components/FilePreview';
import { useFileUpload } from '../hooks/useFileUpload';
import ComplianceTip from '@/components/common/ComplianceTip/index';
import { useToast } from '@fastgpt/web/hooks/useToast';
import AIcon from '@/components/AIcon/AIcon';

const InputGuideBox = dynamic(() => import('./InputGuideBox'));

const fileTypeFilter = (file: File) => {
  return (
    file.type.includes('image') ||
    documentFileType.split(',').some((type) => file.name.endsWith(type.trim()))
  );
};

const ChatInput = ({
  onSendMessage,
  onStop,
  TextareaDom,
  resetInputVal,
  chatForm,
  appId
}: {
  onSendMessage: SendPromptFnType;
  onStop: () => void;
  TextareaDom: React.MutableRefObject<HTMLTextAreaElement | null>;
  resetInputVal: (val: ChatBoxInputType) => void;
  chatForm: UseFormReturn<ChatBoxInputFormType>;
  appId: string;
}) => {
  const { isPc } = useSystem();
  const { t } = useTranslation();
  const { toast } = useToast();

  const { setValue, watch, control } = chatForm;
  const inputValue = watch('input');

  const {
    chatId,
    isChatting,
    whisperConfig,
    autoTTSResponse,
    chatInputGuide,
    outLinkAuthData,
    fileSelectConfig
  } = useContextSelector(ChatBoxContext, (v) => v);

  const fileCtrl = useFieldArray({
    control,
    name: 'files'
  });
  const {
    File,
    onOpenSelectFile,
    fileList,
    onSelectFile,
    uploadFiles,
    selectFileIcon,
    selectFileLabel,
    showSelectFile,
    showSelectImg,
    removeFiles,
    replaceFiles,
    hasFileUploading
  } = useFileUpload({
    outLinkAuthData,
    chatId: chatId || '',
    fileSelectConfig,
    fileCtrl
  });
  const havInput = !!inputValue || fileList.length > 0;
  const canSendMessage = havInput && !hasFileUploading;

  // Upload files
  useRequest2(uploadFiles, {
    manual: false,
    errorToast: t('common:upload_file_error'),
    refreshDeps: [fileList, outLinkAuthData, chatId]
  });

  /* on send */
  const handleSend = useCallback(
    async (val?: string) => {
      if (!canSendMessage) return;
      const textareaValue = val || TextareaDom.current?.value || '';

      onSendMessage({
        text: textareaValue.trim(),
        files: fileList
      });
      replaceFiles([]);
    },
    [TextareaDom, canSendMessage, fileList, onSendMessage, replaceFiles]
  );

  /* whisper init */
  const { whisperModel } = useSystemStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const {
    isSpeaking,
    isTransCription,
    stopSpeak,
    startSpeak,
    speakingTimeString,
    renderAudioGraph,
    stream
  } = useSpeech({ appId, ...outLinkAuthData });
  const onWhisperRecord = useCallback(() => {
    const finishWhisperTranscription = (text: string) => {
      if (!text) return;
      if (whisperConfig?.autoSend) {
        onSendMessage({
          text,
          files: fileList,
          autoTTSResponse
        });
        replaceFiles([]);
      } else {
        resetInputVal({ text });
      }
    };
    if (isSpeaking) {
      return stopSpeak();
    }
    startSpeak(finishWhisperTranscription);
  }, [
    autoTTSResponse,
    fileList,
    isSpeaking,
    onSendMessage,
    replaceFiles,
    resetInputVal,
    startSpeak,
    stopSpeak,
    whisperConfig?.autoSend
  ]);
  useEffect(() => {
    if (!stream) {
      return;
    }
    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 4096;
    analyser.smoothingTimeConstant = 1;
    const source = audioContext.createMediaStreamSource(stream);
    source.connect(analyser);
    const renderCurve = () => {
      if (!canvasRef.current) return;
      renderAudioGraph(analyser, canvasRef.current);
      window.requestAnimationFrame(renderCurve);
    };
    renderCurve();
  }, [renderAudioGraph, stream]);

  const RenderTranslateLoading = useMemo(
    () => (
      <Flex
        position={'absolute'}
        top={0}
        bottom={0}
        left={0}
        right={0}
        zIndex={10}
        pl={5}
        alignItems={'center'}
        bg={'white'}
        color={'primary.500'}
        visibility={isSpeaking && isTransCription ? 'visible' : 'hidden'}
      >
        <Spinner size={'sm'} mr={4} />
        {t('common:core.chat.Converting to text')}
      </Flex>
    ),
    [isSpeaking, isTransCription, t]
  );

  const RenderTextarea = useMemo(
    () => (
      <Flex alignItems={'center'} p={0} mt={fileList.length > 0 ? 1 : 0} pl={[2, 2]}>
        {/* file selector */}
        {(showSelectFile || showSelectImg) && (
          <Flex
            h={'68px'}
            // alignItems={'center'}
            justifyContent={'center'}
            cursor={'pointer'}
            transform={'translateY(1px)'}
            onClick={() => {
              if (isSpeaking) return;
              onOpenSelectFile();
            }}
          >
            <MyTooltip label={selectFileLabel}>
              <MyIcon name={selectFileIcon as any} w={'18px'} color={'myGray.600'} />
            </MyTooltip>
            <File onSelect={(files) => onSelectFile({ files })} />
          </Flex>
        )}

        {/* input area */}
        <Textarea
          ref={TextareaDom}
          py={0}
          px={'10px'}
          //todo
          // pl={2}
          // pr={['30px', '48px']}
          border={'none'}
          _focusVisible={{
            border: 'none'
          }}
          placeholder={
            isSpeaking
              ? t('common:core.chat.Speaking')
              : isPc
                ? t('common:core.chat.Type a message')
                : t('chat:input_placeholder_phone')
          }
          resize={'none'}
          rows={3}
          // height={'22px'}
          minH={'68px'}
          // lineHeight={'22px'}
          maxHeight={'68px'}
          maxLength={-1}
          overflowY={'auto'}
          whiteSpace={'pre-wrap'}
          wordBreak={'break-all'}
          boxShadow={'none !important'}
          color={'myGray.900'}
          isDisabled={isSpeaking}
          value={inputValue}
          fontSize={['md', 'sm']}
          onChange={(e) => {
            const textarea = e.target;
            textarea.style.height = textareaMinH;
            textarea.style.height = `${textarea.scrollHeight}px`;
            setValue('input', textarea.value);
          }}
          onKeyDown={(e) => {
            // enter send.(pc or iframe && enter and unPress shift)
            const isEnter = e.keyCode === 13;
            if (isEnter && TextareaDom.current && (e.ctrlKey || e.altKey)) {
              // Add a new line
              const index = TextareaDom.current.selectionStart;
              const val = TextareaDom.current.value;
              TextareaDom.current.value = `${val.slice(0, index)}\n${val.slice(index)}`;
              TextareaDom.current.selectionStart = index + 1;
              TextareaDom.current.selectionEnd = index + 1;

              TextareaDom.current.style.height = textareaMinH;
              TextareaDom.current.style.height = `${TextareaDom.current.scrollHeight}px`;

              return;
            }

            // 全选内容
            // @ts-ignore
            e.key === 'a' && e.ctrlKey && e.target?.select();

            if ((isPc || window !== parent) && e.keyCode === 13 && !e.shiftKey) {
              handleSend();
              e.preventDefault();
            }
          }}
          onPaste={(e) => {
            const clipboardData = e.clipboardData;
            if (clipboardData && (showSelectFile || showSelectImg)) {
              const items = clipboardData.items;
              const files = Array.from(items)
                .map((item) => (item.kind === 'file' ? item.getAsFile() : undefined))
                .filter((file) => {
                  return file && fileTypeFilter(file);
                }) as File[];
              onSelectFile({ files });

              if (files.length > 0) {
                e.preventDefault();
                e.stopPropagation();
              }
            }
          }}
        />
        <Flex
          alignItems={'center'}
          // position={'absolute'}
          right={[2, 4]}
          bottom={['10px', '12px']}
        >
          {/* voice-input */}
          {whisperConfig.open && !inputValue && !isChatting && !!whisperModel && (
            <>
              <canvas
                ref={canvasRef}
                style={{
                  height: '30px',
                  width: isSpeaking && !isTransCription ? '100px' : 0,
                  background: 'white',
                  zIndex: 0,
                  display: 'none'
                }}
              />
              {/* {isSpeaking && (
                <MyTooltip label={t('common:core.chat.Cancel Speak')}>
                  <Flex
                    mr={2}
                    alignItems={'center'}
                    justifyContent={'center'}
                    flexShrink={0}
                    h={['26px', '32px']}
                    w={['26px', '32px']}
                    borderRadius={'md'}
                    cursor={'pointer'}
                    _hover={{ bg: '#F5F5F8' }}
                    onClick={() => stopSpeak(true)}
                  >
                    <MyIcon
                      name={'core/chat/cancelSpeak'}
                      width={['20px', '22px']}
                      height={['20px', '22px']}
                    />
                  </Flex>
                </MyTooltip>
              )} */}
              <MyTooltip
                label={
                  isSpeaking ? t('common:core.chat.Finish Speak') : t('common:core.chat.Record')
                }
              >
                <Flex
                  mr={2}
                  alignItems={'center'}
                  justifyContent={'center'}
                  flexShrink={0}
                  // h={['26px', '32px']}
                  h={'100%'}
                  // w={['26px', '32px']}
                  w={'40px'}
                  borderRadius={'md'}
                  cursor={'pointer'}
                  // _hover={{ bg: '#F5F5F8' }}
                  onClick={onWhisperRecord}
                >
                  {isSpeaking ? (
                    // <MyIcon
                    //   // name={isSpeaking ? 'core/chat/finishSpeak' : 'core/chat/recordFill'}
                    //   name={'core/chat/finishSpeak'}
                    //   width={['20px', '22px']}
                    //   height={['20px', '22px']}
                    //   color={isSpeaking ? 'primary.500' : 'myGray.600'}
                    // />
                    <Image src="/imgs/images/picture/load.png" alt="" w={'30px'}></Image>
                  ) : (
                    <AIcon
                      name="icon-yuyinmaikefeng-tianchong"
                      color="primary.500"
                      fontSize="38px"
                      w="50px"
                      mr={'8px'}
                    ></AIcon>
                  )}
                </Flex>
              </MyTooltip>
            </>
          )}
          {/* send and stop icon */}
          {isSpeaking ? (
            <Box color={'#5A646E'} w={'36px'} textAlign={'right'} whiteSpace={'nowrap'}>
              {/* {speakingTimeString} */}
            </Box>
          ) : (
            <Flex w={'100px'} justifyContent={'center'} mr={2} h={'60px'} alignItems={'center'}>
              <Flex
                alignItems={'center'}
                justifyContent={'center'}
                flexShrink={0}
                // h={['28px', '32px']}
                // w={['28px', '32px']}
                h={'40px'}
                // w={'100px'}
                borderRadius={'md'}
                bg={
                  isSpeaking || isChatting
                    ? ''
                    : !havInput || hasFileUploading
                      ? '#E5E5E5'
                      : 'primary.500'
                }
                // lineHeight={1}
                onClick={() => {
                  if (isChatting) {
                    return onStop();
                  }
                  return handleSend();
                }}
              >
                {isChatting ? (
                  <MyIcon
                    animation={'zoomStopIcon 0.4s infinite alternate'}
                    width={['22px', '25px']}
                    height={['22px', '25px']}
                    cursor={'pointer'}
                    name={'stop'}
                    color={'gray.500'}
                  />
                ) : (
                  <MyTooltip label={t('common:core.chat.Send Message')}>
                    {/* <MyIcon
                    name={'core/chat/sendFill'}
                    width={['18px', '20px']}
                    height={['18px', '20px']}
                    color={'white'}
                  /> */}
                    <Button
                      width={'100px'}
                      h={'40px'}
                      cursor={havInput ? 'pointer' : 'not-allowed'}
                      leftIcon={<Image src="/imgs/images/picture/flight.png" alt=""></Image>}
                      bgColor={'primary.500'}
                    >
                      发送
                    </Button>
                  </MyTooltip>
                )}
              </Flex>
            </Flex>
          )}
        </Flex>
      </Flex>
    ),
    [
      File,
      TextareaDom,
      fileList,
      handleSend,
      hasFileUploading,
      havInput,
      inputValue,
      isChatting,
      isPc,
      isSpeaking,
      isTransCription,
      onOpenSelectFile,
      onSelectFile,
      onStop,
      onWhisperRecord,
      selectFileIcon,
      selectFileLabel,
      setValue,
      showSelectFile,
      showSelectImg,
      speakingTimeString,
      stopSpeak,
      t,
      whisperConfig.open,
      whisperModel
    ]
  );

  return (
    <Box
      m={['0 auto', '10px auto']}
      w={'100%'}
      maxW={['auto', '100%']}
      px={[0, 5]}
      position={'relative'}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();

        if (!(showSelectFile || showSelectImg)) return;
        const files = Array.from(e.dataTransfer.files);

        const droppedFiles = files.filter((file) => fileTypeFilter(file));
        if (droppedFiles.length > 0) {
          onSelectFile({ files: droppedFiles });
        }

        const invalidFileName = files
          .filter((file) => !fileTypeFilter(file))
          .map((file) => file.name)
          .join(', ');
        if (invalidFileName) {
          toast({
            status: 'warning',
            title: t('chat:unsupported_file_type'),
            description: invalidFileName
          });
        }
      }}
    >
      <Box
        pt={fileList.length > 0 ? '0' : ['14px', '9px']}
        pb={['14px', '9px']}
        // position={'relative'}
        // boxShadow={isSpeaking ? `0 0 10px rgba(54,111,255,0.4)` : `0 0 10px rgba(0,0,0,0.2)`}
        borderRadius={['none', 'md']}
        bg={'white'}
        overflow={'hidden'}
        {...(isPc
          ? {
              border: '2px solid',
              borderColor: 'primary.500'
            }
          : {
              borderTop: '1px solid',
              borderColor: 'primary.500'
            })}
      >
        {/* Chat input guide box */}
        {chatInputGuide.open && (
          <InputGuideBox
            appId={appId}
            text={inputValue}
            onSelect={(e) => {
              setValue('input', e);
            }}
            onSend={(e) => {
              handleSend(e);
            }}
          />
        )}

        {/* translate loading */}
        {RenderTranslateLoading}

        {/* file preview */}
        <Box px={[1, 3]}>
          <FilePreview fileList={fileList} removeFiles={removeFiles} />
        </Box>

        {RenderTextarea}
      </Box>
      <ComplianceTip type={'chat'} />
    </Box>
  );
};

export default React.memo(ChatInput);
