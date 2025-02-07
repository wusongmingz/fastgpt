import { useConfirm } from '@fastgpt/web/hooks/useConfirm';
import { Dispatch, ReactNode, SetStateAction, useEffect, useState } from 'react';
import { useTranslation } from 'next-i18next';
import { createContext, useContextSelector } from 'use-context-selector';
import { DatasetStatusEnum, DatasetTypeEnum } from '@fastgpt/global/core/dataset/constants';
import { useRequest } from '@fastgpt/web/hooks/useRequest';
import { DatasetSchemaType } from '@fastgpt/global/core/dataset/type';
import { useDisclosure } from '@chakra-ui/react';
import { checkTeamWebSyncLimit } from '@/web/support/user/team/api';
import { postCreateTrainingUsage } from '@/web/support/wallet/usage/api';
import { getDatasetCollections, postWebsiteSync } from '@/web/core/dataset/api';
import dynamic from 'next/dynamic';
import { usePagination } from '@fastgpt/web/hooks/usePagination';
import { DatasetCollectionsListItemType } from '@/global/core/dataset/type';
import { useRouter } from 'next/router';
import { DatasetPageContext } from '@/web/core/dataset/context/datasetPageContext';
import type { IconNameType } from '../../../../../../../../packages/web/components/common/Icon/type.d';

const WebSiteConfigModal = dynamic(() => import('./WebsiteConfig'));

type CollectionPageContextType = {
  openWebSyncConfirm: () => void;
  onOpenWebsiteModal: () => void;
  collections: DatasetCollectionsListItemType[];
  Pagination: () => JSX.Element;
  total: number;
  getData: (e: number) => void;
  isGetting: boolean;
  pageNum: number;
  pageSize: number;
  searchText: string;
  setSearchText: Dispatch<SetStateAction<string>>;
  filterTags: string[];
  setFilterTags: Dispatch<SetStateAction<string[]>>;
  iconName: string;
  setIconName: Dispatch<SetStateAction<'asc' | 'desc'>>;
  iconTimeName: string;
  seticonTimeName: Dispatch<SetStateAction<'asc' | 'desc'>>;
};

export const CollectionPageContext = createContext<CollectionPageContextType>({
  openWebSyncConfirm: function (): () => void {
    throw new Error('Function not implemented.');
  },
  onOpenWebsiteModal: function (): void {
    throw new Error('Function not implemented.');
  },
  collections: [],
  Pagination: function (): JSX.Element {
    throw new Error('Function not implemented.');
  },
  total: 0,
  getData: function (e: number): void {
    throw new Error('Function not implemented.');
  },
  isGetting: false,
  pageNum: 0,
  pageSize: 0,
  searchText: '',
  iconName: '',
  iconTimeName: '',
  seticonTimeName: function (value: SetStateAction<'asc' | 'desc'>): void {
    throw new Error('Function not implemented.');
  },
  setIconName: function (value: SetStateAction<'asc' | 'desc'>): void {
    throw new Error('Function not implemented.');
  },
  setSearchText: function (value: SetStateAction<string>): void {
    throw new Error('Function not implemented.');
  },
  filterTags: [],
  setFilterTags: function (value: SetStateAction<string[]>): void {
    throw new Error('Function not implemented.');
  }
});

const CollectionPageContextProvider = ({ children }: { children: ReactNode }) => {
  const { t } = useTranslation();
  const router = useRouter();
  const { parentId = '' } = router.query as { parentId: string };

  const { datasetDetail, datasetId, updateDataset } = useContextSelector(
    DatasetPageContext,
    (v) => v
  );

  // website config
  const { openConfirm: openWebSyncConfirm, ConfirmModal: ConfirmWebSyncModal } = useConfirm({
    content: t('common:core.dataset.collection.Start Sync Tip')
  });
  const {
    isOpen: isOpenWebsiteModal,
    onOpen: onOpenWebsiteModal,
    onClose: onCloseWebsiteModal
  } = useDisclosure();
  const { mutate: onUpdateDatasetWebsiteConfig } = useRequest({
    mutationFn: async (websiteConfig: DatasetSchemaType['websiteConfig']) => {
      onCloseWebsiteModal();
      await checkTeamWebSyncLimit();
      await updateDataset({
        id: datasetId,
        websiteConfig,
        status: DatasetStatusEnum.syncing
      });
      const billId = await postCreateTrainingUsage({
        name: t('common:core.dataset.training.Website Sync'),
        datasetId: datasetId
      });
      await postWebsiteSync({ datasetId: datasetId, billId });

      return;
    },
    errorToast: t('common:common.Update Failed')
  });

  // collection list
  const [searchText, setSearchText] = useState('');
  const [filterTags, setFilterTags] = useState<string[]>([]);
  const [iconName, setIconName] = useState<'asc' | 'desc'>('desc');
  const [iconTimeName, seticonTimeName] = useState<'asc' | 'desc'>('desc');
  const {
    data: collections,
    Pagination,
    total,
    getData,
    isLoading: isGetting,
    pageNum,
    pageSize
  } = usePagination<DatasetCollectionsListItemType>({
    api: getDatasetCollections,
    pageSize: 20,
    params: {
      datasetId,
      parentId,
      searchText,
      filterTags
    },
    // defaultRequest: false,
    refreshDeps: [parentId, searchText, filterTags]
  });
  // collections.sort((a, b) => a.name.localeCompare(b.name));
  // useEffect(() => {
  //   if (iconName === 'desc') {
  //     const newCollections = collections.slice();
  //     newCollections.sort((a, b) => a.name.localeCompare(b.name));
  //   } else {
  //     collections.sort((a, b) => b.name.localeCompare(a.name));
  //   }
  //   if (iconTimeName === 'desc') {
  //     collections.sort((a, b) => {
  //       const time1 = new Date(a.updateTime);
  //       const time2 = new Date(b.updateTime);
  //       return time2.getTime() - time1.getTime();
  //     });
  //   } else {
  //     collections.sort((a, b) => {
  //       const time1 = new Date(a.updateTime);
  //       const time2 = new Date(b.updateTime);
  //       return time1.getTime() - time2.getTime();
  //     });
  //   }
  // });
  // console.log(collections);

  const contextValue: CollectionPageContextType = {
    openWebSyncConfirm: openWebSyncConfirm(onUpdateDatasetWebsiteConfig),
    onOpenWebsiteModal,

    searchText,
    setSearchText,
    filterTags,
    setFilterTags,
    collections,
    Pagination,
    total,
    getData,
    isGetting,
    pageNum,
    pageSize,
    iconName,
    setIconName,
    iconTimeName,
    seticonTimeName
  };

  return (
    <CollectionPageContext.Provider value={contextValue}>
      {children}
      {datasetDetail.type === DatasetTypeEnum.websiteDataset && (
        <>
          {isOpenWebsiteModal && (
            <WebSiteConfigModal
              onClose={onCloseWebsiteModal}
              onSuccess={onUpdateDatasetWebsiteConfig}
              defaultValue={{
                url: datasetDetail?.websiteConfig?.url,
                selector: datasetDetail?.websiteConfig?.selector
              }}
            />
          )}
          <ConfirmWebSyncModal />
        </>
      )}
    </CollectionPageContext.Provider>
  );
};
export default CollectionPageContextProvider;
