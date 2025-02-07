import {
  Box,
  Button,
  Divider,
  Flex,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure
} from '@chakra-ui/react';
import { useMemoizedFn } from 'ahooks';
import { useTranslation } from 'next-i18next';
import React, { useRef, useState, useEffect } from 'react';

const useDeleteModal = (props?: {
  title?: string;
  content?: string | React.ReactNode;
  showCancel?: boolean;
  hideFooter?: boolean;
}) => {
  const { t } = useTranslation();

  const { title = '警告', content, showCancel = true, hideFooter = false } = props || {};
  const [customContent, setCustomContent] = useState(content);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const confirmCallback = useRef<Function>();
  const cancelCallback = useRef<any>();

  const openConfirm = useMemoizedFn(
    (confirm?: Function, cancel?: any, customContent?: string | React.ReactNode) => {
      confirmCallback.current = confirm;
      cancelCallback.current = cancel;
      customContent && setCustomContent(customContent);

      return onOpen;
    }
  );

  const ConfirmModal = useMemoizedFn(
    ({
      closeText = t('common:common.Cancel'),
      confirmText = t('common:common.Confirm'),
      countDown = 0,
      isLoading
    }: {
      closeText?: string;
      confirmText?: string;
      isLoading?: boolean;
      countDown?: number;
    }) => {
      const timer = useRef<any>();
      const [countDownTimes, setCountDownTimes] = useState(countDown);
      const [requesting, setRequesting] = useState(false);

      useEffect(() => {
        timer.current = setInterval(() => {
          setCountDownTimes((val) => {
            if (val <= 0) {
              clearInterval(timer.current);
            }
            return val - 1;
          });
        }, 1000);
      }, []);
      return (
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalContent w={'300px'} h={'150px'}>
            <ModalHeader
              h={'30px'}
              py={1}
              display={'flex'}
              alignItems={'center'}
              roundedTop={'lg'}
              fontSize={'sm'}
              bgColor={'rgb(226, 227, 234)'}
            >
              <Flex display={'flex'} alignItems={'center'}>
                <Box mr={'5px'}></Box>
                <Box>{title}</Box>
              </Flex>
              <ModalCloseButton _hover={{ bgColor: 'none' }} mt={'-0.25rem'} size={'sm'} />
            </ModalHeader>

            <ModalBody fontSize={'sm'}>{customContent}</ModalBody>

            {!hideFooter && (
              <>
                <Divider bgColor={'rgb(226, 227, 234)'} h={'1px'} />
                <ModalFooter>
                  {showCancel && (
                    <Button
                      h={'30px'}
                      bgColor={'#fff'}
                      color={'#000'}
                      border={'1px solid rgb(226, 227, 234)'}
                      _hover={{ bgColor: 'rgb(237, 241, 244)' }}
                      px={5}
                      onClick={() => {
                        onClose();
                        typeof cancelCallback.current === 'function' && cancelCallback.current();
                      }}
                    >
                      {closeText}
                    </Button>
                  )}

                  <Button
                    bgColor={'#000'}
                    color={'#fff'}
                    size={'sm'}
                    ml={3}
                    px={5}
                    _hover={{ bgColor: 'rgb(237, 241, 244)', color: '#000' }}
                    border={'1px solid #000'}
                    isLoading={isLoading || requesting}
                    onClick={async () => {
                      setRequesting(true);
                      try {
                        typeof confirmCallback.current === 'function' &&
                          (await confirmCallback.current());
                      } catch (error) {
                      } finally {
                        setRequesting(false);
                      }
                    }}
                  >
                    {countDownTimes > 0 ? `${countDownTimes}s` : confirmText}
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      );
    }
  );

  return {
    openConfirm,
    onClose,
    ConfirmModal
  };
};

export default useDeleteModal;
