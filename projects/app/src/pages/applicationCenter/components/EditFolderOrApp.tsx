import React, { useMemo } from 'react';
import { ModalFooter, ModalBody, Input, Button, Box, Textarea } from '@chakra-ui/react';
import MyModal from '../../../../../../packages/web/components/common/MyModal/index';
import { useTranslation } from 'next-i18next';
import { useRequest2 } from '@fastgpt/web/hooks/useRequest';
import FormLabel from '../../../../../../packages/web/components/common/MyBox/FormLabel';
import { useForm } from 'react-hook-form';

export type EditFolderFormType = {
  id?: string; // 文件夹ID
  name?: string; // 文件夹名称
  intro?: string; // 文件夹简介
};

// 定义提交类型
type CommitType = {
  name: string; // 必填名称
  intro?: string; // 可选简介
};

const EditFolderModal = ({
  onClose, // 关闭模态框的回调
  onCreate, // 创建文件夹的回调
  onEdit, // 编辑文件夹的回调
  id, // 文件夹ID
  name, // 文件夹名称
  intro // 文件夹简介
}: EditFolderFormType & {
  onClose: () => void;
  onCreate: (data: CommitType) => any;
  onEdit: (data: CommitType & { id: string }) => any;
}) => {
  const { t } = useTranslation();
  const isEdit = !!id;
  const { register, handleSubmit } = useForm<EditFolderFormType>({
    defaultValues: {
      name,
      intro
    }
  });

  // 根据编辑模式动态设置模态框标题
  const typeMap = useMemo(
    () =>
      isEdit
        ? {
            title: t('common:dataset.Edit Folder')
          }
        : {
            title: t('common:dataset.Create Folder')
          },
    [isEdit, t]
  );

  // 保存请求
  const { run: onSave, loading } = useRequest2(
    ({ name = '', intro }: EditFolderFormType) => {
      if (!name) return;

      if (isEdit) return onEdit({ id, name, intro }); // 编辑模式
      return onCreate({ name, intro }); // 创建模式
    },
    {
      onSuccess: (res) => {
        onClose();
      }
    }
  );

  return (
    <MyModal isOpen onClose={onClose} iconSrc="common/folderFill" title={typeMap.title}>
      <ModalBody>
        <Box>
          <FormLabel mb={1}>{t('common:common.Input name')}</FormLabel>
          <Input
            {...register('name', { required: true })}
            bg={'myGray.50'}
            autoFocus
            maxLength={20}
          />
        </Box>
        <Box mt={4}>
          <FormLabel mb={1}>{t('common:common.Input folder description')}</FormLabel>
          <Textarea {...register('intro')} bg={'myGray.50'} maxLength={200} />
        </Box>
      </ModalBody>
      <ModalFooter>
        <Button isLoading={loading} onClick={handleSubmit(onSave)} px={6}>
          {t('common:common.Confirm')}
        </Button>
      </ModalFooter>
    </MyModal>
  );
};

export default EditFolderModal;
