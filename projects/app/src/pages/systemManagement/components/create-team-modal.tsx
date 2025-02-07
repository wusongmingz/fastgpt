import {
  Avatar,
  Box,
  Button,
  Divider,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Textarea,
  useDisclosure
} from '@chakra-ui/react';
import { useSelectFile } from '@/web/common/file/hooks/useSelectFile';
import { useCallback, useState } from 'react';
import { MongoImageTypeEnum } from '@fastgpt/global/common/file/image/constants';
import { compressImgFileAndUpload } from '@/web/common/file/controller';
import MyTooltip from '@fastgpt/web/components/common/MyTooltip';
import { useForm } from 'react-hook-form';
import { DEFAULT_TEAM_AVATAR } from '@fastgpt/global/common/system/constants';
import { useRequest2 } from '@fastgpt/web/hooks/useRequest';
import { postCreateTeamGroup } from '@/web/support/user/team/group/api';

interface FormData {
  avatar: string;
  name: string;
  intro: string;
}

function CreateTeamModal({
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

  const { File, onOpen: onOpenSelectFile } = useSelectFile({
    fileType: '.jpg,.png',
    multiple: false
  });

  const [avatarUrl, setAvatarUrl] = useState(DEFAULT_TEAM_AVATAR);

  const {
    formState: { errors },
    handleSubmit,
    setValue,
    register,
    getValues,
    reset
  } = useForm<FormData>({
    defaultValues: {
      avatar: DEFAULT_TEAM_AVATAR,
      name: '',
      intro: ''
    }
  });

  const onSelectFile = useCallback(
    async (e: File[]) => {
      const file = e[0];
      if (!file) return;
      try {
        const src = await compressImgFileAndUpload({
          type: MongoImageTypeEnum.teamAvatar,
          file,
          maxW: 300,
          maxH: 300
        });
        setAvatarUrl(src);
        setValue('avatar', src);
        console.log('Updated form values:', getValues());
      } catch (err: any) {}
    },
    [setValue]
  );

  const { run: onSave, loading } = useRequest2(
    (formData: FormData) => postCreateTeamGroup(formData),
    {
      onSuccess: async (res) => {
        reset();
        onSuccess?.(res);
      },
      onError: (err) => {
        onError?.(err);
      }
    }
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent minW={['300px', '600px']} maxW={['28rem', '1000px']} minH={'360px'} w={'600px'}>
        <ModalHeader
          py={2}
          display={'flex'}
          alignItems={'center'}
          roundedTop={'lg'}
          fontSize={'md'}
          bgColor={'borderColor.low'}
        >
          新增团队
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
          <form>
            <Flex w={'100%'} gap={4} mb={8}>
              <MyTooltip label={'点击头像更换图片'} placement="bottom">
                <Avatar
                  src={avatarUrl}
                  w={'4rem'}
                  h={'4rem'}
                  cursor={'pointer'}
                  onClick={onOpenSelectFile}
                />
              </MyTooltip>
              <Box display={['block', 'flex']} flex={1} flexDir={'column'}>
                <FormControl isInvalid={!!errors.name}>
                  <FormLabel fontSize={'md'} mb={2}>
                    团队名称
                  </FormLabel>
                  <Input
                    {...register('name', {
                      required: '请输入团队名称',
                      maxLength: { message: '团队名称不能超过10个字符', value: 10 }
                    })}
                    placeholder="团队名称"
                  />
                  <FormErrorMessage fontSize={'sm'}>{errors.name?.message}</FormErrorMessage>
                </FormControl>
              </Box>
            </Flex>
            <FormControl isInvalid={!!errors.intro}>
              <FormLabel fontSize={'md'} mb={2}>
                团队描述
              </FormLabel>
              <Textarea
                {...register('intro', {
                  maxLength: { message: '团队介绍不能超过20个字符', value: 20 }
                })}
                placeholder="团队介绍"
              />
              <FormErrorMessage fontSize={'sm'}>{errors.intro?.message}</FormErrorMessage>
            </FormControl>
            <File onSelect={onSelectFile} />
          </form>
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
                await handleSubmit(onSave)();
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

export default CreateTeamModal;
