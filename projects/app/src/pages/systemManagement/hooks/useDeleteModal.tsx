import AIcon from '@/components/AIcon/AIcon';
import {
  Button,
  Flex,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalOverlay,
  useDisclosure
} from '@chakra-ui/react';
import { useMemoizedFn } from 'ahooks';
import { useEffect, useRef, useState } from 'react';

function useDeleteModal({ content }: { content?: string | React.ReactNode }) {
  const [customContent, setCustomContent] = useState(content);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const confirmCallback = useRef<Function>();
  const cancelCallback = useRef<any>();

  const openConfirm = useMemoizedFn(
    ({
      customContent,
      confirm,
      cancel
    }: {
      confirm?: Function;
      cancel?: Function;
      customContent?: string | React.ReactNode;
    }) => {
      confirmCallback.current = confirm;
      cancelCallback.current = cancel;
      customContent && setCustomContent(customContent);

      return onOpen;
    }
  );

  const ConfirmModal = useMemoizedFn(
    ({ countDown = 0, isLoading }: { countDown?: number; isLoading?: boolean }) => {
      const timer = useRef<ReturnType<typeof setInterval>>();
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
        <Modal isOpen={isOpen} onClose={onClose} isCentered>
          <ModalOverlay />
          <ModalContent px={2}>
            <ModalBody>
              <Flex gap={2} alignItems={'center'} h={'3rem'} mt={4}>
                <AIcon name="icon-cuowu" color="#ff7d00" fontSize="1rem" />
                {customContent}
              </Flex>
            </ModalBody>

            <ModalFooter p={1}>
              <Button
                variant={'whiteCommon'}
                mr={2}
                onClick={() => {
                  onClose();
                }}
              >
                取消
              </Button>
              <Button
                bgColor={'primary.500'}
                color={'#fff'}
                isLoading={isLoading || requesting}
                onClick={async () => {
                  setRequesting(true);
                  try {
                    typeof confirmCallback.current === 'function' &&
                      (await confirmCallback.current());
                  } catch (error) {
                  } finally {
                    setRequesting(false);
                    onClose();
                  }
                }}
              >
                {countDownTimes > 0 ? `${countDownTimes}s` : '确认'}
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      );
    }
  );

  return { openConfirm, onClose, ConfirmModal };
}

export default useDeleteModal;
