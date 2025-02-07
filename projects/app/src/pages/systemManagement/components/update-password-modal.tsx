import AIcon from '@/components/AIcon/AIcon';
import { updateUserPassword } from '@/web/support/user/api';
import {
  Box,
  Button,
  Flex,
  FormLabel,
  FormControl,
  FormErrorMessage,
  Input,
  InputGroup,
  InputRightElement,
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
import { useRequest2 } from '@fastgpt/web/hooks/useRequest';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

interface FormData {
  tmbId: string;
  password: string;
}

function UpdatePasswordModal({
  isOpen,
  onCancel,
  onClose,
  onConfirm,
  onSuccess,
  onError
}: {
  isOpen: boolean;
  onClose: () => void;
  onCancel: () => void;
  onConfirm?: () => void;
  onSuccess?: (data: any) => void;
  onError?: (err: any) => void;
}) {
  const { onClose: closeModal } = useDisclosure();
  const [showPassword, setShowPassword] = useState(false);
  const {
    reset,
    register,
    setValue,
    formState: { errors }
  } = useForm<FormData>({
    defaultValues: {
      tmbId: '',
      password: ''
    }
  });

  const { run: onSave, loading } = useRequest2(
    (formData: FormData) => updateUserPassword(formData),
    {
      onSuccess: async (res: any) => {
        reset();
        onSuccess?.(res);
      },
      onError: (err: any) => {
        onError?.(err);
      }
    }
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent minW={['300px', '600px']} maxW={['28rem', '1000px']} w={'800px'} h={'240px'}>
        <ModalHeader
          py={2}
          display={'flex'}
          alignItems={'center'}
          roundedTop={'lg'}
          fontSize={'md'}
          bgColor={'borderColor.low'}
        >
          设置用户密码
          <ModalCloseButton
            _hover={{ bgColor: 'none' }}
            size={'md'}
            mt={'-0.25rem'}
            onClick={() => {
              onCancel();
            }}
          />
        </ModalHeader>
        <ModalBody p={4}>
          <Box px={'4rem'}>
            <FormLabel mb={4} fontSize={'md'}>
              设置密码
            </FormLabel>
            <InputGroup size={'lg'}>
              <Input
                {...register('password', { required: true })}
                type={showPassword ? 'text' : 'password'}
              />
              <InputRightElement>
                {showPassword ? (
                  <AIcon
                    name="icon-yanjing_xianshi"
                    fontSize="1rem"
                    cursor={'pointer'}
                    onClick={() => setShowPassword(false)}
                  />
                ) : (
                  <AIcon
                    name="icon-yanjing_yincang"
                    fontSize="1rem"
                    cursor={'pointer'}
                    onClick={() => setShowPassword(true)}
                  />
                )}
              </InputRightElement>
            </InputGroup>
            <FormErrorMessage>{errors.password && errors.password.message}</FormErrorMessage>
          </Box>
        </ModalBody>
        <Divider bgColor={'borderColor.low'} h={'1px'} />
        <ModalFooter mt={2} pb={2}>
          <Button
            h={'2rem'}
            w={['6rem', '100px']}
            variant={'whiteCommon'}
            mr={2}
            onClick={() => {
              onCancel();
            }}
          >
            取消
          </Button>
          <Button
            h={'2rem'}
            w={['6rem', '100px']}
            variant={'blackCommon'}
            isLoading={loading}
            onClick={async () => {
              try {
                onConfirm?.();
              } catch (error) {
              } finally {
                closeModal();
              }
            }}
          >
            提交
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default UpdatePasswordModal;
