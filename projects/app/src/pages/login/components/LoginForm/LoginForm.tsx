import React, { useState, Dispatch, useCallback } from 'react';
import {
  FormControl,
  Flex,
  Input,
  Button,
  Box,
  Link,
  InputGroup,
  InputLeftElement,
  Checkbox
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { LoginPageTypeEnum } from '@/web/support/user/login/constants';
import { postLogin } from '@/web/support/user/api';
import type { ResLogin } from '@/global/support/api/userRes';
import { useToast } from '@fastgpt/web/hooks/useToast';
import { useSystemStore } from '@/web/common/system/useSystemStore';
import { getDocPath } from '@/web/common/system/doc';
import { useTranslation } from 'next-i18next';
import FormLayout from './components/FormLayout';
import MyImage from '@fastgpt/web/components/common/Image/MyImage';

interface Props {
  setPageType: Dispatch<`${LoginPageTypeEnum}`>;
  loginSuccess: (e: ResLogin) => void;
}

interface LoginFormType {
  username: string;
  password: string;
}

const LoginForm = ({ setPageType, loginSuccess }: Props) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { feConfigs } = useSystemStore();
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginFormType>();

  const [requesting, setRequesting] = useState(false);

  const onclickLogin = useCallback(
    async ({ username, password }: LoginFormType) => {
      setRequesting(true);
      try {
        loginSuccess(
          await postLogin({
            username,
            password
          })
        );
        toast({
          title: t('login:login_success'),
          status: 'success'
        });
      } catch (error: any) {
        toast({
          title: error.message || t('login:login_failed'),
          status: 'error'
        });
      }
      setRequesting(false);
    },
    [loginSuccess, t, toast]
  );

  const isCommunityVersion = !!(feConfigs?.register_method && !feConfigs?.isPlus);

  const placeholder = (() => {
    if (isCommunityVersion) {
      return t('login:use_root_login');
    }
    return [t('common:support.user.login.Username')]
      .concat(
        feConfigs?.login_method?.map((item) => {
          switch (item) {
            case 'email':
              return t('common:support.user.login.Email');
            case 'phone':
              return t('common:support.user.login.Phone number');
          }
        }) ?? []
      )
      .join('/');
  })();

  return (
    <FormLayout setPageType={setPageType} pageType={LoginPageTypeEnum.passwordLogin}>
      <Box
        mt={9}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey && !requesting) {
            handleSubmit(onclickLogin)();
          }
        }}
      >
        <FormControl isInvalid={!!errors.username}>
          <InputGroup>
            <InputLeftElement w={'3rem'} h={'100%'}>
              <MyImage src="/imgs/images/picture/login_user.png" />
            </InputLeftElement>
            <Input
              bg={'myGray.50'}
              size={'lg'}
              height={'60px'}
              placeholder={'请输入用户名'}
              // placeholder={placeholder}
              {...register('username', {
                required: true
              })}
            />
          </InputGroup>
        </FormControl>
        <FormControl mt={7} isInvalid={!!errors.password}>
          <InputGroup>
            <InputLeftElement w={'3rem'} h={'100%'}>
              <MyImage src="/imgs/images/picture/login_password.png" />
            </InputLeftElement>
            <Input
              bg={'myGray.50'}
              size={'lg'}
              height={'60px'}
              type={'password'}
              placeholder={'请输入用户密码'}
              // placeholder={
              //   isCommunityVersion
              //     ? t('login:root_password_placeholder')
              //     : t('common:support.user.login.Password')
              // }
              {...register('password', {
                required: true,
                maxLength: {
                  value: 60,
                  message: t('login:password_condition')
                }
              })}
            ></Input>
          </InputGroup>
        </FormControl>
        {/* 登录下方的服务协议与隐私协议 */}
        {/* {feConfigs?.docUrl && (
          <Flex
            alignItems={'center'}
            mt={7}
            fontSize={'mini'}
            color={'myGray.700'}
            fontWeight={'medium'}
          >
            {t('login:policy_tip')}
            <Link
              ml={1}
              href={getDocPath('/docs/agreement/terms/')}
              target={'_blank'}
              color={'primary.700'}
            >
              {t('login:terms')}
            </Link>
            <Box mx={1}>&</Box>
            <Link
              href={getDocPath('/docs/agreement/privacy/')}
              target={'_blank'}
              color={'primary.700'}
            >
              {t('login:privacy')}
            </Link>
          </Flex>
        )} */}

        {/* 记住密码 */}
        <Flex justifyContent={'space-between'} alignItems={'center'} mt={7}>
          <Checkbox iconColor="primary.500" size={['md', 'md']}>
            记住密码
          </Checkbox>
          <Box color={'#7f7f7f'} fontSize={'sm'}>
            忘记密码请联系管理员重置
          </Box>
        </Flex>

        <Button
          type="submit"
          my={16}
          w={'100%'}
          size={['md', 'md']}
          h={[10, 14]}
          fontSize={['md', '2xl']}
          borderRadius={['lg', 'xl']}
          fontWeight={['medium', 'bold']}
          colorScheme="blue"
          isLoading={requesting}
          onClick={handleSubmit(onclickLogin)}
        >
          {t('login:Login')}
        </Button>

        <Flex
          align={'center'}
          justifyContent={'flex-end'}
          color={'primary.700'}
          fontWeight={'medium'}
        >
          {feConfigs?.find_password_method && feConfigs.find_password_method.length > 0 && (
            <Box
              cursor={'pointer'}
              _hover={{ textDecoration: 'underline' }}
              onClick={() => setPageType('forgetPassword')}
              fontSize="mini"
            >
              {t('login:forget_password')}
            </Box>
          )}
          {feConfigs?.register_method && feConfigs.register_method.length > 0 && (
            <Flex alignItems={'center'}>
              <Box mx={3} h={'12px'} w={'1px'} bg={'myGray.250'}></Box>
              <Box
                cursor={'pointer'}
                _hover={{ textDecoration: 'underline' }}
                onClick={() => setPageType('register')}
                fontSize="mini"
              >
                {t('login:register')}
              </Box>
            </Flex>
          )}
        </Flex>
      </Box>
    </FormLayout>
  );
};

export default LoginForm;
