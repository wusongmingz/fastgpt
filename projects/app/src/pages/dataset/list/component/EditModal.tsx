import {
  Flex,
  Box,
  ModalCloseButton,
  Button,
  Divider,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useToast,
  Input
} from '@chakra-ui/react';
import { useRequest2 } from '@fastgpt/web/hooks/useRequest';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

interface EditResourceInfoFormType {
  id: string;
  name: string;
  avatar?: string;
  intro?: string;
}

interface EditModalProps {
  onClose: () => void;
  onEdit: (data: EditResourceInfoFormType) => any;
}

function EditModal({ onClose, onEdit, ...defaultForm }: EditModalProps & EditResourceInfoFormType) {
  const { t } = useTranslation();
  const { register, handleSubmit } = useForm<EditResourceInfoFormType>({
    defaultValues: defaultForm
  });

  const { runAsync: onSave, loading } = useRequest2(
    (data: EditResourceInfoFormType) => onEdit(data),
    {
      onSuccess: (res) => {
        onClose();
      }
    }
  );

  return (
    <Modal isOpen onClose={onClose}>
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
            <Box>重命名</Box>
          </Flex>
          <ModalCloseButton _hover={{ bgColor: 'none' }} mt={'-0.25rem'} size={'sm'} />
        </ModalHeader>
        <ModalBody>
          <Input
            {...register('name', { required: true })}
            height={'40px'}
            bgColor={'#fff'}
            borderColor={'rgb(226, 227, 234)'}
            _focusVisible={{ borderColor: 'rgb(215, 0, 15)' }}
            _focus={{ borderColor: 'rgb(215, 0, 15)' }}
            autoFocus
          />
        </ModalBody>
        <Divider bgColor={'rgb(226, 227, 234)'} h={'1px'} />
        <ModalFooter>
          <Button
            h={'30px'}
            bgColor={'#fff'}
            color={'#000'}
            border={'1px solid rgb(226, 227, 234)'}
            _hover={{ bgColor: 'rgb(237, 241, 244)' }}
            px={5}
            onClick={onClose}
          >
            {t('common:common.Cancel')}
          </Button>

          <Button
            bgColor={'#000'}
            color={'#fff'}
            size={'sm'}
            ml={3}
            px={5}
            _hover={{ bgColor: 'rgb(237, 241, 244)', color: '#000' }}
            border={'1px solid #000'}
            isLoading={loading}
            onClick={handleSubmit(onSave)}
          >
            {t('common:common.Confirm')}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default EditModal;
