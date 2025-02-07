import {
  Box,
  BoxProps,
  Button,
  Divider,
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
import { useCallback, useMemo, useRef, useState } from 'react';

function useCreateModal({
  title,
  content
}: {
  title?: string | React.ReactNode;
  content?: string | React.ReactNode;
}) {
  const [customTitle, setCustomTitle] = useState(title);
  const [customContent, setCustomContent] = useState(content);
  const [style, setStyle] = useState<BoxProps>({});

  const { isOpen, onOpen, onClose } = useDisclosure();

  const confirmCallback = useRef<Function>();
  const cancelCallback = useRef<any>();

  const openModal = useMemoizedFn(
    ({
      confirm,
      cancel,
      customTitle,
      customContent,
      style
    }: {
      confirm?: Function;
      cancel?: Function;
      customTitle?: string | React.ReactNode;
      customContent?: string | React.ReactNode;
      style?: BoxProps;
    }) => {
      confirmCallback.current = confirm;
      cancelCallback.current = cancel;
      customTitle && setCustomTitle(customTitle);
      customContent && setCustomContent(customContent);
      style && setStyle(style);
      return onOpen;
    }
  );

  const CreateModal = useCallback(
    ({ isLoading, ...props }: BoxProps & { isLoading?: boolean }) => {
      const [requesting, setRequesting] = useState(false);
      return (
        <Modal isOpen={isOpen} onClose={onClose} isCentered>
          <ModalOverlay />
          <ModalContent
            minW={['300px', '600px']}
            maxW={['28rem', '1000px']}
            h={'360px'}
            {...props}
            {...style}
          >
            {!!customTitle && (
              <ModalHeader
                py={2}
                display={'flex'}
                alignItems={'center'}
                roundedTop={'lg'}
                fontSize={'md'}
                bgColor={'borderColor.low'}
              >
                {customTitle}
                <ModalCloseButton
                  _hover={{ bgColor: 'none' }}
                  size={'md'}
                  mt={'-0.25rem'}
                  onClick={() => cancelCallback.current?.()}
                />
              </ModalHeader>
            )}
            <ModalBody p={4}>
              {customContent && (
                <Box w={'100%'} h={'100%'} key={Date.now()}>
                  {customContent}
                </Box>
              )}
            </ModalBody>
            <Divider bgColor={'borderColor.low'} h={'1px'} />
            <ModalFooter mt={2} pb={2}>
              <Button
                h={'2rem'}
                w={['6rem', '100px']}
                variant={'whiteCommon'}
                mr={2}
                onClick={() => {
                  cancelCallback.current?.();
                  onClose();
                }}
              >
                取消
              </Button>
              <Button
                h={'2rem'}
                w={['6rem', '100px']}
                variant={'blackCommon'}
                isLoading={isLoading || requesting}
                onClick={async () => {
                  setRequesting(true);
                  try {
                    typeof confirmCallback.current === 'function' &&
                      (await confirmCallback.current());
                  } catch (error) {
                  } finally {
                    setRequesting(false);
                    // onClose();
                  }
                }}
              >
                提交
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      );
    },
    [style, onClose, isOpen, confirmCallback.current, cancelCallback.current, customContent]
  );

  return { openModal, onClose, CreateModal };
}

export default useCreateModal;
