import {
  Stack,
  ModalBody,
  ModalFooter,
  Text,
  Flex,
  Input,
  InputGroup,
  InputLeftElement,
  Button,
  useToast,
  FormControl
} from '@chakra-ui/react';
import MyModal from '@fastgpt/web/components/common/MyModal';
import { useTranslation } from 'react-i18next';
import AIcon from '@/components/AIcon/AIcon';
import { useForm } from 'react-hook-form';
import { updatePasswordByOld } from '@/web/support/user/api';
import { useRequest2 } from '@fastgpt/web/hooks/useRequest';
import { loginOut } from '../../web/support/user/api';
import { useRouter } from 'next/router';
export default function EditPasswordModal({ onclose }: { onclose: () => void }) {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors }
  } = useForm({
    defaultValues: {
      oldPsw: '',
      newPsw: '',
      confirmPsw: ''
    }
  });
  const toast = useToast();
  const router = useRouter();
  const { runAsync: updatePassword, loading: updateLoading } = useRequest2(
    (data: any) => {
      return updatePasswordByOld(data);
    },
    {
      onSuccess: async () => {
        onclose();
        toast({
          position: 'top',
          title: t('common:common.Modified successfully'),
          duration: 2000,
          status: 'success'
        });
        toast({
          position: 'top',
          title: t('common:code_error.token_error_code.403'),
          duration: 2000,
          status: 'warning'
        });
        await loginOut();
        router.replace('/login');
      },
      errorToast: t('common:common.Modified failed')
    }
  );
  return (
    <MyModal
      titleBgc="#e2e3ea"
      w={'450px'}
      onClose={() => {
        onclose();
      }}
      title={t('common:user.Change_assword')}
    >
      <ModalBody>
        <Stack>
          <Text py={3} textAlign={'center'} fontWeight={600} w={'100%'}>
            {t('common:user.Change_assword')}
          </Text>
          <Flex alignItems={'center'}>
            <Text minW={'100px'}>{t('common:user.old_password') + ':'}</Text>
            <InputGroup h={'50px'}>
              <InputLeftElement
                h={'full'}
                alignItems={'center'}
                display={'flex'}
              ></InputLeftElement>
              <Input
                type="password"
                {...register('oldPsw', { required: true })}
                h={'full'}
                bg={'white'}
              />
            </InputGroup>
          </Flex>
          <Flex alignItems={'center'}>
            <Text minW={'100px'}>{t('common:user.new_password') + ':'}</Text>
            <InputGroup h={'50px'}>
              <InputLeftElement h={'full'} alignItems={'center'} display={'flex'}>
                <AIcon name="icon-tianchongxing-" color={'#718096'}></AIcon>
              </InputLeftElement>
              <Input
                type="password"
                h={'full'}
                {...register('newPsw', { required: true })}
                placeholder={t('common:user.set_password')}
                maxLength={12}
                bg={'white'}
              />
            </InputGroup>
          </Flex>
          {/* <FormControl isInvalid={!!errors.againInputPassword}> */}
          <Flex alignItems={'center'}>
            <Text minW={'100px'}>{t('common:user.confirm_password') + ':'}</Text>
            <InputGroup h={'50px'}>
              <InputLeftElement h={'full'} alignItems={'center'} display={'flex'}>
                <AIcon name="icon-tianchongxing-" color={'#718096'}></AIcon>
              </InputLeftElement>
              <Input
                h={'full'}
                type="password"
                maxLength={12}
                {...register('confirmPsw', {
                  required: true
                  // validate: (val) =>
                  //   getValues('newPassword') === val ? true : t('user:password.not_match')
                })}
                placeholder={t('common:user.set_password')}
                bg={'white'}
              />
            </InputGroup>
          </Flex>
          {/* </FormControl> */}
        </Stack>
      </ModalBody>
      <ModalFooter pt={3} pb={6} justifyContent={'center'}>
        <Button
          variant={'blackCommon'}
          size={'lg'}
          fontWeight={600}
          w={'150px'}
          onClick={() => {
            handleSubmit((data) => {
              if (data.newPsw != data.confirmPsw) {
                toast({
                  position: 'top',
                  title: t('common:common.Password inconsistency'),
                  duration: 2000,
                  status: 'error'
                });
                return;
              }
              return updatePassword(data);
            })();
          }}
        >
          {t('common:user.confirm_submit')}
        </Button>
      </ModalFooter>
    </MyModal>
  );
}
