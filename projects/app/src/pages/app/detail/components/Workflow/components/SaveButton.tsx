import { Box, Button, Flex, useDisclosure } from '@chakra-ui/react';
import MyPopover from '@fastgpt/web/components/common/MyPopover';
import React, { useState } from 'react';
import MyIcon from '@fastgpt/web/components/common/Icon';
import { useTranslation } from 'next-i18next';
import MyBox from '@fastgpt/web/components/common/MyBox';
import { useToast } from '@fastgpt/web/hooks/useToast';
import SaveAndPublishModal from '../../WorkflowComponents/Flow/components/SaveAndPublish';
import { StoreNodeItemType } from '@fastgpt/global/core/workflow/type/node';
import { StoreEdgeItemType } from '@fastgpt/global/core/workflow/type/edge';
import AIcon from '@/components/AIcon/AIcon';

const SaveButton = ({
  isLoading,
  onClickSave,
  checkData,
  btnBgc
}: {
  isLoading: boolean;
  onClickSave: (options: { isPublish?: boolean; versionName?: string }) => Promise<void>;
  checkData?: (hideTip?: boolean) =>
    | {
        nodes: StoreNodeItemType[];
        edges: StoreEdgeItemType[];
      }
    | undefined;
  btnBgc?: string;
}) => {
  const { t } = useTranslation();
  const [isSave, setIsSave] = useState(false);
  const { toast } = useToast({
    containerStyle: {
      mt: '60px',
      fontSize: 'sm'
    }
  });

  const {
    isOpen: isSaveAndPublishModalOpen,
    onOpen: onSaveAndPublishModalOpen,
    onClose: onSaveAndPublishModalClose
  } = useDisclosure();

  return (
    <MyPopover
      placement={'bottom-end'}
      hasArrow={false}
      offset={[2, 4]}
      w={'116px'}
      onOpenFunc={() => setIsSave(true)}
      onCloseFunc={() => setIsSave(false)}
      trigger={'hover'}
      Trigger={
        <Button
          size={'sm'}
          bgColor={btnBgc || 'white'}
          color={btnBgc ? 'black' : 'black'}
          border={'1px solid #e2e3ea'}
          width={'100px'}
          _hover={{
            bg: '#edf1f4',
            color: 'black'
            // border: '1px solid #000'
          }}
          leftIcon={<AIcon name="icon-save-fill" color="primary.500" fontSize="22px"></AIcon>}
        >
          <Box fontSize={'13px'}>保存预览</Box>
        </Button>
      }
    >
      {({ onClose }) => (
        <Box p={1.5}>
          <MyBox
            display={'flex'}
            size={'md'}
            _hover={{ color: 'primary.500', bg: 'gray.50' }}
            cursor={'pointer'}
            isLoading={isLoading}
            justifyContent={'center'}
            onClick={async () => {
              await onClickSave({});
              toast({
                status: 'success',
                title: t('app:saved_success'),
                position: 'top-right',
                isClosable: true
              });
              onClose();
              setIsSave(false);
            }}
          >
            {/* <MyIcon name={'core/workflow/upload'} w={'16px'} mr={2} /> */}
            <Box fontSize={'sm'}>{t('common:core.workflow.Save to cloud')}</Box>
          </MyBox>
          <Flex
            _hover={{ color: 'primary.500', bg: 'gray.50' }}
            justifyContent={'center'}
            cursor={'pointer'}
            onClick={() => {
              const canOpen = !checkData || checkData();
              if (canOpen) {
                onSaveAndPublishModalOpen();
              }
              onClose();
              setIsSave(false);
            }}
          >
            {/* <MyIcon name={'core/workflow/publish'} w={'16px'} mr={2} /> */}
            <Box fontSize={'sm'}>{t('common:core.workflow.Save and publish')}</Box>
            {isSaveAndPublishModalOpen && (
              <SaveAndPublishModal
                isLoading={isLoading}
                onClose={onSaveAndPublishModalClose}
                onClickSave={onClickSave}
              />
            )}
          </Flex>
        </Box>
      )}
    </MyPopover>
  );
};

export default React.memo(SaveButton);
