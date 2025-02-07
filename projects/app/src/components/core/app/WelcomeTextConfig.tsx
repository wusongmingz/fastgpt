import { Box, Flex, TextareaProps } from '@chakra-ui/react';
import React from 'react';
import MyIcon from '@fastgpt/web/components/common/Icon';
import ChatFunctionTip from './Tip';
import MyTextarea from '@/components/common/Textarea/MyTextarea';
import { useTranslation } from 'next-i18next';
import FormLabel from '@fastgpt/web/components/common/MyBox/FormLabel';
import AIcon from '@/components/AIcon/AIcon';

const WelcomeTextConfig = (props: TextareaProps) => {
  const { t } = useTranslation();

  return (
    <>
      <Flex alignItems={'center'}>
        {/* <MyIcon name={'core/app/simpleMode/chat'} w={'20px'} /> */}
        <AIcon name="icon-duihua" fontSize="1.5rem" color="primary.500" />
        <FormLabel ml={2} color={'myGray.600'}>
          {t('common:core.app.Welcome Text')}
        </FormLabel>
        <ChatFunctionTip type={'welcome'} />
      </Flex>
      <MyTextarea
        boxPx="50px"
        className="nowheel"
        iconSrc={'core/app/simpleMode/chat'}
        title={t('common:core.app.Welcome Text')}
        mt={3}
        rows={6}
        fontSize={'sm'}
        bg={'white'}
        minW={'384px'}
        // placeholder={t('common:core.app.tip.welcomeTextTip')}
        autoHeight
        minH={100}
        maxH={200}
        {...props}
      />
    </>
  );
};

export default React.memo(WelcomeTextConfig);
