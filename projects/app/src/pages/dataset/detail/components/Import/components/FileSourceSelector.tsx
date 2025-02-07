import React, { useState } from 'react';
import MyModal from '@fastgpt/web/components/common/MyModal';
import { ModalBody, ModalFooter, Button } from '@chakra-ui/react';
import { useTranslation } from 'next-i18next';
import LeftRadio from '@fastgpt/web/components/common/Radio/LeftRadio';
import { useRouter } from 'next/router';
import { TabEnum } from '../../..';
import { DatasetTypeEnum, ImportDataSourceEnum } from '@fastgpt/global/core/dataset/constants';

const FileModeSelector = ({
  datasetType,
  onClose
}: {
  datasetType?: `${DatasetTypeEnum}`;
  onClose: () => void;
}) => {
  const { t } = useTranslation();
  const router = useRouter();
  const [value, setValue] = useState<ImportDataSourceEnum>(ImportDataSourceEnum.fileLocal);
  const graphList = [
    {
      title: t('common:core.dataset.import.Local file'),
      desc: t('common:core.dataset.import.Local file desc'),
      value: ImportDataSourceEnum.fileLocal
    }
    // TODO: 因与上传本地文件逻辑不同，暂时注释，屏蔽对手动输入文本的支持
    // {
    //   title: t('common:core.dataset.import.Custom text'),
    //   desc: t('common:core.dataset.import.Custom text desc'),
    //   value: ImportDataSourceEnum.fileCustom
    // }
  ];
  const list = [
    {
      title: t('common:core.dataset.import.Local file'),
      desc: t('common:core.dataset.import.Local file desc'),
      value: ImportDataSourceEnum.fileLocal
    },
    {
      title: t('common:core.dataset.import.Web link'),
      desc: t('common:core.dataset.import.Web link desc'),
      value: ImportDataSourceEnum.fileLink
    },
    {
      title: t('common:core.dataset.import.Custom text'),
      desc: t('common:core.dataset.import.Custom text desc'),
      value: ImportDataSourceEnum.fileCustom
    }
  ];

  return (
    <MyModal
      isOpen
      onClose={onClose}
      // iconSrc="modal/selectSource"
      title={t('common:core.dataset.import.Select sources')}
      w={'600px'}
    >
      <ModalBody px={6} py={4}>
        <LeftRadio
          list={datasetType === DatasetTypeEnum.graph ? graphList : list}
          value={value}
          onChange={setValue}
        />
      </ModalBody>
      <ModalFooter>
        <Button
          onClick={() =>
            router.replace({
              query: {
                ...router.query,
                currentTab: TabEnum.import,
                source: value
              }
            })
          }
        >
          {t('common:common.Confirm')}
        </Button>
      </ModalFooter>
    </MyModal>
  );
};

export default FileModeSelector;
